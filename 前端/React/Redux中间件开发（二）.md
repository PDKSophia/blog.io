# rc-redux-model 从 0 到 1

## 前言

我们知道，**react 是单向数据流的形式**，它不存在数据向上回溯的技能，你要么就是向下分发，要么就是自己内部管理。

<img src="https://user-gold-cdn.xitu.io/2020/6/11/172a12549f9fb399?w=1746&h=190&f=png&s=29559" width=650 />

react 中，有 props 和 state，当我们想从父组件给子组件传递数据的时候，可通过 props 进行数据传递，如果我们想在组件内部自行管理状态，那可以选择使用 state。

很快，我们遇到了一个问题，那就是兄弟组件之间如何进行通信？答案就是在父组件中管理 state，通过 props 下发给各子组件，子组件通过回调方式，进行通信

<img src="https://user-gold-cdn.xitu.io/2020/6/11/172a1244639f47cd?w=1156&h=816&f=png&s=62503" width=520 />

这会存在什么问题？你会发现如果你想共享数据，你得把所有需要共享的 state 集中放到所有组件顶层，然后分发给所有组件。

为此，需要一个库，来作为更加牛逼、专业的顶层 state 发给各组件，于是，我们引入了 redux。

## redux 的体验

redux 可以说是较成熟，生态圈较完善的一个库了，搭配 [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) 这个 chrome 插件，让你开发更加快乐。

本身我们使用 redux 并不会有什么所谓的“痛点”，**因为 redux 默认只支持同步操作，让使用者自行选择处理异步**，对于异步请求 redux 是无能为力的。可以这么说，它保证自己是纯粹的，脏活累活都丢给别人去干。

**于是我们的痛点在于 : 如何处理异步请求 ？？**市面上有很多成熟(star 相对较多)的库，比如 :

- redux-thunk
- redux-saga
- redux-promise

很抱歉，我没用过 `redux-promise`，但是 redux-thunk 和 redux-saga 都有简单了解过，于是我进行了一下分析 :

### redux-thunk

首先，我们先了解一下什么叫 thunk？按照官网的说明，thunk 就是一个封装表达式的函数，封装的目的是延迟执行表达式

> A thunk is a function that wraps an expression to delay its evaluation.

```js
// calculation of 1 + 2 is immediate
// x === 3
let x = 1 + 2;

// calculation of 1 + 2 is delayed
// foo can be called later to perform the calculation
// foo is a thunk!
let foo = () => 1 + 2;
```

redux-thunk 的核心思想就是 : 将一个 action 变为一个 thunk，这样我们的 dispatch 就变成了

- 同步 Action 为 dispatch(action)
- 异步 Action 为 dispatch(thunk)

于是我就去把 redux-thunk 的源码看了一下 :

