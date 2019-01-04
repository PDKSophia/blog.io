## 私有变量

严格来讲，`JavaScript 中没有私有成员的概念;所有对象属性都是公有的`。不过，倒是有一个私有变量的概念。任何在函数中定义的变量，都可以认为是私有变量，因为不能在函数的外部访问这些变量

私有变量包括: `函数的参数`、`局部变量`和在`函数内部定义的其他函数`，比如:

```javascript
  function add(num1, num2){
    var sum = num1 + num2;
    return sum;
  }
```
在这个函数内部，有 3 个私有变量:num1、num2 和 sum。在函数内部可以访问这几个变量，但在函数外部则不能访问它们。<strong>如果在这个函数内部创建一个闭包，那么闭包通过自己的作用域链也可以访问这些变量。</strong>而利用这一点，就可以创建用于访问私有变量的公有方法。

我们把有权访问私有变量和私有函数的公有方法称为`特权方法`。有两种在对象上创建特权方法的方式。第一种是在构造函数中定义特权方法，基本模式如下
```javascript
  function MyObject(){
    var privateVariable = 10

    function privateFunction () {
      return false
    }

    this.publicMethod = function (){
      privateVariable++
      return privateFunction()
    }
  }
```
这个模式在构造函数内部定义了所有私有变量和函数。然后，又继续创建了能够访问这些私有成员的特权方法。能够在构造函数中定义特权方法，是因为<strong>特权方法作为`闭包`有权访问在构造函数中定义的所有变量和函数</strong>。(说白了，`特权方法就是闭包`，而利用闭包的作用域链，可以访问到外部函数的变量和方法)。对这个例子而言，变量 privateVariable 和函数 privateFunction()只能通过特 权方法 publicMethod()来访问。在创建 MyObject 的实例后，除了使用 publicMethod()这一个途 径外，没有任何办法可以直接访问 privateVariable 和 privateFunction()。

### 静态私有变量
```javascript
  (function(){
    //私有变量和私有函数
    var privateVariable = 10

    function privateFunction() {
      return false;
    }

    //构造函数
    MyObject = function(){ }

    //公有/特权方法
    MyObject.prototype.publicMethod = function(){
      privateVariable++
      return privateFunction()
    }
  })()
```
> 记住 : 初始化未经声明的变量，总是会创建一个全局变量

- 这个模式创建了一个私有作用域，并在其中封装了一个构造函数及相应的方法

- 在私有作用域中， 首先定义了私有变量和私有函数，然后又定义了构造函数及其公有方法

- 这个模式在定义构造函数时并没有使用函数声明，而是`使用了函数表达式`。函数声明只能创建局部函数，但那并不是我们想要的。出于同样的原因，我们也没有在声明 MyObject 时使用 var 关键字

- 因此，MyObject 就成了一个全局变量，能够在私有作用域之外被访问到。但也要知道，在严格模式下 给未经声明的变量赋值会导致错误

这个模式与在构造函数中定义特权方法的主要区别: 就在于<strong><em>私有变量和函数是由实例共享的</em></strong>。由于特权方法是在原型上定义的，因此所有实例都使用同一个函数。而这个特权方法，作为一个闭包，总是保存着对包含作用域的引用

### 模块模式
前面的模式是用于为自定义类型创建私有变量和特权方法的, 而道格拉斯所说的模块模式(module pattern)则是为单例创建私有变量和特权方法。所谓单例(singleton)，指的就是只有一个实例的对象。 按照惯例，<em>JavaScript 是以对象字面量的方式来创建单例对象的。</em>

> 模块模式通过为单例添加私有变量和特权方法能够使其得到增强
```javascript
  var singleton = function () {

    //私有变量和私有函数
    var privateVariable = 10
    function privateFunction () {
      return false
    }

    // 特权/公有方法和属性
    return {
      publicProperty: true,
      publicMethod: function () {
        privateVariable++
        return privateFunction()
      }
    }
  }()
```
这个模块模式使用了一个返回对象的匿名函数。在这个匿名函数内部，首先定义了私有变量和函数。 然后，<em>将一个对象字面量作为函数的值返回</em>。返回的对象字面量中只包含可以公开的属性和方法。由于这个对象是在匿名函数内部定义的，因此它的公有方法有权访问私有变量和函数。从本质上来讲，这个对象字面量定义的是单例的公共接口

有人进一步改进了模块模式，即在返回对象之前加入对其增强的代码。这种增强的模块模式适合那 些单例必须是某种类型的实例，同时还必须添加某些属性和(或)方法对其加以增强的情况。来看下面的例子

```javascript
  var singleton = function () {

    //私有变量和私有函数
    var privateVariable = 10
    function privateFunction () {
      return false
    }

    // 创建对象
    var obj = new Object()

    // 特权/公有方法和属性
    obj.publicProperty = true
    obj.publicMethod - function () {
      privateVariable++
      return privateFunction()
    }
    
    // 返回这个对象
    return obj
  }()
```
