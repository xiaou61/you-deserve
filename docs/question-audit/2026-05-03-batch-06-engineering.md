# 题目质检 Batch 6：工程化 51-60

审查时间：2026-05-03  
范围：排序后的第 51-60 道题，`content/questions/engineering/docker-image-layer.md` 至 `content/questions/engineering/linux-high-cpu.md`  
审查口径：事实准确性、表达清晰度、内容深度、面试可用度、是否存在生成模板污染。  

## 总体结论

这一批整体质量明显好于前面的分布式批次，硬性事实错误少，很多题已经有可用的生产经验表达。主要问题不是“答错”，而是后半段的通用模板和图解重复/截断：

- `docker-multi-stage-build`、`k8s-configmap-secret`、`k8s-ingress`、`k8s-liveness-readiness-startup`、`linux-disk-full`、`linux-high-cpu` 存在重复 `## 图解提示`。
- `追问准备` 仍普遍使用“数据量或并发量扩大 10 倍怎么办”，对 Docker/K8s/Linux 排障题不够贴合。
- `health-check` 的 `详细讲解` 把 Markdown 列表拼进句子，如“健康检查一般分两类： - 存活检查”，表达不够自然。
- 多个题的图解节点截断或信息不足，如 `用 df -i 看 inode 是否…`、`判断是死循环` 过早收束，应该改成完整节点。

## 逐题记录

| 序号 | 文件 | 结论 | 严重度 | 问题与建议 |
|---:|---|---|---|---|
| 1 | `content/questions/engineering/docker-image-layer.md` | 主体正确，追问偏泛 | P2 | 镜像只读层、容器可写层、缓存复用、增量传输都讲对了。建议补“后续层删除文件不会减少前面层体积”“RUN 合并和 BuildKit 缓存”“COPY 依赖文件先于源码提高缓存命中”。追问应改成层缓存失效、镜像瘦身、volume 和可写层区别。 |
| 2 | `content/questions/engineering/docker-multi-stage-build.md` | 基础正确，图解重复 | P2 | 构建阶段和运行阶段分离讲得清楚。建议补 `.dockerignore`、只复制必要产物、构建缓存、`--target` 调试、构建密钥不要进入最终镜像、JRE/JDK 基础镜像选择。存在重复 `图解提示`，追问仍不够 Docker 专项。 |
| 3 | `content/questions/engineering/health-check.md` | 概念正确，表达有拼接痕迹 | P2 | liveness/readiness 的差异和检查不要太重都正确。建议补 startup probe、检查频率、超时、失败阈值、依赖抖动时 readiness 摘流量而不是 liveness 重启。`详细讲解` 中列表项被拼到句子里，需人工润色。 |
| 4 | `content/questions/engineering/k8s-configmap-secret.md` | 主体准确，安全边界可更细 | P2 | ConfigMap 和 Secret 的用途区分正确，也提醒 Secret 不是绝对安全。建议明确 Secret 默认只是 base64 编码，真正安全依赖 RBAC、etcd encryption、审计和外部密钥系统；还要补环境变量方式不会随 Secret 更新自动刷新，volume 挂载更新也有延迟。重复 `图解提示` 需合并。 |
| 5 | `content/questions/engineering/k8s-ingress.md` | 基础正确，落地细节可加强 | P2 | Service、Ingress、Ingress Controller 的职责讲清楚了。建议补 IngressClass、TLS 证书、pathType、rewrite、host/path 匹配优先级、Controller 日志和 Service Endpoints 排查。重复 `图解提示` 需要清理。 |
| 6 | `content/questions/engineering/k8s-liveness-readiness-startup.md` | 主体正确，和健康检查题可做分工 | P2 | 三类探针的失败动作讲得准确。建议和 `health-check.md` 做内容分工：本题聚焦 K8s probe 配置项和行为，健康检查题讲通用设计原则。可补 `initialDelaySeconds`、`periodSeconds`、`failureThreshold`、`timeoutSeconds`、startupProbe 成功前屏蔽其他探针。重复 `图解提示`。 |
| 7 | `content/questions/engineering/kubernetes-basic.md` | 正文质量较好 | P2 | Pod、Deployment、Service 的职责、label selector、ReplicaSet、滚动更新讲得不错。建议补 Service 类型 ClusterIP/NodePort/LoadBalancer、Deployment 和 StatefulSet 的边界、Pod 重建后的 IP 变化、Endpoints/EndpointSlice。文件名 `kubernetes-basic.md` 和 slug `kubernetes-pod-deployment-service` 不一致，后续维护时可注意。 |
| 8 | `content/questions/engineering/linux-common-debug.md` | 内容扎实，可作为基础稿 | P2 | CPU、内存、磁盘、网络、日志、JVM 工具、OOM、deleted 文件、tcpdump 等都覆盖得不错。建议把 `追问准备` 改成 Linux 专项：CPU 高、内存泄漏、磁盘满、端口不通、日志暴涨分别怎么排查；减少“业务目标、容量边界”这种项目设计模板。 |
| 9 | `content/questions/engineering/linux-disk-full.md` | 主体正确，命令可更具体 | P2 | `df -h`、`du`、`df -i`、删除未释放文件、日志滚动都正确。建议补 `lsof +L1` 查 deleted 文件、`du -xhd1` 避免跨文件系统、`find` 定位大文件、清空日志应优先用安全截断或重启释放句柄。重复 `图解提示`，且图解节点 `inode 是否…` 截断。 |
| 10 | `content/questions/engineering/linux-high-cpu.md` | 主体正确，排查链路可更完整 | P2 | top -> 线程 -> 十六进制 -> jstack 的 Java 排查链路正确。建议补 `pidstat`、`jcmd Thread.print`、GC 日志/`jstat`、容器 CPU throttle、`perf top` 或火焰图、保留现场后再重启。重复 `图解提示`，第一个图解节点把根因收窄到“死循环”太早，应改成根因分类。 |

## 优先修复建议

1. 工程化批次不需要大面积重写正文，优先修 `追问准备` 和 `图解提示`。
2. 清理 6 篇重复 `图解提示`，并把截断节点补完整。
3. 把 K8s 相近题做分工：`health-check` 讲健康检查通用原则，`k8s-liveness-readiness-startup` 讲三类探针配置和行为，避免重复。
4. Docker 题可以补 BuildKit、多阶段构建、镜像瘦身、安全扫描、非 root 运行等更像项目经验的追问。
5. Linux 排障题整体质量较好，后续只要把泛化项目模板改成专项排查问答，就能成为高质量内容。
