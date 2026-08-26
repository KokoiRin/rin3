---
title: 《程序员的范畴论》学习记录
summary: 从程序的可组合性出发学习范畴论，先保留 Bartosz Milewski 原书的逐段完整中文译文，再观察这些结构是否真的能帮助理解类型、抽象、效应与并发。
date: 2026-08-26
lang: zh-CN
topic: Category Theory / Programming
tags:
  - CATEGORY THEORY
  - COMPOSITION
  - FUNCTIONAL PROGRAMMING
  - TYPES
order: 40
---

> **逐段完整中文阅读器**
>
> - [序言：为什么程序员值得学习范畴论 →](../../reading/category-theory-for-programmers/preface/)
> - [第 1 章：范畴——复合的本质 →](../../reading/category-theory-for-programmers/category-the-essence-of-composition/)
> - [第 2 章：类型与函数 →](../../reading/category-theory-for-programmers/types-and-functions/)
> - [第 3 章：大大小小的范畴 →](../../reading/category-theory-for-programmers/categories-great-and-small/)
> - [第 4 章：Kleisli 范畴 →](../../reading/category-theory-for-programmers/kleisli-categories/)
> - [第 5 章：积与余积 →](../../reading/category-theory-for-programmers/products-and-coproducts/)
> - [第 6 章：简单代数数据类型 →](../../reading/category-theory-for-programmers/simple-algebraic-data-types/)
> - [第 7 章：函子 →](../../reading/category-theory-for-programmers/functors/)
> - [第 8 章：函子性 →](../../reading/category-theory-for-programmers/functoriality/)
> - [第 9 章：函数类型 →](../../reading/category-theory-for-programmers/function-types/)
> - [第 10 章：自然变换 →](../../reading/category-theory-for-programmers/natural-transformations/)
> - [第 11 章：声明式编程 →](../../reading/category-theory-for-programmers/declarative-programming/)
> - [第 12 章：极限与余极限 →](../../reading/category-theory-for-programmers/limits-and-colimits/)
> - [第 13 章：自由幺半群 →](../../reading/category-theory-for-programmers/free-monoids/)
> - [第 14 章：可表函子 →](../../reading/category-theory-for-programmers/representable-functors/)
> - [第 15 章：Yoneda 引理 →](../../reading/category-theory-for-programmers/the-yoneda-lemma/)
> - [第 16 章：Yoneda 嵌入 →](../../reading/category-theory-for-programmers/yoneda-embedding/)
> - [第 17 章：一切皆态射 →](../../reading/category-theory-for-programmers/its-all-about-morphisms/)
> - [第 18 章：伴随 →](../../reading/category-theory-for-programmers/adjunctions/)
> - [第 19 章：自由/遗忘伴随 →](../../reading/category-theory-for-programmers/free-forgetful-adjunctions/)
> - [第 20 章：Monad——程序员的定义 →](../../reading/category-theory-for-programmers/monads-programmers-definition/)
> - [第 21 章：Monad 与效应 →](../../reading/category-theory-for-programmers/monads-and-effects/)
> - [第 22 章：Monad 的范畴定义 →](../../reading/category-theory-for-programmers/monads-categorically/)
> - [第 23 章：Comonad →](../../reading/category-theory-for-programmers/comonads/)
> - [第 24 章：F-代数 →](../../reading/category-theory-for-programmers/f-algebras/)
> - [第 25 章：Monad 的代数 →](../../reading/category-theory-for-programmers/algebras-for-monads/)
> - [第 26 章：Ends 与 Coends →](../../reading/category-theory-for-programmers/ends-and-coends/)
> - [第 27 章：Kan 扩张 →](../../reading/category-theory-for-programmers/kan-extensions/)
> - [第 28 章：富范畴 →](../../reading/category-theory-for-programmers/enriched-categories/)
> - [第 29 章：Topos →](../../reading/category-theory-for-programmers/topoi/)
> - [第 30 章：Lawvere 理论 →](../../reading/category-theory-for-programmers/lawvere-theories/)
> - [第 31 章：Monad、幺半群与范畴 →](../../reading/category-theory-for-programmers/monads-monoids-and-categories/)
> - [书后索引（中英术语）→](../../reading/category-theory-for-programmers/book-index/)
> - [致谢 →](../../reading/category-theory-for-programmers/acknowledgments/)
> - [许可 →](../../reading/category-theory-for-programmers/license/)

## 为什么从这本书开始

