# 题目质检 Batch 11：Java + Spring 101-110

审查时间：2026-05-03  
范围：排序后的第 101-110 道题，`content/questions/java/lock-upgrade.md` 至 `content/questions/java/stampedlock.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批整体没有需要立即下线的硬性错误，`lock-upgrade`、`reflection`、`serialization`、`spring-ioc` 的正文相对扎实。但和前面 Java 批次一样，自动扩写段落仍然把大量语言/并发题套进工程化通用模板：

- 10 篇都命中通用模板，尤其 `LockSupport`、`Optional`、读写锁、StampedLock 的 `追问准备` 不够专项。
- `reentrantreadwritelock.md` 和 `stampedlock.md` 存在重复 `## 图解提示`。
- `locksupport.md` 的 `详细讲解/深挖理解` 把列表项拼进句子，如“许可证模型： - park”，需要人工润色。
- 多篇图解节点截断，如 `LockSupport 是什么。核心节…`、`notify 和 notifyAll 有什么…`、`Optional 解决什么问题。核…`、`serialV…`。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/java/lock-upgrade.md` | 正文较好，版本边界可补 | P2 | 无锁、偏向锁、轻量级锁、重量级锁的演进逻辑和性能目标讲得清楚。建议补对象头 Mark Word、锁粗化/锁消除、自适应自旋、偏向锁在不同 JDK 版本中的默认策略变化，避免把老版本实现当成今天固定事实。后半段模板需清理。 |
| 2 | `content/questions/java/locksupport.md` | 核心正确，表达有拼接痕迹 | P2 | park/unpark、许可证最多一张、unpark 可先于 park、AQS 底层使用都准确。建议补 `park(Object blocker)` 便于线程栈定位、`parkNanos/parkUntil`、中断会让 park 返回但不抛异常、返回后必须检查条件。`详细讲解` 有列表拼接问题，图解节点截断。 |
| 3 | `content/questions/java/notify-notifyall.md` | 主体正确，等待队列细节可补 | P2 | notify 唤醒一个、notifyAll 唤醒所有、醒后还要竞争锁、wait 用 while 都正确。建议补 wait 会释放 monitor、notify/notifyAll 本身不会立即释放锁、多个条件队列混用时 notify 风险高、notifyAll 可能带来惊群但更稳。图解节点有截断。 |
| 4 | `content/questions/java/object-common-methods.md` | 基础可用，契约细节不足 | P2 | Object 方法分类清楚，wait/notify 和 finalize 的说明也可用。建议补 equals/hashCode 契约、HashSet/HashMap 影响、`clone` 是 protected 且默认浅拷贝、`getClass` vs `instanceof` 在 equals 中的取舍、`finalize` 已废弃趋势。后半段模板仍不贴。 |
| 5 | `content/questions/java/optional.md` | 核心正确，滥用边界可加强 | P2 | Optional 作为返回值表达可能为空、orElse/orElseGet、map/flatMap 都正确。建议补 `orElse` eager 计算的例子、`orElseThrow`、不要对 Optional 调 `get`、不建议字段/参数/序列化 DTO 中使用、Optional 本身不是消除空指针的魔法。图解节点截断。 |
| 6 | `content/questions/java/reentrantreadwritelock.md` | 方向正确，锁升级/降级需精细 | P2 | 读读共享、写互斥、读多写少场景正确。建议补锁降级标准写法：持有写锁后获取读锁再释放写锁；读锁升级写锁容易死锁；公平/非公平模式；写线程饥饿；读锁里不能做长耗时外部调用。重复 `图解提示`，且图解把“锁升级风险”表述得不够准确，应改成“读锁升级风险”。 |
| 7 | `content/questions/java/reflection.md` | 正文扎实，可保留 | P2 | 运行时获取类信息、创建对象、调用方法、框架场景、性能/封装/维护成本都讲得较好。建议补 JDK 9+ 模块化强封装对反射的影响、`setAccessible` 风险、反射结果缓存、MethodHandle 与反射对比、注解和泛型元数据获取。后半段仍需去模板。 |
| 8 | `content/questions/java/serialization.md` | 正文较完整，安全边界可再补 | P2 | Serializable、serialVersionUID、transient、静态字段、原生序列化性能和安全风险都讲到了。建议补 `readObject/writeObject`、`readResolve`、对象图和循环引用、反序列化白名单/过滤器、serialVersionUID 只能管版本兼容，不能解决安全问题。图解节点截断。 |
| 9 | `content/questions/java/spring-ioc.md` | 正文质量高，可作为优质稿 | P2 | IoC/DI、BeanDefinition、BeanPostProcessor、AOP 代理、三级缓存循环依赖、构造器注入都讲得不错。建议补 BeanFactory vs ApplicationContext、作用域、生命周期回调顺序、依赖注入失败的排查入口。主要问题是后半段仍套 Java 通用模板。 |
| 10 | `content/questions/java/stampedlock.md` | 基础正确，使用风险可补 | P2 | 写锁、悲观读、乐观读、stamp、validate、不可重入都正确。建议补 `tryConvertToWriteLock`、`unlock(stamp)` 必须匹配、乐观读期间读取多个字段要在 validate 前后组织好、无 Condition 支持、不可重入导致嵌套调用风险、适合底层数据结构不适合复杂业务锁。重复 `图解提示`。 |

## 优先修复建议

1. 先修 `locksupport.md` 的列表拼接，把 park/unpark 说明恢复成自然段或独立列表。
2. 合并 `reentrantreadwritelock.md`、`stampedlock.md` 的重复 `图解提示`，并修复截断节点。
3. 并发锁题统一补“边界和坑”：LockSupport 虚假返回/中断、notifyAll 惊群、读写锁锁降级/升级、StampedLock stamp 释放匹配和不可重入。
4. `spring-ioc.md`、`reflection.md`、`serialization.md` 正文质量较好，优先清理模板段和补专项追问即可。
5. Java 基础题继续把 `追问准备` 从“数据量 10 倍/灰度回滚”改成 API 行为、源码边界和真实排查入口。
