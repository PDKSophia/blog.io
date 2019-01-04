---
title: JavaScript篇-Promise这个折磨人的小妖精
date: 2018-08-30 14:59:03
tags:
---
## 前言
不得不说， promise 这玩意，是每个面试官都会问的问题，但是你真的了解promise吗？其实我也不了解，下面的内容都是我从掘金、知乎、《ECMAScript6入门》上看的博客文章等资料，然后总结的，毕竟自己写一遍，更有助于理解，如有错误，请指出 ～

## 什么是回调地狱 ？

在过去写异步代码都要靠回调函数，当异步操作依赖于其他异步操作的返回值时，会出现一种现象，被程序员称为 “回调地狱”，比如这样 ：

```javascript
    // 假设我们要请求用户数据信息，它接收两个回调，successCallback 和 errCallback

    function getUserInfo (successCallback, errCallback) {
      $.ajax({
        url: 'xxx',
        method: 'get',
        data: {
          user_id: '123'
        },
        success: function(res) {
          successCallback(res)    // 请求成功，执行successCallback()回调
        },
        error: function(err) {
          errCallback(err)        // 请求失败，执行errCallback()回调
        }
      })
    }
```

骗我 ？ 这哪里复杂了，明明很简单啊，说好的回调地狱呢 ？ 不急，继续看

假设我们拿到了用户信息，但是我们还要拿到该用户的聊天列表，然后再拿到跟某一“陌生”男人的聊天记录呢 ?

```javascript
    // getUserInfo -> getConnectList -> getOneManConnect()

    getUserInfo((res) => {
      getConnectList(res.user_id, (list) => {
        getOneManConnect(list.one_man_id, (message) => {
          console.log('这是我和某位老男人的聊天记录')
        }, (msg_err)=>{
          console.log('获取详情失败，别污蔑我，我不跟老男人聊天')
        })
      }, (list_err) => {
        console.log('获取列表失败，我都不跟别人聊天')
      })
    }, (user_err) => {
      console.log('获取用户个人信息失败')
    })
```
大兄弟，刺激不，三层嵌套，再多来几个嵌套，就是 “回调地狱” 了。这时候，promise来了。
<!-- more -->
## Promise 简介
阮一峰老师的《ECMAScript 6入门》里对promise的含义是 : Promise 是异步编程的一种解决方案，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

> 简单来说，Promise就是对异步的执行结果的描述对象。

### 状态
+ pending (进行中)
+ fulfilled (已成功)
+ rejected (已失败)

```base
    1 : 只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。

    2 : 一旦状态改变，就不会再变，任何时候都可以得到这个结果。

    3 : Promise对象的状态改变，只有两种可能：从pending变为fulfilled和从pending变为rejected
```

### 知乎形象例子来说明promise
```javascript
  // 定外卖就是一个Promise,Promise的意思就是承诺
  // 我们定完外卖，饭不会立即到我们手中
  // 这时候我们和商家就要达成一个承诺
  // 在未来，不管饭是做好了还是烧糊了，都会给我们一个答复
  function 定外卖(){
    // Promise 接受两个参数
    // resolve: 异步事件成功时调用（菜烧好了）
    // reject: 异步事件失败时调用（菜烧糊了）
    return new Promise((resolve, reject) => {
      let result = 做饭()
	  // 下面商家给出承诺，不管烧没烧好，都会告诉你
	  if (result == '菜烧好了') 
	  // 商家给出了反馈
	    resolve('我们的外卖正在给您派送了')
	  else 
	    reject('不好意思，我们菜烧糊了，您再等一会')
	})
  }

  // 商家厨房做饭，模拟概率事件
  function 做饭() {
    return Math.random() > 0.5 ? '菜烧好了' : '菜烧糊了'
  }

  // 你在家上饿了么定外卖
  // 有一半的概率会把你的饭烧糊了
  // 好在有承诺，他还是会告诉你

  定外卖()
    // 菜烧好执行，返回'我们的外卖正在给您派送了'
    .then(res => console.log(res))
    // 菜烧糊了执行，返回'不好意思，我们菜烧糊了，您再等一会'
    .catch(res => console.log(res))

```

### 基本用法
Promise 对象是一个构造函数，用来生成一个Promise实例。

```javascript
    Promis构造函数接受一个函数作为参数，这个函数有两个参数，分别是resolve()和reject()。

    resovle()函数是将Promise对象从pending变成fulfilled，在异步操作完成时执行，将异步结果，作为参数传递出去。

    reject()函数是将Promise对象从pending变成rejected，在异步执行失败时执行，将报错信息，作为参数传递出去。

    // 简单的一个promise实例， 来自阮一峰老师的es6 示例代码
    const promise = new Promise((resolve, reject) => {
        // some code 

      if(/* 异步执行成功 */) {
        resolve(res)
      } else {
        reject(error)
      }
    })
```
### then方法
Promise 有个.then()方法，then 方法中的回调在微任务队列中执行，支持传入两个参数，一个是成功的回调，一个是失败的回调，在 Promise 中调用了 resolve 方法，就会在 then 中执行成功的回调，调用了 reject 方法，就会在 then 中执行失败的回调，成功的回调和失败的回调只能执行一个，resolve 和 reject 方法调用时传入的参数会传递给 then 方法中对应的回调函数。

