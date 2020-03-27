## 今天我们来聊聊 Vue 的生命周期

这个生命周期，可以说是必问的面试题了，反正我京东、七牛云、滴滴、百词斩的时候，都问了，之前在面试总结中有写过一次，这次再回顾一 vu 的生命周期 ～ 如有误错误， 请指正～ 先看一下官网的生命周期图示

<img src="https://cn.vuejs.org/images/lifecycle.png" width="400">

### 根据官网的生命周期图进行的理解

1 : new Vue()实例化之后，Vue 会调用 `_init`(函数进行初始化，也就是 init 过程，它会初始化生命周期、事件、 props、 methods、 data、 computed 与 watch 等。

```javascript
// 在初始化时，会调用以下代码，生命周期就是通过 callHook 调用的

Vue.prototype._init = function(options) {
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, 'beforeCreate'); // 拿不到 props data
  initInjections(vm);
  initState(vm); // 所有数据的初始化
  initProvide(vm);
  callHook(vm, 'created');
};

// 可以发现在以上代码中，beforeCreate 调用的时候，是获取不到 props 或者 data 中的数据的，因为这些数据的初始化都在 initState 中。
```

2 : 初始化完后，到 beforeCreate 周期，在 beforeCreatecreated 之间进行一个数据观测，可看到 created 的时候，数据已经和 data 属性绑定，但是此时还没有 el 选项。

3 :在 created 和 beforeMounted 之间，先判断有无 el 选项，因为我们在 main.js 中，有一个 class Vue 里存放着一个 el : #app, 所以判断是否有无 el，有接着判断有无 template，有则进行编译步骤，将其编译成 render 函数； 无 template 则将外部的 html 作为模编译，无 el 选项就停止编译，暂时停止了生命周期，直到 \$mount(el）挂载组件。

```javascript
export function mountComponent {
  callHook(vm, 'beforeMount')
  // ...
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
}
```

4 : beforeMount 和 Mounted 之间，给 vue 实例对象添加\$el 成员，并且替换掉挂载的 DOM 元素。因为在 beforeMount 之前 el 上还是 undefined。

```javascript
// beforeMount 就是在挂载前执行的，然后开始创建 VDOM 并替换成真实 DOM，最后执行 mounted 钩子。这里会有个判断逻辑，如果是外部 new Vue({}) 的话，不会存在 $vnode ，所以直接执行 mounted 钩子了。如果有子组件的话，会递归挂载子组件，只有当所有子组件全部挂载完毕，才会执行根组件的挂载钩子。
```

5 : beforeUpdated 和 updated 时，当数据改变时，会通过 setter -> watcher -> update 的流程来修改对应的视图，最后通过 patch 机制，将新的 Vnode 和旧的 Vnode 一起传入 patch 进行比较，经过 diff 算法算出差异，最后把这些差异的 DOM 进行修改。

```javascript
// 还有两个生命周期没有说，分别为 activated 和 deactivated ，这两个钩子函数是 keep-alive 组件独有的。用 keep-alive 包裹的组件在切换时不会进行销毁，而是缓存到内存中并执行 deactivated 钩子函数，命中缓存渲染后会执行 actived 钩子函数
```

6 : beforeDestory 钩子函数在实例销毁之前调用。在这一步，实例仍然完全可用。destoryed 在 vue 实例销毁后调用，调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

### 【编译过程】

compile 编译可以分成三个阶段 ： parse 、 optimise 、 generate ，最终得到 render function()

1 : parse 会通过正则方式解析 templae 模板中的指令 、 style、 class 等数据，然后生成一颗 AST 语法抽象树

2 : optimise 主要就是标记 static 静态节点，这是 Vue 在编译工程中的一个优处，后面在 update 更新视图时，会有一个 pacth 过程，diff 算法会直接跳过静态节点，从而减少了比较过程，优化 patch 的性能

3 : generate 是将 AST 语法抽象输转化成 render function()字符串的过程，得到的结果是 render 的字符串以及 staticRenderFns 字符串
