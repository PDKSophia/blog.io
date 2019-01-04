---
title: JavaScript篇-闭包
date: 2018-10-08 15:23:45
tags: 闭包
---
## 闭包
(面试时候一般扯到垃圾回收机制和作用域链)

闭包看了阮一峰老师的，简单易懂，但是要我解释闭包究竟是什么，我也不知该怎么解释，看了红皮书的《JavaScript高级编程设计》，这里记一下如果哪里有理解错误的，请指出 ～

概念 : `有权访问另外一个函数作用域中变量的函数`

特性 : 函数内嵌套函数，内部函数可引用外层参数和变量，参数和变量不会被垃圾回收机制回收

作用链 : 就是变量和函数可访问范围，变量只能向上访问，访问到window对象则被终止

原型链 : 每个对象都会有一个原型__proto__，只有函数对象才会有prototype， 当我们访问一个对象的属性时，如果这个对象的内部没有这个属性时，就会去__proto__中查找这个属性，这个__proto__又有自己的__proto__，于是一直查找下去，这就是原型链

简单理解 : 函数 A 返回了一个函数 B，并且函数 B 中使用了函数 A 的变量，函数 B 就被称为闭包。
<strong>闭包: 有权访问另一个函数作用域中的变量的函数。</strong>

创建闭包的常见方式，就是在一个函数内部创建另一个函数； 当某个函数被调用时，会创建一个执行环境以及相应的作用域链，然后，使用 arguments 和其他命名参数的值来初始化函数的活动对象，但在作用域链中，外部函数的活动对象是种处于第二位，外部函数的外部函数的活动对象处于第三位...一直到作为作用域链终点的全局执行环境。

来看个例子:
```javascript
  function compare (value1, value2) {
    if (value1 < value2) {
      return -1
    } else if (value1 > value2) {
      return 1
    } else {
      return 0
    }
  }

  var result = compare(5, 10)
```
下面的图，表示了 compare() 函数执行时的作用域链。首先定义了compare()函数，然后在全局作用域中调用了它。调用 compare() 函数的时候，会创建一个包含 `argumetns`、`value1`、`value2`的活动对象。全局执行环境的变量对象(包含result和compare)在compare()执行环境的作用域链中则处于第二位

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/js-red-seven-1.png' />

全局环境得变量对象始终存在，而像 compare() 函数这样的局部环境的变量对象，则只在函数执行的过程中存在。在创建 compare() 函数时，会先创建一个预先包括全局变量对象的作用域链，这个作用域链被保存在内部的 [[ Scope ]] 属性中。

当调用 compare() 函数的时候，会为函数创建一个执行环境，然后通过复制函数中的 [[ Scope ]]属性中的对象构建起执行环境的作用域链。此后，又有一个活动对象(在此作为变量对象使用)被创建并推入执行环境作用域链的前端。 (也就是作用域链的前端是compare的活动对象)

对于例子中的compare()函数的执行环境来说，其作用域链中包含两个变量对象: 本地活动对象和全局变量对象。显然，<strong>作用域链的本质是一个指向变量对象的指针列表</strong>

> 一般来讲，当函数执行完毕之后，局部活动对象就会被销毁，内存中仅保存着全局作用域，但是闭包不同，它会将活动对象添加到作用域链的前端，也就是说，局部活动对象被销毁，但是它的活动对象仍然留在内存中，这也就是为什么使用闭包可能会导致内存问题。因为闭包会携带包含它的函数的作用域，因此会比其他函数占用更多的内存

<strong>在一个函数内部定义的函数会将包含函数(即外部函数)的活动对象添加到它的作用域链中</strong>，例如下边代码
```javascript
  function createComparosonFunction(propertyName) {
    return function(object1, object2) {
      var value1 = object1[propertyName]
      var value2 = object2[propertyName]
      if (value1 < value2) {
        return -1
      } else if (value1 > value2) {
        return 1
      } else {
        return 0
      }
    }
  }

  var compare = createComparosonFunction('name')

  var result = compare({ name: 'PDK' }, { name: '彭道宽' })
```
在匿名函数从 createComparosonFunction() 被返回时，它的作用域被初始化为包含 createComparosonFunction() 函数的活动对象和全局变量对象，这样，匿名函数就可以访问在 createComparosonFunction() 中定义的所有变量。

