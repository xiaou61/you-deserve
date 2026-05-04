# 题目质检 Batch 10：Java + JVM 91-100

审查时间：2026-05-03  
范围：排序后的第 91-100 道题，`content/questions/java/java-annotation-retention-target.md` 至 `content/questions/java/lambda-effectively-final.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 Java 语言新特性、泛型、SPI、时间 API、JVM GC Roots 和 Lambda。短答案大多方向正确，但自动扩写的模板污染比前两批更集中：

- 除 `jvm-gc-roots.md` 外，其余 9 篇都存在重复 `## 图解提示`。
- 10 篇全部命中“数据量或并发量扩大 10 倍”“灰度、压测和回滚策略”“配置不生效”“JFR/GC 日志”等泛化模板，导致语言基础题被讲成项目治理题。
- `java-time-api.md` 对 Date 的描述存在不严谨：`Date` 本身表示时间点，不携带格式化规则和时区；问题更多来自旧 API 设计混乱、可变性、`Calendar`/`SimpleDateFormat` 以及默认时区显示。
- 多篇 `常见追问` 仍是占位式回答，只重复正文短句，尤其注解、SPI、通配符、不可变对象、record、sealed class、lambda。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/java/java-annotation-retention-target.md` | 基础正确，追问占位 | P2 | Retention 管保留阶段、Target 管使用位置，SOURCE/CLASS/RUNTIME 的区分正确。建议补默认 Retention 是 CLASS、`@Inherited`、`@Documented`、`@Repeatable`、`ElementType.TYPE_USE`，以及为什么 Spring 自定义注解通常要 RUNTIME。重复 `图解提示`，节点截断。 |
| 2 | `content/questions/java/java-classpath-jar-conflict.md` | 排查方向正确，工具链可加强 | P2 | 依赖树、最近优先/声明优先、CodeSource、排除传递依赖和 BOM 都对。建议补常见症状 `NoSuchMethodError`、`ClassNotFoundException`、`NoClassDefFoundError`；补 `mvn dependency:tree -Dincludes=...`、`mvn help:effective-pom`、Gradle dependencyInsight、shade/relocation、容器 classloader 差异。重复 `图解提示`。 |
| 3 | `content/questions/java/java-generics-wildcard.md` | PECS 正确，示例不足 | P2 | extends 读、super 写、PECS 口诀正确。建议补具体例子：`List<? extends Animal>` 能读 Animal 但不能 add Dog，`List<? super Dog>` 能 add Dog 但读出 Object；补 `List<Dog>` 不是 `List<Animal>` 子类型、wildcard capture 和 API 设计场景。重复 `图解提示`，节点截断。 |
| 4 | `content/questions/java/java-object-immutability.md` | 核心正确，安全发布可补 | P2 | final 类、private final 字段、无 setter、防御性拷贝都准确。建议补 final field safe publication、构造期 this 逃逸、深拷贝 vs 浅拷贝、`Collections.unmodifiableList` 只是视图、`List.copyOf`/不可变集合、record 也是浅不可变。重复 `图解提示`。 |
| 5 | `content/questions/java/java-record.md` | 方向正确，版本和边界可补 | P2 | record 适合 DTO/值对象/配置结果，浅不可变和不适合作 JPA 实体都正确。建议补 Java 16 正式引入、canonical/compact constructor、record 类隐式 final、不能继承其他类、组件字段 final、可实现接口、对可变组件仍需防御性拷贝。重复 `图解提示`。 |
| 6 | `content/questions/java/java-sealed-class.md` | 核心正确，约束细节可补 | P2 | sealed/permits、子类 final/sealed/non-sealed、受控扩展点讲对了。建议补 permitted 子类在同一 module 或未命名模块同包的限制、与 pattern matching/switch 穷尽检查的关系、sealed 不是安全权限控制、开放插件接口不宜滥用 sealed。重复 `图解提示`。 |
| 7 | `content/questions/java/java-spi.md` | 基础正确，运行细节不足 | P2 | 接口、`META-INF/services`、`ServiceLoader` 的主线正确。建议补配置文件内容是实现类全限定名、ServiceLoader 懒加载、实现类无参构造要求、类加载器差异、多个实现的顺序/优先级不保证、`ServiceConfigurationError`、JDBC Driver 示例。重复 `图解提示`，节点截断。 |
| 8 | `content/questions/java/java-time-api.md` | 有事实表述不严谨 | P1 | java.time 类型清晰、不可变、线程安全、`DateTimeFormatter` 更安全这些都正确。但“Date 把时间点、格式化和时区语义混在一起”不够准确：`Date` 本身主要表示时间点，格式和时区更多来自 `Date.toString`、`Calendar`、`SimpleDateFormat` 和默认时区。建议改成“旧日期时间 API 语义分散且易误用”，并补 `Instant` 保存绝对时间、`LocalDateTime` 不带时区不能直接表示跨时区时间点。重复 `图解提示`。 |
| 9 | `content/questions/java/jvm-gc-roots.md` | 正文扎实，可保留 | P2 | 可达性分析、GC Roots、不可达不等于立刻回收、泄漏排查引用链都讲得好。建议补强/软/弱/虚引用处理顺序、类卸载与 ClassLoader Root、线程栈和 JNI Root、MAT dominator tree 的判断方式。主要问题是后半段仍套 Java 通用模板。 |
| 10 | `content/questions/java/lambda-effectively-final.md` | 核心正确，闭包边界可补 | P2 | effectively final、局部变量捕获值、生命周期和并发语义都正确。建议补实例字段/静态字段不受该限制但有并发风险、匿名内部类历史上要求显式 final、lambda 捕获变量编译实现、不要用数组/AtomicReference 绕限制制造副作用，优先用 stream reduce/collector。重复 `图解提示`，节点截断。 |

## 优先修复建议

1. 先修 `java-time-api.md` 的 Date 表述，避免把 Date 本身说成同时保存格式和时区。
2. 合并 9 篇重复 `图解提示`，并把截断节点恢复成完整短句。
3. `常见追问` 要专项化：注解问默认 Retention、SPI 问类加载器和多实现、record 问浅不可变、sealed 问 permits 约束、lambda 问捕获和副作用。
4. `jvm-gc-roots.md` 正文质量高，不需要大改；只需清理通用模板，并把追问继续围绕堆转储、引用链和泄漏排查展开。
5. 泛型相关题要统一补代码示例，并用反引号保护 `? extends T`、`? super T`、`List<Dog>` 等尖括号文本，防止渲染和生成时丢失。
