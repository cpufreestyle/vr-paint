# 🐉 VR 绘画 - 端午节特别版 (VR-Paint Dragon Boat Festival)

端午节主题 VR 绘画 Web 应用，基于 [A-Frame](https://aframe.io/) 开发。

在浏览器中体验虚拟现实绘画，感受端午节的氛围！

**作者**: [MichaelQiu (cpufreestyle)](https://github.com/cpufreestyle)

## 🎊 端午节主题特色

- 🐉 **端午安康 3D 文字** - 漂浮在场景中的祝福文字
- 🍃 **端午节配色** - 端午红、龙舟金、粽叶绿
- 🟢 **粽子 3D 模型** - 立体粽子装饰场景
- 🎨 **主题 UI** - 端午节特色配色方案

## 📸 项目截图

<!-- 在此处添加项目截图 -->
<!-- 截图占位符 - 请替换为实际截图链接 -->
![VR 绘画截图1](assets/images/apainter-banner.png)
![VR 绘画截图2](screenshots/screenshot2.png)

## 🚀 在线演示

- **本地预览**: `python -m http.server 8000` 然后访问 `http://localhost:8000`
- **GitHub 仓库**: [cpufreestyle/vr-paint](https://github.com/cpufreestyle/vr-paint)
- **Gitee 仓库**: [cpufreestyle/vr-paint](https://gitee.com/cpufreestyle/vr-paint)

> **注意**: 需要配备 WebXR 支持的浏览器和 VR 设备（可选）才能获得最佳体验。

## ✨ 功能特性

- 🎨 **多种画笔**: 提供多种笔刷样式，包括渐变、纹理、印章等效果
- 🌈 **丰富色彩**: 支持自定义颜色和透明度
- 💾 **作品保存**: 支持导出 .apa 格式绘画文件
- 📐 **画笔大小调节**: 通过手柄滑动控制画笔粗细
- 🎯 **直观交互**: 基于 VR 控制器的自然绘画体验
- 🌍 **跨平台**: 支持桌面浏览器和 VR 设备
- 📤 **作品分享**: 可将作品分享到社区画廊
- 🔄 **撤销功能**: 支持撤销上一步操作
- 🎨 **自定义环境**: 可更换天空盒和地面纹理

## 📦 本地开发

### 环境要求

- [Node.js](https://nodejs.org/) (建议 v14 或更高版本)
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)
- 支持 WebXR 的浏览器（[查看兼容列表](https://immersiveweb.dev/)）

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/cpufreestyle/vr-paint.git
cd vr-paint

# 安装依赖
npm install

# 启动开发服务器
npm start
```

然后在浏览器中访问 [`http://localhost:8080`](http://localhost:8080)

### 构建生产版本

```bash
npm run build
```

构建输出在 `build/` 目录下。

## 🎮 使用方法

1. 使用支持 WebXR 的浏览器打开应用
2. 如果使用 VR 设备：
   - 佩戴 VR 头显
   - 使用手柄进行绘画
3. 如果使用桌面浏览器：
   - 使用鼠标和键盘模拟 VR 交互
   - WASD 键移动，鼠标控制视角

### 控制器操作

- **触发键**: 按压进行绘画（支持压力感应）
- **触摸板/摇杆**: 上下滑动调节画笔大小
- **菜单键**: 打开主菜单
- **抓取键**: 传送移动

## ⚙️ URL 参数

可以通过 URL 参数自定义应用行为：

- **url** (url): 加载 .apa 格式的绘画文件
- **urljson** (url): 加载 JSON 格式的绘画文件
- **sky** (image url): 更换天空纹理（设为空则移除天空）
- **floor** (image url): 更换地面纹理（设为空则移除）
- **bgcolor** (十六进制颜色，不含 #): 设置背景颜色

示例:
```
https://aframe.io/a-painter/?sky=&floor=http://i.imgur.com/w9BylL0.jpg&bgcolor=24caff&url=https://ucarecdn.com/0b45b93b-e651-42d8-ba49-b2df907575f3/
```

## 🖌️ 画笔 API

### 画笔接口

要创建新画笔，需实现以下接口：

```javascript
BrushInterface.prototype = {
  init: function () {},
  addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {},
  tick: function (timeOffset, delta) {}
};
```

- **init** (): 初始化画笔的变量、材质等

- **addPoint** (*必需*): 每次画笔需要添加新点到笔触时调用
  - **position** (*vector3*): 控制器位置
  - **orientation** (*quaternion*): 控制器方向
  - **pointerPosition** (*vector3*): 画笔开始绘画的指针位置
  - **pressure** (*float[0..1]*): 触发键压力
  - **timestamp** (*int*): 自 A-Painter 启动以来的毫秒数

- **tick** (*可选*): 每帧调用
  - **timeOffset** (*int*): 自 A-Painter 启动以来的毫秒数
  - **delta** (*int*): 自上一帧以来的时间差（毫秒）

**开发提示**: 在开发时，可在 `src/components/brush.js` 顶部将您的画笔设为默认画笔（`brush: {default: 'yourbrush'}`），这样无需每次重新选择。

### 通用数据

每个画笔都会注入一些通用数据，默认值如下：

```javascript
this.data = {
  points: [],
  size: brushSize,
  prevPosition: null,
  prevPointerPosition: null,
  numPoints: 0,
  maxPoints: 1000,
  color: color.clone()
};
```

### 注册新画笔

使用 `AFRAME.registerBrush` 注册新画笔：

```javascript
AFRAME.registerBrush(brushName, brushDefinition, options);
```

参数说明：
- **brushName** (*string*): 唯一的画笔名称
- **brushDefinition** (*object*): 之前定义的画笔实现
- **options** (*object* [可选]):
  - **thumbnail** (*string*): 缩略图文件路径
  - **spacing** (*float*): 调用 `addPoint` 所需的最小距离（米）
  - **maxPoints** (*integer*): 达到该点数后不再调用 `addPoint`

## 📁 文件格式

A-Painter 使用自定义二进制文件格式存储绘画和笔触。

```
string magic ('apainter')
uint16 version (当前为 1)
uint8 num_brushes_used
[num_brushed_used] x {
  string brush_name
}
uint32 num_strokes
[num_strokes] x {
  uint8 brush_index (基于前面的定义顺序)
  float32x3 color (rgb)
  float32 size
  uint32 num_points
  [num_points] x {
    float32x3 position (vector3)
    float32x4 orientation (quaternion)
    float32 intensity
    uint32 timestamp
  }
}

string = uint8 (size) + size * uint8
```

## 📝 许可证

[MIT License](LICENSE)

## 🙏 致谢

- 原始项目: [aframevr/a-painter](https://github.com/aframevr/a-painter) by A-Frame Team
- 基于 [A-Frame](https://aframe.io/) 构建
- 端午节主题改造: MichaelQiu (cpufreestyle)

## 📧 联系方式

- GitHub: [cpufreestyle/vr-paint](https://github.com/cpufreestyle/vr-paint)
- Gitee: [cpufreestyle/vr-paint](https://gitee.com/cpufreestyle/vr-paint)
- 问题反馈: [GitHub Issues](https://github.com/cpufreestyle/vr-paint/issues)

---

**🐉 端午安康！用 ❤️ 和 A-Frame 制作**