```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
      }

      return next(action);
    };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

这里需要你了解什么是 `洋葱模型`、`函数柯里化`、`函数式编程` 等概念，这里我就不多说了，[👉 感兴趣可看这篇文章](https://juejin.im/post/6844904183426973703)

我们来看，一个中间件完整的函数签名是 `store => next => action => {}`，但是最后执行的洋葱模型只剩下了 action，外层的 store 和 next 经过了柯里化绑定了对应的函数。也就是说，我们要先写一个中间件，也必须按照这种格式进行

你可能知道这个 action 是我们发起的，但是 store 和 next 又是哪来的？这就要知道 `applyMiddleware` 的源码是如何实现了，因为我们的中间件，是需要通过这玩意注入的

```js
export default function applyMiddleware(...middlewares) {
  return (createStore) =>
    (reducer, ...args) => {
      const store = createStore(reducer, ...args);
      let dispatch: Dispatch = () => {};

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action, ...args) => dispatch(action, ...args),
      };
      const chain = middlewares.map((middleware) => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);

      return {
        ...store,
        dispatch,
      };
    };
}
```

我们先是把传入的 middlewares 进行剥皮，并给中间件 middleware 都以我们定义的 middlewareAPI 作为参数注入，所以我们每一个中间件的上下文是 dispatch 和 getState，为什么？为什么要注入这两个玩意？

- getState：这样每一层洋葱都可以获取到当前的状态。

- dispatch：为了可以将操作传递给下一个洋葱

ok，这样执行完了之后，chain 其实是一个 (next) => (action) => { ... } 函数的数组，也就是中间件剥开后返回的函数组成的数组。之后我们以 store.dispatch 作为参数进行注入～ 通过 compose 对中间件数组内剥出来的高阶函数进行组合形成一个调用链。调用一次，中间件内的所有函数都将被执行。

了解了这些概念以及部分源码之后，对 redux-thunk 可以说是比较清晰了。

- 判断如果 action 是 function 那么执行 return action(dispatch, getState)
  - action 就是一个 thunk，执行了 action，就等于执行了一个函数
    - 在这个 thunk 中写我们的异步逻辑，这个 thunk 中，我们还能拿到 dispatch，我们执行完了异步逻辑之后，通过 dispatch，再此发起 action，比如将异步请求数据写到 state 中
    - 再次发起的 action，又开始了新的 redux 数据流，重新回到最开始的逻辑
  - 把执行的结果作为返回值直接返回，直接返回并没有调用其他中间件，也就意味着中间件的执行在这里停止了
- 如果是一个对象，直接调用其他中间件并返回

### redux-saga

redux-thunk 是支持函数形式的 action，这样在 action 里就可以 dispatch 其他的 action 了。但缺点是修改了 action 的含义，使得 action 变得不那么纯粹了。

redux-saga 又是一个不一样的解决方案 :

- 完全基于 ES6 的 Generator Function

- 通过监控 action, 监听到 action，自动触发对应的函数做处理

- 所有带副作用的操作（异步代码， 业务控制逻辑代码）都被放到 saga 中

这里我就不对 saga 进行进一步说明，我们只要知道这两种方式在处理异步 Action 上的区别即可

## dva

前边我们说了，既然我们在使用 redux + redux-saga 上，需要写很多样板代码，有没有一个可以让我们写起来很爽的解决方案呢？

**dva，基于 redux 和 redux-saga 的数据流方案，让你在一个 model 文件中写所有的 `action、state、effect、reducers`等，然后为了简化开发体验，内置了 react-router 和 fetch**.

聊聊我对 dva 的看法，官方说了，基于 `redux` + `redux-saga` 的方案，只是在你写的时候，都写在一个 model 文件，然后它帮你做一些处理；其次它是一个框架，而不是一个库，等价于: 我在项目开始之前，我就需要确定项目的架构是不是用 dva，总不能在中途，又引入 dva 吧？

回过头来看，我的出发点是 : 写一个中间件，它是一个库，它只是让写状态数据跟写 dva 那样，简便舒服，仅此而已。我总不能为了写 model，而引入一个 dva ～

其次 dva 还是用的 redux-saga 形式，意味着我们要想获取异步请求后的数据，还是需要通过 callback 的形式，能不能将 redux-saga 也抛弃，使用 Promise 的方式替代它呢？

## 初建雏形

由于之前看过 redux 源码，同时也看了一下 redux-thunk 的源码，并且查阅了一些相关文章，有了一些知识储备，说干就干～

参考了 dva 中对 model 的参数说明，因为我们没有了 redux-saga ，所以是没有 `effect` 这个属性的，于是初步得到我们的 model 参数

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6f31616f946e4f6197bffb9dfcf880c5~tplv-k3u1fbpfcp-zoom-1.image" width=300 />

按照我们的设想，我们会存在多个 model 文件，聚集在一起之后，得到的是一个数组 :

```js
import aModel from './aModel';
import bModel from './bModel';
import cModel from './cModel';

