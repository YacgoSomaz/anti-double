# 《反重力双英》SWF 深度解包报告

> 本报告只分析 4399 条目 `44052_1` 对应的原始跑酷游戏本体；它不是其他项目中的 SWF，也不把其他文件的类、玩法或素材作为本项目依据。

## 1. 样本与可复核性

| 项目 | 已核验值 |
|---|---|
| 4399 页面 | <https://www.4399.com/flash/44052_1.htm> |
| 页面内 SWF 路径 | `https://s8.4399.com/4399swf/upload_swf/ftp2/liwen/20101209/32.swf` |
| 本地样本 | `assets/reverse/4399-44052-32.swf` |
| SHA-256 | `D82DB5C680932844D80CB152C131C7B6EA07555A058562122BBCC1A4BA2D645F` |
| 压缩大小 / 解压大小 | 9,915,247 / 15,832,130 bytes |
| 签名、版本 | `CWS`（ZLIB 压缩 SWF），Flash 10 |
| Stage | 640 × 501 px |
| 帧率 | 40 FPS（模拟基准步长为 1/40 秒） |
| 运行时 | ActionScript 3 / AVM2，Flixel |

已用 FFDec 26.1.0 完整导出脚本、SymbolClass、声音和元数据到：

`assets/reverse/ffdec-44052-20260720/`

导出清单为 402 个 AS3 脚本、304 个 `DefineBitsLossless2` 位图标签、31 个 `DefineSound` 音频标签，以及两个 `DoABC` 代码块。导出目录是证据副本，不是浏览器运行时的依赖。

## 2. 这是哪一种游戏

主类与资源名明确为 `GSwitch`、`com.miniclip.GSwitch.PlayState`、`Player`、`Enemy`、`MenuState` 和 `OverlapArea`。游戏是横向自动前进、通过切换重力在上下表面跑动的跑酷竞速；没有武器、开火或选敌玩法。

运行链路为：

```text
Flash 预加载器 → GSwitch → MenuState → PlayState
                                      ├─ 单人：Player + Enemy 追逐
                                      └─ 本地多人：2–4 个 Player + 关卡 MP02/MP03/MP04
```

`Enemy` 只存在于单人追逐模式；多人模式由多个 `Player` 共同在同一赛道上竞速。因此联网版应把它理解为“本地多人输入改为网络输入”，而不是加入对战射击或 AI 系统。

## 3. 菜单、角色和原始按键

`MenuState.as` 有 `onPlayMulti`、`onPlayMulti2`、`onPlayMulti3`、`onPlayMulti4` 四个入口，依次把 `FlxG.numPlayers` 设为 2、2、3、4；第一个入口先显示“选择玩家数量”的界面。四个角色并不是随机生成：

| 玩家 | 图集 | 原始重力状态 | 原始按键 |
|---|---|---|---|
| P1 | 蓝色 `Player_ImgPlayer` | 向下 | 鼠标 / `X` / `Space` |
| P2 | 绿色 `Player_ImgPlayerGreen` | 向上 | `M` |
| P3 | 黄色 `Player_ImgPlayerYellow` | 向下 | `P` |
| P4 | 红色 `Player_ImgPlayerRed` | 向上 | `Q` |

联网时每位用户只应提交自己的“切换重力”输入。服务器分配 P1–P4 槽位、颜色、出生点和初始重力；所有客户端从同一权威快照渲染。这既保留原作 4 人角色，也避免所有人共享 `Space` 的冲突。

## 4. 玩家精确状态与物理证据

`Player.as` 直接给出如下构造值：

| 项目 | 原始值 |
|---|---:|
| 逻辑动画帧 | 65 × 77 px |
| 单人碰撞盒 | 42 × 48 px，偏移 `(10, 17)` |
| 多人碰撞盒 | 37 × 48 px，偏移 `(16, 19)` |
| 多人翻转后的 Y 偏移 | 9 px（正常为 19 px） |
| 重力加速度绝对值 | 30,000 px/s² |
| 竖直速度上限 | 320.755 px/s |
| 水平加速度 | 7.740191 px/s²（更新中也出现 6.9440061776 分支） |
| 起跑速度 | 211.6983 px/s |
| 空中输入缓冲 | 0.35 s |
| `runfast` 阈值 | 513.208 px/s |

一次按键是边沿触发的 `SwitchGravity()`：切换 `acceleration.y` 正负、翻转朝向与角度、切换碰撞 Y 偏移，并播放切换音效与粒子。若玩家在空中按下，原作把请求保留 0.35 秒；只要在此期间触及表面，就立即翻转。它不是跳跃，也不消耗动能。

原始动画帧序列如下，供浏览器精确渲染使用：

| 状态 | 帧 |
|---|---|
| `run` | 0–12 |
| `fall` | 19–22，再 13–18 |
| `morph` | 23–44 |
| `death` | 45–51 |
| `switch` | 60、62、64、66、70、72、74 |
| `push` | 52–58 |
| `landing` | 76、78、80、82、84、86 |
| `slide` | 89 |
| `runfast` | 91–99 |

导出的四张源图集是 975 × 693 px。AS3 的 `loadGraphic(..., 65, 77)` 将它们切为 **15 × 9 个 65 × 77 源格**；这既是运行时逻辑动画帧，也是浏览器应使用的源裁切尺寸。此前的 13 × 11 / 75 × 63 切法会跨过相邻帧，造成断裂人物，现已废弃。

