---
# 主题使用方法：https://github.com/xitu/juejin-markdown-themes
theme: juejin
highlight: github
---

## 前言

> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io)

前几篇文章的核心点都是围绕着 React 状态管理，比如 :

- [【KT】轻松搞定 Redux 源码解读与编程艺术](https://juejin.im/post/6844904183426973703)
- [【KT】查缺补漏 React 状态管理探索](https://juejin.im/post/6854573215440699399)
- [【KT】你还在 redux 中写重复啰嗦的样板代码吗](https://juejin.im/post/6874751458508537864)

其中有一个遗留的点，那就是对于 hox 的简易版 devtools 开发，在[【KT】针对 Hox，我写了个简陋组件版 dev-tools](https://juejin.im/post/6854573204569227271)文章中，主要介绍 hox 和落地 hox 实践遇到的一些小问题，其中最大的一个问题就是 `无 dev tools 支持`，当时写了一个展示型组件，写了部分实现逻辑，之后就去做其他事了。一直耽搁到现在...

今天主要是聊聊实践 `sugar-hox-devtools` 过程中

## 背景

之所以做 `sugar-hox-devtools` 原因是 : 在项目中，组员习惯性的都写函数式组件，包括我在内，甚至于我大部分都写的 hook，那么我就在想，有没有 hooks 写法，就能做到状态管理？于是接触到了 hox，[如果你还不了解 hox，你可以看看官方说明](https://github.com/umijs/hox)

在实际落地后，我发现，其他问题都可以避免/解决，但是很蛋疼的莫过于 : `无 dev tools 支持`，你想想，我们使用了 createModel 包裹之后，如何知道这个数据是否真的被持久化、全局共享呢 ？

常规操作就是，在组件中 import 这个数据源，然后 console.log 打印看看，还有一种情况，那就是项目有其他小伙伴接手了，然后他想查看下目前全局共享的状态有哪些，怎么办？

官方 issues 也有人问到了此问题，同时我们项目中，有些小型项目或者独立模块，都有用到了 hox，于是，我决定先写一个简易版的 devtools，凑合着用，所以 `sugar-hox-devtools` 出现了...

## 最终效果

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5458a021344483ba88480a2aee024eb~tplv-k3u1fbpfcp-watermark.image" width=550 />

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f61382160c045caa246d942f14361e8~tplv-k3u1fbpfcp-watermark.image" width=750 />

## 相关说明

- sugar-hox-dev-tools 是一个带有 hox 原 API 及导出一个展示组件的 npm 包，用于展示被 createModel 包裹的数据。[更多功能计划中]

- 修改了 hox 一小部分源码，如果依赖 hox 包，那么得在打包的时候，webpack 注入我自己修改的部分代码，相对麻烦，成本也高。于是邮箱问过 [umi/hox](https://github.com/umijs/hox) 的开发者之一 [brickspert](https://github.com/brickspert)，经过同意且此仓库为 MIT 协议，所以 fork 了此仓库并拉取源码进行修改，相关 API 仍保持与 hox 一致

- 之所以做这个 devtools，原因在于我们使用了 createModel 包裹之后，不知道这个数据是否真的被持久化、全局共享，只能通过在组件中 import 这个数据源，然后 console.log 打印，然后看是否真的被修改。

- 还有就是当其他人接手项目之后，他想查看一些已经存在于全局共享的 Model，并没有一个展示全局共享数据的渠道，所以 `sugar-hox-dev-tools` 出生了。

> 由于我们项目中，有些小型项目或者独立模块，都有用到了 hox，于是，我决定先写一个简易版的 devtools，凑合着用，于是 `sugar-hox-devtools` 出现了

## 快速开始

### 安装

```bash
npm install sugar-hox-devtools --save
```

### 创建一个 model

> 这里的说明拷至 hox 文档，[更多详情点击这里访问](https://github.com/umijs/hox/blob/master/README-cn.md#%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA-model)

```js
import { useState } from 'react'
import hoxAPI from 'sugar-hox-devtools'

function useCounter() {
  const [count, setCount] = useState(0)
  const decrement = () => setCount(count - 1)
  const increment = () => setCount(count + 1)
  return {
    count,
    decrement,
    increment,
  }
}

useCounter.namespace = 'useCounter' // 这里需要给每一个 model 都添加命名空间标识

export default hoxAPI.createModel(useCounter)
```

### 使用 model

> 这里的说明拷至 hox 文档，[更多详情点击这里访问](https://github.com/umijs/hox/blob/master/README-cn.md#%E4%BD%BF%E7%94%A8-model)

```js
// 在组件中调用这个 Hook ，就可以获取到 model 的数据了。
import counterModel from '../models/counter'

function App(props) {
  const { counter, increment, decrement } = counterModel()
  return (
    <div>
      <p>{counter}</p>
      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
    </div>
  )
}
```

### 开启 DevTools

`sugar-hox-devtools` 抛出一个组件，调用此组件即可；所有经过`createModel`包裹后的 model，都会被注入添加到 `window.sugarHox` 上。控制台打印 window.sugarHox 就能拿到数据。

```js
import React, { useState } from 'react'
import sugar from 'sugar-hox-devtools'

const SugarHoxDevTools = sugar.SugarHoxDevTools

function App() {
  const [showDevTools, setShowDevTools] = useState(true)

  return (
    <div>
      ...
      {showDevTools && (
        <SugarHoxDevTools onClose={() => setShowDevTools(false)} />
      )}
    </div>
  )
}
```

## 组件参数

| 参数            | 说明                | 类型       | 默认值             |
| --------------- | ------------------- | ---------- | ------------------ |
| title           | 自定义              | string     | sugar-hox-devtools |
| closeIcon       | 关闭 icon           | ReactNode  | X                  |
| onClose         | 点击 closeIcon 方法 | () => void | -                  |
| maxScrollHeight | 容器滚动的最大高度  | number     | 200                |

## 主要思路

我们要知道一点，那就是 hox 提供的 API ，是通过 custom Hooks 来定义 model 的

在我们不使用 hox 的 API 时，我们写的 hook 就是一个普通 hook，如果通过 hox 的 `createModel` 包裹之后，这个 hook 就变成了持久化，且全局共享的数据。

清楚这个特点很关键！搞清楚这点之后，开发这个 devtools 就变得简单了～

大致思路 :

- 将所有被 createModel 包裹后的 hook，都挂载到 window 下 [这就得修改 hox 的源码了]
- 目前暂定只做 model 数据的展示，自然而然的，得把 custom hook 中的函数类型剔除掉
- 解决掉数据响应问题，得到 model 的最新值，用于组件中展示
- 递归遍历，数据处理

## 步骤

### 实现每个 hook 唯一

我们给 createModel 传递的是一个 hook，那么我们给每一个 hook 注入一个命名空间，确保其唯一性，同时也是为了挂载到 window 上时，每一个 key 对应的 model 数据

```js
// 自定义的hook
function useSugarModel() {}
useSugarModel.namespace = 'useSugarModel'

export default createModel(useSugarModel)
```

然后修改 hox 中 createModel 源码，原来只需要给 Executor 传递 2 个字段，现在给它支持 namespace，[代码可看这里](https://github.com/SugarTurboS/sugar-hox-devtools/blob/master/src/hox/create-model.tsx#L16)

```js
export function createModel<T, P>(hook: ModelHook<T, P>, hookArg?: P) {
  const container = new Container(hook);
  render(
    <Executor
      onUpdate={val => {
        container.data = val;
        container.notify();
      }}
      hook={() => hook(hookArg)}
      namespace={(hook as any).namespace} // 新增支持 namespace 标识
    />
  );
}
```

### 过滤函数方法，挂载到 window 上

我们前期暂时只需要数据，并不需要知道有什么方法，所以可以现将 hook 中的方法过滤，然后将 hook 挂载到 window 下，[代码可看这里](https://github.com/SugarTurboS/sugar-hox-devtools/blob/master/src/hox/executor.tsx#L13)

```js
export function Executor<T>(props: {
  hook: () => ReturnType<ModelHook<T>>
  onUpdate: (data: T) => void
  namespace: string
}) {
  const data = props.hook()
  props.onUpdate(data)
  // 下面为修改的代码，挂载到 window.sugarHox 下
  if (!(window as any).sugarHox) {
    window.sugarHox = {}
  }
  let maps = {}
  const keys = Object.keys(data)

  for (let key of keys) {
    if (typeof data[key] !== 'function') {
      maps[key] = data[key]
    }
  }

  window.sugarHox = {
    ...window.sugarHox,
    [props.namespace]: { ...maps },
  }

  return null as ReactElement
}
```

### 数据响应，监听 window.sugarHox 的改变

我们可以通过 `window.sugarHox` 去得到所有通过 createModel 挂载到全局的共享状态数据，但还有个问题，那就是我们修改 model 值之后，我们要实时响应，于是通过 Object.defineProperty 进行重写 set 、get 方法，[代码看这里](https://github.com/SugarTurboS/sugar-hox-devtools/blob/master/src/components/Main/index.js#L6)

```js
// sugarDevTools 组件
componentDidMount() {
  window.tempHox = {};
  const _this = this;
  Object.defineProperty(window, 'sugarHox', {
    set: function(value) {
      window.tempHox = value;
      _this.setState({
        model: value
      });
    },
    get: function() {
      return window.tempHox;
    }
  });
}

```

由于使用 Object.defineProperty 会存在一些问题，于是改用 Proxy 进行代理，感兴趣的可以去看看这两者的区别

### 递归遍历数据

核心点就是将 window.sugarHox 对象，构造成 antd tree 所支持的数据格式，[代码在这里](https://github.com/SugarTurboS/sugar-hox-devtools/blob/master/src/components/DevTools/index.js#L93)

## 最后

读到这你已经把这个简易版的 sugar-hox-devtools 基本思想掌握了，后期正在规划该 devtools 的更多功能，借鉴 [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) 的一些功能，核心不是造轮子，而是通过造轮子去思考一些问题，去学到一些东西。加油，打工人～

## 相关链接

- STSC 组织: https://github.com/SugarTurboS
- 团队博客: https://github.com/SugarTurboS/Blogs
- 开源社区: https://github.com/SugarTurboS/Sugar-Community
