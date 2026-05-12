import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "questions", "spring");

function collectMarkdownFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectMarkdownFiles(fullPath);
      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    });
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n");
}

function extractSection(content, title) {
  const match = normalize(content).match(new RegExp(`(?:^|\\n)## ${title}\\n+([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function replaceSection(content, title, body) {
  return normalize(content).replace(
    new RegExp(`((?:^|\\n)## ${title}\\n+)([\\s\\S]*?)(?=\\n## |$)`),
    `$1${body.trim()}\n`
  );
}

function firstSentence(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const match = compact.match(/^(.+?[。！？!?])/u);
  return (match ? match[1] : compact).replace(/[。！？!?]+$/u, "").trim();
}

function bullets(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/[。！？!?]+$/u, "").trim());
}

function followupTitles(section) {
  return Array.from(section.matchAll(/^###\s+(.+)$/gm)).map((item) =>
    item[1].replace(/[。！？!?]+$/u, "").trim()
  );
}

function choose(list, fallback, index = 0) {
  return list[index] || list[0] || fallback;
}

function cleanTitle(title) {
  return title.replace(/[？?]+$/u, "").trim();
}

const familyBySlug = {
  "configuration-priority": "config",
  "conditional-annotation": "config",
  "spring-profiles": "config",
  starter: "config",
  "spring-boot-autoconfiguration": "config",
  "spring-boot-starter-custom": "config",
  "spring-boot-startup-flow": "config",
  "spring-configuration-properties": "config",
  "spring-import-selector": "config",
  "autowired-resource": "container",
  "bean-scope": "container",
  "beanfactory-applicationcontext": "container",
  "beanpostprocessor": "container",
  "circular-dependency": "container",
  "factorybean": "container",
  "spring-bean-lifecycle": "container",
  "controller-restcontroller": "mvc",
  "filter-interceptor-aop": "mvc",
  "interceptor-filter-order": "mvc",
  "spring-mvc-flow": "mvc",
  "spring-mvc-argument-resolver": "mvc",
  "spring-mvc-message-converter": "mvc",
  "spring-validation": "mvc",
  "spring-webclient": "webstack",
  "webflux-vs-mvc": "webstack",
  "spring-aop": "proxy",
  "spring-async": "proxy",
  "spring-transaction-failure": "tx",
  "transaction-isolation": "tx",
  "transaction-propagation": "tx",
  "transaction-readonly": "tx",
  "transaction-rollback-rules": "tx",
  "spring-application-event-transaction": "event",
  "spring-event": "event",
  "spring-scheduled-pitfalls": "event",
  "spring-security-basic": "security",
  "spring-security-jwt": "security",
  "spring-actuator": "ops",
  "spring-cache-annotation": "ops",
};

function buildConfigDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "配置来源和覆盖顺序");
  const q1 = choose(followups, "最终生效值到底来自哪里", 0);
  const q2 = choose(followups, "为什么明明改了配置却没生效", 1);
  const risk = choose(pitfalls, "排查时只看仓库里的 yml");
  return [
    `${topic} 这类题更像“启动期决策题”，不是背几个注解名就够了。先把大意压住，比如 ${summaryLine}，然后把注意力放到 Spring Boot 启动时怎样收集配置、判断条件、决定某个 Bean 要不要注册。只要读者脑子里有“启动期就已经做了很多选择”这根主线，后面的优先级、Profile、自动配置和属性绑定就都能串起来。`,
    `更顺的讲法是从启动入口往下推。应用启动后先准备 Environment，把命令行参数、环境变量、系统属性、配置文件、配置中心这些来源按规则装进属性源列表，再由 Binder、条件注解和自动配置类去消费这些信息。像 ${focus} 这种点，真正关键的不是记住名词，而是知道它发生在 Bean 创建之前，很多结果在容器刷新阶段就已经定型。`,
    `这类题最容易让人答虚的地方，是把“配置存在”和“配置生效”混成一件事。文件里写了值，不代表最终用了它；你自己写了配置类，也不代表自动配置一定会退让。中间还隔着 profile 激活、属性覆盖顺序、条件匹配、是否已有同名 Bean、配置绑定是否成功这些步骤。把这些步骤讲清楚，内容就自然有工程味。`,
    `${"继续深挖时，通常会落到“"}${q1}”和“${q2}”这两个方向。这里别泛泛说看日志，而要直接说证据：会看 --debug 输出、ConditionEvaluationReport、/actuator/env、/actuator/configprops、启动时打印的 active profiles、属性绑定报错、依赖树、自动配置导入列表。配置类题的验证抓手，核心永远是“来源”和“条件”两张账。`,
    `真正有项目感的部分，是把线上故障症状翻译回来。比如某个 profile 没激活，表现出来可能是连错库；某个环境变量命名不对，表现出来可能是端口没改；某个 starter 被引进来却条件不满足，表现出来可能是预期 Bean 根本不存在；某个配置中心值刷新了但绑定对象没刷新，表现出来可能是接口继续跑旧逻辑。读者知道“会坏成什么样”，才知道为什么要记这些规则。`,
    `这类机制还有明显的取舍。Spring Boot 给了开箱即用和默认配置，代价是很多决策提前发生、而且分散在依赖、配置、条件注解和运行环境里；它让项目起步很快，但也要求你排障时别只盯一个文件。像 ${risk} 这种提醒，其实说的就是同一件事：排查配置问题时，必须看最终生效结果，而不是看你主观以为应该生效的地方。`,
    `最后收口时，可以把 ${topic} 讲成“启动前准备什么信息，启动中如何判断，启动后如何验证”的闭环。面试官真正想听的是：你知不知道这些默认能力是怎样被装进去的，失效时第一反应去哪里找证据，以及为什么生产上会强调配置治理和覆盖透明度。把这条链讲顺，这类 Spring Boot 题就不会再像背文档。`,
  ].join("\n\n");
}

function buildContainerDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "Bean 是如何被创建和暴露出去的");
  const q1 = choose(followups, "它发生在 Bean 生命周期的哪一步", 0);
  const q2 = choose(followups, "为什么这里的行为和直觉不一样", 1);
  const risk = choose(pitfalls, "把容器扩展点当成普通业务代码");
  return [
    `${topic} 这类题本质上都在问同一件事：Spring 容器到底是怎么接管对象的。先用一句话兜住主题，比如 ${summaryLine}，然后别急着背接口定义，直接把读者带进 BeanDefinition、实例化、依赖注入、初始化、暴露和销毁这条链路。只要这根主线清楚，作用域、循环依赖、后处理器、FactoryBean 这些点就不再零散。`,
    `更像工程师的讲法，是从“容器先管理定义，再管理实例”往下讲。容器先知道有哪些 Bean、名字是什么、作用域是什么、依赖谁，然后才决定何时实例化、如何注入、是否提前暴露引用，以及最终交给业务层的是原始对象还是被包装后的对象。像 ${focus} 这种点，放进这条链里去解释，就会比孤立记忆靠谱很多。`,
    `这一类题最容易失分的，不是概念没听过，而是把阶段说错。很多问题都和“太早”或“太晚”有关：某个依赖在属性填充前还拿不到，某个代理在初始化后才包上去，某个循环依赖只能在单例提前暴露时勉强解开，某个作用域对象根本不该缓存成单例引用。只要把阶段和时机说准，答案就会一下子立住。`,
    `继续追问时，常见落点是“${q1}”和“${q2}”。这里最值钱的不是继续抽象，而是给出可以落地的验证手段：看 BeanDefinition 注册信息、看 Bean 的实际类型、看是否是 scoped proxy、看三级缓存相关日志、看 BeanCurrentlyInCreationException、看启动顺序和后处理器回调、写一个最小复现单测把实例化顺序打印出来。容器题最怕空口白话，最不怕做实验。`,
    `如果把这类题放回真实项目，故障表现通常很具体。比如注入歧义会直接启动失败，作用域选错会出现线程间串数据，FactoryBean 理解错会拿到工厂而不是产品，循环依赖在构造器场景下会直接爆栈或报创建异常，后处理器写得太重会把启动时间拉长。把这些现象说出来，读者自然就知道这些机制不是“框架内部八股”，而是真会影响线上系统。`,
    `这里也有很强的取舍意识。Spring 容器给了统一装配和大量扩展点，代价就是生命周期复杂、很多能力是全局生效的。像 ${risk} 这种坑，说到底是在提醒你：越靠近容器底层，影响面越大，做一个看似小的扩展，可能会改掉整个应用的启动与装配行为。所以这类题不能只讲“能做什么”，还要讲“做了以后会影响谁”。`,
    `最后收口时，把 ${topic} 讲成“容器先知道什么、什么时候创建、创建后谁还能改它、出了问题怎么证伪”的因果链就够了。只要面试官感觉你真的知道 Bean 是怎么被容器接住、塑形、再交给业务的，这类题就已经从背概念升级成理解框架运行机制。`,
  ].join("\n\n");
}

function buildMvcDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "请求如何一步步落到 Controller");
  const q1 = choose(followups, "在哪个阶段开始分叉", 0);
  const q2 = choose(followups, "顺序错了会出现什么现象", 1);
  const risk = choose(pitfalls, "把 Filter、Interceptor、参数解析和消息转换混成一层");
  return [
    `${topic} 这类题不该答成“注解识别题”，而应该答成“请求链路题”。先用一句话压住重点，比如 ${summaryLine}，然后把读者带回一次真实请求：从 Servlet 容器收进来，经过 Spring MVC 调度、参数解析、方法调用、返回值处理，再把响应吐出去。只要请求链画得出来，很多小问题就会自己找到位置。`,
    `最稳的讲法是沿着 DispatcherServlet 往下走。先看请求如何匹配到 Handler，再看谁负责调用方法、谁负责把请求参数转换成 Java 对象、谁负责把返回值转换成 JSON 或视图，最后再补上异常处理、拦截器回调和响应提交时机。像 ${focus} 这种主线，只要讲成“流经哪些节点、每个节点负责什么”，内容就会很顺。`,
    `这类题里真正容易混的，是几个相邻环节职责很像但边界不同。参数解析不是消息转换，过滤器不等于拦截器，视图解析和 @ResponseBody 也不在一条分支上。只要边界说模糊，后面一旦被追问 415、406、参数丢失、拦截器不执行、异常没接住，就很容易乱。像 ${risk} 这种提醒，核心就是要把“它在哪一层发生”讲准。`,
    `继续深挖时，通常会问“${q1}”和“${q2}”。这里最有说服力的证据不是概念，而是链路观测：会看访问日志、Spring MVC debug 日志、HandlerMapping 匹配结果、拦截器执行顺序、参数绑定异常、消息转换器选择结果、异常解析器是否接住、最终 HTTP 状态码和响应体。Web 层题的排查习惯，本质上就是沿请求方向一站一站往下排。`,
    `如果放回业务现场，这些点会长成很具体的问题。比如 @RequestBody 对不上 Content-Type 时会报 415，返回对象没找到可用 converter 时会报 406，拦截器路径没配对时权限逻辑会失效，统一异常处理没命中时前端会拿到默认错误页，参数解析器写得太激进时会把原有方法签名全打乱。把故障现象说出来，读者对整个 MVC 链就会有手感。`,
    `这一层也有取舍。Spring MVC 帮你把大部分 Web 细节抽掉了，但抽象越多，定位问题就越依赖你能不能把链路拆开。像 ${risk} 这种坑背后，其实是在提醒：别把“都在 Web 层发生”当成“它们是一回事”。只有职责边界清楚，出了问题才能知道先看容器入口、MVC 调度、控制器参数，还是响应输出。`,
    `最后收口时，把 ${topic} 讲成“请求从哪里进、在哪分叉、出了错卡在哪、拿什么证据确认”的闭环就够了。这样答案既有流程，也有排障抓手，面试官会更容易判断你是真走过请求链，而不是只背过 Controller 注解。`,
  ].join("\n\n");
}

function buildWebstackDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "阻塞模型和非阻塞模型的差异");
  const q1 = choose(followups, "什么时候值得换技术栈", 0);
  const q2 = choose(followups, "引入以后最先要补的认知是什么", 1);
  const risk = choose(pitfalls, "以为换成响应式就一定更快");
  return [
    `${topic} 这类题本质上不是 API 对比，而是执行模型对比。先用一句话兜住主题，比如 ${summaryLine}，然后把重点放在调用线程、IO 等待、背压、资源占用和上下文切换这些运行时差异上。只要读者知道它们不是“两个名字不同的客户端/框架”，而是两种处理请求的方式，后面的选择依据就会自然很多。`,
    `更顺的讲法是从一条请求或一次远程调用开始。阻塞模型里，线程发请求后要等结果回来再继续；响应式模型里，线程更像把任务挂出去，等事件到了再继续拼装结果。像 ${focus} 这种点，说清楚以后，WebClient、WebFlux、MVC、线程池和吞吐量之间的关系就不会再显得抽象。`,
    `这类题最常见的误区，是把“并发高”直接等同于“应该上响应式”。实际上如果业务主要是 CPU 计算、团队对 Reactor 不熟、上下游也都是阻塞链路，盲目切过去只会让调试复杂度和心智负担一起上来。像 ${risk} 这种提醒，说的就是技术选型不能只盯吞吐量口号，还要看链路整体是不是匹配。`,
    `继续追问时，常见方向是“${q1}”和“${q2}”。这里比较有价值的答法，是把验证抓手讲出来：会看线程数、连接池利用率、p99 延迟、是否有阻塞调用混进事件循环、上下游客户端是不是也支持异步、日志链路里的 trace 是否还连续。Web 技术栈题一旦能把指标和模型对应上，答案就会明显更成熟。`,
    `在项目里，这些差异会直接表现成不同的问题。比如 WebClient 用法不当会在响应式链里偷偷 block()，最后卡死线程；WebFlux 项目里混进 JDBC 这类阻塞操作，会让事件循环失去意义；MVC 项目强行堆高并发时，瓶颈常常体现在工作线程和连接等待上。读者只要知道“它坏的时候长什么样”，就更容易理解为什么技术选型不能只看名词。`,
    `这一类题尤其要把取舍讲明白。响应式通常换来更高的 IO 利用率和更细的资源控制，但代价是学习成本、排障难度和上下游一致性要求都会更高；阻塞模型开发直观、生态成熟，但线程和连接的成本更早暴露。把这些代价说出来，会比单纯站队更像真实项目判断。`,
    `最后收口时，把 ${topic} 讲成“它解决什么瓶颈、在什么模型下成立、出了问题怎么验证是不是模型选错了”的闭环就够了。这样读者答题时不会只是在比新旧，而是在比场景和代价。`,
  ].join("\n\n");
}

function buildProxyDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "代理如何把横切逻辑插进业务调用");
  const q1 = choose(followups, "为什么明明加了注解却没生效", 0);
  const q2 = choose(followups, "怎么证明调用确实经过了代理", 1);
  const risk = choose(pitfalls, "自调用、final 或 private 方法绕开代理");
  return [
    `${topic} 这类题的核心不是“注解怎么写”，而是“调用有没有真的经过代理”。先用一句话兜住重点，比如 ${summaryLine}，然后把视角拉回到调用链：调用方拿到的是不是 Spring 管理的 Bean，Bean 外面有没有代理壳，增强逻辑是在调用前后还是线程切换时插进去。只要这条链讲明白，AOP 和 @Async 相关问题就都不虚。`,
    `最顺的讲法，是先分清目标对象和代理对象。业务代码通常以为自己在直接调方法，实际上很多能力都是代理先接住，再决定要不要织入切面、切换线程、包事务或补上下文。像 ${focus} 这种点，只要讲成“调用先到谁、谁再放行到目标方法”，面试官就能听出你是真的理解运行机制。`,
    `这类题最爱出坑的地方，是调用路径被你自己绕开了。比如同类内部自调用，等于没从代理入口走；方法是 final/private，代理根本拦不住；异步切线程后，原线程里的上下文和事务也不会自动跟过去。像 ${risk} 这种边界，说清楚以后，读者自然就知道为什么“注解在那儿”不代表“能力已经生效”。`,
    `继续追问时，通常会变成“${q1}”和“${q2}”。比较好的答法，是把证据讲具体：看 Bean 实际类型是不是代理类、看 AopUtils 判断结果、看线程名有没有变化、看切面日志是否包住目标方法、看断点时栈里是否进入代理拦截器链、写一个最小复现确认同类内部调用和外部调用的差异。代理题最有力量的证据，往往就是“我证明它没走到入口”。`,
    `放到项目里，这类问题的故障表现很典型。事务没开、异步没切走、审计日志没打印、埋点没记到、权限校验突然失效，很多时候都不是业务逻辑本身错了，而是增强链压根没接上。把这些现象说出来，读者会更容易把“代理边界”记成一个实战问题，而不是框架内部细节。`,
    `这一层也有取舍。代理机制让横切逻辑不用侵入业务代码，但代价是调用路径变得间接，理解和排障都更依赖你对代理边界的掌控。像 ${risk} 这种坑，本质上是在提醒：当一个能力依赖代理生效时，你的第一个排查动作不是改业务代码，而是先确认入口还在不在。`,
    `最后收口时，把 ${topic} 讲成“能力为什么靠代理实现、哪些调用会绕开代理、如何用证据确认代理是否生效”的闭环就够了。只要这一层说清楚，AOP 和异步题基本就能站住。`,
  ].join("\n\n");
}

function buildTxDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "事务边界如何在调用链里展开");
  const q1 = choose(followups, "内外层事务到底怎么互动", 0);
  const q2 = choose(followups, "为什么业务看起来成功了事务却回滚了", 1);
  const risk = choose(pitfalls, "只记注解，不看代理边界和数据库能力");
  return [
    `${topic} 这类题一定要答成“事务边界题”，不能只答成注解参数题。先用一句话把核心压住，比如 ${summaryLine}，然后把读者带进一次真实调用：外层方法从代理入口进来，事务管理器根据当前线程状态决定新建、加入、挂起还是只读执行，最后再根据异常和提交结果决定回滚语义。只要这条链讲顺，传播、隔离、回滚和失效问题就会很连贯。`,
    `更有工程感的讲法，是把事务看成一张“线程绑定的上下文账单”。当前线程有没有事务、连接是否已绑定、传播行为要不要挂起外层、数据库是否支持 savepoint，这些都会决定最后的行为。像 ${focus} 这种点，只要和线程上下文、连接资源、数据库能力绑在一起解释，就不会停留在死记硬背。`,
    `事务题最容易翻车的地方，是把“注解写了”误当成“边界就成立了”。实际上同类内部调用、异常被吞掉、非运行时异常没配置回滚、数据库引擎不支持预期能力、连接池压力把 REQUIRES_NEW 拖垮，这些都会让最终结果和直觉不一样。像 ${risk} 这种提醒，本质上就是要你别脱离运行时谈事务。`,
    `继续深挖时，通常会追到“${q1}”和“${q2}”。这里最有价值的答法，是把证据讲出来：会看事务日志、数据源代理日志、是否出现 UnexpectedRollbackException、线程里绑定了哪个连接、SQL 是否真的提交、异常有没有被业务 catch 掉、数据库隔离级别和 savepoint 能力是否匹配。事务题要想讲实，证据一定要落到线程和数据库两端。`,
    `如果放回业务现场，故障现象往往很有迷惑性。接口返回成功但数据没落库、外层成功内层失败却留下半截数据、只读事务里偶尔还能写、嵌套事务和独立事务混用后连接池突然打满，这些都不是背定义能解决的。读者只有知道这些问题长什么样，才会理解为什么事务题总被面试官拿来追项目经验。`,
    `这一类题特别考验取舍意识。更强的事务边界通常换来更高的一致性和更低的心智负担，但也可能带来更高的连接占用、更复杂的回滚语义和更重的数据库压力。像 ${risk} 这种提醒，说到底是在逼你承认：事务不是越多越好，边界画得过粗或过细都会出成本。`,
    `最后收口时，把 ${topic} 讲成“事务从哪里开始、沿着谁传播、在哪些边界最容易失效、拿什么证据证明它是否真的提交/回滚”的闭环，答案就会非常稳。这样面试官听到的不只是注解参数，而是你对一致性边界的实际理解。`,
  ].join("\n\n");
}

function buildEventDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "事件或定时任务在什么时机触发");
  const q1 = choose(followups, "它默认是同步还是异步", 0);
  const q2 = choose(followups, "和事务或多实例放一起会发生什么", 1);
  const risk = choose(pitfalls, "把应用内解耦机制当成可靠消息系统");
  return [
    `${topic} 这类题的关键不是“会不会用注解”，而是“触发时机和执行语义”。先用一句话压住主题，比如 ${summaryLine}，然后把视角放到事件什么时候发布、监听器什么时候执行、线程是不是切换、事务提交前后差别在哪里、定时任务由谁调度。只要时机说清楚，这类题就不会飘。`,
    `更顺的讲法，是先分清楚它是“应用内通知”还是“调度执行”。事件机制通常强调发布方和监听方解耦，定时任务强调固定规则下的触发和执行；但两者最终都绕不开一个问题：${focus}。只要把这个时机点讲准，面试官再怎么往同步异步、事务阶段、多实例重复执行上追，答案都能接住。`,
    `这类题最常见的误区，是把它们想得比实际更可靠。同步事件抛异常可能直接影响主流程，事务提交前监听可能读到未最终确认的数据，定时任务在多实例部署下可能重复跑，监听器慢一点就会拖慢发布方。像 ${risk} 这种提醒，说的就是应用内事件和定时器都不是天然的分布式可靠方案。`,
    `继续追问时，通常会落到“${q1}”和“${q2}”。比较好的答法，是把验证抓手讲清楚：看监听器线程名、看事务阶段日志、看事件发布和消费的时间差、看调度线程池大小、看任务执行重叠情况、看是否有幂等保护和分布式锁。事件和调度题一旦能讲出观测点，可信度会明显提升。`,
    `如果放进项目场景，故障现象往往非常真实。下单后同步监听发短信把主链路拖慢，事务还没提交就触发监听导致查不到完整数据，定时补偿在两台机器上重复执行，监听器异常没隔离把主流程也打挂，这些都比“它适合做解耦”更能说明你是否真的用过。`,
    `这一层的取舍也很明显。应用事件让模块耦合更低、接入更轻，但换来的代价是可观测性和可靠性通常不如 MQ；定时任务实现快，但一到多实例和长耗时场景就需要额外治理。像 ${risk} 这种提醒，本质上是在告诉读者：别用一个轻量机制去承担它没打算承担的责任。`,
    `最后收口时，把 ${topic} 讲成“什么时候触发、在哪个线程执行、和事务/多实例相遇时最怕什么、怎么验证它没有悄悄拖垮主流程”的闭环就够了。这样答案就会很像真实项目里的经验总结。`,
  ].join("\n\n");
}

function buildSecurityDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "请求如何穿过安全过滤链");
  const q1 = choose(followups, "认证和授权分别卡在哪一层", 0);
  const q2 = choose(followups, "为什么 token 校验看起来过了还是没权限", 1);
  const risk = choose(pitfalls, "把安全问题只理解成几个注解和配置项");
  return [
    `${topic} 这类题最怕答成术语堆砌，因为真正关键的是安全链路怎么跑。先用一句话压住重点，比如 ${summaryLine}，然后把读者带进一次受保护请求：请求先穿过 Security 过滤链，完成认证，再根据当前主体和资源规则做授权，最后才轮到 Controller 真正执行业务。只要安全链讲清楚，很多追问都会自然落位。`,
    `更有工程感的讲法，是把 Security 看成“在 MVC 之前先做一道安检”。过滤器链决定谁先读 token、谁负责把用户信息放进 SecurityContext、谁在失败时返回 401，谁在权限不足时返回 403。像 ${focus} 这种点，说成链路以后，JWT、自定义登录、角色权限这些问题就不会散。`,
    `这类题最容易出错的地方，是以为认证通过就万事大吉。实际上 token 解析成功不等于已经把主体写回安全上下文，认证对象存在也不等于授权表达式一定放行，过滤器顺序不对还可能让后续逻辑根本拿不到用户信息。像 ${risk} 这种提醒，核心就是不要脱离过滤链谈安全。`,
    `继续深挖时，常见方向会变成“${q1}”和“${q2}”。比较有说服力的答法，是直接讲验证证据：看 Security debug 日志、看过滤器链顺序、看 SecurityContextHolder 里最终有没有 Authentication、看异常是走了 AuthenticationEntryPoint 还是 AccessDeniedHandler、看 JWT 解析后权限集合是否真的带上了角色。安全题只有把链路和证据绑在一起，才不会显得空。`,
    `如果放回线上故障，现象通常很直白：接口老是 401，或者 token 明明有效却返回 403；登录接口成功了但后续请求拿不到用户；某个路径被意外放开或意外拦死；多种认证方式混用后过滤器先后顺序冲突。把这些场景讲出来，读者就会知道安全链不是“额外知识点”，而是请求真正经过的第一层业务关口。`,
    `这一层的取舍也很实际。Spring Security 帮你统一了认证授权体系，但代价是链路更长、排障更依赖顺序和上下文；JWT 让服务更无状态，但注销、续签、失效控制会更复杂。像 ${risk} 这种提醒，说到底是在逼你承认：安全能力越通用，调试就越要回到过滤链和上下文本身。`,
    `最后收口时，把 ${topic} 讲成“请求先过哪道安检、凭证怎样变成当前用户、权限在哪一步被判定、失败时你去看哪一层”的闭环就够了。这样答案就会很像真正维护过安全链的人在说话。`,
  ].join("\n\n");
}

