import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS } from '../../utils/constants';
import { createMulberry32 } from '../../utils/random';

const vertexShader = `
  uniform float uTime;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;
  attribute vec3 aColor;
  varying vec3 vColor;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Twinkle effect
    float twinkle = sin(uTime * aSpeed + aOffset) * 0.5 + 0.5;
    float size = aSize * (0.8 + 0.4 * twinkle);
    
    gl_PointSize = size * (380.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vColor = aColor * (0.8 + 0.2 * twinkle); // Pulse color too
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft glow / Blurred circle
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);
    
    gl_FragColor = vec4(vColor, glow);
  }
`;

const ChristmasTree: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, sizes, speeds, offsets, colors } = useMemo(() => {
        const rand = createMulberry32(0xdecafbad);
        const count = 7000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);
        const offsets = new Float32Array(count);
        const colors = new Float32Array(count * 3);

        const height = CONSTANTS.SCENE.TREE_HEIGHT;
        const maxRadius = CONSTANTS.SCENE.TREE_RADIUS;

        const green = new THREE.Color('#0f5025'); // Deep Green
        const brightGreen = new THREE.Color('#2d6a4f');
        const red = new THREE.Color('#d90429');
        const gold = new THREE.Color('#ffb703');
        const white = new THREE.Color('#ffffff');

        for (let i = 0; i < count; i++) {
            // Prefer a recognizable silhouette: mostly on the cone surface with a gentle spiral.
            const t = i / count; // 0..1 bottom->top
            const h = t * height;
            const y = h - height / 2;
            const normalizedY = h / height; // 0..1

            const rAtHeight = maxRadius * (1 - normalizedY);

            const spiralTurns = 18;
            const theta = t * spiralTurns * Math.PI * 2 + rand() * 0.35;

            const surfaceBias = 0.92 + rand() * 0.08; // keep near surface
            const r = rAtHeight * surfaceBias + (rand() - 0.5) * 0.08;

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            sizes[i] = rand() * 0.55 + 0.15;
            speeds[i] = rand() * 5 + 1;
            offsets[i] = rand() * 10;

            // Color logic
            // Mostly green.
            const choice = rand();
            let col = green;

            if (choice > 0.975) col = gold; // Ornaments
            else if (choice > 0.95) col = red;
            else if (choice > 0.93) col = white; // Lighter tips
            else if (choice > 0.4) col = brightGreen;

            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        return { positions, sizes, speeds, offsets, colors };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
    }), []);

    useFrame((state) => {
        const points = pointsRef.current;
        if (points && points.material instanceof THREE.ShaderMaterial) {
            points.material.uniforms.uTime.value = state.clock.elapsedTime;
            // Rotation is handled by CAMERA now mostly, but tree can rotate slowly too?
            // User asked for "Rotate faster" during draw. 
            // Usually we rotate the object or orbit the camera.
            // Let's stick to object rotation for simpler "Spin" effect if camera is also moving.
            // But if we want to zoom to a specific name attached to the tree, 
            // we must know the tree's rotation.

            // If we rotate the tree group, the names (children or separate) must rotate with it.
            // Currently `NameLabels` and `ChristmasTree` are siblings.
            // This makes synchronization hard if `ChristmasTree` rotates internally.
            // FIX: We should NOT rotate the geometry inside `ChristmasTree` if we want names to stick
            // unless names are children.
            // OR we wrap both in a `<group>` in Scene and rotate the group.

            // I will remove the internal rotation here and let the parent group or camera handle movement.
            // Actually, previously I did `pointsRef.current.rotation.y += 0.001`.
            // I'll comment that out and handle rotation in Scene or Parent.
        }
    });

    return (
        <group>
            <mesh position={[0, -0.8, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[CONSTANTS.SCENE.TREE_RADIUS * 1.02, CONSTANTS.SCENE.TREE_HEIGHT * 0.92, 24, 1, true]} />
                <meshBasicMaterial color="#1b4d34" wireframe transparent opacity={0.08} depthWrite={false} />
            </mesh>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aSize"
                        count={sizes.length}
                        args={[sizes, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aSpeed"
                        count={speeds.length}
                        args={[speeds, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aOffset"
                        count={offsets.length}
                        args={[offsets, 1]}
                    />
                    <bufferAttribute
                        attach="attributes-aColor"
                        count={colors.length / 3}
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};

export default ChristmasTree;
