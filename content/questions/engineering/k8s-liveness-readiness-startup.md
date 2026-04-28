---
title: "K8s 里的 liveness、readiness、startup 探针有什么区别？"
slug: "k8s-liveness-readiness-startup"
category: "工程化"
tags: ["Kubernetes", "探针", "健康检查", "部署"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "上线部署"
order: 3100
summary: "三类探针分别负责判断容器是否存活、是否可接流量、启动阶段是否完成。"
---

## 一句话结论

liveness 判断容器是否还活着，readiness 判断是否可以接流量，startup 判断慢启动应用是否已经启动完成。

## 通俗解释

它像餐厅检查。liveness 看厨师是不是还在岗位，readiness 看餐厅能不能接客，startup 看新店装修开业是否完成。

## 面试回答

K8s 探针常见区别：

- livenessProbe：存活探针，失败后 K8s 会重启容器。
- readinessProbe：就绪探针，失败后从 Service 流量中摘掉，但不一定重启。
- startupProbe：启动探针，给慢启动应用更长启动时间，成功前其他探针通常不会生效。

Java 应用启动慢，如果 liveness 配得太激进，可能刚启动就被反复杀掉。真实项目里通常把 `/actuator/health/liveness`、`/actuator/health/readiness` 这类健康接口接入探针。

## 常见追问

### readiness 失败为什么不直接重启？

服务可能只是暂时不能接流量，比如依赖数据库未就绪，摘流量比重启更温和。

### 探针配置错有什么后果？

可能造成服务反复重启、流量打到未就绪实例，或者故障实例迟迟不下线。

## 易错点

- 不要把三类探针都说成健康检查。
- liveness 不要依赖太多外部组件，否则外部抖动会导致应用被重启。
- readiness 要能反映是否真的能处理请求。

## 记忆钩子

**活没活看 liveness，能不能接客看 readiness，开没开业看 startup。**

## 图解提示

适合画对比图：三列分别展示触发场景、失败动作、适用例子。
