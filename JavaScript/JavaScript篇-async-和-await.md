---
title: JavaScript篇-async 和 await
date: 2018-08-30 15:02:48
tags:
---
关于异步处理，ES5的回调使我们陷入地狱，ES6的Promise使我们脱离魔障，终于、ES7的async-await带我们走向光明。今天就来学习一下 async-await。

### 基本用法
```javascript
    async function demo () {
        let result = await Math.random();
        console.log(result)
    }

    demo()      // 0.9552660768336405
                // 返回一个Promise对象
```
感觉加没加都一个样，那我还用它干什么 ？

### async
`async`用来表示函数是异步的，定义的函数会返回一个promise对象，可以使用then方法添加回调函数
```javascript
    async function demo1 () {
        return 111;
    }

    demo1().then((val) => {
        console.log(val)        // 111
    })
```

### await
`await` 可以理解为是 async wait 的简写。await 必须出现在 async 函数内部，不能单独使用!!!
```javascript
    function errorDemo2() {
        await Math.random()
    }

    errorDemo2()            // 会报错
```
### 简单的例子
```javascript
    function demo4 (delay1) {
        return new Promise ((resolve, reject)=>{
            setTimeout(()=>{
                resolve('I am demo4')
            }, delay1)
        })
    }

    function demo5 (delay2) {
        console.log('想不到吧')
        setTimeout(()=>{
            console.log('I am demo5')
        }, delay2)
    }

    async function demo6() {
        await demo5(1000)

        console.log('嘻嘻嘻')

        let result = await demo4(2000)
        console.log(result)
    }

    demo6()
    
    // 想不到吧
    // 嘻嘻嘻
    // I am demo5
    // I am demo4
    
```
<!--more-->
await 会等待 sleep 函数 resolve ，所以即使后面是同步代码，也不会先去执行同步代码再来执行异步代码。

调用 demo6 函数，它里面遇到了await, await 表示等一下，代码就暂停到这里，不再向下执行了，它等什么呢？等后面的promise对象执行完毕，然后拿到promise resolve 的值并进行返回，返回值拿到之后，它继续向下执行，而promise的.then是一个异步操作，加入到task队列中。换个角度来将，await之后一定能够拿到async，也就是promise请求后的值

async 和 await 相比直接使用 Promise 来说，优势在于处理 then 的调用链，能够更清晰准确的写出代码。缺点在于滥用 await 可能会导致性能问题，因为 await 会阻塞代码，也许之后的异步代码并不依赖于前者，但仍然需要等待前者完成，导致代码失去了并发性。

### 实例
如果看过我Promise那篇的，应该还记得“陌生”男人这个梗，继续用async await来说这个。

我们需要拿到了用户信息，但是我们还要拿到该用户的聊天列表，然后再拿到跟某一“陌生”男人的聊天记录呢 ?

```javascript
    function handleAjax (params) {
        return new Promise((resolve, reject)=>{
            $.ajax({
                url : params.url,
                type : params.type || 'get',
                data : params.data || '',
                success : function(data) {
                    resolve(data)
                },
                error : function(error) {
                    reject(error)
                }
            })
        })
    }
    
    async function demo7 () {
        let p1 = await handleAjax({url : './user'})

        let p2 = await handleAjax({
            url : './user/connectlist', 
            data : p1.user_id
        })

        let p3 = await handleAjax({
            url : './user/connectlist', 
            data : p2.one_man_id
        })
    }

    demo7()

    // 认真观察下代码就能看到。请求是一个结束后，再执行下一个请求。p2等p1执行完，p3等p2执行完
```
### 错误处理
reject情况下我们怎么处理？正确答案是给个 try catch 包裹一下
```javascript
    function demo8 (delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('I am demo8 ');
            }, delay);
        })
    }

    async function demo9 () {
        let t1 = await demo8(1000)
        console.log(t1)
    }

    demo9()     // I am demo8

    // 为了处理Promise.reject 的情况我们应该将代码块用 try catch 包裹一下
    async function demo10 () {
        try {
            let t1 = await demo8(1000)
            console.log(t1)
        } catch (err) {
            console.log(err)
        }
    }
```
### 相关链接
来自 segmentfault 的作者一步 : https://segmentfault.com/a/1190000011526612

