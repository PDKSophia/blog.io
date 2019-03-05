## 前言

之前讲了 [nextTick 与 watcher 以及 Dep 的蓝色生死恋](https://github.com/PDKSophia/blog.io/blob/master/Vue%E7%AC%94%E8%AE%B0/Vue%E7%AF%87-nextTick%E4%B8%8Ewatcher%E4%BB%A5%E5%8F%8ADep%E7%9A%84%E8%93%9D%E8%89%B2%E7%94%9F%E6%AD%BB%E6%81%8B.md)，并且了解了 [Vue 的双向绑定原理](https://github.com/PDKSophia/blog.io/blob/master/Vue%E7%AC%94%E8%AE%B0/Vue%E7%AF%87-%E6%95%B0%E6%8D%AE%E5%8F%8C%E5%90%91%E7%BB%91%E5%AE%9A%E5%8E%9F%E7%90%86.md)，所以我们知道，在对 `model` 进行处理的时候，会触发 `Dep` 中的 `Watcher` 对象，然后 `Watcher` 对象对调用自身的 `update` 来修改视图。最终是将新产生的 VNode 节点与老 VNode 进行一个 patch 的过程，比对得出「差异」，最终将这些「差异」更新到视图上

> 我们知道，在 Vue 编译的时候，在 optimise 阶段，该阶段的主要任务就是标记 `static` 静态节点，这是 Vue 在编译工程中的一个优处，后面在 update 更新视图时，会有一个 pacth 过程，diff 算法会直接跳过静态节点，从而减少了比较过程，优化 patch 的性能

所以我们接下来来看看 Vue diff 算法，也就是了解一下 `patch` 的过程，这里我更加建议，作为看客的你，可以先去看看染陌大大写的这个小册: [剖析 Vue.js 内部运行机制](https://juejin.im/book/5a36661851882538e2259c0f/section/5a3bb17ff265da432529796a)， 废话不多说，我们往下看吧 (我可是看了好多大哥们写的博客文章，结合理解揉合在一起的)

## Virtual Dom

先说说虚拟 DOM，首先我们要知道，在渲染的时候，大量渲染真实的 DOM 开销是非常大的，比如说我只是修改了某个数据，如果说通过渲染真实的 DOM 结点，会导致我的整颗 DOM 数回流重绘，那有没有办法，就是只更新我要修改的那一小块部分呢？即能更新又不需要重新更新 DOM 树 🌲，OK，`diff` 算法身披铠甲，脚踩七彩祥云 ☁️ 它...来了

### What is Virtual DOM

直性子的我，就直接说吧，Virtual DOM 只是一个简单的 JS 对象，并且最少包含 tag、props 和 children 三个属性。不同的框架对这三个属性的命名会有点差别，但表达的意思是一致的。它们分别是标签名（tag）、属性（props）和子元素对象（children）。下面是一个典型的 Virtual DOM 对象例子：

```javascript
{
  tag: 'div',
  props: {},
  children: [
    'hello world',
    {
      tag: 'ul',
      props: {},
      children: [
        tag: 'li',
        props: {
          id: 1,
          class: 'li-1',
          children: ['顺序', 1]
        }
      ]
    }
  ]
}
```

然后对应的真实 DOM 是这样的

```html
<div>
  hello wolrd
  <ul>
    <li class="li-1" id="1">
      顺序1
    </li>
  </ul>
</div>
```

**Vritual DOM 和 真实 DOM 是一一对应的关系**，不能说太多，关于 Vritual DOM 的更多了解，我在 google 的时候，发现了一篇特别好的文章，[`Change And Its Detection In JavaScript Frameworks`](http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html)，感兴趣的可以继续去看看，主要今天的主角不是它，是 patch 机制，是 diff 算法 👏

OK，知道了 `Vritual DOM` 之后，继续往下看，首先会先根据真实的 DOM 生成一颗 `Vritual DOM`，然后呢，当 `Vritual DOM` 某个节点上的数据发生改变后，会生成一个新的 `VNode`，然后 VNode 和 oldVNode 进行一个比较

我们这里举个例子，我们在 body 里插入一个 `class = style-A` 的 div

```javascript
var div = document.createElement('div')
div.className = 'style-A'
document.body.appendChild(div)
```

对于这个 div 可以用一个 Vritual DOM 去代表它，怎么说呢，就是这个 Vritual DOM 存储了对应 DOM 上的一些重要参数，在修改 DOM 之前，会先比较 Vritual DOM 的数据，如果需要改变，才会被映射到真实的 DOM 上

```javascript
var divVritual = {
  tag: 'div',
  props: {
    class: 'style-A'
  },
  children: []
}
// 修改了DOM
var newDivVritual = {
  tag: 'div',
  props: {
    class: 'style-B'
  },
  children: []
}

// vue / patch.js源码中比较
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag &&
      a.isComment === b.isComment &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)))
  )
}

// 比较的源码下边会讲到，这里就是将oldVNode和newVNode进行一个比较
sameVnode(divVritual, newDivVritual)
```

这里可以看这张图，[React's diff algorithm](https://calendar.perfplanet.com/2013/diff/)，很经典，我们可以知道: **diff 算法比较只会在同一层级进行比较，而不会说出现夸层比较**

<div align='center'>
<!-- <img src='https://github.com/PDKSophia/blog.io/raw/master/image/diff-1.png' width='450' height='250' /> -->
</div>

### diff 流程图

当数据发生改变时，set 方法会让调用 Dep.notify 通知所有订阅者 Watcher，订阅者就会调用 patch 给真实的 DOM 打补丁，更新相应的视图

<div align='center'>
<!-- <img src='https://github.com/PDKSophia/blog.io/raw/master/image/diff-2.png' width='550' height='550' /> -->
</div>

### 源码安排

其实一上手，我是真不知道  这个该从何看起，于是我去看了染陌大大的小册，发现它是从  `跨平台`的 API 开始将的，所以这里就直接引用他讲的解释啦～

> 因为使用了 Virtual DOM 的原因，Vue.js 具有了跨平台的能力，通过适配，将不同平台的 API 封装在内，以同样的接口对外提供。

```javascript
const nodeOps = {
  setTextContent(text) {
    if (platform === 'weex') {
      node.parentNode.setAttr('value', text)
    } else if (platform === 'web') {
      node.textContent = text
    }
  },
  parentNode() {
    //......
  },
  removeChild() {
    //......
  },
  nextSibling() {
    //......
  },
  insertBefore() {
    //......
  }
}

// 来自《染陌 - 剖析 Vue.js 内部运行机制》
```

知道了之后，我们直接上 [patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js) 的源码

#### patch.js（仅贴出重要核心代码）

```javascript
/**
 * @return {Function}
 * @desc createPatchFunction的返回值，返回一个 patch 函数
 */
return function patch(oldVnode, vnode, hydrating, removeOnly) {
  /*vnode不存在则直接调用销毁钩子*/
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }
}
```

---

### 相关链接

- [解析 Vue2.0 的 diff 算法](https://github.com/aooy/blog/issues/2)

- [源码 patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js)

- [染陌 - diff 算法](<https://github.com/answershuto/learnVue/blob/master/docs/VirtualDOM%E4%B8%8Ediff(Vue%E5%AE%9E%E7%8E%B0).MarkDown>)
