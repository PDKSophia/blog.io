## Vue 之 nextTick 理解

### 前言

一开始就只想搞清楚 nextTick 的一个原理，谁知道，跟吃了辣条一下，停不下来，从 nextTick 的源码到 Watcher 源码再到 Dep 源码，震惊，然后再结合自己之前看掘金小册理解的`双向绑定-响应式系统`，感觉有一种`顿悟`的感觉，总之，这是我个人的理解，请大佬们指教，如有转载，请附上原文链接，毕竟我 copy 源码也挺累的～

### 多说一句话

因为这篇文章，有挺多源代码的，一般来说，换作是我，我也会一扫而过，一目十行，但是笔者我！<strong>真心！</strong><strong>希望！</strong>你们能够<strong>耐住性子！</strong>去看！源码中，会有一丢丢*注释*，<strong>一定要看尤大大作者给的注释</strong>

如果有什么地方写错了，恳请大佬们指教，互相进步～

### 请开始你的表演

那么怎么说 nextTick 呢？该从何说起，怪难为情的，还是让我们先来看个例子吧

```html
<template>
  <div>
    <div ref="usernmae">{{ username }}</div>
    <button @click="handleChangeName">click</button>
  </div>
</template>
```

```javascript
export default {
  data() {
    return {
      username: 'PDK'
    };
  },
  methods: {
    handleChangeName() {
      this.username = '彭道宽';
      console.log(this.$refs.username.innerText); // PDK
    }
  }
};
```

<storng>震惊！！！</strong>，打印出来的居然的 "PDK"，怎么回事，我明明修改了 username，将值赋为"彭道宽"，为什么还是打印之前的值，而真实获取到 DOM 结点的 innerText 并没有得到预期中的“彭道宽”， 为啥子 ?

不方，我们再看一个例子，请看:

```javascript
export default {
  data() {
    return {
      username: 'PDK',
      age: 18
    };
  },
  mounted() {
    this.age = 19;
    this.age = 20;
    this.age = 21;
  },
  watch: {
    age() {
      console.log(this.age);
    }
  }
};
```

这段脚本执行我们猜测会依次打印：19，20，21。但是实际效果中，只会输出一次：21。为什么会出现这样的情况？

事不过三，所以我们再来看一个例子

```javascript
export default {
  data() {
    return {
      number: 0
    };
  },
  methods: {
    handleClick() {
      for (let i = 0; i < 10000; i++) {
        this.number++;
      }
    }
  }
};
```

在点击 click 触发 handleClick()事件之后，number 会被遍历增加 10000 次，在 vue 的双向绑定-响应式系统中，会经过 “setter -> Dep -> Watcher -> patch -> 视图” 这个流水线。那么是不是可以这么理解，每次 number++，都会经过这个“流水线”来修改真实的 DOM，然后 DOM 被更新了 10000 次。

但是身为一位“资深”的前端小白来说，都知道，前端对性能的看中，而频繁的操作 DOM，那可是一大“忌讳”啊。Vue.js 肯定不会以如此低效的方法来处理。Vue.js 在默认情况下，每次触发某个数据的 setter 方法后，对应的 Watcher 对象其实会被 push 进一个队列 queue 中，在下一个 <strong>tick</strong> 的时候将这个队列 queue 全部拿出来 run 一遍。这里我们看看[Vue 官网的描述](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97) : Vue <strong>`异步执行`</strong> DOM 更新。只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_2.jpg'>

Vue 在修改数据的时候，不会立马就去修改数据，例如，当你设置 vm.someData = 'new value' ，该组件不会立即重新渲染。当刷新队列时，组件会在事件循环队列清空时的下一个 <strong>tick</strong> 更新, 为了在数据变化之后等待 Vue 完成更新 DOM ，可以在数据变化之后立即使用 Vue.nextTick(callback) 。这样回调函数在 DOM 更新完成后就会调用，下边来自[Vue 官网中的例子](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97) :

```html
<div id="example">{{message}}</div>
```

```javascript
var vm = new Vue({
  el: '#example',
  data: {
    message: '123'
  }
});
vm.message = 'new message'; // 更改数据
console.log(vm.$el.textContent === 'new message'); // false， message还未更新

Vue.nextTick(function() {
  console.log(vm.$el.textContent === 'new message'); // true， nextTick里面的代码会在DOM更新后执行
});
```

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_3.jpeg'>

### 下一个 tick 是什么鬼玩意 ?

上面一直扯扯扯，那么到底什么是 `下一个tick` ？

nextTick 函数其实做了两件事情，一是生成一个 timerFunc，把回调作为 microTask 或 macroTask 参与到事件循环中来。二是把回调函数放入一个 callbacks 队列，等待适当的时机执行

nextTick 在官网当中的定义：

在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

