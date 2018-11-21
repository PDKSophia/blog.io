---
title: JavaScript篇-面向对象与继承
date: 2018-11-21 11:04:31
tags:
---

## 面向对象

### 如何声明一个类 ？
ES5中，还没有类的概念，而是通过函数来声明，到了ES6，有了class关键词，则通过class来声明

```javascript
  // ES5
  var Animal = function () {
    this.name = 'Animal'
  }

  // ES6
  class Animal {
    constructor () {
      this.name = 'Animal'
    }
  }
```

### 如何创建对象 ？
- 字面量对象

- 显示的构造函数

- Object.create

```javascript
  // 第一种方式: 字面量
  var obj1 = {
    name: '彭道宽'
  }
  var obj2 = new Object({
    name: '彭道宽'
  })

  // 第二种方式: 构造函数
  var Parent = function () {
    this.name = name
  }
  var child = new Parent('彭道宽')

  // 第三种方式: Object.create
  var Parent = {
    name: '彭道宽'
  }
  var obj4 = Object.create(Parent)
```

### ES6 的 Class
基本上，ES6 的class可以看作只是一个语法糖，它的绝大部分功能，ES5 都可以做到，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。

```javascript
  // ES5
  function Point (x, y) {
    this.x = x
    this.y = y
  }

  Point.prototype.toString = function () {
    return `(${this.x}, ${this.y})` // (x, y)
  }

  var point = new Point(1, 2)
  point.toString() // (1, 2)

  // ES6 中利用 class 定义类
  class Point {
    constructor (x, y) {
      this.x = x
      this.y = y
    }

    toString () {
      return `(${this.x}, ${this.y})`
    }
  }

  var point = new Point(1, 2)
  point.toString() // (1, 2)

```
上面代码定义了一个“类”，可以看到里面有一个 `constructor `方法，这就是构造方法，而this关键字则代表实例对象。也就是说，ES5 的构造函数Point，对应 ES6 的Point类的构造方法。

```javascript
  class Point {
    // ...
  }

  console.log(typeof Point) // 'function'
  console.log(Point === Point.prototype.constructor) // true

```
<strong>类的数据类型就是函数，类本身就指向构造函数。</strong>构造函数的 `prototype` 属性，在 ES6 的 “类” 上面继续存在。事实上，类的所有方法都定义在类的prototype属性上面。
```javascript
  class Point {
    constructor () {
      // ...
    }

    toString () {
      // ...
    }

    toValue () {
      // ...
    }
  }

  // 等同于下边的代码
  Point.prototype.constructor = function () { }
  Point.prototype.toString = function () { }
  Point.prototype.toValue = function () { }
  
```
在类的实例上面调用方法，其实就是调用原型上的方法。
```javascript
  class Point {}

  var point = new Point ()

  console.log(point.constructor === Point.prototype.constructor) // true
```

更多 Class 的理解，请看阮一峰老师的 [ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/class)

## 继承的实现
下边就列举常用的几种继承方式，搞懂这几种，应该可以混过面试了，记住: *继承的本质就是原型链*

- 原型链继承

- 借用构造函数继承

- 组合继承

- 原型式继承

- 寄生式继承

- 寄生组合式继承

- ES6 的 Class 继承

### 原型链继承
利用原型，让一个引用类型继承另一个引用类型的属性和方法；
```javascript
  function Parent () {
    this.property = true
  }

  Parent.prototype.getValue = function () {
    return this.property
  }

  function Child () {
    this.childProperty = false
  }

  Child.prototype = new Parent() // 将父类的实例赋给子类的prototype

  Child.prototype.getChildValue = function () {
    return this.childProperty
  }

  var ch1 = new Child()
  console.log(ch1.getChildValue()) // false
  console.log(ch1.getValue()) // true
```
继承是通过创建 Parent 的实例，并将该实例赋给 Child.prototype 实现的。实现的本质是 `重写原型对象`，代之以一个新类型的实例。换句换说，原来存在于 Parent 的实例中的所有属性和方法，现在也存在 Child.prototype 中了。最终结果是: ch1 指向 Child 的原型， Child 的原型指向 Parent 的原型， getValue() 方法仍在 Parent.prototype 上，而 property 位于 Child.property 中，这是因为: property 是一个实例属性，而 getValue() 是一个原型方法

<strong>`ch1.constructor` 现在不是指向 Child ，而是指向 Parent </strong>，这是因为 Child .prototype 被重写的缘故。实际上，不是 Child 的原型的 constructor 属性被重写，而是 Child 的原型指向了另一个对象——Parent 的原型，而这个原型对象的 constructor 属性指向的是 Parent 

