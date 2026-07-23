# 重力小子：联机版

一个面向浏览器的 4 人联机重力翻转跑酷原型。项目基于已提取的 Flash/AVM2 资源与关卡数据重建，采用**服务器权威模拟**：客户端只发送翻转输入，服务器负责移动、世界碰撞、玩家碰撞、淘汰和通关。

当前线上地址：`https://g.anyq.site/`（HTTP 会自动跳转到 HTTPS；Node/WebSocket 仍由本机 3000 端口提供，公网不需要直接暴露该端口）。

## 当前可用功能

- 最多 4 人同房间联机；首位加入者为房主，房主在等待大厅决定何时开始；房间码为 3–12 位字母、数字、`_` 或 `-`。
- 四个角色槽位仍用于房主与排名位置，但每位玩家可在等待大厅独立选择已授权的皮肤；皮肤不会改变碰撞盒、速度或道具效果。比赛开始后，每位玩家均可用空格、点击赛道或按钮翻转自己的重力。
- 加入前可设置最多 12 个字符的昵称；等待大厅以四张等比例角色卡展示昵称与原版人物图。
- 固定 **40 FPS** 权威物理步进，且前进速度会逐渐提高。
- 共享镜头始终以固定屏幕中线为目标；落后者按“当前镜头速度 × 中线距离比例”持续追赶，接近中线时平滑衰减。横向方块只限制坐标，不会清空已计算的追赶速度。
- 世界侧向碰撞会阻挡角色穿入障碍物；起点的原始接触格不会被误判为侧墙。
- 基于 MP02 → MP03 → MP04 → MP02 → MP03 → MP04 碰撞数据拼接的长赛道（终点 `99,892 px`）；中间段已移除原本终点隧道的整组封关墙，只在最终段保留终点。
- 玩家使用统一的 `37 × 28` 窄碰撞盒作为服务器实体（编辑器可调整 28–72 px，并一次应用到全部玩家）：同高度时固定前后顺序、可上下堆叠；同重力会被携带向同侧，反重力相向接触会抵消竖直速度，水平动能不因玩家碰撞而丢失。28 px 低于原始 34 px 世界格，允许角色通过一格高通道。
- 人物使用提取的原版图集；MP02、MP03、MP04 均使用已还原的原版装饰层。
- 中文加载、联机菜单和结算界面；视觉框架取自已提取的原版菜单资源。
- 已接入原版局内背景音乐和重力切换音；控制栏可静音。
- 加入房间有 8 秒超时/断线恢复，不会无限停留在“正在加入房间”。
- 静态资源使用内容指纹缓存：未变 PNG/MP3 不重复下载；赛道 JSON 与未指纹背景通过 ETag 返回 304，不需要手动清浏览器缓存。
- WebSocket 输入校验、同源校验、512 B 帧限制、每连接每秒 20 条消息限制，以及基础 CSP 安全响应头。
- 赛道道具：房间种子决定随机位置，服务器权威处理拾取；当前包含全员翻转一次、3 秒虚化（忽略地图/玩家碰撞但仍受淘汰线约束）和个人加速三种效果。
- 皮肤选择只在大厅同步一次，比赛中的 40 Hz 紧凑状态包不重复携带皮肤字段；服务端仅接受皮肤白名单 ID，拒绝任意图片 URL 或自定义动画参数。

## 快速开始

要求：Node.js 20+。

```bash
npm test
npm run build:data
npm run build:visuals
npm start
```

浏览器打开 `http://127.0.0.1:9500/`，填入同一房间码即可联机测试。默认端口可由环境变量覆盖：

```bash
$env:PORT='9500' # PowerShell
npm start
```

本地调试物理手感时，在地址后加 `?dev=1`；它提供碰撞可视化、实时参数、暂停/慢放和 JSON 导入导出，且只影响当前浏览器的单人模式。完整使用说明见 [开发者模式 v1](docs/developer-mode.md)。

完整的独立赛道编辑器位于 `/dev`，支持碰撞/出生点/终点/淘汰线编辑、原版装饰拖动、撤销重做、本地 GameRoom 单帧/回放、碰撞盒与预测轨迹检查器、可编辑动画帧序列、1–4 人延迟丢包实验和测试包导出。交接流程见 [编辑器交接报告](docs/EDITOR-HANDOVER.md)。

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm test` | Node 内建测试运行器的单元/集成测试。 |
| `npm run test:coverage` | 输出代码覆盖率；当前总分支覆盖率应不低于 80%。 |
| `npm run build:data` | 从三份 `src/data/mp*.json` 生成 `public/data/marathon.json`，并为全部 PNG/MP3 生成 `public/asset-urls.js` 内容指纹。每次变更关卡拼接逻辑或媒体文件后必须运行。 |
| `npm run build:visuals` | 从三份原始装饰清单生成 `public/data/mp0*-visual.json`，并同步所需位图。 |
| `npm start` | 启动 HTTP + WebSocket 服务。 |

## 目录导航

```text
src/
  server.mjs            进程入口，读取 PORT/HOST/LEVEL
  realtime-server.mjs   静态文件、HTTP 安全头、WebSocket 协议与限流
  match-manager.mjs     房间隔离、玩家断开处理
  game-room.mjs         服务器权威物理、碰撞、淘汰、通关
  skin-library.mjs      服务端皮肤白名单与槽位默认皮肤
  level-loader.mjs      MP02/03/04 读取与 marathon 拼接
  data/                 从 SWF 提取出的关卡碰撞数据
public/
  app.js                浏览器 WebSocket 客户端与 Canvas 渲染循环
  skin-library.js       大厅皮肤目录（与服务端白名单保持一致）
  data/                 浏览器使用的赛道和三段原版装饰清单
  assets/               浏览器直接使用的图集、菜单、场景资源