在 Vue 2.4 之前都是使用的 `microtasks(微任务)`，但是 microtasks 的优先级过高，在某些情况下可能会出现比事件冒泡更快的情况，但如果都使用 `macrotasks(宏任务)` 又可能会出现渲染的性能问题。所以*在新版本中，会默认使用 microtasks*，但在特殊情况下会使用 macrotasks。比如 v-on。对于不知道 JavaScript 运行机制的，可以去看看阮一峰老师的[JavaScript 运行机制详解：再谈 Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)、又或者看看我的[Event Loop](https://github.com/PDKSophia/blog.io/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8%E7%AF%87-Event-Loop.md)

哎呀妈，又扯远了，回到正题，我们先去看看[vue 中的源码](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js) :

```javascript
/* @flow */
/* globals MessageChannel */

import { noop } from 'shared/util';
import { handleError } from './error';
import { isIOS, isNative } from './env';

const callbacks = []; // 定义一个callbacks数组来模拟事件队列
let pending = false; // 一个标记位，如果已经有timerFunc被推送到任务队列中去则不需要重复推送

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// 敲重点！！！！！下面这段英文注释很重要！！！！！

// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).
let microTimerFunc;
let macroTimerFunc;
let useMacroTask = false;

// Determine (macro) task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = flushCallbacks;
  macroTimerFunc = () => {
    port.postMessage(1);
  };
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  microTimerFunc = () => {
    p.then(flushCallbacks);
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop);
  };
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc;
}

/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 */
export function withMacroTask(fn: Function): Function {
  return (
    fn._withTask ||
    (fn._withTask = function() {
      useMacroTask = true;
      const res = fn.apply(null, arguments);
      useMacroTask = false;
      return res;
    })
  );
}

export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    if (useMacroTask) {
      macroTimerFunc();
    } else {
      microTimerFunc();
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    });
  }
}
```

来来来，我们仔细的扯一扯～

首先因为目前浏览器平台并没有实现 nextTick 方法，所以 Vue.js 源码中分别用 `Promise`、`setTimeout`、`setImmediate` 等方式在 microtask（或是 macrotasks）中创建一个事件，目的是在当前调用栈执行完毕以后（不一定立即）才会去执行这个事件

<strong>对于实现 macrotasks ，会先判断是否能使用 _setImmediate_ ，不能的话降级为 _MessageChannel_ ，以上都不行的话就使用 _setTimeout_。</strong> 注意，是对实现<strong>_宏任务_</strong>的判断

<!-- <img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_4.jpeg'> -->

问题来了？为什么要优先定义 `setImmediate` 和 `MessageChannel` 创建，macroTasks 而不是 `setTimeout` 呢？

HTML5 中规定 setTimeout 的最小时间延迟是 4ms，也就是说理想环境下异步回调最快也是 4ms 才能触发。Vue 使用这么多函数来模拟异步任务，其目的只有一个，就是让回调异步且尽早调用。而 [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) 和 [setImmediate](https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate) 的延迟明显是小于 [setTimeout](https://github.com/PDKSophia/blog.io/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8%E7%AF%87%20-%20setTimeout%E4%B8%8EsetInterval.md)的

```javascript
// 是否可以使用 setImmediate
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else if (
  typeof MessageChannel !== 'undefined' &&
  (isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]')
) {
  // 是否可以使用 MessageChannel
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = flushCallbacks;
  macroTimerFunc = () => {
    port.postMessage(1); // 利用消息管道，通过postMessage方法把1传递给channel.port2
  };
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0); // 利用setTimeout来实现
  };
}
```

_setImmediate_ 和 _MessageChannel_ 都不行的情况下，使用 _setTimeout_，delay = 0 之后，执行 flushCallbacks()，下边是 flushCallbacks 的代码

```javascript
// setTimeout 会在 macrotasks 中创建一个事件 flushCallbacks ，flushCallbacks 则会在执行时将 callbacks 中的所有 cb 依次执行。
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);

  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

前面说了，`nextTick` 同时也支持 Promise 的使用，会判断是否实现了 Promise

```javascript
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;
  // 将回调函数整合至一个数组，推送到队列中下一个tick时执行
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    // pengding = false的话，说明不需要不存在，还没有timerFunc被推送到任务队列中
    pending = true;
    if (useMacroTask) {
      macroTimerFunc(); // 执行宏任务
    } else {
      microTimerFunc(); // 执行微任务
    }
  }

  // 判断是否可以使用 promise
  // 可以的话给 _resolve 赋值
  // 回调函数以 promise 的方式调用
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    });
  }
}
```

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_4.jpeg'>

### 你以为这就结束了？

ok，上边 nextTick 的源码比较少，看得大概大概的了，但是呢，还是很懵，所以我又去 github 看了一下[watcher.js 的源码](https://github.com/vuejs/vue/blob/dev/src/core/observer/watcher.js)，回到开头的第三个例子，就是那个循环 10000 次的那个小坑逼，来，我们看下源码再说，源码里的代码太多，我挑着 copy，嗯，凑合看吧

```javascript
  import {
    warn,
    remove,
    isObject,
    parsePath,
    _Set as Set,
    handleError,
    noop
  } from '../util/index'

  import { traverse } from './traverse'
  import { queueWatcher } from './scheduler'                // 这个很也重要，眼熟它
  import Dep, { pushTarget, popTarget } from './dep'  // 眼熟这个，这个是将 watcher 添加到 Dep 中，去看看源码

  import type { SimpleSet } from '../util/index'

  let uid = 0   // 这个也很重要，眼熟它

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
  */
  export default class Watcher {
    // 其中的一些我也不知道，我只能从字面上理解，如有大佬，请告知一声
    vm: Component;
    expression: string;
    cb: Function;
    id: number;
    deep: boolean;
    user: boolean;
    lazy: boolean;
    sync: boolean;
    dirty: boolean;
    active: boolean;
    deps: Array<Dep>;
    newDeps: Array<Dep>;
    depIds: SimpleSet;
    newDepIds: SimpleSet;
    before: ?Function;
    getter: Function;
    value: any;
    ...
    constructor (
      vm: Component,
      expOrFn: string | Function,
      cb: Function,
      options?: ?Object,                // 我们的options
      isRenderWatcher?: boolean
    ) {
      this.vm = vm
      if (isRenderWatcher) {
        vm._watch = this
      }
      vm._watchers.push(this)
      // options
      if (options) {
        this.deep = !!options.deep
        this.user = !!options.user
        this.lazy = !!options.lazy
        this.sync = !!options.sync
        this.before = options.before
      } else {
        this.deep = this.user = this.lazy = this.sync = false
      }
      this.cb = cb
      this.id = ++uid       // 看到没有，我们类似于给每个 Watcher对象起个名字，用id来标记每一个Watcher对象
      this.active = true
      this.dirty = this.lazy
      this.deps = []
      this.newDeps = []
      this.depIds = new Set()
      this.newDepIds = new Set()
      this.expression = process.env.NODE_ENV !== 'production'
        ? expOrFn.toString()
        : ''
      // parse expression for getter
      if (typeof expOrFn === 'function') {
        this.getter = expOrFn
      } else {
        this.getter = parsePath(expOrFn)
        if (!this.getter) {
          this.getter = noop
          process.env.NODE_ENV !== 'production' && warn(
            `Failed watching path: "${expOrFn}" ` +
            'Watcher only accepts simple dot-delimited paths. ' +
            'For full control, use a function instead.',
            vm
          )
        }
      }
      this.value = this.lazy
        ? undefined
        : this.get()  // 执行get()方法
    }

    get () {
      pushTarget(this) // 调用Dep中的pushTarget()方法，具体源码下边贴出
      let value
      const vm = this.vm
      try {
        value = this.getter.call(vm, vm)
      } catch (e) {
        if (this.user) {
          handleError(e, vm, `getter for watcher "${this.expression}"`)
        } else {
          throw e
        }
      } finally {
        if (this.deep) {
          traverse(value)
        }
        popTarget() // 调用Dep中的popTarget()方法，具体源码下边贴出
        this.cleanupDeps()
      }
      return value
    }

    // 添加到dep中
    addDep(dep: Dep) {
      const id = dep.id // Dep 中，存在一个id和subs数组(用来存放所有的watcher)
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id)
        this.newDeps.push(dep)
        if (!this.depIds.has(id)) {
          dep.addSub(this) // 调用dep.addSub方法，将这个watcher对象添加到数组中
        }
      }
    }

    ...

    update () {
      if (this.lazy) {
        this.dirty = true
      } else if (this.sync) {
        this.run()
      } else {
        queueWatcher(this) // queueWatcher()方法，下边会给出源代码
      }
    }

    run () {
      if (this.active) {
        const value = this.get()
        if (
          value !== this.value ||
          // 看英文注释啊！！！很清楚了！！！
          // Deep watchers and watchers on Object/Arrays should fire even
          // when the value is the same, because the value may
          isObject(value) ||
          this.deep
        ) {
          // set new value
          const oldValue = this.value
          this.value = value
          if (this.user) {
            try {
              this.cb.call(this.vm, value, oldValue)
            } catch (e) {
              handleError(e, this.vm, `callback for watcher "${this.expression}"`)
            }
          } else {
            this.cb.call(this.vm, value, oldValue) // 回调函数
          }
        }
      }
    }

    ...

  }