function buildOpsDetail(topic, summaryLine, points, followups, pitfalls) {
  const focus = choose(points, "运维端点或缓存能力如何进入应用");
  const q1 = choose(followups, "上线后第一眼先看什么指标或端点", 0);
  const q2 = choose(followups, "它默认帮你做了什么，又没帮你做什么", 1);
  const risk = choose(pitfalls, "以为框架给了能力就等于治理已经做完");
  return [
    `${topic} 这类题更接近“可观测性和治理题”，不是单纯框架语法题。先用一句话压住主题，比如 ${summaryLine}，然后把重点放到它为什么会出现在项目里：是为了暴露状态、监控健康、采集指标、统一缓存入口，还是为了减少重复代码。只要问题先回到运维和治理目标，答案就会更实。`,
    `更好的讲法，是先说它接入以后，应用运行时多了什么观测面或能力层。像 ${focus} 这种点，关键不是知道注解名字，而是知道哪些信息会被暴露、谁会消费这些信息、默认值是否安全、缓存命中和失效是在哪个边界发生。运维类 Spring 题一旦回到“它给系统带来了什么信号”，就不容易答空。`,
    `这类题最容易栽在“看起来有能力，实际上没治理”。Actuator 开了端点，不代表暴露范围合理；缓存注解加上了，不代表 key、过期和一致性问题就自动解决；指标接上了，不代表告警阈值已经设计好。像 ${risk} 这种提醒，本质上是在说：框架给的是抓手，不是最终方案。`,
    `继续追问时，通常会落到“${q1}”和“${q2}”。这里最有价值的答法，是直接讲证据：会看 health 明细、metrics、conditions、env、cache hit/miss、慢调用、Prometheus 指标、告警面板、缓存穿透和雪崩时的命中率变化。运维治理题越贴近指标和端点，越像真的做过上线值守。`,
    `如果放回业务现场，故障现象也很明确。端点暴露不当可能泄露环境信息，健康检查设计太重可能把探针本身变成压力，缓存 key 设计不稳会导致命中率上不去，失效策略不清会让脏数据一直留着。把这些现象说出来，读者就会理解为什么这类题虽然看起来偏工具，面试里却常拿来问线上经验。`,
    `这一层尤其需要取舍意识。更强的可观测性通常意味着更多暴露面和运行时开销，更激进的缓存通常意味着更复杂的一致性约束。像 ${risk} 这种提醒，说到底是在告诉读者：别把“加了框架能力”误判成“系统已经被治理好”，中间还隔着很多工程决策。`,
    `最后收口时，把 ${topic} 讲成“它暴露了什么、帮你省了什么、最容易留下什么运维隐患、你靠哪些指标确认它真的带来收益”的闭环就够了。这样答案会更像项目经验，而不是单纯背组件简介。`,
  ].join("\n\n");
}

function buildDetail(family, topic, summaryLine, points, followups, pitfalls) {
  switch (family) {
    case "config":
      return buildConfigDetail(topic, summaryLine, points, followups, pitfalls);
    case "container":
      return buildContainerDetail(topic, summaryLine, points, followups, pitfalls);
    case "mvc":
      return buildMvcDetail(topic, summaryLine, points, followups, pitfalls);
    case "webstack":
      return buildWebstackDetail(topic, summaryLine, points, followups, pitfalls);
    case "proxy":
      return buildProxyDetail(topic, summaryLine, points, followups, pitfalls);
    case "tx":
      return buildTxDetail(topic, summaryLine, points, followups, pitfalls);
    case "event":
      return buildEventDetail(topic, summaryLine, points, followups, pitfalls);
    case "security":
      return buildSecurityDetail(topic, summaryLine, points, followups, pitfalls);
    default:
      return buildOpsDetail(topic, summaryLine, points, followups, pitfalls);
  }
}

