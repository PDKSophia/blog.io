---
title: JavaScript篇-闭包
date: 2018-10-08 15:23:45
tags:
---
## 闭包
(面试时候一般扯到垃圾回收机制和作用域链)

闭包看了阮一峰老师的，简单易懂，但是要我解释闭包究竟是什么，我也不知该怎么解释，看了红皮书的《JavaScript高级编程设计》，这里记一下如果哪里有理解错误的，请指出 ～

概念 : 有权访问另外一个函数作用域中变量的函数

常见方式 : 就是一个函数a中创建另一个函数b，通过b函数访问这个a函数的局部变量，利用闭包可突破这个作用域链

特性 : 函数内嵌套函数，内部函数可引用外层参数和变量，参数和变量不会被垃圾回收机制回收

作用链 : 就是变量和函数可访问范围，变量只能向上访问，访问到window对象则被终止

原型链 : 每个对象都会有一个原型__proto__，只有函数对象才会有prototype， 当我们访问一个对象的属性时，如果这个对象的内部没有这个属性时，就会去__proto__中查找这个属性，这个__proto__又有自己的__proto__，于是一直查找下去，这就是原型链

简单理解 : 函数 A 返回了一个函数 B，并且函数 B 中使用了函数 A 的变量，函数 B 就被称为闭包。

```javascript
    function A () {
        var name = 'PDK'
        function B () {
            console.log(name)
        } 
        return B
    }

    // 为什么函数 A 已经弹出调用栈了，为什么函数 B 还能引用到函数 A 中的变量 ？

    函数A在执行完之后，活动对象不会被销毁，因为匿名函数B的作用域链仍然在引用这个活动对象

    而且函数 A 中的变量这时候是存储在堆上的。现在的 JS 引擎可以通过逃逸分析辨别出哪些变量需要存储在堆上，哪些需要存储在栈上。

```

```javascript
    作用域链的这种配置机制，引出了一个副作用，即闭包只能取得包含函数中任何变量的最后一个值

    function createFunctions() {
      var result = new Array()
      
      for (var i = 0; i < 10; i++) {
        result[i] = function() {
          return i
        }
      }

      return result
    }

    // 从表面上看，似乎每个函数都应该有自己的索引值

    // 但实际上，每个函数都返回10，因为每个函数的作用域链中都保存着 createFunctions() 函数的活动对象，所以它们引用的都是同一个变量i

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
