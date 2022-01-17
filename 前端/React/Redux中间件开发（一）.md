<!--
 * @Description:
 * @Author: pengdaokuan
 * @LastEditors: pengdaokuan
 * @Date: 2022-01-16 17:10:07
 * @LastEditTime: 2022-01-16 17:10:07
-->

## Why rc-redux-model ?

相信大家都了解 `redux`，并且也认同这种数据流的方式（毕竟不认同，你也不会用嘛~），然，世间万物，皆有利弊。

以我为例，每次起一个项目，我都需要 :

- 脚手架 `create-react-app` 快速生成一个应用框架，进行开发
- 安装 `redux` 进行数据状态管理
- 安装 `react-redux` ，调用 Provider 提供者模式，使得自组件都能取到 store 值
- 如果想要解决异步请求，我也许还需要安装一个 `redux-saga`
- 如果想看到日志，那么我还会安装 `redux-logger`
- ...

看似一顿操作猛如虎，其实心中已经 MMP，我会想，这个 redux-saga 是个什么利器，还有 redux-thunk 又是个什么东西，这个 `Generator 函数的语法`，为什么这么奇怪，好好的用 `Promise` 不香吗？

还有用 `redux` + `redux-saga` 让我的 **[重复性]** 工作变多(逐步晋升 CV 工程师)，因为它存在啰嗦的样板代码。

举个 🌰 : 异步请求，获取用户信息，你需要创建 `sagas/user.js`、`reducers/user.js`、`actions/user.js`，如果你想统一管理 const，那么你还会有一个 `const/user.js`，然后在这些文件之间来回切换。

```js
// const/user.js
const FETCH_USER_INFO = 'FETCH_USER_INFO';
const FETCH_USER_INFO_SUCCESS = 'FETCH_USER_INFO_SUCCESS';
```

```js
// actions/user.js
export function fetchUserInfo(params, callback) {
  return {
    type: FETCH_USER_INFO,
    params,
    callback,
  };
}
```

```js
// sagas/user.js
function* fetchUserInfoSaga({ params, callback }) {
  const res = yield call(fetch.callAPI, {
    actionName: FETCH_USER_INFO,
    params,
  });
  if (res.code === 0) {
    yield put({
      type: FETCH_USER_INFO_SUCCESS,
      data: res.data,
    });
    callback && callback();
  } else {
    throw res.msg;
  }
}
```

```js
// reducers/user.js
function userReducer(state, action) {
  switch (action.type) {
    case FETCH_USER_INFO_SUCCESS:
      return Immutable.set(state, 'userInfo', action.data);
  }
}
```

没错，这种样板代码，简直就是 CV 操作，对我个人而言，这会让我不够专注，分散管理 const、action、saga、reducer 一套流程，需要不断的跳跃思路。

而且文件数量会变多，我是真的不喜欢如此`繁琐`的流程，有没有好的框架能帮我把这些事都做完呢？

### dva

世间万物存在，必然有它自身的价值和意义。dva 的出现，肯定是解决了一些问题。我们看看 [dva 官网](https://dvajs.com/guide/)怎么说的 ~~

**dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch，所以也可以理解为一个轻量级的应用框架。**

有意思，但是因为 dva 身负重任，对我而言，使用它太过于笨重，我只是想取其精华，去其内置，我就只想用它的数据流方案，我就觉得它的这种 model 里边，写完 reducer, state, action ，于是，有没有好的方案？

再一次与 JPL 同学交流的过程中，发现他也有这种想法，同时他已经写了一个简单的中间件，在他们组里用了起来，出于学习以及如何写一个中间件，我也开始尝试写一个 redux 的中间件，让开发更加简洁，释放键盘上的 C 与 V

于是 rc-redux-model 就这样出现了...

## What's rc-redux-model ?

`rc-redux-model` 是参考了 dva 的数据流方案，在一个 model 文件中写所有的 `action`、`reducer`、`state`，解读了 `redux-thunk` 的源码，内部实现了一个中间价，同时提供默认行为 action，调用此 action 可以直接修改任意值的 state，例如 :

只需要定义一个 model

```js
export default {
  namespace: 'reduxModel',
  state: {
    testA: '',
    testB: [],
    testC: {},
  },
};
```

那么 `rc-redux-model` 会自动帮你注册 action 及 reducers，等价于 :

```js
export default {
  namespace: 'reduxModel',
  state: {
    testA: '',
    testB: [],
    testC: {},
  },
  action: {
    changetestA: ({ commit, currentAction }) => {
      commit({
        type: 'REDUXMODEL_STORE_LIB_TESTA',
        payload: currentAction.payload,
      });
    },
    changetestB: ({ commit, currentAction }) => {
      commit({
        type: 'REDUXMODEL_STORE_LIB_TESTB',
        payload: currentAction.payload,
      });
    },
    changetestC: ({ commit, currentAction }) => {
      commit({
        type: 'REDUXMODEL_STORE_LIB_TESTC',
        payload: currentAction.payload,
      });
    },
    // 推荐使用此action进行修改reducers值
    setStoreLib: ({ dispatch, currentAction }) => {
      dispatch({
        type: `reduxModel/change${currentAction.payload.key}`,
        payload: currentAction.payload.values,
      });
    },
  },
  reducers: {
    ['REDUXMODEL_STORE_LIB_TESTA'](state, payload) {
      return {
        ...state,
        ...payload,
      };
    },
    ['REDUXMODEL_STORE_LIB_TESTB'](state, payload) {
      return {
        ...state,
        ...payload,
      };
    },
    ['REDUXMODEL_STORE_LIB_TESTC'](state, payload) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
```

那么你只需要在组件中发调用提供的默认 Action 即可

```js
class MyComponent extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'reduxModel/setStoreLib',
      payload: {
        key: 'testA',
        values: {
          testA: '666',
        },
      },
    });
  }
}
```

## How to use

- [完整例子](https://github.com/PDKSophia/rc-redux-model#%E4%BD%BF%E7%94%A8)

## FAQ

可在现有的项目中兼容使用，具体使用方式，可参考[完整例子](https://github.com/PDKSophia/rc-redux-model#%E4%BD%BF%E7%94%A8)

## 其他文章

- [rc-redux-model 从 0 到 1](https://github.com/SugarTurboS/rc-redux-model/issues/2)
- [【KT】轻松搞定 Redux 源码解读与编程艺术](https://juejin.im/post/6844904183426973703)