function buildVisual(family, title, points, followups, pitfalls) {
  const topic = cleanTitle(title);
  const step1 = choose(points, "入口阶段");
  const step2 = choose(points, "关键分叉点", 1);
  const q = choose(followups, "怎么确认它真的生效");
  const risk = choose(pitfalls, "最容易误判的边界");

  switch (family) {
    case "config":
      return `适合画一张启动期决策图：应用启动 -> Environment 收集配置来源 -> Profile 和条件注解参与判断 -> Binder/自动配置决定 Bean 是否注册 -> 最后用条件报告或 env 端点验证最终结果。图里重点标清 ${step1}、${step2}、${risk}，让“来源、条件、最终生效值”三层关系一眼能看懂。`;
    case "container":
      return `适合画一张 Bean 生命周期图：BeanDefinition 注册 -> 实例化 -> 依赖注入 -> 初始化前后扩展 -> 暴露给业务使用 -> 销毁。把 ${step1} 和 ${risk} 标在对应阶段，再补一条旁路说明 ${q} 时会看 Bean 实际类型、创建顺序或异常信息。`;
    case "mvc":
      return `适合画一张 Spring MVC 请求链图：请求进入容器 -> Filter -> DispatcherServlet -> HandlerMapping/HandlerAdapter -> Controller -> 返回值处理或异常处理 -> 响应返回。图里单独圈出 ${step1}、${step2} 和 ${risk}，这样最容易讲清楚每一层到底负责什么。`;
    case "webstack":
      return `适合画一张阻塞与非阻塞对照图：左边画线程同步等待结果，右边画事件驱动回调链路，中间标出连接占用、线程数量和响应延迟差异。把 ${step1}、${q} 和 ${risk} 标在图旁，重点不是 API，而是执行模型差别。`;
    case "proxy":
      return `适合画一张代理调用图：调用方 -> Spring 代理对象 -> 增强逻辑或线程切换 -> 目标方法 -> 返回结果。图里重点拆开代理对象和目标对象两层，再标出 ${risk} 发生在什么位置，以及 ${q} 时会看的代理类名、线程名或切面日志。`;
    case "tx":
      return `适合画一张事务边界图：外层方法进入代理 -> 判断当前线程事务状态 -> 按传播行为决定加入/挂起/新建 -> 执行业务 SQL -> 根据异常或提交结果决定回滚。把 ${step1}、${q} 和 ${risk} 标出来，帮助读者把线程上下文和数据库结果对上。`;
    case "event":
      return `适合画一张触发时机图：主流程执行 -> 发布事件或触发调度 -> 监听器/任务在线程池中执行 -> 根据事务阶段或多实例情况产生不同结果。把 ${step1}、${q} 和 ${risk} 标在图中，重点讲“什么时候触发、在哪个线程跑、会不会重复”。`;
    case "security":
      return `适合画一张安全过滤链图：请求进入 -> 认证过滤器读取凭证 -> 写入 SecurityContext -> 授权判断 -> Controller 执行 -> 失败时分别返回 401/403。图里把 ${step1}、${step2} 和 ${risk} 单独圈出来，这样最容易说明 JWT 或权限问题到底卡在哪一层。`;
    default:
      return `适合画一张运维治理图：应用运行 -> 暴露端点或进入缓存抽象 -> 指标/健康信息被监控系统采集 -> 运维或业务根据这些信号做判断。图里重点标清 ${step1}、${q} 和 ${risk}，让“框架能力”和“治理动作”不要混在一起。`;
  }
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const slug = path.basename(file, ".md");
  const family = familyBySlug[slug] || "ops";
  const topic = cleanTitle(typeof parsed.data.title === "string" ? parsed.data.title : slug);
  const summaryLine = firstSentence(typeof parsed.data.summary === "string" ? parsed.data.summary : topic);
  const interview = extractSection(parsed.content, "面试回答");
  const followupsSection = extractSection(parsed.content, "常见追问");
  const pitfallsSection = extractSection(parsed.content, "易错点");
  const points = bullets(interview);
  const followups = followupTitles(followupsSection);
  const pitfalls = bullets(pitfallsSection);

  const nextDetail = buildDetail(family, topic, summaryLine, points, followups, pitfalls);
  const nextVisual = buildVisual(family, topic, points, followups, pitfalls);

  let nextContent = replaceSection(parsed.content, "详细讲解", nextDetail);
  nextContent = replaceSection(nextContent, "图解提示", nextVisual);
  const rebuilt = matter.stringify(nextContent.trim() + "\n", parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
