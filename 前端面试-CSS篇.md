<!-- GFM-TOC -->

- [CSS](#CSS)
  - [盒模型](#盒模型)
  - [BFC](#BFC)
  - [Flex 布局](#Flex布局)
  - [CSS3 新特性](#CSS3新特性)
  - [垂直居中的方式](#垂直居中的方式)
  - [清除浮动的几种方式](#清除浮动的几种方式)
  - [position 属性的了解](#position属性的了解)
  - [CSS 优先级算法如何计算](#CSS优先级算法如何计算)
  - [如何画一条 0.5px 的线?](#transition和animation的区别)
  - [border:none 和 border:0 的区别](#bordernone和border0的区别)
  - [transition 和 animation 的区别?](#transition和animation的区别)
  - [visibility:hidden 和 display:none 以及 opacity:0](#visibilityhidden和displaynone以及opacity0)
  - [如果需要手动写动画，你认为最小时间间隔是多久，为什么](#如果需要手动写动画你认为最小时间间隔是多久为什么)
    <!-- GFM-TOC -->

# CSS

## 盒模型

> 有两种 : 标准盒模型 和 IE 盒模型

标准盒模型

<img src="https://images2017.cnblogs.com/blog/1265396/201711/1265396-20171119143703656-1332857321.png">

IE 盒模型

<img src="https://images2017.cnblogs.com/blog/1265396/201711/1265396-20171119144229156-49945808.png">

这两种盒子模型最主要的区别就是 `width` 的包含范围

- 标准盒模型 : width = content

- IE 盒模型 : width = content + padding + border

如何设置这两种模型 ?

- `标准模型`: box-sizing:content-box;
- `IE模型`: box-sizing:border-box;

---

## BFC

> BFC : 块级格式化上下文，可以理解为是一种属性，这种属性影响着元素等定位以及其兄弟元素之间等相互作用。

- BFC 区域不会与 float box 重叠
- BFC 是页面上的一个独立容器，子元素不会影响到外面
- 计算 BFC 高度时，浮动元素也会参与计算

生成条件?

- float 除 `none` 之外的值

- position 为 `fixed` 和 `absolute` 的元素

- display 为 `inline-block` 、 `table-cell` 、 `table-caption` 、 `flex` 、 `inline-flex`的元素

- overflow 不为`visible`的元素 (比如 : hidden 、 scroll 、 auto)

边距重叠?

```html
<div style="marginBottom: 30px"></div>

<div style="marginTop: 50px"></div>

<!-- 上边代码，其实他们的边距并不是 30 + 50 ，而是发生了重叠，取最大50 -->

<!-- 如何解决边距问题，创建BFC，给第二个div添加父元素，在父元素上生成BFC -->

<div style="marginBottom: 30px"></div>

<div style="overflow: hidden">
  <div style="marginTop: 50px"></div>
</div>
```

---

## Flex 布局

弹性布局，一般就是用于居中啊，然后模拟 bootstrap 的栅格分列等 ....

六大属性

- `flex-direction` : 属性决定主轴的方向

- `flex-wrap` : 是否换行
- `flex-flow` : flex-flow 属性是 flex-direction 属性和 flex-wrap 属性的简写形式，默认值为 row nowrap。
- `justify-content` : 属性定义了项目在主轴上的对齐方式
- `align-items` : 属性定义项目在交叉轴上如何对齐。
- `align-content` : 属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用

> ⚠ 注意: 在 IE 下使用 flex: 1 一定要添加 -ms-flex ，不然就会出现问题

```js
<div style="display: flex; max-width: 300px">
  <i style="width: 10; height: 10;"></i>
  <span style="flex: 1; white-space: nowrap">牛逼</span>
</div>

// 这会出现问题，直观只会看到 i 标签，看不到span标签的文字，可以考虑这样改

// 添加 -ms-flex
<span style="flex: 1; white-space: nowrap; -ms-flex: 1 1 auto">希沃易课堂</span>

// 如果这时候前边的 i 出现压缩，可以在 i 标签添加 flex-shrink
<i style="width: 10; height: 10; flex-shrink: 0"></i>
```

---

## CSS3 新特性

面试中，面试官会问你，css3 新加了哪些新特性呢？很显然这道题目是有陷阱的，你不可能将所有的特性一个不漏的说出来，就算你说出来，别人还认为你是背的了，这边我就大概说下我在开发中，用到的 css3 新特性

`border-radius` 圆角

```css
border-radius: 10px;
```

`text-shadow` 阴影

```css
text-shadow: 5px 2px 6px rgba(64, 64, 64, 0.5);

/* 水平阴影的位置， 垂直阴影的位置， 模糊的距离， 阴影的颜色*/
```

`-webkit-gradient` 渐变

```css
background-image: -webkit-gradient(
  linear,
  0% 0%,
  100% 0%,
  from(#2a8bbe),
  to(#fe280e)
);
```

`display: -webkit-box` 水平垂直居中

```css
.box {
  display: -webkit-box;
  -webkit-box-orient: horizontal; /* 父容器里子容器的排列方式，是水平还是垂直 */
  -wekit-box-pack: center; /* 父容器里子容器的水平对齐方式 */
  -webkit-box-align: center; /* 父容器里子容器的垂直对齐方式 */
}
```

`transition` 过渡

- transition-property 对象参与过渡的属性
- transition-duration 过渡的持续时间
- transition-timing-function 过渡的类型
- transition-delay 延迟过渡的时间

```css
transition: color 5s ease-in 1s;
```

`transforms` 变形转换

> 主要包括 translate（水平移动）、rotate（旋转）、scale（伸缩）、skew（倾斜）

`animation` 动画

- animation-name 规定需要绑定到选择器的 keyframe

- animation-duration 规定完成动画所花费的时间，以秒或毫秒计

- animation-timing-function 规定动画的速度曲线

- animation-delay 规定在动画开始之前的延迟

- animation-iteration-count 规定动画应该播放的次数

- animation-direction 规定是否应该轮流反向播放动画。

```css
div {
  width: 100px;
  height: 100px;
  background: red;
  position: relative;
  animation: isAnimate 5s infinite;
  -webkit-animation: isAnimate 5s infinite; /*Safari and Chrome*/
}

@keyframes isAnimate {
  from {
    left: 0px;
  }
  to {
    left: 200px;
  }
}

@-webkit-keyframes isAnimate {
  from {
    left: 0px;
  }
  to {
    left: 200px;
  }
}
```

---

## 垂直居中的方式

方法一 ： `table-cell` (未脱离文档流)

```css
    /* css */
    .box {
      display : table-cell;
      vertical-algin : middle; /* 把元素放在父元素的中部 */
      text-align : center;
    }

    /* html */
    <div class="box">
      <span>垂直居中</span>
    </div>
```

方法二 ： `flex弹性布局`

```css
.box {
  display: flex;
  justify-content: center; /* 主轴上的对齐方式 */
  item-aligns: center; /* 交叉轴上对齐方式 */
}
```

方法三 ： `绝对定位`居中技术，已知高度和宽度的元素解决方案

我们经常用 margin:0 auto;来实现水平居中，而一直认为 margin:auto;不能实现垂直居中......其实，可以做得到。。。不过这里得确定内部元素的高度，可以用百分比，比较适合移动端。

```css
.box span {
  height: 100px; /* 这里必须定义内部元素的高度 */
  overflow: auto;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
```

方法四 ： `绝对定位`和`负边距`

```css
.box {
  position: relative;
}

.box span {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 50px;
  margin-left: -50px; /* 这里如果不加，就不会居中，会往右偏 width / 2 的距离 */
  margin-top: -25px; /* 这里如果不加，就不会居中，会往下偏 height / 2 的距离 */
  text-align: center;
}
```

方法五 ：`绝对定位`和`transform`, 未知宽高的情况下使用；

```css
.box {
  position: relative;
  height: 300px;
}

.box p.label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

方法六 ：`display: -webkit-box` 水平垂直居中

```css
.box {
  display: -webkit-box;
  -webkit-box-orient: horizontal; /* 父容器里子容器的排列方式，是水平还是垂直 */
  -wekit-box-pack: center; /* 父容器里子容器的水平对齐方式 */
  -webkit-box-align: center; /* 父容器里子容器的垂直对齐方式 */
}
```

---

## 清除浮动的几种方式

- 父级元素追加空子元素，并设定 clear : both
- 父级元素定义 overflow : hidden
- 父级元素定义伪类 :after 和 zoom

---

## 块级元素 和 行内元素

### 块级元素

都占一行，并且自动填满父元素，可以设定 padding 和 margin

常见的块级元素 : div 、h1 - h6 、 ul 、li 、ol 等

### 行内元素

不会独占一行，width 和 height 失效，并且 margin-top 、 margin-bottom 、 padding-top 、 padding-bottom 失效。

常见的行内元素 : span 、b 、img、 input 、select 、 strong 等

### 嵌套规则

块级元素可以嵌套行内元素或部分的块级元素，行内元素只能嵌套行内元素。

---

## 如何画一条 0.5px 的线?

`Chrome`把 0.5px 四舍五入变成了 1px，而`firefox/safari`能够画出半个像素的边，并且`Chrome`会把小于 0.5px 的当成 0，而`Firefox`会把不小于 0.55px 当成 1px，`Safari`是把不小于 0.75px 当成 1px，进一步在手机上观察 IOS 的 Chrome 会画出 0.5px 的边，而安卓(5.0)原生浏览器是不行的。所以直接设置 0.5px 不同浏览器的差异比较大

解决方法: 使用缩放 `transform : scaleY(0.5)`

```css
    .hr.scale-half {
        height: 1px;
        transform: scaleY(0.5);
    }

    <p>1px + scaleY(0.5)</p>
    <div class="hr scale-half"></div>
```

---

## transition 和 animation 的区别?

`animation`和`transition`大部分属性是相同的，他们都是随时间改变元素的属性值。

他们的主要区别是 transition 需要触发一个事件才能改变属性，而 animation 不需要触发任何事件的情况下才会随时间改变属性值，并且 transition 为 2 帧，从 from .... to，而 animation 可以一帧一帧的。

并且 `transition` 关注的是 CSS property 的变化，而 `animation` 作用于元素本身而不是样式属性，可以使用`关键帧`的概念，应该说可以实现更自由的动画效果。`animation` 制作动画必须用关键帧声明一个动画，而且在 animation 调用关键帧声明的动画。

什么是关键帧 ?

`@keyframes`就是关键帧，而且需要加`webkit`前缀，比如 ：

```css
/* 当鼠标悬浮在button class为login的按钮时，触发changeColor动画 */

button.login:hover {
  -webkit-animation: 1s changeColor;
  animation: 1s changeColor;
}

@-webkit-keyframes changeColor {
  0% {
    background: #c00;
  }
  50% {
    background: orange;
  }
  100% {
    background: yellowgreen;
  }
}
@keyframes changeColor {
  0% {
    background: #c00;
  }
  50% {
    background: orange;
  }
  100% {
    background: yellowgreen;
  }
}

/* 上面代码中的0% 100%的百分号都不能省略，0%可以由from代替，100%可以由to代替。 */
```

知乎上有个答案这么说的 :

```
Transition 强调过渡，Transition ＋ Transform ＝ 两个关键帧的Animation
Animation 强调流程与控制，Duration ＋ TransformLib ＋ Control ＝ 多个关键帧的Animation

```

甚至于，我们可以说 : **transition 是 Animation 的一个子集，即一个 Animation 是由多个 transition 组合而成的。**

---

## visibility:hidden 和 display:none 以及 opacity:0

- `opacity : 0`，该元素隐藏起来了，但不会改变页面布局，并且，如果该元素已经绑定一些事件，如 click 事件，那么点击该区域，也能触发点击事件

- `visibility : hidden`，该元素隐藏起来了，但不会改变页面布局，但是不会触发该元素已经绑定的事件

- `display : none`，把元素隐藏起来，并且会改变页面布局，可以理解成在页面中把该元素删除掉一样。

---

## border:none 和 border:0 的区别

【 性能差异 】

- `border:none` ，浏览器在解析的时候，不做出渲染动作，不消耗内存值

- `border:0`，虽然看不见，但是在解析的时候还是进行了渲染，消耗了内存值

【 兼容性差异 】

- `border:none`，对 IE6/7 无效。边框依然存在

- `border:0`，所有浏览器一致把边框隐藏

---

## CSS 优先级算法如何计算

优先级比较

- 优先级`就近原则`，`同权重`情况下样式定义最近者为准

- 载入样式以`最后载入`的定位为准

- 优先级为: !important > id > class > tag， important 比 内联优先级高

权重的比较

- ！important 规则最重要，大于其它规则
  行内样式规则，加 1000

- 对于选择器中给定的各个 ID 属性值，加 100

- 对于选择器中给定的各个类属性、属性选择器或者伪类选择器，加 10

- 对于选择其中给定的各个元素标签选择器，加 1

- 如果权值一样，则按照样式规则的先后顺序来应用，顺序靠后的覆盖靠前的规则

---

## position 属性的了解

- `absolute`：生成绝对定位的元素，相对于 static 定位以外的第一个父元素进行定位

- `fixed`：生成绝对定位的元素，相对于浏览器窗口进行定位

- `relative`：生成相对定位的元素，相对于其正常位置进行定位

- `static` 默认值。没有定位，元素出现在正常的流中

- `inherit` 规定从父元素继承 position 属性的值

---

## 如果需要手动写动画，你认为最小时间间隔是多久，为什么

这里了解 canvas 写动画特效的应该不会忘记 `requestAnimationFrame`这个 API 吧，当你需要更新屏幕画面时就可以调用此方法。

在浏览器下次重绘前执行回调函数。回调的次数通常是每秒 60 次，而多数显示器默认频率是 60Hz，即 1 秒刷新 60 次，所以理论上最小间隔为 1/60＊1000ms ＝ `16.7ms`
