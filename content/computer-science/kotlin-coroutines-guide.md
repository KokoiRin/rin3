---
title: Kotlin 协程指南 · 中文学习版
summary: 从一次挂起读懂任务的执行顺序、取消与数据交接。十二篇官方教程可切换严格译稿和英文原文，代码注释提供中文翻译。
reader: /reading/kotlin-coroutines-guide/index.html
date: 2026-11-18
lang: zh-CN
topic: Programming Languages / Kotlin
tags: [KOTLIN, COROUTINES, CONCURRENCY, FLOW]
order: 31
---

**[打开 Kotlin 协程指南中文读本 →](../../reading/kotlin-coroutines-guide/index.html)**

从[协程基础](../../reading/kotlin-coroutines-guide/coroutines-basics/index.html)开始。第一段示例只打印一句问候。随后加入 `delay()`，观察协程等待时线程能做什么，再看 `launch()` 怎样启动第二项工作。

[组合挂起函数](../../reading/kotlin-coroutines-guide/composing-suspending-functions/index.html)用两个各等一秒的函数计算 13 + 29。结果始终是 42，先后调用还是并发启动，决定了要等多久。[取消与超时](../../reading/kotlin-coroutines-guide/coroutines-cancellation/index.html)接着讲一个实际问题：窗口已经关闭，怎样让还在运行的任务停下？

想跟着做一个完整项目，可以读[协程与通道实战](../../reading/kotlin-coroutines-guide/coroutines-and-channels/index.html)。它从一个会冻结的桌面窗口开始，逐步改到多个仓库并发加载，每收到一批贡献者就更新一次名单。

每页都可以切换到同一篇的严格译稿或英文原文。中文示例翻译了说明性注释，保留了程序中的字符串，便于对照运行输出。额外背景标为「编者注」，章末自测围绕本章的官方示例。原文由 JetBrains 与 Kotlin 贡献者维护。[严格译稿目录](../../reading/kotlin-coroutines-guide/literal.html) · [Kotlin 官方指南](https://kotlinlang.org/docs/coroutines-guide.html)
