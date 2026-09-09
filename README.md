# CharlesAcmen — Coast Study No. 01

CharlesAcmen 的个人网站目前是一段可滚动探索的 3D 海岸体验，而不是传统的纵向作品集：访客从海面望向岸边，沿正中的镜头轨迹进入一条黑白铅笔线描的迈阿密街区，最终抵达唯一拥有完整色彩的个人工作室。

这个项目的核心视觉规则只有一句：**外面的世界是白纸上的铅笔草图，工作室是 Charles 的彩色内心世界。** 后续页面、作品、声音和交互都应继续服务这组对比，不再拼接彼此无关的“网页区块”。

## 目前已经实现

- 正对海岸、只向前推进的滚轮镜头；底部滑杆、键盘和触摸拖动也可控制进度。
- 白底、黑色双层线条和少量手绘扰动组成的海岸、道路、棕榈树、车辆与 Art Deco 建筑。
- 参考 Miami Beach Breakwater Hotel 轮廓手工搭建的标志性酒店。
- 加长的彩色工作室和七张社交卡片：WeChat、QQ、Instagram、YouTube、X、Red Note、GitHub。
- 社交卡片使用头像原图作为薄片；悬停时通过顶点着色器产生“一角陷下、对角翘起”的柔性形变。
- WeChat 与 QQ 点击后在头像和二维码之间抽换；其余卡片在新标签页打开主页。
- 两条车道的六辆车随浏览进度前进并循环回到街道另一端。
- 可主动开启的声音场景：平静水浪作为全局底声，六辆车混合三档引擎循环；车辆声音带左右声像和距离衰减。
- 索引抽屉保留项目介绍与作品入口，Three.js 不可用时仍有可访问的文本链接。

## 技术组成

- React 19 + TypeScript
- Vinext（Next.js 兼容层）+ Vite，静态导出
- Three.js：场景图、WebGL 渲染、几何、射线拾取、着色器与空间音频
- 原生 Web Audio / `HTMLMediaElement`：用户手势解锁、流式读取和循环播放
- CSS：页面排版、控制层、响应式布局与 reduced-motion 支持

Three.js 是这段体验的 3D/音频引擎层，但不是整个网站框架。React 管理界面和生命周期，Vinext 管理应用入口与构建，Three.js 只接管画布内部的实时世界。

## 本地运行

需要 Node.js `>=22.13.0`。

```powershell
npm install
npm run dev
```

打开 `http://localhost:3000/#coast`。浏览器自动播放策略要求访客先点击右下角的“开启声音”，网站不会在首次进入时突然播放音频。

常用检查：

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

当前 Windows + Node 24 环境下，Vinext 可能在已经完成编译和静态预渲染后的清理阶段触发 libuv `UV_HANDLE_CLOSING` 断言。遇到时应区分“构建产物已生成”和“进程干净退出”，不要把前者表述为完整构建成功。

## 项目结构

```text
app/
  page.tsx                       React 页面壳、页头与索引抽屉
  coast-scene.tsx                Three.js 生命周期、进度条和声音开关
  globals.css                    页面 UI 与响应式样式
  site-data.ts                   中英文项目文案和项目链接
  coast/
    create-coast-experience.ts   渲染器、摄像机、输入和逐帧循环
    audio-engine.ts              海浪、车辆混音、空间衰减和后台暂停
    model.ts                     海岸世界装配入口
    environment.ts               海、水、街道、棕榈树和鸟
    architecture.ts              通用 Art Deco 建筑
    iconic-hotels.ts             Breakwater Hotel 手工轮廓
    studio.ts                    彩色工作室
    social-card-data.ts          卡片图片、名称、二维码和外链
    social-card.ts               单张 3D 卡片与形变着色器
    social-wall.ts               卡片布局、hover、点击和抽换状态
    traffic.ts                   双向车辆与声音挂点
    scene-kit.ts                 共用几何、材质和释放工具
assets/
  image/                         社交头像、二维码和保留图片
  audio/                         本地流式声音与来源说明
```

更详细的维护边界、性能约束和验收规则见 [`AGENTS.md`](./AGENTS.md)。Claude Code 会通过 [`CLAUDE.md`](./CLAUDE.md) 读取同一套约束。

## 性能约定

- Three.js 客户端动态加载，避免把 WebGL 放进服务端渲染路径。
- 设备像素比封顶为 `1.75`；车辆复用几何和材质。
- 只有鼠标或摄像机变化时才重新做卡片射线检测。
- 页面进入后台时停止 `requestAnimationFrame` 并暂停所有声音。
- 长环境音通过媒体元素流式读取，不用 `AudioLoader` 一次性解码进内存。
- 新增模型前先评估 draw calls、顶点数、贴图尺寸和移动端降级方案。

## 素材与版权

声音文件及其原始页面、作者和许可记录在 [`assets/audio/SOURCES.md`](./assets/audio/SOURCES.md)。当前声音均采用 CC0 素材。车辆声音只追求 GTA 式开放世界街道氛围，不包含从 GTA 或其他商业游戏中提取的原声。

`assets/image/` 中的社交头像、二维码和 `rockstar.png` 由站点所有者提供。`rockstar.png` 当前没有显示在场景中；不要把它误记为本项目品牌或自动重新加入页面。

## 部署

项目按静态站点构建。Cloudflare Pages 可使用：

- Build command：`npm run build`
- Output directory：`dist/client`

当前协作阶段只要求本地预览。除非站点所有者明确提出，不要自行部署、绑定域名或改成需要数据库/服务端状态的架构。
