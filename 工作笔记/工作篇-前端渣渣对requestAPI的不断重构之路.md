# 前言

我还是自我介绍一下吧，本人 `19届毕业生`，在大二的时候自学前端，没有系统的学习，也没人带，从菜鸟教程那里去学 html 、css 、js 等，然后中间去写过一点 php，也是 `CURD` 的工作。

**自学路上太艰难**，因为不仅仅会遇到一些除了前端的问题，还会遇到许多其他没涉及到的问题，**那时候的自己属于，这个东西能做出来就行了，不会去考虑优化，或者重构代码等**，直到大三去实习了一段时间之后，才发现自己多菜，乃至现在毕业了，入部门直接做一些重要的需求，如 xx 展会演示的某个功能，看着前人代码，越感自己菜到极致。

<img src="https://user-gold-cdn.xitu.io/2019/9/30/16d813dbf669f0e9?w=240&h=240&f=jpeg&s=9664" width=200>

好了，不扯那么多了，上边是为了做铺垫，因为这篇文章，会有我最初的代码风格和现在的一个风格。

## 功能

<img src="https://user-gold-cdn.xitu.io/2019/9/30/16d8122093203e82?w=379&h=274&f=png&s=6902">

这里就以一个最简单的功能进行讲解，一个输入框，输入用户名和密码，然后点击登录，就登录完成啦 ~

登录成功之后，拿到用户信息 ~

## 最初的样子

在我年少无知的时候，jQuery 就是爸爸，有他在，没什么做不到的，但是说实在话，那时候真的用 jQuery 就只是为了 ajax 发送请求，于是我的代码是这样的

```js
// adapter.js
$.ajax({
  url: 'http://backend-dev-manage/login',
  method: 'post',
  dataType: 'json',
  data: {
    username: 'pengdaokuan',
    password: '123456'
  },
  success: function(data) {
    console.log(data)
  }
})
```

👍perfect ! 就很棒 ~

按道理来讲，是没得问题的，但是这时候，我身份就变了，就是...我成为了搬运工 ...

为什么这么说，因为每次要发送请求，我都要 copy 代码，`ctrl + c`、`ctrl + v` 了解一下 ...

哪个页面需要发请求，我直接一顿操作，copy 就完事了

```js
// a.html
$.ajax({
  url: 'http://backend-dev-manage/getAllStudent',
  method: 'get',
  success: function(data) {
    console.log(data)
  }
})

// b.html
$.ajax({
  url: 'http://backend-dev-manage/getAllTeacher',
  method: 'get',
  success: function(data) {
    console.log(data)
  }
})

// c.html
$.ajax({
  url: 'http://backend-dev-manage/getAllManage',
  method: 'get',
  success: function(data) {
    console.log(data)
  }
})
```

你没看错，我就是这么操作的，一直到去年大三实习前，还是这种操作，但是！在看了一些别人代码之后，我，长大了...

<img src="https://user-gold-cdn.xitu.io/2019/9/30/16d813ed5c74070f?w=213&h=236&f=jpeg&s=5547" width=200>

## 实习的成长

在实习的时候，看到上一个实习生写的代码，我也试着改了一下。于是，代码成这样了

```js
// adapter.js
import $ from 'jquery'

export default function requestJQuery(url, method, data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      method: method || 'GET',
      data: data,
      success: function(data) {
        resolve(data)
      },
      error: function(error) {
        reject(error)
      }
    })
  })
}
```

在请求的地方我引入这个 `requestJQuery` 就完事了嘛，这样就不用继续 copy 了，我可真是个小机灵鬼

你以为这就完了嘛，不存在的，在我看了 `ant-design-pro` 对于 request 的这段代码之后，我枯了... 我果然还是菜啊...

<img src="https://user-gold-cdn.xitu.io/2019/9/30/16d8140a559a6d08?w=225&h=225&f=jpeg&s=8047" width=200>

## 借鉴别人的代码

这时候从 `jQuery` 变成了 `axios`，于是代码成了这样，90%借鉴 ant-design-pro

> 果粒橙有 5%果粒也叫果粒橙，我的代码中有 10%的 bug，这也是我的代码

