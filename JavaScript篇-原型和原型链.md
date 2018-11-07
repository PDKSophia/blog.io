---
title: JavaScript篇-原型和原型链
date: 2018-10-08 15:22:40
tags:
---
## 原型与原型链

### 构造函数 (constructor，内置的默认属性)
```javascript
    1 : 例子
        function Person(name, age, job) {
            this.name = name;
            this.age = age;
            this.job = job;
            this.sayName = function() { 
                alert(this.name) 
            } 
        }
        var person1 = new Person('Zaxlct', 28, 'Software Engineer');
        var person2 = new Person('Mick', 23, 'Doctor');

        // 上面的例子中 person1 和 person2 都是Person的实例
        
        console.log(person1.constructor == Person)      // true
        console.log(person2.constructor == Person)      // true

        // 直接打印person1和person2对象，就会发现并没有发现有constructor属性
        // 那为什么person1.constructor == Person 这个会是true，实际是因为在person1中没有找到constructor属性
        // 顺着__proto__往上，找到了Person.prototype，而在这里才找到的constructor，而这个constructor是指向Person的，所以结果才会是true,但是这并不能说是实例上有一个constructor属性
```
记住 ： 
+ person1 和 person2 都是 构造函数 Person 的实例
+ 实例的构造函数属性都指向构造函数

### 原型对象
每定义一个对象时候，对象中都会包含一些预定义的属性，每个函数对象都会有一个prototype属性，这个属性指向函数的原型对象。
```javascript
    function Person() {}
        Person.prototype.name = 'Zaxlct';
        Person.prototype.age  = 28;
        Person.prototype.job  = 'Software Engineer';
        Person.prototype.sayName = function() {
        alert(this.name);
    }
        
    var person1 = new Person();
    person1.sayName(); // 'Zaxlct'

    var person2 = new Person();
    person2.sayName(); // 'Zaxlct'

    console.log(person1.sayName == person2.sayName); //true
```

+ 每一个对象都有__proto__属性， 但是只有函数对象才有 prototype 属性 

```javascript
    什么是函数对象 ？
    
    凡是通过 new Function() 创建的对象都是函数对象，其他的都是普通对象，下面例子都是函数对象。。。

    var f1 = function () {
        name : '彭道宽',
        age : 18
    }

    var f2 = new Function('彭道宽', 18)
```
那什么是原型对象呢 ？

<!--more-->

原型对象，顾名思义，它就是一个普通对象。原型对象就是 Person.prototype ，如果你还是害怕它，那就把它想想成一个字母 A： var A = Person.prototype

现在我们给A添加四个属性，name 、age 、 job 、 say，其实它还有一个默认的属性就是constructor。

这么说吧 : A 有一个默认的 constructor 属性，这个属性是一个指针，指向 Person。即：
```javascript
    Person.prototype.constructor = Person
```
是不是很上边说的 ？
```javascript
    // 上边
    person1.constructor == Person                // true

    // 这里
    Person.prototype.constructor == Person       // true

    // 这里为什么person1会constructor属性？因为person1 是 Person的实例。实际上并没有constructor，在找的时候找不到constructor。
    // 于是顺着__proto__往上找，由于person1是Person的实例，于是找到了Person.prototype，在这里找到了cosntructor，所以上边的公式才成立

    // 注意
    person1.constructor == Person.prototype.constructor // false
    // person1.constructor 和 Person.prototype.constructor 是指针属性，只是同时指向 Person，并不是等于Person，所以是错误的

```
那 Person.prototype 为什么有 constructor 属性？？同理， Person.prototype（也就是A），也是Person 的实例。
```javascript
    // 第一步
    let A = {}

    // 第二步
    A.__proto__ = Person.prototype

    // 第三步
    Person.call(A)

    // 第四步
   return A;

    // 原型对象（Person.prototype）是 构造函数（Person）的一个实例。
    Person.prototype = A

```
原型对象其实就是普通对象（但 Function.prototype 除外，它是函数对象，但它很特殊，他没有prototype属性（前面说到函数对象都有prototype属性））
```javascript
    function Person(){};
    console.log(Person.prototype) //Person{}
    console.log(typeof Person.prototype) //Object
    console.log(typeof Function.prototype) // Function，这个特殊
    console.log(typeof Object.prototype) // Object
    console.log(typeof Function.prototype.prototype) //undefined
```

