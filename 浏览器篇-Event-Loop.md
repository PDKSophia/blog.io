---
title: 浏览器篇-Event Loop
date: 2018-10-08 15:38:13
tags: Event、JavaScript
---
## Event Loop
众所周知 JS 是门`非阻塞单线程`语言，因为在最初 JS 就是为了和浏览器交互而诞生的。如果 JS 是门多线程的语言话，我们在多个线程中处理 DOM 就可能会发生问题（一个线程中新加节点，另一个线程中删除节点），当然可以引入读写锁解决这个问题

JS 在执行的过程中会产生执行环境，这些执行环境会被顺序的加入到执行栈中。如果遇到异步的代码，会被挂起并加入到 Task（有多种 task） 队列中。一旦`执行栈`为空，Event Loop 就会从 Task 队列中拿出需要执行的代码并放入执行栈中执行，所以本质上来说 JS 中的异步还是同步行为

```javascript
    console.log('start')

    setTimeout(function () {
        console.log('I am setTimeout')
    }, 0)

    console.log('end')

    // start
    // end
    // I am setTimeout

```
以上代码虽然 setTimeout 延时为 0，其实还是异步。这是因为 HTML5 标准规定这个函数第二个参数不得小于 4 毫秒，不足会自动增加。所以 setTimeout 还是会在 script end 之后打印

不同的任务源会被分配到不同的 Task 队列中，任务源可以分为 `微任务`（microtask）和 `宏任务`（macrotask）。在 ES6 规范中，microtask 称为 jobs，macrotask 称为 task, 比如ES6中的Promise异步属于微任务

```javascript
    console.log('start')

    setTimeout(function () {
      console.log('I am setTimeout')
    }, 0)

    new Promise((resovle, reject) => {
      console.log('Promise')
      resolve()
    }).then((res) => {
      console.log('promise 1')
    }).then((res) => {
      console.log('promise 2')
    })

    console.log('end')

    // start
    // Promise
    // end
    // promise 1
    // promise 2
    // I am setTimeout
```

上述代码首先执行同步代码的start，之后遇到setTimeout，由于setTimeout是宏任务，也就是放到Task队列中，接着执行同步代码new Promise，打印  ' Promise ' ，Promise 属于微任务，同样被放在Task队列中，接着执行同步代码end，之后执行栈为空，Event Loop 就会从 Task 队列中拿出需要执行的代码并放入执行栈中执行，这里有个误区，认为微任务快于宏任务，其实是错误的。因为宏任务中包括了 script ，浏览器会先执行一个宏任务，接下来有异步代码的话就先执行微任务

```javascript
  所以正确的一次 Event loop 顺序是这样的

   1 . 执行同步代码，这属于宏任务
   2 . 执行栈为空，查询是否有微任务需要执行
   3 . 执行所有微任务(微任务是追加在本轮循环中的)
   4 . 必要的话渲染 UI
   5 . 然后开始下一轮 Event loop，执行宏任务中的异步代码


   通过上述的 Event loop 顺序可知，如果宏任务中的异步代码有大量的计算并且需要操作 DOM 的话，为了更快的 界面响应，我们可以把操作 DOM 放入微任务中。

```