```javascript
// adapter.js

import axios from 'axios'

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
}

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const errortext = codeMessage[response.status] || response.statusText
  // 弹窗通知报错
  const error = new Error(errortext)
  error.name = response.status
  error.response = response
  throw error
}

/**
 * 封装的请求函数
 * @param  {string} url
 * @param  {object} [option]
 * @return {object}
 */
export default function request(option) {
  const options = {
    ...option
  }
  const defaultOptions = {
    credentials: 'include'
  }
  const newOptions = { ...defaultOptions, ...options }
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers
      }
      newOptions.data = JSON.parse(JSON.stringify(newOptions.data))
    } else {
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers
      }
    }
  } else {
    newOptions.headers = {
      Accept: 'application/json',
      ...newOptions.headers
    }
  }

  return axios(newOptions)
    .then(checkStatus)
    .then(response => {
      var res = response.data
      if (res.code === 1) {
        return res.data
      } else {
        Message.error({
          content: res.msg,
          duration: 1.5
        })
      }
    })
    .catch(err => {
      let status = err.name
      if (status === 401) {
        console.log('未经授权, 错误码:', status)
      }
      if (status === 403) {
        console.log('禁止访问, 错误码:', status)
      }
      if (status <= 504 && status >= 500) {
        console.log('服务器错误, 错误码:', status)
      }
      if (status >= 404 && status < 422) {
        console.log('找不到资源路径, 错误码 :', status)
      }
    })
}
```

> “ 💬 这个代码不错，只是长得有点像 ant-design-pro ”

看到这，你以为完了吗，no no no，上边的代码还是太乱了，然后呢，我看了组里的项目，对 request 的调用，又上升到了一个层级

<img src="https://user-gold-cdn.xitu.io/2019/9/30/16d8147a87e8422d?w=250&h=250&f=jpeg&s=10560" width=200>

## 重构一下

最近看了组里边对 request 的处理, 觉得很用帮助, 最起码对我来说, 又刷新了我的看法, 于是借鉴了前人的代码, 再加上自己之前对 ant-design-pro 的理解, 重新写了一遍, 并且将一些常量、方法抽了出去，看一下代码

```js
/**
 * @param {String} actionName 请求的名称
 * @param {Object} options
 * @param {Boolean} needAuthorToken 是否需要token，默认不需要
 * @param {Boolean} needCsrfToken 是否需要csrfToken，默认不需要
 */
import axios from 'axios'
import Cookies from 'js-cookie'
import { handleUrl, handleHttpStatus, handleResultStatus } from './utils'

class Adapter {
  // 获取options
  getOptions = ({ options, needAuthorToken, needCsrfToken }) => {
    let { url, headers } = options
    url = handleUrl(url)
    if (needAuthorToken) {
      const authorToken = Cookies.get('x-auth-token') // 这个由你们定义
      headers['xauthtoken'] = authorToken
    }
    if (needCsrfToken) {
      const csrfToken = Cookies.get('csrfToken') // 这个由你们定义
      headers['x-csrf-token'] = csrfToken
    }
    return Object.assign(options, {
      url: url,
      method: options.method || 'GET',
      headers: headers
    })
  }

  // request
  dispatchCallAPI = ({ options, authorToken = false, csrfToken = false }) => {
    const options = this.getOptions({ options, authorToken, csrfToken })

    return axios(options)
      .then(handleHttpStatus)
      .then(handleResultStatus)
      .then(res => {
        /**
         * 如果返回的不是一个JSON对象，而是一个字符串，因此需要对这个字符串进行处理
         * 如果直接返回的是一个JSON对象，这个时候，JSON.parse会抛出异常，如果出现异常
         * 我们直接返回这个对象本身的值即可
         */
        try {
          return JSON.parse(res.data)
        } catch (err) {
          return res.data
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
}

export default new Adapter()
```

```js
import React from 'react'
import adapter from './adapter'

export class requestComponent extends React.PureComponent {
  componentWillMount() {
    // 发送请求
    adapter
      .requestCallAPI({
        url: '/erek-vue-manage/user/retriveList',
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }
}
```

我不知道你们感觉如何，我是觉得比我一开始的代码，好看多了，而且逼格高了一些?

我将这个抽了出来, 写在了 github 上, 如果感兴趣的小伙伴可以去看一下哈 ~

传送门 : [AdapterAPI](https://github.com/PDKSophia/DesignPatternsToJS/blob/master/commonClasses/adapterAPI/README.md)

### 主要功能

- 通过 `axios` 进行封装的统一请求 ✅
- 对`url`进行判断处理，✅
- 进行了 `http code` 的状态处理 ✅
- 进行了后端返回的`数据状态码`处理 ✅

### 注意

> 💥 代码不一定能直接使用，**目的不是让你直接搬过来用的**，而是让你看懂我的思路，然后自己写一个

> 🔶 虽然可能我写的都不比你的好 ~ 但是希望可以给你一些参考~

## 最后多说两句话

掘金太多了人才了，我这边只是记录一下一些学习过程中的日常踩坑，或者代码的演变过程，当然，我相信有人天生就有计算机的天赋，我自认为我没有，但是我喜欢敲代码，我相信勤能补拙，不要天天做一些反复的 copy 工作就好了，望安好 ~
