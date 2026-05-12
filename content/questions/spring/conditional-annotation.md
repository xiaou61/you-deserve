---
title: '@Conditional 注解有什么用？'
slug: spring-conditional-annotation
category: Spring
tags:
  - Spring
  - '@Conditional'
  - 自动配置
  - 条件装配
difficulty: hard
route: Java 后端上岸路线
scene: Spring Boot 原理追问
order: 1920
summary: '@Conditional 用于按条件决定 Bean 是否装配，是 Spring Boot 自动配置的重要基础。'
---
## 一句话结论

`@Conditional` 用来根据条件决定某个 Bean 或配置类是否生效，是 Spring Boot 自动配置能按需装配的关键机制。

## 通俗解释

它像开关规则。只有满足“仓库里有某个依赖”“配置里打开某个开关”时，Spring 才把这个组件装进系统。

## 面试回答

`@Conditional` 的核心是条件匹配。Spring 在注册 Bean 时，会判断条件是否成立，成立才装配。

Spring Boot 在它基础上提供了很多常见条件注解：

- `@ConditionalOnClass`：类路径下存在某个类才生效。
- `@ConditionalOnMissingBean`：容器里没有某个 Bean 才生效。
- `@ConditionalOnProperty`：配置项满足条件才生效。
- `@ConditionalOnBean`：容器里存在某个 Bean 才生效。

这些注解让 starter 可以做到“引入依赖后自动配置，但用户自定义时又能让用户优先”。

## 常见追问

### @Conditional 在什么时候判断？

主要在配置解析和 BeanDefinition 注册阶段判断，条件不满足时 Bean 不会注册。

### ConditionContext 能拿到什么？

能拿 Environment、BeanFactory、ClassLoader、ResourceLoader 等上下文信息。

### Spring Boot 哪些条件注解常见？

`@ConditionalOnClass`、`@ConditionalOnMissingBean`、`@ConditionalOnProperty`、`@ConditionalOnBean` 等。

### 怎么排查自动配置没生效？

看 debug 启动日志、ConditionEvaluationReport、Actuator conditions 和相关配置属性。

## 易错点

- 不要把条件装配理解成运行时每次调用都判断。
- 条件判断主要发生在容器装配阶段。
- Spring Boot 自动配置不是无脑装配。

## 详细讲解

@Conditional 注解有什么用 这类题更像“启动期决策题”，不是背几个注解名就够了。先把大意压住，比如 @Conditional 用于按条件决定 Bean 是否装配，是 Spring Boot 自动配置的重要基础，然后把注意力放到 Spring Boot 启动时怎样收集配置、判断条件、决定某个 Bean 要不要注册。只要读者脑子里有“启动期就已经做了很多选择”这根主线，后面的优先级、Profile、自动配置和属性绑定就都能串起来。

更顺的讲法是从启动入口往下推。应用启动后先准备 Environment，把命令行参数、环境变量、系统属性、配置文件、配置中心这些来源按规则装进属性源列表，再由 Binder、条件注解和自动配置类去消费这些信息。像 `@ConditionalOnClass`：类路径下存在某个类才生效 这种点，真正关键的不是记住名词，而是知道它发生在 Bean 创建之前，很多结果在容器刷新阶段就已经定型。

这类题最容易让人答虚的地方，是把“配置存在”和“配置生效”混成一件事。文件里写了值，不代表最终用了它；你自己写了配置类，也不代表自动配置一定会退让。中间还隔着 profile 激活、属性覆盖顺序、条件匹配、是否已有同名 Bean、配置绑定是否成功这些步骤。把这些步骤讲清楚，内容就自然有工程味。

继续深挖时，通常会落到“@Conditional 在什么时候判断”和“ConditionContext 能拿到什么”这两个方向。这里别泛泛说看日志，而要直接说证据：会看 --debug 输出、ConditionEvaluationReport、/actuator/env、/actuator/configprops、启动时打印的 active profiles、属性绑定报错、依赖树、自动配置导入列表。配置类题的验证抓手，核心永远是“来源”和“条件”两张账。

真正有项目感的部分，是把线上故障症状翻译回来。比如某个 profile 没激活，表现出来可能是连错库；某个环境变量命名不对，表现出来可能是端口没改；某个 starter 被引进来却条件不满足，表现出来可能是预期 Bean 根本不存在；某个配置中心值刷新了但绑定对象没刷新，表现出来可能是接口继续跑旧逻辑。读者知道“会坏成什么样”，才知道为什么要记这些规则。

这类机制还有明显的取舍。Spring Boot 给了开箱即用和默认配置，代价是很多决策提前发生、而且分散在依赖、配置、条件注解和运行环境里；它让项目起步很快，但也要求你排障时别只盯一个文件。像 不要把条件装配理解成运行时每次调用都判断 这种提醒，其实说的就是同一件事：排查配置问题时，必须看最终生效结果，而不是看你主观以为应该生效的地方。

最后收口时，可以把 @Conditional 注解有什么用 讲成“启动前准备什么信息，启动中如何判断，启动后如何验证”的闭环。面试官真正想听的是：你知不知道这些默认能力是怎样被装进去的，失效时第一反应去哪里找证据，以及为什么生产上会强调配置治理和覆盖透明度。把这条链讲顺，这类 Spring Boot 题就不会再像背文档。

## 图解提示

适合画一张启动期决策图：应用启动 -> Environment 收集配置来源 -> Profile 和条件注解参与判断 -> Binder/自动配置决定 Bean 是否注册 -> 最后用条件报告或 env 端点验证最终结果。图里重点标清 `@ConditionalOnClass`：类路径下存在某个类才生效、`@ConditionalOnMissingBean`：容器里没有某个 Bean 才生效、不要把条件装配理解成运行时每次调用都判断，让“来源、条件、最终生效值”三层关系一眼能看懂。

## 记忆钩子

**Conditional 是装配开关：条件满足才上车。**
