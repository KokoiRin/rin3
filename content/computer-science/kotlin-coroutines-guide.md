---
title: Kotlin 协程指南 · 中文学习版
summary: 从一次挂起读懂任务的执行顺序、取消与数据交接。十二篇官方指南配有英文对照、代码、原图和章末自测。
reader: /reading/kotlin-coroutines-guide/index.html
date: 2026-11-18
lang: zh-CN
topic: Programming Languages / Kotlin
tags: [KOTLIN, COROUTINES, CONCURRENCY, FLOW]
order: 31
---

**[打开 Kotlin 协程指南中文读本 →](../../reading/kotlin-coroutines-guide/index.html)**

用户打开页面时，程序同时请求两份数据。哪份可以先显示？如果用户在请求结束前离开，谁负责停掉后台工作？这两件小事牵出协程的两条主线。沿着代码看挂起与恢复，可以判断一段工作怎么推进。沿着作用域看父子关系，可以判断这段工作该活多久。

## 从一个可观察的变化开始

1. 读[协程基础](../../reading/kotlin-coroutines-guide/coroutines-basics/index.html)，找出第一个示例在哪里交还线程。
2. 读[组合挂起函数](../../reading/kotlin-coroutines-guide/composing-suspending-functions/index.html)，预测两次各一秒的等待会花多久，再看日志。
3. 读[取消与超时](../../reading/kotlin-coroutines-guide/coroutines-cancellation/index.html)，追踪界面关闭后子任务在哪里停下。

## 把几章连成一个实验

[贡献者加载实战](../../reading/kotlin-coroutines-guide/coroutines-and-channels/index.html)从一个发请求时会冻结的窗口开始。先让窗口在等待期间保持响应，再让多个仓库同时加载，最后让已经收到的数据先出现在屏幕上。配套测试用虚拟时钟检查每批结果出现的时刻。

想观察协程何时挂起，可以跟着 [IDEA 协程调试](../../reading/kotlin-coroutines-guide/debug-coroutines-with-idea/index.html)设置断点。如果关注的是下载进度或界面状态如何连续更新，可以先读 [Flow](../../reading/kotlin-coroutines-guide/coroutines-flow/index.html)，再做 [Flow 调试实验](../../reading/kotlin-coroutines-guide/debug-flow-with-idea/index.html)。

译本按官方目录收录十二篇正文。每章可切换站内英文对照，代码、输出与配图保留原貌，导读和章末自测由 RIN III 补充。原文由 JetBrains 与 Kotlin 贡献者维护，采用 Apache License 2.0。[Kotlin 官方指南](https://kotlinlang.org/docs/coroutines-guide.html)
