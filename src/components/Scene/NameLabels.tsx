import React, { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Text as TroikaText } from 'troika-three-text';
import { useStore } from '../../state/store';
import { getTreePosition } from '../../utils/layout';

const NameLabel: React.FC<{
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    isHighlighted: boolean;
}> = React.memo(({ name, position, rotation, isHighlighted }) => {
    // Memoize to prevent re-renders of all 140 labels every frame
    const textRef = useRef<TroikaText | null>(null);
    const billboardRef = useRef({
        parentWorldQuat: new THREE.Quaternion(),
        invParentWorldQuat: new THREE.Quaternion(),
    });
    const color = isHighlighted ? '#ffd700' : 'white';
    // const scaleFactor = isHighlighted ? 1.5 : (PlatformMobile() ? 0.5 : 0.8); // Smaller default, big highlight - UNUSED in my logic below because I set scale in useFrame

    useFrame((state) => {
        if (!textRef.current) return;

        // Billboard towards camera so names stay readable while the tree rotates/zooms.
        const parent = textRef.current.parent as THREE.Object3D | null;
        if (parent) {
            parent.getWorldQuaternion(billboardRef.current.parentWorldQuat);
            billboardRef.current.invParentWorldQuat.copy(billboardRef.current.parentWorldQuat).invert();
            textRef.current.quaternion.copy(billboardRef.current.invParentWorldQuat).multiply(state.camera.quaternion);
        }

        // Pulse if highlighted
        if (isHighlighted) {
            const s = 1.5 + Math.sin(state.clock.elapsedTime * 15) * 0.3;
            textRef.current.scale.set(s, s, s);
            textRef.current.color = new THREE.Color('#ffd700');
            textRef.current.fillOpacity = 1;
        } else {
            textRef.current.scale.set(0.8, 0.8, 0.8); // Base scale
            textRef.current.color = 'white';
            textRef.current.fillOpacity = 0.9;
        }
    });

    return (
        <Text
            ref={textRef}
            position={position}
            rotation={rotation}
            fontSize={0.48}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
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

    const indexByName = useMemo(() => {
        const map = new Map<string, number>();
        for (let i = 0; i < remainingNames.length; i++) map.set(remainingNames[i], i);
        return map;
    }, [remainingNames]);

    const visibleNames = useMemo(() => {
        const MAX_VISIBLE = 48;
        if (remainingNames.length <= MAX_VISIBLE) return remainingNames;

        const stride = Math.ceil(remainingNames.length / MAX_VISIBLE);
        const sampled: string[] = [];
        for (let i = 0; i < remainingNames.length && sampled.length < MAX_VISIBLE; i += stride) {
            sampled.push(remainingNames[i]);
        }

        if (phase === 'WINNER_VIEW' && currentWinner && !sampled.includes(currentWinner)) {
            sampled[sampled.length - 1] = currentWinner;
        }

        return sampled;
    }, [remainingNames, phase, currentWinner]);

    return (
        <group>
            {visibleNames.map((name) => {
                const idx = indexByName.get(name);
                if (idx === undefined) return null;

                const { position, rotation } = getTreePosition(idx, remainingNames.length); // Recalculate based on current count?
                // If we recalc based on current count, everyone moves when one is removed.
                // That might be a cool effect? "Re-shuffling" on the tree.
                // Or distracting.
                // Given "pop" happens at end, it's fine.

                return (
                    <NameLabel
                        key={name} // Key by name to preserve identity
                        name={name}
                        position={position}
                        rotation={rotation}
                        isHighlighted={false} // Highlight logic needs refinement ideally
                    />
                );
            })}
        </group>
    );
};

export default NameLabels;
