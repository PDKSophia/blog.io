# HTML 篇

## DOCTYPE作用 ？ 标准模式（严格模式）和 兼容模式（混杂模式）有什么区别？

```javacript
  <!DOCTYPE>声明位于HTML文档中的第一行，处于 <html> 标签之前,告知浏览器解析器，需要用什么文档去解析这个文档，DOCTYPE不存在会导致文档以兼容模式去呈现

  标准模式的排版和JS运作模式是以浏览器支持的最高标准运行。

  兼容模式中，页面以宽松向后兼容的方式去显示，模拟老式浏览器的行为以防止站点无法工作

```
-------

## 行内元素有哪些？块级元素有哪些？
```html
  行内: <a> <b> <span> <img> <input> <select> ...

  块级: <div> <ul> <ol> <li> <dl> <dt> <dd> <h1> .. <h6> <p>

  空元素: <hr> <br> <img> <input> <link> <meta> <area> <command> ...

  块级元素和行内元素的区别: 
    1 . 块级元素独占一行，块级元素内可嵌套部分块级元素, 而行内元素不能嵌套块级元素

    2 . 块级可设置 margin 、padding 元素，但是行内元素只有 margin-left、margin-right 和 padding-left、padding-right 有效

    3. 块级 display: block，行内 display: inline

```

------

## 页面导入样式时，使用 link 和 @import 有什么区别 ？
```javascript
  1 . link 是html方式，@import 是css方式
  
  2 . link 是并行下载，而@import引用的css会等到页面被加载完了之后再加载

  3 . @import 必须要在样式规则之前，link 优先级大于 @import

```

------

## 如何进行网站性能优化
`content`方面

- 减少HTTP请求
- 减少DNS查询
- 减少DOM的操作

`server`方面

- 静态资源推向CDN

`Cookie` 方面

- 减少Cookie 的大小

`CSS` 方面
- 将样式表放到页面顶部
- 不使用CSS表达式
- 使用 link 不使用@import 

`JS` 方面

- 将脚本放到页面底部
- 将javascript和css从外部引入
- 压缩javascript和css
- 删除不需要的脚本
- 减少DOM访问，不要在循环中操作DOM，使用事件委托

-------

## HTTP 状态码

`1xx` 状态码

- 100 Continue 继续，一般在发送post请求时，已发送了http header之后服务端将返回此信息，表示确认，之后发送具体参数信息

`2xx` 状态码

- 200 表示成功，并返回信息
- 201 请求成功并且服务器创建了新的资源
- 202 服务器接受请求，但尚未处理

`3xx` 状态码

- 301 永久性重定向
- 302 临时性重定向
- 303 临时性重定向，并总是使用GET请求新的URL
- 304 自从上次请求后，请求的网页未修改过

`4xx` 状态码

- 400 服务器无法理解请求的格式，客户端不应当尝试再次使用相同的内容发起请求
- 401 请求未授权
- 403 禁止访问
- 404 未找到相匹配的资源

`5xx` 状态码

- 500 最常见的服务器端错误。
- 502 网关错误
- 503 服务器端暂时无法处理请求（可能是过载或维护）

------

## HTML语义化的理解

常见的语义化标签: header 、article 、 footer 、 aside ....

- 让页面的内容结构化，便于对浏览器、搜索引擎解析

- 在没有样式CSS情况下也以一种文档格式显示，并且是容易阅读的

- 有利于SEO

- 便于团队开发和维护，语义化更具可读性

--------

## sessionStorage 、localStorage 、 cookie、 indexDB

- cookie是网站为了标示用户身份而储存在用户本地终端上的数据，始终在同源的http请求中携带（即使不需要），记会在浏览器和服务器间来回传递

- sessionStorage和localStorage不会自动把数据发给服务器，仅在本地保存

| 特性 | sessionStorage | localStorage | cookie | indexDB |
| :------: | :------: | :------: | :------: | :------: | 
| 数据生命周期 | 页面关闭就清理 |  除非被清理，否则一直存在 | 一般由服务器生成，可以设置过期时间 | 除非被清理，否则一直存在 |
| 数据存储大小 | 5M |  5M | 4K | 无限 |
| 与服务端通信	 | 不参与 |  不参与 | 每次都会携带在 header 中，对于请求性能影响 | 不参与 |

从上表可以看到，`cookie` 已经不建议用于存储。如果没有大量数据存储需求的话，可以使用 `localStorage` 和 `sessionStorage` 。对于不怎么改变的数据尽量使用 `localStorage` 存储，否则可以用 `sessionStorage` 存储。

`cookie`的安全性问题

- http-only , 作用是: 不能通过 JS 访问 Cookie，减少 XSS 攻击

- same-site , 作用是: 规定浏览器不能在跨域请求中携带 Cookie，减少 CSRF 攻击

--------
