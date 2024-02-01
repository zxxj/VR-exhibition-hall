import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

CameraControls.install({ THREE: THREE });
const gui = new GUI();
const clock = new THREE.Clock();

export class VRHall {
  constructor(options) {
    this._options = Object.assign(
      {
        container: document.body,
      },
      options
    );

    this.init();
    this.rayEvent();
    this.animate();
  }

  init() {
    // 场景
    this.scene = new THREE.Scene();

    // 相机
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(5, 2, 0);
    this.camera.lookAt(0, 0, 0);

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    const { clientWidth, clientHeight } = this._options.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this._options.container.appendChild(this.renderer.domElement);

    // 轨道控制器
    this.controls = new CameraControls(this.camera, this.renderer.domElement);

    // 坐标轴辅助器
    const axesHlper = new THREE.AxesHelper(100);
    this.scene.add(axesHlper);

    // 环境光
    this.scene.add(new THREE.AmbientLight(0xffffff, 1));

    // GLTF加载器
    this.gltfLoader = new GLTFLoader();

    const cameraFolder = gui.addFolder('相机位置');
    cameraFolder.add(this.camera.position, 'x', 0, 10);
    cameraFolder.add(this.camera.position, 'y', 0, 10);
    cameraFolder.add(this.camera.position, 'z', 0, 10);
  }

  // 渲染动画帧
  animate() {
    const delta = clock.getDelta();
    this.controls.update(delta);
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  // 加载展厅
  async loadHall(params) {
    const { url, position, scale, onProgress } = params;

    const gltf = await this.loadGLTF({ url, onProgress });
    this.scene.add(gltf.scene);

    if (position) gltf.scene.position.set(position.x, position.y, position.z);
  }

  // 加载GLTF模型
  loadGLTF(params) {
    const { url, onProgress } = params;
    return new Promise((resolve) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          resolve(gltf);
        },
        (progress) => {
          if (onProgress) {
            onProgress(progress);
          }
        }
      );
    });
  }

  // 射线拾取
  rayEvent() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    window.addEventListener('click', (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(pointer, this.camera);
      // 计算物体和射线的焦点
      const intersects = raycaster.intersectObjects(this.scene.children)[0];

      if (intersects) {
        if (intersects.object.name === 'meishu01') {
          const v3 = intersects.point;
          console.log('点击了地板');
          this.controls.moveTo(v3.x, v3.y, v3.z, true);
        }
      }
    });
  }
}
