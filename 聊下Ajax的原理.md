---
title: 聊下Ajax的原理
date: 2018-10-08 15:25:26
tags:
---
## Ajax 原理
通过XMLHttpRequest对象来向服务器发起异步请求，从服务器获得数据然后通过JS操作dom从而刷新页面

原生写一个ajax
```javascript
    var xhr = new XMLHttpRequest()
    xhr.open('get', url, true)
    xhr.send(null)
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                success(xhr.responseText)
            } else {
                fail && fail(xhr.status)
            }
        }
    }
```

jquery ajax
```javascript
    $.ajax({
        url: '',
        Type: '',
        data: '',
        dataType: '',
        success: function (data) {

        },
        error: function (err) {

        }
    })
```
```javascript
    readyState 状态
      
      0 : 请求未初始化

      1 : 服务器已建立连接

      2 : 请求已接收

      3 : 请求处理中

      4 : 请求已完成，且响应已就绪
    

    优点 : 
      通过异步，提升用户的体验，减少不必要的数据往返，实现局部刷新
      
    缺点 : 对搜索引擎支持比较弱

```
