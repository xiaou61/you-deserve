---
title: WebClient 和 RestTemplate 有什么区别？
slug: spring-webclient
category: Spring
tags:
  - Spring
  - WebClient
  - HTTP 客户端
difficulty: medium
route: Java 后端上岸路线
scene: 进阶追问
order: 4340
summary: WebClient 是响应式非阻塞 HTTP 客户端，RestTemplate 是传统阻塞式客户端。
---
## 一句话结论

新项目如果需要高并发外部调用、流式响应或响应式链路，WebClient 更合适；普通同步调用 RestTemplate 仍能工作。

## 通俗解释

RestTemplate 像打电话等对方说完，WebClient 像发消息后继续处理其他事。

## 面试回答

可以从这几层回答：

- RestTemplate 调用线程会阻塞等待响应。
- WebClient 基于 Reactor，支持非阻塞、流式和组合式处理。
- 在 MVC 项目里也能用 WebClient，但要注意不要随便 block。
- 连接池、超时、重试和日志仍然需要显式配置。

## 常见追问

### WebClient 一定比 RestTemplate 快吗？

不一定。只有链路主要是非阻塞 IO 且配置合理时，WebClient 才更容易发挥并发优势。

### MVC 项目里能用 WebClient 吗？

能用，但要清楚 block 的位置和成本，避免在事件循环线程或关键路径乱 block。

### retrieve 和 exchangeToMono 怎么选？

普通响应体读取用 retrieve，更复杂的状态码、Header、Body 联动处理用 exchangeToMono。

### WebClient 超时怎么做？

在 Reactor Netty 和响应式链路上配置连接、响应、读写超时，并配合 retry/backoff 和兜底。

## 易错点

- 用了 WebClient 又到处 block，收益很小。
- 不设置超时导致外部依赖拖垮线程。

## 详细讲解

WebClient 和 RestTemplate 有什么区别 这类题本质上不是 API 对比，而是执行模型对比。先用一句话兜住主题，比如 WebClient 是响应式非阻塞 HTTP 客户端，RestTemplate 是传统阻塞式客户端，然后把重点放在调用线程、IO 等待、背压、资源占用和上下文切换这些运行时差异上。只要读者知道它们不是“两个名字不同的客户端/框架”，而是两种处理请求的方式，后面的选择依据就会自然很多。

更顺的讲法是从一条请求或一次远程调用开始。阻塞模型里，线程发请求后要等结果回来再继续；响应式模型里，线程更像把任务挂出去，等事件到了再继续拼装结果。像 RestTemplate 调用线程会阻塞等待响应 这种点，说清楚以后，WebClient、WebFlux、MVC、线程池和吞吐量之间的关系就不会再显得抽象。

这类题最常见的误区，是把“并发高”直接等同于“应该上响应式”。实际上如果业务主要是 CPU 计算、团队对 Reactor 不熟、上下游也都是阻塞链路，盲目切过去只会让调试复杂度和心智负担一起上来。像 用了 WebClient 又到处 block，收益很小 这种提醒，说的就是技术选型不能只盯吞吐量口号，还要看链路整体是不是匹配。

继续追问时，常见方向是“WebClient 一定比 RestTemplate 快吗”和“MVC 项目里能用 WebClient 吗”。这里比较有价值的答法，是把验证抓手讲出来：会看线程数、连接池利用率、p99 延迟、是否有阻塞调用混进事件循环、上下游客户端是不是也支持异步、日志链路里的 trace 是否还连续。Web 技术栈题一旦能把指标和模型对应上，答案就会明显更成熟。

在项目里，这些差异会直接表现成不同的问题。比如 WebClient 用法不当会在响应式链里偷偷 block()，最后卡死线程；WebFlux 项目里混进 JDBC 这类阻塞操作，会让事件循环失去意义；MVC 项目强行堆高并发时，瓶颈常常体现在工作线程和连接等待上。读者只要知道“它坏的时候长什么样”，就更容易理解为什么技术选型不能只看名词。

这一类题尤其要把取舍讲明白。响应式通常换来更高的 IO 利用率和更细的资源控制，但代价是学习成本、排障难度和上下游一致性要求都会更高；阻塞模型开发直观、生态成熟，但线程和连接的成本更早暴露。把这些代价说出来，会比单纯站队更像真实项目判断。

最后收口时，把 WebClient 和 RestTemplate 有什么区别 讲成“它解决什么瓶颈、在什么模型下成立、出了问题怎么验证是不是模型选错了”的闭环就够了。这样读者答题时不会只是在比新旧，而是在比场景和代价。

## 图解提示

适合画一张阻塞与非阻塞对照图：左边画线程同步等待结果，右边画事件驱动回调链路，中间标出连接占用、线程数量和响应延迟差异。把 RestTemplate 调用线程会阻塞等待响应、WebClient 一定比 RestTemplate 快吗 和 用了 WebClient 又到处 block，收益很小 标在图旁，重点不是 API，而是执行模型差别。

## 记忆钩子

**WebClient 的核心是非阻塞，但配置超时和少 block 更关键。**