这本书没有先要求读者成为数学家，而是从程序员长期面对的问题出发：程序怎样组合，抽象怎样跨越具体实现，副作用为什么会随着系统扩大而失控，并发为什么难以继续沿用共享可变状态的直觉。

这些问题和我真正关心的工作比较接近。Kotlin 的类型、函数式数据处理和 `Flow`，KMP 中业务决策与平台能力的边界，以及复杂系统中怎样让局部设计能够继续组合，都可能从这套结构化语言中获得新的理解。

现在还不能预设范畴论一定会直接改善工程实践。更诚实的学习目标是：读完每一部分后，找出一个原本只能凭经验描述的问题，看看范畴论是否提供了更清楚、可迁移的结构；如果没有，就不为了术语继续拔高。

## 当前进度

序言、第 1～31 章正文，以及书后索引、致谢与许可，已经按英文底稿完整翻译。译文保留全部正文、代码、数学公式、原图、图注、链接和习题；原文包含习题的章节，每道习题下方都附有可点击展开的参考答案。评论区、点赞按钮、分享控件和 Twitter 关注短代码不属于书的正文，因此没有收录。

第一部分十章从范畴、类型和函数推进到泛构造、代数数据类型、函子性、函数对象与自然变换；第二部分六章从声明式编程推进到极限、自由构造、可表函子、Yoneda 引理与 Yoneda 嵌入；第三部分从伴随推进到 Monad、Comonad、代数、Ends/Coends、Kan 扩张、富范畴、Topos 与 Lawvere 理论，并以“范畴是 Span 中的 Monad”收束。全书翻译、逐章完整性核对与术语审校现已完成。

## 中英术语

阅读器会在关键术语第一次出现时同时给出英文，方便以后阅读英文资料。当前核心词汇包括：范畴（category）、对象（object）、态射（morphism）、复合（composition）、恒等态射（identity morphism）、结合律（associativity）、始对象（initial object）、终对象（terminal object）、泛构造（universal construction）、同构（isomorphism）、积（product）、余积（coproduct）、投影（projection）、注入（injection）、因子分解器（factorizer）、代数数据类型（algebraic data type）、类型构造器（type constructor）、函子（functor）、自函子（endofunctor）、双函子（bifunctor）、逆变函子（contravariant functor）、Profunctor、Hom 函子（hom-functor）、函数对象（function object）、求值（evaluation）、柯里化（currying）、指数对象（exponential）、笛卡尔闭范畴（Cartesian closed category）、自然变换（natural transformation）、自然性条件（naturality condition）、自然同构（natural isomorphism）、函子范畴（functor category）、垂直复合（vertical composition）、水平复合（horizontal composition）、2-范畴（2-category）、函子定律（functor laws）、等式推理（equational reasoning）、类型类（typeclass）、图（diagram）、锥（cone）、泛锥（universal cone）、极限（limit）、预层（presheaf）、可表预层（representable presheaf）、等化子（equalizer）、拉回（pullback）、余锥（cocone）、余极限（colimit）、推出（pushout）、连续函子（continuous functor）、幺半群（monoid）、生成元（generator）、自由构造（free construction）、自由幺半群（free monoid）、同态（homomorphism）、底层集合（underlying set）、遗忘函子（forgetful functor）、富范畴（enriched category）、同伦类型论（Homotopy Type Theory, HoTT）、表示（representation）、可表函子（representable functor）、参数性（parametricity）、制表（tabulate）、索引（index）、记忆化（memoization）、Yoneda 引理（Yoneda lemma）、Set 值函子（Set-valued functor）、续延传递风格（continuation-passing style, CPS）、续延（continuation）、余 Yoneda 引理（co-Yoneda lemma）、离散范畴（discrete category）、Yoneda 嵌入（Yoneda embedding）、忠实函子（faithful functor）、完全函子（full functor）、完全忠实函子（fully faithful functor）、双射（bijection）、预层范畴（category of presheaves）、预序（preorder）、薄范畴（thin category）、求值函子（evaluation functor）、范畴等价（equivalence of categories）、伴随（adjunction）、单位（unit）、余单位（counit）、左伴随（left adjoint）、右伴随（right adjoint）、三角恒等式（triangular identities）、函数依赖（functional dependency）、积范畴（product category）、对角函子（diagonal functor）、自由函子（free functor）、自由对象（free object）、单态射（monomorphism）、满态射（epimorphism）、Kleisli 箭头（Kleisli arrow）、鱼运算符（fish operator）、绑定（bind）、连接（join）、语法糖（syntactic sugar）、去糖（desugaring）、续延 Monad（continuation monad）、列表推导（list comprehension）、生成器（generator）、偏性（partiality）、提升类型（lifted type）、底（bottom）、非确定性（nondeterminism）、副作用（side effect）、Monad Transformer、Monad 栈（monad stack）、代换（substitution）、乘法（multiplication）、结合子（associator）、幺元子（unitor）、张量积（tensor product）、幺半范畴（monoidal category）、严格幺半范畴（strict monoidal category）与相干条件（coherence condition）。

