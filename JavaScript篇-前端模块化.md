---
title:JavaScript篇-前端模块化
date: 2018-10-08 15:31:57
tags:
---
## 谈谈前端模块化
### 为什么要模块化？
在之前的项目中，如果没有模块化的概念，很多变量都有重名或者不小心重新赋值的危险。而且用 script 有可能阻塞 HTML 的下载或者渲染，影响用户体验

模块化的开发方式可以提高代码复用率，方便进行代码的管理。通常一个文件就是一个模块，有自己的作用域，只向外暴露特定的变量和函数


### CommonJS
commonJS是服务器端的规范，node.js就是采用这种规范，在commonJS中有一个require全局性方法，用于加载模块，因为commonJS不适用于浏览器环境。因为所有的模块都是存放在本地磁盘中，可以同步加载完成，等待时间就是硬盘读取时间

```javascript
    //  举个例子 
    require('math')，那么我们想执行 math.add(2, 3)得等到 math.js 加完之后，才能运行。
    
    如果我们的网速不好，加载时间过长，那么整个应用就要停止等待，页面进“ 假死 ” 状态。

    并且在我们require过一次math.js之后，下次直接从node_cache中加载该模块

```

看看CommonJS的语法
```javascript
    // header.js
    module.exports = {
        title: '我是柚子'
    };

    // main.js
    var header = require('./header');

    这里的 module 代表的是当前模块，它是一个对象，把它打印出来是下面的结果：
    {
        Module {
            id: '/Users/pdk/2018/css-animation/js/b.js',
            exports: { item: 'item' },
            loaded: false,
            ...
            ...
        }
    }

    id 是该模块的 id
    loaded 代表改模块是否加载完毕
    exports 是一个对象，里面有模块输出的各个接口。也就是对外开发的接口，加载某个模块，其实是加载该模块的module.exports属性。

    模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。

    // 删除指定模块的缓存
    delete require.cache[moduleName];

    // 删除所有模块的缓存
    Object.keys(require.cache).forEach(function(key) {
        delete require.cache[key];
    })

```
<!--more-->

#### Module对象
Node内部提供一个Module构建函数。所有模块都是Module的实例。
```javascript
    function Module(id, parent) {
        this.id = id;
        this.exports = {};
        this.parent = parent;
        // ...
    }

    module.id 模块的识别符，通常是带有绝对路径的模块文件名。
    module.filename 模块的文件名，带有绝对路径。
    module.loaded 返回一个布尔值，表示模块是否已经完成加载。
    module.parent 返回一个对象，表示调用该模块的模块。
    module.children 返回一个数组，表示该模块要用到的其他模块。
    module.exports 表示模块对外输出的值。
```
#### Module.exports 和 exports
Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令

```javascript
    // 基本实现
    var module = {
        exports: {} // exports 就是个空对象
    }
    // 这个是为什么 exports 和 module.exports 用法相似的原因
    var exports = module.exports

    // 造成的结果是,在对外输出模块接口时，可以向exports对象添加方法
    exports.area = function (r) {
        return Math.PI * r * r;
    }

```
注意，不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的联系。
```javascript
    // 无效写法,exports不再指向module.exports了。
    exports = function(x) {
        console.log(x)
    }

    // 如果一个模块的对外接口，就是一个单一的值，不能使用exports输出，只能使用module.exports输出。
    module.exports = function (x) { 
        console.log(x);
    }

    如果你觉得，exports与module.exports之间的区别很难分清，一个简单的处理方法，就是放弃使用exports，只使用module.exports。
```
### AMD
异步加载，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都会定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。
```javascript
    AMD 也采用require()加载模块

    require([module1, module2, ...] , callback)

    比如上边照样引入 math.js , 那么可以写成这样

    require(['math'], function(math) {
        math.add(2, 3)
    })

    math.add()  math 模块化加载不是同步的，浏览不会假死。
```

### 再多说句废话
commonJS是服务器端模块规范，node.js采用这种规范，commonJS是同步加载模块，对与服务器来说这不是问题，因为所以模块都是存放在本地磁盘中，所以同步加载完成等待时间就是磁盘读取时间，但对于浏览器来说，等待时间取决于网速的快慢，可能等太久，浏览器就会进入到假死状态

### 相关链接
CommonJS规范 : http://javascript.ruanyifeng.com/nodejs/module.html

