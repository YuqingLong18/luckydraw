import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../state/store';
import { getTreePosition } from '../../utils/layout';

const CameraController: React.FC<{ treeGroupRef: React.RefObject<THREE.Group> }> = ({ treeGroupRef }) => {
    const { camera } = useThree();
    const phase = useStore((state) => state.phase);
    const currentWinner = useStore((state) => state.currentWinner);
    const remainingNames = useStore((state) => state.remainingNames);

    const stateRef = useRef({ time: 0 });

    useEffect(() => {
        if (phase === 'RUNNING') {
            stateRef.current.time = 0;
        }
    }, [phase]);

    useFrame((_state, delta) => {
        if (!treeGroupRef.current) return;

        const group = treeGroupRef.current;

        if (phase === 'RUNNING') {
            stateRef.current.time += delta;
            const t = stateRef.current.time;

            // Phase 1: Spin up (0-2s)
            // Phase 2: High speed spin (2-8s)
            // Phase 3: Decel + alignment (8-10s)

            // Rotation speed logic
            let speed = 0;
            if (t < 2) {
                speed = THREE.MathUtils.lerp(0.5, 15, t / 2);
            } else if (t < 8) {
                speed = 15;
            } else if (t < 10) {
                speed = THREE.MathUtils.lerp(15, 0, (t - 8) / 2);
            } else {
                speed = 0;
            }

            // Apply rotation
            group.rotation.y += speed * delta;
            group.rotation.y = group.rotation.y % (Math.PI * 2);

            // While running, keep camera at standard distance
            camera.position.lerp(new THREE.Vector3(0, 5, 30), 0.05);
            camera.lookAt(0, 0, 0);

        } else if (phase === 'WINNER_VIEW' && currentWinner) {
            // Stop rotation
            // group.rotation.y += 0;

            // Zoom to winner
            // Find index of currentWinner in remainingNames (it MUST be there)
            const idx = remainingNames.indexOf(currentWinner);
            if (idx !== -1) {
                const { position } = getTreePosition(idx, remainingNames.length);
                const winnerLocalPos = new THREE.Vector3(...position);

                // Current World Pos of Winner:
                const winnerWorldPos = winnerLocalPos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), group.rotation.y);

                // We want to be in front of the winner.
                // Target Camera Pos: along the normal, 4 units away
                const normal = winnerWorldPos.clone().normalize();
                const targetCamPos = winnerWorldPos.clone().add(normal.multiplyScalar(4));

                // Smoothly move camera
                camera.position.lerp(targetCamPos, 0.1);

                // Look at winner
                // Since `lerp` doesn't rotate, we need to manually slerp quaternion or just lookAt every frame.
                // lookAt is rigid, but if position moves smooth, lookAt should be mostly smooth.
                camera.lookAt(winnerWorldPos);
            }

        } else {
            // IDLE (and default)
            // Rotate 1/2 slower -> 0.1
            group.rotation.y += 0.1 * delta;

            // "Zoom in closer to the tree gradually"
            // Let's target z=18 (closer than standard 30)
            // Usage of a very slow lerp factor gives "gradual" feel
            camera.position.lerp(new THREE.Vector3(0, 5, 18), 0.02);
            camera.lookAt(0, 0, 0);
        }
    });

    return null;
};

export default CameraController;
