# Node 中如何通过 redis 缓存 session 信息

## 前戏得做好

大哥们，小弟我又来了，这次真的是请求帮助的了，先说一下，这是第一次用 `Node + Express + Mysql` 来撸一个项目的后端，正因为第一次，所以遇到了不少的问题，📝 本文除了记录一下，最好还是想让各位大哥给我提供一些方案解决，我...我在这先谢过了

说一下场景，其实就是一个简单的功能，是这样的 👉

- 用户登陆，输入邮箱，点击 `🔘 获取验证码`, 发送请求

- 后端通过 `nodemailer` 给邮箱发送验证码

- 发送成功，session 缓存这个`code`

- 用户输入用户名、密码、邮箱、验证码，进行登陆

- 检验 `req.body.code == session.get('code')`

- 相同进行 sql 查询用户信息不同告知用户验证码不正确

> 看似简单，实际上...😢 真的简单，但是臣妾真的不会啊。。

下面就开始讲讲我苦逼的搬砖过程

## 搬砖辛酸史

前端代码就不用说了，就是一个按钮 🔘，点击之后发送请求...

```javascript
/**
 * @desc: 根据emai发送验证码
 * @return {*}
 */
retrieveCode: email => {
  return request({
    url: `${baseUrl}/api/login/email-code`,
    method: 'POST',
    data: {
      email: email
    }
  })
}
```

ojbk，稳重，然后在 Node 后端中，盘它

```javascript
/**
 * @desc 根据email发送验证码
 * @param {String} email
 */
router.post('/email-code', async (req, res) => {
  try {
    const response = await loginController.retrieveCode(req, req.body)
    res.json(response)
  } catch (err) {
    throw new Error(err)
  }
})
```

到这里应该都没问题，调用 `loginController.retrieveCode()` 去做处理，然后在里边我们应该发送验证码，对吧～然后通过 `express-session` 缓存 code 到 session 中，让我们看看代码

```javascript
const types = require('../../utils/error.code')
const stmp = require('../../config/smtp')
/**
 * @desc 通过email发送验证码
 * @params {email} 邮箱
 * @return {Object}
 */
async function retrieveCode(req, payload) {
  try {
    var code = ''
    while (code.length < 5) {
      code += Math.floor(Math.random() * 10)
    }

    var emailOptions = stmp.setMailOptions(payload.email, 'code', code)
    await stmp.transporter.sendMail(emailOptions)

    if (!req.session) {
      return next(new Error('oh no')) // handle error
    } else {
      req.session.email_code = code
      console.log('打印本次的req', req)
    }
    return {
      code: types.login.RETRIEVE_EMAIL_CODE_SUCCESS,
      msg: '验证码发送成功～',
      data: null
    }
  } catch (error) {
    return {
      code: types.login.RETRIEVE_EMAIL_CODE_FAIL,
      msg: '验证码发送错误, 请检验邮箱正确性',
      data: null
    }
  }
}
```

代码不是什么神仙代码，都能看得懂，重点来了，我在 req.session 中存了这个 `email_code`，然后呢，我打印了 `console.log(req.session)`，发现是这样的

```javascript
  console.log('打印本次的req', req)
  // 下面是打印结果, 其他部分剔除
  sessionID: 'Y11FsZ0vgcJFPyJIftuEItLQn8P4rVg-',
    session:
     Session {
       cookie:
        { path: '/',
          _expires: null,
          originalMaxAge: null,
          httpOnly: true },
       email_code: '71704' }, // 看到了吗，缓存了，真开心！！！
```

### 💔 爱情来的像龙卷风

> 内心 OS : 😁 真开心，一点难度都没有嘛，冲冲冲！💪

呵，是我年轻了，没错，上边的`session`中确实是缓存了 `email_code`，但是在下一个请求中，死活就是获取不到 session 缓存的 `email_code`

```javascript
/**
 * @desc 获取token
 * @return {Object}
 */
async function retrieveToken(req) {
  // 1. 先获取 session 缓存的 email_code
  // 2. 与req.body.code 进行比较
  console.log(req.session.email_code) // undefined
  console.log('siri, 给我打印这次的req', req)
}
```

yes，没错，就是 `undefined`，奇了怪了，为什么没有呢？于是我把这次的 `req` 打印出来，是这样的