export default [aModel, bModel, cModel];
```

我所希望的是 : 传入一个 `Array<IModelProps>`，得到一个 `RcReduxModel` 对象，该对象拥有 :

- reducers: 所有 model.reducers 集合，这样我可以无障碍的用在 `store.combineReducers`中了
- thunk: 得到一个 `thunk`，上边说了，异步 Action 其实就是 dispatch(thunk)，将该 thunk 注入到 `store.applyMiddleware` 中

这里需要规定一点，那就是对于同步 Action 与异步 Action 的处理，在`rc-redux-model`中，每一个 Action 都是异步的，也就是你发起的每一个 Action，都是函数，等价于，我们的 model 中的 action 要这么写 :

```js
aModel = {
  action: {
    firstAction: ({ getState, dispatch }) => {},
    secondAction: ({ getState, dispatch }) => {},
  },
};
```

即使你想要发起一个同步 Action，去修改 state 的值，我也会将其作为异步进行处理，也就是你修改 state 值，你需要这么写 :

```js
// 组件
this.props.dispatch({
  type: 'aModel/changeStateA',
  payload: '666',
});
```

```js
aModel = {
  namespace: 'aModel',
  state: {
    a: '111',
  },
  action: {
    // 这里是异步action，这里需要用户自己手动 dispatch 去修改 state 值
    changeStateA: ({ currentAction, dispatch }) => {
      dispatch({
        type: 'CHANGE_STATE_A',
        payload: currentAction.payload,
      });
    },
  },
  reducers: {
    ['CHANGE_STATE_A'](state, payload) {
      return {
        ...state,
        a: payload,
      };
    },
  },
};
```

明确了这两点，接下来就只需要开发即可。我们知道，redux 中，reducer 是一个纯函数，所以我们注册 reducer 中时，一定要明确这点: (以下代码摘抄 rc-redux-model 源码)

```js
public registerReducers(model: IModelProps) {
    const { namespace, state, reducers } = model
    // 3检查 reducers
    invariant(reducers, `model's reducers must be defined, but got undefined`)

    // 3.1 得到所有 reducers 中的 action
    const reducersActionTypes = Object.keys(reducers)

    // 3.2 reducers 是一个纯函数，function(state, action) {}
    return (storeState: any, storeAction: any) => {
      const newState = storeState || state
      // 3.3 对 action 进行处理，规定 action.type 都是 namespace/actionName 的格式
      const reducersActionKeys = storeAction.type.split('/')

      const reducersActionModelName = reducersActionKeys[0]
      const reducersActionSelfName = reducersActionKeys[1]

      // 3.3.1 如果不是当前的 model
      if (reducersActionModelName !== namespace) return newState
      // 3.3.2 如果在 reducers 中存在这个 action
      if (reducersActionTypes.includes(reducersActionSelfName)) {
        return reducers[reducersActionSelfName](newState, storeAction.payload)
      }
      return newState
    }
  }
