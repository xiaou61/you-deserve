---
title: "Spring 参数校验怎么做？"
slug: "spring-validation"
category: "Spring"
tags: ["Spring", "参数校验", "Validation", "接口"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 1900
summary: "Spring 参数校验常用 Bean Validation 注解配合 @Valid 或 @Validated，统一处理参数错误。"
---

## 一句话结论

Spring 常用 Bean Validation 注解做参数校验，比如 `@NotNull`、`@NotBlank`、`@Size`，再配合 `@Valid` 或 `@Validated` 触发校验。

## 通俗解释

参数校验像进门安检。格式不对、必填没填、长度超了，在进入业务逻辑前就拦住。

## 面试回答

常见做法：

- 在 DTO 字段上加校验注解。
- Controller 方法参数上加 `@Valid` 或 `@Validated`。
- 使用全局异常处理统一返回错误信息。
- 对分组场景使用 validation groups，比如新增和修改要求不同。

校验应该尽量前置，避免脏数据进入业务层。复杂业务规则可以放到业务逻辑里，不要强行全塞进注解。

## 常见追问

### @Valid 和 @Validated 有什么区别？

`@Valid` 是标准校验注解，`@Validated` 是 Spring 提供的增强，支持分组校验。

### 参数校验失败怎么返回友好提示？

通过全局异常处理捕获校验异常，提取字段和错误信息，统一封装响应。

## 易错点

- 不要只在前端校验，后端必须校验。
- 注解校验适合格式和简单规则，复杂业务规则放业务层。
- 嵌套对象校验也要加对应注解触发。

## 记忆钩子

**参数先进安检，再进业务。**
