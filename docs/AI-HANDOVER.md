# AI / 开发者项目交接报告

> 交接版本：2026-07-21。目标是让新的 AI 或开发者在不依赖口头背景的情况下，能够安全运行、验证、部署并继续提高复刻精度。以本报告中“已实现”和“待验证”的分界为准，不要把联网适配层误写成 SWF 原生功能。

> **本次接手前必读更新（2026-07-21）**：请先读 [运行与交接日志](RUNBOOK-2026-07-21.md)。其中记录了共享镜头、中线追赶、客户端预测和线上部署的最新结论；旧段落若与该日志冲突，以该日志和当前测试为准。

## 1. 项目目标与当前结论

本项目是“重力小子”风格跑酷游戏的浏览器联机复刻。原工程丢失，因此实现以 Flash SWF 的静态资源、关卡 plist、AVM2 反汇编和可试玩版本为证据源。当前版本是可联机的原型，并非宣称 1:1 完全复刻。

| 领域 | 当前状态 | 可信度 / 备注 |
|---|---|---|
| 多人房间/等待大厅 | 已完成 | 4 人上限、房间隔离、首位成员为房主；房主离开时下一位成员接手，断开后槽位可复用。 |
| 权威网络 | 已完成 | 客户端只传输入；状态由服务器广播。 |
| 固定步进 | 已完成 | 40 FPS，来自原始 SWF stage rate。 |
| 重力翻转/淘汰 | 已完成 | 有反向重力碰撞偏移；淘汰线等价于原版 `_camera.x - 350`，换算到本项目左缘镜头为 `cameraX - 30`。 |
| 加速 | 已完成 | 使用反汇编得出的加速度与上限。 |
| 玩家互撞 | 已完成（联网稳定适配） | 公共 `37 × 28` 碰撞实体；稳定前后排序、上下堆叠、同/反重力的明确规则。编辑器可统一调整高度，原版回调证据仍保留，三/四人极端情况待录屏比对。 |
| 长赛道 | 已完成 | MP02→MP03→MP04 重复两轮，终点 `99,892 px`；中间段终点封墙和终点前景已去除。 |
| MP02 画面 | 已完成 | 使用原始装饰放置数据。 |
| MP03/MP04 画面 | 已完成 | 使用从原始 plist 恢复的装饰和前景坐标。 |
| 菜单/过场 | 已完成（中文重制） | 原版背景/结算框架 + 中文 CSS 文本。 |
| 声音 | 部分完成 | 菜单音乐、局内音乐、翻转音和就绪音已迁移；其余事件音待接入。 |
| 加入可靠性/缓存 | 已完成 | 加入 8 秒超时会恢复菜单；媒体按内容指纹缓存，JSON 使用 ETag 差分校验。 |
| 敌人、检查点、排名 | 待完成 | 资源和部分行为证据已提取。 |

## 2. 先运行，再改动

```powershell
cd <repo>
npm test
npm run test:coverage
npm run build:data
npm run build:visuals
npm start
```

使用两个浏览器窗口，输入相同房间码，确认等待大厅出现四个角色槽位；由房主点击“开始比赛”后，再按空格测试翻转。开始任何物理改动前，阅读 `docs/reverse-analysis.md`，尤其是 `Player` 与 `PlayState` 两段。

验收底线：

1. `npm test` 全绿。
2. `npm run test:coverage` 全局分支覆盖率不低于 80%。
3. 浏览器实际加入房间、按一次空格，确认 WebSocket 状态推进。
4. 若修改赛道拼接、`src/data` 或 `public/assets`，必须重新执行 `npm run build:data` 并提交生成的 `public/data/marathon.json` 和 `public/asset-urls.js`。
5. 若修改 `tools/mp0*-visual-source.json`，必须重新执行 `npm run build:visuals` 并提交生成的浏览器数据和位图。

## 3. 架构与数据流

```text
Canvas 客户端 (public/app.js)
  ├─ join / start / flip / ping ────────┐
  └─ 只根据服务器 snapshot 进行渲染      │
                                       ▼
HTTP + WebSocket (src/realtime-server.mjs)
                                       │
                                       ▼
MatchManager ── 一个房间一个 GameRoom
                                       │
                                       ▼
GameRoom: 40 FPS、碰撞、淘汰、通关、snapshot
                                       │
                                       ▼
loadLevel('marathon'): MP02 + MP03 + MP04
```

