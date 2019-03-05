### 背景

是这样的，通过 react 做的单页面，然后这时候有个需求，要求在点击查看的时候，打开一个新的页面，也就是标签页进行显示，嘿，这很简单嘛，谁知道，我错了===

是这样的，我在登陆的时候，将 token 缓存在 sessionStorage 中，每次请求都通过 `sessionStorage.getItem('token')` 去获取然后塞进请求的 header，那么问题来了，我打开新的标签页，将 copy 的 url 输入进去，然后按下回车，咦，居然被强制到 login 登陆页面了，打开 F12 控制台，去 application 里一看，居然没有 sessionStorage ？？？？🤔️

### 着魔了

是的，我着魔了，一直以来，我所以为的 sessionStorage 的生命周期是这样的：在 sessionStorage 中存储的数据会在当前浏览器的**同一网站**的多个标签页中共享，并在此网站的最后一个标签页被关闭后清除。但是：**这是错误的**。

比如我们这样，在一个`index.html`页面中，有这么个代码

```html
<!-- 使用一个新标签页打开自身，并设置一个 sessionStorage -->
<a
  href="index.html"
  target="_blank"
  onclick="sessionStorage.setItem('token', 'test token')"
>
  给我打开
</a>
```

然后，我们走下边的流程

- 在浏览器中打开这个 index.html，我们称之为标签页 One。注意：需要用 http 协议打开！例如 http://localhost/index.

- 点击页面上的链接，此时会弹出来标签页 Two

- 在标签页 Two 中打开控制台并执行 sessionStorage.getItem('token')

yes ！ 你会看到 `test token`，太棒了！👍 这说明这两个标签页 One 和 Two 共享了 sessionStorage 中的数据，接下来关闭 One 和 Two 这两个标签页，再新打开一个 Three 标签页，然后读取一下 token，发现得到的是一个 `null`

太棒了，实在是一摸一样，**可是，按道理来说，我打开一个标签页，获取 sessionStorage 就不共享了啊？？？**

### 靠文档救命

如果你认真看开头你就发现，我打开新页面的姿势不对，标签页 Two 和标签页 Three 之间唯一的不同就是它们被打开的方式，我是通过打开一个新的标签页，然后 copy 的 url 或者说是手动输入http://localhost/index.html，而通过 a 标签的 target 打开的，姿势不对，吓得我赶紧去看文档，发现有段话是这么说的

> sessionStorage 属性允许你访问一个 session Storage 对象。它与 localStorage 相似，不同之处在于 localStorage 里面存储的数据没有过期时间设置，而存储在 sessionStorage 里面的数据在页面会话结束时会被清除。

> 页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。在新标签或窗口打开一个页面时会在顶级浏览上下文中初始化一个新的会话，这点和 session cookies 的运行方式不同。

睁大眼睛 👀 **在新标签或窗口打开一个页面时会在顶级浏览上下文中初始化一个新的会话**，如果像我那种新建标签或窗口打开的话，会默认为一个新的会话 ！！！

**通过点击链接（或者用了 window.open）打开的新标签页之间是属于同一个 session 的，但新开一个标签页总是会初始化一个新的 session，即使网站是一样的，它们也不属于同一个 session**

### 相关链接

- [JavaScript Open new tab with custom url ON CLICK anywhere in the body but once till refresh](https://stackoverflow.com/questions/50074297/javascript-open-new-tab-with-custom-url-on-click-anywhere-in-the-body-but-once-t/50074392#50074392)

- [MDN - sessionStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage)
