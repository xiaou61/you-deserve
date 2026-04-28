---
title: "K8s 里的 ConfigMap 和 Secret 有什么区别？"
slug: "k8s-configmap-secret"
category: "工程化"
tags: ["Kubernetes", "ConfigMap", "Secret", "配置"]
difficulty: "easy"
route: "Java 后端上岸路线"
scene: "上线部署"
order: 3110
summary: "ConfigMap 存普通配置，Secret 存敏感配置，但 Secret 也需要配合权限和加密保护。"
---

## 一句话结论

ConfigMap 用来放普通配置，Secret 用来放密码、Token、证书等敏感配置，但 Secret 不是万能保险箱，还要配合权限和加密。

## 通俗解释

ConfigMap 像班级公告，大家可以看；Secret 像保险柜里的钥匙，只有有权限的人才能拿。

## 面试回答

K8s 中配置和镜像通常要分离：

- ConfigMap：保存普通配置，如环境名、开关、非敏感地址。
- Secret：保存敏感信息，如数据库密码、证书、访问 Token。
- 挂载方式：可以作为环境变量，也可以挂载成文件。

需要注意，Secret 默认并不等于强加密保险箱，集群里仍要控制 RBAC 权限、etcd 加密、审计日志和最小权限访问。

## 常见追问

### 为什么不直接把配置打进镜像？

镜像应该尽量环境无关。配置外置后，同一个镜像可以在测试、预发、生产使用不同配置。

### Secret 一定安全吗？

不一定。Secret 降低了明文散落风险，但还需要权限控制、传输加密和存储加密。

## 易错点

- 不要把 Secret 理解成绝对安全。
- 不要把生产密码写进镜像或代码仓库。
- 普通配置和敏感配置要分开管理。

## 记忆钩子

**公告放 ConfigMap，钥匙放 Secret。**

## 图解提示

适合画结构图：Pod 从 ConfigMap 读取普通配置，从 Secret 读取密码，两者挂载到容器。
