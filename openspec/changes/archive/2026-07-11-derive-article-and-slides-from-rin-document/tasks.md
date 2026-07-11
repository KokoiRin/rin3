## 1. 建立 RIN 文档模型

- [x] 1.1 为合法文档、区块顺序和非法组件数据补充解析行为测试
- [x] 1.2 实现共享的 Slide 类型、RIN 文档解析器与文章 Markdown 投影

## 2. 生成两种展示形式

- [x] 2.1 为各类 RIN 区块实现 Slide 编译，并补充 prose 通用版式
- [x] 2.2 接入文章与 Slide 路由、元数据、默认文章入口和双向切换按钮

## 3. 迁移现有内容

- [x] 3.1 将“RIN III Slides 组件使用说明”改为 winter/me 分区下的 RIN 文档，并移除旧的手写 deck
- [x] 3.2 删除“Eigenvalues: Scale Along Stable Directions”，同步更新作者说明文档

## 4. 验证与收敛

- [x] 4.1 更新静态输出测试，覆盖单一列表入口、双路由、双向切换和 Eigenvalues 消失
- [x] 4.2 运行测试、构建、lint、diff 检查和浏览器视觉验证
