## HTML

### DOCTYPE 作用？标准模式（严格模式）和兼容模式（混杂模式）有什么区别？

<!DOCTYPE>声明位于HTML文档中的第一行，处于 `<html>` 标签之前，告知浏览器解析器，需要用什么文档去解析这个文档，DOCTYPE不存在会导致文档以兼容模式去呈现。

- 标准模式的排版和 JS 运作模式是以浏览器支持的最高标准运行。

- 兼容模式中，页面以宽松向后兼容的方式去显示，模拟老式浏览器的行为以防止站点无法工作

---

### 行内元素有哪些？块级元素有哪些？

- 行内

```jsx
<a> <b> <span> <img> <input> <select> ...
```

- 块级

```jsx
<div> <ul> <ol> <li> <dl> <dt> <dd> <h1> .. <h6> <p>
```

- 空元素

```jsx
<hr> <br> <img> <input> <link> <meta> <area> ...
```

块级元素和行内元素的区别:

1. 块级元素独占一行，块级元素内可嵌套部分块级元素, 而行内元素不能嵌套块级元素

2. 块级可设置 margin 、padding 元素，但是行内元素只有 margin-left、margin-right 和 padding-left、padding-right 有效

3. 块级 display: block，行内 display: inline

---

### 页面导入样式时,使用 link 和@import 有什么区别?

1. link 是 html 方式，@import 是 css 方式

2. link 是并行下载，而@import 引用的 css 会等到页面被加载完了之后再加载

3. @import 必须要在样式规则之前，link 优先级大于 @import

---

### 如何进行网站性能优化

`content`方面

- 减少 HTTP 请求
- 减少 DNS 查询
- 减少 DOM 的操作

`server`方面

- 静态资源推向 CDN

`Cookie` 方面

- 减少 Cookie 的大小

`CSS` 方面

- 将样式表放到页面顶部
- 不使用 CSS 表达式
- 使用 link 不使用@import

`JS` 方面

- 将脚本放到页面底部
- 将 javascript 和 css 从外部引入
- 压缩 javascript 和 css
- 删除不需要的脚本
- 减少 DOM 访问，不要在循环中操作 DOM，使用事件委托

---

### HTTP 状态码

状态码的职责是当客户端向服务器发送请求时，描述返回的请求结果。借助状态码，用户可以知道服务器是否正常处理，还是出现了错误

状态码如: 200 OK，是由 3 位数字和原因短语组成

状态码的类别

|     |               类别               |          原因短语          |
| :-: | :------------------------------: | :------------------------: |
| 1XX |   Informational(信息性状态码)    |     接收的请求正在处理     |
| 2XX |       Success(成功状态码)        |     接收的请求处理完毕     |
| 3XX |    Redirection(重定向状态码)     | 需要进行附加操作以完成请求 |
| 4XX |  Client Error(客户端错误状态码)  |     服务器无法处理请求     |
| 5XX | Server Error(服务器端错误状态码) |     服务器处理请求出错     |

`1xx` 状态码

- 100 Continue 继续，一般在发送 post 请求时，已发送了 http header 之后服务端将返回此信息，表示确认，之后发送具体参数信息

`2xx` 状态码

- 200 表示成功，并返回信息 (OK)
- 201 请求成功并且服务器创建了新的资源 (Created)
- 202 服务器接受请求，但尚未处理 (Accepted)
- 204 服务器请求已成功处理，但是返回的响应报文中不含实体的主体内容 (No Content)

`3xx` 状态码

- 301 永久性重定向 (Moved Permanently)
- 302 临时性重定向 (Move temporarily)
- 303 临时性重定向，并总是使用 GET 请求新的 URL (See Other)
- 304 自从上次请求后，请求的网页未修改过 (Not Modified)

`4xx` 状态码

- 400 服务器无法理解请求的格式，客户端不应当尝试再次使用相同的内容发起请求 (Bad Request)
- 401 请求未授权 (Unauthorized)
- 403 禁止访问 (Forbidden)
- 404 未找到相匹配的资源 (Not Found)
- 408 请求超时，客户端没有在服务器预备等待的时间内完成一个请求的发送。客户端可以随时再次提交这一请求而无需进行任何更改 (Request Timeout)

`5xx` 状态码

- 500 最常见的服务器端错误。(Internal Server Error)
- 502 作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应 (Bad Gateway)
- 503 服务器端暂时无法处理请求（可能是过载或维护）(Service Unavailable)

---

### HTML 语义化的理解

常见的语义化标签: header 、article 、 footer 、 aside ....

- 让页面的内容结构化，便于对浏览器、搜索引擎解析

- 在没有样式 CSS 情况下也以一种文档格式显示，并且是容易阅读的

- 有利于 SEO

- 便于团队开发和维护，语义化更具可读性

---

## sessionStorage、localStorage、cookie、indexDB

- cookie 是网站为了标示用户身份而储存在用户本地终端上的数据，始终在同源的 http 请求中携带（即使不需要），记会在浏览器和服务器间来回传递

- sessionStorage 和 localStorage 不会自动把数据发给服务器，仅在本地保存

|     特性     | sessionStorage |       localStorage       |                   cookie                   |         indexDB          |
| :----------: | :------------: | :----------------------: | :----------------------------------------: | :----------------------: |
| 数据生命周期 | 页面关闭就清理 | 除非被清理，否则一直存在 |     一般由服务器生成，可以设置过期时间     | 除非被清理，否则一直存在 |
| 数据存储大小 |       5M       |            5M            |                     4K                     |           无限           |
| 与服务端通信 |     不参与     |          不参与          | 每次都会携带在 header 中，对于请求性能影响 |          不参与          |

从上表可以看到，`cookie` 已经不建议用于存储。如果没有大量数据存储需求的话，可以使用 `localStorage` 和 `sessionStorage` 。对于不怎么改变的数据尽量使用 `localStorage` 存储，否则可以用 `sessionStorage` 存储。

`cookie`的安全性问题

- http-only , 作用是: 不能通过 JS 访问 Cookie，减少 XSS 攻击

- same-site , 作用是: 规定浏览器不能在跨域请求中携带 Cookie，减少 CSRF 攻击

---