```javascript
console.log('siri, 给我打印这次的req', req)
// 下面是打印结果
sessionID: 'MvoJQR8BSQZA6zcfuJFYuJltQH5ZU1rS',
  session:
    Session {
      cookie:
      { path: '/',
        _expires: null,
        originalMaxAge: null,
        httpOnly: true } },
  ...
```

看到了吗，`sessionID`都不一样了，呵，玩我呢？于是我就在想，是为什么，难道，🤔 是我太骚了？？于是开始排查问题...

### 坑还是得一步一步填

因为用的是 express-session 去操作的，所以当然第一步是去 `github` 看看文档啦～

- 文档移步这里: [express-session](https://github.com/expressjs/session)

在 github 看了一下 README 文档，发现了一句话

> Please note that secure: true is a recommended option. However, it requires an https-enabled website, i.e., HTTPS is necessary for secure cookies. If secure is set, and you access your site over HTTP, the cookie will not be set. If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express:

不用我翻译了吧，大概意思就是 如果启用了 `secure`，但是是用 HTTP 进行的访问，那么 cookie 不会发送给客户端

也就是说，如果你采用 http 访问，那么你的 secure 应该设为 false

然后我百度了一下，发现不下 20 篇文章，都是这样配置，然后就设置值，再取值

```javascript
var express = require('express')
var app = express()
var session = require('express-session')

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000,
      secure: false
    }
  })
)

// 设置值
req.session.user_id = req.body.user_id

// 取值
const user_id = req.session.user_id
```

 <img src='https://github.com/PDKSophia/blog.io/raw/master/image/node-1.jpg'>

你们看看我的，我是后妈生的？为什么我的就是不对呢？

```javascript
// 存session，正常可以存
async function retrieveCode(req, payload) {
  // code...
  req.session.email_code = code
  console.log('缓存code : ', req.session.email_code) // 缓存code 49167
  // ...
}

// 取session，取不到
async function retrieveToken(req) {
  // code...
  console.log('从缓存session中取code : ', req.session.email_code) // undefined

  // ...
}
```

**百思不得其解，然后百度的那些二三十篇文章，卧槽，😠 怎么都长的一模一样，千篇一律，底部就都挂这 `原文链接`、`友情链接`，大哥们，你们这样真的好吗？？？**

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_3.jpeg'>

### 靠人不如靠己

OK，没人靠，就靠我的 google 大法了，开始思考，为什么看别人的例子，别人的 demo 就没得问题，我就不行，呸，男人不能说自己不行...

what❓ 为什么我就不 ok❓ 我贼心不死，把官方文档给的 demo 例子又看了一遍，各种操作下来，但是就是拿不到值，我已经蒙圈了 😠

ok，稳住，此路不通，我换条路走，我又去 issues 搜一下，有没有出现跟我一样的大哥，发现大哥们好像都没遇到和我一样的问题啊，但是还是找到一些可以参考的 issue : [Express session object getting removed](https://github.com/expressjs/session/issues/571) 、 [Sessions In API's](https://github.com/expressjs/session/issues/161) ... 哭了，我还是没能看到解决方法，`why，why I can't get req.session.email_code`

不能慌，稳住，于是去把 [Sessions 配置项详解](<(https://www.jb51.net/article/115048.htm)>)给看了一遍，嗯，基本知道了每个字段的含义，让我们继续愉快的找 issues 吧，看啊看啊，又看到了两个 issues，[Cookie less version?](https://github.com/expressjs/session/issues/317)、[Cookieless Session](https://github.com/expressjs/session/issues/543)，我甚至怀疑是不是我版本问题，于是我就去把 `express-session` 版本升级了一下，发现并不是，gg，又凉了

然后，突然，想起，好像在 session 配置项里边又看到这么一句话

> express-session 在服务端默认会使用 MemoryStore 存储 Session，这样在进程重启时会导致 Session 丢失，且不能多进程环境中传递。在生产环境中，应该使用外部存储，以确保 Session 的持久性。

我们知道，node 是个单线程，不像 php 那样，Node 是一个长期运行的进程，而相反，Apache 会产出多个线程(每个请求一个线程)

> 搞这个东西真的是累啊，没对齐，凑合看吧 👀

```
                +-----------------+
                |      APACHE     |
                +-+------+------+-+
                  |      |      |
               +--+      |      +--+
      +--------+     +--------+    +--------+
      |   PHP  |     |  PHP   |    |  PHP   |
      | THREAD |     | THREAD |    | THREAD |
      +--------+     +--------+    +--------+
          |              |              |
     +---------+    +---------+    +---------+
     | REQUEST |    | REQUEST |    | REQUEST |
     +---------+    +---------+    +---------+



        +-----------------------------------+
        |                                   |
        |              NODE.JS              |
        |                                   |
        |              PROCESS              |
        |                                   |
        +-----------------------------------+
          |               |              |
     +---------+     +---------+     +---------+
     | REQUEST |     | REQUEST |     | REQUEST |
     +---------+     +---------+     +---------+

```

看懂的老铁双击 666，不皮了，我哭了，这次我真的哭了，介于 session 没持久化的玩意，我决定，采用 redis 了. (一开始不用是真的懒...)

## 从一个坑跳到另一个坑

redis，对我一个前端来说，又是一趟浑水，没事，百度嘛，反正只要简单使用就好了，嗯，从安装到登陆，再到 node 中引用 `redis`、`connet-redis`，一顿操作猛如虎，接下来就是真枪实弹了

```javascript
const session = require('express-session')
const client = require('./config/redis')
const RedisStore = require('connect-redis')(session)

let redisOptions = {
  client: client,
  host: '127.0.0.1',
  port: 6379
}
app.use(
  session({
    secret: 'ticket2019',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000,
      secure: true // 眼熟这个属性
    },
    store: new RedisStore(redisOptions)
  })
)
```

老铁，没毛病，我看着文档撸的，这时候呢，我们就把 `res.session` 缓存到 `redis` 中啦，然后呢？？？然后呢？？？然后我百度的那些文章就到这里断更了，就没后续了...

ok，我知道它往 redis 存了一个 session 了，于是我去 redis，查一下，是不是真的存了，不要因为我傻，就能欺负我

```javascript
redis-cli

127.0.0.1:6379> keys *
// sess:Y11FsZ0vgcJFPyJIftuEItLQn8P4rVg-
// sess:MvoJQR8BSQZA6zcfuJFYuJltQH5ZU1rS

127.0.0.1:6379> get sess:Y11FsZ0vgcJFPyJIftuEItLQn8P4rVg-
// {cookie: {}, email_code: '10086'}

127.0.0.1:6379> get sess:MvoJQR8BSQZA6zcfuJFYuJltQH5ZU1rS
// {cookie: {}}

```

哟，还真的是存了呀，可是为什么会有两个 session？？？(我真不知道为什么两个...)，并不是说两个请求两个 session，而是我就单单触发了 `retrieveCode()` 这个方法进行缓存 code，你问我为什么两个，臣妾真的不知道为什么啊！！！TMD(暴躁 ing)，这又是什么鬼

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/pic_2.jpg'>

于是，我就去把 [express-session 中的 session 源码](https://github.com/expressjs/session/blob/master/index.js#L405)看了一下，有这么一段代码

```javascript
if (!req.sessionID) {
  debug('no SID sent, generating session')
  generate()
  next()
  return
}
```

然后在 generate() 里边做了这个操作

```javascript
store.generate = function(req) {
  req.sessionID = generateId(req)
  req.session = new Session(req)
  req.session.cookie = new Cookie(cookieOptions)

  if (cookieOptions.secure === 'auto') {
    req.session.cookie.secure = issecure(req, trustProxy)
  }
}
```

猜测，是不是每次它都给我生成了一个新的 sessionID，照目前我遇到的情况来看，好像是这样的，然后继续去找问题答案，在 issues 看到了这么一个问题，[generating new sessions with an asynchronous store](https://github.com/expressjs/session/issues/52) ,  嗯，了解，继续找... 然后我发现这么一个 issue ！！！⚠️ 这是一个重大发现！！ [Cookies disabled results in loss of session (no workaround via Header)](https://github.com/expressjs/session/issues/185), 没错，翻译过来就是 : 禁用 cookies 结果就是使得 session 丢失，进去，看看什么情况

然后看到了这么一个 comment，是这么说的:

> I have been thinking about this kind of problem recently on my own projects, I know this might not be what you are looking for but it may help others. If you have a login page which users login then send the post request to /login then on success they are sent a cookie and redirected to ie: /bounce and if their session or cookie doesn't exist redirect them to your oh no you don't have cookies enabled if they have a valid session then they are sent to the default home page...

大概意思就是，如果你有一个用户登录的登录页面，然后发送邮件请求 `/login`， 那么成功后他们会被发送一个 cookie 并重定向到 ie `/bounce`， 如果他们的会话或 cookie 不存在，ok，gg ～

刚讲到了 IE 浏览器，于是我去写了个 demo 测试了一下，发现，谷歌浏览器好像不能获取和设置 cookie ？，IE 可以获取和设置，但是这好像不是重点，于是继续往下走，这时候就问了一下好友，好像**同一个浏览器发出的请求会覆盖 session**, 是这样的吗？我就沿着这个线出发去寻找答案，然后...然后还是没能找出个所以然来

我就在这个 `issue` 里边，看别人的回复和给出的解答，突然想起来，我是不是配置的 session 有问题？禁用 cookies ？禁用 cookies？禁用 cookies？是不是我让让 cookie 不随着发送，导致的问题？cookie 里会携带一个 sessionID，我通过 sessionID 当作 redis 的 key，key 中存着这个 sessionID 的信息，稳妥啊

```javascript
app.use(
  session({
    secret: 'ticket2019',
    resave: false, // 强制session保存到session store中
    rolling: true, //强制在每一个response中都发送session标识符的cookie。如果设置了rolling为true，同时saveUninitialized为true，那么每一个请求都会发送没有初始化的session
    saveUninitialized: false, // 强制没有“初始化”的session保存到storage中，如果是要实现登陆的session那么最好设置为false
    cookie: {
      maxAge: 60000,
      secure: false // 设置为true，需要https的协议
    },
    store: new RedisStore(redisOptions)
  })
)
```

我就莫名其妙改啊改啊，就莫名其妙只在 redis 中存一个 session 了，但是极少数情况下还是会存在上一次的 session，这个我真搞不懂了，然后缓存了这么一个`email_code`，再通过 `redis.get(key)` 去拿到这个 session，从中取出`email_code`，应该不是啥大问题了。

然后遇到了异步的情况，因为我是通过 async / await 的，而 await 是等待一个 promise，所以...并不会按照我意淫安排的那样，一步一步执行，然后通过 sql 查完之后，再返回数据，而是在我第一次 await 之后，就返回了。。。

```javascript
/**
 * @desc 获取token
 * @param {String} email
 */
router.post('/get-token', async (req, res) => {
  try {
    const response = await loginController.retrieveToken(req)
    console.log('???你是不是掉坑了', response) // undefined
    res.json(response)
  } catch (err) {
    throw new Error(err)
  }
})

/**
 * @desc 获取token
 * @return {Object}
 */
async function retrieveToken(req) {
  const { username, password, email, code } = req.body
  try {
    await redisClient.keys('sess:*', async (error, keyList) => {
      for (let key in keyList) {
        key = keyList[key]
        await redisClient.get(key, async function(err, data) {
          const { email_code } =
            typeof data == 'string' ? JSON.parse(data) : data

          if (code != email_code) {
            // code ...
            // 返回对象告知验证码错误
          } else {
            try {
              const user = await loginModel.retrieveToken(
                username,
                password,
                email
              )
              return {
                code: types.login.LOGIN_SUCCESS,
                msg: '登陆成功',
                data: {
                  username: user[0].username,
                  token: user[0].token,
                  email: user[0].email
                }
              }
            } catch (error) {
              // code ...
              // 返回对象告知登陆错误
            }
          }
        })
      }
    })
  } catch (err) {
    console.info(err)
  }
}
```

是的，response 的数据掉坑了，真开心....没事，这个不是大问题，真的大的问题就是，我到现在脑壳疼，弄了一天，头脑还是蒙的，遇到不懂的就去查，就去看源码看 issue，但是还是没搞懂，在此，我想问大佬们，你们能给点萌新我一点指导嘛？第一次用 node 撸代码，第一次用 redis，都还是第一次...

### 虚心请教

- 有没有适合新手看的又是完成的 demo，参考一下，github 上搜的都太成熟完善了...

- 上诉有些问题莫名其妙就解决了？比如 2 个 session 我也不知道为什么改着就成 1 个了...

- async / await 如何写才更加好？我感觉自己的代码还是很繁杂很乱...

- ...(有疑问但是不知道如何说...等我想想)

总之，这个功能需求，还没解决，未待完续...我们江湖见 ✌️