```

其次是对于中间件的开发，上边我们知道了，每一个中间件都是 `store => next => action` 的形式，所以我们很简单就可以写出这段代码 ：

```js
const registerMiddleWare = (models: any) => {
  return ({ dispatch, getState }) =>
    (next: any) =>
    (action: any) => {
      // 这个 action 是我们 this.props.dispatch 发起的action
      // 所以我们需要找到它具体对应的是哪个 model.namespace 的
      // 前边已经对 model.namespace 做了判断，确保每个 model.namespace 必须唯一，不能重复
      // 找到该 model，然后再找到这个 model.action 中对应我们发起的 action
      // 因为每一个 action 都是以 [model.namespace/actionName] 的形式，所以我们可以 split 之后得到 namespace
      const actionKeyTypes = action.type.split('/');
      const actionModelName = actionKeyTypes[0];
      const actionSelfName = actionKeyTypes[1];

      const currentModel = getCurrentModel(actionModelName, models);

      if (currentModel) {
        const currentModelAction = currentModel.action
          ? currentModel.action[actionSelfName]
          : null;
        // 参考redux-thunk的写法，判断是不是function，如果是，说明是个thunk
        if (currentModelAction && typeof currentModelAction === 'function') {
          return currentModelAction({
            dispatch,
            getState,
            currentAction: action,
          });
        }
        // 因为这里的action，可能是一个发到reducer，修改state的值
        // 但是在 model.action 中是直接写的是 dispatch reducerAction
        // 而我们的每一个action都要[model.namespace/actionName]格式
        // 所以这里需要处理，并且判断这个action是不是在reducers中存在
        // 这里就不贴代码了，感兴趣的直接去看源码～
      }
    };
  return next(action);
};
```

上边是摘抄了部分源码，感兴趣的小伙伴可以去看看源码，并不多，并且源码中我都写了注释。经过不断调试，并且通过 jest 写了单元测试，并没有啥毛病，于是我兴致勃勃得给身边的同事安利了一波，没想到被 👊 打击了

## 提供默认行为

“只有被怼过，才能知道你做的是什么破玩意”，在我给小伙伴安利的时候，他问 : “那你这东西，有什么用？”，我说写状态数据像写 dva 一样舒服，于是他又说，那我为什么不用 dva 呢？

解释一波后，他接着说: “不可否认的是，你这个库，写状态数据起来确实舒服，但我作为一个使用者，要在组里推广使用，仅靠此功能，是无法说服我们组里的人都用你这个东西，除非你还能提供一些功能。听完你的介绍，你说你的 action 都是异步的，等价于修改 state 的 action，都需要我自己去写，假设我有 20 个 state，意味着我得在 model.action 中，写对应的 20 个修改 state 的 action，然后在 model.reducers 中同样写 20 个相对应的 reducer，作为使用者，我的工作量是不是很大，如果你能提供一个默认的 action 行为给我，那么我还可能会用”

仔细一想，确实如此，那我就提供一个默认的 action，用于用户修改 state 的值吧，当我提供了此 action 之后，我又发现，所有修改 state 的 action，都走同一个 `action.type`，那么在 [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) 中，是很难发现这个 action 触发，具体是为了修改哪个 state 值。

但是正如使用者说的，如果有 20 个 state 值，那么我为用户自动注册 20 个 action，用户在使用上是否需要记住每一个 state 对应的 action 呢？这肯定是极其不合理的，所以最终解决方案为 : 为每一个 state ，自动注册对应的 action 和 reducer， 同时再提供了一个默认的 action(setStoreLib)

> ✨ 例 : state 有 n 个值，那么最终会自动注册 n+1 个 action，用户只需要记住并调用默认的这个 action(setStoreLib) 即可

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7745e58bc5f4410c9404e631c7bc6273~tplv-k3u1fbpfcp-zoom-1.image" width=750 />

用户只需要调用默认提供的 `setStoreLib` 即可，然后根据 key 进行判断，从而转发到对应到 action 上 ～ 使用起来极其简单

```js
this.props.dispatch({
  type: '[model.namespace]/setStoreLib',
  payload: {
    key: [model.state.key]
    values: [your values]
  }
})
```

> **对外提供统一默认 action，方便用户使用；对内根据 key，进行真实 action 的转发**

## 数据不可变

在函数式编程语言中，数据是不可变的，所有的数据一旦产生，就不能改变其中的值，如果要改变，那就只能生成一个新的数据。在我们的项目中，我们使用了 `seamless-immutable`，那么在 model.state 中，我使用了 Immutable 包裹了 state，然后调用默认提供的 action，最后会报错，懂的都懂 !

那么该怎么办呢？于是...我又在内部支持了 Immutable ，提供一个配置参数 openSeamlessImmutable，默认为 false，请注意，如果你的 state 是 Immutable，而在 model 中不设置此配置，那么会报错 !!!

```js
// 使用 seamless-immutable

import Immutable from 'seamless-immutable';

export default {
  namespace: 'appModel',
  state: Immutable({}),
  openSeamlessImmutable: true, // 必须开启此配置!!!!!
};
```

## 结尾

到此，终于将一套流程走完，同时在组里的项目拉了个分支，实践使用了一波，完美兼容，未出问题。于是交付了第一个可使用的版本，这次一个中间件的开发，让我对 redux 的了解更近异步，最后，👏 欢迎大家留言一起交流

## 相关文章

- [dva 介绍](https://github.com/dvajs/dva/issues/1)
- [图解 Redux 中 middleware 的洋葱模型](https://github.com/fi3ework/blog/issues/14)
- [轻松搞定 Redux 源码解读与编程艺术](https://juejin.im/post/6844904183426973703)
- [查缺补漏 React 状态管理探索](https://juejin.im/post/6854573215440699399)
- [react 下一个状态管理器: hox](https://juejin.im/post/6854573204569227271)
- [redux 中文官网之 middleware 介绍](https://www.redux.org.cn/docs/advanced/Middleware.html)
