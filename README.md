# 律行 · 个人工作台

一个 local-first 的个人工作台 PWA：管理「当下、生活、工作、收集、健身、学习、日记」，
可安装到手机主屏幕，离线可用。

## 运行方式

纯静态站点，没有任何构建步骤。用任意静态服务器托管这个目录即可：

```sh
python3 -m http.server 4174
```

然后打开 http://127.0.0.1:4174/

> 注意：要让手机「添加到主屏幕」后能离线使用，必须通过 **HTTPS** 访问
> （浏览器规定 Service Worker 只能在安全上下文注册，localhost 除外）。

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面骨架与各个弹窗 |
| `app.js` | 全部状态与渲染逻辑（含本地存储、变更追踪） |
| `styles.css` | 全部样式，含内嵌字体的 `@font-face` |
| `sw.js` | Service Worker：离线缓存 |
| `manifest.webmanifest` | PWA 安装信息 |
| `fonts/` | 子集化后的内嵌字体（数字 / 中文 / 英文） |

## 字体与授权

内嵌三款 SIL Open Font License 1.1 字体，已按项目实际用字做子集裁剪：

- **Gelasio** — 数字与时间
- **Noto Serif SC（思源宋体）** — 中文（ExtraLight / Light / SemiBold 三档字重）
- **Nanum Myeongjo** — 英文与拉丁字符

授权全文与版权声明见 [`fonts/OFL.txt`](fonts/OFL.txt)。

## 数据

数据保存在浏览器本地的 `localStorage` 中（键名 `luxing-workbench-state-v2`），
不经过任何服务器。设置页与账户页均支持「导出 / 导入数据」进行备份与迁移。
