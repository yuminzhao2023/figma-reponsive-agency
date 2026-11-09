# Figma 响应式页面还原练习

基于 [Figma 设计文件](https://www.figma.com/design/r6ykWotH1e5RyXBu7UMNnF/) 的前端还原练习。设计稿由原设计作者创作；本仓库仅记录本轮 React 前端实现，不代表真实客户项目。

## 技术与运行

React、TypeScript、Vite、普通 CSS，使用 npm 管理依赖。

```bash
npm ci
npm run dev
```

在终端输出的本地地址打开页面。检查命令：`npm run typecheck`、`npm run lint`、`npm run build`。

## 本轮范围

实现导航、首屏、品牌介绍和服务卡片，对照 Desktop `1:998`、Tablet `2:451`、Mobile `2:243`。桌面显示 8 张服务卡片；平板和手机默认显示 4 张。

## 素材与交互

- 图片、Logo、菜单和服务图标来自上述 Figma 文件的对应节点，已下载至 `public/assets/`，页面不依赖临时 Figma 链接。
- `View more` 的目标行为在设计中未定义；这里暂定为展开其余 4 张卡片，再次点击可收起。
- 菜单支持键盘操作和 Escape 关闭。`Let’s talk`、`Request a quote` 和菜单中的联系操作显示演示提示，尚未连接联系表单或后端。

## 已知限制

- 设计使用 Proxima Nova；本轮未取得可用于网页的字体文件，浏览器使用系统备用字体。文字宽度、换行和字形会与设计略有差异。
- 本轮仅实现指定的四个区块，后续页面内容尚未接入；因此演示操作不会滚动到设计稿中的联系表单。
- 品牌介绍图片用设计原图及形状素材裁切，浏览器对 SVG mask 的边缘渲染可能与 Figma 略有不同。
