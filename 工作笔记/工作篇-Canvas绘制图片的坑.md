## 先说说需求

是这样的，现在有个需求，就是原价 149，A 通过 B 发的图片，扫码进入，即可享受 129 元的优惠价，原本后端那边提供的是 `getUserName` 和 `getInviteImage` 这两个接口，第一个接口是返回用户名，第二个接口是返回一张图片 (也就是要发给好友的邀请图片)，这样我只要显示这图片就好了嘛，为什么扯到 `Canvas` ？

## 幸福美满

这时候有个问题，因为图片上边，需要存在用户名，也就是会有一句话 : xxx 为你砍价 20 元，可是生成了这个邀请图之后，就永久不会改变了，除非手动触发 `forceUpdateInvite` 这个接口，才会更新，但是用户可能改名啊，比如 `用户“阿宽”`，进来之后生成的邀请图，后边把用户名改成了`小彭`，这时候再次进入拿到的邀请图，发现名字不对，这就凉了，但是也不能每次一进入页面都要生成一张新图

于是呢，跟前后端 leader 商量之后，决定说，通过 localStorage 来存储用户名，如果 username 不同，那就触发 `forceUpdateInvite` 这个接口进行更新，或者说 account 次数达到了 5 次/10 次，也同样触发该函数，重新生成邀请图。

接着我就屁颠屁颠去写代码了，很简单嘛，盘它～

## 突发意外

可事与愿违，怎么说呢？好像后端那边对中文以及颜文字的操作，很鸡儿麻烦和累，然后前端 leader 说，那你返回一张带二维码的图和名字，然后前端用 Canvas 画出来，这样也不用判断用户是否改名了，然后我就开始踩坑了。

## 代码

通过 Canvas 去绘制图片，采用 `drawImage` 这个接口，应该不成问题吧，并且这个接口必须要在图片加载完了之后才能调用

```html
<div className="canvas-image">
  <canvas id="CoverInvite" ref="CoverInvite" width="253" height="443" />
</div>
```

```javascript
var canvas = this.refs.CoverInvite
var ctx = canvas.getContext('2d')

var img = new Image()
img.src = InviteImg

// 必须在onload完之后才能 drwaImage
img.onload = function() {
  ctx.drawImage(img, 0, 0, 253, 443)
  ctx.font = '10px Arial'
  ctx.fillText('彭道宽', 46, 273)
}
```

