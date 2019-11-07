# 温馨提示

> 📢 文章首发博客: [阿宽的博客](https://github.com/PDKSophia/blog.io)

> 💕 温馨提示: 下边是对 React 合成事件的源码阅读，全文有点长，但是！如果你真的想知道这**不为人知的背后内幕**，那一定要耐心看下去！

## 前言

最近在做一个功能，然后`不小心`踩到了 **React 合成事件** 的坑，好奇心的驱使，去看了 [React 官网合成事件](https://zh-hans.reactjs.org/docs/events.html) 的解释，这不看不知道，一看吓一跳...

**SyntheticEvent**是个什么鬼？咋冒出来了个**事件池**？

我就一个简单的需求功能，为什么能扯出这些鬼玩意？？

我们先简单的来看一看我的需求功能是个啥???

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410655f54c5f3?w=500&h=310&f=jpeg&s=12648" alt="" width=200 />

## 导火线

需要做一个弹窗`打开/关闭` 的功能，当点击 `button` 的时候打开，此时打开的情况下，点击弹窗 `区域` 外，就需要关闭。

这简单嘛，直接在 `button` 上注册一个点击事件，同时在 `document.body` 注册一个点击事件，然后在 `弹窗container` 里阻止冒泡，很难嘛?

```js
class FuckEvent extends React.PureComponent {
  state = {
    showBox: false
  }
  componentDidMount() {
    document.body.addEventListener('click', this.handleClickBody, false)
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickBody, false)
  }
  handleClickBody = () => {
    this.setState({
      showBox: false
    })
  }
  handleClickButton = () => {
    this.setState({
      showBox: true
    })
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClickButton}>点击我显示弹窗</button>

        {this.state.showBox && (
          <div onClick={e => e.stopPropagation()}>我是弹窗</div>
        )}
      </div>
    )
  }
}
```

很简单嘛，很开心的点击了弹窗区域....

于是...**我没了**...点击弹窗区域，弹窗也被关闭了。。。what the f\*\*k ?????? 难道冒泡没有用 ?

带着这个问题，我走上了`不归之路`...

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e4107a48ce504c?w=260&h=260&f=jpeg&s=10325" alt="" width=150 />

## 事件委托

我们都知道，什么是事件委托，(不知道的出门左拐 👈) 在前端刀耕火种时期，事件委托可是`爸爸`

> 事件委托解决了庞大的数据列表时，无需为每个列表项绑定事件监听。同时可以动态挂载元素无需作额外的事件监听处理。

你看，事件委托那么牛 13，你觉得 React 会不用？呵，React 不仅用了，还用的非常溜 ~

怎么说呢，react 它接管了浏览器事件的优化策略，然后自身实现了一套自己的事件机制，而且特别贴心，就跟你男朋友一样，它把浏览器的不同差异，都帮你消除了 ~

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e4109976a8b99f?w=500&h=500&f=jpeg&s=20529" alt="" width=150 />

React 实现了一个**合成事件层**，就是这个事件层，把 IE 和 W3C 标准之间的兼容问题给消除了。

**📌 那么问题来了，什么是合成事件与原生事件????**

- 原生事件: 在 `componentDidMount生命周期`里边进行`addEventListener`绑定的事件

- 合成事件: 通过 JSX 方式绑定的事件，比如 `onClick={() => this.handle()}`

还记得上边的那个例子吗？我们在弹窗的 DOM 元素上绑定了一个事件，进行阻止冒泡

```js
{
  this.state.showBox && <div onClick={e => e.stopPropagation()}>我是弹窗</div>
}
```

然后在`componentDidMount生命周期`里边对 body 进行了 click 的绑定

```js
componentDidMount() {
  document.body.addEventListener('click', this.handleClickBody, false)
}

componentWillUnmount() {
  document.body.removeEventListener('click', this.handleClickBody, false)
}
```

我们去分析一下，**因为合成事件的触发是基于浏览器的事件机制来实现的，通过冒泡机制冒泡到最顶层元素，然后再由 dispatchEvent 统一去处理**

回顾一下浏览器事件机制

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e40265cacd921f?w=808&h=296&f=png&s=56700">

> Document 上边是 Window，这里截的是《JavaScript 高级程序设计》书籍里的图片

浏览器事件的执行需要经过三个阶段，捕获阶段-目标元素阶段-冒泡阶段。

🙋 Question: 此时对于合成事件进行阻止，原生事件会执行吗？答案是: 会！

📢 Answer: 因为原生事件先于合成事件执行 (个人理解: 注册的原生事件已经执行，而合成事件处于目标阶段，它阻止的冒泡只是阻止合成的事件冒泡，但是原生事件在捕获阶段就已经执行了)

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410b303b25ab6?w=225&h=225&f=jpeg&s=6267" alt="" width=150 />

## 合成事件特点

React 自己实现了这么一套事件机制，它在 DOM 事件体系基础上做了改进，减少了内存的消耗，并且最大程度上解决了 IE 等浏览器的不兼容问题

那它有什么特点？

- React 上注册的事件最终会绑定在`document`这个 DOM 上，而不是 React 组件对应的 DOM(减少内存开销就是因为所有的事件都绑定在 document 上，其他节点没有绑定事件)

- React 自身实现了一套事件冒泡机制，所以这也就是为什么我们 `event.stopPropagation()` 无效的原因。

- React 通过队列的形式，从触发的组件向父组件回溯，然后调用他们 JSX 中定义的 callback

- React 有一套自己的合成事件 `SyntheticEvent`，不是原生的，这个可以自己去看官网

- React 通过对象池的形式管理合成事件对象的创建和销毁，减少了垃圾的生成和新对象内存的分配，提高了性能

## React 事件系统

看到这里，应该对 React 合成事件有一个简单的了解了吧，我们接着去看一看源码 ~

👉 [源码 ReactBrowserEventEmitter](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactBrowserEventEmitter.js)

我们在 `ReactBrowserEventEmitter.js` 文件中可以看到，React 合成系统框架图

```
/**
 * React和事件系统概述:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 */
```

源码里边的一大串英文解释，我帮你们 google 翻译了，简单来讲就是:

- Top-level delegation 用于捕获最原始的浏览器事件，它主要由 ReactEventListener 负责，ReactEventListener 被注入后可以支持插件化的事件源，这一过程发生在主线程。

- React 对事件进行规范化和重复数据删除，以解决浏览器的怪癖。这可以在工作线程中完成。

- 将这些本地事件（具有关联的顶级类型用来捕获它）转发到`EventPluginHub`，后者将询问插件是否要提取任何合成事件。

- 然后，EventPluginHub 将通过为每个事件添加“dispatches”（关心该事件的侦听器和 ID 的序列）来对其进行注释来进行处理。

- 再接着，EventPluginHub 会调度分派事件.

> ❗ 建议直接去看英文注释，翻译可能不是很标准。

看会上边的框架图，我们得先知道一下这些都是个啥玩意，直接看名称，也能够知道 :

- [ ] ReactEventListener：负责事件的注册。
- [ ] ReactEventEmitter：负责事件的分发。
- [ ] EventPluginHub：负责事件的存储及分发。
- [ ] Plugin：根据不同的事件类型构造不同的合成事件。

👇 下面我们来一步一步的看它是怎么工作的

## 事件注册

React 中注册一个事件贼简单，就比如这样:

```js
class TaskEvent extends Reac.PureComponent {
  render() {
    return (
      <div
        onClick={() => {
          console.log('我是注册事件')
        }}
      >
        呵呵呵
      </div>
    )
  }
}
```

ok，洋洋洒洒的写下这段代码，它是如何被注册到 React 事件系统中的？

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410c0e4ec18ee?w=240&h=240&f=jpeg&s=10390" alt="" width=200 />

### enqueuePutListener()

组件在创建 mountComponent 和更新 updateComponent 的时候，都会调用 `_updateDOMProperties()` 方法

> 📢 温馨提示，这快的源码是 react 15.6.1 的源码，但是我在 github 上找对应的版本进去，居然是 Pages Not Found ... 这里就用我翻阅资料的文章中对这个注册事件的源码解释了

```js
mountComponent: function(transaction, hostParent, hostContainerInfo, context) {
  // ...
  var props = this._currentElement.props;
  // ...
  this._updateDOMProperties(null, props, transaction);
  // ...
}
```

```js
_updateDOMProperties: function (lastProps, nextProps, transaction) {
    // ...
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = propKey === STYLE ? this._previousStyleCopy : lastProps != null ? lastProps[propKey] : undefined;
      if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
        continue;
      }
      if (propKey === STYLE) {
        // ...
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        // 如果是props这个对象直接声明的属性，而不是从原型链中继承而来的，则处理它
        // 对于mountComponent，lastProp为null。updateComponent二者都不为null。unmountComponent则nextProp为null
        if (nextProp) {
          // mountComponent和updateComponent中，enqueuePutListener注册事件
          enqueuePutListener(this, propKey, nextProp, transaction);
        } else if (lastProp) {
          // unmountComponent中，删除注册的listener，防止内存泄漏
          deleteListener(this, propKey);
        }
      }
    }
}
```

上边的代码很清楚告诉你，通过 `enqueuePutListener()` 方法进行注册事件，我们接着去看看这是个啥玩意

```js
function enqueuePutListener(inst, registrationName, listener, transaction) {
  if (transaction instanceof ReactServerRenderingTransaction) {
    return
  }
  var containerInfo = inst._hostContainerInfo
  var isDocumentFragment =
    containerInfo._node && containerInfo._node.nodeType === DOC_FRAGMENT_TYPE
  // 找到document
  var doc = isDocumentFragment
    ? containerInfo._node
    : containerInfo._ownerDocument
  // 注册事件，将事件注册到document上
  listenTo(registrationName, doc)
  // 存储事件,放入事务队列中
  transaction.getReactMountReady().enqueue(putListener, {
    inst: inst,
    registrationName: registrationName,
    listener: listener
  })
}
```

💢 看到没，这个 `enqueuePutListener()` 就只干了两个事情 :

- 通过调用 `listenTo` 把事件注册到 document 上 (这就是前边说的 React 上注册的事件最终会绑定在`document`这个 DOM 上)

- 事务方式调用 `putListener` 存储事件 (就是把 React 组件内的所有事件统一的存放到一个对象里，缓存起来，为了在触发事件的时候可以查找到对应的方法去执行)

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410cbb46c1256?w=300&h=300&f=jpeg&s=28645" alt="" width=200 />

### listenTo()

虽然说不要贴代码，但是！直接看源码真的是简单明了啊，👉 [listenTo 源码](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactBrowserEventEmitter.js#L128)

> 📢 注意，react 版本是目前 github master 分支代码

我们来看一下代码

```js
export function listenTo(
  registrationName: string,
  mountAt: Document | Element | Node
): void {
  const listeningSet = getListeningSetForElement(mountAt)
  const dependencies = registrationNameDependencies[registrationName]

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i]
    // 调用该方法进行注册
    listenToTopLevel(dependency, mountAt, listeningSet)
  }
}
```

registrationName 就是传过来的 onClick，而变量 registrationNameDependencies 是一个存储了 React 事件名与浏览器原生事件名对应的一个 Map，可以通过这个 map 拿到相应的浏览器原生事件名

```js
export function listenToTopLevel(
  topLevelType: DOMTopLevelEventType,
  mountAt: Document | Element | Node,
  listeningSet: Set<DOMTopLevelEventType | string>
): void {
  if (!listeningSet.has(topLevelType)) {
    switch (topLevelType) {
      //...
      case TOP_CANCEL:
      case TOP_CLOSE:
        if (isEventSupported(getRawEventName(topLevelType))) {
          trapCapturedEvent(topLevelType, mountAt) // 捕获阶段
        }
        break
      default:
        const isMediaEvent = mediaEventTypes.indexOf(topLevelType) !== -1
        if (!isMediaEvent) {
          trapBubbledEvent(topLevelType, mountAt) // 冒泡阶段
        }
        break
    }
    listeningSet.add(topLevelType)
  }
}
```

上边忽略部分源码，我们看到，注册事件的入口是 listenTo 方法, 通过对`dependencies`循环调用`listenToTopLevel()`方法，在该方法中调用 **trapCapturedEvent** 和 **trapBubbledEvent** 来注册捕获和冒泡事件。

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410d87c2ce7fe?w=400&h=400&f=jpeg&s=36232" alt="" width=200 />

### trapCapturedEvent 与 trapBubbledEvent

下边仅对 `trapCapturedEvent` 进行分析，👉 [trapCapturedEvent 源码地址](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactDOMEventListener.js#L207)，[trapBubbledEvent 源码地址](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactDOMEventListener.js#L200)

```js
// 捕获阶段
export function trapCapturedEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element | Node
): void {
  trapEventForPluginEventSystem(element, topLevelType, true)
}

// 冒泡阶段
export function trapBubbledEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element | Node
): void {
  trapEventForPluginEventSystem(element, topLevelType, false)
}
```

```js
function trapEventForPluginEventSystem(
  element: Document | Element | Node,
  topLevelType: DOMTopLevelEventType,
  capture: boolean // 决定捕获还是冒泡阶段
): void {
  let listener
  switch (getEventPriority(topLevelType)) {
  }
  const rawEventName = getRawEventName(topLevelType)
  if (capture) {
    addEventCaptureListener(element, rawEventName, listener)
  } else {
    addEventBubbleListener(element, rawEventName, listener)
  }
}
```

😝 这里我们就能知道，捕获事件通过`addEventCaptureListener()`，而冒泡事件通过`addEventBubbleListener()`

```js
// 捕获
export function addEventCaptureListener(
  element: Document | Element | Node,
  eventType: string,
  listener: Function
): void {
  element.addEventListener(eventType, listener, true)
}

// 冒泡
export function addEventBubbleListener(
  element: Document | Element | Node,
  eventType: string,
  listener: Function
): void {
  element.addEventListener(eventType, listener, false)
}
```

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410e313b50027?w=223&h=226&f=jpeg&s=6011" alt="" width=200 />

## 事件存储

还记得上边的 `enqueuePutListener()` 中，我们将事件放入到事务队列嘛？

```js
function enqueuePutListener(inst, registrationName, listener, transaction) {
  //...
  // 注册事件，将事件注册到document上
  listenTo(registrationName, doc)
  // 存储事件,放入事务队列中
  transaction.getReactMountReady().enqueue(putListener, {
    inst: inst,
    registrationName: registrationName,
    listener: listener
  })
}
```

没错，就是 `putListener` 这个玩意，我们可以看一下代码

```js
putListener: function (inst, registrationName, listener) {
  // 用来标识注册了事件,比如onClick的React对象。key的格式为'.nodeId', 只用知道它可以标示哪个React对象就可以了
  // step1: 得到组件唯一标识
  var key = getDictionaryKey(inst);

  // step2: 得到listenerBank对象中指定事件类型的对象
  var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});

  // step3: 将listener事件回调方法存入listenerBank[registrationName][key]中,比如listenerBank['onclick'][nodeId]
  // 所有React组件对象定义的所有React事件都会存储在listenerBank中
  bankForRegistrationName[key] = listener;

  // ...
}

// 拿到组件唯一标识
var getDictionaryKey = function (inst) {
  return '.' + inst._rootNodeID;
};
```

## 事件分发

既然事件已经委托注册到 `document` 上了，那么事件触发的时候，肯定需要一个事件分发的过程，流程也很简单，既然事件存储在 `listenrBank` 中，那么我只需要找到对应的事件类型，然后执行事件回调就 ok 了

> 📢 注意: 由于元素本身并没有注册任何事件，而是委托到了 document 上，所以这个将被触发的事件是 React 自带的合成事件，而非浏览器原生事件

首先找到事件触发的`DOM`和`React Component`，找真实的 DOM 还是很好找的，在[getEventTarget 源码](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/getEventTarget.js#L17)中可以看到:

```js
// 源码看这里: https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactDOMEventListener.js#L419
const nativeEventTarget = getEventTarget(nativeEvent)
let targetInst = getClosestInstanceFromNode(nativeEventTarget)
```

```js
function getEventTarget(nativeEvent) {
  let target = nativeEvent.target || nativeEvent.srcElement || window

  if (target.correspondingUseElement) {
    target = target.correspondingUseElement
  }

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}
```

这个 `nativeEventTarget` 对象上挂在了一个以 `__reactInternalInstance` 开头的属性，这个属性就是 `internalInstanceKey` ，其值就是当前 React 实例对应的 React Component

继续看源码: [dispatchEventForPluginEventSystem()](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactDOMEventListener.js#L304)

```js
function dispatchEventForPluginEventSystem(
  topLevelType: DOMTopLevelEventType,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber
): void {
  const bookKeeping = getTopLevelCallbackBookKeeping(
    topLevelType,
    nativeEvent,
    targetInst,
    eventSystemFlags
  )

  try {
    // Event queue being processed in the same cycle allows
    // `preventDefault`.
    batchedEventUpdates(handleTopLevel, bookKeeping)
  } finally {
    releaseTopLevelCallbackBookKeeping(bookKeeping)
  }
}
```

看到了嘛，`batchedEventUpdates()`批量更新，它的工作是把当前触发的事件放到了批处理队列中。**handleTopLevel 是事件分发的核心所在**

👉 源码在这里: [handleTopLevel](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/ReactDOMEventListener.js#L148)

```js
function handleTopLevel(bookKeeping: BookKeepingInstance) {
  let targetInst = bookKeeping.targetInst

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  let ancestor = targetInst
  do {
    if (!ancestor) {
      const ancestors = bookKeeping.ancestors
      ;((ancestors: any): Array<Fiber | null>).push(ancestor)
      break
    }
    const root = findRootContainerNode(ancestor)
    if (!root) {
      break
    }
    const tag = ancestor.tag
    if (tag === HostComponent || tag === HostText) {
      bookKeeping.ancestors.push(ancestor)
    }
    ancestor = getClosestInstanceFromNode(root)
  } while (ancestor)
}
```

这里直接看上边的英文注释，讲的很清楚，主要就是**事件回调可能会改变 DOM 结构，所以要先遍历层次结构，以防存在任何嵌套的组件，然后缓存起来**。

然后继续这个方法

```js
for (let i = 0; i < bookKeeping.ancestors.length; i++) {
  targetInst = bookKeeping.ancestors[i]
  // getEventTarget上边有讲到
  const eventTarget = getEventTarget(bookKeeping.nativeEvent)
  const topLevelType = ((bookKeeping.topLevelType: any): DOMTopLevelEventType)
  const nativeEvent = ((bookKeeping.nativeEvent: any): AnyNativeEvent)

  runExtractedPluginEventsInBatch(
    topLevelType,
    targetInst,
    nativeEvent,
    eventTarget,
    bookKeeping.eventSystemFlags
  )
}
```

这里就是一个 for 循环来遍历这个 React Component 及其所有的父组件，然后执行`runExtractedPluginEventsInBatch()`方法

> 从上面的事件分发中可见，React 自身实现了一套冒泡机制。从触发事件的对象开始，向父元素回溯，依次调用它们注册的事件 callback。

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e410f292fa75d6?w=1000&h=1000&f=jpeg&s=94426" alt="" width=200 />

## 事件执行

上边讲到的 `runExtractedPluginEventsInBatch()`方法就是事件执行的入口了，通过源码，我们可以知道，它干了两件事

👉 [runExtractedPluginEventsInBatch 源码](https://github.com/facebook/react/blob/master/packages/legacy-events/EventPluginHub.js#L160)

- 构造合成事件
- 批处理构造出的合成事件

```js
export function runExtractedPluginEventsInBatch(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
  eventSystemFlags: EventSystemFlags
) {
  // step1 : 构造合成事件
  const events = extractPluginEvents(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags
  )

  // step2 : 批处理
  runEventsInBatch(events)
}
```

### 构造合成事件

我们来看看相关的代码 `extractPluginEvents()` 和 `runEventsInBatch()`

```js
function extractPluginEvents(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
  eventSystemFlags: EventSystemFlags
): Array<ReactSyntheticEvent> | ReactSyntheticEvent | null {
  let events = null
  for (let i = 0; i < plugins.length; i++) {
    // Not every plugin in the ordering may be loaded at runtime.
    const possiblePlugin: PluginModule<AnyNativeEvent> = plugins[i]
    if (possiblePlugin) {
      const extractedEvents = possiblePlugin.extractEvents(
        topLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags
      )
      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents)
      }
    }
  }
  return events
}
```

首先会去遍历 `plugins`，相关代码在: [plugins 源码](https://github.com/facebook/react/blob/master/packages/legacy-events/EventPluginRegistry.js#L163)，这个 plugins 就是所有事件合成 plugins 的集合数组，这些 plugins 是在 `EventPluginHub` 初始化时候注入的

```js
// 📢 源码地址 : https://github.com/facebook/react/blob/master/packages/legacy-events/EventPluginHub.js#L80

export const injection = {
  injectEventPluginOrder,
  injectEventPluginsByName
}
```

```js
// 📢 源码地址 : https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMClientInjection.js#L26
EventPluginHubInjection.injectEventPluginOrder(DOMEventPluginOrder)

EventPluginHubInjection.injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin
})
```

打住，这里不展开分析，我们继续看`extractEvents`的逻辑代码

```js
const extractedEvents = possiblePlugin.extractEvents(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags
)
if (extractedEvents) {
  events = accumulateInto(events, extractedEvents)
}
```

因为 **const possiblePlugin: PluginModule<AnyNativeEvent> = plugins[i]**, 类型是 PluginModule，我们可以去 👉[SimpleEventPlugin 源码](https://github.com/facebook/react/blob/master/packages/react-dom/src/events/SimpleEventPlugin.js#L249)去看一下 `extractEvents` 到底干了啥

```js
extractEvents: function() {
  const dispatchConfig = topLevelEventsToDispatchConfig[topLevelType]
  if (!dispatchConfig) {
    return null
  }
  //...
}

```

首先，看下 `topLevelEventsToDispatchConfig` 这个对象中有没有 topLevelType 这个属性，只要有，那么说明当前事件可以使用 `SimpleEventPlugin` 构造合成事件

函数里边定义了 `EventConstructor`，然后通过 `switch...case` 语句进行赋值

```js
extractEvents: function() {
  //...
  let EventConstructor
  switch (topLevelType) {
    // ...
    case DOMTopLevelEventTypes.TOP_POINTER_UP:
      EventConstructor = SyntheticPointerEvent
      break
    default:
      EventConstructor = SyntheticEvent
      break
  }
}
```

总之就是赋值给 `EventConstructor`，如果你想更加了解`SyntheticEvent`，[请点击这里](https://github.com/facebook/react/blob/master/packages/legacy-events/SyntheticEvent.js)

设置好了`EventConstructor`之后，这个方法继续执行

```js
extractEvents: function() {
  //...
  const event = EventConstructor.getPooled(
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeEventTarget
  )
  accumulateTwoPhaseDispatches(event)
  return event
}
```

这一段代码的意思就是，从 event 对象池中取出合成事件，这里的 `getPooled()` 方法其实在在 `SyntheticEvent` 初始化的时候就被设置好了，我们来看一下代码

```js
function addEventPoolingTo(EventConstructor) {
  EventConstructor.eventPool = []
  // 就是这里设置了getPooled
  EventConstructor.getPooled = getPooledEvent
  EventConstructor.release = releasePooledEvent
}

SyntheticEvent.extend = function(Interface) {
  //...
  addEventPoolingTo(Class)

  return Class
}

addEventPoolingTo(SyntheticEvent)
```

看到这里，我们知道，`getPooled` 就是 `getPooledEvent`，那我们去看看`getPooledEvent`做了啥玩意

```js
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  const EventConstructor = this
  if (EventConstructor.eventPool.length) {
    const instance = EventConstructor.eventPool.pop()
    EventConstructor.call(
      instance,
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeInst
    )
    return instance
  }
  return new EventConstructor(
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeInst
  )
}
```

首先呢，会先去对象池中，看一下 length 是否为 0，如果是第一次事件触发，那不好意思，你需要 `new EventConstructor` 了，如果后续再次触发事件的时候，直接从对象池中取，也就是直接 `instance = EventConstructor.eventPool.pop()` 出来的完事了

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e4110d2d6538bc?w=508&h=479&f=jpeg&s=17797" alt="" width=200 />

ok，我们暂时就讲到这，我们继续说一说事件执行的另一个重要操作: **批处理 runEventsInBatch(events)**

### 批处理

批处理主要是通过 `runEventQueueInBatch(events)` 进行操作，我们来看看源码: 👉 [runEventQueueInBatch 源码](https://github.com/facebook/react/blob/master/packages/legacy-events/EventBatching.js#L42)

```js
export function runEventsInBatch(
  events: Array<ReactSyntheticEvent> | ReactSyntheticEvent | null
) {
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events)
  }

  // Set `eventQueue` to null before processing it so that we can tell if more
  // events get enqueued while processing.
  const processingEventQueue = eventQueue
  eventQueue = null

  if (!processingEventQueue) {
    return
  }

  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel)
  invariant(
    !eventQueue,
    'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.'
  )
  // This would be a good time to rethrow if any of the event handlers threw.
  rethrowCaughtError()
}
```

这个方法首先会将当前需要处理的 events 事件，与之前没有处理完毕的队列调用 `accumulateInto` 方法按照顺序进行合并，组合成一个新的队列

如果`processingEventQueue`这个为空，gg，没有处理的事件，退出，否则调用 `forEachAccumulated()`，源码看这里: [forEachAccumulated 源码](https://github.com/facebook/react/blob/master/packages/legacy-events/forEachAccumulated.js#L19)

```js
function forEachAccumulated<T>(
  arr: ?(Array<T> | T),
  cb: (elem: T) => void,
  scope: ?any
) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope)
  } else if (arr) {
    cb.call(scope, arr)
  }
}
```

这个方法就是先看下事件队列 `processingEventQueue` 是不是个数组，如果是数组，说明队列中不止一个事件，则遍历队列，调用 `executeDispatchesAndReleaseTopLevel`，否则说明队列中只有一个事件，则无需遍历直接调用即可

📢 [executeDispatchesAndReleaseTopLevel 源码](https://github.com/facebook/react/blob/master/packages/legacy-events/EventBatching.js#L38)

```js
const executeDispatchesAndRelease = function(event: ReactSyntheticEvent) {
  if (event) {
    executeDispatchesInOrder(event)

    if (!event.isPersistent()) {
      event.constructor.release(event)
    }
  }
}
const executeDispatchesAndReleaseTopLevel = function(e) {
  return executeDispatchesAndRelease(e)
}
```

```js
export function executeDispatchesInOrder(event) {
  const dispatchListeners = event._dispatchListeners
  const dispatchInstances = event._dispatchInstances
  if (__DEV__) {
    validateEventDispatches(event)
  }
  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break
      }
      // Listeners and Instances are two parallel arrays that are always in sync.
      executeDispatch(event, dispatchListeners[i], dispatchInstances[i])
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances)
  }
  event._dispatchListeners = null
  event._dispatchInstances = null
}
```

首先对拿到的事件上挂载的 `dispatchListeners`，就是所有注册事件回调函数的集合，遍历这个集合，如果`event.isPropagationStopped() = ture`，ok，break 就好了，因为说明在此之前触发的事件已经调用 `event.stopPropagation()`，isPropagationStopped 的值被置为 true，当前事件以及后面的事件作为父级事件就不应该再被执行了

这里当 event.isPropagationStopped()为 true 时，中断合成事件的向上遍历执行，也就起到了和原生事件调用 stopPropagation 相同的效果
如果循环没有被中断，则继续执行 `executeDispatch` 方法，至于这个方法，源码地址献上: [executeDispatch 源码地址](https://github.com/facebook/react/blob/master/packages/legacy-events/EventPluginUtils.js#L66)

还有...

## 后续

<img src="https://user-gold-cdn.xitu.io/2019/11/6/16e4111418133f98?w=225&h=225&f=jpeg&s=7635" alt="" width=250 />

没有后续了，写不动了，接下来大家自行去看源码吧，从中午看踩坑，然后通过 `event.nativeEvent.stopImmediatePropagation` 解决问题之后，就开始翻阅相关博客文章，去看源码，我炸了，中午 2 点到晚上 10 点，都在看这玩意，我已经吐了，OMG

## 相关连接

- [阿宽的博客](https://github.com/PDKSophia/blog.io)

- [阿宽的书单](https://github.com/PDKSophia/read-booklist)

- [React 源码分析 6 — React 合成事件系统](https://zhuanlan.zhihu.com/p/25883536)
