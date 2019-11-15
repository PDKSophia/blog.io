# 前言

> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io)

为什么自己会有这个专题的文章，因为想提高自己，也想帮助其他跟我一样的前端渣渣，一开始的时候，对JS设计模式，真的是觉得很难，问过别人，你的项目中用了设计模式吗，他说有啊，我说能让我看看吗，他告诉我，设计模式是一种思想，这个我也不好说，你得去看看书，看看一些优秀项目的源码，看看别人是怎么设计的。

于是，我就踏上了`不归之路`，学习就是这样，得靠驱动力，我的驱动力就是，这玩意我不会，妈的，装不了逼，我得学，好在群里装逼；好的，学就是了...

开个玩笑，其实掏心窝来说，之所以学习设计模式，目的性很明确 :

- 提升自己的能力
- 职级晋升，加薪

接触的东西多了之后，才发现，前端真的不是会写写页面就完了，对于前端这个领域，相信大家都是自己折腾一路走来，比如从最基础的HTML、CSS、JS，再到jQuery、再回到JS，什么？三大框架必须要掌握一个？然后选择Vue、再到React。

我在大学里，没前端这么课程，只有一个最简单基础的 HTML/CSS ，教材还是相对比较旧的(前端发展太快了)，对于很多东西，都是靠自己学，从学习的过程中，会发现，原来要学的还有那么多，而且不仅仅只是前端技术，其他方方面面都要涉猎一些。

比如说 : webpack打包优化、网络、git、算法、性能优化、设计模式各种

再比如可能还需要Node、Egg、redis、electron...(自己知识面也比较局限)

