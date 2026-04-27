---
title: "Spring Security 里 JWT 登录大致怎么做？"
slug: "spring-security-jwt"
category: "Spring"
tags: ["Spring Security", "JWT", "登录", "认证"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 2400
summary: "JWT 登录通常在认证成功后签发 Token，请求进入过滤器校验 Token 并写入安全上下文。"
---

## 一句话结论

Spring Security 集成 JWT 通常是在登录认证成功后签发 Token，后续请求由过滤器解析 Token、校验身份，并把认证信息放入安全上下文。

## 通俗解释

JWT 像一张带签名的临时通行证。第一次登录拿证，后面进门时门卫检查通行证是否真实、是否过期。

## 面试回答

典型流程：

1. 用户提交用户名密码。
2. Spring Security 认证成功。
3. 服务端生成 JWT 返回给前端。
4. 前端后续请求携带 Token。
5. 自定义过滤器解析 Token。
6. 校验签名、过期时间和用户状态。
7. 构造认证对象放入 SecurityContext。

项目里还要考虑刷新 Token、退出登录、黑名单、权限变更、密钥安全等问题。

## 常见追问

### JWT 是不是完全无状态？

可以无状态，但如果要支持主动退出、踢人、权限即时变更，通常还需要服务端存黑名单或版本号。

### JWT 放哪里更好？

要结合端类型和安全风险。放 Cookie 要考虑 CSRF，放 localStorage 要考虑 XSS。

## 易错点

- JWT 不是加密数据，默认只是签名防篡改。
- Token 泄露后在过期前可能被冒用。
- 不能把敏感明文塞进 JWT payload。

## 记忆钩子

**JWT 是签名通行证，过滤器是门卫。**
