---
title: "Prometheus 和 Grafana 在项目里分别做什么？"
slug: "prometheus-grafana-alerting"
category: "工程化"
tags: ["Prometheus", "Grafana", "监控", "告警"]
difficulty: "medium"
route: "Java 后端上岸路线"
scene: "项目加分"
order: 3180
summary: "Prometheus 负责采集和存储指标，Grafana 负责可视化看板，告警规则负责发现异常。"
---

## 一句话结论

Prometheus 主要负责拉取、存储和查询指标，Grafana 主要负责把指标做成看板，告警规则负责在异常时通知人。

## 通俗解释

Prometheus 像体检仪器，持续量血压、心率；Grafana 像体检报告图表；告警像医生看到指标异常后打电话提醒。

## 面试回答

项目监控通常包括：

- 指标采集：应用暴露 metrics，Prometheus 定期拉取。
- 指标存储：按时间序列保存 QPS、延迟、错误率、CPU、内存等。
- 可视化：Grafana 展示服务、接口、机器、中间件状态。
- 告警：根据阈值或异常规则通知团队。

后端项目里常见核心指标是 RED：请求量、错误率、耗时；资源指标是 CPU、内存、磁盘、网络；业务指标是订单量、支付成功率等。

## 常见追问

### 只看 CPU 内存够吗？

不够。CPU 正常不代表业务正常，还要看接口成功率、延迟、错误码和关键业务指标。

### 告警越多越好吗？

不是。告警要可行动，否则容易疲劳。重要告警要有负责人、级别和处理手册。

## 易错点

- 不要把 Grafana 当成采集器。
- 不要只有机器监控，没有业务监控。
- 告警要避免太吵或太迟。

## 记忆钩子

**Prometheus 采数据，Grafana 画图，Alert 叫人。**

## 图解提示

适合画结构图：应用 metrics -> Prometheus -> Grafana 看板 -> Alertmanager 告警。
