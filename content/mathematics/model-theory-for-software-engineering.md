---
format: rin-note
lang: zh-CN
title: 模型论中的可定义性
summary: 沿着一次真实对话的追问顺序，理解公式怎样在固定结构中准确挑出集合与关系。
date: 2026-07-12
topic: Model Theory / Definability
tags: [FORMULA, SATISFACTION, DEFINABILITY, PARAMETERS]
order: 20
slides:
  series: RIN III / MATHEMATICS / DEFINABILITY
  coverImage: /entrance/math-sakura.webp
  chapters:
    - id: start
      label: "00"
      title: Start with Order
      summary: 从后继关系进入问题
    - id: boundary
      label: "01"
      title: Language Boundary
      summary: 公式能表达什么
    - id: definition
      label: "02"
      title: Definability
      summary: 可定义性的正式定义
    - id: parameters
      label: "03"
      title: Parameters
      summary: 直接点名还是自行定位
    - id: synthesis
      label: "04"
      title: Put It Together
      summary: 公式、性质与集合
---

:::slide {"kind":"formula","chapter":"start","eyebrow":"START / SUCCESSOR FROM ORDER"}
## 只用 <，怎样表达 y 是 x 的后继

对话从一个具体问题开始：$y$ 比 $x$ 大，而且二者之间不存在其他自然数。

$$
\operatorname{Succ}(x,y)\equiv x<y\land\neg\exists z\,(x<z\land z<y)
$$

- **允许使用的语言**：公式只使用 $<$、等号、量词和逻辑连接词，没有偷偷加入“后继”。
- **定义出的关系**：满足公式的全部二元组，恰好组成自然数上的后继关系。

:::detail
这里已经出现了可定义性的基本动作：不是给“后继”换一个名字，而是用现有语言写出一条公式，精确挑出目标关系。
:::
:::

:::slide {"kind":"cards","chapter":"boundary","eyebrow":"LANGUAGE / PROPERTY AND EXISTENCE"}
## 能表达“最大元”，不等于自然数中存在最大元

对话接着讨论质数、偶数、最大元和最小元。这里首先要拆开两个问题。

- **性质可以写出**：$\neg\exists y(x<y)$ 是合法公式，表达“没有元素比 $x$ 更大”。
- **自然数中没有满足者**：在 $(\mathbb N,<)$ 中，每个自然数都有更大的自然数，因此没有元素满足它。
- **结果是空集**：这条公式仍然定义了一个集合，只不过这个集合是空集。
:::

:::slide {"kind":"cards","chapter":"boundary","eyebrow":"LANGUAGE / A FALSE START"}
## “从 0 开始反复走两次后继”还不是一阶定义

这个想法能生成偶数，却没有给出一条有限的一阶公式。

- **生成过程**：“一直走两步”隐含任意多次重复，类似循环或传递闭包。
- **一阶公式**：它必须是有限字符串，不能把“重复任意多次”直接当成一个步骤。
- **关键区别**：想到了一个算法，不等于已经证明目标集合可定义。

:::detail
**需要修正的一点。** 原对话一度声称在纯序结构 $(\mathbb N,<)$ 中可以定义加法、乘法和偶数，这是错误的。纯序一阶语言无法定义这些算术关系；特别地，偶数集在 $(\mathbb N,<)$ 中不可定义。

加入加法后，偶数可以写成 $\exists y\,(x=y+y)$；加入乘法与常量 $1$ 后，质数也能用因子条件定义。这个对比真正说明的是：可定义性依赖当前语言和结构，而不是只看概念本身。
:::
:::

:::slide {"kind":"formula","chapter":"definition","eyebrow":"DEFINITION / DEFINABLE SET"}
## 可定义性的明确含义：公式的满足者必须与目标完全相同

设 $M$ 是语言 $L$ 的结构，$A\subseteq |M|^n$。如果存在一个 $L$-公式 $\varphi(x_1,\ldots,x_n)$，使下面等式成立，就称 $A$ 在 $M$ 中无参数可定义。

$$
A=\{(a_1,\ldots,a_n)\in |M|^n\mid M\models\varphi(a_1,\ldots,a_n)\}
$$

- **公式限制**：$\varphi$ 是有限的一阶公式，只使用 $L$ 中的符号；$x_1,\ldots,x_n$ 是它需要代入的自由变量。
- **精确匹配**：公式对 $A$ 中的元组成立，并且只对这些元组成立。

:::detail
这里 $|M|$ 表示结构 $M$ 的底集；$M\models\varphi(a_1,\ldots,a_n)$ 读作“在结构 $M$ 中，元组 $(a_1,\ldots,a_n)$ 满足公式 $\varphi$”。

定义从一开始就包含四项：语言 $L$、结构 $M$、目标集合 $A$ 和公式 $\varphi$。所以脱离语言与结构，只问“偶数是否可定义”，问题是不完整的。

一个元素 $a$ 可定义，是指单点集 $\{a\}$ 可定义；一个函数可定义，通常是指它的图像作为 $M^{n+1}$ 的子集可定义。
:::
:::

:::slide {"kind":"formula","chapter":"definition","eyebrow":"DEFINITION / NEGATION"}
## 把定义公式取反，就得到原集合的补集

对话中的“把前面那个取反不就行了”抓住了一条正确规则，但必须取反正确的性质。

$$
|M|^n\setminus A=\{a\in |M|^n\mid M\models\neg\varphi(a)\}
$$

- **原公式**：$\varphi$ 对且仅对 $A$ 中的元组成立。
- **取反以后**：$\neg\varphi$ 恰好挑出不属于 $A$ 的所有元组。

