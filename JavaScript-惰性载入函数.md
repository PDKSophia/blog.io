## 惰性载入函数
因为浏览器之间行为的差异，多数 JavaScript 代码包含了大量的 if 语句，将执行引导到正确的代码中。比如说，你调用某一函数判断a的时候，总会走一些其他的分支，比如说 if (a<3) , else if (a > 20)，在你第一次执行该函数的时候就知道 a = 10，那么第二次，第三次执行该函数，就没必要走这些分支了。举个例子，打卡第十五天里的 [createXHR()](https://github.com/PDKSophia/read-booklist/blob/master/JavaScript%E9%AB%98%E7%BA%A7%E7%BC%96%E7%A8%8B%E8%AE%BE%E8%AE%A1/play-card-15.md#xmlhttprequest%E5%AF%B9%E8%B1%A1) 函数:

```javascript
  function createXHR () {
    if (typeof XMLHttpRequest != 'undefined') {
      return new XMLHttpRequest()  // 返回IE7及更高版本
    } else if (typeof ActiveObject != 'undefined') { // 适用于IE7之前的版本
      if (typeof arguments.callee.activeXString != 'String') {
        var version = [ "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"]
        var i, len
        for (i = 0; i < versions.length; i++) {
          try {
            new ActiveObject(versions[i])
            arguments.callee.activeXString = versions[i]
            break
          } catch (error) {
            // 跳过
          }
        }
      }
      return new ActiveObject(arguments.callee.activeXString)
    } else {
      throw new Error('NO XHR object available')
    }
  }
```
每次调用 createXHR()的时候，它都要对浏览器所支持的能力仔细检查。

首先检查内置的 XHR， 然后测试有没有基于 ActiveX 的 XHR，最后如果都没有发现的话就抛出一个错误。每次调用该函数都是这样，即使每次调用时分支的结果都不变: 如果浏览器支持内置 XHR，那么它就一直支持了，那么这 种测试就变得没必要了。

> 即使只有一个 if 语句的代码，也肯定要比没有 if 语句的慢，所以如果 if 语句不必每次执行，那么代码可以运行地更快一些。解决方案就是称之为 `惰性载入` 的技巧。惰性载入表示函数执行的分支仅会发生一次。

有两种实现惰性载入的方式，第一种就是在函数被调用时再处理函数。在第一次调用的过程中，该函数会被覆盖为另外一个按合适方式执行的函数，这样任何对原函数的调用都不用再经过执行的分支了

```javascript
  function createXHR () {
    if (typeof XMLHttpRequest != 'undefined') {
      createXHR = function () {
        return new XHLHttpRequest()
      }
    } else if (typeof ActiveObject != 'undefined') {
      createXHR = function () {
        if (typeof arguments.callee.activeXString != 'String') {
          var version = [ "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"]
          var i, len
          for (i = 0; i < versions.length; i++) {
            try {
              new ActiveObject(versions[i])
              arguments.callee.activeXString = versions[i]
              break
            } catch (error) {
              // 跳过
            }
          }
        }
        return new ActiveObject(arguments.callee.activeXString)
      }
    } else {
      createXHR = function () {
        throw new Error('NO XHR object available')
      }
    }

    return createXHR()
  }

```
在这个惰性载入的 createXHR()中，if 语句的每一个分支都会为 createXHR 变量赋值，有效覆盖了原有的函数。最后一步便是调用新赋的函数。下一次调用 createXHR()的时候，就会直接调用被分配的函数，这样就不用再次执行 if 语句了。

第二种实现惰性载入的方式是在声明函数时就指定适当的函数。这样，第一次调用函数时就不会损失性能了，而在代码首次加载时会损失一点性能。(其实就是通过匿名函数立即执行)

```javascript
  var createXHR = (function() {
    if (typeof XMLHttpRequest != 'undefined') {
      return function () {
        return new XHLHttpRequest()
      }
    } else if (typeof ActiveObject != 'undefined') {
      return function () {
        if (typeof arguments.callee.activeXString != 'String') {
          var version = [ "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"]
          var i, len
          for (i = 0; i < versions.length; i++) {
            try {
              new ActiveObject(versions[i])
              arguments.callee.activeXString = versions[i]
              break
            } catch (error) {
              // 跳过
            }
          }
        }
        return new ActiveObject(arguments.callee.activeXString)
      }
    } else {
      return function () {
        throw new Error('NO XHR object available')
      }
    }
  })()
```
