## 关于 Vue 和 React 中 key 的作用

### 什么是 key？

`React` 中的 key 属性，它是一个特殊的属性, 其实不只是`React`，`Vue`中在执行列表渲染时也会要求给每个组件添加上 key 这个属性。

怎么解释这个 `key` 这个玩意呢？这就要扯到 [虚拟 DOM 的 Diff 算法]()了，通过一套虚拟 DOM，使得我们不直接操作 DOM，而只需要操作数据就能够重新渲染页面。而隐藏在背后的原理便是其高效的[Diff 算法]()。

vue 和 react 的虚拟 DOM 的 Diff 算法大致相同，其核心是基于两个简单的假设：

- 两个相同的组件产生类似的 DOM 结构，不同的组件产生不同的 DOM 结构。

- 同一层级的一组节点，他们可以通过唯一的 id 进行区分。

当页面的数据发生变化时，Diff 算法只会比较同一层级的节点：

- 如果节点类型不同，直接干掉前面的节点，再创建并插入新的节点，不会再比较这个节点以后的子节点了。

- 如果节点类型相同，则会重新设置该节点的属性，从而实现节点的更新。

看到这里，你应该知道了吧，没错，这个唯一区分的 id 其实就是本文的重点 —— `key`

### key 的作用

以 React 举例，react 的作者之一 Paul O’Shannessy 有提到：

```javascript
Key is not really about performance, it’s more about identity (which in turn leads to better performance). Randomly assigned and changing values do not form an identity
```

简单来说，**react 利用 key 来识别组件，它是一种身份标识标识**，每个 key 对应一个组件，相同的 key react 认为是同一个组件，这样后续相同的 key 对应组件都不会被创建。

```javascript
  import React from 'react'
  import ReactDOM from 'react-dom'

  class Test extends React.Components {
    state = {
       users: [
        {
          id: 1,
          name: '董事长'
        },
        {
          id:2,
          name: '总经理'
        },
        {
          id: 2,
          name: "技术总监"
        }
      ]
    },

    render()
      return(
        <div>
          <h3>员工列表</h3>
            {this.state.users.map(item => <div key={item.id}>{item.id}:{item.name}</div>)}
        </div>
      )
    )
  }
```

上面代码在 dom 渲染挂载后，用户列表只有董事长和总经理两个用户，技术总监并没有展示处理，主要是因为 react 根据 key 认为总经理和技术总监是同一个组件，导致第一个被渲染，后续的会被丢弃掉。

这样，有了 key 属性后，就可以与组件建立了一种对应关系，react 根据 key 来决定是销毁重新创建组件还是更新组件。

- key 相同，若组件属性有所变化，则 react 只更新组件对应的属性；没有变化则不更新。

- key 值不同，则 react 先销毁该组件(有状态组件的 componentWillUnmount 会执行)，然后重新创建该组件（有状态组件的 constructor 和 componentWillUnmount 都会执行）

> 注意 : key 不是用来提升 react 的性能的，不过用好 key 对性能是有帮组的。

用过 react 的开发者都知道，使用 React 的过程中，当组件的子元素是一系列类型相同元素时，就必须添加一个属性 key,否则 React 将给出一个 Warning,比如这样

```javascript
Warning: Each child in an array or iterator should have a unique "key" prop. Check the render method of `ServiceInfo`. See https://fb.me/react-warning-keys for more information.
```

哎呀，反正才 Warning 嘛，又不是 Error，加不加都无所谓啦，那么问题来啦，key 是不是必须的？其实是强制要求的，只不过 react 为按要求来默认上帮我们做了，它是以数组的 index 作为 key 的。

### 启发性算法

当组件的 props 和 state 发送改变时，React 都会调用 render 去重新渲染 UI，实质上 render 函数作用就是返回最新的元素树。目前存在大量的方法可以将一棵树转化成另一棵树，但它们的时间复杂度基本都是 O(n3),这么庞大的时间数量级我们是不能接受的，试想如果我们的组件返回的元素树中含有 100 个元素，那么一次一致性比较就要达到 1000000 的数量级，这显然是低效的，不可接受的。这时 React 就采用了启发式的算法。

React 启发式算法就是采用一系列前提和假设，使得比较前后元素树的时间复杂度由 O(n3)降低为 O(n)，React 启发式算法的前提条件主要包括两点:

- 不同的两个元素会产生不同的树

- 可以使用 key 属性来表明不同的渲染中哪些元素是相同的

### 反模式

很多时候，我们可能并没有在遍历数组渲染组件的时候写上 key 的习惯，因为除了控制台报到一个 Warning，并不会有任何影响。因为赋 key 值这一步 react 帮我们做了，默认使用的是遍历过程中的 index 值。

```javascript
let arr = ['red', 'yellow'];

// 下边的 list1 和 list2 是等价的

const list1 = arr.map(item => {
  return <p>{item}</p>;
});

const list2 = arr.map((item, index) => {
  return <p key={index}>{item}</p>;
});
```

在上面的例子中，如果数组发生了变化，我们需要在数组的末尾插入一个元素 arr.push('black')，react 经过 diff 后就会发现 ：key 值为 0 和 1 的元素并没有发生如何变化，所以 react 会认为， 最后需要在 UI 上发生变更，仅仅是插入一个 key 值为 2 的新元素。

但是如果我们在数组的开头插入了一个新元素 arr.unshift('green')，react 经过 diff 后就会发现每一个元素的 key 值都发生了变化，也是就说每个元素都要重新渲染一次，虽然从结果来看，仅仅是在开头添加了一个元素而已。如果负责渲染的数组数据量较大的话，则会对性能造成较大的影响。与 react 使用的启发式算法是相悖的。

因此，推荐的做法是每个兄弟元素都加上一个稳定唯一的 key 值。

### index 作为 key 的坑

先看段代码，

```html
{this.state.data.map((item,index) => return <Item key="{idx}" v="{v}" />) }

<!-- 开始时：['a','b','c']=> -->
<ul>
  <li key="0">a <input type="text" /></li>
  <li key="1">b <input type="text" /></li>
  <li key="2">c <input type="text" /></li>
</ul>

<!-- 数组重排 -> ['c','b','a'] => -->
<ul>
  <li key="0">c <input type="text" /></li>
  <li key="1">b <input type="text" /></li>
  <li key="2">a <input type="text" /></li>
</ul>
```

上面实例中在数组重新排序后, **key 对应的实例都没有销毁，而是重新更新**。具体更新过程我们拿 key=0 的元素来说明， 数组重新排序后：

- 组件重新 render 得到新的虚拟 dom；

- 新老两个虚拟 dom 进行 diff，新老版的都有 key=0 的组件，react 认为同一个组件，则只可能更新组件；

- 然后比较其 children，发现 key 相同，只是内容的文本内容不同（由 a--->c)，而 input 组件并没有变化，这时触发组件的`componentWillReceiveProps`方法，从而更新其子组件文本内容;

- 因为组件的 children 中 input 组件没有变化，其又与父组件传入的 props 没有关联，所以 input 组件不会更新(即其 componentWillReceiveProps 方法不会被执行)，导致用户输入的值不会变化。

> 这就是 index 作为 key 存在的问题，所以不要使用 index 作为 key。

### key 的值要保持唯一

在数组中生成的每项都要有 key 属性，并且 key 的值是一个永久且唯一的值，即稳定唯一。不能通过 `Math.random()` 来随机生成 key

### 友情链接

React 技术内幕 : https://juejin.im/post/59abb01c518825243f1b6dad

React 之 key 详解 : https://segmentfault.com/a/1190000009149186

个人博客 : https://github.com/PDKSophia/blog.io
