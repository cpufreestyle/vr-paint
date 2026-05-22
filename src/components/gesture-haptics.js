/* globals AFRAME THREE */
/**
 * WebXR Haptic Feedback Component
 * 在笔刷操作时提供触觉反馈
 *
 * 依赖: paint-controls 组件
 */
AFRAME.registerComponent('haptic-feedback', {
  schema: {
    intensity: { default: 0.5, min: 0, max: 1 },    // 触觉强度
    duration: { default: 50, min: 1, max: 500 },      // 触觉持续时间(ms)
    strokeIntensity: { default: 0.3 },                 // 绘画时的持续反馈强度
    strokePulseMs: { default: 80 },                    // 绘画时的脉冲间隔(ms)
  },

  init: function () {
    var el = this.el;
    var self = this;
    this.gamepad = null;
    this.isPainting = false;
    this.lastPulseTime = 0;

    // 获取 gamepad（WebXR API）
    el.addEventListener('controllerconnected', function (evt) {
      self.findGamepad();
    });

    // 开始绘画：触发一个强脉冲
    document.addEventListener('stroke-started', function (event) {
      if (event.detail.entity !== el) { return; }
      self.isPainting = true;
      self.pulse(self.data.intensity, self.data.duration * 2);
    });

    // 停止绘画
    el.addEventListener('triggerup', function () {
      self.isPainting = false;
    });

    // 按钮按下：弱脉冲
    el.addEventListener('gripdown', function () {
      self.pulse(self.data.intensity * 0.6, self.data.duration);
    });

    el.addEventListener('menudown', function () {
      self.pulse(self.data.intensity * 0.4, self.data.duration);
    });
  },

  findGamepad: function () {
    var self = this;
    var checkInterval = setInterval(function () {
      var controllers = el.sceneEl.renderer.vr.getControllerData && el.sceneEl.renderer.vr.getControllerData();
      // Try WebXR gamepad API
      var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
        if (gp && gp.hapticActuators && gp.hapticActuators.length > 0) {
          self.gamepad = gp;
          clearInterval(checkInterval);
          return;
        }
        // Modern WebXR haptics API
        if (gp && gp.haptics) {
          self.gamepad = gp;
          clearInterval(checkInterval);
          return;
        }
      }
    }, 500);

    // Timeout after 5s
    setTimeout(function () { clearInterval(checkInterval); }, 5000);
  },

  pulse: function (intensity, duration) {
    if (!this.gamepad) { return; }
    intensity = Math.min(1, Math.max(0, intensity));
    duration = duration || this.data.duration;

    // Modern WebXR haptics API (Chrome 90+)
    if (this.gamepad.haptics && this.gamepad.haptics[0]) {
      this.gamepad.haptics[0].pulse(intensity, duration);
    }
    // Legacy hapticActuators API
    else if (this.gamepad.hapticActuators && this.gamepad.hapticActuators[0]) {
      this.gamepad.hapticActuators[0].pulse(intensity, duration);
    }
  },

  tick: function (time) {
    // 绘画时持续提供轻微触觉反馈
    if (this.isPainting && time - this.lastPulseTime > this.data.strokePulseMs) {
      this.pulse(this.data.strokeIntensity, this.data.strokePulseMs);
      this.lastPulseTime = time;
    }
  }
});


/**
 * WebXR Gesture Recognition Component
 * 识别双击、长按、旋转手势
 *
 * 手势映射：
 * - 双击 trigger → 撤销上一笔
 * - 长按 grip (0.5s) → 清除全部
 * - 快速旋转手腕 → 切换笔刷
 */