## 5. 碰撞、边界与“卡住”的真实来源

`PlayState.update()` 的关键顺序已从 AS3 反编译结果核验：

1. 更新并剔除关卡固定方块。
2. 调用 `FlxU.collide(_blocks, _objects)`，处理玩家与世界方块的实体碰撞。
3. 玩家和单人敌人分别与 `OverlapArea` 触发区相交。
4. 多人模式先将每位玩家的 `inPlayerCollision` 清零，再连续十次调用 `FlxU.overlap(_players, _players, collideMovingPlayers)`。

`collideMovingPlayers()` 不是装饰效果：它先按 `velocity.y * elapsed` 回退，使用 `height - 8` 判断纵向重叠，再恢复位置并做垂直或水平分离。并排相撞会留下 `1.1 × 玩家宽度` 的间隔；反向竖直接触会把两人的竖直速度归零。因此原作中“被挡住”“回弹一点”可能来自方块实体碰撞或十轮玩家互撞，而不是空气墙。

边界逻辑也与横向方块不同：多人玩家离开相机安全 X 区域，或离开 Y 范围 `-60…500` 时会被淘汰。横向障碍本身应当是实体阻挡，并不应把它错误实现成慢动作或淘汰。

## 6. 关卡与可视资源

`PlayState` 内嵌 11 个 plist 资源：

```text
sp1plist … sp7plist        单人关卡
mp02plist / mp03plist / mp04plist  多人赛道
creditsplist                制作名单场景
```

多人关卡的直接解析结果：

| 赛道 | 碰撞单元 | 已知内容 |
|---|---:|---|
| MP02 | 1,017 | 4 个出生点、反传送门成对、终点回调 |
| MP03 | 1,062 | 4 个出生点、反传送门成对、终点回调 |
| MP04 | 1,150 | 4 个出生点、反传送门成对、终点回调 |

这些 plist 在原作中先被转换为固定 `FlxObject` 几何体，再进入世界碰撞流程；不能把导出的记录简单当成固定 48 px 格子图。单人关卡还包含 `EndlessSPEntryPoint`、`ShipSpawnerEntity`、相机速度/震动、透明度与音效触发等事件。

SymbolClass 还确认了赛道组件，例如 `ImgcollisionBlock`、`ImgAcceleratorSingle`、`ImgCheckpoint*`、`ImgBackground*`、`ImgBridge*`、`ImgGlassTunnel*`、`ImgBlue/Orange/Yellow*`。这些说明视觉素材与物理方块是两层数据：前者负责显示，后者负责真正碰撞。

## 7. 声音

原始 SWF 含 31 段 MP3。核心运行声音包括：

```text
SndMenuMusic, SndMusic, SndSwitch, SndLand, SndSlide,
SndAccelLoop, SndAccelTrigger, SndSonicBoomLoop, SndCaught,
SndLevelCleared, SndWin, SndMorph, SndPopupAppear/Disappear
```

此外有菜单点击音，以及 `Player_*`、`Enemy_*` 的落地、受伤、卡住和爆炸音。它们已在 `assets/reverse/ffdec-44052-20260720/` 的 MP3 导出物中保留，浏览器版本应以用户首次手势后解锁音频的方式加载，而不是等进比赛后才发现资源未就绪。

## 8. 当前联网版的实现边界

从 SWF 能直接证明的是本地 2–4 人的规则、固定 40 FPS、物理常数、碰撞次序和素材；房间、房主、加载准备状态、WebSocket 同步与服务器权威判定都属于联网版新增适配层。

要做到接近原作，优先级应为：

1. 在大厅预加载当前赛道、四张角色图集和必要音频；所有就绪后才让房主开始。
2. 服务器以 40 Hz 固定步进，保存并广播权威位置、速度、重力、存活和排名；客户端只上报自己的切换意图。
3. 使用原始 `FlxU.collide` 等价的方块实体碰撞，以及十轮玩家相交分离；不要用减速代替横向阻挡。
4. 区分“接触横向障碍”和“越出相机安全边界”：前者阻挡，后者淘汰。
5. 补齐 0.35 秒输入缓冲、完整动画状态、终点/轮次/积分和声音触发。

## 9. 复现导出与审计命令

以下命令只读取 SWF 并写入导出目录：

```powershell
$java = 'F:\新工作区\private-tools\jdk21\bin\java.exe'
$ffdec = 'F:\新工作区\private-tools\ffdec\ffdec-cli.jar'
$swf = 'F:\新工作区\anti-double\assets\reverse\4399-44052-32.swf'
$out = 'F:\新工作区\anti-double\assets\reverse\ffdec-44052-20260720'

& $java -Xmx4g -jar $ffdec -export script,symbolClass,text,sound $out $swf
& $java -jar $ffdec -header $swf
& $java -jar $ffdec -dumpSWF $swf
& $java -jar $ffdec -dumpAS3 $swf
Get-FileHash $swf -Algorithm SHA256
```

进一步的低层 AVM2 证据保存在 `assets/reverse/player-avm2-disassembly.txt`、`assets/reverse/playstate-avm2-disassembly.txt`；实现对应关系与待办见 `docs/reverse-analysis.md`。本报告中的数字、类名和流程均可在上述正确样本及导出物中复查。
