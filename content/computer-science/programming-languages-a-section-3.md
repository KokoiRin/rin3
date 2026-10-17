---
title: 编程语言 Part A · 第三节：函数带着环境走：从高阶操作到闭包与回调
summary: 从一个可配置的筛选器出发，追踪函数怎样被传递、怎样保存绑定，以及何时重新计算。熟悉的 Kotlin 用法简短对照，重点放在闭包、折叠、部分应用与共享状态的准确含义。
date: 2026-10-17
lang: zh-CN
topic: Programming Languages / Standard ML
tags:
  - PROGRAMMING LANGUAGES
  - STANDARD ML
  - TYPE SYSTEMS
order: 52
---

> **[打开编程语言第三节中文讲解 →](../../reading/programming-languages-a-section-3/index.html)**

## 函数带着环境走：从高阶操作到闭包与回调

本节沿着一个问题展开：把函数当作值传递以后，它怎样记住外部信息，又怎样与其他函数组合？高阶函数、map 和 filter 的基本用法会紧凑交代，更多篇幅留给词法作用域、闭包与重算、部分应用、共享引用和回调。

你可以直接进入感兴趣的推演；每篇都先交代目标、代码上下文和预期结果。遇到不熟悉的写法，再返回相邻篇目补齐。选学的 Java/C 对照与原课的五段课程动机也保留了独立入口。

本系列依据 Dan Grossman 的 Programming Languages, Part A · Section 3 制作原创中文讲解。覆盖全部 28 段视频，整理为 13 篇，配有 7 组分步图解。

## 可以直接进入的推演

- [闭包在另一个位置调用时，究竟去哪里找变量？](../../reading/programming-languages-a-section-3/03-lexical-scope/index.html)
- [同一段计算放在闭包内外，为什么执行次数不同？](../../reading/programming-languages-a-section-3/04-closure-recomputation/index.html)
- [两个名字或闭包共享同一个引用时，修改会影响谁？](../../reading/programming-languages-a-section-3/09-mutable-references/index.html)

## 让操作成为可以传递的值

- [01 把变化的操作交给函数](../../reading/programming-languages-a-section-3/01-higher-order-functions/index.html)
- [02 临时操作、map 与 filter，怎样写得恰到好处](../../reading/programming-languages-a-section-3/02-anonymous-map-filter/index.html)

## 看清绑定、计算时机与累积顺序

- [03 函数记住哪份配置：词法作用域与闭包](../../reading/programming-languages-a-section-3/03-lexical-scope/index.html)
- [04 闭包保存的是结果，还是以后要重复的计算](../../reading/programming-languages-a-section-3/04-closure-recomputation/index.html)
- [05 fold 的每一步，到底先拿哪个值计算](../../reading/programming-languages-a-section-3/05-fold/index.html)
- [06 把转换、备用方案与管道接成一条过程](../../reading/programming-languages-a-section-3/06-function-composition/index.html)

## 把通用函数逐步变成专用函数

- [07 一次交一项输入，为什么会得到另一个函数](../../reading/programming-languages-a-section-3/07-currying/index.html)
- [08 先固定配置，再留下可复用的专用函数](../../reading/programming-languages-a-section-3/08-partial-application/index.html)

## 把环境带进共享状态、回调和其他语言

- [09 捕获不可变值，与共享一个可变位置](../../reading/programming-languages-a-section-3/09-mutable-references/index.html)
- [10 登记一个回调后，配置和状态会留在哪里](../../reading/programming-languages-a-section-3/10-callbacks-and-docs/index.html)
- [11 不用类，也能把数据和操作封在一起](../../reading/programming-languages-a-section-3/11-closure-adt/index.html)
- [12 没有现成闭包时，环境要怎样一起传过去](../../reading/programming-languages-a-section-3/12-closures-in-java-c/index.html)

## 从具体规则回到语言取舍

- [13 学会这些概念以后，怎样判断语言的取舍](../../reading/programming-languages-a-section-3/13-language-tradeoffs/index.html)

## 阅读衔接与来源

[第一节目录](../../reading/programming-languages-a-section-1/index.html) · [第二节目录](../../reading/programming-languages-a-section-2/index.html) · [第四节目录](../../reading/programming-languages-a-section-4/index.html)

[完整视频映射与出处](../../reading/programming-languages-a-section-3/index.html#sources)。
