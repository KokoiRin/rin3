---
title: Android 原生基础桥接课
summary: 接在 Kotlin Tour Intermediate 之后，用 8 章建立 Android 应用模型、生命周期、状态恢复、返回栈、主线程、View 与 ViewModel 的完整心智地图。
date: 2026-08-24
lang: zh-CN
topic: Mobile Development / Android
tags:
  - ANDROID
  - KOTLIN
  - APP MODEL
  - LIFECYCLE
order: 31
---

> **[打开 8 章中文学习网页 →](../../reading/android-native-bridge/index.html)**
>
> 这套课承接 [Kotlin Tour 中文学习版](../kotlin-tour/)。它不重复 Kotlin 语法，而是回答一个更靠近 Android 的问题：系统怎样找到、创建、暂停、重建并恢复你的 Kotlin 代码和页面？

## 为什么先学这 8 章

Kotlin Tour 解决的是“这段语言怎样表达”；Android 原生开发还需要另一张地图：应用没有唯一 `main()` 入口，页面实例会被系统重建，用户看到的返回路径由 Task 和 back stack 组织，界面代码还受主线程、View 树和状态所有权约束。

这套桥接课先把这些机制连成一条业务链，再进入 Android Basics with Compose。这样学生命周期、ViewModel、Fragment、Repository 和 Room 时，不会只记住 API 名称。

## 8 章路线

1. [Android 应用是怎么运行起来的](../../reading/android-native-bridge/chapter-1/)
2. [项目结构、Manifest 与资源](../../reading/android-native-bridge/chapter-2/)
3. [Activity 与生命周期](../../reading/android-native-bridge/chapter-3/)
4. [配置变化、进程死亡与状态恢复](../../reading/android-native-bridge/chapter-4/)
5. [Intent、Task 与返回栈](../../reading/android-native-bridge/chapter-5/)
6. [主线程、Looper、MessageQueue 与 Handler](../../reading/android-native-bridge/chapter-6/)
7. [View 树、事件分发与绘制](../../reading/android-native-bridge/chapter-7/)
8. [ViewModel、UI State 与状态所有权](../../reading/android-native-bridge/chapter-8/)

## 每章怎么完成

不要以“网页看完”作为完成。每章都要求留下四类证据：本人合上正文后的回答、独立敲出的最小代码、一个真实项目映射，以及不看稿的两分钟解释。练习答案默认折叠，先写再展开。

## 桥接课之后

按已确定路线继续：Android Basics with Compose Unit 4 Pathway 1 → Unit 8 Pathway 1 → Unit 5 → Unit 6。Unit 1、Unit 2 中重复 Kotlin Tour 的内容不再整段重学；独立编码暴露具体缺口时，再定点回补相应 Codelab。

## 来源边界

本课只使用 [Android Developers](https://developer.android.com/) 作为 Android 行为的事实源，正文是面向学习目标重新组织的中文讲解，不声称逐段翻译官方文档。每章末尾列出对应官方页面与最后核对日期；平台行为有变化时，以官方原文为准。
