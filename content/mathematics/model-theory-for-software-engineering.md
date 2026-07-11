---
format: rin-note
lang: zh-CN
title: 模型论中的可定义性
summary: 沿着一次真实的学习过程，理解公式怎样在一个结构中准确挑出元素、集合与关系。
date: 2026-07-12
topic: Model Theory / Definability
tags: [ORDER, LANGUAGE, FORMULA, PARAMETERS]
order: 20
slides:
  series: RIN III / MATHEMATICS / DEFINABILITY
  coverImage: /entrance/math-sakura.webp
  chapters:
    - id: start
      label: "00"
      title: Start with Order
      summary: 从后继关系开始
    - id: language
      label: "01"
      title: Language Limits
      summary: 能说什么，不能说什么
    - id: definition
      label: "02"
      title: Definability
      summary: 公式如何挑出集合
    - id: parameters
      label: "03"
      title: Parameters
      summary: 直接点名还是自行定位
    - id: synthesis
      label: "04"
      title: Put It Together
      summary: 把概念连成一条线
---

:::slide {"kind":"formula","chapter":"start","eyebrow":"START / SUCCESSOR FROM ORDER"}
## 第一步：只用 <，怎样说 y 是 x 的后继

先写出 x < y，再排除它们之间还存在别的元素。这是对话中第一次用已有语言表达一个新关系。

$$
S(x,y)\;\equiv\;x<y\land\neg\exists z\,(x<z\land z<y)
$$

### VISIBLE SYMBOL — 语言里只有 <

公式不能直接使用“后继”这个新符号，只能使用结构已经提供的顺序关系。

### NEW RELATION — 公式定义 S

所有满足公式的二元组 $(x,y)$，恰好组成后继关系。
:::

:::slide {"kind":"cards","chapter":"start","eyebrow":"START / PROPERTY VERSUS EXISTENCE"}
## 能写出性质，不代表结构里一定有满足它的元素

“最大自然数”帮助我们分清：公式是否能表达一个性质，与是否存在对象满足它，是两个问题。

### THE FORMULA — 可以表达“最大”

$\neg\exists y(x<y)$ 是一条合法公式，意思是没有元素比 $x$ 更大。

### THE STRUCTURE — 自然数里没有最大元

在 $(\mathbb{N},<)$ 中，每个 $x$ 都有更大的数，因此没有任何元素满足这条公式。

### THE RESULT — 它定义了空集

公式仍然定义了一个集合，只是满足它的元素集合恰好为空。
:::

:::slide {"kind":"matrix","chapter":"language","eyebrow":"LANGUAGE / RELATIVE EXPRESSIVE POWER"}
## 第二步：同一个概念，换一种语言，答案可能改变

“可定义”总要同时说明语言和结构；不能脱离它们单独判断。

| 目标 | 在 $(\mathbb{N},<)$ 中 | 在更丰富的语言中 |
| --- | --- | --- |
| 后继关系 | 可定义：排除中间元素 | 仍然可定义 |
| 质数集合 | 仅靠顺序无法区分 | 有乘法后可以描述因子 |
| 偶数集合 | 仅靠后继不能用有限公式反复走两步 | 有加法后可写 $\exists y(x=y+y)$ |
| 最大元素 | 公式可写，但定义出空集 | 是否非空仍取决于结构 |
:::

:::slide {"kind":"cards","chapter":"language","eyebrow":"LANGUAGE / A COMMON FALSE START"}
## “从 0 开始反复走两次后继”还不是一阶定义

这个想法能够生成偶数，但它描述的是一个无限执行过程，而不是一条有限的一阶公式。

### PROCEDURE — 生成方法

$0$、$S(S(0))$、$S(S(S(S(0))))$……需要不断重复同一个步骤。

### FORMULA — 一阶公式

必须是一段有限表达式，不能直接说“重复任意多次”或使用传递闭包。

### RICHER LANGUAGE — 加入加法

有了 $+$，偶数可一次写成 $\exists y(x=y+y)$，无限重复被压缩进一个见证 $y$。
:::

:::slide {"kind":"formula","chapter":"definition","eyebrow":"DEFINITION / THE CORE IDEA"}
## 第三步：可定义，就是存在一条公式把目标集合恰好挑出来

固定语言 $L$ 和结构 $M$。若 $\varphi$ 对 $A$ 中元素为真、对其余元素为假，$A$ 就在 $M$ 中可定义。

$$
A=\{a\in M^n\mid M\models\varphi(a)\}
$$

### FORMULA / φ — 筛选条件

$\varphi$ 使用语言 $L$ 中允许的符号，并留下 $n$ 个自由变量。

### EXACT MATCH — 不多不少

公式的所有满足者必须与目标 $A$ 完全一致，才算定义成功。
:::

:::slide {"kind":"formula","chapter":"definition","eyebrow":"DEFINITION / NEGATION"}
## 把公式取反，就定义了原集合的补集

如果 $\varphi(x)$ 定义 $A$，那么 $\neg\varphi(x)$ 对且仅对 $A$ 之外的元素为真。

$$
M\setminus A=\{a\in M\mid M\models\neg\varphi(a)\}
$$

### A — 满足 φ 的元素

公式 $\varphi$ 把这些元素挑进集合 $A$。

### COMPLEMENT — 不满足 φ 的元素

否定公式不需要重新寻找定义，直接挑出 $M$ 中剩余的元素。
:::

:::slide {"kind":"cards","chapter":"parameters","eyebrow":"PARAMETERS / THE CONFUSION ABOUT FIVE"}
## 第四步：先分清“5 这个对象”与“语言里能否直接写 5”

结构中的元素一直存在；参数讨论的是公式能不能直接引用那个元素。

