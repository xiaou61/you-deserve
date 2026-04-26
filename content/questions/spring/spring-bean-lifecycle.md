---
title: "Spring Bean 生命周期有哪些关键步骤？"
slug: "spring-bean-lifecycle"
category: "Spring"
tags: ["Java", "Spring", "Bean", "生命周期"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 190
summary: "按实例化、属性填充、初始化、使用、销毁理解 Bean 生命周期。"
---

## 一句话结论

Spring Bean 生命周期可以简化理解为：实例化、属性填充、Aware 回调、BeanPostProcessor 前置处理、初始化、BeanPostProcessor 后置处理、使用、销毁。

## 通俗解释

Spring 创建 Bean 像培养一个员工入职。先招人进来，再分配工位和工具，然后告诉他公司环境，入职培训，正式上岗，离职时再做收尾。

Bean 生命周期就是 Spring 从创建对象到销毁对象的完整管理流程。

## 面试回答

常见流程可以这样说：

1. 实例化 Bean，也就是创建对象。
2. 属性填充，完成依赖注入。
3. 如果实现了 Aware 接口，回调相关方法，让 Bean 感知容器信息。
4. 执行 BeanPostProcessor 的前置处理。
5. 执行初始化方法，比如 `@PostConstruct`、`InitializingBean`、自定义 init-method。
6. 执行 BeanPostProcessor 的后置处理，这一步也常和 AOP 代理创建有关。
7. Bean 可以被业务使用。
8. 容器关闭时执行销毁逻辑，比如 `@PreDestroy`、`DisposableBean`、destroy-method。

## 常见追问

### AOP 代理一般在哪一步生成？

通常和 BeanPostProcessor 的后置处理有关。Spring 会在 Bean 初始化后，通过后置处理器决定是否为 Bean 创建代理对象。

### BeanFactoryPostProcessor 和 BeanPostProcessor 有什么区别？

BeanFactoryPostProcessor 处理的是 Bean 定义信息，发生在 Bean 实例化之前。BeanPostProcessor 处理的是 Bean 实例本身，发生在 Bean 创建过程中。

## 易错点

- 不要把 Bean 定义处理和 Bean 实例处理混为一谈。
- 不要只背生命周期名词，要能串成创建流程。
- 不要忘记 AOP 代理和后置处理器的关系。

## 记忆钩子

**Spring 造 Bean：先造人，再装配，再培训，最后可能套一层代理工牌。**
