---
title: 编程语言 Part A · 第二周：数据与模式
summary: 接续第一周，把 Dan Grossman Section 2 的 22 段视频整理为 13 篇中文讲解，连起组合类型、模式匹配、类型推导、异常与尾递归。
date: 2026-10-17
lang: zh-CN
topic: Programming Languages / Standard ML
tags:
  - PROGRAMMING LANGUAGES
  - STANDARD ML
  - TYPE SYSTEMS
order: 51
---

> **[打开编程语言第二周中文讲解 →](../../reading/programming-languages-a-section-2/index.html)**

## 从数据的形状，理解程序的写法

第一周认识了函数、列表与递归，第二周进一步研究：数据有几种组合方式？程序怎样沿这些结构拆开数据？类型检查又如何约束每一步？最后再分清递归做的总工作量，与调用过程中保留了多少等待。

本系列依据 Dan Grossman 的 Programming Languages, Part A · Section 2 制作原创中文讲解，覆盖全部 22 个视频主题，合并为 13 篇。正文先说具体问题和输入输出，再逐层解释规则，配有可逐步查看的图解。

## 先把数据的形状设计清楚

- [01 先设计数据的形状：记录与元组](../../reading/programming-languages-a-section-2/01-data-design/index.html)
- [02 列清几种可能，再用 case 逐一处理](../../reading/programming-languages-a-section-2/02-choices-and-case/index.html)
- [03 把算式存成一棵树，再沿树计算](../../reading/programming-languages-a-section-2/03-recursive-datatypes/index.html)
- [04 type：给已有类型起一个名字](../../reading/programming-languages-a-section-2/04-type-synonyms/index.html)
- [05 list、option 和类型参数，原来是一套规则](../../reading/programming-languages-a-section-2/05-polymorphic-datatypes/index.html)

## 沿着数据结构拆开、匹配和检查

- [06 用模式拆开记录、元组和函数输入](../../reading/programming-languages-a-section-2/06-product-patterns/index.html)
- [07 类型推导：从代码约束里找出答案](../../reading/programming-languages-a-section-2/07-type-inference/index.html)
- [08 嵌套模式：把几层结构一起写清楚](../../reading/programming-languages-a-section-2/08-nested-patterns/index.html)
- [09 模式究竟怎样匹配，多分支函数怎样读](../../reading/programming-languages-a-section-2/09-matching-rules/index.html)

## 看清失败和递归怎样改变执行过程

- [10 异常：这次计算无法交回答案时](../../reading/programming-languages-a-section-2/10-exceptions/index.html)
- [11 递归之后还有没有事情要做](../../reading/programming-languages-a-section-2/11-tail-calls/index.html)
- [12 累加器：把等待的工作带到下一步](../../reading/programming-languages-a-section-2/12-accumulators/index.html)
- [13 尾递归的取舍：空间、工作量与可读性](../../reading/programming-languages-a-section-2/13-tail-recursion-perspective/index.html)

## 阅读衔接与原课程

[第一周目录](../../reading/programming-languages-a-section-1/index.html)保留基础概念与环境图解；本周沿用这些知识，集中解释新的组合规则与处理方式。[视频映射和出处](../../reading/programming-languages-a-section-2/index.html#sources)列出具体来源。

## 接着阅读第三、第四节

[第三节：函数、闭包与回调](../../reading/programming-languages-a-section-3/index.html) · [第四节：类型推导、模块与程序等价性](../../reading/programming-languages-a-section-4/index.html)。两节都可以直接进入关键推演，按问题选读。
