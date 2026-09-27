---
lang: zh-CN
title: Mac 基础配置清单（Agent 用）
summary: 记录 zsh、Powerlevel10k、代理、Git 和 macOS 的目标配置，供换机时逐项恢复与检查。
date: 2026-09-06
topic: Personal Workflow
tags: [macOS, zsh, Powerlevel10k, Git]
order: 5
---

## 执行约定

- 先检查现状，合并配置；不覆盖无关设置。
- 使用 `$HOME`；不记录身份、主机名、私人路径、令牌、订阅。
- 账号、代理端口及认证由本人提供或在新机确认。
- 仅配置下列基础项；开发工具、项目、邮箱、同步和备份不在范围内。

## 命令行

- 基础：Command Line Tools、Homebrew、`git`、`gh`、`ripgrep`。
- Shell：zsh；框架：Oh My Zsh；主题：`powerlevel10k/powerlevel10k`。
- `.zprofile`、`.zshrc` 均能加载 Homebrew 环境；PATH 去重。
- 共用路径配置可放 `~/.config/zsh/paths.zsh`；安装位置按新机确定。
- 加载顺序：需交互的初始化 → instant prompt → 基础环境 → 插件列表 → Oh My Zsh → 按键 → `.p10k.zsh` → 个人函数。
- 启动时不执行网络探测、项目任务或启动后台服务。
- 插件：`git`、`zsh-autosuggestions`、`zsh-history-substring-search`、`z`、`extract`、`sudo`、`web-search`、`copypath`、`copyfile`、`colored-man-pages`、`zsh-syntax-highlighting`（末尾）。
- 外部插件来源：`zsh-users` 对应仓库；主题来源：`romkatv/powerlevel10k`。
- 历史搜索：上键 `^[[A` → `history-substring-search-up`；下键 `^[[B` → `history-substring-search-down`。无效时核对终端键码。

## Powerlevel10k（重点保留）

- 向导：Lean、Unicode、Nerd Font、小图标、Few icons、One line、Compact、Concise。
- Instant prompt：`verbose`；Transient prompt：`off`。
- 左侧：`dir vcs prompt_char`；右侧保留 Lean 的条件状态／环境段，不为这些段安装额外工具。
- 先生成完整 `.p10k.zsh`，再核对下表；保留生成的 Git 格式化函数。

以下键均省略 `POWERLEVEL9K_` 前缀：

| 参数 | 目标值 |
| --- | --- |
| `MODE` | `nerdfont-complete` |
| `BACKGROUND` | 空（透明） |
| `ICON_PADDING` / `ICON_BEFORE_CONTENT` | `none` / `true` |
| `PROMPT_ADD_NEWLINE` / `SHOW_RULER` | `false` / `false` |
| `LEFT_PROMPT_ELEMENTS` | `(dir vcs prompt_char)` |
| `PROMPT_CHAR_{OK,ERROR}_VIINS_CONTENT_EXPANSION` | `❯` |
| `PROMPT_CHAR_OK_{VIINS,VICMD,VIVIS,VIOWR}_FOREGROUND` | `76` |
| `PROMPT_CHAR_ERROR_{VIINS,VICMD,VIVIS,VIOWR}_FOREGROUND` | `196` |
| `SHORTEN_STRATEGY` / `SHORTEN_DIR_LENGTH` | `truncate_to_unique` / `1` |
| `DIR_FOREGROUND` / `DIR_SHORTENED_FOREGROUND` / `DIR_ANCHOR_FOREGROUND` | `31` / `103` / `39` |
| `DIR_ANCHOR_BOLD` | `true` |
| `DIR_MAX_LENGTH` | `80` |
| `DIR_MIN_COMMAND_COLUMNS` / `DIR_MIN_COMMAND_COLUMNS_PCT` | `40` / `50` |
| `STATUS_EXTENDED_STATES` | `true` |
| `STATUS_OK` / `STATUS_ERROR` | `false` / `false` |
| `STATUS_OK_PIPE` / `STATUS_ERROR_PIPE` / `STATUS_ERROR_SIGNAL` | `true` / `true` / `true` |
| `COMMAND_EXECUTION_TIME_THRESHOLD` / `COMMAND_EXECUTION_TIME_PRECISION` | `3` / `0` |
| `COMMAND_EXECUTION_TIME_FORMAT` | `d h m s` |
| `INSTANT_PROMPT` / `TRANSIENT_PROMPT` | `verbose` / `off` |

- 终端外观：18 点；背景 `#171717`；前景 `#cacaca`。
- 字体名待定：使用兼容 Nerd Font 的字体，检查 `❯`、图标和列对齐。
- 核对终端调色板；上表颜色数字为索引。

## 网络代理

- 确认本地监听地址、HTTP／SOCKS 协议及实际端口；不固定客户端和订阅。
- 保留函数：`proxy_on [-q]`、`proxy_off`、`proxy_status`。
- `proxy_on`：设置 `http_proxy`、`https_proxy`、`all_proxy`、`no_proxy` 及大写对应变量。
- HTTP／HTTPS 指向本地 HTTP 代理；`all_proxy` 使用支持的 SOCKS5 协议，支持时采用 `socks5h`。
- `no_proxy`：`localhost,127.0.0.1,::1,.local`，按客户端支持情况调整。
- `proxy_off`：撤销上述大小写变量；`proxy_status`：显示当前配置。
- 客户端常驻且已验证连通后，`.zshrc` 末尾使用 `proxy_on -q`。
- 系统代理、终端代理、SSH 代理分别检查。

## Git

- 配置提交身份 `user.name`、`user.email`，值由本人提供。
- 单一身份可设全局；多身份使用仓库局部设置或 `includeIf`。
- 认证：本人完成官方登录或新机 SSH 密钥配置；GitHub 使用 `gh auth login`／`gh auth status`。
- HTTPS 优先沿用终端代理；检查额外 Git 代理覆盖。SSH 按需单独配置。
- 拉取／合并／变基策略遵守仓库约定，不统一强制。

## macOS

| 项目 | 目标值 |
| --- | --- |
| Finder 视图 | 列表 |
| Finder 搜索范围 | 当前文件夹 |
| Finder 侧边栏 | 新机重选常用系统入口；私人收藏不记录、不照搬 |
| Finder 路径栏／状态栏 | 可选，未固定 |
| 桌面图标 | 显示硬盘、已连接服务器；隐藏外置磁盘、可移动介质 |
| Dock | 自动隐藏；大小约 55；显示最近使用的 App |
| 多桌面自动排序 | 关闭按最近使用情况重新排列 |
| 自然滚动 | 关闭 |
| 系统阅读字号 | 16 点；App 可独立调整 |
| 指针 | 适度放大 |
| 键盘重复 | `KeyRepeat=5`；`InitialKeyRepeat=30` |
| 显示器缩放／侧边栏宽度 | 按屏幕调整 |

## 检查项

- [ ] 登录和非登录交互 shell 启动无错，基础命令可用。
- [ ] 主题单行、紧凑；成功／失败颜色、Git 状态、长路径缩短正确。
- [ ] 耗时达到 3 秒显示；历史提示符不折叠；字体无缺字。
- [ ] 输入建议、高亮、上下键历史搜索正常。
- [ ] 代理开关及实际连通正常；Git 身份和授权远端访问正确。
- [ ] Finder、侧边栏、Dock、滚动和字号核对完成。

参考：[macOS Setup Guide](https://sourabhbajaj.com/mac-setup/) · [Powerlevel10k](https://github.com/romkatv/powerlevel10k)