```javascript
    // 执行 resolve  
    let promise = new Promise((resolve, reject) => {
      console.log(1)
      resolve(3)
    })

    console.log(2)

    promise.then((data)=>{
      console.log(data)
    }, (err)=>{
      console.log(err)
    })

    // 1
    // 2
    // 3
```
```javascript
    // 执行 reject  
    let promise = new Promise((resolve, reject) => {
        console.log(1)
        reject()
    })

    promise.then(() => {
      console.log(2)
    }, () => {
      console.log(3)
    })

    // 1
    // 3
```

### then方法
[ 注意 ： then方法中的回调是异步的！！！]

为什么上面第一个示例代码的结果是 1 -> 2 -> 3呢 ？传入Promise 中的执行函数是立即执行完的啊，为什么不是立即执行 then 中的回调呢？__因为 then 中的回调是异步执行，表示该回调是插入事件队列末尾，在当前的同步任务结束之后，下次事件循环开始时执行队列中的任务__。

Promise 的回调函数不是正常的异步任务，而是 `微任务（microtask）`。它们的区别在于 : *正常任务追加到下一轮事件循环，微任务追加到本轮事件循环*。这意味着，微任务的执行时间一定早于正常任务

__then方法的返回值是一个新的GPromise对象，这就是为什么promise能够进行链式操作的原因__。

> then方法中的一个难点就是处理异步，通过 `setInterval` 来监听 `GPromise` 对象的状态改变，一旦改变，就是执行GPromise对应的the方法中相应回调函数。这样回调函数就能够插入事件队列末尾，异步执行。

```javascript
    then有两个参数 : onFulfilled 和 onRejected
    
    · 当状态state为fulfilled，则执行onFulfilled，传入this.value。当状态state为rejected，则执行onRejected，传入this.reason

    · onFulfilled,onRejected如果他们是函数，则必须分别在fulfilled，rejected后被调用，value或reason依次作为他们的第一个参数

    class Promise{
      constructor(executor){...}
      // then 方法 有两个参数onFulfilled onRejected
      then(onFulfilled,onRejected) {
        // 状态为 fulfilled ，执行 onFulfilled，传入成功的值
        if (this.state === 'fulfilled') {
          onFulfilled(this.value)
        }
            
        // 状态为 rejected ，执行 onRejected，传入失败的原因
        if (this.state === 'rejected') {
          onRejected(this.reason)
        }
      }
    }

```

### Promise的链式调用
由于promise每次调用then方法就会返回一个新的promise对象，如果该then方法中执行的回调函数有返回值，那么这个返回值就会作为下一个promise实例的then方法回调的参数，如果 then 方法的返回值是一个 Promise 实例，那就返回一个新的 Promise 实例，将 then 返回的 Promise 实例执行后的结果作为返回 Promise 实例回调的参数。

还记得刚开头说的那个“陌生”男人例子吗 ？这里我们用promise的链式操作重写下

```javascript
    // 原来的代码
    getUserInfo((res) => {
      getConnectList(res.user_id, (list) => {
        getOneManConnect(list.one_man_id, (message) => {
          console.log('这是我和某位老男人的聊天记录')
        }, (msg_err)=>{
          console.log('获取详情失败，别污蔑我，我不跟老男人聊天')
        })
      }, (list_err) => {
        console.log('获取列表失败，我都不跟别人聊天')
      })
    }, (user_err) => {
      console.log('获取用户个人信息失败')
    })

    
    // Promise重写的代码
    function handleAjax (params) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: params.url,
          type: params.type || 'get',
          data: params.data || '',
          success: function(data) {
            resolve(data)
          },
          error: function(error) {
            reject(error)
          }
        })
      })
    }

    const promise = handleAjax({
      url: 'xxxx/user'
    });

    promise.then((data1)=>{
      console.log('获取个人信息成功')       // 获取个人信息成功
      return handleAjax({
        url: 'xxxx/user/connectlist',
        data: data1.user_id
      })
    })
    .then((data2)=>{
      console.log('获得聊天列表')
      return handleAjax({
        url : 'xxxx/user/connectlist/one_man',
        data : data2.one_man_id
      })
    })
    .then((data3)=>{
      console.log('获得跟某男人聊天')
    })
    .catch((err)=>{
      console.log(err)
    }) 
```

### 敲重点, reject 和 catch 的区别 ?
看下图片 ？

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/promise-1.png' width='700' height='550'>

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/promise2.png' width='700' height='550'>

首先纠正一个误区 : 谁说 reject 是用来处理异常的了 , `reject` 是用来抛出异常的，`catch` 才是用来处理异常的, 类比传统的 try catch 写法，reject 就相当于 throw

并且 `reject` 是 Promise 的方法，而 `catch` 是 Promise 实例的方法
```javascript
  let p = new Promise()
  p.resolve() // 没有
  p.reject() // 没有
  p.then() // 有
  p.catch() // 有

  Promise.resolve() // 有
  Promise.reject() // 有
  Promise.then() // 没有
  Promise.catch() // 没有
```

