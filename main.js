const canvas = document.querySelector('#hero-glow');
const hero = document.querySelector('.hero');

if (canvas && hero) {
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  const circles = Array.from({ length: 8 }, (_, i) => ({
    radius: 140 + i * 35,
    alpha: 0.08 + i * 0.02,
  }));

  function draw(mx = canvas.width / 2, my = canvas.height / 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach((circle, idx) => {
      ctx.beginPath();
      const offset = Math.sin(performance.now() / 900 + idx) * 14;
      ctx.arc(mx, my + offset, circle.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 59, 47, ${circle.alpha})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    });
  }

  let pointerX = 0;
  let pointerY = 0;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
  });

  function raf() {
    draw(pointerX || canvas.width / 2, pointerY || canvas.height / 2);
    requestAnimationFrame(raf);
  }

  window.addEventListener('resize', resize);
  resize();
  raf();
}

const modelViewer = document.querySelector('model-viewer');

if (modelViewer) {
  const setupModelScroll = () => {
    const keyframes = [
      { t: 0, orbit: '45deg 55deg 2.5m' },
      { t: 0.3, orbit: '0deg 75deg 2m' },
      { t: 0.6, orbit: '-45deg 55deg 2.5m' },
      { t: 1, orbit: '0deg 45deg 2m' }
    ];

    // Helper to parse "deg" and "m" strings into numbers
    const parseOrbit = (orbitStr) => {
      const [theta, phi, radius] = orbitStr.split(' ');
      return {
        theta: parseFloat(theta),
        phi: parseFloat(phi),
        radius: parseFloat(radius)
      };
    };

    const parsedKeyframes = keyframes.map(kf => ({
      t: kf.t,
      orbit: parseOrbit(kf.orbit)
    }));

    const lerp = (start, end, t) => start * (1 - t) + end * t;

    const updateModelCamera = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      let startFrame = parsedKeyframes[0];
      let endFrame = parsedKeyframes[parsedKeyframes.length - 1];

      for (let i = 0; i < parsedKeyframes.length - 1; i++) {
        if (progress >= parsedKeyframes[i].t && progress <= parsedKeyframes[i + 1].t) {
          startFrame = parsedKeyframes[i];
          endFrame = parsedKeyframes[i + 1];
          break;
        }
      }

      const segmentProgress = (progress - startFrame.t) / (endFrame.t - startFrame.t);

      const currentTheta = lerp(startFrame.orbit.theta, endFrame.orbit.theta, segmentProgress);
      const currentPhi = lerp(startFrame.orbit.phi, endFrame.orbit.phi, segmentProgress);
      const currentRadius = lerp(startFrame.orbit.radius, endFrame.orbit.radius, segmentProgress);

      modelViewer.cameraOrbit = `${currentTheta}deg ${currentPhi}deg ${currentRadius}m`;
    };

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateModelCamera);
    });

    updateModelCamera();
  };

  setupModelScroll();
}

