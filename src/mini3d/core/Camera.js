import { PerspectiveCamera, OrthographicCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export class Camera {
  constructor({ sizes, scene, canvas }, options = { isOrthographic: false }) {
    this.sizes = sizes;
    this.scene = scene;
    this.canvas = canvas;
    this.options = Object.assign({ isOrthographic: false }, options);
    this.setInstance();
  }
  setInstance() {
    this.instance = null;
    this.setCamera(this.options.isOrthographic);

    this.instance.position.set(10, 10, 10);

    this.scene.add(this.instance);
  }
  /**
   * 设置当前相机
   * @param {*} isOrthographic true 默认正交相机，false 透视相机
   */
  setCamera(isOrthographic = true) {
    let aspect = this.sizes.width / this.sizes.height;
    if (isOrthographic) {
      let s = 120;
      this.instance = new OrthographicCamera(
        -s * aspect,
        s * aspect,
        s,
        -s,
        1,
        10000
      );
    } else {
      // 透视相机
      this.instance = new PerspectiveCamera(45, aspect, 1, 10000);
    }
    this.setControls();
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    // // 设置缩放限制
    if (this.options.isOrthographic) {
      // 正交相机使用minZoom和maxZoom
      this.controls.minZoom = 0.5; // 最小缩放比例
      this.controls.maxZoom = 5; // 最大缩放比例
    } else {
      // 透视相机使用minDistance和maxDistance
      this.controls.minDistance = 16; // 最小距离（限制最大缩放）
      this.controls.maxDistance = 60; // 最大距离（限制最小缩放）
    }
    // 禁止翻转 - 限制垂直旋转角度
    this.controls.minPolarAngle = Math.PI * 0.2; // 限制向上旋转角度
    this.controls.maxPolarAngle = Math.PI * 0.45; // 限制向下旋转角度，防止翻转到底部
    this.controls.update();
  }
  resize() {
    let aspect = this.sizes.width / this.sizes.height;
    if (this.options.isOrthographic) {
      let s = 120;
      this.instance.left = -s * aspect;
      this.instance.right = s * aspect;
      this.instance.top = s;
      this.instance.bottom = -s;
    } else {
      this.instance.aspect = aspect;
    }
    this.instance.updateProjectionMatrix();
  }
  update() {
    this.controls.update();
  }
  destroy() {
    this.controls.dispose();
  }
}
