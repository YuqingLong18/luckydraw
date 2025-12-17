import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../state/store';
import { getTreePosition } from '../../utils/layout';
import { CONSTANTS } from '../../utils/constants';

function clamp01(value: number) {
    return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number) {
    const p = 1 - t;
    return 1 - p * p * p;
}

function angleDelta(target: number, current: number) {
    const a = target - current;
    return Math.atan2(Math.sin(a), Math.cos(a));
}

const CameraController: React.FC<{ treeGroupRef: React.RefObject<THREE.Group | null> }> = ({ treeGroupRef }) => {
    const { camera } = useThree();
    const phase = useStore((state) => state.phase);
    const currentWinner = useStore((state) => state.currentWinner);
    const plannedWinner = useStore((state) => state.plannedWinner);
    const plannedWinnerIndex = useStore((state) => state.plannedWinnerIndex);
    const remainingNames = useStore((state) => state.remainingNames);

    const stateRef = useRef({
        runningTime: 0,
        winnerTime: 0,
        winnerStartPos: new THREE.Vector3(),
        tmpWinnerLocal: new THREE.Vector3(),
        tmpWinnerWorld: new THREE.Vector3(),
        tmpUp: new THREE.Vector3(0, 1, 0),
        tmpNormal: new THREE.Vector3(),
        tmpCamTarget: new THREE.Vector3(),
        tmpCamPosA: new THREE.Vector3(),
        tmpCamPosB: new THREE.Vector3(),
    });

    useEffect(() => {
        if (phase === 'RUNNING') {
            stateRef.current.runningTime = 0;
            stateRef.current.winnerTime = 0;
        }
        if (phase === 'WINNER_VIEW') {
            stateRef.current.winnerTime = 0;
            stateRef.current.winnerStartPos.copy(camera.position);
        }
    }, [phase, camera]);

    useFrame((_state, delta) => {
        const group = treeGroupRef.current;
        if (!group) return;

        if (phase === 'RUNNING') {
            stateRef.current.runningTime += delta;
            const t = stateRef.current.runningTime;

            const duration = CONSTANTS.DRAW.COMPLETE_AT_S;
            const p = clamp01(t / duration);
            const eased = easeOutCubic(p);

            // Start faster then slow down, so names are readable by mid-run.
            const startSpeed = 3.2; // rad/s
            const endSpeed = 0.35; // rad/s
            const speed = THREE.MathUtils.lerp(startSpeed, endSpeed, eased);

            group.rotation.y = (group.rotation.y + speed * delta) % (Math.PI * 2);

            // Steer toward the preselected winner so the final zoom lands on the real winner label.
            let winnerY = 0;
            if (plannedWinner && plannedWinnerIndex !== null && remainingNames[plannedWinnerIndex] === plannedWinner) {
                const { position, rotation } = getTreePosition(plannedWinnerIndex, remainingNames.length, 0.7);
                winnerY = position[1];

                // Bring the winner to the front (camera is +Z looking at origin).
                const desiredGroupRot = rotation[1] + Math.PI;

                // Ramp steering late in the run to keep the spin feel, but guarantee alignment by the end.
                const steerPhase = clamp01((p - 0.55) / 0.45);
                const steer = easeOutCubic(steerPhase);
                const diff = angleDelta(desiredGroupRot, group.rotation.y);
                group.rotation.y = (group.rotation.y + diff * (1 - Math.exp(-6.5 * steer * delta))) % (Math.PI * 2);
            }

            // Gradually zoom in during the rotation.
            const startZ = 26;
            const endZ = 14.5;
            const z = THREE.MathUtils.lerp(startZ, endZ, eased);

            const startY = 5.3;
            const endY = 4.6;
            const yBase = THREE.MathUtils.lerp(startY, endY, eased);
            const rowPhase = clamp01((p - 0.25) / 0.75);
            const rowEase = easeOutCubic(rowPhase);
            const y = yBase + winnerY * 0.35 * rowEase;

            stateRef.current.tmpCamTarget.set(0, winnerY * rowEase, 0);
            stateRef.current.tmpCamPosA.set(0, y, z);
            camera.position.lerp(stateRef.current.tmpCamPosA, 0.08);
            camera.lookAt(stateRef.current.tmpCamTarget);

        } else if (phase === 'WINNER_VIEW' && currentWinner) {
            stateRef.current.winnerTime += delta;
            const p = clamp01(stateRef.current.winnerTime / CONSTANTS.DRAW.REVEAL_S);
            const eased = easeOutCubic(p);

            // Zoom to winner
            const idx = plannedWinnerIndex !== null && remainingNames[plannedWinnerIndex] === currentWinner ? plannedWinnerIndex : remainingNames.indexOf(currentWinner);
            if (idx !== -1) {
                const { position } = getTreePosition(idx, remainingNames.length, 0.7);
                stateRef.current.tmpWinnerLocal.set(position[0], position[1], position[2]);

                // Current World Pos of Winner:
                stateRef.current.tmpWinnerWorld.copy(stateRef.current.tmpWinnerLocal).applyAxisAngle(stateRef.current.tmpUp, group.rotation.y);

                // We want to be in front of the winner.
                // Target Camera Pos: along the normal, 4 units away
                stateRef.current.tmpNormal.copy(stateRef.current.tmpWinnerWorld).normalize();
                stateRef.current.tmpCamPosB.copy(stateRef.current.tmpWinnerWorld).add(stateRef.current.tmpNormal.multiplyScalar(4));

                // Smoothly move camera (finish in the reveal window).
                camera.position.lerpVectors(stateRef.current.winnerStartPos, stateRef.current.tmpCamPosB, eased);

                // Look at winner
                camera.lookAt(stateRef.current.tmpWinnerWorld);
            }

        } else {
            // IDLE (and default)
            group.rotation.y = (group.rotation.y + 0.12 * delta) % (Math.PI * 2);

            stateRef.current.tmpCamPosA.set(0, 5.0, 18.5);
            camera.position.lerp(stateRef.current.tmpCamPosA, 0.03);
            camera.lookAt(0, 0, 0);
        }
    });

    return null;
};

export default CameraController;
