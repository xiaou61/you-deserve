# 题目质检 Batch 13：Java + JVM 121-130

审查时间：2026-05-03  
范围：排序后的第 121-130 道题，`content/questions/java/threadlocal.md` 至 `content/questions/jvm/g1-gc.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批覆盖 ThreadLocal、虚拟线程、volatile、wait/sleep 和 JVM 类加载/内存/GC 基础。前半段短答案总体方向正确，`threadlocal.md`、`volatile-visibility.md`、`wait-sleep.md`、`class-loading.md` 的基础内容可保留。主要问题集中在三个层面：

- 10 篇都命中通用工程模板，`实战落地`、`追问准备`、`回答模板` 里大量出现“数据量或并发量扩大 10 倍”“灰度、压测和回滚策略”等不贴 Java/JVM 题的表达。
- `g1-gc.md` 存在重复 `## 图解提示`，且图解节点有 `Remembered Set...` 省略截断。
- `direct-memory.md` 图解节点截断成 `DirectByteB...`、`-XX`，会直接影响读者理解参数和对象关系。
- JVM 专题题的“硬核追问”还不够：类文件结构缺少 magic/version/constant pool/Code 属性，虚拟线程缺少 JDK 21、carrier、pinning，直接内存缺少 Cleaner/NMT/容器内存边界，G1 缺少 SATB、Humongous、Evacuation Failure 等排查点。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/java/threadlocal.md` | 主体正确，线程池边界可再细 | P2 | ThreadLocalMap、弱引用 key、强引用 value、线程池必须 remove 都讲对。建议补 stale entry 清理时机并非实时、`remove` 放 finally、避免放大对象、异步任务/MDC/TraceId 透传的限制，以及 `InheritableThreadLocal`、TTL 或任务包装器的取舍。图解节点有省略截断。 |
| 2 | `content/questions/java/virtual-threads.md` | 方向正确，高阶边界不足 | P2 | 轻量级、适合阻塞 IO、不提升 CPU 密集计算都正确。建议补虚拟线程在 JDK 21 成为正式特性、carrier/platform thread、`Executors.newVirtualThreadPerTaskExecutor()`、pinning 场景如 `synchronized`、native/foreign call、ThreadLocal 滥用风险、池化虚拟线程通常没有必要。 |
| 3 | `content/questions/java/volatile-visibility.md` | 正文较强，可保留 | P2 | 可见性、禁止指令重排、不能保证复合操作原子性、DCL 场景都比较完整。建议清理 `深挖理解` 中“volatile 有两个主要作用： 1.”一类列表拼接痕迹；补 happens-before、内存屏障、`Atomic*`/锁替代方案，以及不适合用 volatile 维护复杂状态机的边界。 |
| 4 | `content/questions/java/wait-sleep.md` | 基础准确，推荐方案可补 | P2 | `wait` 必须持有锁并释放 monitor、`sleep` 不释放锁、二者都可能被中断，整体正确。建议补虚假唤醒必须用 while 检查条件、`notify` 后不会立即释放锁、`Condition`/`CountDownLatch`/`BlockingQueue` 等更高层工具的替代场景。后半段模板泛化明显。 |
| 5 | `content/questions/jvm/class-file-structure.md` | 方向正确，字节码细节偏浅 | P2 | class 文件由魔数、版本、常量池、访问标志、字段、方法、属性等组成，整体正确。建议补 `0xCAFEBABE`、minor/major version、常量池索引关系、方法 `Code` 属性、`LineNumberTable`、`StackMapTable`、`javap -v` 示例，以及源码结构和字节码结构的区别。 |
| 6 | `content/questions/jvm/class-loading.md` | 主体清楚，可作为基础稿 | P2 | 加载、验证、准备、解析、初始化五阶段讲得清楚，准备阶段默认值和初始化阶段显式赋值也区分到位。建议补主动/被动使用触发条件、父类初始化顺序、数组和编译期常量不触发初始化、`ClassNotFoundException` 与 `NoClassDefFoundError` 的区别。模板段仍需清理。 |
| 7 | `content/questions/jvm/classloader-parent-delegation.md` | 核心正确，打破机制需深化 | P2 | 双亲委派的安全性和一致性讲对，SPI、Tomcat、热部署也提到了。建议补“父加载器不是继承父类”、类唯一性由类加载器加类名共同决定、线程上下文类加载器如何支撑 SPI、Tomcat WebAppClassLoader 隔离、什么时候不该打破双亲委派。 |
| 8 | `content/questions/jvm/direct-memory.md` | 核心正确，图解截断明显 | P1 | 直接内存不属于 Java 堆、DirectByteBuffer 对象在堆内、NIO/Netty 场景和 `OutOfMemoryError: Direct buffer memory` 都正确。但图解提示把关键节点截断成 `DirectByteB...`、`-XX`，丢失 `DirectByteBuffer` 和 `-XX:MaxDirectMemorySize` 语义。建议补 Cleaner 释放、堆对象 GC 与堆外释放的关系、NMT/jcmd 排查、容器 memory limit 和 Netty allocator 配置。 |
| 9 | `content/questions/jvm/escape-analysis.md` | 概念正确，容易被讲过度 | P2 | 方法逃逸、线程逃逸、不逃逸，以及栈上分配、锁消除、标量替换都正确。建议强调逃逸分析是 JIT 优化前提，不保证一定栈上分配；补热点编译触发、标量替换比“真的栈上对象”更常见、如何用 JIT 日志/JMH 观察、不要为了猜优化而牺牲代码可读性。 |
| 10 | `content/questions/jvm/g1-gc.md` | 基础正确，有重复图解 | P1 | Region、Garbage First、Mixed GC、停顿目标、Remembered Set 都讲对。但文件有两个 `## 图解提示`，其中一个节点 `Remembered Set...` 截断，属于可见结构问题。建议补 Young GC/Mixed GC/并发标记周期、SATB、Humongous Region、Evacuation Failure、Full GC 兜底、`MaxGCPauseMillis` 不是硬 SLA，以及 GC 日志关键字段。 |

## 优先修复建议

1. 先修 `g1-gc.md` 的重复 `图解提示`，合并并补全 `Remembered Set` 节点。
2. 修复 `direct-memory.md` 图解截断，把 `DirectByteBuffer`、`MaxDirectMemorySize`、Cleaner、NMT 排查链路画完整。
3. JVM 题统一补专项追问：类加载触发条件、类加载器隔离、直接内存释放链路、逃逸分析优化可观察性、G1 日志排查。
4. 虚拟线程题补 JDK 21、carrier、pinning 和 ThreadLocal 风险；这是近几年面试很容易追问的新边界。
5. 清理 10 篇通用工程模板，把“数据量 10 倍/灰度压测回滚”改成 Java/JVM 题真正会问的 API、运行时、日志和故障边界。
