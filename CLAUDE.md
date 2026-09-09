# CLAUDE.md

@AGENTS.md

这是 Claude Code 在本仓库的入口。`AGENTS.md` 是完整且权威的产品、架构、性能和验证契约；请先读完它和 `README.md`，不要在本文件复制并维护另一套规则。

## 一分钟上下文

- 项目：CharlesAcmen 的滚轮驱动 3D 个人网站。
- 叙事：白纸黑铅笔的 Miami Beach 世界，包围唯一彩色的个人工作室。
- 前端：React 19 + TypeScript + Vinext/Vite 静态站点。
- 实时层：Three.js 管理 WebGL 场景、raycast、着色器和空间音频。
- 关键入口：`app/coast/create-coast-experience.ts`。
- 世界装配：`app/coast/model.ts`。
- React 桥：`app/coast-scene.tsx`。
- 声音：`app/coast/audio-engine.ts`，默认开启、受限时手势重试、媒体流式循环、车辆距离衰减与合成喇叭。
- 海浪：`app/coast/surf.ts`，由浏览进度驱动，不是独立时间动画。
- 显示器：`app/coast/studio-display.ts`，Three.js 外壳 + 延迟加载的 CSS3D YouTube iframe。
- 内容：`app/site-data.ts` 与 `app/coast/social-card-data.ts`。

## 开始和结束任务

开始前：

```powershell
git status --short
```

完成后至少运行：

```powershell
npx tsc --noEmit
npm run lint
```

不要把大段场景逻辑塞进 TSX，不要改变“外部线描 / 工作室彩色”的统一风格，不要使用从 GTA 或其他商业游戏提取的资产。当前只需本地预览；除非用户明确要求，不要部署、打开浏览器替用户验收或提交 Git。