最重要的是，createComparosonFunction() 执行完之后，它的活动对象不会被销毁，为什么呢？因为匿名函数的作用域链仍然在引用它的活动对象。换句换说，当createComparosonFunction()函数执行完毕之后，局部活动对象就会被销毁，但是因为闭包的原因，它的作用域链被添加到了作用域链的前端，导致createComparosonFunction()的活动对象会留在内存中，知道匿名函数被释放，createComparosonFunction()的活动对象才会被销毁。比如:

```javascript
  // 创建函数
  var compareName = createComparosonFunction('name')

  //调用函数
  var result = compareName({ name: 'PDK' }, { name: '彭道宽' })

  // 解除对匿名函数的引用   (以便释放内存) 
  compareName = null
```
设置compareName为null，是为了解除对函数的引用，等于通知垃圾回收机制将其回收，随着匿名函数的作用域链被销毁，其他作用域 (除了全局作用域)也都可以安全地销毁了

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/js-red-seven-2.png' />

注意: <strong>`作用域链的这种配置机制，引出了一个副作用，即闭包只能取得包含函数中任何变量的最后一个值`</strong>

强调: 任何变量的最后一个值

```javascript
  function createFunctions() {
    var result = new Array()
      
    for (var i = 0; i < 10; i++) {
      result[i] = function() {
        return i 
      }
    }

    return result
  }
```
从表面上看，似乎每个函数都应该有自己的索引值, 即位置0的函数返回0，1的函数返回1, 但实际上，每个函数都返回10，因为每个函数的作用域链中都保存着 createFunctions() 函数的活动对象，所以它们引用的都是同一个变量i，当createFunctions()函数被返回，变量i的值是10，由于作用域链的副作用，`每个函数都引用着保存变量i的同一个对象`。
```javascript
  解决方式，创建另一个匿名函数

  function createFunctions() {
    var result = new Array()

    for (var i = 0; i < 10; i++) {
      result[i] = function (num) {
        return function () {
          return num
        }
      }(i)
    }
    return result
  }

```
在上述代码中，没有立即将闭包赋给数组，而是定义了一个匿名函数，并将立即执行该匿名函数的结果赋给数组。这里的匿名函数有一个参数 num，也就是最终的函数要返回的值。在调用每个匿名函数时，我 们传入了变量 i。由于函数参数是按值传递的，所以就会将变量 i 的当前值`复制`给参数 num。而在这个 匿名函数内部，又创建并返回了一个访问 num 的闭包。这样一来，result 数组中的每个函数都有自己 num 变量的一个副本，因此就可以返回各自不同的数值了


#### 闭包与this对象
this 对象是在运行时基于函数的执 行环境绑定的: `在全局函数中，this 等于 window，而当函数被作为某个对象的方法调用时，this 等于那个对象`。不过，<strong>匿名函数的执行环境具有全局性</strong>，因此其 this 对象通常指向 window，(在使用call和apply改变函数执行环境下，this会指向其他对象)。但有时候，由于编写闭包的方式不同，这一点可能不会那么明显

```javascript
  var name = "The Window"
  var object = {
    name : "My Object",
    getNameFunc : function () {
      console.log('@@@@', this)  // 执行 object
      return function () {
        console.log(this)       // 指向 window 
        return this.name
      }
    }
  }
  console.log(object.getNameFunc()()) "The Window"(在非严格模式下)
  
  // 把外部作用域中的this对象保存在一个闭包能访问得到的变量里，这样就能让闭包访问该对象了

  var name = "The Window"
  var object = {
    name : "My Object",
    getNameFunc : function () {
      console.log('@@@@', this)  // 执行 object
      let _this = this
      return function () {
        console.log(this)       // 指向 window 
        console.log(_this)      // 指向 object
        return _this.name
      }
    }
  }
  console.log(object.getNameFunc()()) "My Object"
```
为什么匿名函数没 有取得其包含作用域(或外部作用域)的 this 对象呢 ? 

