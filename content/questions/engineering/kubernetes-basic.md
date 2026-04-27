---
title: "Kubernetes 里 Pod、Deployment、Service 是什么？"
slug: "kubernetes-pod-deployment-service"
category: "工程化"
tags: ["Kubernetes", "K8s", "部署", "容器"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目加分"
order: 860
summary: "理解 K8s 中应用运行单元、期望副本控制和服务访问入口。"
---

## 一句话结论

Pod 是 K8s 中最小调度单元，Deployment 管理 Pod 副本和滚动更新，Service 为一组 Pod 提供稳定访问入口。

## 通俗解释

Pod 像一个实际运行的小房间，Deployment 像房间管理员，保证一直有指定数量房间开着。Service 像固定前台电话，不管后面房间怎么换，外面都打这个号码。

## 面试回答

Kubernetes 常见概念：

- Pod：最小部署和调度单元，一个 Pod 可以包含一个或多个容器。
- Deployment：声明应用期望状态，比如副本数、镜像版本，并支持滚动更新和回滚。
- Service：为一组 Pod 提供稳定网络入口，因为 Pod IP 会变化。

后端项目面试里，不一定要求深入 K8s 原理，但能讲清楚应用如何容器化部署、如何扩缩容、如何滚动发布，会明显加分。

## 常见追问

### 为什么不直接访问 Pod IP？

Pod 可能重建，IP 会变化。Service 提供稳定访问名和负载均衡。

### Deployment 和 Docker Compose 有什么区别？

Compose 更偏单机或简单多容器编排；K8s 面向集群，提供调度、扩缩容、滚动更新、服务发现等能力。

## 易错点

- 不要把 Pod 和容器完全等同。
- 不要忽略 Service 稳定入口作用。
- 不要把 K8s 说成只是 Docker 启动器。

## 记忆钩子

**Pod 跑容器，Deployment 管副本，Service 给入口。**
