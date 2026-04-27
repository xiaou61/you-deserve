---
title: "JWT 登录方案要注意什么？"
slug: "jwt-login"
category: "项目设计"
tags: ["JWT", "登录", "鉴权", "项目"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目高频"
order: 880
summary: "理解无状态令牌、过期时间、刷新机制、撤销和泄露风险。"
---

## 一句话结论

JWT 适合做无状态认证，但要注意过期时间、刷新令牌、服务端撤销、密钥保护和令牌泄露风险。

## 通俗解释

JWT 像一张带签名的通行证。门卫不用每次查后台，只要验证签名和有效期。但通行证丢了，别人也可能拿着进门，所以有效期和撤销机制很重要。

## 面试回答

JWT 包含 header、payload、signature。服务端签发后，客户端后续请求携带 token。服务端验证签名和过期时间，通过后识别用户身份。

项目里要注意：

- access token 有较短过期时间。
- refresh token 用于续期，并且要更安全地保存。
- 密钥不能泄露。
- 敏感信息不要放 payload。
- 需要退出登录或封禁用户时，要有黑名单、版本号或服务端状态兜底。

## 常见追问

### JWT 能不能主动失效？

纯无状态 JWT 不容易主动失效。可以引入黑名单、用户 tokenVersion、短过期时间配合 refresh token。

### JWT 放哪里更安全？

没有绝对答案。放 localStorage 容易受 XSS 影响；放 Cookie 要注意 HttpOnly、SameSite、CSRF 防护。

## 易错点

- 不要把 JWT 当成天然安全。
- 不要在 payload 放密码、手机号等敏感信息。
- 不要忽略退出登录和封禁场景。

## 记忆钩子

**JWT 是通行证：签名防伪，过期防丢，撤销要另想办法。**
