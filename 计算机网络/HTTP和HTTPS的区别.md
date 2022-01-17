<!--
 * @Description:
 * @Author: pengdaokuan
 * @LastEditors: pengdaokuan
 * @Date: 2022-01-16 17:54:58
 * @LastEditTime: 2022-01-16 17:57:05
-->

## HTTP 和 HTTPS 的区别

### 什么是 HTTP，什么又是 HTTPS ？

```base
HTTP是互联网最为广泛的网络传输协议，也叫做超文本传输协议。所有的WWW文件都必须遵守这个标准

HTTPS是以安全为目标到HTTP通道，说得直白一点，就是HTTP的安全版，在HTTP下加入了SSL层。
```

### HTTP 的缺点

- 通信使用明文 (不加密)，内容可能会被窃听

- 不验证通信方的身份，可能遭遇伪装

- 无法证明报文的完整性，报文内容可能已被更改

### HTTP+加密+认证+完整性保护 = HTTPS

HTTP 传输协议的数据是未加密的，也就是明文传输，因而很不安全，**HTTPS 协议就是由 SSL + HTTP 协议构建成的可进行加密传输、身份验证的网络协议**。HTTP 的端口在 80，HTTPS 的端口在 443。并且 HTTPS 需要 CA 证书～

#### HTTPS 是身披 SSL 外壳的 HTTP

HTTPS 并非是应用层的一种新协议。只是 HTTP 通信接口部分用 SSL 和 TLS 协议代替而已。 通常，HTTP 直接和 TCP 通信，但是使用 SSL 时，就演变成 HTTP 先和 SSL 通信，再由 SSL 和 TCP 通信。

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-26.png' width=420 height=320>

SSL 采用了一种叫做 <strong>公开密钥加密</strong>的加密处理方式。那么是什么公开密钥加密呢？

> 公开密钥加密: 使用一对非对称的密钥，一把叫做公钥，一把叫做私钥；

使用公开密钥加密方式，发送密文的一方使用对方的`公开密钥`

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-27.png' width=510 height=430 />

### HTTPS 的工作原理(简单版)

1. 客户端使用 http 的 url 访问 web 服务器，要求与 web 服务器建立 SSL 连接
2. web 服务器接收到请求之后，会将网站的证书信息(证书中包含公钥)传送一份给客户端
3. 客户端的浏览器假假的对照一下证书信息，看看是不是本人，是的话与 web 服务器协商 SSL 连接的安全等级
4. 客户端的浏览器根据双方的安全等级，建立会话密钥。利用公钥对信息加密，传送给 web 服务器
5. web 服务器用自己的私钥解密出会话信息，得到了客户端传过来的随机值(私钥)，然后把内容通过该值进行对称加密,从而与客户端通信

### HTTPS 的通信步骤(详情版)

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-28.png' width=450 height=650 />

1. 客户端发送 Client Hello 报文开始 SSL 通信，报文中包含客户端支持的 SSL 指定版本，加密组件列表(所使用的加密算法和密钥长度等)
2. 服务器可进行 SSL 通信。会以 Server Hello 报文作为应答。和客户端一样，在报文中会包含 SSL 的版本以及加密组件；\_服务器的加密组件内容是从客户端加密组件内筛选出来的
3. 服务器发送 Certificate 报文，报文中包含公钥证书
4. 最后服务器发送 Server Hello Done 报文通知客户端，最初阶段的 SSL 握手协商部分结束
5. SSL 第一次握手接受后，客户端以 Client Key Exchange 报文作为回应。报文中包含通信加密中使用的一种被称为 `Pre-master-secret` 的随机密码串。报文已用步骤 3 中服务器公开密钥进行加密
6. 接着客户端继续发送 Change Cipher Spec 报文。该报文会提示服务器，接下来的通信会采用 Pre-master-secret 密钥加密
7. 客户端发送 Finished 报文，该报文包含连接至今全部报文的整体校验值。这次握手协商是否能够成功，要以服务器是否能够正确解密该报文作为判定标准
8. 服务器同样发送 Change Cipher Spec 报文
9. 服务器同样发送 Finished 报文
10. 服务器和客户端的 Finished 报文交换完毕之后，SSL 连接就算建立完成。当然，通信会受 SSL 的保护
11. 应用层协议通信，发送 HTTP 响应
12. 最后由客户端断开连接，断开连接时，发送 close_notify 报文

    <img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-29.png' width=720 height=520>

### HTTPS 的优缺点

#### 优点

1 : 使用 HTTPS 协议可认证用户和服务器，确保数据发送到正确的客户机和服务器

2 : HTTPS 协议是由 SSL+HTTP 协议构建的可进行加密传输、身份认证的网络协议，要比 http 协议安全，可防止数据在传输过程中不被窃取、改变，确保数据的完整性

3 : HTTPS 是现行架构下最安全的解决方案，虽然不是绝对安全，但它大幅增加了中间人攻击的成本。

4 : 相比之下，SEO 更加友好

#### 缺点

1 : HTTPS 协议握手阶段比较费时，会使页面的加载时间延长近 50%，增加 10%到 20%的耗电

2 : HTTPS 连接缓存不如 HTTP 高效，会增加数据开销和功耗，甚至已有的安全措施也会因此而受到影响

3 : SSL 证书要钱，而且证书通常需要绑定 IP，不能在同一 IP 上绑定多个域名，IPv4 资源不可能支撑这个消耗。