第 23 章新增术语：Comonad、co-Kleisli 箭头（co-Kleisli arrow）、上下文计算（contextual computation）、扩展（extend）、复制（duplicate）、余幺半群（comonoid）、Costate Comonad 与 Store Comonad。

第 24 章新增术语：F-代数（F-algebra）、载体（carrier）、结构映射（structure map）、固定点（fixed point）、初代数（initial algebra）、Lambek 定理、折叠态射（catamorphism）、F-余代数（F-coalgebra）、终余代数（final coalgebra）、展开态射（anamorphism）、最小固定点（least fixed point）与最大固定点（greatest fixed point）。

第 25 章新增术语：T-代数（T-algebra）、Eilenberg–Moore 范畴（Eilenberg–Moore category）、自由代数（free algebra）、Kleisli 范畴（Kleisli category）、余求值态射（coevaluation morphism）、余自由函子（cofree functor）、co-Kleisli 范畴（co-Kleisli category）、行为良好的 Lens（well-behaved lens）、GETPUT、PUTPUT 与 PUTGET。

第 26 章新增术语：证明相关关系（proof-relevant relation）、双自然变换（dinatural transformation）、楔（wedge）、楔条件（wedge condition）、泛楔（universal wedge）、End、Coend、余楔（cowedge）、余等化子（coequalizer）、商（quotient）、等价关系（equivalence relation）、Ninja Yoneda 引理、双范畴（bicategory）、2-胞（two-cell）与双重范畴（double category）。

第 27 章新增术语：右 Kan 扩张（right Kan extension）、左 Kan 扩张（left Kan extension）、预复合函子（precomposition functor）、余稠密 Monad（codensity monad）、Fubini 定理、广义代数数据类型（generalized algebraic data type, GADT）与自由函子（free functor）。

第 28 章新增术语：小范畴（small category）、局部小的（locally small）、富范畴（enriched category）、Hom 对象（hom-object）、无点形式（point-free）、对称幺半范畴（symmetric monoidal category）、内部 Hom（internal hom）、双闭的（biclosed）、富函子（enriched functor）、自富化（self-enrichment）、0-胞（0-cell）、1-胞（1-cell）、2-胞（2-cell）与 Hom 范畴（hom-category）。

第 29 章新增术语：发散计算（divergent computation）、Topos（复数 Topoi）、特征函数（characteristic function）、分类对象（classifying object）、子对象分类器（subobject classifier）、布尔 Topos（Boolean topos）、谓词（predicate）、真值对象（truth object）与直觉主义逻辑（intuitionistic logic）。

第 30 章新增术语：通用代数（universal algebra）、运算（operation）、元数（arity）、泛型对象（generic object）、骨架（skeleton）、Lawvere 理论（Lawvere theory）、基本积运算（basic product operation）、类属（sort）、单类属的（single-sorted）、有限元 Monad（finitary monad）与有限元函子（finitary functor）。

第 31 章新增术语：双范畴（bicategory）、Span、Span 的双范畴（bicategory of spans）、0-胞（0-cell）、1-胞（1-cell）、2-胞（2-cell）、自 1-胞（endo-1-cell）与对象上恒等函子（identity-on-objects functor）。

## 翻译说明

译文以 Bartosz Milewski 的[原始博客系列](https://bartoszmilewski.com/2014/10/28/category-theory-for-programmers-the-preface/)和 CC BY-SA 4.0 英文 Markdown 底稿为准，按原段落顺序翻译，不用摘要替换正文。为保持中文术语一致，`composition` 在范畴论语境中译为“复合”，在泛指程序构件组合时仍按语境使用“组合”。关键术语首次出现时保留英文原词。

原作及本非官方中文学习版依 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 署名—相同方式共享；遇到概念或措辞疑问时，以作者原文为准。
