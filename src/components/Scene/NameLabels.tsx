import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../state/store';
import { getTreePosition } from '../../utils/layout';

const NameLabel: React.FC<{
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    isHighlighted: boolean;
}> = React.memo(({ name, position, rotation, isHighlighted }) => {
    // Memoize to prevent re-renders of all 140 labels every frame
    const textRef = useRef<any>(null);
    const color = isHighlighted ? '#ffd700' : 'white';
    // const scaleFactor = isHighlighted ? 1.5 : (PlatformMobile() ? 0.5 : 0.8); // Smaller default, big highlight - UNUSED in my logic below because I set scale in useFrame

    useFrame((state) => {
        if (!textRef.current) return;

        // Billboarding? No, they are stuck to tree.
        // Pulse if highlighted
        if (isHighlighted) {
            const s = 1.5 + Math.sin(state.clock.elapsedTime * 15) * 0.3;
            textRef.current.scale.set(s, s, s);
            textRef.current.color = new THREE.Color('#ffd700');
            textRef.current.fillOpacity = 1;
        } else {
            textRef.current.scale.set(0.6, 0.6, 0.6); // Base scale
            textRef.current.color = 'white';
            textRef.current.fillOpacity = 0.9;
        }
    });

    return (
        <Text
            ref={textRef}
            position={position}
            rotation={rotation}
            fontSize={0.4} // Smaller font to fit more
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

function PlatformMobile() {
    return window.innerWidth < 600;
}

const NameLabels: React.FC = () => {
    const remainingNames = useStore((state) => state.remainingNames);

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

    return (
        <group>
            {remainingNames.map((name, i) => {
                const { position, rotation } = getTreePosition(i, remainingNames.length); // Recalculate based on current count?
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
