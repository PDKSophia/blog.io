---
title: Vue篇-数据双向绑定原理
date: 2018-10-08 15:40:37
tags:
---
## Vue的数据双向绑定原理 - 响应式系统的基本原理
这也是必问，我是看了掘金上的小册《剖析 Vue.js 内部运行机制》，然后理解梳理了一遍，记录一下 ～ 99%是从小册上搬运下来的，请叫我搬运侠 ～

### Object.defineProperty
```javascript
        // Vue.js就是基于Object.defineProperty实现「 响应式系统 」的
        
        /*
            obj: 目标对象
            prop: 需要操作的目标对象的属性名
            descriptor: 描述符
            
            return value 传入对象
        */
        Object.defineProperty(obj, prop, descriptor)

        下边是descriptor的一些简单属性 ：
        · enumerable，属性是否可枚举，默认 false。
        · configurable，属性是否可以被修改或者删除，默认 false。
        · get，获取属性的方法。
        · set，设置属性的方法。
```

### 例子测试 ( 下边代码可直接新建index.js，运行测试 )
```javascript
    // 我们知道Object.defineProperty之后，将使用它将对象变成可观察的， 下面只对对象进行处理

    // 定义一个函数 @ChangeView
    function ChangeView (val) {
        console.log('视图更新啦 ～ 新值为 : ' + val)
    }

    // 我们定义一个函数defineReactiv，这个函数通过 Object.defineProperty 来实现对对象的「响应式」化。
    // 经过 defineReactive ，obj 的 key 属性在「读」的时候会触发 reactiveGetter 方法，而在该属性被「写」的时候则会触发 reactiveSetter 方法

    /*
    * obj : 需要绑定的对象
    * key : 对象的某一属性
    * val : 具体的值
    */
    function defineReactive (obj, key, val) {
        Object.defineProperty(obj, key, {
            enumerable: true,       /* 属性可枚举 */
            configurable: true,     /* 属性可被修改或删除 */
            get : function reactiveGetter() {
                // 依赖收集
                return val;
            },
            set : function reactiveSetter(newVal) {
                if(val === newVal) {
                    return;
                }
                ChangeView (newVal);  // 调用函数，通知视图更新
            }
        })
    }
    
    // 但这是不够的，我们的对象的某些属性可能还是对象，所以封装一层observer
    // 这个函数传入一个 obj（需要「响应式」化的对象），通过遍历所有属性的方式对该对象的每一个属性都通过 defineReactive 处理。
    //（注：源码中实际是 observer 会进行递归调用，为了便于理解去掉了递归的过程）
    function observer (obj) {
        if(!obj || (typeof obj != 'object')) {
            return ;
        }
        Object.keys(obj).forEach((key)=>{
            defineReactive(obj, key, obj[key]);
        });
    }

    // 这样我们就大功告成了
    class Vue {
        constructor (options) {
            this.data = options.data
            observer(this.data)
        }
    }

    let t_vue = new Vue({
        data : {
            text : '这是一个测试'
        }
    })
    t_vue.data.text = '改变测试值'
```

### 依赖收集
#### 为什么要依赖收集

<!--more-->

比如我们现在有是这种情况
```javascript
    new Vue({
        template : 
            `<div>
                <p>{{ message1 }}</p>
                <p>{{ message2 }}</p>
            </div>`,
        data() : {
            return {
                message1 : '我是1',
                message2 : '我是2',
                message3 : '我是3'
            }
        }
    })

    // 然后我们将修改了message3
    this.message3 = '修改message3'
```
但是我们实际在template中并未使用到message3的值，所以我们不需要调用上边说的ChangeView()来通知视图更新。还有一种情况就是这样的 :
```javascript
    let globaldata = {
        message : '我是全局的数据'
    }

    let v1 = new Vue ({
        template : 
            `<p>{{ message }}</p>`,
        data : globaldata
    })

    let v2 = new Vue ({
        template : 
            `<p>{{ message }}</p>`,
        data : globaldata
    })

    // 这时候我们将修改message的值
    globaldata.mesage = '修改全局的值'
```
我们应该需要通知 v1 以及 v2 两个vm实例进行视图的更新，「依赖收集」会让 message 这个数据知道“哦～有两个地方依赖我的数据，我变化的时候需要通知它们～”。

