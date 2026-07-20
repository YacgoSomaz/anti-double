# AI / 开发者项目交接报告

> 交接版本：2026-07-20。目标是让新的 AI 或开发者在不依赖口头背景的情况下，能够安全运行、验证、部署并继续提高复刻精度。

## 1. 项目目标与当前结论

本项目是“重力小子”风格跑酷游戏的浏览器联机复刻。原工程丢失，因此实现以 Flash SWF 的静态资源、关卡 plist、AVM2 反汇编和可试玩版本为证据源。当前版本是可联机的原型，并非宣称 1:1 完全复刻。

| 领域 | 当前状态 | 可信度 / 备注 |
|---|---|---|
| 多人房间 | 已完成 | 4 人上限、房间隔离、断开后槽位可复用。 |
| 权威网络 | 已完成 | 客户端只传输入；状态由服务器广播。 |
| 固定步进 | 已完成 | 40 FPS，来自原始 SWF stage rate。 |
| 重力翻转/淘汰 | 已完成 | 有反向重力碰撞偏移和越界淘汰。 |
| 加速 | 已完成 | 使用反汇编得出的加速度与上限。 |
| 玩家互撞 | 已完成（近似） | 有分离；未完整复现原始侧向算法。 |
| 长赛道 | 已完成 | MP02→MP03→MP04 拼接，约 49,946 px。 |
| MP02 画面 | 已完成 | 使用原始装饰放置数据。 |
| MP03/MP04 画面 | 待完成 | 有真实碰撞，无原始装饰坐标。 |
| 菜单/过场 | 已完成（中文重制） | 原版背景/结算框架 + 中文 CSS 文本。 |
| 声音、敌人、检查点、排名 | 待完成 | 资源和部分行为证据已提取。 |

## 2. 先运行，再改动

```powershell
cd <repo>
npm test
npm run test:coverage
npm run build:data
npm start
```

使用两个浏览器窗口，输入相同房间码，加入后按空格测试翻转。开始任何物理改动前，阅读 `docs/reverse-analysis.md`，尤其是 `Player` 与 `PlayState` 两段。

验收底线：

1. `npm test` 全绿。
2. `npm run test:coverage` 全局分支覆盖率不低于 80%。
3. 浏览器实际加入房间、按一次空格，确认 WebSocket 状态推进。
4. 若修改赛道拼接或 `src/data`，必须重新执行 `npm run build:data` 并提交生成的 `public/data/marathon.json`。

## 3. 架构与数据流

```text
Canvas 客户端 (public/app.js)
  ├─ join / flip / ping ────────────────┐
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

若未来加入登录、排行榜或保存数据，应改用成熟 WebSocket/HTTP 框架，并新增认证、持久化、TLS 和速率限制策略；不要把这个极简协议直接扩展为公开账号系统。

### 3.2 WebSocket 协议

客户端到服务器：

```json
{ "type": "join", "room": "RUN4" }
{ "type": "flip", "sequence": 1 }
{ "type": "ping" }
```

服务器到客户端：

```json
{ "type": "joined", "room": "RUN4", "player": { "slot": 1, "x": 316, "y": 103 } }
{ "type": "state", "tick": 42, "players": [{ "slot": 1, "x": 420, "y": 103, "gravity": -1 }] }
{ "type": "input_ok", "tick": 42 }
{ "type": "pong" }
{ "type": "error", "error": "stale_input" }
```

内部 UUID 从不放入 `state`，客户端不得自行决定 `x/y/vx/vy`。序列号必须单调增长，避免网络重放导致重复翻转。

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
| 多人碰撞框 | `37 × 48` | 原版多人配置。 |
| X 偏移 | `16` | 原版多人配置。 |
| Y 偏移 | 正重力 `19`，反重力 `9` | 翻转时必须同步更新。 |
| 脚部接触宽度 | `28` | 为防止角色跨过一格窄缝。 |
| 淘汰范围 | `y < -60` 或 `y > 500` | 原版 multiplayer safe range。 |

当前世界碰撞是“脚部/头部跨越接触面”的连续检测，不做前方侧墙阻挡：这是为了避免跑酷向前时错误停在不可见竖直边。若改造完整 AABB 系统，先复现原版 `FlxU.collide` 的分离顺序，再移除这项近似。

玩家互撞在 `#separateOverlappingPlayers()`：仅在两个存活玩家的 AABB 同时重叠时，按竖直轴各退一半并清空纵向速度。这样稳定、不产生客户端回档；但原版还包含回退、`height - 8`、侧向 `1.1 × width` 间隙和重力相关 facing 处理。完整证据见 `docs/reverse-analysis.md`。

### 4.2 关卡坐标和长赛道

原始碰撞列表以 cell 坐标保存。`src/level-loader.mjs` 使用：

```js
world = { cellSize: 34, originY: 425 }
worldX = collider.x * 34
worldY = 425 - collider.y * 34
```

`loadMarathon()` 遍历 MP02、MP03、MP04，以每段最右碰撞 cell + 2 cells 作为下段偏移。`segments` 对象给客户端标明每段的 `startX/endX`；不要写死现有终点坐标。生成浏览器数据的唯一入口是 `build/generate-marathon.mjs`。