assets/reverse/         原始逆向产物、图像/音频清单、AVM2 反汇编
tools/                  可复现的 AVM2 解码与多人赛道装饰数据处理工具
test/                   物理、WebSocket、渲染和客户端回归测试
docs/AI-HANDOVER.md     给下一位 AI/开发者的完整交接报告
docs/reverse-analysis.md 原始 SWF 的证据账本与逆向结论
```

## 物理与网络概要

浏览器不可信任：它仅向 `/ws` 发送 `join`、`start`、`flip` 和 `ping`。服务器分发房主和角色槽位；仅房主可从 `lobby` 切换至 `playing`，服务器会拒绝等待中的翻转输入。服务器以 `1/40` 秒调用 `GameRoom.tick()`，随后向同一房间的所有连接广播不含内部连接 ID 的状态快照。详细的字段、常量、碰撞规则、部署流程和继续开发建议见 [交接报告](docs/AI-HANDOVER.md)。

## 添加皮肤

目前可选皮肤包括恶魔骑士与四个原版颜色角色。一次新增皮肤必须同时完成以下四项；这是刻意设计的“构建时注册”，避免普通房间成员上传任意文件或让服务器下载任意 URL。

1. 确认素材许可证，并把**已获授权**的 PNG 图集放入 `public/assets/players/`；文件名仅使用英文字母、数字、`-`、`_` 和 `.png`。
2. 在 `public/skin-library.js` 和 `src/skin-library.mjs` 添加相同的 `{ id, name, asset, visual, columns, rows }` 项；`id` 是网络中唯一同步的字段。
3. 在 `public/player-animation.js` 新增匹配的动画视觉配置（单元格宽高、帧序列、FPS、是否有出生变形帧）。**不要**在这里改 `GameRoom` 的碰撞参数。
4. 运行 `npm test`；部署时上传 PNG 和代码，并重启服务。若使用内容指纹资源，再运行 `npm run build:data`。

大厅内的选择会写入浏览器本地存储，下一次加入房间时自动带上该 `skinId`；服务器在大厅内广播选择结果，比赛开始后锁定，避免不同客户端在同一局看到不同角色。

## 部署

生产服务在 Ubuntu 上以普通 Node 进程运行。完整的无停机替换建议、健康检查和回滚步骤见 [AI 交接报告](docs/AI-HANDOVER.md#部署与运维)。不要把服务器密码、私钥、Token 或日志提交到仓库。

## 资源与权利说明

`assets/reverse/` 和 `public/assets/` 含来自原 Flash 游戏的逆向/提取资源，仅用于本项目的兼容性与复刻研究。发布、再分发或商业使用前，仓库所有者必须自行确认拥有相应的著作权授权；无授权时应将仓库设为私有，或移除这些资源并改用自有资源。

蓝色玩家可在本地使用 Zerie 的 `Tiny RPG Character Asset Pack 02` 免费版中的 `Demon_A_Walk.png`。该文件刻意不提交到仓库：按作者许可证，游戏内使用和修改允许，但不能重新分发、转售或上传素材本体。部署前应由已获取该素材包的管理员将其复制到 `public/assets/players/player-demon-a.png`。

项目内的“黑骑士”使用 6 帧自定义走路动画；素材包中的 `Demon_A` 展示名为“恶魔小鬼”。黑骑士的原始绿幕帧仅保存在本机忽略目录 `artifacts/black-knight/source/`；用 `python tools/build-black-knight-skin.py <帧1> ... <帧6>` 可重新生成已提交的透明运行图集 `public/assets/players/player-black-knight.png`。此处理只抠除绿色、最近邻缩放和固定锚点，不会用 AI 重画任何动作。

已经自带透明通道的横向动作条，可通过 `python tools/build-sprite-strip-skin.py <条带> --skin-id <id> --frame-count <数量> --source-cell-width <宽> --source-cell-height <高>` 导入。处理会保存原图、保留原始帧数，并生成统一的 65×77 运行时图集。

## 2026-07-21 交接摘要

- 正确样本为 `assets/reverse/4399-44052-32.swf`；完整导出在 `assets/reverse/ffdec-44052-20260720/`，深度解包结论见 [SWF 深度解包报告](docs/SWF_DEEP_UNPACK_REPORT.md)。这是一款重力翻转跑酷，不是射击游戏。
- 计算规则：世界格坐标为 `worldX = cell.x × 34`、`worldY = 425 − cell.y × 34`；服务器固定每帧 `1/40 s`；共享镜头左缘淘汰线为 `cameraX + 320 − 350`，即 `cameraX − 30`。
- 下一位 AI 必须先读 [AI 交接报告](docs/AI-HANDOVER.md)、[逆向账本](docs/reverse-analysis.md) 与本 README，再运行 `npm test` 和 `npm run build:data`。先补测试，再改变物理或资源生成逻辑。
- 近期上线记录、已确认的线上问题和逐项验证结果见 [运行与交接日志](docs/RUNBOOK-2026-07-21.md)。其中明确区分了 SWF 证据、在线版产品适配和仍待复现的碰撞问题。

## 已知边界 / 下一步

- 三段多人赛道均已恢复原版装饰坐标；视图按 marathon 拼接偏移投影各段原始坐标。
- 玩家互撞已采用稳定的联网适配；仍需用真实 SWF 录屏逐项比对 `inPlayerCollision`、facing 与复杂三/四人接触的细节。
- 原版 0.35 秒输入缓冲、完整动画状态机、检查点、局内排名、完整结算和单人追击敌人尚未迁移。

这些不是隐藏问题：下一步应按交接报告的优先级逐项补齐，并为每一项先增加回归测试。
