---
title: "OAuth2 和 OIDC 有什么区别？"
slug: "oauth2-oidc"
category: "项目设计"
tags: ["OAuth2", "OIDC", "登录", "认证授权"]
difficulty: "hard"
route: "Java 后端上岸路线"
scene: "登录鉴权"
order: 3200
summary: "OAuth2 主要解决授权，OIDC 在 OAuth2 之上补充身份认证，返回可验证用户身份的 ID Token。"
---

## 一句话结论

OAuth2 主要解决“授权第三方访问资源”，OIDC 在 OAuth2 之上补充“用户是谁”的身份认证能力。

## 通俗解释

OAuth2 像你授权快递员进小区取件，重点是“他能做什么”；OIDC 像门卫还确认你的身份证，重点是“你是谁”。

## 面试回答

OAuth2 常见角色有资源拥有者、客户端、授权服务器、资源服务器。它的核心是通过授权码、访问令牌等机制，让客户端在用户授权后访问资源。

OIDC 是 OpenID Connect，它基于 OAuth2 增加了身份层，典型产物是 ID Token。ID Token 用来表达用户身份信息，Access Token 用来访问资源接口。

项目里如果只是内部 JWT 登录，不一定需要完整 OAuth2/OIDC；但如果要接第三方登录、企业统一身份、单点登录，就需要理解这些概念。

## 常见追问

### Access Token 和 ID Token 有什么区别？

Access Token 给资源服务器看，用来判断能不能访问资源；ID Token 给客户端看，用来证明用户身份。

### OAuth2 是登录协议吗？

严格说 OAuth2 是授权框架，不是认证协议。OIDC 才是在 OAuth2 上补了认证。

## 易错点

- 不要把认证和授权混为一谈。
- 不要把 ID Token 当接口访问令牌随便传。
- 不要为了小项目过度引入完整 OAuth2 架构。

## 记忆钩子

**OAuth2 问能干啥，OIDC 问你是谁。**

## 图解提示

适合画对比图：OAuth2 授权访问资源，OIDC 返回 ID Token 证明身份。
