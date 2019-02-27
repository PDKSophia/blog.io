## React 基于 Taro 框架开发小程序性能优化

1. 分包处理，为了使首页加载更快

2. 由于 React 特性，需有一个根结点，使用 Block 代替 View，减少一层 DOM 节点

3. 在组件中，无需直接 list.map, 原因是 react 中是浅比较，如果 state/ props 改变，会重新 re-render，抽离为一个 LIST 组件 (继承于 PureComponent)，这样只需传递数据 datalist，react 在 diff 比较时，如果只是值改变，默认无需重新渲染 (name = 1 改为 name = 2， 在 react 中浅比较，会认为没有改变的，因为比较的是内存地址)

4. css module ，避免样式重叠，减少 CSS DOM 层次，这样可以加快页面的渲染， 在 config 配置中进行 cssModule 配置，配合 classnames.bind 一起使用

5. preload {

   1. 资源 preload，场景: 由于前一个版本，在做到下一题时，才会获取当前的资源如 audio、radio、img 等资源路径，并且需要采用 setTimeout 实现自动播放，如果网络过慢，会导致无法播放音频或加载中，于是在资源这里，采用 preload 提前预加载下一题所需要的资源

   2. react 中的 this.$preload，统一页面之间传递数据的格式，页面之前可以承载资源，简化url的长度，之前页面传递资源通过query params，例如现在A通过this.$preload 传递某些资源，在 B 页面、C 页面直接通过 this.\$router.preload 可获取数据，而不需要在 A->B、A->C 中的 url 传递

   3. 分包的 preload，在加载完主包时，加载次包 1 的相应数据

}

6. 减少 state 的使用，如果不涉及 UI 变化的，都绑定在 this 对象上，因为 state 的改变会导致重新渲染

7. async / await 的使用，将异步变为同步，使得代码逻辑清晰

8. 将后端返回的数据，进行一个优化抽离，剔除不需要的数据，将所需的数据构造成自己需要的格式，因为如果后端返回的是一个树状级结构，在小程序中，逻辑层和视图层间的数据传递，是逻辑层将数据序列化后，传给视图层，视图层再反序列化，如果层次过深，会影响性能。同时剔除不需要的数据原因也是为了减少 redux 在比较的 list 数据时，层次过深，在 diff 比较时会增加比较时间

9. 对象池的引入

10. 尽可能抽离封装需要重复的函数、复用的组件

11. 不影响布局图片，均通过 css background-image 来实现，而无需通过 img 实现，减少一层 img DOM 节点；css 多使用伪类实现