### __proto__
JS 在创建对象（不论是普通对象还是函数对象）的时候，都有一个叫做__proto__ 的内置属性，用于指向创建它的构造函数的原型对象。

对象 person1 有一个 __proto__属性，创建它的构造函数是 Person，构造函数的原型对象是 Person.prototype ，所以：
```javascript
    person1.__proto__  == Person.prototype
```
<img src="https://upload-images.jianshu.io/upload_images/1430985-b650bc438f236877.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/700">

从这个图中可得到 : 
```javascript

    Person.prototype.constructor = Person

    person1.__proto__ == Person.prototype

    person1.constructor == Person
    
```
注意 ： 这个连接存在于实例（person1）与构造函数（Person）的原型对象（Person.prototype）之间，而不是存在于实例（person1）与构造函数（Person）之间。

### 总结一下
```javascript
    // 概念

    1 : Person 构造函数

    2 : var person1 = new Person() , person1 是实例

    3 : prototype是原型对象，只有Function Object(函数对象) 才存在

    4 : __proto__是原型，每个对象都存在原型

    5 : person1之所以有constructor属性，是因为它是Person的实例，它是new出来的对象，person1 的 constructor指向Person


    // 公式

    1 : Person.prototype.constructor == Person

    2 : person1.constructor == Person

    3 : person1.__proto__ == Person.prototype

```
### 原型链
```javascript
    // 题目
    1 : person1.__proto__ 是什么？
    2 : Person.__proto__ 是什么？
    3 : Person.prototype.__proto__ 是什么？
    4 : Object.__proto__ 是什么？
    5 : Object.prototype.__proto__ 是什么？

    // 答案
    1 : person1.__proto__ === Person.prototype (person1的构造函数Person)

    2 : Person.__proto__ === Function.prototpye (Person的构造函数Function)

    3 : Person.protyotype是一个普通对象，因为一个普通对象的构造函数都是Object
        所以 Person.prototype.__proto__  === Object.prototype

    4 : Object.__proto__ === Function.prototpye (Object的构造函数Function)

    5 : Object.prototype 也有__proto__属性，但是它比较特殊，是null，null处于原型链的顶端。所以 : Object.prototype.__proto__ === null
```
注意 : 
+ 原型链的形成是真正是靠__proto__ 而非prototype

### 自己写一下？
```javascript
    function Person() {

    }

    var p1 = new Person()

    // 总结公式
    1 : p1.constructor = Person
    
    2 : Person.prototype.constructor = Person

    3 : p1.__proto__ = Person.prototype

    4 : Person.__proto__ = Function.prototype

    5 : Person.constructor = Function

    6 : Person.prototype.__proto__ = Object.prototype

    7 : Object.__proto__ = Function.prototype
        // Object 是函对象，是通new Function()创建的，所以Object.__proto__指向Function.prototype

    8 :Function.prototype.__proto__ = Object.prototype
    
    9 : Object.prototype.__proto__ = null
```

