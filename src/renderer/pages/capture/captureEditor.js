import Event from 'events';

const CREATE_RECT = 1;
const MOVING_RECT = 2;
const RESIZE = 3;
const DrawGraffito = 4;

const ANCHORS = [ // 重置区域的点
  { row: 'x', col: 'y', cursor: 'nwse-resize' }, // 上左
  { row: '', col: 'y', cursor: 'ns-resize' }, // 上中
  { row: 'r', col: 'y', cursor: 'nesw-resize' }, // 上右

  { row: 'x', col: '', cursor: 'ew-resize' }, // 中左
  { row: 'r', col: '', cursor: 'ew-resize' }, // 中右

  { row: 'x', col: 'b', cursor: 'nesw-resize' }, // 下左
  { row: '', col: 'b', cursor: 'ns-resize' }, // 下中
  { row: 'r', col: 'b', cursor: 'nwse-resize' } // 下右
];

export class CaptureEditor extends Event {
  constructor($canvas, $canvas2, $bg, $jsMask, imageSrc, scaleFactor, screenWidth, screenHeight) {
    super();
    this.$canvas = $canvas; // 用于展示绘制框和锚点
    this.$canvas2 = $canvas2; // 用于存放输入数据
    this.imageSrc = imageSrc;
    this.disabled = false;
    this.isdrawGraffito = false;
    // 存储绘制坐标信息
    this.drawInfo = [];
    this.scaleFactor = scaleFactor;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.$bg = $bg;
    this.$jsMask = $jsMask;
    this.ctx = $canvas.getContext('2d');
    this.ctx2 = $canvas2.getContext('2d');

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.init();
  }

