---
title: FactoryBean 是什么？
slug: factorybean
category: Spring
tags:
  - Spring
  - FactoryBean
  - IoC
  - 扩展点
difficulty: hard
route: Java 后端上岸路线
scene: 二面加分
order: 2360
summary: FactoryBean 是一种特殊 Bean，它本身是工厂，容器获取它时通常返回工厂生产的对象。
---
## 一句话结论

FactoryBean 是 Spring 提供的特殊 Bean，它本身是工厂，容器获取时默认返回它生产出来的对象，而不是工厂对象本身。

## 通俗解释

普通 Bean 像货架上的商品，FactoryBean 像一台机器。你找它要东西时，拿到的通常是机器生产出的商品。

## 面试回答

FactoryBean 常用于创建复杂对象，尤其是对象创建过程不能简单通过构造器或属性注入完成时。

它常见方法：

- `getObject()`：返回真正要暴露的对象。
- `getObjectType()`：返回对象类型。
- `isSingleton()`：是否单例。

如果想获取 FactoryBean 本身，需要在 Bean 名称前加 `&`。

## 常见追问

### FactoryBean 和 BeanFactory 有什么区别？

BeanFactory 是容器接口，FactoryBean 是一个能生产对象的特殊 Bean。

### 为什么 `&beanName` 能拿到工厂？

默认 beanName 返回 FactoryBean 的产品对象，加 & 才表示获取 FactoryBean 本身。

### getObjectType 有什么用？

让容器提前知道产品类型，支持按类型查找、自动装配和条件判断。

### FactoryBean 适合什么场景？

适合代理对象、复杂客户端、Mapper 接口、连接工厂等普通构造不方便的对象。

## 易错点

- FactoryBean 不是 BeanFactory。
- 默认拿到的是产品对象，不是工厂本身。
- 适合复杂对象创建，不要滥用。

## 详细讲解

FactoryBean 是什么，这类题真正难的地方不在接口定义，而在“容器里同一个名字，为什么有时拿到工厂，有时拿到产品”。先用一句话压住主题，比如 FactoryBean 是一种特殊 Bean，它本身是工厂，容器获取它时通常返回工厂生产的对象，然后把注意力放到取对象这一步，而不是泛泛讲 IoC。

更顺的讲法，是先把普通 Bean 和 FactoryBean 区分开。普通 Bean 注册进去以后，`getBean("xxx")` 拿到的就是这个对象本身；FactoryBean 注册进去后，容器会先接住工厂，再决定对外默认暴露 `getObject()` 生产出来的产品。也就是说，Spring 不只是帮你管对象，还帮你管“生产对象的逻辑”。

这题最容易让人答混的地方，有两个。第一，FactoryBean 不是 BeanFactory，前者是特殊 Bean，后者是容器本身；第二，beanName 默认返回的是产品对象，不是工厂，所以 `&beanName` 这个细节一定要主动讲。面试官如果追这个，通常就是在看你有没有真的理解 Spring 对外暴露对象时做过一次转手。

继续追问时，常见方向是“FactoryBean 和 BeanFactory 有什么区别”和“为什么 `&beanName` 能拿到工厂”。这里比较好的答法，是给出可验证的观察方式：直接打印 `getBean("beanName").getClass()` 和 `getBean("&beanName").getClass()` 看看是不是两个对象；再结合 `getObjectType()` 解释为什么容器能提前做按类型注入、条件装配和自动配置判断。只要你能把“名字相同，暴露对象不同”讲清楚，这题就稳了。

放回项目里，FactoryBean 出现得其实不少。MyBatis 的 Mapper 接口、某些代理客户端、连接工厂、复杂 SDK 封装，本质上都不是简单 new 一个对象就完事，而是需要容器先接住一段创建逻辑，再把最后产物交给业务。读者一旦知道它常常出现在“对象创建过程很复杂”的地方，就不会把它看成冷门八股。

这里也有取舍。FactoryBean 的好处是把复杂对象构造过程隐藏进容器扩展点里，让业务层拿到的是干净的最终对象；代价是对象来源不再那么直观，调试时必须分清自己拿到的是工厂还是产品。像 FactoryBean 不是 BeanFactory 这种坑，说到底就是在提醒你：一旦对象创建逻辑被包装起来，认知成本也会跟着上来。

最后收口时，可以把这题讲成“为什么有些对象不能直接构造、Spring 如何通过 FactoryBean 托管这段创建逻辑、默认暴露的是产品还是工厂、出了问题怎么从 `&beanName` 和实际类型去验证”的闭环。这样就比单纯背三个方法更像真的理解过它。

## 图解提示

适合画一张“工厂与产品”关系图：容器先注册 FactoryBean -> 调用 `getObjectType()` 做类型判断 -> 默认通过 `getObject()` 暴露产品对象 -> 旁边再补一条 `&beanName` 分支拿到工厂本身。重点画清“同一个 beanName，对外可能拿到两个不同层次的对象”。

## 记忆钩子

**FactoryBean 是容器里的造物机器。**