```

太长了？染陌大佬的[《剖析 Vue.js 内部运行机制》](https://juejin.im/book/5a36661851882538e2259c0f/section/5a3bb17af265da4307037186#heading-0)中给出了一个简单而有利于理解的代码(群主，我不是打广告的，别踢我)

```javascript
let uid = 0;

class Watcher {
  constructor() {
    this.id = ++uid;
  }

  update() {
    console.log('watch' + this.id + ' update');
    queueWatcher(this);
  }

  run() {
    console.log('watch' + this.id + '视图更新啦～');
  }
}
```

### queueWatcher 是个什么鬼

够抽象吧！再看看这个代码，比较一看，你会发现，都出现了一个 <strong>queueWatcher</strong>的玩意，于是我去把源码也看了一下。下边是它的源代码(选择 copy)

```javascript
  import {
    warn,
    nextTick,                       // 看到没有，我们一开始要讲的老大哥出现了！！！！
    devtools
  } from '../util/index'

  export const MAX_UPDATE_COUNT = 100

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue () {
    flushing = true
    let watcher, id

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher   (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue.sort((a, b) => a.id - b.id)

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index]
      if (watcher.before) {
        watcher.before()
      }
      id = watcher.id
      has[id] = null
      watcher.run()     // watcher对象调用run方法执行
      // in dev build, check and stop circular updates.
      if (process.env.NODE_ENV !== 'production' && has[id] != null) {
        circular[id] = (circular[id] || 0) + 1
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? `in watcher with expression "${watcher.expression}"`
                : `in a component render function.`
            ),
            watcher.vm
          )
          break
        }
      }
    }

    ...
  }
  /**
   * 看注释看注释！！！！！！
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
  */
  export function queueWatcher (watcher: Watcher) {
    const id = watcher.id  // 获取watcher的id

    // 检验id是否存在，已经存在则直接跳过，不存在则标记哈希表has，用于下次检验
    if (has[id] == null) {
      has[id] = true
      if (!flushing) {
        // 如果没有flush掉，直接push到队列中即可
        queue.push(watcher)
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        let i = queue.length - 1
        while (i > index && queue[i].id > watcher.id) {
          i--
        }
        queue.splice(i + 1, 0, watcher)
      }

      // queue the flush
      if (!waiting) {
        waiting = true  // 标志位，它保证flushSchedulerQueue回调只允许被置入callbacks一次。

        if (process.env.NODE_ENV !== 'production' && !config.async) {
          flushSchedulerQueue()
          return
        }
        nextTick(flushSchedulerQueue)  // 看到没有，调用了nextTick
        // 这里面的nextTick(flushSchedulerQueue)中的flushSchedulerQueue函数其实就是watcher的视图更新。
        // 每次调用的时候会把它push到callbacks中来异步执行。
      }
    }
  }
