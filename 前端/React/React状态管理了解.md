## 前言

> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io)

> 🍉 授权转载团队博客 : [SugarTurboS Blog](https://github.com/SugarTurboS/Blogs)

对大家很抱歉，这次拖到现在才更新，最近比较忙，不好意思哈，好了，废话不多说，继上篇文章 : [【KT】轻松搞定 Redux 源码解读与编程艺术](https://juejin.im/post/5dad64aef265da5b8d18dd26)发出之后，这篇主要是阿宽对 React 状态管理的见解～

<span style="color: #FA5523">以下内容是阿宽的个人认知，如有错误，还望指出～</span>

## 本文流水线

![](https://user-gold-cdn.xitu.io/2020/7/1/1730935b83785705?w=1785&h=639&f=png&s=100688)

## 看完这篇文章你能学到什么

- 科普 Redux 相关知识
- 什么是 Immutable，为什么要用它
- 科普所涉及的 `Event Sourcing`、`CQRS`、`Flux`相关知识
- Redux 这个磨人精在项目中的问题
- 为什么我们要用 redux-saga、redux-thunk 等
- 写惯了 hooks，能不能用 hooks 写状态管理，引入 hox
- 阿宽手把手带你看 hox 原理

## 正文开始

### React 单向数据流特性

> 这里经过 `itskaiway`、`ALLen、LAS`两位老哥的提醒，sorry，是我搞错了～～

> 确实如此，Vue 也是单向数据流，只是因为在 `new Vue()` 之后，调用 `_init` 函数进行初始化，通过 Object.defineProperty 设置 setter/getter 函数，实现了「响应式」和 「依赖收集」，从而达到数据双向绑定，确实不能说 Vue 是双向数据流～

> 虽然 Vue 有双向绑定 v-model，但是在父子组件中的数据传递，仍然是遵循单向数据流的，父组件给子组件传递 props，子组件不能直接改 props 传递过来的值，只能通过回调函数告知父组件进行数据更改～

想必很多人都知道，**React 是单向数据流**，那么在 React 中，想要进行数据的传递，该怎么做呢？下边这张图告诉你～

<img src="https://user-gold-cdn.xitu.io/2020/6/11/172a12549f9fb399?w=1746&h=190&f=png&s=29559" width=650 />

在 react 中，有 props 和 state，当我们想从父组件给子组件传递数据的时候，可通过 props 进行数据传递，如果我们想在组件内部自行管理状态，那可以选择使用 state。但是呢，我们忽略了 react 的自身感受～

**react 它是单向数据流的形式，它不存在数据向上回溯的技能**，你要么就是向下分发，要么就是自己内部管理。

小彭一听，“ 哎不对啊，不是可以通过回调进行修改父组件的 state 吗？” 是的，确实可以。我们来模拟一个场景，如果你想两个兄弟组件之间进行交流，互相八卦，交换数据，你咋整？

<img src="https://user-gold-cdn.xitu.io/2020/6/11/172a1244639f47cd?w=1156&h=816&f=png&s=62503" width=520 />

这个图应该都看得懂哈，也就是说，我们兄弟组件想互相交流，交换对方的数据，那么唯一的解决方案就是：**提升 state**，将原本 Peng、Kuan 组件的 state 提升到共有的父组件中管理，然后由父组件向下传递数据。子组件进行处理，然后回调函数回传修改 state，这样的 state 一定程度上是响应式的。

### 朴素的状态管理

上边所说的方式，就是 React 中最朴素的状态管理方式，但是这种方式会带来什么问题？

- 遇到需共享状态的组件，你得把需要共享组件的 state 集中放在所有组件的顶层（state 提升），然后分发下去
- 代码量多，且层层下发 props 使得嵌套过深，对于其他开发者来讲，修改维护成本较大。

如果说，我们项目足够简单，这种方案其实是没什么问题的，如果引入了额外的状态管理方案（redux、hox、mobx...），反而会加重每个组件的负担，造成多余的依赖。

我举个例子，以我们项目组当前的项目为例，存在以下特点 :

- 项目庞大
- 数据复杂
- 组件丰富
- 页面要从多个来源获取数据

这就导致于，我们无法避免各组件之间的状态共享；按照朴素的状态管理就有些捉襟见肘，相对鸡肋了。

为此，**需要一个库，来作为更加牛逼、专业的顶层 state 发给各组件，于是我们引入了 redux，让我们的状态更加可控，让一切都有据可循**。

### Redux 解惑

下边主要是对初次尝试使用 redux 的小伙伴，进行一个解惑，如果有理解错误的，望大家指出 🤝

> 其实吧，redux 也是一样的道理，也是将整个应用的 state 挂载在根组件上，然后一层一层传递下去～

redux 整个应用的 state 都存储在一颗 state tree 中，并且只存在于唯一一个 store 中～ 那么会有小伙伴好奇了，what ? 那我为什么会看到好多个 reducer ???

redux 提供了一个 `combineReducers API`，怎么说呢？小彭项目初次搭建的时候，要求小，状态管理比较方便，所以呢，都放在了一个 reducer 中，后边随着不断迭代，于是不断的往这个 reducer 中塞数据。

典型的屁股决定脑袋，于是有一天，可能某个天使，给 redux 的开发团队提了一个 issue， “哎呀，你能不能提供一个 API，把我的所有 reducer 都整合在一块啊，我想分模块化的管理状态”

> 比如用户模块，就叫 userReducer，商品模块，我们叫 shopReducer，订单模块，我们称之为 orderReducer。既然那么多个 reducer，该如何合并成一个呢 ？

于是 redux 提供了 combineReducers 这个 API，看来 redux 的时间管理学学的很好，你看，这么多个 reducer ，都能整合在一起，想必花了很大的功夫～ (如果你想知道 combineReducers 原理，[👉 看这里](https://juejin.im/post/5dad64aef265da5b8d18dd26)

又有小伙伴问了，我们用了 redux，那么它是如何跟我的组件勾搭上的？这时候你就需要知道`connect`了，这是 react-redux 提供的一个 API，想知道原理的，可以自行去查询一下原理哈～

你还会看到这么一段代码

```
function App() {
  return (
    <Provider store={store}>
      ...
    </Provider>
  );
}
```

你忍不住问到，这个 Provider 是个啥？其实这是 React 中的“提供者模式”。我前边说过了啊，在 React 中，props 是组件之间通讯的主要手段，那么如果你隔着好几层其他组件，进行通信，这种是很不合理的。

所以呢， React 官方推荐了一种 Provider 模式。这个模式有两个狠角色，一个叫“提供者”，另一个叫“消费者”，这两个角色都是 React 组件。其中“提供者”在组件树上居于比较靠上的位置，“消费者”处于靠下的位置。

**“提供者”可以提供一些信息，而且这些信息在它之下的所有组件，无论隔了多少层，都可以直接访问到，而不需要通过 props 层层传递**。

> 避免 props 逐级传递，即是提供者的用途。Provider 其实就是实现了 Context 功能，就是能够创造一个“上下文”，在这个上下文笼罩之下的所有组件都可以访问同样的数据。

所以你能理解我们的 `根App` 为什么要加 `Provider` 了吧，不加的话，你即使在根 App 上挂载了 store， 你仍然还是要一层一层的传递 `this.props`，否则最里层的拿不到 redux 中的值。

你甚至还可能会看到，redux 中使用了 `Immutable` ，**小朋友，你是否有很多问号 ? 为什么，别人在那写代码，我却在学卧槽，对着代码说 giao ， 阿宽告诉你要做个乖宝宝**

```js
// reducer.js
let initUser = Immutable({
  userId: '',
  userName: '',
});
```

让我们想一想，为什么要用 Immutable，它是个啥玩意？上篇文章说了，在函数式编程语言中，数据是不可变的，所有的数据一旦产生，就不能改变其中的值，如果要改变，那就只能生成一个新的数据。

所以初步情况下，我们会看到 `reducer` 的代码是这么写的 :

```js
  case 'CHANGE_USER_INFO':
    return {
      ...state,
      userId: action.data.userId,
      userName: action.data.userName
    }
```

那么你就会问了，为什么数据不可变，为什么需要返回一个新的数据啊？这么做会有什么问题啊？

问题可大了，react 中有个 生命周期，叫做 shouldComponentUpdate ，它会帮你拦截组件渲染，怎么理解？我们知道，react 在上一轮(prevProps/prevState) 和下一轮(nextProps/nextState) 的对比中，是进行浅比较（为啥不深比较？你猜）

那么对于一个对象来说，它对比的是这个对象的引用地址，所以你修改了此对象的值，实际上只是 value 改变，但该对象的引用地址未发生变化（懂得自然懂.jpg）既然未改变，那么就不会 re-render 咯 ～～

所以我们需要返回的是一个新对象，而不是原对象，到这里你知道为什么 redux 总要返回一个新的 state 了吧?

又有人问了，为什么不直接 `Object.assign` 呢？我也很好奇过，直接拷贝一份，然后返回不就好了嘛，为什么要用 `Immutable` 库呢？在我查阅资料之后，嗯，可以，说服了我，感兴趣的可以去看看这篇文章 : [精读 Immutable 结构共享](https://zhuanlan.zhihu.com/p/27133830?group_id=851585269567213568)，看完你就明白了。

### Redux Motivation

[Redux 官网](https://redux.js.org/introduction/motivation)中，有这么一句话 : Following in the steps of Flux, CQRS, and Event Sourcing, Redux attempts to make state mutations predictable by imposing certain restrictions on how and when updates can happen. 出于好奇，我去把这东西大概了解了一下，如果有误，望大佬们指出 🤝

#### 什么是 Event Sourcing ?

- 不保存对象的最新状态，而是保存对象产生的事件
- 通过事件，追溯得到对象的最终状态

举个 🌰，你们平时有记账习惯吗？我有，我会在备忘录中记录每个月的开销

<img src="https://user-gold-cdn.xitu.io/2020/7/18/1735fc3084de9a1f?w=828&h=668&f=jpeg&s=116411" width=300 />

一般来说，我们记账都有两种方式，一种是 : 直接记录每次账单的结果。另一种是，记录支出/收入。我们可以自己计算得到结果，Event Sourcing 就是这种。

![](https://user-gold-cdn.xitu.io/2020/7/18/1736018cf5f9ccbb?w=1830&h=866&f=png&s=167351)

在这个图中，左边是我们的账号对象，他有几个事件处理函数，这里展示 2 个，一个是 AddAccount（记录收入），一个是 SubAccount （记录支出）

左边是一个个的事件，它是一个事件流，记录我们的一些支出/收入的事件。当这些事件产生的时候，就会出发 Account 对象里相应的处理函数。

右边是处理完之后，账户里边金钱最新的状态数据。

**上边这些事件需要持久存储于数据库或者其他地方，而 account 数据不需要，我们只需要在每次获取 account 当前的数据状态时，通过调用 account 的相关事件，重新计算生成。**

Event Sourcing 和 传统的 CURD 区别在于：

- CURD 以结果为导向的数据存储，Event Sourcing 以过程为导向的数据存储
- CURD 直接对数据库进行操作，Event Sourcing 是在库里存储了一系列事件的集合，没有更新，没有删除

<img src="https://user-gold-cdn.xitu.io/2020/7/18/173600b3c7ed0169?w=1330&h=732&f=png&s=87920" width=500 />

所以我认为，在 Redux 中，体现 Event Sourcing 思想是：Redux 中的每一个 state 都是独立的、连续的但无关联的，我们可以通过每一个 state，推导出完整的 state。

#### 什么是 CQRS ?

CQRS(Command Query Responsibility Segregation) ，顾名思义，“ 命令查询职责分离 ”，也就是 “读写分离” ，一个方法要么作为一个“命令”去执行一个操作，要么作为一次“查询”向调用方返回数据，但两者不能共存。

我们不禁想问 : 为什么要做这样的分离？原因如下 :

1. 数据的读和数据的写，次数是不平衡的，把读、写分离，能有针对性的优化它们怎么理解呢？你们买过机票、火车票，预定过酒店吧 ? 你会第一眼看中就下单吗？或者这么说，你读文章的次数比你写文章的次数多吧？不会吧？不会到现在还有人没看过阿宽的文章吧？不会吧不会吧～

2. 古人云 : “距离产生美～”，一般读操作，都是比较简单的，写操作就比较复杂麻烦了。所以分离对我们来讲，能更好维护

CQRS 里边的一些概念:

- Command(命令): 不返回任何结果，被校验成功后会改变对象的状态
- Query(查询): 有返回结果，但不会改变对象的状态
- Aggregate(聚合): 保存状态，处理 Command 和改变状态
- Event Store: 存储 Events

实际上，Event Sourcing 和 CQRS 有着一定的联系，在 CQRS 使用了 Event Sourcing 模式以后，会产生额外的好处。

<img src="https://user-gold-cdn.xitu.io/2020/7/18/1735ff75644a3d5a?w=1728&h=960&f=png&s=414280" width=600 />

对于 Command 端，它会通过 Event Sourcing 更新聚合对象的流程，这是会有一个 Event Handler 的处理类监听相应事件，更新物化视图（在某个事件发生时，将聚合对象的最新数据状态存入到一个表中，这个表就叫做物化视图）

对于 Query 端，只是对数据库的读操作。但注意 : 用户进行查询得到的数据可能不是最新的。会有几个毫秒的延迟。

所以要是使用了 CQRS 架构的一个前提 : 你的系统能够接受系统使用者，查询到的数据可能不是新的。因为一个多用户同时访问，在高并发修改数据的情况下，比如秒杀、12306 购票，用户 UI 上看到的数据总是旧的。

### 什么是 Flux ？

Flux 是 Facebook 用于构建 Web 应用程序的基本架构，它主要角色为 :

- Dispatcher 调度器，接受 Action，发给 Store。将所有分散在各个组件里边的逻辑代码收集，然后统一进行处理。
- Action 动作消息，{ type , payload }
- Store 数据中心，响应 Action 消息
- View 应用视图，展示 Store 数据，实时响应 Store 的更新

![](https://user-gold-cdn.xitu.io/2020/7/18/1736000ef53b64f7?w=1390&h=106&f=png&s=17478)

Flux 是一个单向架构，数据总是“单向流动”，任何相邻的部分都不会发生数据的“双向流动”，这保证了流程的清晰。Flux 的最大特点，就是数据的“单向流动”。它的一个流程为 :

1. 用户访问 view
2. view 发出用的 Action
3. dispatcher 调度器 收到 Action，要求 store 进行更新
4. store 更新，发出一个 `change` 事件
5. view 收到 `change` 事件，进行页面更新

### Flux 与 Redux 区别

![](https://user-gold-cdn.xitu.io/2020/7/21/17370729b9fc62e8?w=3568&h=1626&f=png&s=403751)

![](https://user-gold-cdn.xitu.io/2020/7/18/1736001fa5da641a?w=1386&h=768&f=png&s=88987)

在 Flux 中，靠近 react component 上层有一个特殊的视图层，专业术语: 视图控制层(Controller-view)，它主要目的是：接受 change 事件，从 Store 中拿到最新数据，调用自身 setState 进行更新，使得 render 及后代的 re-render 触发。

而在 Redux 中，我们是将全局唯一的 Store 挂载在跟 App 上，同时通过 react-redux，使用**提供者模式（Provider Pattern）**，调用了 React 的 Context 功能，创造一个“上下文”，在这个上下文笼罩之下，所有组件都可以访问相同的数据，从而避免 props 逐级传递。

flux 与 redux 区别:

- Flux 允许存在多个 store，Redux 只存在一个，相对于 Flux，一个 store 更加容易管理，较为清晰。
- Flux 中多 store 存储状态，并且在 store 里执行更新逻辑，当 store 变化时，通知 Controller-view 更新自己的数据；Redux 是将各个 store 整合成一个完整的 store，遵循 Event Sourcing 规则，通过这个 store 计算推导得出完整的 state
- Redux 的更新逻辑在 reducer 中，而不是在 store 中。单一 store 的好处是，所有数据结果集中化管理。只需要传给外层组件，那么内层不需要维护 state，全部经过父级由 props 向下传即可。
- Redux 不存在 dispatcher，它依赖于纯函数 reducer 来代替事件处理器，reducer = (preState, action) => newState ，根据当前旧的 state 与 action，去计算并返回一个 newState 对象。

当然，**最大的区别应该为 store / reducer 的抽象， Flux 中 store 各自为战**，每个 store 只对对应的 controller-view 负责，每次更新都只通知对应的 controller-view，而 redux 中的各子 reducer，是由根 rootReducer 统一管理，当我们发起一个 action 去修改某一个子 reducer，都会通过根 rooterReducer 的整合。

![](https://user-gold-cdn.xitu.io/2020/7/18/1736002d6fb53438?w=2340&h=1452&f=png&s=356201)

![](https://user-gold-cdn.xitu.io/2020/7/18/173600312b61a001?w=1093&h=664&f=png&s=58402)

### Redux 原理及源码解读

可以看我写的这篇文章 : [【KT】轻松搞定 Redux 源码解读与编程艺术](https://juejin.im/post/5dad64aef265da5b8d18dd26)

## Redux 在项目中的问题

1. 低下的异步处理能力，不内置 side effect manager 副作用管理器，导致社区出现大量的中间件，如 redux-thunk、redux-saga... 项目复杂度上升。

**redux 默认只支持同步操作，让使用者自行选择异步处理方法，对于异步请求 redux 是无能为力的**。可以这么说，它保证自己是纯粹的，脏活累活都丢给别人去干。

比如我们想要处理异步，所以我们在项目中引入了 redux-saga ，再比如我们想要知道日志中间件，我们引入了 redux-logger 等

2. 啰嗦的样板代码，让 state 的更新变得繁琐

举个 🌰 : 我们需要用获取户信息，就需要一整套样板代码

```js
// const.js
const FETCH_USER_INFO = 'FETCH_USER_INFO';
const FETCH_USER_INFO_SUCCESS = 'FETCH_USER_INFO_SUCCESS';

// action.js
export function fetchUserInfo(params, callback) {
  return {
    type: FETCH_USER_INFO,
    params,
    callback,
  };
}

// saga.js
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

// reducer.js
function userReducer(state, action) {
  switch (action.type) {
    case FETCH_USER_INFO_SUCCESS:
      return Immutable.set(state, 'userInfo', action.data);
  }
}
```

没错，这种样板代码，简直就是 CV 操作，对我个人而言，我觉得这会让我不够专注，分散管理 const、action、saga、reducer 一套流程，需要不断的跳跃思路。

## react hooks 不香吗

![](https://user-gold-cdn.xitu.io/2020/7/18/173606f49f0a3a5c?w=1796&h=782&f=png&s=75235)

基于上述过于流水线式的异步请求，那么我们是否可以进行优化呢？于是迪哥(我导师)进行了简单的封装～

主要封装了四个 hooks API

- useSendAction
- useSendAsync
- useSendAsyncLast
- useSendAsyncOnce

以 `useSendAsync` 为例子，我们并不需要关心 useSendAsync 到底做了什么东西（本质上就是返回的一个 Promise）

通过此 hooks，我们的代码现在变成了这个样子

![](https://user-gold-cdn.xitu.io/2020/7/18/1736072d7aec1a76?w=1276&h=616&f=png&s=112974)

你会发现，我们只是优化了 `action -> saga` 这个步骤逻辑，但是数据存储到 redux ，仍然还是要 dispatch action

既然已经 hooks 黑化了，为何不一条路走到底？有没有 hooks 写法，就能做到状态管理？于是在与小伙伴交流中，听到了一个新词 : hox

## hox 原理

官方对 [Hox](https://github.com/umijs/hox) 的介绍是这样的：下一代的 React 状态管理器，只存在一个 API，那就是 createModel。它的特性是

- 支持全部的 React Hooks，写 store 就像写 custom Hook
- 告别单一状态树，可定义多个 store，随用随取
- 支持在类组件中使用，只需要通过 withModel

你信吗？一个 API，就能做到状态管理？giao，我去 see see，诶， 真香

> 真香定律，又称境泽现象。 现在主要用来调侃某人喊口号抵制某事物后又自打脸表示对其喜爱的行为。

<img src="https://user-gold-cdn.xitu.io/2020/7/18/173607a86c222a2c?w=846&h=764&f=png&s=1259167" width=200 />

在组内部提出了 hox 之后，进行了一波调研，以及落地实践，踩踩坑，看看是否可在项目中使用～

<img src="https://user-gold-cdn.xitu.io/2020/7/18/173607ca1a53f916?w=892&h=200&f=png&s=73164" width=350 />

有点小尴尬的是，6.15 提出的观点，在之后对 redux、flux、hox 等进行分析，同时阅读 hox 内部源码，一直到 7.1 才进行第二轮评审，当然，最后还是给出了方案进行落地实践

<img src="https://user-gold-cdn.xitu.io/2020/7/18/173607dd17a45f3f?w=878&h=178&f=png&s=62238" width=380 />

其实呢，hox 就是一个 hooks，怎么理解，就跟你平常写 hooks 一样，如果你想将状态保存起来，其他组件共享，就用 `createModel` 包裹一下就好了～ 举个 🌰

```js
/**
 * @desc base model
 */
import { useState } from 'react'
import { createModel } from 'hox'

// 章节model
function useSelectSubject() {
  const [subjectCode, changeSubjectCode] = useState(undefined)
  const [subjectName, changeSubjectName] = useState(undefined)
  const setSubjectCode = (subjectCode: string) => changeSubjectCode(subjectCode)
  const setSubjectName = (subjectName: string) => changeSubjectName(subjectName)

  return {
    subjectCode,
    subjectName,
    setSubjectCode,
    setSubjectName,
  }
}

// 未使用 createModel ，它就是一个自定义的hooks
export default useSelectSubject

// 使用 createModel 包裹，它就变成持久化，且能全局共享数据
export default createModel(useSelectSubject)
```

如何使用，可以看官方文档，我们接下来探讨一下，hox 的内部实现原理，感兴趣的可以去看看源码，源码很少，可以阅读一些优秀代码～～ 向大佬们看齐

### 内部原理

内部原理很简单：

1. 实例化一个 Container 容器，通过观察者模式实现对状态改变的推送
2. 创建一个 Executor 组件实例，将这个组件挂载到空 div 上，该组件的任务是
   - 接收一个更新 state 的函数，取名 onUpdate，当数据改变时，通知订阅者进行更新
   - 返回一个 null，利用 hooks 特性，每次传入的数据发生改变，都会触发内部逻辑，从而更新
3. 内部定义一个 `share hooks（useModel）`，这个 share hooks 本质就是内部维护一个 state，且此 state 作为 container.data 的初始化，多次经过 createModel 包裹的 custom hooks 之所以能实现数据共享，就是因为共享的是同一个 state

![](https://user-gold-cdn.xitu.io/2020/7/18/17360888d5eb57ba?w=1504&h=802&f=png&s=182227)

怎么理解呢？给你们画个图～

在我们未使用 `createModel` API 的时候，我们组件 A、B 调用自定义的 `useSelectSubject`，会生成两份内存空间

<img src="https://user-gold-cdn.xitu.io/2020/7/18/17360907f76289cc?w=1374&h=796&f=png&s=83533" width=500 />

但是如果使用了 `createModel` 包裹之后，**它就变成持久化，且能全局共享数据**，原因在于它只生成一份内存空间，A 与 B 其实都是取的同一个内存空间里的数据，这样就达到了数据共享的效果。

<img src="https://user-gold-cdn.xitu.io/2020/7/18/1736094e559a42e0?w=1234&h=1086&f=png&s=103209" width=500 />

> 不得不说，我画的图是真的丑啊，我丢....

### 源码解读

![](https://user-gold-cdn.xitu.io/2020/7/18/1736097fb32ae78d?w=1332&h=1920&f=png&s=639892)

什么，你的不是 hooks，能不能用？问题不大，hox 也支持在类组件上使用，只需要 withModel 即可，内部是通过 HOC 实现。感兴趣的可以去 github 看源码

### hox 是不是真的很香 ?

> 当你对某个东西青睐的时候，即使 10 个理由中，9 个否决因素，你仍然会因为 1 个肯定因素而去喜欢它。如果你讨厌一个东西，即使它有 99 个肯定因素，你也会因为 npm install xxx 太累，而去讨厌它。

前边是我简单用了一下 API 写的小 demo，感觉真的香，但在评审之后，真的抽了一个模块去落地实践了一下， 才发现，突然不怎么香了，下篇文章会记录一下 hox 的感受～～

## 总结

最近一直在看 React 状态管理相关的知识，前边吹了个逼，说会围绕着 `hox`、`mobx`、`redux` 进行一波交流，but，实际上就 hox 和 redux 进行对比，直播打脸了......

hox 还是比较小众，目前 github 上的 star 才 518 个，所以感兴趣的小伙伴可以去了解了解，还是先积累一些经验，然后再决定是否在项目中使用吧~

最近有点忙，所以更新文章比较慢，最主要的一点是 : 我还没实践完，总得踩踩坑，吃点亏，才能给你们写出点东西啊，对吧～

## 相关链接

- [hox](https://github.com/umijs/hox)
- [阿宽的博客](https://github.com/PDKSophia/blog.io)
- [团队博客](https://github.com/SugarTurboS/Blogs)
- [精读 Immutable 结构共享](https://zhuanlan.zhihu.com/p/27133830?group_id=851585269567213568)
