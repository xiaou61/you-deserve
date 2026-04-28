---
title: "K8s Ingress 是什么？和 Service 有什么区别？"
slug: "k8s-ingress"
category: "工程化"
tags: ["Kubernetes", "Ingress", "Service", "网关"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "上线部署"
order: 3120
summary: "Service 给集群内部或一组 Pod 提供稳定入口，Ingress 管理外部 HTTP/HTTPS 访问规则。"
---

## 一句话结论

Service 负责给一组 Pod 提供稳定访问入口，Ingress 负责管理外部 HTTP/HTTPS 如何按域名和路径进入集群。

## 通俗解释

Service 像公司内部前台分机，Ingress 像写字楼大门的导览牌。外部访客先看导览牌，再被带到对应公司前台。

## 面试回答

K8s 网络可以简单分层理解：

- Pod IP：Pod 自己的地址，会变化。
- Service：给一组 Pod 提供稳定入口和负载均衡。
- Ingress：定义外部请求按域名、路径转发到哪个 Service。
- Ingress Controller：真正执行规则的组件，如 Nginx Ingress。

如果只暴露一个服务，可以用 NodePort 或 LoadBalancer；如果有多个 HTTP 服务、多个域名或路径，Ingress 更适合集中管理。

## 常见追问

### 只有 Ingress 资源就能工作吗？

不一定。Ingress 只是规则，集群里还需要 Ingress Controller 来执行这些规则。

### Ingress 和 API 网关一样吗？

有重叠但不完全一样。Ingress 更偏 K8s 外部流量入口，API 网关还可能承担鉴权、限流、协议转换等业务网关能力。

## 易错点

- 不要忘记 Ingress Controller。
- 不要把 Service 和 Ingress 的职责混淆。
- Ingress 主要处理七层 HTTP/HTTPS 入口规则。

## 记忆钩子

**Service 管内部入口，Ingress 管外部进门路线。**

## 图解提示

适合画结构图：外部用户 -> Ingress Controller -> Ingress 规则 -> Service -> Pod。
