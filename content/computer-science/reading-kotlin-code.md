---
format: rin-note
lang: zh-CN
title: 读懂一段 Kotlin 代码
summary: 从 val、var、空值、判断和函数开始，再逐步进入数据类、构造参数、接口与继承，按照初学者真正遇到问题的顺序读懂 Kotlin。
date: 2026-07-23
topic: Programming Languages / Kotlin
tags:
  - KOTLIN
  - TYPES
  - NULL SAFETY
  - CLASSES
order: 20
slides:
  series: RIN III / COMPUTER SCIENCE / KOTLIN
  coverImage: /entrance/computer-lotus.webp
  chapters:
    - id: basics
      label: "01"
      title: Basic Values
      summary: 从变量、类型和空值开始
    - id: control
      label: "02"
      title: Branches and Functions
      summary: 判断怎样选择路线，函数怎样封装行为
    - id: state
      label: "03"
      title: Data as State
      summary: 枚举、数据类和 copy 怎样表达状态
    - id: classes
      label: "04"
      title: Classes
      summary: 冒号、构造参数和属性分别表示什么
    - id: inheritance
      label: "05"
      title: Interface and Inheritance
      summary: 接口、父类与重写怎样协作
    - id: review
      label: "06"
      title: Read the Whole
      summary: 把基础语法重新放回完整代码
---

:::slide {"kind":"prose","chapter":"basics","eyebrow":"THE FIRST STEP / VAL AND VAR"}
## 先分清 val 和 var

今晚先不碰 Android 架构，也不急着读复杂的类。第一步只看 Kotlin 怎样给一个值起名字。

`val` 表示这个名字初始化以后不能再指向另一个值；`var` 表示它以后可以被重新赋值。实际代码通常优先使用 `val`，因为不需要变化的东西越多，阅读时要考虑的可能性就越少。

```kotlin
val maxLength = 140
var currentLength = 10

currentLength = 20   // 可以
// maxLength = 200   // 不可以
```

:::detail

把 `val` 暂时读成“这个名字只赋值一次”，把 `var` 读成“这个名字以后还能换值”，已经足够开始阅读大部分代码。

但要注意，`val` 限制的是名字指向哪里，不保证它指向的对象内部绝对不变：

```kotlin
val names = mutableListOf("A")
names.add("B")       // 可以：列表自身发生变化
// names = mutableListOf("C")  // 不可以：names 不能改指向另一个列表
```

所以以后看到 `var`，可以多问一句：谁负责改变它，变化发生在什么时候？看到 `val`，则可以先排除这个名字被重新赋值的可能。语法在这里给出的不是业务答案，而是一条关于变化范围的线索。

:::
:::

:::slide {"kind":"code","chapter":"basics","eyebrow":"NAME AND TYPE / COLON","caption":"冒号后面是类型；右边已经足够明确时，Kotlin 可以自动推断。"}
## 类型写在哪里

变量名后面的冒号用来声明类型。`String` 是字符串，`Int` 是整数，`Boolean` 表示真或假。

```kotlin
val text: String = "你好"
val count: Int = 2
val enabled: Boolean = true

val inferredText = "你好"
val inferredCount = 2
val inferredEnabled = true
```

:::detail

Kotlin 的基本顺序是：

```text
val 或 var  名字: 类型 = 初始值
```

如果初始值已经足够明确，编译器可以推断类型，所以 `val count = 2` 和显式写出 `val count: Int = 2` 都能成立。

这时还不需要讨论继承。只要先建立一个简单认识：在值和参数声明中，冒号右边告诉我们“这里允许出现哪一类值”。类型不是给变量贴一个说明标签，它会参与编译检查。例如声明为 `Int` 后，就不能再把字符串赋给它。

:::
:::

:::slide {"kind":"code","chapter":"basics","eyebrow":"NULL SAFETY / QUESTION MARK","caption":"问号让“可能没有值”进入类型，安全调用与 Elvis 运算符负责处理这条分支。"}
## 空值也要写进类型

普通的 `String` 必须有字符串；写成 `String?`，才表示它也可能是 `null`。

```kotlin
val templateName: String? = null

val displayName = templateName ?: "默认模板"
val nameLength = templateName?.length ?: 0
```

:::detail

如果一个值是 `String?`，编译器不允许直接写 `templateName.length`。因为“没有字符串”也是合法情况，代码必须先说明怎样处理它。

安全调用 `?.` 可以读成：左边有值才继续访问；左边为 `null` 时，整个表达式也得到 `null`。因此 `templateName?.length` 的结果是 `Int?`。

Elvis 运算符 `?:` 再为 `null` 提供默认结果：

```kotlin
val nameLength = templateName?.length ?: 0
```

翻译成人话就是：

> 有模板名称就取长度，没有就按 0 处理。

空安全最重要的作用不是少写几行判断，而是让函数和数据公开一条事实：这个值一定存在，还是调用者必须准备好面对“没有值”。

:::
:::

:::slide {"kind":"code","chapter":"control","eyebrow":"IF AND WHEN / CHOOSE A PATH","caption":"if 处理两条路线，when 适合把多种明确情况逐一列出。"}
## 判断下一步做什么

