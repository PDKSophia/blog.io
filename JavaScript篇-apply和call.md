---
title: JavaScript篇-apply和call
date: 2018-10-08 15:30:42
tags:
---
## call与apply
百度一搜，其实还挺多各种详解，参考了些博客之后，在知乎上看到一个很简单通俗易懂的解释。
说的简单一点，就是call和apply是为了动态改变this而出现的，当一个object没有某个方法，但是其他的有，我们可以借助call或apply用其它对象的方法来操作。
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
### 通过call和apply来实现继承

```javascript
    let Author = function () {
        this.name = '彭道宽',
        this.age  = 18,
        this.school = '湖南科技大学'
    }

    let people = {}

    console.log(people)       // Object {} , 空对象

    Author.call(people)

    console.log(people)       // Object { name : '彭道宽', age : 18, school : '湖南科技大学'}

``` 

### 不能使用call,apply，如何用js实现call或者apply的功能 ？
前两天面试的时候，被面试官问到，如果不使用apply、call的情况下，如何用js自己实现一个Function.prototype.call2来实现function 中this指向的作用域 ？


我们都知道，call 和 apply 都是动态绑定this，obj1.call(obj2) ，将 obj1 的this绑定到obj2，从而使得obj2继承了obj1的属性和方法。

#### 举个例
```javascript
    var obj1 = {
        value : 1
    }

    function say () {
        console.log(this.value)
    }

    say()            // 输出undefined
    say.call(obj1)   // 输出1
```
注意两点 ：

+ call改变了this的指向，此时的this指到了obj1
+ say函数执行了
-------

<!--more-->

### 摩擦摩擦，在这光滑的路上摩擦 （实现call）
#### 魔鬼的步伐 - 第一步
想一下，怎样模拟重要的这两点 ？ 如果我们将obj1构造成这幅模样，直接调obj1.say(函数，就能得到value的值，因为这时候的this指向的是obj1。
```javascript
    var obj1 = {
        value : 1,
        say() {
            console.log(this.value)
        }
    };

    obj1.say();         // 输出1
```
但是这样我们得给obj1对象本身添加一个属性(那我直接在obj1写不就完事了，还什么jb的call和apply！！！)

不慌，如果加了，那我们再删掉不就ojbk吗！
所以我们可以分三步出击 ：
+ 将say函数设为obj1的一个属性。
+ 执行say函数
+ 删除这个函数
```javascrip
    1 : obj1.say = say

    2 : obj1.say()

    3 : delete obj1.say
```

所以，我们的雏形就出来了。
```javascript
    var obj1 = {
        value : 1
    }

    function say () {
        console.log(this.value)
    }
    
    // _call方法就是用来模拟js中的call
    Function.prototype._call = function(context) {
        // 获得要调用call的函数，按照我们前面说的三步走
        // console.log(this)        // [ Function : say ]
        context.say = this;
        // console.log(context)     // { value : 1, say : [Function : say] }
        context.say();
        delet context.say();
    }

    say._call(obj1);
```
#### 魔鬼的步伐 - 第二步
我们前也说了。call和apply都接受参数，call是接受连续参数，而apply是接受参数数组。所以我们这里还得再改良一下。具体不多说，底下有链接，可以直接去看冴羽大大的讲解 ～
```javascript
    // 改良配方
    var obj1 = {
        value : 1
    }

    function say (username, age) {
        console.log(username)
        console.log(age)
        console.log(this.value)
    }

    // _call方法就是用来模拟js中的call
    Function.prototype._call = function(context) {
        context.say = this
        var args = []
        for(let i = 1; i < arguments.length; i++) {
            args.push('arguments[' + i + ']');
        }
        eval('context.say(' + args + ')');
        delete context.say;
    }

    say._call(obj1, '彭道宽', 18);

    //循环完后的数组 args = [arguments[1], arguments[2], .....]

    //然后再通过eval，在eval函数中，args会自动调用args.toString()方法，相当于

    // context.say(arguments[1], arguments[2], ....)

    // eval函数接收参数是个字符串，并执行其中的的 JavaScript 代码，可以这么理解，把eval看成是<script>标签。

```
以为这就完了？？不存在的，还有缺陷呢，比如 :
+ this参数可以传null，当为null的时候this应指向window
```javascript
    var value = 1;
    function say () {
        console.log(this.value)
    }

    say.call(null);     // 输出1，此时的this为window
```
+ 函数是可以有返回值的
```javascript
    var obj1 = {
        value : 1
    }

    function say(username, age) {
        return {
            value: this.value,
            name: username,
            age: age
        }
    }

    console.log(say.call(obj1, '彭道宽', 18));
    // Object {
    //    value: 1,
    //    username: '彭道宽',
    //    age: 18
    // }
```
#### 魔鬼的步伐 - 第三步
```javascript
    var obj1 = {
        value : 1
    }

    var value = 2;      

    function say(username, age) {
        console.log(this.value)
        return {
            value : this.value,
            username : username,
            age : age
        }
    }

    Function.prototype._call = function(context) {
        var context = context || window
        context.say = this
        var args = []

        for(let i = 1; i < arguments.length; i++) {   // 循环开始，call接受的是连续参数
            args.push('arguments[' + i + ']');
        }

        var result = eval('context.say(' + args + ')');

        delete context.say;
        return result;
    }

    say._call(null);        // 2

    console.log(say._call(obj1, '彭道宽', 18));
    //  1
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
        context.say = this
        var args = []

        for(let i = 0; i < arr.length; i++) {     // 循环从0 开始，apply接受的是一个参数数组
            args.push('arr[' + i + ']')
        }
        var result = eval('context.say(' + args + ')');

        delete context.say;
        return result;
    }
```

## 相关链接
冴羽大大 ： <a href="https://github.com/mqyqingfeng/Blog/issues/11">https://github.com/mqyqingfeng/Blog/issues/11</a>

个人博客 : <a href="http://blog.pengdaokuan.cn:4001">http://blog.pengdaokuan.cn:4001</a>