> 我导师对我说过，react官方文档中，其实随便取一个知识点，深入去了解，你就会发现，真的是会刷新自己的看法，前段时间踩到过两次react合成事件的坑，于是真的去深入看了一下react合成事件，才发现，卧槽，这么牛逼？如果你想知道react合成事件的内幕，👉戳这里:  [react合成事件的内幕](https://juejin.im/post/5d43d7016fb9a06aff5e5301)

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6cfeedf461298?w=258&h=196&f=jpeg&s=7394' width=200 />

知识太多，学的也太多，(妈耶，好像扯远了...) 反正大家一起努力，共勉 ~

> 以下知识来自`《JavaScript 设计模式》`和`《JavaScript 设计模式核⼼原理与应⽤实践》`，我是看懂之后，然后自己总结 ~ 当然也会记录书中的一些知识点，直接摘抄下来了，**关于小册，如用到其中的文字，也会表明出处。**

👉 推荐一下大佬小册: [《JavaScript 设计模式核⼼原理与应⽤实践》](https://juejin.im/book/5c70fc83518825428d7f9dfb/section/5c70fc845188256282697b96)，个人觉得写的真的挺好的

👇 下边的可能会有点啰嗦，但是也很重要的！！！当然，如果你不想看，可直接跳到构造器模式、工厂模式，直接从那里开始， 但是还是建议，耐住性子，看下去 ~

## 淬体篇

### 什么是模式？

模式是一种可服用的解决方案，用于解决软件设计中遇到的常见问题。

设计模式有三大好处 :

- 模式是已经验证的解决方案
- 模式很容易被复用
- 模式富有表达力

太抽象了？举个简单例子，作为一个前端开发的先进码农，不可避免的就是 `元素选择`，比如说 : 我们想要为每个具有 `clist` 类(class 属性)的 DOM 元素添加一个 `class = 'active'`的操作，有几种方法?

- 在页面上选择所有元素并存储，然后写一个正则表达式来匹配具有 `clist`类的元素
- 使用浏览器原生的`querySelectorAll()`来选择具有 `clist`类的元素
- 使用原生特性`getElementsByClassName()`等功能来重新获得所需的集合

哪种方法会更快？第三种，但是问题就在于，第三种在 IE9 以下的版本不支持。

但是如果我们使用 jQuery 的话，就不用担心这个问题，因为 jQuery 通过使用 `Facade(外观)模式`，它已经被抽象出来了，也就是说，这个模式，为若干更复杂的底层代码提供了一套简单的抽象接口(例如`$el.css()`和`$el.animate()`)。

jQuery 会根据现有浏览器支持范围，在幕后选择最佳的元素选择方式，我们只需要使用抽象层就好了。

### 什么是反模式？

反模式是 :

- 描述一种针对某个特定问题的不良解决方案，该方案会导致糟糕的情况发生
- 描述如何摆脱前述的糟糕情况以及如何创造好的解决方案

总的来说，反模式是一种值得记录的不良设计，JavaScript 中的反模式有 :

- 在全局上下文中定义大量的变量污染全局命名空间
- 向 `setTimeout`或`setInterval`传递字符串，而不是函数，这会触发`eval()`的内部使用
- 修改 Object 的原型
- 以内联形式使用 JavaScript
- 在使用 `document.createElement`等原生 DOM 方法更合适的情况下使用`document.write`，因为使用 document.write 存在一些缺点，比如: 如果在页面加载完成后执行，它会重写页面，而 document.createElement 不会

## 筑基篇

### 设计模式类别

#### 创建型设计模式

创建型设计模式主要专注于处理对象创建机制，以合适给定情况的方式来创建对象。

属于创建型设计模式的有:

- Constructor(构造器模式)
- Factory(工厂模式)
- Abstract(抽象模式)
- Prototype(原型模式)
- Singleton(单例模式)
- Buider(生成器模式)

#### 结构型设计模式

结构型设计模式与对象组合有关，通常可以用于找出在不同对象之间建立关系的简单方法。

属于结构型设计模式的有:

- Decorator(装饰者模式)
- Facade(外观模式)
- Flyweight(享元模式)
- Adapter(适配器模式)
- Proxy(代理模式)

#### 行为设计模式

行为设计模式专注于改善或简化系统中不同对象之间的通信

属于行为设计模式的有:

- Iterator(迭代器模式)
- Mediator(中介者模式)
- Observer(观察者模式)
- Visitor(访问者模式)

## 金丹篇

❗ 设计模式是一种思想

> 设计模式是软件开发人员在软件开发过程中面临的一般问题的解决方案。这些解决方案是众多软件开发人员经过相当长的一段时间的试验和错误总结出来的。

设计模式的五大基本原则:

- 单一功能原则（Single Responsibility Principle）
- 开放封闭原则（Opened Closed Principle）
- 里式替换原则（Liskov Substitution Principle）
- 接口隔离原则（Interface Segregation Principle）
- 依赖反转原则（Dependency Inversion Principle）

> 在 JS 设计模式中，**最核心的思想——封装变化**，怎么理解，比如我们写一个东西，这个东西在初始 v1.0.0 的时候是这 diao 样，到了 v10.0 甚至 v100.0 还是这 diao 样，不接受迭代和优化，ojbk，你爱怎么写就怎么写，你只要实现就可以了。    ------来自《JavaScript 设计模式核⼼原理与应⽤实践》掘金小册

but !!!显示中，产品一定会提新需求，一定要做版本迭代，一定要升级优化，所以说，不改变的代码时不存在的 ~~~

> 我们能做的只有将这个变化造成的影响最小化 —— 将变与不变分离，确保变化的部分灵活、不变的部分稳定。 ------来自《JavaScript 设计模式核⼼原理与应⽤实践》掘金小册

记住 : **设计模式的核心操作是去观察你整个逻辑里面的变与不变，然后将变与不变分离，达到使变化的部分灵活、不变的地方稳定的目的**。

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6cffe19a9e823?w=508&h=479&f=jpeg&s=17797' width=200 />

## 结婴篇
### 构造器模式

在面向对象编程中，构造器是一个当新建对象的内存被分配后，用来初始化该对象的一个特殊函数。在 JavaScript 中几乎所有的东西都是对象

Object 构造器用于创建特定类型的对象————准备好对象以备使用，同时接收构造器可以使用的参数，以在第一次创建对象时，设置成员属性的方法的值

#### 对象创建

创建对象的三种基本方式

```javascript
// 第一种
let obj = {};

// 第二种
let obj = Object.create(null);

// 第三种
let obj = new Object();
```

#### 白话说构造器

看着《Javascript 设计模式》这本书，讲得比较理论，其实`构造器模式`真的是天天都在用了，举个例子

双十一过了，小彭吐槽小何没有女朋友，作为一名程序狗，岂能让人看不起，**我没对象，我还不能自己 new 一个对象出来？**

于是，小何洋洋洒洒的在 VS Code 中写下了这段代码 :

```js
const myGirlFriend = {
  name: "小何女朋友",
  age: 18,
  cup: "36D",
  hobby: "吃鸡，王者"
};
```

过了两天，小何的基友小谭跑过来要小何也帮他 new 一个女朋友，小何心想，这特么不简单吗，问: “你女朋友想找多大的，什么 cup，爱好是啥”
于是，小何很神气的又写下了这段代码

```js
const tanGirlFriend = {
  name: "小谭女朋友",
  age: 22,
  cup: "36E",
  hobby: "旅行，爬山"
};
```

让小何意想不到的是，他居然火了，很多单身同胞都来找他，要他帮忙 new 一个对象

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6d0247efdb9d9?w=260&h=260&f=jpeg&s=10325' width=200 />

于是陆陆续续来人，小何一看，妈呀，整个班的人都来了，30 号人，小何告诉自己，我可以，我行 ！

但是意想不到的是，出名到整个学院了，几百上千号人都来，要死要死，我要写啥时候，于是，他急中生智，用了`构造函数`

于是小何写出了一个可以自从创建女朋友的函数:

```js
function GirlFriend(name, age, cup, hobby) {
  this.name = name;
  this.age = age;
  this.cup = cup;
  this.hobby = hobby;

  this.toCopyright = function() {
    console.log(`我是被小何创造出来的对象，我叫${this.name}`);
  };
}
```

然后呢，小何再也不需要手写字面量了，每次来一个人，我就调用一次

```js
const daiGirl = new GirlFriend("小戴女朋友", 20, "36F", "机车");
const xieGirl = new GirlFriend("小谢女朋友", 19, "36C", "看书");
```

像 `GirlFriend` 这样当新建对象的内存被分配后，用来初始化该对象的特殊函数，就叫做构造器。

用构造器去初始化对象，这就是构造器模式，牛逼！

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6d02db1b94cc0?w=225&h=225&f=jpeg&s=6267' width=200 />

#### 带原型的构造器

上边的代码，我们来看看，会有什么问题

首先继承上会变得困难，其次是，小何想，像 `this.toCopyright()` 这样的函数，应该在所有的`GirlFriend`类型实例之间共享。（这是我的版权！！！）

JavaScript 中函数有一个 `prototype` 的属性。当我们调用 JavaScript 的构造器创建一个对象时，新对象就会具有构造器原型的所有属性。

稳啊，太强了！

```js
function GirlFriend(name, age, cup, hobby) {
  this.name = name;
  this.age = age;
  this.cup = cup;
  this.hobby = hobby;
}

GirlFriend.prototype.toCopyright = function() {
  console.log(`我是被小何创造出来的对象，我叫${this.name}`);
};
```

现在 `toCopyright()`的单一实例就能在所有`GirlFriend`对象之间共享

### 工厂模式

#### 简单工厂

小何可轻松了，在使用构造模式造福了整个学院的单身狗之后，突然有一天，小谭来找小何

小谭 : “何总啊，你给我 new 的这个女朋友，我就只知道她的一丢丢信息，但是我不知道她哪的人，你能不能给我 new 一个重庆的小姐姐啊，我喜欢吃辣的妹子 ~”

小谢在旁边听到了，忙着说我也要，我想找一个广州的小姐姐，我比较喜欢吃清淡的妹子！

小何一想，我日，你们两要求还挺多。

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6d038a05c4284?w=225&h=225&f=jpeg&s=7635' width=200 />

完了，前边的女朋友共性都被拆离了，本来规定就只有 ` name``age `、`cup`、`hobby` 的，现在居然还要出生地，哈卖批！

小谭 : “我可以给你发个红包~”

小谢 : “我现在就给你发”

小何一听，干了，有钱能使鬼推磨，不就是多一个字段嘛

```js
function ChongQingGirlFriend(name, age, cup, hobby) {
  this.name = name
  this.age = age
  this.cup = cup
  this.hobby = hobby
  this.birthplace = '重庆'
}

function GuangZhouGirlFriend(name, age, cup, hobby) {
  this.name = name
  this.age = age
  this.cup = cup
  this.hobby = hobby
  this.birthplace = '广州'
}
```

哦吼，小何没想到，这特么的，大家一听到可以自定义出生地的女朋友，直接疯狂找他，红包拆到手软

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6d04dd258287f?w=221&h=228&f=jpeg&s=4977' width=200 />

当小何从`重庆`写到`广州`，再从`广州`写到`北京`、`上海`、`成都`... 他突然意思到，这量有点大啊

我得写到啥时候，算了，我用工厂模式吧 ~

```js
function FactoryGirlFriend(name, age, cup, hobby, birthplace) {
  if (birthplace === "chongqing") {
    return new ChongQingGirlFriend(name, age, cup, hobby);
  }
  if (birthplace === "chengdu") {
    return new GuangZhouGirlFriend(name, age, cup, hobby);
  }
  if (birthplace === "beijing") {
    return new BeiJingGirlFriend(name, age, cup, hobby);
  }
  if (birthplace === "shanghai") {
    return new ShangHaiGirlFriend(name, age, cup, hobby);
  }
  ...
}
```

真好，但是我国共划分为 23 个省、5 个自治区、4 个直辖市、2 个特别行政区，要划分再细一些，想想这个 if 语句有些庞大？

小何心想，我总不能，写 n 个城市女朋友吧，这特么得写到啥时候，于是小何再次封装，此时只需要两个构造器就能完成

```js
function GirlFriend(name, age, cup, hobby, birthplace, eatType) {
  this.name = name;
  this.age = age;
  this.cup = cup;
  this.hobby = hobby;
  this.birthplace = birthplace;
  this.eatType = eatType
}

function FactoryGirlFriend(name, age, cup, hobby, birthplace) {
    let eatType = '';
    switch(birthplace) {
        case 'chongqing':
            eatType = '吃辣，辣的一匹';
            break;
        case 'guangzhou':
            eatType = '吃清淡，喝粥喝茶';
            break;
        case 'fuzhou':
            eatType = '沙县，闽南菜';
            break;
        ....
    }
    return new GirlFriend(name, age, cup, hobby, birthplace, eatType);
}
```

真香啊，工厂模式大法就是好 ~

👉 那么我们该什么时候使用工厂模式?

- 对象或者组件设置涉及到高程度级别的复杂度时。
- 根据我们所在的环境方便的生成不同对象的实体时。
- 在许多共享同一个属性的许多小型对象或组件上工作时。
- 当带有其它仅仅需要满足一种 API 约定(又名鸭式类型)的对象的组合对象工作时.这对于解耦来说是有用的。

可能这里有人会觉得，我直接这么写不也可以？

```js
function FactoryGirlFriend(name, age, cup, hobby, birthplace) {
    this.name = name;
    this.age = age;
    this.cup = cup;
    this.hobby = hobby;
    this.birthplace = birthplace;

    let eatType = '';
    switch(birthplace) {
        case 'chongqing':
            this.eatType = '吃辣，辣的一匹';
            break;
        case 'guangzhou':
            this.eatType = '吃清淡，喝茶喝粥';
            break;
        case 'fuzhou':
            this.eatType = '沙县，闽南菜';
            break;
        ....
    }
}
```

ojbk 啊，你这么写又没错，最终效果是一样的，但是思想是不一样的，所以说设计模式是一种思想 ~
前面说了，设计模式遵循“开放封闭原则”，这里的工厂模式，`GirlFriend`是用来生成女朋友，它的目的就很纯粹，你给我啥，我就给你 new 啥对象，而`FactoryGirlFriend`主要是根据出生地，然后给予这个女朋友一些饮食特性。

这里的`GirlFriend`遵循了“封闭”原则，而`FactoryGirlFriend`遵循“开放”原则，如果只是使用`GirlFriend`，需求一旦改变，`GirlFriend`就会改变。只满足“开放”，不满足“封闭”原则。

#### 抽象工厂

在 《JavaScript 设计模式》书中，对抽象工厂是这么解释的，它的目标是以一个通用的目标将一组独立的工厂进行封装.它将一堆对象的实现细节从它们的一般用例中分离。

现在小何开一个淘宝店铺，专门帮人 new 女朋友，大量生产，于是，小何心想，要 new 一个女朋友，有需要南方姑娘，有需要北方姑娘，这就算了，小戴居然加钱，要我帮他 new 一个东北小姐姐，要那种贼能喝酒的；小刘要我找个西北新疆的漂亮美眉，要超级美的那种 ~

<img src='https://user-gold-cdn.xitu.io/2019/11/15/16e6d06d7fd1bff8?w=225&h=225&f=png&s=9737' width=200 />

这可咋整，哪天又来一个要东北小姐姐，西北大美人，我就没了...于是呢，他想到了曾经在某本书上看到的抽象工厂

> 抽象工厂模式创建的是类簇，而非是具体某一个类的实例。抽象工厂模式适用于系统里有多于一个的产品族，而只需要用到某一族的类的场景

```js
// 抽象工厂方法
function AbstractFactoryGirlFriend(child, parent) {
  if (typeof AbstractFactoryGirlFriend[parent] === 'function') {
    function F() {}
    F.prototype = new AbstractFactoryGirlFriend[parent]()
    child.constructor = parent
    parent.prototype = new F()
  } else {
    throw new Error('不能创建该抽象类')
  }
}
```

```js
// 定义抽象类的结构

// 北方姑娘抽象类
AbstractFactoryGirlFriend.NorthGirl = function() {
  this.position = 'north'
  this.author = '小何'
}
AbstractFactoryGirlFriend.NorthGirl.prototype = {
  northFeature() {
    return new Error('抽象方法不能调用')
  },
  myFeature() {
    return new Error('抽象方法不能调用')
  }
}

// 南方姑娘抽象类
AbstractFactoryGirlFriend.SouthGirl = function() {
  this.position = 'south'
}
AbstractFactoryGirlFriend.SouthGirl.prototype = {
  southFeature() {
    return new Error('抽象方法不能调用')
  },
  myFeature() {
    return new Error('抽象方法不能调用')
  }
}
```

```js
// 定义具体的类如下
// 北方姑娘: 东北的小姐姐
function NorthEastGirl(name, cup, customize) {
  this.category = '东北'
  this.name = name
  this.cup = cup
  this.customize = customize
}
AbstractFactoryGirlFriend(NorthEastGirl, 'NorthGirl')
NorthEastGirl.prototype.northFeature = function() {
  return `我的名字是${this.name}, 我是个${this.category}姑娘，我的cup是${this.cup}`
}
NorthEastGirl.prototype.myFeature = function() {
  return JSON.stringify(this.customize)
}

// 北方姑娘: 西北的小姐姐
function NorthWestGirl(name, cup, customize) {
  this.category = '西北'
  this.name = name
  this.cup = cup
  this.customize = customize
}
AbstractFactoryGirlFriend(NorthWestGirl, 'SouthGirl')
NorthWestGirl.prototype.northFeature = function() {
  return `我的名字是${this.name}, 我是个${this.category}姑娘，我的cup是${this.cup}`
}
NorthWestGirl.prototype.myFeature = function() {
  return JSON.stringify(this.customize)
}
```

到了第二天，小谭来找小何...

小谭 : “何少，拜托你的事咋样了？”

小何问 : “再说一遍你的要求”

小谭 : “20 出头，漂亮，36D cup，要东北的，那种啤酒随便灌，白酒五斤半的小姐姐”

小何 : “ojbk~”

```js
const TanNorthEastGirl = new NorthEastGirl('小谭女朋友', '36D', { beer: '随便灌', liquor: '五斤半' })
TanNorthEastGirl.northFeature()
TanNorthEastGirl.myFeature()
```

小刘一看，马马发红包，别说了，小何: “你别说了，新疆，跪票，你自己去找吧”

```js
const LiuNorthWestGirl = new NorthWestGirl('小刘女朋友', '36C', { sexy: true, beautiful: true})
LiuNorthWestGirl.northFeature()
LiuNorthWestGirl.myFeature()
```

## 最后多少两句

暂时先讲构造器模式和工厂模式，通过梳理成博客，确实香了很多，对自己理解也有所帮助，下次会输出其他设计模式的文章，不过我还是想说一下，那本小册是真的有用，良心推荐 ~

- [阿宽的博客](https://github.com/PDKSophia/blog.io)
- [阿宽的书单](https://github.com/PDKSophia/read-booklist)
- [阿宽带你看JavaScript设计模式](https://github.com/PDKSophia/DesignPatternsToJS)