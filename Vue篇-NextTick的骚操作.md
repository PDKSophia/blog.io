## Vue之nextTick理解
该文章均是从掘金、github上看各位大佬的理解，然后结合自己的理解，下边会给出友情链接～

那么怎么说nextTick呢？该从何说起，怪难为情的，还是让我们先来看个例子吧
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
    data () {
      return {
        username: 'PDK'
      }
    },
    methods: {
      handleChangeName () {
        this.username = '彭道宽'
        console.log(this.$refs.username.innerText) // PDK
      }
    }
  }
```
<storng>震惊！！！</strong>，打印出来的居然的 "PDK"，怎么回事，我明明修改了username，将值赋为"彭道宽"，为什么还是打印之前的值，而真实获取到DOM结点的innerText并没有得到预期中的“彭道宽”， 为啥子 ?

不方，我们再看一个例子，请看: 
```javascript
  export default {
    data () {
      return {
        username: 'PDK',
        age: 18
      }
    },
    mounted() {
      this.age = 19
      this.age = 20
      this.age = 21
    },
    watch: {
      age() {
        console.log(this.age)
      }
    }
  }
```
这段脚本执行我们猜测会依次打印：19，20，21。但是实际效果中，只会输出一次：21。为什么会出现这样的情况？

事不过三，所以我们再来看一个例子
```javascript
  export default {
    data () {
      return {
        number: 0
      }
    },
    methods: {
      handleClick () {
        for(let i = 0; i < 10000; i++) {
          this.number++
        }
      }
    }
  }
```
在点击click触发handleClick()事件之后，number会被遍历增加10000次，在vue的双向绑定-响应式系统中，会经过 “setter -> Dep -> Watcher -> patch -> 视图” 这个流水线。那么是不是可以这么理解，每次number++，都会经过这个“流水线”来修改真实的DOM，然后DOM被更新了10000次。

但是身为一位“资深”的前端小白来说，都知道，前端对性能的看中，而频繁的操作DOM，那可是一大“忌讳”啊。Vue.js 肯定不会以如此低效的方法来处理。Vue.js在默认情况下，每次触发某个数据的 setter 方法后，对应的 Watcher 对象其实会被 push 进一个队列 queue 中，在下一个 <strong>tick</strong> 的时候将这个队列 queue 全部拿出来 run一遍。这里我们看看[Vue官网的描述](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97) : Vue <strong>`异步执行`</strong> DOM 更新。只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。

![image](https://github.com/PDKSophia/ONE_WORD/raw/master/images/g2.gif)

Vue在修改数据的时候，不会立马就去修改数据，例如，当你设置 vm.someData = 'new value' ，该组件不会立即重新渲染。当刷新队列时，组件会在事件循环队列清空时的下一个 <strong>tick</strong> 更新, 为了在数据变化之后等待 Vue 完成更新 DOM ，可以在数据变化之后立即使用 Vue.nextTick(callback) 。这样回调函数在 DOM 更新完成后就会调用，下边来自[Vue官网中的例子](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97) :
```html
  <div id="example">{{message}}</div>
```
```javascript
  var vm = new Vue({
    el: '#example',
    data: {
      message: '123'
    }
  })
  vm.message = 'new message' // 更改数据
  console.log(vm.$el.textContent === 'new message') // false， message还未更新

  Vue.nextTick(function () {
    console.log(vm.$el.textContent === 'new message') // true， nextTick里面的代码会在DOM更新后执行
  })
```

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_2.jpg'>

### 下一个tick是什么鬼玩意 ?
上面一直扯扯扯，那么到底什么是 `下一个tick` ？
