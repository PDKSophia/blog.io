## React 和 Vue 的区别

博主面了几家公司，看简历上写着使用 Vue.js 框架，就会问，你能说一说 vue 和 react 的区别吗 ？react 听过，没用过，所以就只能尴尬的说不怎么了解 react。这不，最近刚学了 react (不断爬坑中)，同时看了些博客文章，当一回搬运工，如有错误，请指出 ～

### 简单的自我介绍一下

React 是由 Facebook 创建的 JavaScript UI 框架，它的诞生改变了 JavaScript 世界，最大的一个改变就是 React 推广了 Virtual DOM， 并且创造了新的语法 - JSX，JSX 允许在 JavaScript 中写 html 代码。

Vue 是由尤大大开发的一个 MVVM 框架，它采用的是模板系统而不是 JSX。

### 安利一波

#### Virtual DOM

一听可能有点懵逼 ？我们来看看别人怎么说的 ：Vue.js(2.0 版本)与 React 的其中最大一个相似之处，就是他们都使用了一种叫'Virtual DOM'的东西。所谓的 Virtual DOM 基本上说就是它名字的意思：**虚拟 DOM，DOM 树的虚拟表现**。

> Virtual DOM 是一个映射真实 DOM 的 JavaScript 对象，如果我们要改变任何元素的状态。那么是先在 Virtual DOM 上先进行改变，而不是直接地去修改真实的 DOM。

```html
// 比如在Vue中，我们将原来的节点改成这样 : // 原DOM
<div class="box">
  <p class="label">
    <span>{{ label }}</span>
  </p>
</div>

// 修改的DOM
<div class="box">
  <p class="label">
    <span>{{ label }}</span>
    <span>{{ username }}</span>
  </p>
</div>
```

> 我们往 p 节点中新增了一个 span 节点，于是我们一个新的 Virtual DOM 对象会被创建。然后新的 Virtual DOM 和旧的 Virtual DOM 比较，通过 diff 算法，算出差异，然后这些差异就会被应用在真实的 DOM 上

**Vue 很“ 嚣张 ”，它宣称可以更快地计算出 Virtual DOM 的差异**，这是由于它在渲染过程中，由于 vue 会跟踪每一个组件的依赖收集，通过 setter / getter 以及一些函数的劫持，能够精确地知道变化，并在编译过程标记了 static 静态节点，在接下来新的 Virtual DOM 并且和原来旧的 Virtual DOM 进行比较时候，跳过 static 静态节点。所以不需要重新渲染整个组件树。

