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
    
    gl_PointSize = size * (300.0 / -mvPosition.z);
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
        const count = 5000; // Increased count for fuller tree
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
            // Create a layered cone effect or just simple cone?
            // Simple cone with volume.

            const h = rand() * height; // 0 to height (bottom to top relative)
            // Actually our tree works better -height/2 to height/2
            const y = h - height / 2;
            const normalizedY = h / height; // 0 to 1

            const rAtHeight = maxRadius * (1 - normalizedY);

            // Volume distribution: more points near surface, some inside
            const r = rAtHeight * Math.sqrt(rand()); // Sqrt for uniform area, but maybe we want surface mostly
            const theta = rand() * Math.PI * 2;

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            sizes[i] = rand() * 0.4 + 0.1;
            speeds[i] = rand() * 5 + 1;
            offsets[i] = rand() * 10;

            // Color logic
            // Mostly green.
            const choice = rand();
            let col = green;

            if (choice > 0.95) col = gold; // Ornaments
            else if (choice > 0.9) col = red;
            else if (choice > 0.88) col = white; // Lighter tips
            else if (choice > 0.5) col = brightGreen;

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
    );
};

export default ChristmasTree;