:::detail
例如，若公式定义的是“$x=5$”，直接取反得到的是“$x\neq5$”，而不是“$x>5$”。要定义大于 $5$ 的数，仍需表达顺序条件。
:::
:::

:::slide {"kind":"cards","chapter":"parameters","eyebrow":"PARAMETERS / THE CONFUSION ABOUT FIVE"}
## 先分清“5 这个对象”与“公式能不能直接写 5”

用户追问得很关键：如果 5 也能定义出来，为什么还把它叫参数？

- **结构中的对象**：$5$ 本来就在自然数结构的底集中，不是公式创造出来的。
- **语言中的名字**：纯序语言没有常量符号“5”，因此无参数公式不能未经说明直接写它。
- **参数的作用**：允许 $5$ 作参数，就是允许公式直接引用结构里的这个元素。
:::

:::slide {"kind":"formula","chapter":"parameters","eyebrow":"PARAMETERS / TWO DEFINITIONS"}
## x > 5 可以直接使用参数，也可以先无参数定位 5

在 $(\mathbb N,<)$ 中，每个固定自然数都能由“最小元 + 有限次后继”唯一定位，所以两种方法最后得到同一个集合。

$$
5<x\qquad\text{或}\qquad\exists y\,(\varphi_5(y)\land y<x)
$$

- **带参数**：把 $5$ 作为已知元素直接放进公式。
- **无参数**：先用 $\varphi_5(y)$ 唯一挑出 $5$，再比较 $y<x$。

:::detail
更一般地，若允许参数集 $B\subseteq |M|$，就把 $B$ 中需要使用的有限多个元素当作额外常量。由这样的公式定义出的集合称为“在 $B$ 上可定义”或“带参数可定义”。
:::
:::

:::slide {"kind":"cards","chapter":"parameters","eyebrow":"PARAMETERS / WHEN IT MATTERS"}
## 真正体现参数差异的是：语言无法自行定位的元素

在只有顺序的结构 $(\mathbb R,<)$ 中，$\pi$ 只是稠密线性序中的一个点。

- **带参数**：允许直接点名 $\pi$ 时，$\pi<x$ 定义开射线 $(\pi,\infty)$。
- **无参数**：只用 $<$ 无法无参数地唯一挑出 $\pi$，也无法定义端点为 $\pi$ 的开射线。
- **原因**：存在保持顺序的双射把 $\pi$ 移到别的实数；无参数公式不能区分这些对称位置。

:::detail
这种保持全部语言结构的双射叫自同构。所有无参数可定义集合都必须被结构的每个自同构保持。因此，只要找到一个自同构会移动目标集合，就能证明它不可无参数定义。
:::
:::

:::slide {"kind":"flow","chapter":"synthesis","eyebrow":"SYNTHESIS / FORMULA TO SET"}
## 公式怎样变成一个可定义集合

对话最后把“公式、性质、集合”连成了同一个过程。

1. 写出公式 — $\varphi(x_1,\ldots,x_n)$ 表达一个条件。
2. 代入元组 — 从 $|M|^n$ 中选择 $(a_1,\ldots,a_n)$。
3. 判断满足 — 检查 $M\models\varphi(a_1,\ldots,a_n)$。
4. 收集满足者 — 所有成立的元组组成 $\varphi$ 定义的集合。
:::

:::slide {"kind":"matrix","chapter":"synthesis","eyebrow":"SYNTHESIS / ONE IDEA, SEVERAL NAMES"}
## 公式、性质、集合和关系是同一条链上的不同视角

它们不是几个互不相关的新概念。

| 说法 | 看问题的角度 | 实际含义 |
| --- | --- | --- |
| 公式 $\varphi(x)$ | 语法 | 写出的有限表达式 |
| “$x$ 具有性质 P” | 自然语言读法 | 对公式含义的说明 |
| 满足关系 $M\models\varphi(a)$ | 语义 | $a$ 代入后公式成立 |
| 可定义集合 | 满足者的全体 | $\{a\in \lvert M\rvert:M\models\varphi(a)\}$ |
| 二元关系 | $M^2$ 的子集 | 由 $\varphi(x,y)$ 挑出的有序对 |
:::

:::slide {"kind":"cards","chapter":"synthesis","eyebrow":"SYNTHESIS / FORMULA AND SENTENCE"}
## 开放公式等待赋值，句子才在结构中直接具有真值

这是理解满足符号所需的最后一个概念。

- **开放公式 $\varphi(x)$**：$x$ 自由出现；必须给它一个取值，才能判断 $M\models\varphi(a)$。
- **句子**：变量都被量词约束的公式称为句子，它在固定结构中直接为真或为假。
- **仍然可以出现变量**：$\forall x(x=x)$ 含有变量，但没有自由变量，所以它是句子。
:::

:::slide {"kind":"checklist","chapter":"synthesis","eyebrow":"SYNTHESIS / HOW TO ASK"}
## 判断“是否可定义”时，依次问这五件事

1. 当前允许使用什么语言 $L$？
2. 这些符号在哪个结构 $M$ 中解释？
3. 目标是 $|M|^n$ 中的哪个集合或关系？
4. 是否允许直接引用参数？
5. 能否写出一条有限公式，恰好挑出全部目标元组？
:::

:::slide {"kind":"closing","chapter":"synthesis","eyebrow":"MODEL THEORY / DEFINABILITY / RIN III"}
## 一句话记住可定义性

> 固定语言和结构后，如果一条允许的公式能够不多不少地挑出目标集合，那么这个集合就是可定义的。

FORMULA → SATISFACTION → DEFINABLE SET
:::
