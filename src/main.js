import './style.css';
import VRHall from './vr-hall/index';

const main = () => {
  const vr = new VRHall({
    container: document.getElementById('app'),
  });

  vr.loadHall({
    url: '/public/assets/room1/msg.gltf',
    position: {
      x: 0,
      y: -0.2,
      z: 0,
    },
    onProgress: (p) => {
      console.log(p);
    },
  });
};

main();
