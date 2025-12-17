import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS } from '../../utils/constants';

const Snow: React.FC = () => {
    const count = 1000;
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, velocities } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

            velocities[i * 3] = (Math.random() - 0.5) * 0.02;     // x
            velocities[i * 3 + 1] = -(Math.random() * 0.05 + 0.01); // y (falling)
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02; // z
        }
        return { positions, velocities };
    }, []);

    useFrame(() => {
        if (!pointsRef.current) return;
        const geom = pointsRef.current.geometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < count; i++) {
            let x = posAttr.getX(i);
            let y = posAttr.getY(i);
            let z = posAttr.getZ(i);

            x += velocities[i * 3];
            y += velocities[i * 3 + 1];
            z += velocities[i * 3 + 2];

            // Reset if too low
            if (y < -15) {
                y = 15;
                x = (Math.random() - 0.5) * 50;
                z = (Math.random() - 0.5) * 50;
            }

            posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color={CONSTANTS.COLORS.SECONDARY}
                size={0.15}
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
};

export default Snow;
