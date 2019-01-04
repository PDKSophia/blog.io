## Vue中的computed和methods有什么区别
先看段代码

```html
  <template>
    <div>
      <p>使用computed {{ message }}</p>
      <p>使用methods {{ message() }}</p>
    </div>
  </template>

  <!-- 简略代码 -->
  <script>
    data () {
      return {
        message: '我是message'
      }
    }
    computed: {
      message: function () {
        return this.message
      }
    },

    methods: {
      message() {
        return this.message
      }
    }
  </script>
```

- 首先最明显的不同 就是调用的时候， `methods要加上（）`

- computed 是基于它的`依赖缓存`, 只有相关依赖发生改变时才会`重新取值`

- 使用 methods ，在`重新渲染`的时候，函数总会重新调用执行,也就是说，methods是实时的，在重新渲染时，函数总会重新调用执行，不会缓存

- 可以说使用 `computed` 性能会更好，但是如果你不希望缓存，你可以使用 methods 属性。但是在利用实时信息时，比如显示当前进入页面的时间，必须用methods方式，如果用computed计算属性的话，每次进入页面将一直沿用第一次的信息

### 相关链接
Vue 官网: https://cn.vuejs.org/v2/api/#computed
