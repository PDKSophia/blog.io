---
title: JavaScript篇-防抖和节流
date: 2018-10-08 15:29:30
tags:
---
## 抖动和节流
### 防抖
其实就是将若干次函数调用合成一次，并在给定的时间过去之后仅被调一次，举个例子 ：比如我们给container监听sroll事件，那么只要滚动条滚动，即使才滚动1px，都会触发对应的函数。但高频的执行该函可能会影响性能。
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
    首先，我们获得container元素，并监听scroll事件，执行todo函数，传入handleScroll 和 延迟时间，这时的todo函数会立即调用，因此给scroll事件绑定的函实际上todo内部返回的函数！！

    每一次事件触发，都会清除当前的timer然后重新设超时调用，导致事件处理程序不能被触发，也就是说3s 之后执行的timer被重新设置为3s，然后可能过了2s，还有1就是要执行了，但是这时候又再一触发，将timer重新设置，于是handleScrol一直不能被触发

    当高频率的scroll事件停止，最后一次事件触发的超时调用才能在delay时间后执行

```

### 节流
DOM 操作比起非 DOM 交互需要更多的内存和 CPU 时间。连续尝试进行过多的 DOM 相关操作可能会导致浏览器挂起，有时候甚至会崩溃。尤其在 IE 中使用 onresize 事件处理程序的时候容易发生，当调整浏览器大小的时候，该事件会连续触发。 在 onresize 事件处理程序内部如果尝试进行 DOM 操作，其高频率的更改可能会让浏览器崩溃

函数节流背后的基本思想是指 ：<strong>某些代码不可以在没有间断的情况连续重复执行</strong>。第一次调用函数，创建一个定时器，在指定的时间间隔之后运行代码。当第二次调用该函数时，它会清除前一次的定时器并设置另一个。如果前一个定时器已经执行过了，这个操作就没有任何意义。然而，如果前一个定时器尚未执行，其实就是将其替换为一个新的定时器。__目的是只有在执行函数的请求停止了一段时间之后才执行__。

```javascript
  var processor = {
    timeoutId: null,

    // 实际进行处理的方法
    performProcessing: function () {
      // 实际执行带代码
    },

    // 初始化处理调用的方法
    process: function () {
      clearTimeout(this.timeoutId)

      var _this = this
      this.timeoutId = setTimeout(function () {
        _this.performProcessing
      }, 100)
    }
  }

  // 尝试开始执行
  processor.proccess()
```
当调 用了 process()，第一步是清除存好的 timeoutId，来阻止之前的调用被执行。然后，创建一个新的定时器调用 performProcessing()。由于 setTimeout()中用到的函数的环境总是 window，所以有必要保存 this 的引用以方便以后使用。

时间间隔设为了 100ms，这表示最后一次调用 process()之后至少 100ms 后才会调用 performProcessing()。所以如果 100ms 之内调用了 process()共 20 次，performanceProcessing()仍只 会被调用一次。

这个模式可以使用 `throttle()` 函数来简化，这个函数可以自动进行定时器的设置和清除，如下例所示:
```javascript
  function throttle (method, context) {
    clearTimeout(method.tId)

    method.tId = setTimeout(function () {
      method.call(context)
    }, 100)
  }
```
throttle()函数接受两个参数: __要执行的函数以及在哪个作用域中执行__。

上面这个函数首先清除之前设置的任何定时器。定时器 ID 是存储在函数的 tId 属性中的，第一次把方法传递给 throttle() 的时候，这个属性可能并不存在。接下来，创建一个新的定时器，并将其 ID 储存在方法的 tId 属性中。 如果这是第一次对这个方法调用 throttle() 的话，那么这段代码会创建该属性。定时器代码使用 call()来确保方法在适当的环境中执行。如果没有给出第二个参数，那么就在全局作用域内执行该方法。

*节流在 resize 事件中是最常用的*, 例如，假设有一个`<div/>`元素需要保持它的高度始终等同于宽度。那么实现这一功能的 JavaScript 可以如下编写
```javascript
  window.onresize = function () {
    var div = document.getElementById('myDiv')
    div.style.height = div.offsetWidth + 'px'
  }
```
这段非常简单的例子有两个问题可能会造成浏览器运行缓慢。首先，要计算 offsetWidth 属性， 如果该元素或者页面上其他元素有非常复杂的 CSS 样式，那么这个过程将会很复杂。其次，设置某个元素的高度需要对页面进行回流来令改动生效。如果页面有很多元素同时应用了相当数量的 CSS 的话，这又需要很多计算。这就可以用到 throttle()函数

```javascript
  function throttle (method, context) {
    clearTimeout(method.tId)

    method.tId = setTimeout(function () {
      method.call(context)
    }, 100)
  }
  
  function resizeDiv () {
    var div = document.getElementById('myDiv')
    div.style.height = div.offsetWidth + 'px'
  }

  window.onresize = function () {
    throttle(resizeDiv)
  }
```

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
