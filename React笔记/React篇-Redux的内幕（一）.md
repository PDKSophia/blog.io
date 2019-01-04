* [Redux的内幕（一）](#Redux的内幕（一）)
    * [一个问题引发的血案](#一个问题引发的血案)
    * [重振旗鼓](#重振旗鼓)
    * [基础了解](#基础了解)
    * [修修边幅](#修修边幅)
    * [心中有疑惑](#心中有疑惑)
* [相关链接](#相关链接)

# Redux的内幕（一）
## 一个问题引发的血案
博主在面试的过程中，面试官问 : “看你简历，Vue和React都使用过，你能说一下 [Vue和React的区别嘛？](https://github.com/PDKSophia/blog.io/blob/master/React%E7%AF%87-React%E5%92%8CVue%E7%9A%84%E5%8C%BA%E5%88%AB.md)”, 然后吧唧吧唧说了一下，于是！血案发生了，当我答道Vuex和Redux的时候，面试官问了一句，为什么Redux总是要返回一个新的 `state ` ？返回旧的 `state` 为什么不行 ？面试结果不用说，GG了。

## 重振旗鼓
过了大半个月，自己总结面试经验的时候，把Redux的源码看了一遍，ojbk，看的晕头转向，然后去github上看了一些大哥们的解读，再自己总结一哈，写个专栏，用于自己以后的复习

## 基础了解

#### Redux是什么？
Redux 是 JavaScript 状态容器，提供可预测化的状态管理方案, 官网里是这么介绍的 : 
```javascript
  // Redux is a predictable state container for JavaScript apps.
```

#### 那么它能做什么？
```javascript
  // It helps you write applications that behave consistently, run in different environments (client, server, and native) and are easy to test.
  // On top of that, it provides a great developer experience, such as live code editing combined with a time traveling debugger.
```

#### 三大原则
- 单一数据源 : 整个应用的 `state` 都存储在一颗 state tree 中，并且只存在与唯一一个 store 中

- state 是只读的 : 唯一改变 state 的方法只能通过触发 `action`，然后通过 action 的 `type` 进而分发 dispatch 。不能直接改变应用的状态

- 状态修改均由纯函数完成 : 为了描述 action 如何改变 state tree，需要编写 `reducers`

## 修修边幅
这里我们先来了解一下store、middleware、action、reducer等知识

### store
这里的 `store` 是由 Redux 提供的 createStore(reducers, preloadedState, enhancer) 方法生成。从函数签名看出，要想生成 store，必须要传入 reducers，同时也可以传入第二个可选参数初始化状态(preloadedState)。第三个参数一般为中间件 `applyMiddleware(thunkMiddleware)`，看看代码，比较直观

```javascript
  import { createStore, applyMiddleware } from 'redux'
  import thunkMiddleware from 'redux-thunk' // 这里用到了redux-thunk

  const store = createStore(
    reducers,
    state,
    applyMiddleware(thunkMiddleware) // applyMiddleware首先接收thunkMiddleware作为参数，两者组合成为一个新的函数（enhance）
  )
```
redux 中最核心的 API 就是 —— `createStore`， 通过 createStore 方法创建的store是一个对象，它本身包含4个方法 : 

- getState() : 获取 store 中当前的状态。

- dispatch(action) : 分发一个 action，并返回这个 action，这是唯一能改变 store 中数据的
方式。

- subscribe(listener) : 注册一个监听者，它在 store 发生变化时被调用。

- replaceReducer(nextReducer) : 更新当前 store 里的 reducer，一般只会在开发模式中调用该方法。

### middleware
下图中表达的是Redux 中一个简单的同步数据流动场景，点击 button 后，在回调中分发一个 action， reducer 收到 action 后，更新 state 并通知 view 重新渲染。

单向数据流，看着没什么问题。 但是，如果需要打印每一个 action 信息来调试，就得去改 dispatch 或者 reducer 实现，使其具有 打印日志的功能。

又比如，点击 button 后，需要先去服务端请求数据，只有等数据返回后，才能重新渲染 view，此时我们希望 dispatch 或 reducer 拥有异步请求的功能。再比如，需要异步请求数据返回后，打印一条日志，再请求数据，再打印日志，再渲染。

<div align='center'>
  <img src='https://github.com/PDKSophia/blog.io/raw/master/ReactImage/redux1.png' alt='' width=700 />
</div>

面对多样的业务场景，单纯地修改 dispatch 或 reducer 的代码显然不具有普适性，Redux 借鉴了 Node.js Koa 里 middleware 的思想，Redux 中 reducer 更关心的是数据的转化逻辑，所以 __middleware 就是为了增强 dispatch 而出现的。__

<div align='center'>
  <img src='https://github.com/PDKSophia/blog.io/raw/master/ReactImage/redux2.png' alt='' width=700 />
</div>

### Action
```javascript
  // 引用官网的介绍

  // Actions are payloads of information that send data from your application to your store. 
  // They are the only source of information for the store
  // You send them to the store using store.dispatch().
```
Action 是把数据从应用传到 store 的有效载荷。它是 store 数据的唯一来源。简单来说，Action就是一种消息类型，他告诉Redux是时候该做什么了，并带着相应的数据传到Redux内部。

Action就是一个简单的对象，其中必须要有一个type属性，用来标志动作类型（reducer以此判断要执行的逻辑），其他属性用户可以自定义。如：

```javascript
  const START_FETCH_API = 'START_FETCH_API'
```
```javascript
  {
    type: START_FETCH_API,
    data: {
      id: itemId,
      value: 'I am Value'
    }
  }
```
### Action Creator
看看官网中的介绍 : Action Creator are exactly that—functions that create actions. It's easy to conflate the terms “action” and “action creator”, so do your best to use the proper term。 也就是说 : Redux 中的 Action Creator 只是简单的返回一个 Action
```javascript
  function fetchStartRequestApi(jsondata) {
    return {
      type: START_FETCH_API,
      data: jsondata
    }
  }
```
我们知道，Redux 由 Flux 演变而来，在传统的 Flux 中, Action Creators 被调用之后经常会触发一个dispatch。比如: 
```javascript
  function fetchStartRequestApiDispatch(jsondata) {
    const action = {
      type: START_FETCH_API,
      data: jsondata
    }
    dispatch(action)
  }
```
但是，在Redux中，我们只需要把 Action Creators 返回的结果传给 dispatch() ，就完成了发起一个dispatch 的过程，甚至于 创建一个 `被绑定的 Action Creators ` 来自动 dispatch
```javascript
  // example 1
  dispatch(fetchStartRequestApi(jsondata))

  // example 2
  const boundFetchStartRequestApiDispatch = jsondata => dispatch(fetchStartRequestApi(jsondata))
```
这里有人就要昏厥了，dispatch() 是个啥？其实前面就讲过了，通过 createStore() 创建的 `store` 对象，他有一个方法 : dispatch(action)，store 里能直接通过 store.dispatch() 调用 dispatch() 方法，但是多数情况下，我们都会使用 react-redux 提供的 connect() 帮助器来调用。bindActionCreators() 可以自动把多个 action 创建函数绑定到 dispatch() 方法上。


### Reducers
```javascript
  // 引用官网的介绍

  // Reducers specify how the application's state changes in response to actions sent to the store. 
  // Remember that actions only describe what happened, but don't describe how the application's state changes
```
上边也说过了，Reducers必须是一个纯函数，它根据action处理state的更新，如果没有更新或遇到未知action，则返回旧state；否则返回一个新state对象。__注意：不能修改旧state，必须先拷贝一份state，再进行修改，也可以使用Object.assign函数生成新的state。__具体为什么，我们读源码的时候就知道啦～

永远不要在 reducer 里做这些操作：
- 修改传入参数；

- 执行有副作用的操作，如 API 请求和路由跳转；

- 调用非纯函数，如 Date.now() 或 Math.random()；

下边上个例子代码，帮助消化，发送请求，获取音乐列表

```javascript
  // action.js

  /*
   * action 类型
  */  
  export const START_FETCH_API = 'START_FETCH_API'
  export const STOP_FETCH_API = 'STOP_FETCH_API'
  export const RECEIVE_DATA_LIST = 'RECEIVE_DATA_LIST'
  export const SET_OTHER_FILTERS = 'SET_OTHER_FILTERS'

  /*
   * 其它的常量
  */
  export const otherFilters = {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_ACTIVE: 'SHOW_ACTIVE'
  }

  /*
   * action 创建函数
  */
  export function startFetchApi() {
    return {
      type: START_FETCH_API
    }
  }

  export function stopFetchApi() {
    return {
      type: STOP_FETCH_API
    }
  }

  export function receiveApi(jsondata) {
    return {
      type: RECEIVE_DATA_LIST,
      data: jsondata
    }
  }

  export function setOtherFilters (filter) {
    return {
      type: SET_OTHER_FILTERS,
      data: filter
    }
  }

  // 异步
  export const fetchMusicListApi = (music_id) => dispatch => {
    dispatch(startFetchApi())
    fetch({
      url: url,
      method: 'POST',
      data: {
        music_id: music_id
      }
    }).then((res) => {
      dispatch(stopFetchApi())
      dispatch(receiveApi())
    }).catch((err) => {
      console.log(err)
    })
  }
```
```javascript
  // reducers.js
  
  // 引入 action.js
  import { otherFilters } from './action'

  // 初始 state
  const initialState = {
    otherFilters: otherFilters.SHOW_ALL,
    list: [],
    isFetching: false
  }

  function reducers(state, action) {
    switch(action.type) {
      case SET_OTHER_FILTERS: 
        return Object.assign({}, state, {
          otherFilters: action.payload.data
        })
      case START_FETCH_API:
        return Object.assign({}, state, {
          isFetching: true
        })
      case STOP_FETCH_API:
        return Object.assign({}, state, {
          isFetching: false
        })
      case RECEIVE_DATA_LIST:
        return Object.assign({}, state, {
          list: [ ...action.payload.data ]
        })
      default: 
        return state
    }
  }
```

### 注意
1. 不要修改 state。 使用 `Object.assign()` 新建了一个副本。不能这样使用 Object.assign(state, { otherFilters: action.payload.data })，因为它会改变第一个参数的值。你必须把第一个参数设置为空对象

2. 在 default 情况下返回旧的 state。遇到未知的 action 时，一定要返回旧的 state。

## 心中有疑惑
- bindActionCreators() 是如何自动帮我把action绑定到dispatch上的？

- 什么是纯函数？

- 为什么reducer必须是纯函数？

- 为什么只能通过action来修改state，直接修改有什么问题？

- bindActionCreators() 是如何自动帮我把action绑定到dispatch上的？

- 为什么 reducers 在 default 的情况下，一定要返回旧的state？

- ...

# 相关链接
- Redux中文文档 : https://cn.redux.js.org/docs/basics/Actions.html

- Redux英文文档 : https://redux.js.org/basics/actions
