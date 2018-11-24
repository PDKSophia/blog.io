## 函数绑定

函数绑定要创建一个函数，可以在特定的 this 环境中以指定参数调用另一个函数。该技巧常常和回调函数与事件处理程序一起使用，以便在将函数作为变量传递的同时保留代码执行环境。我们来看段代码:

```javascript
  EventUtil: {
    /*
     * desc: 视情况而定使用不同的事件处理程序
     * @param : element，要操作的元素
     * @param : type，事件名称
     * @param : handler，事件处理程序函数
    */
    addHandler: function (element, type, handler) {
      if (element.addEventListener) { // DOM2级
        element.addEventListener(type, handler, false)
      } else if (element.attachEvent) { // IE级
        element.attachEvent(`on${type}`, handler)
      } else {
        element[`on${type}`] = handler // DOM0级
      }
    }
  }

  var handler = {
    message: 'I am message',

    handleClick: function () {
      console.log(this.message)
    }
  }

  var btn = document.getElementById('click-btn')
  EventUtil.addHandler(btn, 'click', handler.handleClick)

```
正常来讲，当我们按下这个按钮的时候，就调用 `handler.handleClick()` 函数，打印 ' I am message '，但是实际上显示的是 " undefined "，为什么呢？

问题就在于没有保存 handler.handleClick() 的环境，所以 this 对象最后是指向了 DOM按钮 而不是 handler对象。所以通过一个闭包，来解决这个问题，[不知道闭包的点击这里！！！](https://github.com/PDKSophia/read-booklist/blob/master/JavaScript%E9%AB%98%E7%BA%A7%E7%BC%96%E7%A8%8B%E8%AE%BE%E8%AE%A1/play-card-4.md#%E9%97%AD%E5%8C%85)

```javascript
  var handler = {
    message: 'I am message',

    handleClick: function () {
      console.log(this.message)
    }
  }
  
  var btn = document.getElementById('click-btn')
  EventUtil.addHandler(btn, 'click', function (event) {
    handler.handleClick(event)
  })
```
这个解决方案就是在 onclick 事件处理程序中，使用了一个闭包直接调用 handler.handleClick()，在 JavaScript 库中实现了一个可以将函数绑定到执行环境的函数中，这个函数叫做 `bind()`

bind()函数是在 ES5 才被加入；它可能无法在所有浏览器上运行。这就需要我们自己实现bind()函数了。自己实现一个 bind() ？ 先不急，我们再来看一个概念，叫做: 函数柯里化 ！！！

### 函数柯里化
它用于创建已经设置好了一个或多 个参数的函数。函数柯里化的基本方法和函数绑定是一样的: 使用一个闭包返回一个函数。两者的区别在于 : <strong>当函数被调用时，返回的函数还需要设置一些传入的参数</strong>

```javascript
  function add (num1, num2) {
    return num1 + num2
  }

  function curriedAdd(num2) {
    return add(5, num2)
  }

  console.log(add(2, 3))        // 5
  console.log(curriedAdd(3))    // 8
```
这段代码定义了两个函数: add() 和 curriedAdd()。后者本质上是在任何情况下第一个参数为 5 的 add()版本。尽管从技术上来说 curriedAdd()并非柯里化的函数，但它很好地展示了其概念。

柯里化函数通常由以下步骤动态创建 : 调用另一个函数并为它传入要柯里化的函数和必要参数。下面是创建柯里化函数的通用方式。

```javascript
  function curry (fn) {
    var args = Array.prototype.slice.call(arguments, 1)
    return function () {
      var innerArgs = Array.prototype.slice.call(arguments)
      var finalArgs = args.concat(innerArgs)
      return fn.apply(null, finalArgs)
    }
  }
```
curry() 函数的主要工作就是将被返回函数的参数进行排序。curry() 的第一个参数是要进行柯里化的函数，其他参数是要传入的值。为了获取第一个参数之后的所有参数，在 arguments 对象上调用了 slice()方法，并传入参数 1 表示被返回的数组包含从第二个参数开始的所有参数。

然后 args 数组包含了来自外部函数的参数。在内部函数中，创建了 innerArgs 数组用来存放所有传入的参数(又一次用到了 slice())。有了存放来自外部函数和内部函数的参数数组后，就可以使用 concat() 方法将它们组合为 finalArgs，然后使用 apply() 将结果传递给该函数。注意这个函数并没有考虑到执行环境，所以调用 apply()时第一个参数是 null。curry()函数可以按以下方式应用

```javascript
  function add (num1, num2) {
    return num1 + num2
  }

  var curriedAdd = curry(add, 5)
  console.log(curriedAdd(3)) // 8
```
在这个例子中，创建了第一个参数绑定为 5 的 add()的柯里化版本。当调用 curriedAdd()并传入 3 时，3 会成为 add() 的第二个参数，同时第一个参数依然是 5，最后结果便是和 8。你也可以像下面例子这样给出所有的函数参数

```javascript
  function add (num1, num2) {
    return num1 + num2
  }

  var curriedAdd = curry(add, 5, 12)
  console.log(curriedAdd())  // 17
```
在这里，柯里化的 add()函数两个参数都提供了，所以以后就无需再传递它们了。

#### 结合函数柯里化的情况，实现一个_bind()函数

```javascript
  // 写法一
  Function.prototype._bind = function (context) {
    var args = Array.prototype.slice.call(arguments, 1) // 表示被返回的数组包含从第二个参数开始的所有参数。
    var self = this // 保存this，即调用_bind方法的目标函数
    return function () {
      var innerArgs = Array.prototype.slice.call(arguments)
      var finalArgs = args.concat(innerArgs)
      return self.apply(context, finalArgs)
    }
  }

  // 写法二
  function _bind (fn, context) {
    var args = Array.prototype.slice.call(arguments, 2) // 表示被返回的数组包含从第三个参数开始的所有参数。
    return function () {
      var innerArgs = Array.prototype.slice.call(arguments)
      var finalArgs = args.concat(innerArgs)
      return fn.apply(context, finalArgs)
    }
  }
```
所以这时候我们通过绑定函数给之前的例子重写一下，就能正常了～
```javascript
  var handler = {
    message: 'I am message',

    handleClick: function (name, event) {
      console.log(this.message + ':' + name + ':' + event.type)
    }
  }
  
  var btn = document.getElementById('click-btn')
  EventUtil.addHandler(btn, 'click', _bind(handler.handleClick, handler, 'btn'))
```
在这个更新过的例子中，handler.handleClick() 方法接受了两个参数: 要处理的元素的名字和 event 对象。作为第三个参数传递给 bind()函数的名字，又被传递给了 handler.handleClick()， 而 handler.handleClick() 也会同时接收到 event 对象。
