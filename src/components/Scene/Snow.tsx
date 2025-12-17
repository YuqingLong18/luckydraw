import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS } from '../../utils/constants';
import { createMulberry32 } from '../../utils/random';

const Snow: React.FC = () => {
    const count = 1000;
    const pointsRef = useRef<THREE.Points>(null);
    const randRef = useRef(createMulberry32(0x51ee0d));

    const { positions, velocities } = useMemo(() => {
        const rand = createMulberry32(0x51ee0d);
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (rand() - 0.5) * 50;
            positions[i * 3 + 1] = rand() * 30;
            positions[i * 3 + 2] = (rand() - 0.5) * 50;

            velocities[i * 3] = (rand() - 0.5) * 0.02;     // x
            velocities[i * 3 + 1] = -(rand() * 0.05 + 0.01); // y (falling)
            velocities[i * 3 + 2] = (rand() - 0.5) * 0.02; // z
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
                x = (randRef.current() - 0.5) * 50;
                z = (randRef.current() - 0.5) * 50;
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
                    args={[positions, 3]}
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
