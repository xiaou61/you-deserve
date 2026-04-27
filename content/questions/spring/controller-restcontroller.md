---
title: "@Controller 和 @RestController 有什么区别？"
slug: "controller-restcontroller"
category: "Spring"
tags: ["Spring MVC", "Controller", "RestController", "接口"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面基础"
order: 1500
summary: "@RestController 等价于 @Controller 加 @ResponseBody，默认返回 JSON 等响应体。"
---

## 一句话结论

`@RestController` 可以理解为 `@Controller` 加 `@ResponseBody`，适合写前后端分离接口；`@Controller` 更常用于返回页面视图。

## 通俗解释

`@Controller` 像带你去某个页面，`@RestController` 像直接把数据打包给你。

## 面试回答

`@Controller` 是 Spring MVC 控制器注解，方法返回值默认可能被解析成视图名。如果要返回 JSON，需要在方法上加 `@ResponseBody`。

`@RestController` 是组合注解，包含 `@Controller` 和 `@ResponseBody`，类中方法默认把返回值写入 HTTP 响应体，常用于 REST API。

现在前后端分离项目里，大多数接口控制器会使用 `@RestController`。

## 常见追问

### @ResponseBody 的作用是什么？

它表示方法返回值不是视图名，而是直接写入响应体，常通过消息转换器转成 JSON。

### 返回页面时应该用哪个？

如果返回模板页面，一般用 `@Controller`。

## 易错点

- 不要说二者没有区别。
- 不要把 `@RestController` 用在需要跳转页面的控制器上。
- JSON 转换依赖消息转换器，不是注解自己手写 JSON。

## 记忆钩子

**Controller 找页面，RestController 给数据。**