### 3.1 服务端入口

`src/server.mjs` 默认调用 `loadLevel('marathon')`。`PORT` 默认为 `9500`，`HOST` 默认为 `0.0.0.0`。不要在前端写任何服务器凭据；本项目不需要数据库、账号或 Token。

`src/realtime-server.mjs` 同时承担静态文件服务和手写 WebSocket framing。其安全边界包括：

- 静态资源路径使用 `resolve` + `publicDir` 前缀校验，防止目录穿越。
- 限制可服务扩展名；新增音频时必须在 `mimeTypes` 中显式登记。
- `/ws` 必须是 WebSocket v13、同源（无 `Origin` 的非浏览器客户端例外）且携带 key。
- 单帧最大 512 bytes，单连接每秒最多 20 个消息。
- `join` 只接受房间码字符串，`flip` 只接受正整数序列号。
- PNG/MP3 若 URL 带内容指纹 `?v=…`，以一年 immutable 缓存；未指纹媒体和 JSON 带 ETag、`must-revalidate`，未变化时返回 304。不要改回同 URL 的长期 immutable 缓存，否则用户又必须清缓存。

若未来加入登录、排行榜或保存数据，应改用成熟 WebSocket/HTTP 框架，并新增认证、持久化、TLS 和速率限制策略；不要把这个极简协议直接扩展为公开账号系统。

### 3.2 WebSocket 协议

客户端到服务器：

```json
{ "type": "join", "room": "RUN4" }
{ "type": "start" }
{ "type": "flip", "sequence": 1 }
{ "type": "ping" }
```

服务器到客户端：

```json
{ "type": "joined", "room": "RUN4", "player": { "slot": 1, "x": 316, "y": 103 } }
{ "type": "state", "phase": "lobby", "hostSlot": 1, "tick": 0, "players": [{ "slot": 1, "character": "blue", "x": 316, "y": 103 }] }
{ "type": "started", "tick": 0, "hostSlot": 1 }
{ "type": "input_ok", "tick": 42 }
{ "type": "pong" }
{ "type": "error", "error": "stale_input" }
```

内部 UUID 从不放入 `state`，客户端不得自行决定 `x/y/vx/vy`。`GameRoom` 是 `lobby` 时不会推进物理且拒绝翻转；只有 `hostSlot` 对应的连接可发送 `start` 进入 `playing`。`join` 可附带昵称，服务器会去掉控制字符并限制为 12 个字符；昵称与角色槽位一起广播。角色由槽位固定分配：1–4 分别为蓝、绿、黄、红。序列号必须单调增长，避免网络重放导致重复翻转。

## 4. 关键实现细节

### 4.1 `GameRoom` 的物理常量

位置：`src/game-room.mjs`。

| 常量 | 值 | 来源 / 用意 |
|---|---:|---|
| 物理步长上限 | `1 / 40 s` | 原版 40 FPS。 |
| 重力绝对值 | `30000 px/s²` | AVM2 构造函数。 |
| 最大竖直速度 | `320.755 px/s` | AVM2。 |
| 水平加速度 | `7.740191 px/s²` | AVM2 `onSpeed` 相关值。 |
| 最大水平速度 | `769.812 px/s` | 当前恢复阈值。 |
| 多人碰撞框 | `37 × 28`（可调 28–72） | 角色视觉精灵仍按原图绘制，物理框独立缩窄；公共配置写入 `level.playerPhysics`，所有槽位共用。 |
| X 偏移 | `16` | 原版多人配置。 |
| Y 偏移 | 正重力 `19`，反重力 `9` | 翻转时必须同步更新。 |
| 脚部接触宽度 | `28` | 为防止角色跨过一格窄缝。 |
| 淘汰范围 | `y < -60`、`y > 500` 或 `x < cameraX - 30` | 原版 multiplayer safe range；最后一项是原版镜头中心坐标换算后的值。 |

当前世界碰撞是“脚部/头部跨越接触面”加前方侧墙 sweep 的稳定联网适配。侧墙 sweep 仅在角色前缘实际跨过方块左边、且垂直重叠超过半个角色高度时阻挡；翻转后的四个物理帧允许细小外角重叠也阻挡，避免翻转穿墙。`blockedX` 只限制 X 坐标，不能丢弃已经算出的中线追赶速度；相关回归测试在 `test/game-room.test.mjs`。