```javascript
  resolve后的东西，一定会进入then的第一个回调，肯定不会进入catch
  
  var p0 = new Promise((resolve, reject) => {
    console.log('有 resolve')
    resolve('I am resolve')
  })

  p0.then(res => {
    console.log('resolve的返回值: ', res)
  }).catch(err => {
    console.log('catch的返回值: ', err)
  })

  // 执行结果
  VM367054:2 有 resolve
  VM367054:11 reject的返回值: I am resolve 
  

  ----------------------


  reject后的东西，一定会进入then中的第二个回调，如果then中没有写第二个回调，则进入catch，如果没有then，也可以直接进入catch

  // 情况一，then中有第二个回调
  var p1 = new Promise((resolve, reject) => {
    console.log('没有 resolve')
    reject('I am error')
  })

  p1.then(res => {
    console.log('resolve的返回值: ', res)
  }, error => {
    console.log('reject的返回值: ', error)
  }).catch(err => {
    console.log('catch的返回值: ', err)
  })

  // 执行结果
  VM367054:2 没有 resolve
  VM367054:11 reject的返回值: I am error 



  // 情况二，then中没有第二个回调
  var p2 = new Promise((resolve, reject) => {
    console.log('没有 resolve')
    reject('I am error')
  })

  p2.then(res => {
    console.log('resolve的返回值: ', res)
  }).catch(err => {
    console.log('catch的返回值: ', err)
  })

  // 执行结果
  VM367054:2 没有 resolve
  VM367054:11 catch的返回值: I am error 



  // 情况二，没有then，直接进入catch
  var p3 = new Promise((resolve, reject) => {
    console.log('没有 resolve')
    reject('I am error')
  })

  p3.catch(err => {
    console.log('catch的返回值: ', err)
  })
  
  // 执行结果
  VM367054:2 没有 resolve
  VM367054:11 catch的返回值: I am error 

```

### 来自ES6的 Promise.prototype.then() 
Promise 实例具有then方法，也就是说，then方法是定义在原型对象Promise.prototype上的。它的作用是为 Promise 实例添加状态改变时的回调函数。前面说过，then方法的第一个参数是resolved状态的回调函数，第二个参数（可选）是rejected状态的回调函数。then方法返回的是一个新的Promise实例（注意，不是原来那个Promise实例）。因此可以采用链式写法，即then方法后面再调用另一个then方法。

> 采用链式的then，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个Promise对象（即有异步操作），这时后一个回调函数，就会等待该Promise对象的状态发生变化，才会被调用

### 来自ES6的 Promise.prototype.catch() 
Promise.prototype.catch方法是.then(null, rejection)的别名，用于指定发生错误时的回调函数。Promise对象状态变为resolved，则会调用then方法指定的回调函数；如果异步操作抛出错误，状态就会变为rejected，就会调用catch方法指定的回调函数，处理这个错误。另外，then方法指定的回调函数，如果运行中抛出错误，也会被catch方法捕获。Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个catch语句捕获

> 一般来说，不要在then方法里面定义 reject 状态的回调函数（即then的第二个参数），总是使用catch方法。

### 来自ES6的 Promise.all()
Promise.all方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。
```javascript
    const p = Promise.all([p1, p2, p3])
```
Promise.all方法接受一个数组作为参数，p1、p2、p3都是 Promise 实例，如果不是，就会先调用下面讲到的Promise.resolve方法，将参数转为 Promise 实例，再进一步处理。

```javascript
p的状态由p1、p2、p3决定，分成两种情况。

（1）只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。

（2）只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。
```

### 来自ES6 的Promise.race()
Promise.race方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。
```javascript
    const p = Promise.race([p1, p2, p3])
```
上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数

Promise.race方法的参数与Promise.all方法一样，如果不是 Promise 实例，就会先调用下面讲到的Promise.resolve方法，将参数转为 Promise 实例，再进一步处理。

### 来自ES6 的Promise.resolve()
有时需要将现有对象转为 Promise 对象，Promise.resolve方法就起到这个作用
```javascript
    Promise.resolve('test')
    // 等价于
    new Promise(resolve => resolve('test'))

    // 更多请看阮一峰老师的ES6 Promise对象
```

### 来自ES6 的Promise.reject()
Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected。
```javascript
    const p = Promise.reject('出错了');
    // 等同于
    const p = new Promise((resolve, reject) => reject('出错了'))

    p.then(null, function (err) {
        console.log(err)    // 出错了
    });
    
    // 更多请看阮一峰老师的ES6 Promise对象
```

## 相关链接
个人博客 : http:/blog.pengdaokuan.cn:4001

MDN Promise : https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise

阮一峰 ES6 : http://es6.ruanyifeng.com/#docs/promise

知乎例子 : https://zhuanlan.zhihu.com/p/29632791

掘金 卡姆爱卡姆 : https://juejin.im/post/5b2f02cd5188252b937548ab

来自segmentfault 的GEEK作者 : https://segmentfault.com/a/1190000011241512 

其他来源 : https://segmentfault.com/q/1010000014040649
