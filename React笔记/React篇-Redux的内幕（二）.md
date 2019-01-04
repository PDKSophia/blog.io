- [Redux 的内幕（二）](#Redux的内幕（二）)
  - [一堆废话](#一堆废话)
  - [index.js](#indexjs)
  - [createStore.js](#createStorejs)
  - [来个小彩蛋](#来个小彩蛋)
  - [未待完续](#未待完续)
- [相关链接](#相关链接)

# Redux 的内幕（二）

## 一堆废话

继上一篇文章[《为什么 redux 要返回一个新的 state 引发的血案》](https://juejin.im/post/5c1b6925e51d455ac91d6bac)之后，过了半个月我彭三汉又回来了，直接看源码，[github 戳这里](https://github.com/reduxjs/redux/tree/master/src)，我们可以看到这样的文件架构

```
·
├── utils
│   ├── actionTypes
│   ├── isPlainObject
│   ├── warning
│   └─
│ 
├── applyMiddleware
│ 
├── bindActionCreatorts
│ 
├── combineReducers
│ 
├── compose
│ 
├── createStore
│ 
├── index.js
│ 
└─
```

看起来文件比较少，所以，开始跟我阿宽，不对，跟着各路大哥们的总结，一起看源码吧。

## index.js

从小妈妈就告诉我，看源码要从 index.js 入手，就我看来，`index都作为入口文件`，所以我们去 index.js 中看一下代码。简单明了，我就不多说～

```javascript
import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import warning from './utils/warning'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

/*
 * 这是一个虚函数，用于检查函数名称是否已被缩小更改.
 * 如果这个函数被修改且 NODE_ENV !== 'production'，警告用户
 */
function isCrushed() {}

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning('巴拉巴拉，反正就是警告用户')
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes
}
```

## createStore.js

我们回顾下之前说的 ：**redux 中最核心的 API 就是 —— `createStore`**， 如何使用呢 ？

```javascript
const store = createStore(reducers, preloadedState, enhance)
```

三个参数，reducers、preloadedState、enhance，源码中也有对这三个参数给出了解释

```javascript
/**
 * 创建一个包含状态树的Redux存储
 * 更改store中数据的唯一方法是在其上调用 `dispatch()`
 *
 * 你的app中应该只有一个store，指定状态树的不同部分如何响应操作
 * 你可以使用 `combineReducers` 将几个reducer组合成一个reducer函数
 *
 * @param {Function} reducer 给定当前状态树和要处理的操作的函数，返回下一个状态树
 *
 * @param {any} [preloadedState] 初始状态. 你可以选择将其指定为中的universal apps服务器状态，或者还原以前序列化的用户会话。
 * 如果你使用 `combineReducers` 来产生 root reducer 函数，那么它必须是一个与 `combineReducers` 键形状相同的对象
 *
 * @param {Function} [enhancer] store enhancer. 你可以选择指定它来增强store的第三方功能
 * 比如 middleware、time travel、persistence, Redux附带的唯一商店增强器是 `applyMiddleware()`
 *
 * @returns {Store} Redux Store，允许您读取状态，调度操作和订阅更改。
 */
```

看完了上面的解释，(...谷歌翻译好累啊), 我们继续往下看，我们从[Redux 官网](<https://redux.js.org/api/store#subscribe(listener)>)中，能看到，Store Mehods 有四个方法，源码中也有看得到～

- getState()
- dispatch(action)
- subscribe(listener)
- replaceReducer(nextReducer)

```javascript
import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

export default function createStore(reducer, preloadedState, enhancer) {

  ...

  // 检查一哈你的state和enhancer参数是否传反
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // 如果有传入合法的enhance，则通过enhancer再调用一次createStore
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.') // enhancer 期望得到的是一个函数
    }
    return enhancer(createStore)(reducer, preloadedState)
  }

  // reducer 期望得到的是一个函数
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false // 是否正在分发事件


  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 一般在action middleware 中经常会使用 `getState()`方法去获取当前的state
  function getState() {
    if (isDispatching) {
      throw new Error(
       ...
      )
    }

    return currentState
  }

  // 源码中这个函数的解释太长了，我大概读懂了，但是就不写翻译了哈，大概如下
  // 注册listener，同时返回一个取消事件注册的方法。当调用store.dispatch的时候调用listener
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error(
        '期待 listener 是一个函数'
      )
    }

    if (isDispatching) {
      throw new Error(
        '在reducer执行时，您可能无法调用store.subscribe()，如果你希望在更新store后收到通知,
        请从组件订阅并在回调中调用 store.getState() 以访问最新状态'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if(!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          '在reducer执行时，你可能无法取消订阅store侦听器'
        )
      }

      isSubscribed = false

      // 从 nextListeners 中去除掉当前 listener
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  // dispatch方法接收的action是个对象，而不是方法。dispatch()是触发状态变化的唯一方法。
  // 这个对象实际上就是我们自定义action的返回值，因为dispatch的时候，已经调用过我们的自定义action了
  // 更多详情去官网看讲解 : https://redux.js.org/api/store#example
  function dispatch(action) {
    if (!isPlainObject(action)) {  // isPlainObject 最上边 import 进来的
      throw new Error(
        'Actions 必须是一个普通对象'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions 可能没有未定义的“类型”属性'
      )
    }

    // 调用dispatch的时候只能一个个调用，通过dispatch判断调用的状态
    if (isDispatching) {
      throw new Error(
       ...
      )
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = (currentListeners = nextListeners)
    // 遍历调用每个 listener
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  // Replaces the reducer currently used by the store to calculate the state.
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error(
       ...
      )
    }

    currentReducer = nextReducer
    dispatch({
      type: ActionTypes.REPLACE // ActionTypes 最上边 import 进来的
    })
  }

  ...
  // 当create store的时候，reducer会接受一个type为ActionTypes.INIT的action，使reducer返回他们默认的state，这样可以快速的形成默认的state的结构
  dispatch({
    type: ActionTypes.INIT
  })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
```

## 来个小彩蛋

是不是很少，很多英文注释都去掉了，包括 `throw new Error` 我也没写出来，我更推荐的是，自己去看源码！！！

彩蛋嘛，就是我们来揭开上边中提到的 `actionTypes` 和 `isPlainObject` 中的神秘面纱～

actionTypes.js

```javascript
/**
 * 这些是Redux保留的私有操作类型
 * 对于任何未知 actions，你必须返回当前状态
 * 如果当前的 state 是 undefined，你必须返回初始state
 * 不要直接在代码中引用这些操作类型
 */
const randomString = () =>
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.')

const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}

export default ActionTypes
```

isPlainObject.js

```javascript
/**
 * 如果参数是普通对象，则返回true
 * Object.getPrototypeOf() 方法返回指定对象的原型，如果没有继承属性，则返回 null
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
```

## 未待完续

写博客文章实在太累了，所以还有下一集，还有上边如果有错，请大哥们指出，说真，我也是去 github 看源码，去官网看文档，搜一些大哥们的文章，还要打开谷歌翻译；其实我写的，也都是站在各位大哥的肩膀上去结合自己理解写的总结，键盘侠就不要看了，你们太牛逼了，直接去看源码吧，传送门在底下～要不这也给你一个[链接](https://github.com/reduxjs/redux/tree/master/src)吧

# 相关链接

- 《Redux 源码》: https://github.com/reduxjs/redux/tree/master/src

- 《Redux 官网》: https://redux.js.org/api/store#store

- 《Object.getPrototypeOf()
  》: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
