import React, { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../state/store';
import { getTreePosition } from '../../utils/layout';
import { CONSTANTS } from '../../utils/constants';

type TextHandle = THREE.Object3D & {
    color: THREE.Color | string;
    fillOpacity: number;
    outlineWidth: number;
};

const NameLabel: React.FC<{
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    mode: 'NORMAL' | 'DIM' | 'WINNER';
    phase: 'IDLE' | 'RUNNING' | 'WINNER_VIEW';
    labelIndex: number;
    plannedWinnerIndex: number | null;
    drawStartedAt: number | null;
}> = React.memo(({ name, position, rotation, mode, phase, labelIndex, plannedWinnerIndex, drawStartedAt }) => {
    // Memoize to prevent re-renders of all 140 labels every frame
    const textRef = useRef<TextHandle | null>(null);
    const billboardRef = useRef({
        parentWorldQuat: new THREE.Quaternion(),
        invParentWorldQuat: new THREE.Quaternion(),
        worldPos: new THREE.Vector3(),
        tmpA: new THREE.Vector3(),
        tmpB: new THREE.Vector3(),
    });
    const color = mode === 'WINNER' ? '#ffd700' : mode === 'DIM' ? '#9aa0a6' : 'white';

    useFrame((state) => {
        if (!textRef.current) return;

        // Billboard towards camera so names stay readable while the tree rotates/zooms.
        const parent = textRef.current.parent as THREE.Object3D | null;
        if (parent) {
            parent.getWorldQuaternion(billboardRef.current.parentWorldQuat);
            billboardRef.current.invParentWorldQuat.copy(billboardRef.current.parentWorldQuat).invert();
            textRef.current.quaternion.copy(billboardRef.current.invParentWorldQuat).multiply(state.camera.quaternion);
        }

        if (mode === 'WINNER') {
            const s = 1.6 + Math.sin(state.clock.elapsedTime * 10) * 0.15;
            textRef.current.scale.set(s, s, s);
            textRef.current.color = new THREE.Color('#ffd700');
            textRef.current.fillOpacity = 1;
            textRef.current.outlineWidth = 0.04;
        } else {
            let nearBoost = 0;
            if (phase === 'RUNNING' && plannedWinnerIndex !== null && drawStartedAt !== null) {
                const elapsedMs = Date.now() - drawStartedAt;
                const p = Math.min(1, Math.max(0, elapsedMs / (CONSTANTS.DRAW.COMPLETE_AT_S * 1000)));
                const late = Math.min(1, Math.max(0, (p - 0.6) / 0.4));
                if (late > 0) {
                    const windowSize = Math.round(THREE.MathUtils.lerp(14, 2, late));
                    if (Math.abs(labelIndex - plannedWinnerIndex) <= windowSize) nearBoost = late;
                }
            }

            const baseScale = mode === 'DIM' ? 0.56 : THREE.MathUtils.lerp(0.62, 0.72, nearBoost);
            textRef.current.scale.set(baseScale, baseScale, baseScale);
            textRef.current.color = color;

            let opacity = mode === 'DIM' ? 0.28 : THREE.MathUtils.lerp(0.82, 0.96, nearBoost);

            // Extra-dim labels on the back side of the tree (relative to camera).
            textRef.current.getWorldPosition(billboardRef.current.worldPos);
            billboardRef.current.tmpA.set(billboardRef.current.worldPos.x, 0, billboardRef.current.worldPos.z).normalize();
            billboardRef.current.tmpB.set(state.camera.position.x, 0, state.camera.position.z).normalize();
            const hemisphereDot = billboardRef.current.tmpA.dot(billboardRef.current.tmpB);
            if (hemisphereDot < 0) opacity *= 0.35;

            textRef.current.fillOpacity = opacity;
            textRef.current.outlineWidth = 0.012;
        }
    });

    return (
        <Text
            ref={textRef}
            position={position}
            rotation={rotation}
            fontSize={0.42}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.012}
            outlineColor="#000"
            depthOffset={-1}
        >
            {name}
        </Text>
    );
});
const NameLabels: React.FC = () => {
    const remainingNames = useStore((state) => state.remainingNames);
    const phase = useStore((state) => state.phase);
    const currentWinner = useStore((state) => state.currentWinner);
    const plannedWinnerIndex = useStore((state) => state.plannedWinnerIndex);
    const drawStartedAt = useStore((state) => state.drawStartedAt);

    // Need to know the winner to highlight? 
    // The store `winners` has history. The logic for "who is being drawn" is disjoint.
    // We need to know who the CURRENT winner is during the animation.
    // But store pushes to `winners` immediately in my previous impl. 

    // Let's rely on props or store for "highlighted name".
    // Actually, for the "Spin", we just spin the whole tree.
    // For "Zoom", we zoom to the specific label.

    // We need a stable mapping of Name -> Position.
    // We can just map `remainingNames` to positions based on their initial index.
    // BUT `remainingNames` changes (pops). This shifts indices!
    // FIX: We should use `allNames` filtering or just `remainingNames` but realize they shift.
    // If `Alice` is at index 0, and `Bob` is popped, `Alice` stays at 0?
    // `remainingNames.pop()` removes the last one. The others keep indices.
    // So stable indices for the prefix is fine.

    // OR better: Map all `remainingNames` to the first N slots.

    const currentWinnerSet = useMemo(() => new Set(currentWinner ? [currentWinner] : []), [currentWinner]);

    return (
        <group>
            {remainingNames.map((name, idx) => {
                const { position, rotation } = getTreePosition(idx, remainingNames.length, 0.7);
                // If we recalc based on current count, everyone moves when one is removed.
                // That might be a cool effect? "Re-shuffling" on the tree.
                // Or distracting.
                // Given "pop" happens at end, it's fine.

                let mode: 'NORMAL' | 'DIM' | 'WINNER' = 'NORMAL';

                if (phase === 'WINNER_VIEW') {
                    mode = currentWinnerSet.has(name) ? 'WINNER' : 'DIM';
                }

                return (
                    <NameLabel
                        key={name} // Key by name to preserve identity
                        name={name}
                        position={position}
                        rotation={rotation}
                        mode={mode}
                        phase={phase}
                        labelIndex={idx}
                        plannedWinnerIndex={plannedWinnerIndex}
                        drawStartedAt={drawStartedAt}
                    />
                );
            })}
        </group>
    );
};

export default NameLabels;