`if` 处理条件成立与不成立；`when` 根据不同情况选择不同分支。`->` 可以直接读成“这种情况就执行右边”。

```kotlin
if (text.length > 140) {
    showDialog()
} else {
    submit()
}

when (scene) {
    InputScene.FIRST_INPUT -> showFirstInputPage()
    InputScene.RE_EDIT -> showEditPage()
}
```

:::detail

Kotlin 的 `if` 不只控制执行路线，它本身也可以产生结果：

```kotlin
val buttonText = if (enabled) "完成" else "处理中"
```

被选中的分支会成为整个表达式的值，再交给 `buttonText`。

`when` 适合处理多种清晰情况。刚开始可以把它理解成一组按情况排列的规则：

```text
FIRST_INPUT → 展示首次输入页
RE_EDIT     → 展示二次编辑页
```

后面学习枚举以后，会看到这两者怎样配合：枚举限制合法情况，`when` 决定每种情况对应什么行为或结果。

:::
:::

:::slide {"kind":"code","chapter":"control","eyebrow":"FUNCTION / INPUT AND OUTPUT","caption":"参数写在括号里，括号后的冒号声明返回值类型。"}
## 函数把行为起了名字

函数用 `fun` 声明。括号里是它需要的输入，括号后的类型是它会交回的结果。

```kotlin
fun submitText(text: String) {
    println(text)
}

fun canSubmit(text: String): Boolean {
    return text.isNotEmpty() && text.length <= 140
}
```

:::detail

第一段函数只执行操作，没有声明有意义的返回结果。第二段函数接收一个 `String`，并返回 `Boolean`：

```text
fun 函数名(参数名: 参数类型): 返回值类型
```

调用函数时，把实际值放进括号：

```kotlin
val allowed = canSubmit("你好")
```

简单函数还可以写成单个表达式：

```kotlin
fun canSubmit(text: String): Boolean =
    text.isNotEmpty() && text.length <= 140
```

这里等号右边的表达式直接成为函数结果。前面学到的 `if` 也可以放在这里，因为它同样能够产生值。

:::
:::

:::slide {"kind":"code","chapter":"state","eyebrow":"ENUM AND DATA CLASS / STATE","caption":"enum 限制可能情况，data class 保存一组数据，copy 从当前状态产生下一份状态。"}
## 把几种情况和一组数据装起来

`enum class` 表达固定的几种情况；`data class` 把一组相关数据组合成一个整体。

```kotlin
enum class ApplyResult { SUCCESS, FAILURE }

data class TemplateState(
    val selectedIndex: Int,
    val committedIndex: Int,
    val loading: Boolean,
    val errorMessage: String? = null,
)

val nextState = state.copy(loading = true)
```

:::detail

枚举比任意字符串更可靠，因为合法值被限制在一个明确集合中：

```kotlin
val message = when (result) {
    ApplyResult.SUCCESS -> "应用成功"
    ApplyResult.FAILURE -> "应用失败"
}
```

`data class` 则适合表达一包以数据为主的状态。创建对象时可以使用命名参数，不必死记顺序：

```kotlin
val state = TemplateState(
    selectedIndex = 2,
    committedIndex = 1,
    loading = false,
)
```

它自动提供的 `copy` 不会修改旧对象，而是产生一份新对象；没有写出的字段沿用旧值：

```kotlin
val nextState = state.copy(
    selectedIndex = 3,
    loading = true,
)
```

但语法不会替业务作判断。`selectedIndex = 3` 只表示用户选中了第 3 项，不表示它已经成功提交。如果失败时必须回到最后一次成功结果，`selectedIndex` 和 `committedIndex` 就不能混成一个字段。

`copy` 也是按属性复制。如果属性内部是可变集合，新旧状态仍可能共享同一个可变对象。`data class` 和 `val` 方便我们写出新的状态，却不会自动保证整个对象图完全不可变。

:::
:::

:::slide {"kind":"matrix","chapter":"classes","eyebrow":"ONE COLON / DIFFERENT POSITIONS"}
## 原来冒号也能表示继承

学到类以后，冒号出现在了新的位置。它仍然在说明类型关系，只是这一次左边本身就是一个类。

| 出现位置 | 例子 | 读法 |
| --- | --- | --- |
| 名字后面 | `val text: String` | text 的类型是 String |
| 函数括号后 | `fun load(): Result` | 函数返回 Result |
| 类头中 | `class Child : Parent()` | Child 继承 Parent |

:::detail

所以“冒号后面是继承”并不算完全理解错，只是它只适用于类声明中的那个位置。

判断方法很简单：

```text
值或参数后面   → 这个值的类型
函数括号后面   → 函数结果的类型
类名或构造器后 → 父类与接口
```

三种写法背后仍有一条共同线索：冒号右边都在补充左边的类型信息。变量的右边是它允许持有的类型；函数的右边是结果类型；类的右边则是它所属的上层类型。

到这里再引入类和继承，前面的冒号才有了可以对照的新含义。这个顺序比一开始就把三种用法同时摆出来更容易建立稳定直觉。

:::
:::

