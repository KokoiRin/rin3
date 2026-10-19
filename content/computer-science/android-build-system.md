---
title: Android 构建系统 · 官方文档中文阅读版
summary: 十五篇官方材料，沿项目配置、依赖边界、构建变体、生成代码、任务与缓存到 KMP，理解源码怎样成为应用产物。
reader: /reading/android-build-system/index.html
date: 2026-10-19
lang: zh-CN
topic: Android
tags:
  - ANDROID
  - GRADLE
  - KOTLIN
  - BUILD SYSTEM
---

> **[打开 Android 构建系统阅读网页 →](../../reading/android-build-system/index.html)**

## 先把文件、任务和产物连起来

这组材料沿一次 `assembleDebug` 构建展开：Settings 决定包含哪些项目，构建脚本应用插件并声明依赖，插件注册任务，任务处理当前变体的代码、资源和 Manifest，最终形成应用产物。缓存决定哪些工作需要重做，KMP 再将这些关系扩展到多个平台。

先看[源码怎样成为 APK / AAB](../../reading/android-build-system/build-map.html)，再按下面的顺序阅读。每篇开头都有少量导读，之后是官方正文的中文阅读版，并提供英文对照与原文链接。

## 工程配置

- [01 Settings 文件基础](../../reading/android-build-system/01-settings/index.html)
- [02 构建脚本基础](../../reading/android-build-system/02-build/index.html)
- [03 插件基础](../../reading/android-build-system/03-plugins/index.html)

## 依赖与模块边界

- [04 依赖与依赖管理基础](../../reading/android-build-system/04-dependencies/index.html)
- [05 API 与实现依赖的分离](../../reading/android-build-system/05-api/index.html)（明确节选两节）

## Android 构建与变体

- [06 Android 与 Gradle 构建概览](../../reading/android-build-system/06-android-build/index.html)
- [07 配置构建变体](../../reading/android-build-system/07-variants/index.html)

## 生成代码、任务与缓存

- [08 Kotlin 符号处理 API](../../reading/android-build-system/08-ksp/index.html)
- [09 Gradle 构建生命周期](../../reading/android-build-system/09-lifecycle/index.html)
- [10 增量构建与构建缓存基础](../../reading/android-build-system/10-caching/index.html)
- [11 Kotlin Gradle 插件中的编译与缓存](../../reading/android-build-system/11-kotlin-compilation/index.html)

## Kotlin Multiplatform

- [12 KMP 项目结构基础](../../reading/android-build-system/12-kmp-project/index.html)
- [13 配置 KMP 编译单元](../../reading/android-build-system/13-kmp-compilations/index.html)

## 优化与排障

- [14 使用 R8 启用应用优化](../../reading/android-build-system/14-r8/index.html)
- [15 查看与排查依赖](../../reading/android-build-system/15-dependency-debugging/index.html)

## 阅读范围与使用方式

本系列依据 Gradle、Android Developers 与 Kotlin 官方英文文档制作，为非官方中文阅读版，原文快照日期为 2026-10-19。15 篇材料中，14 篇覆盖对应文章正文全文；第 05 篇仅选译 Java Library Plugin 的 “API and implementation separation” 与 “Recognizing API and implementation dependencies” 两节。代码与图示保留原样，独立导读和版本校注明确标示。

第一轮先读 01–06，再读 07 的构建类型、产品变种与源集，接着读 08–10 和 12–13。11 的编译参数、07 的复杂匹配、14–15 的优化与排障可以在第二轮或实际遇到问题时回查。读完一个阶段，回到熟悉的工程定位一个文件、任务或产物即可，无需先实现自定义 Gradle 插件。

文档中的版本和示例属于抓取时的官方内容，不代表现有工程应直接升级。详见[来源、许可与核对范围](../../reading/android-build-system/NOTICE.html)。