玩家互撞在 `#separateOverlappingPlayers()`：仅在两个存活玩家的公共 AABB 同时重叠时结算。横向同高接触按上一帧 X（同 X 用槽位）稳定决定前后，后方与前方保持 `1.1 × width` 间隙且不扣水平动能；浅层上下接触可堆叠。相同重力时上/下玩家继承承载方的竖直速度，向同一侧移动；相反重力且相向接触时两者 `vy=0`，保持贴合向前。碰撞宽高由 `level.playerPhysics` 初始化，并可由编辑器一次应用于全部玩家。它是为权威联网防止每帧交换领先者的适配，不应声称是 Flixel 每个边缘细节的 1:1 移植。完整原版回调证据见 `docs/reverse-analysis.md`。

### 4.2 关卡坐标和长赛道

原始碰撞列表以 cell 坐标保存。`src/level-loader.mjs` 使用：

```js
world = { cellSize: 34, originY: 425 }
worldX = collider.x * 34
worldY = 425 - collider.y * 34
```

`loadLevel('marathon')` 当前读取 `src/data/marathon-authored.json`，这是从用户提供的 `gswitch-course-draft (1).json` 提取出的正式关卡源，包含 6 段顺序、每段独立的碰撞修改、出生点、终点和淘汰边界。不要再用旧的 MP02/MP03/MP04 拼接逻辑覆盖它；`segments` 对象给客户端标明每段的 `startX/endX/isFinal`，不要写死终点坐标。`build/generate-marathon.mjs` 会据此生成 `public/data/marathon.json`。

用户草稿不是服务器可自动读取的临时附件：导入后必须落入 `src/data/marathon-authored.json`，再生成浏览器地图并部署。编辑器的 `localStorage` 草稿只用于个人浏览器的临时修改，联机权威地图不会读取它。

三段多人赛道的视觉均不是按碰撞格绘制，而是各自 `public/data/mp02-visual.json`、`mp03-visual.json`、`mp04-visual.json` 中的原始对象放置，通过 `public/visual-projection.js` 将 Flixel placement 投影到 640×501 Stage。客户端再按 `segments` 的 `startX` 拼接投影坐标。`tools/extract_visual_source.py` 从 FFDec 导出的 plist 重建 `tools/mp0*-visual-source.json`，`npm run build:visuals` 生成浏览器数据和需要的位图副本。

### 4.3 客户端渲染

`public/app.js` 每帧：

1. 轻微外推最近的权威 snapshot（最多 50 ms）。
2. 使用服务器下发的共享 `cameraX/cameraSpeed`；客户端不得按本地角色推进镜头。
3. 绘制循环城市背景、三段原版装饰、HUD、玩家。
4. 反重力角色在自身中心翻转，绝不能围绕 Canvas 原点 `scale(1, -1)`。

`public/player-animation.js` 保存图集帧选择，`public/player-render.js` 负责坐标变换。分开它们，避免之后改动画时再次破坏反重力定位。

### 4.4 中文开场与结算

`public/index.html` 的 `#front-screen` 有两个状态：初始 `data-phase="loading"` 显示提取的 loading splash，900 ms 后切换为 `menu`；`#menu-panel` 覆盖原英文标题并以 CSS 显示中文。加入成功后隐藏前屏。玩家 `finished` 或 `eliminated` 时，`showEndScreen()` 显示 `#end-screen`。

菜单源图在 `public/assets/menu/`，文件来自 `assets/reverse/bitmaps/`。`connect()` 会在 8 秒未收到 `joined` 时撤销遮罩、关闭连接并允许重试；保持这一兜底，避免“正在加入房间”永久卡死。若修改或新增菜单资源，请同时确认许可证/授权状态。

## 5. 逆向证据与资源

`assets/reverse/` 不是随意缓存，而是后续高保真工作的证据库：

