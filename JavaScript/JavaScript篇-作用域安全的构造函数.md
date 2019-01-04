## 作用域安全的构造函数
构造函数其实就是一个使用 `new` 操作符调用的函数。当使用 new 调用时，构造函数内用到的 this 对象会指向新创建的对象实例。比如下边的例子
```javascript
  function Person (name, age, job) {
    this.name = name
    this.age = age
    this.job = job
  }

  var p1 = new Person('彭道宽', 21, '前端工程师')
  console.log(p1.name) // 彭道宽
  console.log(p1.age) // 21

  console.log(window.name) // ''， 之所以不为undefined是由于window自带name属性，且该属性为 '' 
  console.log(window.age) // undefined

```
上面这个例子中，Person构造函数使用this对象给三个属性赋值: name、age和job。当和new 操作符连用时，则会创建一个新的 Person 对象，同时会给它分配这些属性。

问题出在当没有使用 new 操作符来调用该构造函数的情况上。由于该 this 对象是在运行时绑定的，所以直接调用 Person()， this 会映射到全局对象 window 上，导致错误对象属性的意外增加, 如下边例子

```javascript
  function Person (name, age, job) {
    this.name = name
    this.age = age
    this.job = job
  }

  var p1 = Person('彭道宽', 21, '前端工程师')
  console.log(p1.name) // Uncaught TypeError: Cannot read property 'name' of undefined
  console.log(p1.age) // Uncaught TypeError: Cannot read property 'age' of undefined

  console.log(window.name) // 彭道宽 
  console.log(window.age) // 21
```
这里，原本针对 Person 实例的三个属性被加到 window 对象上，<strong>因为构造函数是作为普通函数调用的</strong>，忽略了 new 操作符。这个问题是由 this 对象的晚绑定造成的，<strong>在这里 this 被解析成了 window 对象</strong>。

那么针对这种情况，如何解决呢？ 解决方式就是 <strong>`创建一个作用域安全的构造函数`</strong>。

作用域安全的构造函数在进行任何更改前，首先确认 this 对象是正确类型的实例。如果不是，那么会创建新的实例并返回

```javascript
  function Person (name, age, job) {
    if (this instanceof Person) {
      this.name = name
      this.age = age
      this.job = job
    } else {
      return new Person(name, age, job)
    }
  }

  var p1 = Person('彭道宽', 21, '前端工程师')
  console.log(window.name)  // ''
  console.log(p1.name)      // 彭道宽

  var p2 = new Person('PDK', 18, 'Web')
  console.log(window.name)  // ''
  console.log(p2.name)      // PDK

```
这段代码中的 Person 构造函数添加了一个检查并确保 this 对象是 Person 实例的 if 语句，它表示要么使用 new 操作符，要么在现有的 Person 实例环境中调用构造函数。任何一种情况下，对象初始化都能正常进行。如果 this 并非 Person 的实例，那么会再次使用 new 操作符调用构造函数并返回结果。最后的结果是，*调用 Person 构造函数时无论是否使用 new 操作符，都会返回一个 Person 的新实例*。

但是你以为这就没问题了嘛？？不存在的，如果你使用了作用域安全的构造函数之后，你就锁定了可以调用构造函数的环境。这时候，如果你使用构造函数窃取模式的继承且不使用原型链，那么这个继承很可能被破坏, 比如下边代码

```javascript
  function Person(len) {
    if (this instanceof Person) {
      this.len = len
      this.getArea = function () {
        return 0
      }
    } else {
      return new Person(len)
    }
  }

  function Child(height, width) {
    Person.call(this, 3)
    this.height = height
    this.width = width
    this.getArea = function () {
      return this.height * this.width
    }
  }

  var ch1 = new Child(5, 10)
  console.log(ch1.len)  // undefined  
  console.log(ch1.constructor) // Child
  console.log(Child.prototype.constructor) // Child
  console.log(ch1.__proto__ === Child.prototype)  // true
  console.log(Child.__proto__ === Person.prototype)  // false
  console.log(Child.__proto__ === Function.prototype)  // true

```
在这段代码中，Person 构造函数是作用域安全的，然而 Child 构造函数则不是。新创建一个 Child 实例之后，这个实例应该通过 Person.call() 来继承 Person 的 len 属性。但是，由于 Person 构造函数是作用域安全的，this 对象并非 Person 的实例，所以会创建并返回一个新的 Person 对象。Child 构造函数中的 this 对象并没有得到增长, 换句话说，Person.call() 并没有实现继承。所以 Child 实例中就没有 len 这个属性

那么又该如何解决呢？<strong>使用构造函数窃取结合使用 `原型链` 或者 `寄生组合` 则可以解决这个问题</strong>

```javascript
  function Person(len) {
    if (this instanceof Person) {
      this.len = len
      this.getArea = function () {
        return 0
      }
    } else {
      return new Person(len)
    }
  }

  function Child(height, width) {
    Person.call(this, 3)
    this.height = height
    this.width = width
    this.getArea = function () {
      return this.height * this.width
    }
  }

  Child.prototype = new Person()

  var ch1 = new Child(5, 10)
  console.log(ch1.len)  // 3
  console.log(ch1.constructor) // Person
  console.log(Child.prototype.constructor) // Person
  console.log(ch1.__proto__ === Child.prototype) // true 
  console.log(Child.__proto__ === Function.prototype) // true
  console.log(Person.__proto__ === Function.prototype) // true
  
```
为什么加了一句 `Child.prototype = new Person()` 就可以了呢？因为一个 Child 实例也同时是一个 Person 实例，所以 Person.call() 会照原意执行，最终为 Child 实例添加了 len 属性
