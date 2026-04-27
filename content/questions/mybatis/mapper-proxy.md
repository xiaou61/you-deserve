---
title: "MyBatis Mapper 接口为什么不用实现类？"
slug: "mybatis-mapper-proxy"
category: "MyBatis"
tags: ["MyBatis", "Mapper", "动态代理"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "一面/二面高频"
order: 1140
summary: "理解 MyBatis 通过动态代理为 Mapper 接口生成代理对象并执行 SQL。"
---

## 一句话结论

MyBatis 会为 Mapper 接口创建动态代理对象，方法调用时根据接口方法定位对应 SQL 并执行，所以不需要手写实现类。

## 通俗解释

Mapper 接口像菜单，XML 或注解 SQL 像后厨做法。你点菜单上的菜，服务员代理会去后厨按对应做法执行。

## 面试回答

MyBatis 启动时会解析 Mapper 接口和 XML 映射关系。运行时通过动态代理生成 Mapper 代理对象。

调用接口方法时，代理对象会根据 namespace、方法名、参数等找到 mapped statement，然后通过 SqlSession 执行 SQL，并把结果映射成返回对象。

## 常见追问

### XML 的 namespace 有什么用？

通常对应 Mapper 接口全限定名，用来把接口方法和 SQL 语句绑定起来。

### 方法重载要注意什么？

MyBatis 根据方法和映射语句绑定，重载可能带来映射不清晰，不建议在 Mapper 中滥用重载。

## 易错点

- 不要说 Mapper 接口“自动实现”就结束，要讲动态代理。
- 不要忽略 namespace 和方法绑定。
- 不要把 Mapper 当普通 DAO 实现类。

## 记忆钩子

**Mapper 是菜单，动态代理是服务员，SQL 是后厨。**
