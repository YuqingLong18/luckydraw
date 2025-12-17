import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CONSTANTS } from '../../utils/constants';
import { useStore } from '../../state/store';

import ChristmasTree from './ChristmasTree';
// import Snow from './Snow'; // Removed
import NameLabels from './NameLabels';
import CameraController from './CameraController';

const Scene: React.FC = () => {
    const treeGroupRef = React.useRef<THREE.Group>(null);
    const phase = useStore((state) => state.phase);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas gl={{ antialias: true, alpha: false }}>
                <PerspectiveCamera makeDefault position={[0, 5, 30]} fov={60} />
                <OrbitControls enabled={phase === 'IDLE'} enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={10} maxDistance={50} />

                <ambientLight intensity={0.5} color={CONSTANTS.COLORS.SECONDARY} />
                <pointLight position={[10, 10, 10]} intensity={1} color={CONSTANTS.COLORS.GOLD} />

                <color attach="background" args={['#000']} />

                <Suspense fallback={null}>
                    <group ref={treeGroupRef}>
                        <ChristmasTree />
                        {/* <Snow /> Removed per user request */}
                        <NameLabels />
                    </group>
                    <Environment preset="night" />
                </Suspense>

                <CameraController treeGroupRef={treeGroupRef} />
            </Canvas>
        </div>
    );
};

export default Scene;