```javascript
  // 可以这么理解
  // 正常情况下
  Child.prototype.constructor = Child
  ch1.contructor = Child

  // 但是现在 Child.prototype = new Parent() 将父类的实例赋给子类的prototype之后
  Child.prototype= new Parent()
  (new Parent()).contructor = Parent
  Child.prototype.contructor = Parent
  ch1.constructor = Parent
```
那么原型链继承的问题有哪些呢？

<strong>原型链中的原型对象是共用的，子类无法通过父类创建私有属性</strong>， 比如你 new 两个子类 child1 和 child2 的时候，你改 child1 的属性，child2 也会跟着改变，比如下边的代码

```javascript
  function Parent () {
    this.colors = ['red', 'yellow']
  }

  function Child () {
    
  }

  // 子类继承父类
  Child.prototype = new Parent()

  var ch1 = new Child()
  ch1.colors.push('black')
  console.log(ch1.colors) // ['red', 'yellow', 'black']
  
  var ch2 = new Child()
  console.log(ch2.colors) // ['red', 'yellow', 'black']

```

你看，这就出问题了吧，因为在 Parent 构造函数中定义了一个 colors 属性，当通过`原型链`继承了之后，Child.prototype 就变成了 Parent 的一个实例，因此它也拥有了一个它自己的 colors 属性——就跟专门创建了一个 Child.prototype.colors 一样，那么所有 Child 的实例都会共享这个colors属性，而 ch1 和 ch2 都是 Child 的实例，对 ch1.colors 的修改，在 ch2.colors 中也会反映出来

### 借用构造函数
为了解决上边 原型链继承 存在的问题，现在使用构造函数去继承，在子类的构造函数里执行父类的构造函数, 主要通过 `call / apply` 去改变 `this` 的指向，从而导致父类构造函数执行时的这些属性都会挂载到子类实例上去

```javascript
  function Parent () {
    this.colors = ['red', 'yellow']
  }

  function Child () {
    // 子类继承了父类
    Parent.call(this)
  }

  var ch1 = new Child()
  ch1.colors.push('black')
  console.log(ch1.colors) // ['red', 'yellow', 'black']
  
  var ch2 = new Child()
  console.log(ch2.colors) // ['red', 'yellow']

```

### 组合继承
将原型链和借用构造函数的技术组合在一起。背后的思路是: <strong>使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。这样，既通过在原型上定义方法实现了函数的服用，又能够保证每个实例都有它的属性</strong>

```javascript
  function Parent () {
    this.name = '彭道宽' // 这叫实例属性
  }

  Parent.prototype.getName = function () { } // 这叫做原型属性
```

```javascript
  function Parent (name) {
    this.name = name
    this.colors = ['red', 'yellow']
  }
  
  Parent.prototype.sayName = function () {
    console.log(this.name)
  }

  function Child (name, age) {
    // 借用构造函数实现继承
    Parent.call(this, name)
    this.age = age
  }

  // 子类通过 原型链 继承
  Child.prototype = new Parent()
  Child.prototype.constructor = Child // 注意, 如果没有说明，那么Child.prototype.constructor 就会是指向 Parent
  Child.prototype.sayAge = function () {
    console.log(this.age)
  }

  var ch1 = new Child('彭道宽', 21)
  ch1.colors.push('black')
  ch1.sayName() // 彭道宽
  ch1.sayAge() // 21
  console.log(ch1.colors) // ['red', 'yellow', 'black']

  var ch2 = new Child('PDK', 18)
  ch1.sayName() // PDK
  ch1.sayAge() // 18
  console.log(ch1.colors) // ['red', 'yellow']

```

### 原型式继承
ECMAScript5 新增Object.create()方法规范了原型式继承，这个方法接收两个参数 : *一个用作新对象原型的对象和一个为新对象定义额外属性的对象*。

```javascript
  var Parent = {
    name: 'PDK',
    friends: ['a', 'b', 'c']
  }

  var ch1 = Object.create(Parent)
  ch1.name = 'OB-1'
  ch1.friends.push('d')

  var ch2 = Object.create(Parent)
  ch2.name = 'OB-2'
  ch2.friends.push('e')

  console.log(Parent.friends) // ['a', 'b', 'c', 'd', 'e']
  console.log(Parent.name) // PDK

```
Object.create()方法的第二个参数与 `Object.defineProperties()` 方法的第二个参数格式相同，每个属性都是通过自己的描述符定义的。以这种方式指定的任何属性都会覆盖原型对象上的同名属性。

### 寄生式继承
思路与寄生构造函数和工厂模式类似，即创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后再像真地是它做了所有工作一样返回对象。