> 📢 如果你想知道更多，你可以狠狠戳这里: [双十一，打包半价理解 Vue 的 nextTick 与 watcher 以及 Dep 的蓝色生死恋？](https://juejin.im/post/5be692936fb9a049e129b741)

React 默认是通过比较引用的方式进行，当某个组件的状态发生变化时，它会以该组件为根，重新渲染整个组件子树。如果想避免不必要的子组件重新渲染，你需要在所有可能的地方使用 PureComponent，或者手动实现 shouldComponentUpdate 方法。但是 Vue 中，你可以认定它是默认的优化。

<img src="https://user-gold-cdn.xitu.io/2018/8/1/164f4bd707704a5c?w=300&h=230&f=jpeg&s=9018" />

#### 构建工具

React 采用 Create-React-App， Vue 采用的是 Vue-Cli，这两个工具非常的好用啊，大兄弟，都能为你创建一个好环境，不过 Create-Reacr-App 会逼迫你使用 webpack 和 Babel，而 Vue-cli 可以按需创建不同的模板，使用起来更加灵活一点

#### 数据流

（这里借用一波言川老铁的图，下边会贴出链接）
<img src="https://user-gold-cdn.xitu.io/2018/7/26/164d4c84b44edbf2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

很直观的，我们可以看到，在 Vue2.x 中，只能 parent -> Child <-> DOM 的形式，而 React 只能单向传递，**React 一直提倡的是单向数据流**，数据主要从父组件传递到子组件（通过 props，或者 redux）。如果顶层（父级）的某个 props 改变了，React 会重渲染所有的子节点（如果你不想子组件进行渲染，那你需要 PureComponent/shouldComponentUpdate 进行处理）。

> 📢 你可以狠狠的戳这里，[看 React 的生命周期](https://juejin.im/post/5bcda0fde51d457a4b4f9392)

#### 模板渲染方式不同

前面说了，Vue 和 React 的模板有所区别，React 是通过 JSX 来渲染模板，而 Vue 是通过扩展的 HTML 来进行模板的渲染。React 通过原生 JS 实现模板中的常见语法，比如说条件啊、循环啊、三元运算符啊等，都是通过 JS 语法实现。而 Vue 是在和组件代码分离的单独模板中，通过指令 v-if、v-for 等实现。

个人认为 react 比较好点，比如我们要引用一个组件，react 直接 import 引入，然后可以直接在 render 中调用了，但是！！vue 需要 import 之后，还要在 components 里去声明，才能用，好气哦 ～

<img src="https://user-gold-cdn.xitu.io/2018/8/1/164f4bd70e298c11?w=240&h=209&f=gif&s=607018" />

#### Vuex 和 Redux

在 Vue 中，我们是通过 Vuex 进行状态管理，而在 React 中，我们是通过 Redux 进行状态管理。但是这两者在使用上还是有区别的。

在 vuex 中，我们可以通过在 main.js 中，引入 store 文件夹，并把 store 挂载到 new Vue 实例中，这样我们可以直接通过 `this.$store` 灵活使用。

- 你可以通过 dispatch 和 commit 进行更新数据，通过 this.\$store.state.xx 读取数据
- 或者你可以通过 mapState / mapActions 进行 vuex 的操作

下边是一个 Vuex 的例子:

```js
// 组件
import { mapState, mapActions } from 'vuex';
export default {
  computed: mapState({
    userinfo: state => state.user.userinfo // get userinfo from state
  }),
  methods: {
    ...mapActions(['setUserInfo'])
  },
  mounted() {
    this.$api.getUserInfo().then(res => {
      this.setUserInfo(res.data); // dispatch action
    });
  }
};

// vuex
import * as types from '../typeActions';

const state = {
  userInfo: {}
};
const actions = {
  setUserInfo({ commit }, data) {
    commit(types.SET_USER_INFO, { data });
  }
};
const mutations = {
  [types.SET_USER_INFO](state, payload) {
    state.userinfo = payload.data;
  }
};

export default {
  state,
  actions,
  mutations
};
```

而在 React 中，我们需要每一个组件都引入 connect，目的就是把 props 和 dispatch 连接起来。（这里可以自行封装一下，这样不需要每次都引入`connect(mapStateToProps, mapDispatchToProps)`）

另外！！！我们 vuex 可以直接 dispatch action 也可以 commit update，但是 redux 只能通过 dispatch，然后在 reducer 里，接收到 action，通过判断 action 的 type，从而进行对应的操作，redux 不能直接调用 reducer 进行修改！！

> Redux 使用的是不可变的数据，而 Vuex 的数据是可变的，Redux 每次修改更新数据，其实就是用新的数据替换旧的数据（每次返回的都是一个新的 state），而 Vuex 是直接修改原数据

> Redux 在检测数据变化的时候，是通过 diff 的方式比较差异的，而 Vuex 其实和 Vue 的原理一样，是通过 getter/setter 来比较的，因为在 vue 实例的时候，进行了依赖收集。

📢 你可以狠狠戳这里: [为什么 redux 要返回一个新的 state 引发的血案](https://juejin.im/post/5c1b6925e51d455ac91d6bac)

来看一下 Redux 的例子

```js
// 组件
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './action'; // 连入当前商城模块的action

class User extends React.PureComponet {
  componentDidMount() {
    this.props.getUserInfo();
  }
  render() {
    return <div>{this.props.userInfo.username}</div>;
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    ...bindActionCreators(actions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(User);
```

```js
// const.js
export const GET_USERINFO = 'GET_USERINFO';
export const SET_USERINFO = 'SET_USERINFO';

// action.js
export function getUserInfo(params, callback) {
  return {
    type: GET_USERINFO,
    params,
    callback
  };
}

// saga.js
function* getUserInfo({ params, callback }) {
  const res = yield call(); // 发起请求
  if (res.code === 0) {
    yield put({
      type: SET_USERINFO,
      data: res.data
    });
  }
  if (isFunction(callback)) callback(null, res);
}

// reducer.js
function userReducer(state = initReducer, action) {
  switch (action.type) {
    case SET_USERINFO:
      return Immutable.set(state, 'userinfo', action.data);
    default:
      return state;
  }
}
```

#### 不差上下？

现在时间是`2020.03.24`，毕业之前，都还是 `vue`、`react` 互换，不过那时候大部分都还是停留在 `vue` 上，直到毕业之后(19 届毕业生)，组里的项目都是用的 react，同时不断踩一些坑，但是随着不断使用，以及不断学习，我想说，react 真香，react hooks 更香 ~

开个玩笑，其实使用哪个都看个人以及项目大小吧，个人觉得如果是一个相对较小的项目，那你可以选择 vue，如果是一个复杂中大型一点的，可能还是选 react 比较好，当然，看你啦，问题不大。

<img src="https://user-gold-cdn.xitu.io/2018/8/1/164f4bd709207f63?w=250&h=272&f=gif&s=30038" width=250>

## 其他文章

- [前端渣渣对使用 react hooks 进行重构的新认识](https://juejin.im/post/5e6c4ce76fb9a07cbb6e5297)
- [前端渣渣对 requestAPI 的不断重构之路](https://juejin.im/post/5d91b2b46fb9a04e40478638)
- [由浅到深的 React 合成事件](https://juejin.im/post/5d43d7016fb9a06aff5e5301)
- [双十一返场-JS 构造器模式与工厂模式](https://juejin.im/post/5db98bd6f265da4d41764925)
- [来，用心感受自己的第一个 npm 包](https://juejin.im/post/5bcd9ebf6fb9a05d0f171688)
- [双十一，打包半价理解 Vue 的 nextTick 与 watcher 以及 Dep 的蓝色生死恋？](https://juejin.im/post/5be692936fb9a049e129b741)

## 相关链接

- [📢 个人博客](https://github.com/PDKSophia/blog.io)
- [Vue 官网 - 对比其他框架](https://cn.vuejs.org/v2/guide/comparison.html">https://cn.vuejs.org/v2/guide/comparison.html)
- [言川 - 关于 Vue 和 React 区别的一些笔](https://github.com/lihongxun945/myblog/issues/21">https://github.com/lihongxun945/myblog/issues/21)
- [众成翻译 - Vue vs React: Javascript 框架之战](https://www.zcfy.cc/article/vue-vs-react-battle-of-the-javascript-frameworks-3310.html?utm_medium=hao.caibaojian.com&utm_source=hao.caibaojian.com">https://www.zcfy.cc/article/vue-vs-react-battle-of-the-javascript-frameworks-3310.html?utm_medium=hao.caibaojian.com&utm_source=hao.caibaojian.com)