> 每个函数在被调用时都会自动取得两个特殊变量:`this` 和 `arguments`。内部函数在搜索这两个变量时，只会搜索到其活动对象为止，因此永远不可能直接访问外部函数中的这两个变量。

(怎么理解这句话？)，个人的理解： 在执行过程中，每个函数都会有一个执行环境，在getNameFunc()函数里的执行环境this指向的是 object，而在闭包中，`闭包又有自己的执行环境，而这里的this与它外部函数getNameFunc()的this是不相等的`，可能在某种情况下，它们都指向window，但是并不能说它们相等，而上述代码里，在定义匿名函数前，把this对象赋值给了 _this 变量，而在定义了闭包之后，闭包可以访问到外部函数的变量，即使在函数返回之后，闭包将活动对象添加到作用域链的前端，_this仍然引用着 object，所以会打印出 "My Object"

#### 匿名函数与闭包
什么是匿名函数 ？一般用到匿名函数都是立即执行的，通常叫做自执行匿名函数或者自调用匿名函数。常用来构建沙箱模式，作用是: `开辟封闭的变量作用域环境`。我们来看几个例子

```javascript
  (function(){ 
    console.log("我是匿名方式1")
  })()  //我是匿名方式1

  (function(){ 
    console.log("我是匿名方式2")
  }())  //我是匿名方式2

  (function(i, j, k){ 
    console.log(i+j+k)
  })(1, 3, 5) // 9
```

实际上，<strong>立即执行的匿名函数并不是函数</strong>，因为已经执行过了，所以它是一个结果，这个结果是对当前这个匿名函数执行结果的一个引用（`函数执行默认return undefined`）。这个结果可以是一个字符串、数字或者null/false/true，也可以是对象、数组或者一个函数（对象和数组都可以包含函数），<strong>当返回的结果包含函数时，这个立即执行的匿名函数所返回的结果就是典型的闭包了</strong>。

用匿名函数实现闭包
```javascript
  var func = (function() {
    var a = 10
    return function () {
      console.log(a)
    }
  })()

  func() // 10
  // func 作为立即执行匿名函数执行结果的一个接收，这个执行结果是闭包，func等于这个闭包。
  // 执行func就相当于执行了匿名函数内部return的闭包函数
  // 这个闭包函数可以访问到匿名函数内部的私有变量a，所以打印出10

```
所以，我们可以说: <strong>闭包跟函数是否匿名没有直接关系，匿名函数和具名函数都可以创建闭包 ！！！</strong>

<!--more-->

```javascript
    // 经典面试题，循环中使用闭包解决 var 定义函数的问题
    
    for ( var i = 1; i <= 5; i++) {
	setTimeout( function timer() {
            console.log( i );
        }, i*1000 );
    }

    // 首先因为 setTimeout 是个异步函数，所有会先把循环全部执行完毕，这时候 i 就是 6 了，所以会输出一堆 6。

    // 解决方式一： 闭包
    for (var i = 1; i <= 5; i++) {
        (function(j) {
            setTimeout(function timer() {
                console.log(j)
            }, j*1000)
        })(i)
    }

    // 方式二: 使用 setTimeout 的第三个参数, 第三个参将作为第一个参数函数func的参数传进去。
    for (var i = 1; i <=5; i++) {
        setTimeout(function timer() {
            console.log(i)
        }, i*1000, i)
    }    

    // 方式三:利用let, let他会创建一个块级作用域
    for (let i = 1; i <=5; i++) {
        setTimeout(function timer() {
            console.log(i)
        }, i*1000)
    } 

```

```javascript
    function fetch(a) {
        return function test1() {
            return function test2() {
                var a = 5;
                return a;
                function a() {

                }
            }
        }
    }

    let res = fetch(55)(2)(3)
    console.log(res)                    // 5， 如果把var a = 5 去掉，那么return 的是 function a
    
    function fetch1(a) {
        return function() {
            return a;
        }
    }
    console.log(fetch1(100)(2));        // 100

    function fetch2(a) {
        return function(a) {
            return a;
        }
    }
    console.log(fetch2(100)(2));        // 2
```
