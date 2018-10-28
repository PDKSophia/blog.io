---
title: 'React篇-React和Vue的区别'
date: 2018-10-08 15:42:52
tags:
---
## React 和 Vue 的区别
博主面了几家公司，看简历上写着使用Vue.js框架，就会问，你能说一说 vue 和 react的区别吗 ？react 听过，没用过，所以就只能尴尬的说不怎么了解react。这不最近刚学了react (不断爬坑中)，同时看了写博客文章，自己总结一下，如有错误，请指出 ～

### 简单的自我介绍一下
React是由Facebook创建的JavaScript UI框架，它的诞生改变了JavaScript世界，最大的一个改变就是React推广了Virtual DOM， 并且创造了新的语法 - JSX，JSX 允许在JavaScript中写html代码。
Vue是由尤大大开发的一个MVVM框架，它采用的是模板系统而不是JSX。

### 安利一波
#### Virtual DOM
一听可能有点懵逼 ？我也很懵逼。所以我们来看看别人怎么说的 ：Vue.js(2.0版本)与React的其中最大一个相似之处，就是他们都使用了一种叫'Virtual DOM'的东西。所谓的Virtual DOM基本上说就是它名字的意思：虚拟DOM，DOM树的虚拟表现。

```javascript
    Virtual DOM 是一个映射真实DOM的JavaScript对象，如果我要改变任元素的状态，那么是先在Virtual DOM 上先进行改变，而不是直地去修改真实的DOM。
    比如在Vue中，我们将原来的节点改成这样 :
        // 原DOM
        <div class='box'>
            <p class='label'>
                <span>{{ label }}</span>
            </p>
        </div>

        // 修改的DOM
        <div class='box'>
            <p class='label'>
                <span>{{ label }}</span>
                <span>{{ username }}</span>
            </p>
        </div>
        
    我们往p节点中新增了一个span节点，于是我一个新的Virtual DOM对象会被创建。然后新的Virtual DOM 和旧的VirtualDOM比较，通过diff算法，算出差异，然后这些差异就会被应用在真实的DOM上

```
Vu 很“ 嚣张 ”，它宣称可以更快地计算出Virtual DOM的差异，这是由于它在渲染过程中，由于vue会跟每一个组件的依赖收集，通过setter / getter 以及一些函数的劫持，能够精确地知道变化，并在编译过程标记了static静态节点，在接下来新的Virtual DOM 并且和原来旧的 Virtual DOM进行比较时候，跳过static静态节点。所以不需要重新渲染整个组件树。

React默认是通过比较引用的方式进行，当某个组件的状态发生变化时，它会以该组件为根，重新渲染整个组件子树。如果想避免不必要的子组件重新渲染，你需要在所有可能的地方使用PureComponent，或手动实现shouldComponentUpdate方法。但是Vue中你可以认定它是默认的优化。

<img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533122820966&di=0a75c3407a39d5ef82428c23a1f65fd7&imgtype=jpg&src=http%3A%2F%2Fimg4.imgtn.bdimg.com%2Fit%2Fu%3D230475974%2C1783103155%26fm%3D214%26gp%3D0.jpg" />

#### 构建工具
React 采用 Create-React-App， Vue 采用的是Vue-Cli这两个工具非常的好用啊，大兄弟，都能为你创建一个好环境，不过Create-Reacr-App会逼迫你使用webpack和Babel，而Vue-cli可以按需创建不同的模板，使用起来更加灵活一点

#### 数据流

<!--more-->

（这里借用一波言川老铁的图，下边会贴出链接）
<img src="https://user-gold-cdn.xitu.io/2018/7/26/164d4c84b44edbf2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

很直观的，我们可以看到，在Vue2.x中，只parent -> Child <-> DOM的形式，而React只能单向传递，React一直提倡的是单向数据流，数据主要从父节点传递到子节点（通过props）。如果顶层（父级）的某个props改变了，React会重渲染所有的子节点。我们只能通过setState来改变状态。

#### 模板渲染方式不同
前面说了，Vue和React的模板有所区别，React是通过JSX来渲染模板，而Vue是通过扩展的HTML来进行模板的渲染。React通过原生JS实现模板中的常见语法，比如说条件啊、循环啊、三元运算符啊等，都是通过JS语法实现。而Vue是在和组件代码分离的单独模板中，通过指令v-if、v-for等实现。

这里react比较好点，比如我们要引用一个组件，reac直接import 引入，然后可以直接在render中调用了，但是！vue需要import之后，还要在components里去声明，才能用，好气哦 ～

<img src="https://www.fengdu100.com/uploads/allimg/180704/1F1024G3-1.gif" />

#### Vuex 和 Redux
在Vue中，我们是通过Vuex进行状态管理，而在React中，我们是通过Redux进行状态管理。但是这两者在使上还是有区别的。

在vuex中，我们可以通过在main.js中，引入 store文件夹并把store挂载到new Vue实例中，这样我可以直接通过$store灵活使用。
+ 你可以通过dispatch和commit进行更新数据，通过this.$store.state.xx读取数据
+ 或者你可以通过mapState / mapActions 进行vuex的操作

而在React中，我们需要每一个组件都引入connect，目的就是把props和dispatch连接起来

另外！！！我们vuex可以直接dispatch action也可以commit update，但是redux只能通过dispatch，然后在reducer里，接收到action，通过判断action的type，从而进行对应的操作，redux不能直接调用reducer进行修改！


```javascript
    Redux使用的是不可变的数据，而Vuex的数据是可变的，Redux每次修改更新数据，其实就是用新数据替换旧的数据，而Vuex是直接修改原数据

    Redux 在检测数据变化的时候，是通过 diff 的方式比较差异的，而Vuex其实和Vue的原理一样，是通过 getter/setter来比较的，因为在vue实例的时进行了依赖收集。
```
#### 不差上下？
反正我觉得他们两个都好，skr，skr，如果你想做一个小型项目就用vue，想做大型项目就用react，我是不知道怎样算小型，怎样大型，我随心所欲，想用哪个就用哪个，我不会告诉你，我都是做的个人小项目 ～

<img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533123228152&di=5c47d3000b5defcc54037a4e4c292a94&imgtype=0&src=http%3A%2F%2Ff.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2Fd1160924ab18972b016d358bedcd7b899e510a1f.jpg">

------
## 相链接
言川 - 关于Vue和React区别的一些笔记: <a href="https://github.com/lihongxun945/myblog/issues/21">https://github.com/lihongxun945/myblog/issues/21</a>

Vue 官网 - 对比其框架: <a href="https://cn.vuejs.org/v2/guide/comparison.html">https://cn.vuejs.org/v2/guide/comparison.html</a>

个人博客: <a href="http://blog.pengdaokuan.cn:4001">http://blog.pengdaokuan.cn:4001</a>

掘金: <a href='https://juejin.im/post/5b617801518825615d2fc92c' >https://juejin.im/post/5b617801518825615d2fc92c</a>

