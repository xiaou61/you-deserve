---
title: Spring Boot 启动流程大致是什么？
slug: spring-boot-startup-flow
category: Spring
tags:
  - Spring Boot
  - 启动流程
  - 自动配置
difficulty: medium
route: Java 后端上岸路线
scene: 进阶追问
order: 4260
summary: Spring Boot 启动可以按环境准备、上下文创建、Bean 加载和应用运行四段理解。
---
## 一句话结论

Spring Boot 把复杂 Spring 应用启动流程封装起来，但底层仍然围绕 ApplicationContext、BeanFactory 和自动配置展开。

## 通俗解释

启动流程像开店：准备环境、装修店面、摆货上架、正式营业。

## 面试回答

可以从这几层回答：

- SpringApplication.run 会准备 Environment、监听器和启动参数。
- 创建 ApplicationContext，并加载 BeanDefinition。
- 执行自动配置、Bean 实例化、依赖注入和生命周期回调。
- Web 应用还会启动内嵌容器并发布应用就绪事件。

## 常见追问

### BeanFactoryPostProcessor 什么时候执行？

在 Bean 实例化之前执行，用来修改 BeanDefinition 或容器级元数据。

### BeanPostProcessor 什么时候执行？

在 Bean 初始化前后执行，AOP 代理等增强通常和它有关。

### ApplicationRunner 什么时候执行？

上下文刷新完成、应用启动后执行，常用于启动后初始化，但要避免阻塞就绪。

### 启动慢怎么排查？

看启动日志、应用启动耗时分析、Bean 创建耗时、自动配置报告、外部依赖连接和 Runner 逻辑。

## 易错点

- 只说 main 方法启动，不知道 ApplicationContext 做了什么。
- 把自动配置和组件扫描混为一谈。

## 详细讲解

Spring Boot 启动流程大致是什么 这类题更像“启动期决策题”，不是背几个注解名就够了。先把大意压住，比如 Spring Boot 启动可以按环境准备、上下文创建、Bean 加载和应用运行四段理解，然后把注意力放到 Spring Boot 启动时怎样收集配置、判断条件、决定某个 Bean 要不要注册。只要读者脑子里有“启动期就已经做了很多选择”这根主线，后面的优先级、Profile、自动配置和属性绑定就都能串起来。

更顺的讲法是从启动入口往下推。应用启动后先准备 Environment，把命令行参数、环境变量、系统属性、配置文件、配置中心这些来源按规则装进属性源列表，再由 Binder、条件注解和自动配置类去消费这些信息。像 SpringApplication.run 会准备 Environment、监听器和启动参数 这种点，真正关键的不是记住名词，而是知道它发生在 Bean 创建之前，很多结果在容器刷新阶段就已经定型。

这类题最容易让人答虚的地方，是把“配置存在”和“配置生效”混成一件事。文件里写了值，不代表最终用了它；你自己写了配置类，也不代表自动配置一定会退让。中间还隔着 profile 激活、属性覆盖顺序、条件匹配、是否已有同名 Bean、配置绑定是否成功这些步骤。把这些步骤讲清楚，内容就自然有工程味。

继续深挖时，通常会落到“BeanFactoryPostProcessor 什么时候执行”和“BeanPostProcessor 什么时候执行”这两个方向。这里别泛泛说看日志，而要直接说证据：会看 --debug 输出、ConditionEvaluationReport、/actuator/env、/actuator/configprops、启动时打印的 active profiles、属性绑定报错、依赖树、自动配置导入列表。配置类题的验证抓手，核心永远是“来源”和“条件”两张账。

真正有项目感的部分，是把线上故障症状翻译回来。比如某个 profile 没激活，表现出来可能是连错库；某个环境变量命名不对，表现出来可能是端口没改；某个 starter 被引进来却条件不满足，表现出来可能是预期 Bean 根本不存在；某个配置中心值刷新了但绑定对象没刷新，表现出来可能是接口继续跑旧逻辑。读者知道“会坏成什么样”，才知道为什么要记这些规则。

这类机制还有明显的取舍。Spring Boot 给了开箱即用和默认配置，代价是很多决策提前发生、而且分散在依赖、配置、条件注解和运行环境里；它让项目起步很快，但也要求你排障时别只盯一个文件。像 只说 main 方法启动，不知道 ApplicationContext 做了什么 这种提醒，其实说的就是同一件事：排查配置问题时，必须看最终生效结果，而不是看你主观以为应该生效的地方。

最后收口时，可以把 Spring Boot 启动流程大致是什么 讲成“启动前准备什么信息，启动中如何判断，启动后如何验证”的闭环。面试官真正想听的是：你知不知道这些默认能力是怎样被装进去的，失效时第一反应去哪里找证据，以及为什么生产上会强调配置治理和覆盖透明度。把这条链讲顺，这类 Spring Boot 题就不会再像背文档。

## 图解提示

适合画一张启动期决策图：应用启动 -> Environment 收集配置来源 -> Profile 和条件注解参与判断 -> Binder/自动配置决定 Bean 是否注册 -> 最后用条件报告或 env 端点验证最终结果。图里重点标清 SpringApplication.run 会准备 Environment、监听器和启动参数、创建 ApplicationContext，并加载 BeanDefinition、只说 main 方法启动，不知道 ApplicationContext 做了什么，让“来源、条件、最终生效值”三层关系一眼能看懂。

## 记忆钩子

**Boot 启动四段：环境、上下文、Bean、容器就绪。**
