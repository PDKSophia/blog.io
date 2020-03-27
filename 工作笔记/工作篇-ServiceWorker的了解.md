# Service Worker 的了解

## 前言

前两天老大要我把项目组里的新后台管理 fork 然后 clone 下来，熟悉一下代码，然后让我做后边的其他模块管理，拉下来之后，看到一个 `serviceWorker.js` ，觉得这只是一个小文件，无关紧要，（...这是啥玩意），点进去一看，神仙代码？看不懂？后面 google 了一下，才发现 `service worker` 大有来头，赶紧马马的 mark 一下

## 什么是 Service Worker？ 😊

我们来看看 [W3C 中对 ServiceWorker](https://w3c.github.io/ServiceWorker/#service-worker-concept) 的说法 : 👇

- A service worker is a type of web worker. A service worker executes in the registering service worker client's origin.

- A service worker has an associated state, which is one of parsed, installing, installed, activating, activated, and redundant. It is initially parsed.

- A service worker has an associated script url (a URL).

- A script resource has an associated HTTPS state (an HTTPS state value). It is initially "none"

- ...

太多了，感兴趣的小伙伴可以戳这里，然后去看看 : [W3C ServiceWorker](https://w3c.github.io/ServiceWorker/#service-worker-concept)，接下来我们看看张鑫旭大大是如何介绍 Service Worker 的

> Service Worker 直白翻译就是“服务人员”，举个例子 : 我们去麦当劳消费，实际流程都是需要一个“服务人员”，客户点餐，付钱，服务人员提供食物，回到客户手上。如果从最大化利用角度而言，这里的服务人员其实是多余的，客户直接付钱拿货更快捷，而这种直接请求的策略就是 web 请求的做法，客户端发送请求，服务器返回数据，客户端再显示。

这么麻烦？为什么还要在中间加一个“服务人员”- `Service Worker` 呢？

> 主要是用户应付一些特殊场景和需求，比方说离线处理（客官，这个卖完了），比方说消息推送（客官，你的汉堡好了……）等。而离线应用和消息推送正是目前 native app 相对于 web app 的优势所在。

我们可以在 [stencil](https://stenciljs.com/docs/service-workers) 的文档中，看到这么一句话 :

> Service workers are a very powerful api that is essential for PWAs, but can be hard to use. To help with this, we decided to build support for Service Workers into Stencil itself using Workbox

从官网给的友情链接，我们可以看到这么一句话: 在服务工作线程出现前，存在能够在网络上为用户提供离线体验的另一个 API，称为 AppCache。App Cache 的主要问题是，它具有相当多的缺陷，并且，虽然它对单页网络应用支持较好，但对多页网站来说则不尽人意。

对于 service worker ，也称服务工作线程，是浏览器在后台独立网页运行的脚本，也算作是 Javascript 工作线程。它无法直接访问 DOM，因此，如果你需要操作页面的 DOM 节点的话，可以通过 postMessage 来跟想控制的页面进行通信。 service work 中的 API 大量采用 Promise 方式设计，因此代码比较友好。

在兼容性方面， Chrome Firefox Opera 都已经支持， Microsoft Edge 现在也表示公开支持。而之前 Safari 因为不计划支持被很多开发者吐槽，认为它将会是下一代 IE 。迫于压力下，现 Safari 也暗示未来会进行开发。

## 应用缓存

为什么我这里会讲到这个呢，在上边我有提到 : `Application Cache`，在 HTML5 中使用 ApplicationCache 接口，可以解决由离线带来的部分难题

应用缓存（又称 AppCache）可让开发人员指定浏览器应缓存哪些文件以供离线用户访问。即使用户在离线状态下按了刷新按钮，您的应用也会正常加载和运行。

### 引用缓存清单文件

```html
<html manifest="example.appcache">
  ...
</html>
```

如果你想要离线缓存，那么你应该要在缓存的网络应用的每个页面上都添加 `manifest` 属性。如果网页不包含 manifest 属性，浏览器就不会缓存该网页（除非清单文件中明确列出了该属性）。这就意味着用户浏览的每个包含 manifest 的网页都会隐式添加到应用缓存。因此，你无需在清单中列出每个网页。

manifest 属性可指向绝对网址或相对路径，但绝对网址必须与相应的网络应用同源。清单文件可使用任何文件扩展名，但必须以正确的 MIME 类型提供

```html
<html manifest="http://www.example.com/example.mf">
  ...
</html>
```

### 一个 manifest 文件的结构

```javascript
CACHE MANIFEST
index.html
stylesheet.css
images/logo.png
scripts/main.js
```

还有更多使用，请移步到 API 自行查看，这里不是重点～

## 回到主题，看看概念

因为 `html5 manifest` 缓存技术存在部分问题，用一句话就是 “投入产出比有点低”，对于 Web 应用来说，在没网掉线的情况下，打不开网页是很正常的，绝不会因为说网页在没网的时候打不开被用户投诉，(...打不开你不会连网打开吗! 手动狗头) ，但是如果我们希望支持立夏，会发现，这 TM 投入的精力和成本是真的很高啊；

我们采用 Service Worker 和 cacheStorage 缓存及离线开发，贼嗨，这么简单方便的东西，你不耶吗？耶不耶？

平常浏览器窗口中跑的页面运行的是主 JavaScript 线程，`DOM` 和 `window` 全局变量都是可以访问的。而 `Service Worker` 是走的另外的线程，可以理解为在浏览器背后默默运行的一个线程，脱离浏览器窗体，因此，window 以及 DOM 都是不能访问的，此时我们可以使用 `self` 访问全局上下文

由于 Service Worker 走的是另外的线程，因此，这个线程不会阻塞主 JavaScript 线程，也就是不会引起浏览器页面加载的卡顿之类。同时，由于 Service Worker 设计为完全异步，同步 API（如 XHR 和 localStorage）不能在 Service Worker 中使用

### Wait ？能给我讲一下 Worker 吗？

在 `Eric Bidelman` 的博客中可以看到 :

> 阻碍 JavaScript 的实际上是语言本身。JavaScript 属于单线程环境，无法同时运行多个脚本，例如，有一个网站，它需要处理 UI 事件，查询并处理大量的 API 数据和操作 DOM，由于 JavaScript 单线程，无法同时进行这些操作。开发人员会通过 `setTimeout`、`XMLHttpRequest`、`setInterval` 等技术模拟`并行`。结果是这些功能确实都是异步运行的，但是非阻塞并不意味着并发。系统会在当前执行脚本生成后处理异步事件

Web Worker 是个啥玩意？阮一峰老师在博客中有说 : Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。

OK，介绍到这，更加具体的我底部会给出链接，大家去自行翻阅，我们继续往下看

我们在 `Jake` 的博客中会看到这么一段话 :

> Registration will fail if the URLs are on a different origin to the page, the script fails to download & parse, `or the origin is not HTTPS`

what ？Service Worker 必须要 HTTPS？没错，就是这么牛逼 ✌️️，不过它还是比较“人性化”的，Service Worker 在 `http://localhost` 或者 `http://127.0.0.1`本地环境下也可以跑得起来

### Service Worker life-cycle

the service worker has a life-cycle:

- Download – 下载注册的 JS 文件

- Install – 安装

- Activate – 激活

接下来就是一些使用技巧方面，如何使用 Service Worker 的介绍了，这边我就不多说了，找找文章教程就完事了

```javascript
// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  './', // Alias for index.html
  'styles.css',
  '../../styles/main.css',
  'demo.js'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
```

---

## 友情链接

- [阮一峰-Web Worker 使用教程](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)

- [Eric Bidelman - The Basics of Web Workers](https://www.html5rocks.com/en/tutorials/workers/basics/)

- [Jake - Service Worker - first draft published](https://jakearchibald.com/2014/service-worker-first-draft/)

- [W3C ServiceWorker](https://w3c.github.io/ServiceWorker/#motivations)

- [张鑫旭-ServiceWorker 和 cacheStorage 缓存及离线开发](https://www.zhangxinxu.com/wordpress/2017/07/service-worker-cachestorage-offline-develop/)

- [ServiceWorker 简单应用](https://github.com/Leslie2014/blog/issues/1)

- [Basic Service Worker Sample](https://googlechrome.github.io/samples/service-worker/basic/)

- [Stencil 官网对 Service Worker 的介绍](https://stenciljs.com/docs/service-workers)