:::slide {"kind":"code","chapter":"classes","eyebrow":"CLASS AND CONSTRUCTOR / PROPERTIES","caption":"类名后的括号是主构造函数；参数前带 val 或 var 时，它同时成为对象属性。"}
## 类和构造参数

类可以先理解成对象的设计图。类名后的括号说明创建对象时需要哪些数据。

```kotlin
class TemplateManager(
    val creationId: String,
    private var selectedIndex: Int = 0,
) {
    fun select(index: Int) {
        selectedIndex = index
    }
}
```

:::detail

创建对象时，调用类的构造函数：

```kotlin
val manager = TemplateManager(
    creationId = "123",
    selectedIndex = 0,
)
```

构造参数前带 `val` 或 `var` 时，它同时成为对象属性。`creationId` 可以通过 `manager.creationId` 读取；`selectedIndex` 是 `private`，只能由类内部使用。

如果参数前没有 `val/var`，它就不是这个类保存的属性，通常用于初始化其他属性或继续传给父类：

```kotlin
class TemplateSession(
    host: TemplateHost,
    private val editor: TemplateEditor,
) : BaseSession(host)
```

`private val editor: TemplateEditor` 可以逐段翻译成：当前类私下保存一个名为 `editor` 的只读引用，它必须满足 `TemplateEditor` 这个类型。

外部把对象需要的能力从构造函数传进来，类内部通过接口使用它，常被称为构造函数注入。但在理解这种架构用法之前，先把它看作普通的参数传递和属性声明即可。

:::
:::

:::slide {"kind":"code","chapter":"inheritance","eyebrow":"INTERFACE AND BASE CLASS","caption":"接口规定必须具备的能力，父类提供可以继承的状态与实现。"}
## 接口、继承和重写

接口描述“谁实现我，谁就必须提供这些能力”；父类还可以保存状态并提供已有实现。

```kotlin
interface TemplateApi {
    fun apply(): Boolean
}

open class BaseSession(protected val host: TemplateHost)

class TemplateSession(host: TemplateHost) :
    BaseSession(host), TemplateApi {
    override fun apply(): Boolean = true
}
```

:::detail

Kotlin 不使用 Java 的 `extends` 和 `implements`，父类和接口都统一列在冒号后面：

```kotlin
class TemplateSession : BaseSession(), TemplateApi
```

`BaseSession()` 有括号，因为这里要调用父类构造函数；`TemplateApi` 没有括号，因为接口不是要被创建的对象，而是一份能力合同。

普通 Kotlin 类和成员默认不能被继承或重写。父类愿意开放扩展时写 `open`，子类提供自己的实现时写 `override`。

如果重写后还要执行父类原来的实现，可以使用 `super`：

```kotlin
override fun onCreate() {
    super.onCreate()
    host.showToast("模板会话已创建")
}
```

不过 `super` 放在前面还是后面不是固定语法模板，而是执行顺序问题。编译通过只说明类型关系成立，不说明生命周期顺序一定符合项目约束。

:::
:::

:::slide {"kind":"code","chapter":"review","eyebrow":"READ THE WHOLE / FROM BASICS TO CLASS","caption":"现在重新阅读完整声明，每一部分都能落回前面已经学过的基础语法。"}
## 最后再读一段完整代码

从第一行开始，依次找变量、类型、状态变化、函数结果，最后才看父类和接口。

```kotlin
class TemplateSession(
    private val host: TemplateHost,
    private var state: TemplateState,
) : BaseSession(host), TemplateApi {
    override fun apply(): Boolean {
        state = state.copy(loading = true)
        host.showToast("开始应用模板")
        return true
    }
}
```

:::detail

现在可以按对话中的学习顺序逐段翻译：

1. `class TemplateSession`：声明一个类。
2. `private val host: TemplateHost`：类内部保存一个不能重新赋值的宿主引用。
3. `private var state: TemplateState`：类内部保存一份以后可以替换的状态。
4. `: BaseSession(host), TemplateApi`：继承父类并实现接口。
5. `override fun apply(): Boolean`：实现上层类型规定的函数，并返回真假结果。
6. `state.copy(loading = true)`：从旧状态产生一份加载中的新状态。
7. `return true`：把函数结果交回调用者。

这就是为什么基础语法应该先于复杂类结构。没有 `val/var`、参数、返回值和 `copy` 的基础，完整类声明只会变成一堆需要硬背的符号；先理解局部以后，类只是把这些已经认识的部分组织成一个对象。

以后遇到新代码，也可以继续沿用这个顺序：先读值和类型，再读判断与函数，然后理解数据怎样变化，最后才追踪类、接口和继承关系。

### 继续阅读

- [Kotlin 官方文档：基础语法](https://kotlinlang.org/docs/basic-syntax.html)
- [Kotlin 官方文档：空安全](https://kotlinlang.org/docs/null-safety.html)
- [Kotlin 官方文档：函数](https://kotlinlang.org/docs/functions.html)
- [Kotlin 官方文档：类与构造函数](https://kotlinlang.org/docs/classes.html)
- [Kotlin 官方文档：继承](https://kotlinlang.org/docs/inheritance.html)

:::
:::
