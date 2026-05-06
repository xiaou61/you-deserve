---
title: "Code Cache 满了会怎样？"
slug: "jvm-code-cache"
category: "JVM"
tags: ["JVM", "Code Cache", "JIT"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "进阶追问"
order: 4190
summary: "Code Cache 存放 JIT 编译后的机器码，满了会影响后续编译和性能。"
---

## 一句话结论

Code Cache 不是堆内存，它保存已编译代码；容量不足时 JVM 可能停止部分编译，导致性能下降。

## 通俗解释

Code Cache 像厨房备菜台，台面满了，新菜就没地方优化加工。

## 面试回答

可以从这几层回答：

- JIT 编译后的本地代码会放入 Code Cache。
- Code Cache 满可能出现 CodeCache is full 等日志。
- 后续热点代码无法继续编译，会退回解释或低优化执行。
- 可通过 ReservedCodeCacheSize、分层编译和监控 JIT 日志排查。

回答时最好补一句：这个点不是孤立知识点，真正落地时要结合业务场景、数据规模和失败兜底，说明你不是只背概念。

## 常见追问

### 这题最容易被追问的边界是什么？

重点说清堆外内存、容器限制、GC 停顿、类加载泄漏、JIT 退化和版本默认值变化。不要只给结论，要说明哪些条件下结论成立，哪些条件下会退化或需要换方案。

### 怎么证明自己不是在背模板？

用GC 日志、JFR、jcmd、jstack、jmap、NMT、CodeCache、Safepoint 和线程状态做验证。能说出具体信号、反例或排查入口，答案就从概念层进入实战层。

### 和相近方案怎么区分？

可以拿GC 参数、内存拆分、对象生命周期分析、类加载排查或运行时采样对比，从停顿时间、吞吐、内存占用、排障成本和 JDK 版本几个维度选择。

### 面试官继续深挖时怎么展开？

先围绕“JIT 编译后的本地代码会放入 Code Cache。”讲清主链路，再补“补 ReservedCodeCacheSize、分层编译和 segmented code cache、jcmd Compiler.codecache、PrintCodeCache、code cache flushing、nmethod/code cache sweeper、满后日志和性能表现”。如果能把边界条件、异常分支和验证闭环连起来，就能接住二面、三面的追问。

## 易错点

- 只看堆内存和 GC，忽略非堆区域。
- 发现性能抖动时不看 JIT/Code Cache 指标。

## 详细讲解

Code Cache 满了会怎样？ 这道题现在要从“能背出来”修到“能接住追问”。核心结论是：Code Cache 存放 JIT 编译后的机器码，满了会影响后续编译和性能。回答时先把它放回JVM语境，说明它解决什么矛盾，再围绕运行时结构、参数开关、日志指标、排障工具和版本差异展开。这样能避免泛泛而谈，也能让面试官听出你知道这题的真实边界。

第一步是拆清问题背景。Code Cache 像厨房备菜台，台面满了，新菜就没地方优化加工。在JVM题里，背景不能写成空泛的工程套话，而要落到把内存区域、类加载、JIT、GC 或 safepoint 放到真实运行时链路里解释。如果只说“看场景”或“加组件”，读者很难知道下一步该检查什么；如果能把输入、状态、依赖和输出说清，答案就有了主线。

第二步是讲机制。可以围绕这些点展开：JIT 编译后的本地代码会放入 Code Cache。；Code Cache 满可能出现 CodeCache is full 等日志。；后续热点代码无法继续编译，会退回解释或低优化执行。；可通过 ReservedCodeCacheSize、分层编译和监控 JIT 日志排查。。每个点都要回答三个问题：它在链路里的位置是什么，它改变了什么状态，失败或边界条件下会留下什么现象。把这三件事讲清楚，追问从概念跳到实战时就不会断。

第三步是补边界。这里尤其要主动说明堆外内存、容器限制、GC 停顿、类加载泄漏、JIT 退化和版本默认值变化。只看堆内存和 GC，忽略非堆区域。；发现性能抖动时不看 JIT/Code Cache 指标。很多八股答案的问题不是方向错，而是没有说适用范围；一旦遇到数据规模变化、异常分支或版本差异，原来的结论就可能不成立。

第四步是补专项深度：补 ReservedCodeCacheSize、分层编译和 segmented code cache、jcmd Compiler.codecache、PrintCodeCache、code cache flushing、nmethod/code cache sweeper、满后日志和性能表现。这部分适合放在面试回答后半段，用来证明你不仅知道标准答案，也知道高频追问会往哪里挖。

最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。对这题来说，验证可以看GC 日志、JFR、jcmd、jstack、jmap、NMT、CodeCache、Safepoint 和线程状态；方案选择可以和GC 参数、内存拆分、对象生命周期分析、类加载排查或运行时采样对比。这样既保留八股题的清晰度，也能把答案讲成可落地、可排查、可复盘的经验。

## 图解提示

适合画一张结构图：确认运行时区域 -> 读取关键日志 -> 关联JVM参数 -> 定位异常对象 -> 验证版本差异 -> 沉淀排障命令。画面重点突出：Code Cache 满了会怎样？ 不是孤立概念，要把核心机制、边界风险、异常处理和验证证据放在同一张图里。

## 记忆钩子

**Code Cache 满不是 OOM，但会让热点代码没法继续优化。**