来个题? 
```javascript
    var FunctionExample = function () {}

    Object.prototype.a = function() {}

    Function.prototype.b = function() {}

    var f = new FunctionExample()

    // 这时候f能否访问到a和b

    // 所有普通对象都源于这个Object.prototype对象，只要是对象，都能访问到a
    // 而f通过new 关键词进行函数调用，之后无论如何都会返回一个与FunctionExample关联的普通对象（因为不是通过函数构造创建的对象，所以不是函数对象，如果不是函数对象，不存在prototype，也就取不到b了）
    // 而取b我们可通过 f.constructor.b就能访问到b，因为 f.constructor == FunctionExample

    console.log(f) // FunctionExample {}
    console.log(f.constructor)  // [Function: FunctionExample]
    console.log(FunctionExample.prototype) // FunctionExample {}, 其实可以理解成FunctionExample.prototype就是一个实例
    console.log(FunctionExample.prototype.constructor) // [Function: FunctionExample]
    console.log(f.__proto__) // FunctionExample {} , 可以这么理解，实例的proto指向它的构造函数的原型对象，也就是f.__proto__ == FunctionExample.prototype
    console.log(f.constructor.b) // Function，因为f.constructor指向 FunctionExample, 而 FunctionExample.prototype相当是Function的一个实例，所以在Function.prototype上有个b函数，FunctionExample照样可以访问的到
    console.log(f.constructor.prototype.__proto__) // { a: [Function] } 可以访问到a函数，因为f.constructor.prototype其实就是等于FunctionExample {}，而每个对象都有个__proto__属性，Function.prototype.__proto__ == Object.prototype，所以也能访问到a方法

```

### 再来两个题
```javascript
  function SuperType() {
    this.colors = ['red', 'yellow']
  }

  function SubType() {
    
  }

  // 继承了SuperType
  SubType.prototype = new SuperType()

  var instance1 = new SubType() // intance.constructor = SuperType
  instance1.colors.push('black')
  console.log(instance1.colors) // ['red', 'yellow', 'black']

  var instance2 = new SubType() 
  console.log(instance2.colors) // ['red', 'yellow', 'black']

  // 理解一下原型和原型链
  console.log(instance1.constructor) // SuperType
  console.log(SubType.prototype.constructor) // SuperType
  console.log(SubType.prototype.__proto__ == SuperType.prototype) // true
  console.log(instance1.__proto__ == SubType.prototype) // true
  console.log(SubType.__proto__ == SuperType.prototype) // false
  console.log(SubType.__proto__ == Function.prototype) // true
  console.log(SuperType.prototype.constructor == SuperType) // true
  console.log(SuperType.__proto__ == Function.prototype) // true
  console.log(SuperType.prototype.__proto__ == Object.prototype) // true 

  // 为什么instance1.constructor = SuperType ？ 为什么 SubType.prototype.constructor = SuperType ？ 
```

```javascript
  function SuperType() {
    this.colors = ['red', 'yellow']
  }

  function SubType() {
    // 继承了SuperType
    SuperType.call(this)
  }

  var instance1 = new SubType()
  instance1.colors.push('black')
  console.log(instance1.colors) // ['red', 'yellow', 'black']

  var instance2 = new SubType() 
  console.log(instance2.colors) // ['red', 'yellow']

  // 思考一哈？
  console.log(instance1.constructor) // SubType
  console.log(SubType.prototype.constructor) // SubType
  console.log(SubType.prototype.__proto__) // {}
  console.log(SubType.prototype.__proto__ == SuperType.prototype) // false
  console.log(SubType.prototype.__proto__ == Object.prototype) // true
  console.log(instance1.__proto__ == SubType.prototype) // true
  console.log(SubType.__proto__ == SuperType.prototype) // false
  console.log(SubType.__proto__ == Function.prototype) // true
  console.log(SuperType.prototype.constructor == SuperType) // true
  console.log(SuperType.__proto__ == Function.prototype) // true
  console.log(SuperType.prototype.__proto__ == Object.prototype) // true 
```
详情看这里啊，《JavaScript高级程序设计 第三版》中: [继承](https://github.com/PDKSophia/read-booklist/blob/master/JavaScript%E9%AB%98%E7%BA%A7%E7%BC%96%E7%A8%8B%E8%AE%BE%E8%AE%A1/play-card-3.md#%E7%BB%A7%E6%89%BF)