AFRAME.registerComponent('gesture-recognizer', {
  schema: {
    doubleTapMs: { default: 300 },     // 双击判定间隔(ms)
    longPressMs: { default: 500 },     // 长按判定时间(ms)
    rotationThreshold: { default: 2.5 } // 旋转速度阈值(rad/s)
  },

  init: function () {
    var el = this.el;
    var self = this;

    this.lastTriggerTime = 0;
    this.gripDownTime = 0;
    this.isGripHeld = false;
    this.lastOrientation = null;
    this.rotationSpeed = 0;

    // 双击 trigger → 撤销
    el.addEventListener('triggerdown', function () {
      var now = Date.now();
      if (now - self.lastTriggerTime < self.data.doubleTapMs) {
        // Double tap detected
        el.sceneEl.systems.brush.undo();
        el.emit('gesture-doubletap');
        self.lastTriggerTime = 0; // Reset to prevent triple
      } else {
        self.lastTriggerTime = now;
      }
    });

    // 长按 grip → 清除全部
    el.addEventListener('gripdown', function () {
      self.gripDownTime = Date.now();
      self.isGripHeld = true;
    });

    el.addEventListener('gripup', function () {
      self.isGripHeld = false;
    });

    // 旋转手腕 → 切换笔刷
    this.brushNames = ['cubes', 'line', 'rainbow', 'single-sphere', 'spheres', 'stamp'];
    this.currentBrushIndex = 0;
  },

  tick: function (time, delta) {
    var el = this.el;

    // 检查长按
    if (this.isGripHeld && Date.now() - this.gripDownTime > this.data.longPressMs) {
      // Long press detected: clear all
      el.sceneEl.systems.brush.clear();
      el.emit('gesture-longpress');
      this.isGripHeld = false; // Prevent repeated triggers
    }

    // 检查旋转手势
    var orientation = el.object3D.quaternion;
    if (this.lastOrientation) {
      var angle = this.lastOrientation.angleTo(orientation);
      this.rotationSpeed = angle / (delta / 1000);

      if (this.rotationSpeed > this.data.rotationThreshold && this.lastRotationSpeed &&
          this.lastRotationSpeed > this.data.rotationThreshold) {
        // Sustained fast rotation: switch brush
        this.currentBrushIndex = (this.currentBrushIndex + 1) % this.brushNames.length;
        var brushName = this.brushNames[this.currentBrushIndex];
        el.setAttribute('brush', 'brush', brushName);
        el.emit('gesture-rotate', { brush: brushName });
        this.rotationSpeed = 0; // Debounce
      }
    }
    this.lastRotationSpeed = this.rotationSpeed;
    this.lastOrientation = orientation.clone();
  }
});


/**
 * Smooth Brush Size Controller
 * 优化笔刷大小调整，使用平滑插值而非跳变
 */
AFRAME.registerComponent('smooth-brush-size', {
  schema: {
    speed: { default: 0.008 },       // 调整速度
    smoothing: { default: 0.15 },    // 平滑因子(0=无平滑,1=完全平滑)
    minSize: { default: 0.01 },      // 最小笔刷大小
    maxSize: { default: 1.0 },       // 最大笔刷大小
  },

  init: function () {
    var el = this.el;
    var self = this;
    this.targetSize = null;
    this.currentSmoothed = null;

    el.addEventListener('changeBrushSizeInc', function (evt) {
      if (evt.detail.axis[1] === 0 && evt.detail.axis[3] === 0) { return; }

      var magnitude = evt.detail.axis[1] || evt.detail.axis[3];

      if (self.touchStarted) {
        self.touchStarted = false;
        self.startAxis = (magnitude + 1) / 2;
      }

      var currentAxis = (magnitude + 1) / 2;
      var delta = (self.startAxis - currentAxis) * self.data.speed;

      self.startAxis = currentAxis;

      var currentSize = el.getAttribute('brush').size;
      self.targetSize = THREE.Math.clamp(
        currentSize - delta,
        self.data.minSize,
        self.data.maxSize
      );
    });

    self.touchStarted = false;
    el.addEventListener('startChangeBrushSize', function () {
      self.touchStarted = true;
    });
  },

  tick: function () {
    if (this.targetSize === null) { return; }

    var currentSize = this.el.getAttribute('brush').size;

    // 平滑插值
    if (this.currentSmoothed === null) {
      this.currentSmoothed = currentSize;
    }

    this.currentSmoothed += (this.targetSize - this.currentSmoothed) * (1 - this.data.smoothing);

    // 应用
    this.el.setAttribute('brush', 'size', this.currentSmoothed);
  }
});
