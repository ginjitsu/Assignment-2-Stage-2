import * as GaussianSplats3D from 'https://cdn.jsdelivr.net/npm/@mkkellogg/gaussian-splats-3d@0.4.1/build/gaussian-splats-3d.module.min.js';

const container = document.getElementById('splat-container');

if (container) {
    const viewer = new GaussianSplats3D.Viewer({
        'container': container,
        'cameraUp': [0, 1, 0],
        'initialCameraPosition': [0, 2, 5],
        'initialCameraLookAt': [0, 0, 0],
        'sphericalHarmonicsDegree': 0
    });

    // Load the scene
    viewer.addSplatScene('assets/car-raize-road.splat', {
        'splatAlphaRemovalThreshold': 5,
        'showLoadingUI': true,
        'position': [0, -2, 0],
        'rotation': [0, 0, 0, 1],
        'scale': [3, 3, 3]
    })
        .then(() => {
            viewer.start();
            console.log('Splat scene loaded');
            setupScrollAnimation(viewer);
        });
}

function setupScrollAnimation(viewer) {
    const keyframes = [
        { t: 0, pos: [0, 2, 8], target: [0, 0, 0] },
        { t: 0.3, pos: [5, 3, 5], target: [0, 0, 0] },
        { t: 0.6, pos: [-5, 2, 4], target: [0, 0, 0] },
        { t: 1, pos: [0, 5, 1], target: [0, 0, 0] }
    ];

    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    function lerpVector(v1, v2, t) {
        return [
            lerp(v1[0], v2[0], t),
            lerp(v1[1], v2[1], t),
            lerp(v1[2], v2[2], t)
        ];
    }

    function updateCamera() {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

        let startFrame = keyframes[0];
        let endFrame = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (progress >= keyframes[i].t && progress <= keyframes[i + 1].t) {
                startFrame = keyframes[i];
                endFrame = keyframes[i + 1];
                break;
            }
        }

        const segmentProgress = (progress - startFrame.t) / (endFrame.t - startFrame.t);
        const currentPos = lerpVector(startFrame.pos, endFrame.pos, segmentProgress);
        const currentTarget = lerpVector(startFrame.target, endFrame.target, segmentProgress);

        if (viewer.camera && viewer.controls) {
            viewer.camera.position.set(...currentPos);
            viewer.controls.target.set(...currentTarget);
            viewer.camera.lookAt(...currentTarget);
            viewer.controls.update();
        }
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateCamera);
    });

    updateCamera();
}
