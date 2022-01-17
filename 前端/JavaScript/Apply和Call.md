---
title: JavaScript篇-apply和call
date: 2018-10-08 15:30:42
tags:
---

## call 与 apply

百度一搜，其实还挺多各种详解，参考了些博客之后，在知乎上看到一个很简单通俗易懂的解释。
说的简单一点，就是 call 和 apply 是为了动态改变 this 而出现的，当一个 object 没有某个方法，但是其他的有，我们可以借助 call 或 apply 用其它对象的方法来操作。

```javascript
    // 知乎简单易懂答案
   猫吃鱼狗吃肉，奥特曼打怪兽
    有一天，狗想吃鱼了
    猫.吃鱼.call(狗，鱼)
    狗就吃到鱼了
    猫成精了，想打怪兽
    奥特曼.打怪兽.call(猫，小怪兽)

    obj.call(thisObj, arg1, arg2, ...)
    obj.apply(thisObj, [arg1, arg2, ...])

    // 两者作用一致，都是把obj(即this)绑定到thisObj，这时候thisObj具备了obj的属性和方法。或者说thisObj继承了obj的属性和方法。唯一区别是apply接受的是数组参数，call接受的是连续参数。

    // 没有吃鱼的方法，而猫有，于是把猫的thi绑定狗身上，使得具备猫的属性和方法，也就是说狗继承了猫打属性和方法，所以狗可以鱼。

```

### 通过 call 和 apply 来实现继承

```javascript
let Author = function() {
  ;(this.name = '彭道宽'), (this.age = 18), (this.school = '湖南科技大学')
}

let people = {}

console.log(people) // Object {} , 空对象

Author.call(people)

console.log(people) // Object { name : '彭道宽', age : 18, school : '湖南科技大学'}
```

### 不能使用 call,apply，如何用 js 实现 call 或者 apply 的功能 ？

前两天面试的时候，被面试官问到，如果不使用 apply、call 的情况下，如何用 js 自己实现一个 Function.prototype.call2 来实现 function 中 this 指向的作用域 ？

我们都知道，call 和 apply 都是动态绑定 this，obj1.call(obj2) ，将 obj1 的 this 绑定到 obj2，从而使得 obj2 继承了 obj1 的属性和方法。

#### 举个例

```javascript
var obj1 = {
  value: 1
}

function say() {
  console.log(this.value)
}

say() // 输出undefined
say.call(obj1) // 输出1
```

注意两点 ：

- call 改变了 this 的指向，此时的 this 指到了 obj1
- say 函数执行了

### 摩擦摩擦，在这光滑的路上摩擦 （实现 call）

#### 魔鬼的步伐 - 第一步