MP02 的视觉不是按碰撞格绘制，而是 `public/data/mp02-visual.json` 中的原始对象放置，通过 `public/visual-projection.js` 将 Flixel placement 投影到 640×501 Stage。MP03/04 暂无同等 placement 数据，所以客户端从 `segments[1].startX` 开始画通用方块；不要误以为这代表它们的关卡碰撞是伪造的。

### 4.3 客户端渲染

`public/app.js` 每帧：

1. 轻微外推最近的权威 snapshot（最多 50 ms）。
2. 根据本地槽位的角色推进相机；相机不能因角色短暂卡住而完全停止。
3. 绘制循环城市背景、MP02 装饰/后续通用方块、HUD、玩家。
4. 反重力角色在自身中心翻转，绝不能围绕 Canvas 原点 `scale(1, -1)`。

`public/player-animation.js` 保存图集帧选择，`public/player-render.js` 负责坐标变换。分开它们，避免之后改动画时再次破坏反重力定位。

### 4.4 中文开场与结算

`public/index.html` 的 `#front-screen` 有两个状态：初始 `data-phase="loading"` 显示提取的 loading splash，900 ms 后切换为 `menu`；`#menu-panel` 覆盖原英文标题并以 CSS 显示中文。加入成功后隐藏前屏。玩家 `finished` 或 `eliminated` 时，`showEndScreen()` 显示 `#end-screen`。

菜单源图在 `public/assets/menu/`，文件来自 `assets/reverse/bitmaps/`。若修改或新增菜单资源，请同时确认许可证/授权状态。

## 5. 逆向证据与资源

`assets/reverse/` 不是随意缓存，而是后续高保真工作的证据库：

- `player-avm2-disassembly.txt`：角色构造、动画、加速度、翻转相关字节码。
- `playstate-avm2-disassembly.txt`：世界碰撞、玩家互撞、状态流程的字节码。
- `bitmap-manifest.json`、`sound-manifest.json`：提取资源到原类名的映射。
- `players/`：四种玩家图集；不要缩放或裁掉源图。
- `mp02-collision-overview.png`：MP02 碰撞概览。
- `tools/decode_avm2.py`：重新生成 AVM2 反汇编的读取工具。
- `tools/build-mp02-visual.mjs` + `tools/mp02-visual-source.json`：生成 MP02 装饰清单的可复现工具。

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

当前部署目录：`/home/ubuntu/gswitch-online-20260720`，服务端口 `9500`。进程由 `app.pid` 记录，并以：

```sh
nohup node src/server.mjs > app.log 2>&1 < /dev/null &
echo $! > app.pid
```

启动。健康检查：

```sh
curl -fsS http://127.0.0.1:9500/health
```

安全发布顺序：

1. 本地 `npm test && npm run test:coverage && npm run build:data`。
2. 上传源文件和生成的 `public/data/marathon.json`。
3. 仅在 `app.pid` 对应进程的工作目录确实等于部署目录时才停止它；避免误杀其他服务。
4. 启动新进程，等待至少一秒，再用 `kill -0 $(cat app.pid)` 和 `/health` 验证。
5. 从外部浏览器加入一个新的房间码，确认菜单、WebSocket 和翻转按钮。

凭据不能进入仓库、报告、截图或日志。若改为 HTTPS，请在前置反向代理中处理 TLS，并使客户端自动转为 `wss:`（`app.js` 已按页面协议选择 `ws/wss`）。

## 8. 下一位 AI 的推荐工作顺序

1. **恢复 MP03/MP04 装饰 placement**：在 `PlayState.create` 周围继续解码，生成对应的 visual source 和 JSON；复用 MP02 投影测试。
2. **实现原版完整玩家互撞**：基于 `collideMovingPlayers` 的反汇编写场景化测试（同向、反向、上下接触、侧向接触），再替换当前垂直分离近似。
3. **输入缓冲与动画状态机**：实现 0.35 s click buffer、`switch`/`landing`/`runfast` 帧序列和速度驱动帧率。
4. **排名与真实结算**：服务器计算第 1–4 名和全员结束条件，客户端使用已提取的 result 资源；不要由客户端自行决定名次。
5. **原版音效**：将需要的 MP3 拷入 `public/assets/sounds/`，登记 MIME `audio/mpeg`，增加用户手势后的 Audio 解锁与音量控制。
6. **完善生产托管**：systemd/PM2、TLS 反代、日志轮转、限流指标与自动重启。

每个阶段完成时：更新 README、交接报告、逆向账本、测试和公开部署说明。保持“证据 → 测试 → 实现 → 浏览器验收”的顺序。

## 9. 交接给 AI 的最短提示词

```text
阅读 README.md、docs/AI-HANDOVER.md 与 docs/reverse-analysis.md 后继续开发。
不要把现有实现称为 1:1 完全复刻；区分已上线功能和逆向证据。
先运行 npm test、npm run test:coverage、npm run build:data。
采用 TDD：先写会失败的测试，再改代码；保持总分支覆盖率 >=80%。
物理由 src/game-room.mjs 权威计算，客户端不能发送位置。
下一优先级是恢复 MP03/MP04 视觉坐标，其次是完整复现 collideMovingPlayers。
不要提交 node_modules、日志、artifacts、服务器凭据或 Token。
```
