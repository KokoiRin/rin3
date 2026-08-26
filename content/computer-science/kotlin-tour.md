---
title: Kotlin Tour 中文学习版
summary: Kotlin 官方 Tour 初学者与中级 16 章完整中文阅读器，加上面向真实项目的 6 章结构化精读，覆盖 Gradle、集合、泛型、协程、Flow 与 KMP 边界。
date: 2026-08-15
lang: zh-CN
topic: Programming Languages / Kotlin
tags:
  - KOTLIN
  - PROGRAMMING LANGUAGES
  - NULL SAFETY
  - OBJECT-ORIENTED PROGRAMMING
order: 30
---

> **[打开 Kotlin Tour 中文学习网页 →](../../reading/kotlin-tour/index.html)**
>
> 前 16 章完整保留 Kotlin Tour 的正文、代码、练习和参考答案；后 6 章根据官方专题文档整理翻译，专门用来对照真实项目代码学习。

## 学习路线

初学者部分先建立 Kotlin 的语法骨架：

1. [Hello world 与变量](../../reading/kotlin-tour/hello-world/index.html)
2. [基本类型](../../reading/kotlin-tour/basic-types/index.html)
3. [集合](../../reading/kotlin-tour/collections/index.html)
4. [控制流](../../reading/kotlin-tour/control-flow/index.html)
5. [函数](../../reading/kotlin-tour/functions/index.html)
6. [类](../../reading/kotlin-tour/classes/index.html)
7. [空安全](../../reading/kotlin-tour/null-safety/index.html)

中级部分不只是增加语法，而是开始理解 Kotlin 如何组织上下文、扩展行为、抽象类型并控制不确定性：

1. [扩展函数](../../reading/kotlin-tour/extension-functions/index.html)
2. [作用域函数](../../reading/kotlin-tour/scope-functions/index.html)
3. [带接收者的 lambda](../../reading/kotlin-tour/lambdas-with-receiver/index.html)
4. [类与接口](../../reading/kotlin-tour/classes-and-interfaces/index.html)
5. [对象](../../reading/kotlin-tour/objects/index.html)
6. [开放类与特殊类](../../reading/kotlin-tour/open-and-special-classes/index.html)
7. [属性](../../reading/kotlin-tour/properties/index.html)
8. [进阶空安全](../../reading/kotlin-tour/advanced-null-safety/index.html)
9. [库与 API](../../reading/kotlin-tour/libraries-and-apis/index.html)

项目实战篇不是逐段完整翻译，而是从多篇官方资料中提取项目阅读所需的主线、边界和代表性代码：

1. [Kotlin 项目与 Gradle](../../reading/kotlin-tour/project-and-gradle/index.html)
2. [集合式数据处理](../../reading/kotlin-tour/collection-pipelines/index.html)
3. [泛型与型变](../../reading/kotlin-tour/generics-and-variance/index.html)
4. [协程与结构化并发](../../reading/kotlin-tour/coroutines/index.html)
5. [Flow 与状态](../../reading/kotlin-tour/flow-and-state/index.html)
6. [KMP 边界与测试](../../reading/kotlin-tour/kmp-boundaries-and-testing/index.html)

## 每章怎么学

学习 Tour 时，先读页面顶部的“学习主线”，代码尽量自己敲一遍，练习先独立完成再展开答案。进入项目实战篇后，不再另写玩具项目：按每章底部的“下周项目对照”清单，直接在真实代码里搜索、追踪调用并寻找测试证据。

这套内容可以与[《读懂一段 Kotlin 代码》](../reading-kotlin-code/)配合：Tour 负责系统补齐语言知识，原有文章负责把语法放回真实代码中阅读。

## 来源与许可

前 16 章的课程结构与正文来自 [Kotlin 官方 Tour](https://kotlinlang.org/docs/kotlin-tour-welcome.html)；项目实战篇依据 Kotlin 与 Kotlin Multiplatform 官方专题文档结构化整理。这是个人学习使用的非官方中文阅读版；原始文档由 JetBrains 与 Kotlin 贡献者维护，并采用 Apache License 2.0。遇到版本差异时，以官方英文原文为准。
