## 超时调用和间歇调用
JavaScript 是单线程语言，但它允许通过设置超时值和间歇时间值来调度代码在特定的时刻执行。 前者是在指定的时间过后执行代码，而后者则是每隔指定的时间就执行一次代码

超时调用需要使用 window 对象的 setTimeout()方法，它接受两个参数:要执行的代码和以毫秒表示的时间(即在执行代码前需要等待多少毫秒)。其中，第一个参数可以是一个包含 JavaScript 代码的字符串)，也可以是一个函数。例如，下面对 setTimeout() 的两次调用都会在一秒钟后显示一个警告框。

```javascript
  // 不建议传递字符串
  setTimeout('alert("Hello World")', 1000)

  // 推荐的调用方式
  setTimeout(function () {
    alert("Hello World")
  }, 1000)
```
虽然这两种调用方式都没有问题，但由于<strong>传递字符串可能导致性能损失</strong>，因此不建议以字符串作为第一个参数。这也是内存泄漏的原因之一

第二个参数是一个表示`等待多长时间的毫秒数`，*但经过该时间后指定的代码不一定会执行*。 JavaScript 是一个单线程序的解释器，因此一定时间内只能执行一段代码。为了控制要执行的代码，就有一个 JavaScript 任务队列。这些任务会按照将它们添加到队列的顺序执行。

setTimeout()的第二个参数告诉 JavaScript 再过多长时间把当前任务添加到队列中。如果队列是空的，那么添加的代码会立即执行; 如果队列不是空的，那么它就要等前面的代码执行完了以后再执行

<strong>你不知道的 setTimeout 之 delay = 0 和 第三个参数</strong>
```javascript
  setTimeout(() => {
    // code
  }, 0)

  // 虽然 setTimeout 延时 delay = 0，但是它还是异步。这是因为 HTML5 标准规定这个函数第二个参数不得小于 4 毫秒，不足会自动增加。

  // setTimeout 的第三个以后的参数是作为第一个func()的参数传进去，比如下边的代码
  function sum (x, y, z) {
    console.log(x+y+z)
  }

  setTimeout(sum, 1000, 1, 2, 3) 
  // 883  这是 setTimeout的 timeId
  // 6    这是执行setTimeout的结果

```
调用 setTimeout()之后，该方法会返回一个数值 ID，表示超时调用。这个超时调用 ID 是计划执行代码的唯一标识符，可以通过它来取消超时调用。要取消尚未执行的超时调用计划，可以调用 clearTimeout()方法并将相应的超时调用 ID 作为参数传递给它

```javascript
  //设置超时调用
  var timeoutId = setTimeout(function() {
    alert("Hello world!")
  }, 1000)
  //把它取消 
  clearTimeout(timeoutId)
```

间歇调用与超时调用类似，只不过它会按照指定的时间间隔重复执行代码，直至间歇调用被取消或 者页面被卸载。设置间歇调用的方法是 setInterval()，它接受的参数与 setTimeout()相同: 要执行的代码(字符串或函数)和每次执行之前需要等待的毫秒数

>  setInterval 的第三个以后的参数是作为第一个func()的参数传进去

```javascript
  // 不建议传递字符串
  setInterval('alert("Hello World")', 10000)

  // 推荐的调用方式
  setInterval(function () {
    alert("Hello World")
  }, 10000)
```
调用 setInterval()方法同样也会返回一个间歇调用 ID，该 ID 可用于在将来某个时刻取消间歇调用。要取消尚未执行的间歇调用，可以使用 clearInterval()方法并传入相应的间歇调用 ID。__取消间歇调用的重要性要远远高于取消超时调用__，因为在不加干涉的情况下，间歇调用将会一直执行到页面卸载

### 为什么要用setTimeout模拟setInterval ?
我们需要知道，`浏览器`是个`多线程`应用，而Javascript是个`单线程`语言，当JS引擎执行代码块如setTimeOut时（也可来自浏览器内核的其他线程,如鼠标点击、AJAX异步请求等），会将对应任务添加到事件线程中。 由于JS的单线程关系，所以这些待处理队列中的事件都得排队等待JS引擎处理（当JS引擎空闲时才会去执行）

> 再次强调，定时器指定的时间间隔，表示的是何时将定时器的代码添加到消息队列，而不是何时执行代码。所以真正何时执行代码的时间是不能保证的，取决于何时被主线程的事件循环取到，并执行。

我们来看个例子: 
```javascript
  setInterval(function() {
    // code ...
  }, 100)
```
<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/js-red-eight-1.png'>

<ol>
  <li>setInterval每隔100ms往队列中添加一个事件; 100ms 后，添加T1定时器至Task队列中，主线程中的执行栈有任务在执行，所以等待。</li> 
  <li>some event 执行结束后，执行栈为空，于是去Task队列中拿出需要执行的代码，放至执行栈中执行，所以some event 执行结束后执行T1定时器代码</li> 
  <li>又过了100ms，T2定时器被添加到Task队列中，主线程还在执行T1代码，所以等待；</li>
  <li>又过了100ms，理论上又要往Task队列中推一个定时器代码，但<strong>由于此时T2还在队列中，所以T3不会被添加，结果就是跳过</strong></li>
  <li>而且这里我们能够看到，T1定时器执行结束后立即执行了T2代码，所以并没有达到定时器的效果</li>
</ol>
所以我们能知道，setInterval有两个缺点:
- 使用setInterval时，某些间隔会被跳过
- 可能多个定时器会连续执行

所以我们这么理解: <strong>每个setTimeout产生的任务会直接push到任务队列中；而setInterval在每次把任务push到任务队列前，都要进行一下判断(看上次的任务是否仍在队列中，在则跳过，不在则添加至Task队列)</strong>

你可能需要看下这篇文章: [Event loop](https://github.com/PDKSophia/blog.io/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8%E7%AF%87-Event-Loop.md)

### 如何模拟？
setTimeout模拟setInterval，也可理解为链式的setTimeout
```javascript
  setTimeout(function() {
    // 任务
    setTimeout(arguments.callee, delay)
  }, delay)
```
