<!--
 * @Description:
 * @Author: pengdaokuan
 * @LastEditors: pengdaokuan
 * @Date: 2022-01-17 11:03:02
 * @LastEditTime: 2022-01-17 11:03:02
-->

## 说个两句

👉 这篇博客，将会是以后遇到的所有移动端上的坑，都会更新在这里~

如果可以的话，你们也可以在评论中，吐槽一下你们开发过程中遇到的一些坑，让我以后，也可以，避免“遭殃” ~

### HTML radio 关联 label 后，切换会出现一个蓝色图层一闪而过

在做官网移动端的时候，radio 关联 label，切换时，会闪过这么一个`蓝色图层`，这个是很莫名其妙的

对于这种情况，应该是 chrome 内核对于点击前有一个 tap 的高亮，可以通过下面这段代码进行解决

```css
* {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0); // 将高亮变为白色
}
```

### overflow : scroll 在 ios 上滑动卡顿

还是官网移动端的时候，`overflow: scroll` 在 ios 上滑动卡顿，那么可以在滚动的容器中添加以下代码

```css
.div {
  -webkit-overflow-scrolling: touch;
}
```

### 微信浏览器上下滑动出现回弹

还是官网移动端，微信浏览器中存在着回弹效果，正常情况下，我们通过 event.preventDefault() 就能解决

> 在监听 touchstart 或者 touchmove 事件的函数里，通过 `event.preventDefault()` 进行阻止事件的默认行为即可

比如官网的代码中 ：

```javascript
$(function(){
  // 上滑
  swipeUp('#list',() => {
  /**
    * 1.获取屏幕高度，用于margin-top切屏
    * 2.通过当前所在的屏数index进行判断
    * 3.触发切屏动画
  */
  getScreenHeight()
  if(index){
    toggleSliderScreen()
  }
 })
}

```

```javascript
function swipeUp(selector: any, callback: any) {
  let clientY: any;
  const differences = 50; // 绝对值大于此值定义为滑动操作
  $(document).on('touchstart', selector, function (e) {
    clientY = e.changedTouches[0].pageY;
  });

  $(document).on('touchend', selector, function (e) {
    if (clientY - e.changedTouches[0].pageY > differences) {
      e.preventDefault(); // 阻止默认事件
      callback();
    }
  });
}
```

但是，这里有问题啊，我们最后一篇要可以正常滚动啊，移动端的 `touchmove` 事件的默认行为就是滚动页面啊，我们给阻止掉了！！难受的一匹...

还有一种方案，就是通过 `touchcancel` ，也就是添加一个 touchcancel 事件，在这个事件中去触发我们的 callback 回调

```javascript
function swipeUp(selector: any, callback: any) {
  let clientY: any;
  const differences = 50; // 绝对值大于此值定义为滑动操作
  $(document).on('touchstart', selector, function (e) {
    clientY = e.changedTouches[0].pageY;
  });
  $(document).on('touchend', selector, function (e) {
    if (clientY - e.changedTouches[0].pageY > differences) {
      e.preventDefault(); // 阻止默认事件
    }
  });
  $(document).on('touchcancel', selector, function (e) {
    if (clientY - e.changedTouches[0].pageY > differences) {
      callback();
    }
  });
}
```

但是这也不是最优解，后边的话，是通过手动触发，通过监听 body 的 touchmove 事件，然后不是最后一屏就阻止，到最后一屏就不阻止 ~

```javascript
document.body.addEventListener('touchmove', disableBrowerDrag, {
  passive: false,
}); //passive 参数不能省略，用来兼容 ios 和 android

function disableBrowerDrag(e) {
  if (number < 3) {
    // number 为当前在的第几屏
    e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
  }
}
```

### input 获取焦点软键盘弹出，影响定位问题

在移动端表单，input 获取焦点弹出键盘后，页面出现空白一片，也就是被顶上去了（安卓浏览器出现）

可以通过给定一个 `min-height` ，就可解决此问题了

```html
<div className="box" id="swaperScrollBox" style={{ height: '100vh'}}></div>
```

```javascript
$('#swaperScrollBox').css('min-height', window.innerHeight + 'px');
```

```css
.box {
  overflow: hidden;
  position: relative;
}
```

### echarts 移动端无法双指缩放

在 echarts 中，v4.2.1 版本无法实现双指缩放，这是因为版本库的问题，在官网的 issues 中也能找到许多，只需从 v4.2.1 降到 v4.1.0 即可 ~