这时候 Canvas 绘制图片完成了，可是，图片是模糊的！！what ？？咋回事？后边去 google 了一下，发现原来跟`浏览器处理canvas的方式有关`，相关的文章可以参考这篇 [High DPI Canvas](https://www.html5rocks.com/en/tutorials/canvas/hidpi/)

你看完 High DPI Canvas 那篇文章之后，你会知道，有两个玩意 : [Window.devicePixelRatio](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio)
和 [Element.getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) ，去 MDN 看了一下 API，原来得先获取设备的缩放比，然后通过 scale 进行放大

于是代码变成了下边这样 :

```javascript
var canvas = this.refs.CoverInvite
var dpr = window.devicePixelRatio || 1 // 获取手机缩放比
canvas.width = canvas.width * dpr // 这里我没采用getBoundingClientRect后的width
canvas.height = canvas.height * dpr // 这里我没采用getBoundingClientRect后的height
var ctx = canvas.getContext('2d')
ctx.scale(dpr, dpr)

var img = new Image()
img.src = InviteImg
img.onload = function() {
  ctx.drawImage(img, 0, 0, 253, 443)
  ctx.font = '10px Arial'
  ctx.fillText('彭道宽', 46, 273)
}
```

棒 👍!!! 清晰度解决了，但是用户那边看到的是个图片，当然，可以通过 canvas-to-image 这个第三方的插件实现，但 ! 我们奉行的是能不引入第三方包就不用！于是去查了一下，是的，Canvas 存在一个方法: [`toDataURL`](<(https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL#Example:_Dynamically_change_images)>)，返回一个包含图片展示的 data URI

```javascript
img.onload = function() {
  ctx.drawImage(img, 0, 0, 253, 443)
  ctx.font = '10px Arial'
  ctx.fillText('彭道宽', 46, 273)
  this.props.onHandleCallback(canvas.toDataURL('image/png', 1.0)) // 回传此data URI
}
```

ok，到此算结束了，可是模拟机上 OK，真机上图片不显示，后面想了想，将 base64 转成了 blob 对象，并通过 [window.btoa](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/btoa) 编码，然后又去掉了 data:image/png 前缀，转成了 blob 对象，再通过 [URL.createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL) 将 blob 对象转成一个图片路径。可是，还是没能解决该问题，本地开发仍然都是 ok，真机上还是无法显示

然后我觉得要么是 base64 问题，要么是浏览器兼容问题，于是开始排查 base64 的情况

#### 步骤一

找了一张比较小的图片 url，然后通过 base64 转换工具，转成 base64 地址，直接放在 img src 下，模拟机和真机都正常显示，说明不是自身 base64 和浏览器兼容问题

#### 步骤二

于是我把这个图片 url (http://xxx.com/test.png) 放入到了代码中 ，通过 Canvas.toDataURL() 去转成 base64 地址之后，模拟机正常，真机显示失败。但将转过后的 base64 地址，放入到转换工具，确实可以还原图片

#### 步骤三

思考会不会是 Canvas.toDataURL() 接口的问题，google 搜了一下，发现好像是真机上边，base64 地址是空的，于是，我把 `var base64Img = Canvas.toDataURL()`，通过`<p>{base64Img}</p>`打印出来，发现确实在模拟机上，base64Img 有值，而在真机上为空, ( 估计是我代码逻辑问题？但是模拟机console.log存在值，而真机并不存在值 )

#### 步骤四

然后 google 搜发现一篇文章，[HTML5 Canvas toDataURL returns blank](https://stackoverflow.com/questions/31193418/html5-canvas-todataurl-returns-blank)，他说 : 'The canvas needs to contain the loaded image in order to call getImageData'，又去测了一下还是不 ok

#### 步骤五

会不会是 canvas 绘制图片的问题？先看看，绘制字体，然后 `toDataURL()` 检查是否真的是绘制图片的问题，于是就先通过 canvas 绘制了两个字，将 base64 显示在 img 上，可以显示，并且它的 base64 通过转换工具可以反解出来，且可以正常显示

#### 步骤六

会不会是微信那边限制域的问题？通过 var img = new Image() ，然后加上了`img.setAttribute('crossOrigin', 'anonymous')`属性，并在显示页面的`<img crossOrigin='anonymous' src=''>`中添加了 `crossOrigin` 属性，ok，这时候发现，模拟机和真机上已经可以正常显示 base64

#### 步骤七

但是接下来就出现了问题，点击按钮显示这个合成的图片，居然要 16s，看了 network，两个接口请求也就在 700ms 以内，也就是说从拿到用户名和背景图，合成居然花了 16s 左右，并且很卡，导致按钮按不下去，链接点不开，甚至标签页都无法关闭了，然后接着去测试，看看是什么问题导致时间开销那么大

#### 步骤八

这里要做个图片的预加载，然后又踩了一个坑，就是 modal 的挂载，原本逻辑为: Invite 按钮，点击之后，改变 `showModal = true`，然后代码中，如果 showModal = true，那么显示这个弹窗，但是！！！在 react 中，如果这么做，就存在者组件挂载问题，因为改变 showModal，都会导致 `re-render`，所以应该通过 `visibility: hidden / visible` 来控制，这时候，DOM 树中是存在着这个 img 标签，不存在导致 re-render 问题

#### 步骤九

解决了 re-render 问题之后，接着出现新的问题，就是图片加载慢，因为等接口返回之后，还要绘制，包括像第一次进入还要生成图片才返回；所以通过 img `预加载`，也就是回调拿到 base64 的图片地址之后，通过 refs 获取 img 节点，然后设置 img.src = base64 实现预加载功能

#### 步骤十

这时候算是把这个功能需求解决了，然后图片显示不全，可能是缩放比问题，看看这个 [High DPI Canvas](https://www.html5rocks.com/en/tutorials/canvas/hidpi/) 就好了

## 相关链接

- [canvas 绘制图片模糊问题解决方法](https://segmentfault.com/a/1190000003730246)

- [High DPI Canvas](https://www.html5rocks.com/en/tutorials/canvas/hidpi/)

- [Don’t use Base64 encoded images on mobile](https://medium.com/snapp-mobile/dont-use-base64-encoded-images-on-mobile-13ddeac89d7c)

- [Embedded Base64 Image Won't Display in Dolphin or Android Stock Browser](https://stackoverflow.com/questions/7339721/embedded-base64-image-wont-display-in-dolphin-or-android-stock-browser)

- [Canvas 最佳实践（性能篇）](http://taobaofed.org/blog/2016/02/22/canvas-performance/)

- [提高 HTML5 画布性能](https://www.html5rocks.com/zh/tutorials/canvas/performance/)
