---
title: 编程语言 Part A · 第四节：从类型约束到模块抽象，判断程序何时可以替换
summary: 把类型推导拆成可跟随的约束求解，再看清抽象类型、等价实现与程序变换的条件。
reader: /reading/programming-languages-a-section-4/index.html
date: 2026-10-17
lang: zh-CN
topic: Programming Languages / Standard ML
tags:
  - PROGRAMMING LANGUAGES
  - STANDARD ML
  - TYPE SYSTEMS
order: 53
---

> **[打开编程语言第四节中文讲解 →](../../reading/programming-languages-a-section-4/index.html)**

## 从类型约束到模块抽象，判断程序何时可以替换

本节把编程语言的几条规则展开成完整过程：代码怎样产生类型约束，类型参数怎样泛化和实例化，为什么可变状态会限制多态；随后用有理数模块说明签名、隐藏表示和客户端能观察到的行为。

本节可以按问题选读。类型推导、值限制、表示独立性与程序等价性各有完整例子和图解；模块命名空间等熟悉内容可以快读。最后明确区分行为相同、计算成本相同，以及等价变换成立所需的条件。

本系列依据 Dan Grossman 的 Programming Languages, Part A · Section 4 制作原创中文讲解。覆盖全部 19 段视频，整理为 9 篇，配有 6 组分步图解。

## 可以直接进入的推演

- [不运行程序，怎样逐步求出函数的类型？](../../reading/programming-languages-a-section-4/01-type-constraints/index.html)
- [为什么一个看起来可泛型化的绑定，会受到可变状态的限制？](../../reading/programming-languages-a-section-4/03-value-restriction/index.html)
- [接口相同的两个模块，什么时候可以互相替换？](../../reading/programming-languages-a-section-4/07-representation-independence/index.html)
- [一次代码改写，要满足什么条件才保持行为？](../../reading/programming-languages-a-section-4/08-function-equivalence/index.html)

## 把类型推导变成可执行的推理

- [01 类型推导怎样做：产生约束，再让它们同时成立](../../reading/programming-languages-a-section-4/01-type-constraints/index.html)
- [02 哪些类型留下来，哪些要在调用时选定](../../reading/programming-languages-a-section-4/02-polymorphic-inference/index.html)
- [03 一个共享的可变格子，为什么不能任意多态](../../reading/programming-languages-a-section-4/03-value-restriction/index.html)

## 用边界组织递归与模块

- [04 几个函数或类型需要彼此认识时](../../reading/programming-languages-a-section-4/04-mutual-recursion/index.html)
- [05 先把一组定义放在同一个名字下面](../../reading/programming-languages-a-section-4/05-module-namespaces/index.html)
- [06 签名要隐藏的不只是几个函数名](../../reading/programming-languages-a-section-4/06-signatures-and-hiding/index.html)
- [07 三种有理数实现，客户端为什么可以分不出来](../../reading/programming-languages-a-section-4/07-representation-independence/index.html)

## 判断改写保留了什么，又改变了什么

- [08 函数结果相同，还不一定能够互换](../../reading/programming-languages-a-section-4/08-function-equivalence/index.html)
- [09 行为等价以后，怎样单独比较计算成本](../../reading/programming-languages-a-section-4/09-equivalence-and-cost/index.html)

## 阅读衔接与来源

[第一节目录](../../reading/programming-languages-a-section-1/index.html) · [第二节目录](../../reading/programming-languages-a-section-2/index.html) · [第三节目录](../../reading/programming-languages-a-section-3/index.html)

[完整视频映射与出处](../../reading/programming-languages-a-section-4/index.html#sources)。
