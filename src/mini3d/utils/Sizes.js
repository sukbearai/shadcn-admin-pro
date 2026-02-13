import { EventEmitter } from "./EventEmitter";
export class Sizes extends EventEmitter {
  constructor({ canvas }) {
    super();
    this.canvas = canvas;
    this.pixelRatio = 1;
    this.handleResize = this.handleResize.bind(this);
    this.init();
    window.addEventListener("resize", this.handleResize);
  }
  handleResize() {
    this.init();
    this.emit("resize");
  }
  init() {
    const parentNode = this.canvas?.parentNode;
    if (!parentNode) {
      this.width = 0;
      this.height = 0;
      return;
    }
    this.width = parentNode.offsetWidth;
    this.height = parentNode.offsetHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  }
  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.off("resize");
  }
}
