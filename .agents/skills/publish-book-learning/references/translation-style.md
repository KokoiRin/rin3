# 表达示例

这些例子用于把握改写尺度，不是固定句式。每次仍以对应原文为准。

## 把动作和时机说清楚

原表达：在 LifecycleOwner 生命周期中的状态保存阶段，SavedStateRegistry 将调用该方法。

改写：到了 LifecycleOwner 保存状态的阶段，SavedStateRegistry 就会调用这个方法。

调用者和触发时机都不变，只拆掉了层层嵌套的名词。不能把时机泛化成“页面关闭时”。

## 保留条件和对比

原表达：与 saved state 不同，ViewModel 会在系统发起的进程终止期间被销毁。

改写：但进程被系统结束时，ViewModel 也会一起消失，这一点和 saved state 不同。

保留“进程被系统结束”的条件，以及与 saved state 的区别；不能缩成“退出页面，ViewModel 就没了”。

## 让动作容易跟上

原表达：在 saveState() 方法中返回包含要保存状态的 Bundle。

改写：你在 saveState() 中把要保存的状态装进 Bundle，再返回它。

保存内容、容器和返回动作都还在，也没有额外承诺数据何时保存、能保留多久。