#### 如何收集依赖
订阅者Dep，它的主要作用是用来存放 Watcher 观察者对象。
```javascript
    class Dep {
        constructor () {
            // 用来存放所有Watcher对象的数组
            this.subs = []
        }

        // 添加一个 watcher对象
        addSub (sub) {
            this.subs.push(sub)   // 
        }

        // 通知所有视图更新
        notify() {
            this.subs.forEach((sub)=> {
                sub.update()
            })
        }
    }
```
观察者Watcher
```javascript
    class Watcher {
        constructor () {
            /* 在new一个Watcher对象时将该对象赋值给Dep.target，在get中会用到 */
            Dep.target = this;
        }

        // 更新视图
        update () {
            console.log('试图更新啦 ～')
        }
    }
```
#### 开始依赖收集
在闭包中添加Dep类的对象，用来收集 Watcher 对象。在对象被「读」的时候，会触发 reactiveGetter 函数把当前的 Watcher 对象（存放在 Dep.target 中）收集到 Dep 类中去。之后如果当该对象被「写」的时候，则会触发 reactiveSetter 方法，通知 Dep 类调用 notify 来触发所有 Watcher 对象的 update 方法更新对应视图
```javascript
    function defineReactive(obj, key, val) {
        // 一个 Dep 类对象
        const dep = new Dep()
        
        Object.defineProperty(obj, key, {
            enumerable: true,       /* 属性可枚举 */
            configurable: true,     /* 属性可被修改或删除 */
            get : function reactiveGetter() {
                // 依赖收集,将Dep.target（即当前的Watcher对象存入dep的subs中)
                dep.addSub(Dep.target)
                return val;
            },
            set : function reactiveSetter(newVal) {
                if(val === newVal) {
                    return;
                }
                /* 在set的时候触发dep的notify来通知所有的Watcher对象更新视图 */
                dep.notify()
            }
        })
    }

    class Vue {
        constructor(options) {
            this.data = options.data;
            observer(this.data);
            /* 新建一个Watcher观察者对象，这时候Dep.target会指向这个Watcher对象 */
            new Watcher();
            /* 在这里模拟render的过程，为了触发test属性的get函数 */
            console.log('render~', this.data.test);
        }
    }
```
### 讲得有点模糊，总结一下
1 ： 首先我们实现一个 class Vue，在其构造函数中，进行初始化以及调用observer方法监测数据，目的就是通过遍历所有属性的方式对该对象的每一个属性都通过 defineReactive 处理。接着new Watcher，这一步就是告诉订阅者，我是谁，但是真正的订阅是在数据被引用的时候
```javascript
    new Vue {
        constructor (options) {
            this.data = options.data
            observer(this.data)
            new Watcher()
        }
    }
```
2 ： 在observer中，递归遍历对每个属性都通过defineReactive处理，在defineReactive中注册get方法，用来收集依赖，在它的闭包中会有一个 Dep 对象，这个对象用来存放 Watcher 对象的实例。
```javascript
    class Dep {
        constructor () {
            this.subs = []  // 存放所有watcher对象的数组
        }

        addSub (sub) {
            this.subs.push(sub)
        }

        notify () {
            this.subs.forEach((sub)=>{
                sub.update ()
            })
        }
    }

    class Watcher {
        constructor () {
            Dep.target = this
        }

        update () {
            console.log('视图更新啦')
        }
    }
    function observer (obj) {
        if(!obj || (typeof obj != 'object')) {
            return;
        }
        Object.keys(obj).forEach((key)=>{
            defineReactive (obj, key, obj[key])
        })
    }

    function defineReactvie (obj, key, val) {
        const dep = new Dep()
        
        Object.defineProperty(obj, key, {
            enumerable: true,       /* 属性可枚举 */
            configurable: true,     /* 属性可被修改或删除 */
            get : function reactiveGetter() {
                // 依赖收集,将Dep.target（即当前的Watcher对象存入dep的subs中)
                dep.addSub(Dep.target)
                return val;
            },
            set : function reactiveSetter(newVal) {
                if(val === newVal) {
                    return;
                }
                /* 在set的时候触发dep的notify来通知所有的Watcher对象更新视图 */
                dep.notify()
            }
        })
    }
```

其实「依赖收集」的过程就是把 Watcher 实例存放到对应的 Dep 对象中去。新建一个 Watcher 对象只需要 new 出来，这时候 Dep.target 已经指向了这个 new 出来的 Watcher 对象。get 方法可以让当前的 Watcher 对象（Dep.target）存放到它的 subs 中（addSub）方法，在数据变化时，set 会调用 Dep 对象的 notify 方法通知它内部所有的 Watcher 对象进行视图更新。

### 再多说一句
可能你们会发现99%跟染陌大佬说的一摸一样，没错，我就是跟着他的一步一步来的，他已经讲得很简单啦，我就只能当大自然的搬运工啦 ～

### 相关连接
染陌 VueDemo : https://github.com/answershuto/VueDemo

掘金小册 : https://juejin.im/book/5a36661851882538e2259c0f
