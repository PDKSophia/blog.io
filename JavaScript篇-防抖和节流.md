---
title: JavaScript篇-防抖和节流
date: 2018-10-08 15:29:30
tags:
---
## 抖动和节流
### 防抖
其实就是将若干次函数调用合成一次，并在给定的事件过去之后仅被调一次，举个例子 ：比如我们给container监听sroll事件，那么只要滚动条滚动，即使才滚动1px，都会触发对应的函数。但高频的执行该函可能会影响性能。
所以防抖动的做法就是限制下次函数调用之前必须等待的事件间隔，将几次操作合并为一次操作进行。

原理是维护一个计时器，规定在delay时间后触发函数，但是在delay时间内再次触发的话，就会取消之前的计时器而重新设置。这样一来，只有最后一次操作能被触发。（听不懂看下边的讲解）

```javascript
    // 包装事件的 todo 函数
    function todo (func, delay) {
        // 定义一个timer
        let timer = null
        // 返回一个函数，在函数中调用需要触发的func 
        return function () {
            // 通过 this 和 arguments 获取函数的作用域和变量, arguments[0] = func ， arguments[1] = delay
            let _this = this
            let argsArray = arguments

            clearTimeout(timer)
            timer = setTimeout(()=>{
                func.apply(_this, argsArray)
            }, delay)
        }
    }

    // 当用户滚时候调用的函数
    function handleScroll () {
        console.log('I am scrolling')
    }

    let el = document.getElementById('container')
    el.addEventListener('scroll', todo(handleScroll, 3000))

    讲解一下 
    首先，我们获得container元素，并监听scroll事件，执行tod函数，传入handleScroll 和 延迟时间，这时的todo函数会立即调用，因此给scroll事件绑定的函实际上todo内部返回的函数！！

    每一次事件触发，都会清除当前的timer然后重新设超时调用，导致事件处理程序不能被触发，也就是说3s 之后执行的timer被重新设置为3s，然后可能过了2s，还有1就是要执行了，但是这时候又再一触发，将timer重新设置，于是handleScrol一直不能被触发

    当高频率的scroll事件停止，最后一次事件触发的超时调用才能在delay时间后执行

```

### 节流
节其实就是另一种处理类似问题的解决方法

<!--more-->
节流函允许一个函数在规定的时间只执行一次，它跟防抖动的区别在于，节流函数不管多繁忙，都会规定时间内，执行一次事件处理函数

比如在页面的无限加载中，用户在滚动页面时，每隔一段时间，都要发送一次ajax请求，而不应该是用户停下滚动页面之后才去做请求处理。这种场景应该使用节流技术实现。

```javascript
    //采用节流无限加载数据

    // 时间戳的实现
    function timestamp (func, delay) {
        let pre_time = Date.now()

        return function() {
            let _this = this
            let argsArray = arguments
            let now_time = Date.now()
            if(now_time - pre_time >= delay) {
                func.apply(_this, argsArray)
                pre_time = Date.now()
            }
        }
    }

    // 定时器    
    function todo (func, delay) {
        let timer = null

        return function() {
            let _this = this
            let argsArray = arguments
            if(!timer) {
                tiemr = setTimeout(()=>{
                    func.apply(_this, argsArray)
                    timer = null
                }, delay)
            } else {
                console.log('定时器存在，不操作')
            }
        }
    }


    // 综合使用 “ 定时器 + 时间戳 ” ，完成一事件触发时立执行,触发完毕还能执行一次的节流函数：
    function comprehensive (func, delay) {
        let timer = null
        let startTime = Date.now()

        return function () {
            let currentTime = Date.now()
            let _this = this
            let argsArray = arguments
            let remainTime = delay - (currentTime - startTime)

            clearTimeout(timer)
            if(remainTime <= 0) {
                func.apply(_this, argsArray)
                startTime = Date.now()
            } else {
                timer = setTimeout(func, remainTime)
            }
        }
    }

    讲解一下
    时间戳 ：给事件绑定函数与真正触发事件的间隔如果大于delay的，就会执行触发事件，而后再怎么频繁地触发事件，都会每delay秒之后才执行一次。

   定时器 ：其实就维护一个timer，一开始为null，假设delay = 3000， 所以在3秒之后会执行触发事件函数，而用户滚动过程，监听scroll事件，那又会高频触发todo第秒触发todo时，因为timer还未执行，未重新设定，所以定时器存在，打印出 “定时器存在，不操作” ，直到3秒后，定时器执行函数，清空定时器，设定下一个定时器。
    
    当最后一次停止触发后，由于定时器的delay延迟，可能还会执行一次函数
```