  async init() {
    this.$jsMask.style.background = 'rgba(0, 0, 0, 0.3)';
    this.$bg.style.backgroundImage = `url(${this.imageSrc})`;
    this.$bg.style.backgroundSize = `${this.screenWidth}px ${this.screenHeight}px`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await new Promise((resolve) => {
      const img = new Image();
      img.src = this.imageSrc;
      if (img.complete) {
        resolve(img);
      } else {
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
      }
    });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    this.bgCtx = ctx;

    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseDown(e) {
    if (this.disabled) return;
    this.mouseDown = true;
    const { pageX, pageY } = e;
    if (this.selectRect) {
      const { w, h, x, y, r, b } = this.selectRect;
      if (this.isdrawGraffito) { // 涂鸦状态
        if (pageX > x && pageX < r && pageY > y && pageY < b) {
          this.startDragRect = {
            x: pageX,
            y: pageY,
            selectRect: {
              x, y, w, h, r, b
            }
          };
          this.startPoint = {
            x: e.pageX,
            y: e.pageY,
            moved: false
          };
          this.action = DrawGraffito;
          // 存储本次绘制坐标信息
          this.drawInfo.push({
            startX: e.pageX,
            startY: e.pageY,
            w: 0,
            h: 0
          });
          return;
        }
      }
      if (this.selectAnchorIndex !== -1) {
        this.startPoint = {
          x: pageX,
          y: pageY,
          moved: false,
          selectRect: {
            w, h, x, y, r, b
          },
          rawRect: {
            w, h, x, y, r, b
          }
        };
        this.action = RESIZE;
        return;
      }
      this.startPoint = {
        x: e.pageX,
        y: e.pageY,
        moved: false
      };
      if (pageX > x && pageX < r && pageY > y && pageY < b) {
        this.action = MOVING_RECT;
        this.startDragRect = {
          x: pageX,
          y: pageY,
          selectRect: {
            x, y, w, h, r, b
          }
        };
      } else {
        this.action = CREATE_RECT;
      }
    } else {
      this.action = CREATE_RECT;
      this.startPoint = {
        x: e.pageX,
        y: e.pageY,
        moved: false
      };
      e.stopPropagation();
      e.preventDefault();
    }
  }

  onMouseDrag(e) {
    if (this.disabled) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    const { pageX, pageY } = e;
    let startDragging;
    let selectRect = this.selectRect;
    if (!this.startPoint.moved) {
      if (Math.abs(this.startPoint.x - pageX) > 1 || Math.abs(this.startPoint.y - pageY) > 1) {
        this.startPoint.moved = true;
        startDragging = true;
      }
    }
    if (!this.startPoint.moved) {
      return;
    }

    if (this.action === MOVING_RECT) {
      // 移动选区
      if (startDragging) {
        this.emit('start-dragging', selectRect);
      }
      this.emit('dragging', selectRect);
      const { w, h } = selectRect;
      const { x: startX, y: startY } = this.startPoint;
      let newX = this.startDragRect.selectRect.x + pageX - startX;
      let newY = this.startDragRect.selectRect.y + pageY - startY;
      let newR = newX + w;
      let newB = newY + h;
      if (newX < 0) {
        newX = 0;
        newR = w;
      } else if (newR > this.screenWidth) {
        newR = this.screenWidth;
        newX = newR - w;
      }
      if (newY < 0) {
        newY = 0;
        newB = h;
      } else if (newB > this.screenHeight) {
        newB = this.screenHeight;
        newY = newB - h;
      }
      this.selectRect = {
        w,
        h,
        x: newX,
        y: newY,
        r: newR,
        b: newB
      };
      this.drawRect();
    } else if (this.action === RESIZE) {
      this.emit('dragging', selectRect);
      const { row, col } = ANCHORS[this.selectAnchorIndex];
      if (row) {
        this.startPoint.rawRect[row] = this.startPoint.selectRect[row] + pageX - this.startPoint.x;
        selectRect.x = this.startPoint.rawRect.x;
        selectRect.r = this.startPoint.rawRect.r;
        if (selectRect.x > selectRect.r) {
          const x = selectRect.r;
          selectRect.r = selectRect.x;
          selectRect.x = x;
        }
        selectRect.w = selectRect.r - selectRect.x;
        this.startPoint.rawRect.w = selectRect.w;
      }
      if (col) {
        this.startPoint.rawRect[col] = this.startPoint.selectRect[col] + pageY - this.startPoint.y;
        selectRect.y = this.startPoint.rawRect.y;
        selectRect.b = this.startPoint.rawRect.b;

        if (selectRect.y > selectRect.b) {
          const y = selectRect.b;
          selectRect.b = selectRect.y;
          selectRect.y = y;
        }
        selectRect.h = selectRect.b - selectRect.y;
        this.startPoint.rawRect.h = selectRect.h;
      }
      this.drawRect();
    } else if (this.action === CREATE_RECT) {
      // 生成选区
      const { pageX, pageY } = e;
      let x, y, r, b;
      if (this.startPoint.x > pageX) { // 向左拖动选取
        x = pageX;
        r = this.startPoint.x;
      } else { // 向右拖动选取
        r = pageX;
        x = this.startPoint.x;
      }
      if (this.startPoint.y > pageY) { // 向上拖动选取
        y = pageY;
        b = this.startPoint.y;
      } else { // 向下拖动选取
        b = pageY;
        y = this.startPoint.y;
      }
      const w = r - x;
      const h = b - y;

      this.selectRect = {
        x, y, w, h, r, b
      };
      selectRect = this.selectRect;
      if (startDragging) {
        this.emit('start-dragging', selectRect);
      }
      this.emit('dragging', selectRect);
      this.drawRect(x, y, w, h);
    } else if (this.action === DrawGraffito) { // 涂鸦
      const startX = this.startPoint.x - this.startDragRect.selectRect.x + 5;
      const startY = this.startPoint.y - this.startDragRect.selectRect.y + 5;
      const w = e.pageX - this.startDragRect.selectRect.x - startX + 5;
      const h = e.pageY - this.startDragRect.selectRect.y - startY + 5;
      this.rawRect = {
        startX, startY, w, h
      };
      this.drawInfo[this.drawInfo.length - 1] = this.rawRect;
      this.drawGraffito();
    }
  }

  drawGraffito() { // 绘制涂鸦
    if (this.disabled) {
      return;
    }
    this.drawRect(); // 每次绘制前重新生成画布
    const scaleFactor = this.scaleFactor;
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2 * this.scaleFactor;
    this.drawInfo.forEach(item => {
      this.ctx.beginPath();
      this.ctx.rect(item.startX * scaleFactor, item.startY * scaleFactor, item.w * scaleFactor, item.h * scaleFactor);
      this.ctx.stroke();
    });
    this.ctx2.strokeStyle = 'red';
    this.ctx2.lineWidth = 2 * this.scaleFactor;
    this.drawInfo.forEach(item => {
      this.ctx2.beginPath();
      this.ctx2.rect(item.startX * scaleFactor, item.startY * scaleFactor, item.w * scaleFactor, item.h * scaleFactor);
      this.ctx2.stroke();
    });
  }

  drawRect() { // 生成画布
    if (this.disabled) {
      return;
    }
    if (!this.selectRect) {
      this.$canvas.style.display = 'none';
      return;
    }
    const {
      x, y, w, h
    } = this.selectRect;

    const scaleFactor = this.scaleFactor;
    const margin = 3;
    const radius = 3;
    this.$canvas.style.left = `${x - margin}px`;
    this.$canvas.style.top = `${y - margin}px`;
    this.$canvas.style.width = `${w + margin * 2}px`;
    this.$canvas.style.height = `${h + margin * 2}px`;
    this.$canvas.style.display = 'block';
    this.$canvas.width = (w + margin * 2) * scaleFactor;
    this.$canvas.height = (h + margin * 2) * scaleFactor;

    this.$canvas2.width = (w + margin * 2) * scaleFactor;
    this.$canvas2.height = (h + margin * 2) * scaleFactor;

    if (w && h) {
      const imageData = this.bgCtx.getImageData(x * scaleFactor, y * scaleFactor, w * scaleFactor, h * scaleFactor);
      this.ctx.putImageData(imageData, margin * scaleFactor, margin * scaleFactor);
      this.ctx2.putImageData(imageData, 0 * scaleFactor, 0 * scaleFactor);
    }
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1 * this.scaleFactor;
    this.ctx.strokeRect(margin * scaleFactor, margin * scaleFactor, w * scaleFactor, h * scaleFactor); // 绘制选区
    this.drawAnchors(w, h, margin, scaleFactor, radius);
  }

  drawAnchors(w, h, margin, scaleFactor, radius) { // 绘制锚点
    if (this.disabled) {
      return;
    }
    if (this.mouseDown && this.action === CREATE_RECT) {
      this.anchors = null;
      return;
    }
    this.ctx.beginPath();
    const anchors = [
      [0, 0],
      [w * this.scaleFactor / 2, 0],
      [w * this.scaleFactor, 0],

      [0, h * this.scaleFactor / 2],
      [w * this.scaleFactor, h * this.scaleFactor / 2],

      [0, h * this.scaleFactor],
      [w * this.scaleFactor / 2, h * this.scaleFactor],
      [w * this.scaleFactor, h * this.scaleFactor]
    ];
    this.anchors = anchors.map(([x, y]) => [this.selectRect.x + x / scaleFactor, this.selectRect.y + y / scaleFactor]);
    anchors.forEach(([x, y], i) => {
      this.ctx.arc(x + margin * scaleFactor, y + margin * scaleFactor, radius * scaleFactor, 0, 2 * Math.PI);
      const next = anchors[(i + 1) % anchors.length];
      this.ctx.moveTo(next[0] + margin * scaleFactor + radius * scaleFactor, next[1] + margin * scaleFactor);
    });
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  // 函数节流
  throttle(e) {
    let canRun = true;
    if (!canRun) return;
    this.onMouseDrag(e);
    canRun = false;
    // eslint-disable-next-line space-before-function-paren
    setTimeout(function () {
      canRun = true;
    }, 1000);
  };

  onMouseMove(e) {
    if (this.disabled) return;
    if (this.mouseDown) {
      this.throttle(e);
      return;
    }
    this.selectAnchorIndex = -1;
    if (this.selectRect) {
      const { pageX, pageY } = e;
      const {
        x, y, r, b
      } = this.selectRect;
      let selectAnchor;
      let selectIndex = -1;
      if (this.isdrawGraffito) { // 涂鸦状态
        if (pageX > x && pageX < r && pageY > y && pageY < b) {
          document.body.style.cursor = 'crosshair';
          return;
        }
      }
      if (this.anchors) {
        this.anchors.forEach(([x, y], i) => {
          if (Math.abs(pageX - x) <= 10 && Math.abs(pageY - y) <= 10) {
            selectAnchor = [x, y];
            selectIndex = i;
          }
        });
      }
      if (selectAnchor) { // 改变选区大小
        this.selectAnchorIndex = selectIndex;
        document.body.style.cursor = ANCHORS[selectIndex].cursor;
        this.emit('moving');
        return;
      }
      if (pageX > x && pageX < r && pageY > y && pageY < b) { // 移动选区
        document.body.style.cursor = 'move';
      } else {
        document.body.style.cursor = 'auto';
      }
      this.emit('moving');
    }
  }

  onMouseUp(e) {
    if (this.disabled) return;
    if (!this.mouseDown) return;
    this.mouseDown = false;
    e.stopPropagation();
    e.preventDefault();
    this.emit('mouse-up');
    if (!this.startPoint.moved) {
      this.emit('end-moving');
      return;
    }
    this.emit('end-dragging');
    if (this.isdrawGraffito) {
      this.drawGraffito();
    } else {
      this.drawRect();
    }
    this.startPoint = null;
  }

  getImageUrl() {
    const scaleFactor = this.scaleFactor;
    const { w, h } = this.selectRect;
    if (w && h) {
      // let imageData = this.bgCtx.getImageData(x * scaleFactor, y * scaleFactor, w * scaleFactor, h * scaleFactor)
      const imageData = this.ctx2.getImageData(0, 0, w * scaleFactor, h * scaleFactor);
      // let imageData = this.bgCtx.getImageData(x * scaleFactor*window.devicePixelRatio, y * scaleFactor*window.devicePixelRatio, w * scaleFactor*window.devicePixelRatio, h * scaleFactor*window.devicePixelRatio)
      const canvas = document.createElement('canvas');
      canvas.width = w * scaleFactor;
      canvas.height = h * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL();
    }
    return '';
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  reset() {
    this.anchors = null;
    this.startPoint = null;
    this.selectRect = null;
    this.startDragRect = null;
    this.isdrawGraffito = false;
    this.drawInfo = [];
    this.selectAnchorIndex = -1;
    this.drawRect();
    this.emit('reset');
  }

  draw() {
    this.isdrawGraffito = true; // 涂鸦
  }
}