### OBJECT — 5 是结构中的元素

无论语言有没有名字，5 都已经属于自然数结构的底集。

### NAME — 语言未必有符号 5

如果语言只给出 0 和后继，就不能把“5”当成一个未经说明的常量直接写入公式。

### PARAMETER — 允许外部直接点名

把 5 作为参数，等于先告诉公式我们指的是结构中的哪个元素。
:::

:::slide {"kind":"formula","chapter":"parameters","eyebrow":"PARAMETERS / TWO WAYS TO DEFINE X > 5"}
## x > 5 可以带参数定义，也可以先无参数定位 5

因为 5 本身能由 0 和后继唯一定位，所以这两种写法最后挑出同一个集合。

$$
x>5\quad\text{或}\quad\exists y\,(\varphi_5(y)\land y<x)
$$

### WITH PARAMETER — 直接引用 5

公式预先知道哪个元素是 5，再判断 $x$ 是否大于它。

### WITHOUT PARAMETER — 先由 φ₅ 找到 5

公式不点名 5，而是先唯一定位它，再用这个元素比较。
:::

:::slide {"kind":"cards","chapter":"parameters","eyebrow":"PARAMETERS / WHEN THE DIFFERENCE IS REAL"}
## 真正体现参数差异的是：元素本身无法被语言定位

在只有顺序的结构 $(\mathbb{R},<)$ 中，$\pi$ 与其他实数没有可由 $<$ 单独识别的特殊性质。

### WITH π — 允许 π 作参数

可以直接写 $x>\pi$，因而定义 $\pi$ 右侧的所有实数。

### WITHOUT π — 不允许参数

公式只能询问大小关系，无法谈圆、乘法或其他能唯一定位 $\pi$ 的性质。

### CONCLUSION — 同一集合不再无参数可定义

允许参数是在直接点名；无参数定义要求结构和语言自己把对象找出来。
:::

:::slide {"kind":"flow","chapter":"synthesis","eyebrow":"SYNTHESIS / FORMULA TO SET"}
## 第五步：公式不是创造集合，而是在结构中筛出满足者

这是整段对话最后形成的核心图景。

1. 写公式 $\varphi(x)$ — 它是一段语言表达，带着等待代入的自由变量。
2. 代入 $a\in M$ — 在固定结构中解释所有符号。
3. 判断 $M\models\varphi(a)$ — 每个 $a$ 都得到成立或不成立的结果。
4. 收集满足者 — 所有成立的 $a$ 组成公式定义的集合。
:::

:::slide {"kind":"matrix","chapter":"synthesis","eyebrow":"SYNTHESIS / NUMBER OF FREE VARIABLES"}
## 一个自由变量挑元素，多个自由变量挑元组

公式定义的对象由自由变量个数决定。

| 公式 | 满足者位于 | 得到的对象 |
| --- | --- | --- |
| $\varphi(x)$ | $M$ | $M$ 的一个子集 |
| $\varphi(x,y)$ | $M\times M$ | 一个二元关系 |
| $\varphi(x_1,\ldots,x_n)$ | $M^n$ | 一个 $n$ 元关系 |
| 例：$x<y$ | 所有满足 $x<y$ 的二元组 | 结构中的顺序关系 |
:::

:::slide {"kind":"contract","chapter":"synthesis","eyebrow":"SYNTHESIS / FOUR VIEWS OF ONE THING"}
## 公式、性质、满足者集合和可定义集合是同一条链上的四层

它们不是四个互不相关的新概念，只是从语法、语义和集合三个角度描述同一次筛选。

### SYNTAX — 公式 φ(x)

语言里写出的表达式，本身带有自由变量。

### READING — 性质

我们把 $\varphi(x)$ 读成“$x$ 具有某个性质”。

### SEMANTICS — 满足关系

$M\models\varphi(a)$ 表示元素 $a$ 在结构 $M$ 中确实具有这个性质。

### EXTENSION — 可定义集合

把所有满足者收集起来；若正好是目标 $A$，就说 $\varphi$ 定义 $A$。
:::

:::slide {"kind":"cards","chapter":"synthesis","eyebrow":"SYNTHESIS / FORMULA OR STATEMENT"}
## 最后分清：开放公式等待赋值，句子才直接具有真值

对话里“前面是公式，下面是命题”的直觉是对的，需要补上自由变量这一条界线。

### OPEN FORMULA — φ(x)

$x$ 仍然自由；不指定 $x$ 时，不能简单说整条公式真或假。

### AFTER ASSIGNMENT — φ(a)

把具体元素 $a$ 代入后，可以判断 $M\models\varphi(a)$ 是否成立。

### SENTENCE — 没有自由变量

所有变量都被量词绑定的公式称为句子；它在结构 $M$ 中直接为真或为假。
:::

:::slide {"kind":"checklist","chapter":"synthesis","eyebrow":"SYNTHESIS / WHAT TO REMEMBER"}
## 现在重新判断“可不可定义”，只需要依次问五件事

这五问就是这次学习链路最后留下的操作方法。

1. 我们当前使用的语言允许哪些符号？
2. 这些符号在哪个结构中解释？
3. 目标是元素、集合，还是 $n$ 元关系？
4. 是否允许直接引用结构中的参数？
5. 能否写出一条有限公式，恰好挑出全部目标对象？
:::

:::slide {"kind":"closing","chapter":"synthesis","eyebrow":"MODEL THEORY / DEFINABILITY / RIN III"}
## 一句话记住可定义性

> 给定语言和结构，如果一条允许的公式能够不多不少地挑出目标对象，那么这个对象就是可定义的。

FORMULA → SATISFIERS → DEFINABLE SET
:::