```

### Dep

哎呀妈，我们再来看看 Dep 中的源码

```javascript
import type Watcher from './watcher'; // 眼熟它
import { remove } from '../util/index';
import config from '../config';

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  // 将所有的watcher对象添加到数组中
  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id);
    }

    // 通过循环，来调用每一个watcher，并且 每个watcher都有一个update()方法，通知视图更新
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
const targetStack = [];

export function pushTarget(_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target);
  Dep.target = _target;
}

export function popTarget() {
  Dep.target = targetStack.pop();
}

// 说白了，在数据【依赖收集】过程就是把 Watcher 实例存放到对应的 Dep 对象中去
// 这时候 Dep.target 已经指向了这个 new 出来的 Watcher 对象
// get 方法可以让当前的 Watcher 对象（Dep.target）存放到它的 subs 数组中
// 在数据变化时，set 会调用 Dep 对象的 notify 方法通知它内部所有的 Watcher 对象进行视图更新。
```

### 最后在扯两句

真的是写这篇文章，花了一下午，也在掘金找了一些文章，但是都不够详细，并且很多时候，感觉很多文章都是千篇一律，借鉴了别人的理解，然后自己同时看染陌大佬的讲解，以及自己去看了源码，才大概看懂，果然，看的文章再多，还不如去看源码来的实在！！！

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_5.jpeg'>

### 友情链接

《我的博客》: https://github.com/PDKSophia/blog.io

《剖析 Vue.js 内部运行机制》: https://juejin.im/book/5a36661851882538e2259c0f

《Vue 官网之异步更新队列》: https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97

《MessageChannel API》: https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel

《Vue 中 DOM 的异步更新策略以及 nextTick 机制》: https://funteas.com/topic/5a8dc7c8f7f37aa60a177bb7

《Vue.js 源码之 nextTick》: https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js

《Vue.js 源码之 Watcher》: https://github.com/vuejs/vue/blob/dev/src/core/observer/watcher.js#L31

《Vue.js 源码之 Dep》: https://github.com/vuejs/vue/blob/dev/src/core/observer/dep.js