想一下，怎样模拟重要的这两点 ？ 如果我们将 obj1 构造成这幅模样，直接调 obj1.say(函数，就能得到 value 的值，因为这时候的 this 指向的是 obj1。

```javascript
var obj1 = {
  value: 1,
  say() {
    console.log(this.value)
  }
}

obj1.say() // 输出1
```

但是这样我们得给 obj1 对象本身添加一个属性(那我直接在 obj1 写不就完事了，还什么 jb 的 call 和 apply！！！)

不慌，如果加了，那我们再删掉不就 ojbk 吗！所以我们可以分三步出击 ：

- 将 say 函数设为 obj1 的一个属性。

- 执行 say 函数

- 删除这个函数

```javascript
    1 : obj1.say = say

    2 : obj1.say()

    3 : delete obj1.say
```

所以，我们的雏形就出来了。

```javascript
var obj1 = {
  value: 1
}

function say() {
  console.log(this.value)
}

// _call方法就是用来模拟js中的call
Function.prototype._call = function(context) {
  // 获得要调用call的函数，按照我们前面说的三步走

  // console.log(this)        // [ Function : say ]
  context.say = this

  // console.log(context)     // { value : 1, say : [Function : say] }
  context.say()

  delete context.say()
}

say._call(obj1)
```

#### 魔鬼的步伐 - 第二步

我们前面也说了。call 和 apply 都接受参数，<strong>call 是接受连续参数，而 apply 是接受参数数组。</strong>所以我们这里还得再改良一下。具体不多说，底下有链接，可以直接去看冴羽大大的讲解 ～

```javascript
// 改良配方
var obj1 = {
  value: 1
}

function say(username, age) {
  console.log(username)
  console.log(age)
  console.log(this.value)
}

// _call方法就是用来模拟js中的call
Function.prototype._call = function(context) {
  context.say = this
  var args = []
  for (let i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']')
  }
  eval('context.say(' + args + ')')
  delete context.say
}

say._call(obj1, '彭道宽', 18)

//循环完后的数组 args = [arguments[1], arguments[2], .....]

//然后再通过eval，在eval函数中，args会自动调用args.toString()方法，相当于context.say(arguments[1], arguments[2], ....)

// eval函数接收参数是个字符串，并执行其中的的 JavaScript 代码，可以这么理解，把eval看成是<script>标签。
```

以为这就完了？？不存在的，还有缺陷呢，比如 :

- this 参数可以传 `null`，当为 null 的时候 this 应指向 window

```javascript
var value = 1
function say() {
  console.log(this.value)
}

say.call(null) // 输出1，此时的this为window
```

- 函数是可以有返回值的

```javascript
var obj1 = {
  value: 1
}

function say(username, age) {
  return {
    value: this.value,
    name: username,
    age: age
  }
}

console.log(say.call(obj1, '彭道宽', 18))

// Object {
//   value: 1,
//   username: '彭道宽',
//   age: 18
// }
```

#### 魔鬼的步伐 - 第三步

```javascript
var obj1 = {
  value: 1
}

var value = 2

function say(username, age) {
  console.log('this: ', this, '; values: ', this.value)
  return {
    value: this.value,
    username: username,
    age: age
  }
}

Function.prototype._call = function(context) {
  var context = context || window
  context.say = this
  var args = []

  for (let i = 1; i < arguments.length; i++) {
    // 循环开始，call接受的是连续参数
    args.push('arguments[' + i + ']')
  }

  var result = eval('context.say(' + args + ')')

  delete context.say
  return result
}

say._call(null) // this: window; values: 2

console.log(say._call(obj1, '彭道宽', 18))

// this: obj1; values: 1

//  Object({
//     value : 1,
//     username : '彭道宽',
//     age : 18
//  })
```

### apply 实现

```javascript
Function.prototype._apply = function(context, arr) {
  var context = context || window
  var result
  context.fn = this

  if (!arr) {
    result = context.fn()
  } else {
    var args = []
    for (let i = 0; i < arr.length; i++) {
      args.push('arr[' + i + ']')
    }
    result = eval('context.fn(' + args + ')')
  }
  return result
}
```

### bind 的简易版实现

```javascript
Function.prototype._bind = function(context) {
  var self = this
  var args = Array.prototype.slice.call(arguments, 1)

  return function() {
    var bindArgs = Array.prototype.slice.call(arguments)
    return self.apply(context, args.concat(bindArgs))
  }
}
```

### new 的实现

```javascript
Function.prototype._new = function(fn, ...args) {
  var obj = Object.create(fn.prototype)
  var ret = fn.apply(obj, args)
  return ret instanceof Object ? ret : obj
}

// 或者
Function.prototype._new = function() {
  var obj = {}
  var Constructor = Array.prototype.shift.call(arguments)

  obj.__proto__ = Constructor.prototype
  var result = Constructor.call(obj, arguments)
  return result instanceof Object ? result : obj
}
```

[《JavaScript 高级程序设计》上对 call 和 this 的理解](https://github.com/PDKSophia/read-booklist/blob/master/JavaScript%E9%AB%98%E7%BA%A7%E7%BC%96%E7%A8%8B%E8%AE%BE%E8%AE%A1/play-card-2.md#%E5%87%BD%E6%95%B0%E5%B1%9E%E6%80%A7%E5%92%8C%E6%96%B9%E6%B3%95)

### 相关链接

冴羽大大 ： [https://github.com/mqyqingfeng/Blog/issues/11](https://github.com/mqyqingfeng/Blog/issues/11)