```javascript
  function Parent(origin) {
    var clone = Object.create(origin) // 通过调用函数来创建一个对象
    clone.sayHi = function () {
      console.log('hi')
    }
    return clone // 返回这个对象
  }

  var child = {
    name: 'pdk'
  }
  var resClone = Parent(child)
  resClone.sayHi() // "hi"

```

### 寄生组合式继承
所谓的寄生组合式继承，就是通过`借用构造函数`来继承属性，通过`原型链`的混用来继承方法。本质上，就是使用寄生式继承来继承超类型的原型，然后将结果指定给自类型的原型。跟组合式继承的区别在于，他不需要在一次实例中调用两次父类的构造函数。基本模式如下:

```javascript
  function inheritPrototype(Child, Parent) {
    var prototype = Object.create(Parent.prototype) // 创建对象
    prototype.constructor = Child // 增强对象 
    Child.prototype = prototype // 指定对象
  }
```
```javascript
  function Parent (name) {
    this.name = name
    this.colors = ['red', 'yellow']
  }

  Parent.prototype.sayName = function () {
    console.log(this.name)
  }

  function Child (name, age) {
    Parent.call(this, name)
    this.age = age
  }

  inheritPrototype(Child, Parent)

  Child.prototype.sayAge = function () {
    console.log(this.age)
  }

  var ch1 = new Child('彭道宽', 21)
  console.log(ch1.sayage) // 21

```

### ES6 的 Class 继承
```javascript
  class Parent {
    constructor (name) {
      this.name = name
    }
    
    doing () {
      console.log('parent doing something')
    }

    getName () {
      console.log('parent name: ', this.name)
    }

  }

  class Child extends Parent {
    constructor (name, parentName) {
      super(parentName)
      this.name = name
    }

    sayName () {
      console.log('child name: ', this.name)
    }
  }

  var ch1 = new Child('son', 'father')
  ch1.sayName() // child name: son
  ch1.getName() // parent name: son
  ch1.doing() // parent doing something

  var parent = new Parent('father')
  parent.getName() // parent name: father

```

#### class 实现原理
ES5 的继承，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）。ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到this上面（所以必须先调用super方法），然后再用子类的构造函数修改this。

在子类的构造函数中，只有调用 `super` 之后，才可以使用this关键字，否则会报错。这是因为子类实例的构建，基于父类实例，只有super方法才能调用父类实例。super作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次super函数。

```javascript
  class parent { }
  
  class Child extends Parent {
    constructor () {
      super()
    }
  }

```
注意，`super` 虽然代表了父类 Parent 的构造函数，但是返回的是子类 Child 的实例，即 super 内部的 `this` 指的是 Child，因此 `super()` 在这里相当于Parent.prototype.constructor.call(this)。

```javascript
  class parent { }
  
  class Child extends Parent { }

  Child.__proto__ === Parent // 继承属性
  Child.prototype.__proto__ === Parent.prototype // 继承方法

```

#### extends实现原理
```javascript
  //原型连接
  Child.prototype = Object.create(Parent.prototype)

  // B继承A的静态属性
  Object.setPrototypeOf(Child, Parent)

  //绑定this
  Parent.call(this)

```

### 最后来两个思考题
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

  // 这里多出几道题，理解一下原型和原型链
  console.log(instance1.constructor)
  console.log(SubType.prototype.constructor) 
  console.log(SubType.prototype.__proto__ == SuperType.prototype)
  console.log(instance1.__proto__ == SubType.prototype) 
  console.log(SubType.__proto__ == SuperType.prototype)
  console.log(SubType.__proto__ == Function.prototype)
  console.log(SuperType.prototype.constructor == SuperType) 
  console.log(SuperType.__proto__ == Function.prototype) 
  console.log(SuperType.prototype.__proto__ == Object.prototype)

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
  console.log(instance1.constructor) 
  console.log(SubType.prototype.constructor)
  console.log(SubType.prototype.__proto__) 
  console.log(SubType.prototype.__proto__ == SuperType.prototype) 
  console.log(SubType.prototype.__proto__ == Object.prototype)
  console.log(instance1.__proto__ == SubType.prototype)
  console.log(SubType.__proto__ == SuperType.prototype) 
  console.log(SubType.__proto__ == Function.prototype) 
  console.log(SuperType.prototype.constructor == SuperType) 
  console.log(SuperType.__proto__ == Function.prototype)
  console.log(SuperType.prototype.__proto__ == Object.prototype)

```

### 相关链接

ES6 入门 - Class 继承: http://es6.ruanyifeng.com/#docs/class-extends

博客 : https://github.com/PDKSophia/blog.io

原型与原型链 : https://github.com/PDKSophia/blog.io/blob/master/JavaScript%E7%AF%87-%E5%8E%9F%E5%9E%8B%E5%92%8C%E5%8E%9F%E5%9E%8B%E9%93%BE.md
