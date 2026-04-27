---
title: "Cookie、Session、Token 有什么区别？"
slug: "cookie-session-token"
category: "计算机网络"
tags: ["HTTP", "Cookie", "Session", "Token"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "一面高频"
order: 1730
summary: "Cookie 是浏览器存储机制，Session 是服务端会话，Token 是客户端携带的访问凭证。"
---

## 一句话结论

Cookie 是浏览器保存数据的机制，Session 是服务端保存用户会话的机制，Token 是客户端携带的身份凭证。

## 通俗解释

Cookie 像你口袋里的小纸条，Session 像店里会员系统的记录，Token 像一张带签名的临时通行证。

## 面试回答

三者关系可以这样理解：

- Cookie：存储在浏览器，每次请求可自动携带，常用来保存 sessionId。
- Session：存储在服务端，用 sessionId 找到用户会话数据。
- Token：通常由服务端签发，客户端保存并在请求头中携带，服务端校验后识别身份。

传统 Web 项目常见 Cookie + Session；前后端分离和移动端常见 Token 或 JWT。

## 常见追问

### Cookie 安全怎么做？

可以设置 HttpOnly、Secure、SameSite，并避免在 Cookie 中存敏感明文。

### Token 一般放哪里？

可以放请求头，也可能放 Cookie。具体要结合 XSS、CSRF 风险和客户端类型设计。

## 易错点

- Cookie 不是身份本身，它只是存储和携带数据的机制。
- Session 在服务端，Cookie 常保存 sessionId。
- Token 泄露后也有风险，要设置过期和刷新机制。

## 记忆钩子

**Cookie 是纸条，Session 是后台记录，Token 是通行证。**
