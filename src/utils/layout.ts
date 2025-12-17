import { CONSTANTS } from './constants';

export const getTreePosition = (index: number, total: number, radialOffset = 0) => {
    const height = CONSTANTS.SCENE.TREE_HEIGHT;
    const maxRadius = CONSTANTS.SCENE.TREE_RADIUS;

    // We want to distribute points evenly on the surface of the cone.
    // Using Golden Angle Spiral

    // Valid Y range: from -height/2 to height/2
    // But let's leave some space at top and bottom.
    const effectiveHeight = height * 0.8;
    const yOffset = -height / 2 + height * 0.1;

    // Linear distribution in Y might bunch up at top/bottom?
    // Let's just do simple linear for now, but ensure we cover the surface area.

    // For a cone, surface area at slice dy is proportional to radius.
    // Radius is linear with Y. 
    // So to distribute evenly by area, we need to adjust density.
    // However, spiral placement usually handles this decently if we step carefully.

    const y = (index / total) * effectiveHeight + yOffset;
    const normalizedY = (y + height / 2) / height; // 0 (bottom) to 1 (top)

    // Radius at Y (Cone tapers to top)
    const r = maxRadius * (1 - normalizedY) + radialOffset;

    const theta = index * 2.39996 + Math.PI; // Golden angle offset

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    return {
        position: [x, y, z] as [number, number, number],
        rotation: [0, -theta - Math.PI / 2, 0] as [number, number, number]
    };
};