- `player-avm2-disassembly.txt`：角色构造、动画、加速度、翻转相关字节码。
- `playstate-avm2-disassembly.txt`：世界碰撞、玩家互撞、状态流程的字节码。
- `bitmap-manifest.json`、`sound-manifest.json`：提取资源到原类名的映射。
- `players/`：四种玩家图集；不要缩放或裁掉源图。
- `mp02-collision-overview.png`：MP02 碰撞概览。
- `tools/decode_avm2.py`：重新生成 AVM2 反汇编的读取工具。
- `tools/extract_visual_source.py` + `tools/build-mp02-visual.mjs`：从导出的 plist 生成三段多人赛道装饰清单的可复现工具。

优先把每一个“我猜原版如此”的改动替换成反汇编或真实游戏录屏可验证的结论，并在 `docs/reverse-analysis.md` 追加日期和证据位置。

## 6. 测试策略

测试在 `test/`，使用 Node 自带 `node:test`。当前覆盖：

- `game-room.test.mjs`：生成槽位、翻转序列、反重力天花板、落地、窄缝、淘汰、加速、玩家重叠。
- `level-loader.test.mjs`：原始 MP02 数据和三段 marathon。
- `match-manager.test.mjs` / `realtime-server.test.mjs`：房间隔离、协议输入、恶意帧、同源与限流。
- `browser-app.test.mjs`：静态文件、安全头、菜单结构、长赛道数据入口。
- `camera` / `player-render` / `player-animation` / `visual-projection`：避免视觉回归。

任何新功能须先加入一个失败的测试（RED），实现后全量跑绿（GREEN）。物理与输入改动至少同时具备 unit + 两窗口 Playwright 验收。不要以“肉眼能跑”替代权威服务器测试。

## 7. 部署与运维

当前生产域名为 `g.anyq.site`，应用位于 `/home/ubuntu/gswitch-online`，由 systemd 服务 `gswitch-online` 托管。不要将 IP、账号、密码、私钥或任何 token 写入仓库。健康检查：

```sh
curl -fsS http://127.0.0.1:1000/health
```

安全发布顺序：

1. 本地 `npm test && npm run test:coverage && npm run build:data`。
2. 只上传本次实际改变的文件；不要覆盖服务器上其他应用或把旧备份堆在生产目录。
3. `sudo systemctl restart gswitch-online`，随后确认 `systemctl is-active gswitch-online` 输出 `active`。
4. 先本机检查 `/health`，再使用域名从外部检查；确认反向代理和 WebSocket 都指向当前服务。
5. 从外部浏览器加入一个新的房间码，确认菜单、WebSocket 和翻转按钮。

凭据不能进入仓库、报告、截图或日志。生产环境现已由 Nginx/Let’s Encrypt 处理 HTTPS，证书位于服务器 `/etc/letsencrypt/live/g.anyq.site/`，并由 certbot 定时续期；客户端按页面协议自动使用 `ws/wss`（`app.js` 已支持）。

## 8. 下一位 AI 的推荐工作顺序

1. **用真实 SWF 录屏审计多人互撞**：当前同重力/反重力、堆叠、稳定前后顺序均有测试；下一步补三/四人接触、facing 和 `inPlayerCollision` 的逐帧比较。
2. **输入缓冲与动画状态机**：实现 0.35 s click buffer、`switch`/`landing`/`runfast` 帧序列和速度驱动帧率。
3. **排名与真实结算**：服务器计算第 1–4 名和全员结束条件，客户端使用已提取的 result 资源；不要由客户端自行决定名次。
4. **补齐事件音效/检查点/单人敌人**：素材已在 FFDec 导出目录中；每迁移一项先写行为测试，敌人只属于单人模式。
5. **完善生产托管**：systemd/PM2、TLS 反代、日志轮转、限流指标与自动重启。

每个阶段完成时：更新 README、交接报告、逆向账本、测试和公开部署说明。保持“证据 → 测试 → 实现 → 浏览器验收”的顺序。

## 9. 交接给 AI 的最短提示词

```text
阅读 README.md、docs/AI-HANDOVER.md 与 docs/reverse-analysis.md 后继续开发。
不要把现有实现称为 1:1 完全复刻；区分已上线功能和逆向证据。
先运行 npm test、npm run test:coverage、npm run build:data。
采用 TDD：先写会失败的测试，再改代码；保持总分支覆盖率 >=80%。
物理由 src/game-room.mjs 权威计算，客户端不能发送位置。
下一优先级是 SWF 实机互撞审计，其次是输入缓冲和动画状态机。
不要提交 node_modules、日志、artifacts、服务器凭据或 Token。
```
