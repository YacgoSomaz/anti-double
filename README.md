# 重力小子：联机版

一个面向浏览器的 4 人联机重力翻转跑酷原型。项目基于已提取的 Flash/AVM2 资源与关卡数据重建，采用**服务器权威模拟**：客户端只发送翻转输入，服务器负责移动、世界碰撞、玩家碰撞、淘汰和通关。

当前线上地址：`http://119.29.150.211:9500/`

## 当前可用功能

- 最多 4 人同房间联机；房间码为 3–12 位字母、数字、`_` 或 `-`。
- 空格、点击赛道或按钮可翻转重力。
- 固定 **40 FPS** 权威物理步进，且前进速度会逐渐提高。
- 基于 MP02、MP03、MP04 碰撞数据拼接的长赛道（终点约 `49,946 px`）。
- 玩家间重叠会由服务器分离，不会互相穿透。
- 人物使用提取的原版图集；MP02 使用已还原的原版装饰层。
- 中文加载、联机菜单和结算界面；视觉框架取自已提取的原版菜单资源。
- WebSocket 输入校验、同源校验、512 B 帧限制、每连接每秒 20 条消息限制，以及基础 CSP 安全响应头。

## 快速开始

要求：Node.js 20+。

```bash
npm test
npm run build:data
npm start
```

浏览器打开 `http://127.0.0.1:9500/`，填入同一房间码即可联机测试。默认端口可由环境变量覆盖：

```bash
$env:PORT='9500' # PowerShell
npm start
```

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm test` | Node 内建测试运行器的单元/集成测试。 |
| `npm run test:coverage` | 输出代码覆盖率；当前总分支覆盖率应不低于 80%。 |
| `npm run build:data` | 从三份 `src/data/mp*.json` 生成 `public/data/marathon.json`。每次变更关卡拼接逻辑后必须运行。 |
| `npm start` | 启动 HTTP + WebSocket 服务。 |

## 目录导航

```text
src/
  server.mjs            进程入口，读取 PORT/HOST/LEVEL
  realtime-server.mjs   静态文件、HTTP 安全头、WebSocket 协议与限流
  match-manager.mjs     房间隔离、玩家断开处理
  game-room.mjs         服务器权威物理、碰撞、淘汰、通关
  level-loader.mjs      MP02/03/04 读取与 marathon 拼接
  data/                 从 SWF 提取出的关卡碰撞数据
public/
  app.js                浏览器 WebSocket 客户端与 Canvas 渲染循环
  data/                 浏览器使用的赛道和 MP02 装饰清单
  assets/               浏览器直接使用的图集、菜单、场景资源
assets/reverse/         原始逆向产物、图像/音频清单、AVM2 反汇编
tools/                  可复现的 AVM2 解码与 MP02 装饰数据处理工具
test/                   物理、WebSocket、渲染和客户端回归测试
docs/AI-HANDOVER.md     给下一位 AI/开发者的完整交接报告
docs/reverse-analysis.md 原始 SWF 的证据账本与逆向结论
```

## 物理与网络概要

浏览器不可信任：它仅向 `/ws` 发送 `join`、`flip` 和 `ping`。服务器以 `1/40` 秒调用 `GameRoom.tick()`，随后向同一房间的所有连接广播不含内部连接 ID 的状态快照。详细的字段、常量、碰撞规则、部署流程和继续开发建议见 [交接报告](docs/AI-HANDOVER.md)。

## 部署

生产服务在 Ubuntu 上以普通 Node 进程运行。完整的无停机替换建议、健康检查和回滚步骤见 [AI 交接报告](docs/AI-HANDOVER.md#部署与运维)。不要把服务器密码、私钥、Token 或日志提交到仓库。

## 资源与权利说明

`assets/reverse/` 和 `public/assets/` 含来自原 Flash 游戏的逆向/提取资源，仅用于本项目的兼容性与复刻研究。发布、再分发或商业使用前，仓库所有者必须自行确认拥有相应的著作权授权；无授权时应将仓库设为私有，或移除这些资源并改用自有资源。

## 已知边界

- MP02 已有原版装饰坐标；MP03 与 MP04 目前使用真实碰撞数据加通用方块绘制，尚未恢复两段的原始装饰摆放。
- 玩家互撞已经可用，但当前采用稳定的垂直分离近似；原版的完整侧向间距与回退算法仍记录在逆向文档中。
- 原版的音效、追击敌人、检查点、局内排名和完整状态机尚未接入。

这些不是隐藏问题：下一步应按交接报告的优先级逐项补齐，并为每一项先增加回归测试。
