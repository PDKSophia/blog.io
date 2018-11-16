## HTTP 和 HTTPS 的区别
### 什么是HTTP，什么又是HTTPS ？
```base
HTTP是互联网最为广泛的网络传输协议，也叫做超文本传输协议。所有的WWW文件都必须遵守这个标准

HTTPS是以安全为目标到HTTP通道，说得直白一点，就是HTTP的安全版，在HTTP下加入了SSL层。
```
### HTTP的缺点
- 通信使用明文 (不加密)，内容可能会被窃听

- 不验证通信方的身份，可能遭遇伪装

- 无法证明报文的完整性，报文内容可能已被更改

### HTTP+加密+认证+完整性保护 = HTTPS
HTTP传输协议的数据是未加密的，也就是明文传输，因而很不安全，HTTPS协议就是由SSL + HTTP协议构建成的可进行加密传输、身份验证的网络协议。HTTP的端口在80，HTTPS的端口在443。并且HTTPS需要CA证书～

#### HTTPS是身披SSL外壳的HTTP
HTTPS并非是应用层的一种新协议。只是HTTP通信接口部分用SSL和TLS协议代替而已。 通常，HTTP直接和TCP通信，但是使用SSL时，就演变成HTTP先和SSL通信，再由SSL和TCP通信。

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-26.png' width=550 height=480>

SSL采用了一种叫做 <strong>公开密钥加密</strong>的加密处理方式。那么是什么公开密钥加密呢？

> 公开密钥加密: 使用一对非对称的密钥，一把叫做公钥，一把叫做私钥；

使用公开密钥加密方式，发送密文的一方使用对方的`公开密钥`

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-27.png' width=680 height=600>

### HTTPS的工作原理(简单版)
```javascript
    1 : 客户端使用http的url访问web服务器，要求与web服务器建立SSL连接

    2 : Web服务器接收到请求之后，会将网站的证书信息(证书中包含公钥)传送一份给客户端

    3 : 客户端的浏览器假假的对照一下证书信息，看看是不是本人，是的话与web服务器协商SSL连接的安全等级

    4 : 客户端的浏览器根据双方的安全等级，建立会话密钥。利用公钥对信息加密，传送给web服务器

    5 : web服务器用自己的私钥解密出会话信息，得到了客户端传过来的随机值(私钥)，然后把内容通过该值进行对称加密,从而与客户端通信
```

### HTTPS的通信步骤(详情版)

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-28.png' width=580 height=700>

1 : 客户端发送Client Hello报文开始SSL通信，报文中包含客户端支持的SSL指定版本，加密组件列表(所使用的加密算法和密钥长度等)

2 : 服务器可进行SSL通信。会以Server Hello报文作为应答。和客户端一样，在报文中会包含SSL的版本以及加密组件；*服务器的加密组件内容是从客户端加密组件内筛选出来的*

3 : 服务器发送Certificate报文，报文中包含公钥证书

4 : 最后服务器发送Server Hello Done报文通知客户端，最初阶段的SSL握手协商部分结束

5 : SSL第一次握手接受后，客户端以 Client Key Exchange 报文作为回应。报文中包含通信加密中使用的一种被称为 `Pre-master-secret` 的随机密码串。报文已用步骤3中的服务器公开密钥进行加密

6 : 接着客户端继续发送 Change Cipher Spec 报文。该报文会提示服务器，接下来的通信会采用 Pre-master-secret 密钥加密

7 : 客户端发送 Finished 报文，该报文包含连接至今全部报文的整体校验值。这次握手协商是否能够成功，要以服务器是否能够正确解密该报文作为判定标准

8 : 服务器同样发送 Change Cipher Spec 报文

9 : 服务器同样发送 Finished 报文

10 : 服务器和客户端的 Finished 报文交换完毕之后，SSL连接就算简历完成。当然，通信会受SSL的保护

11 : 应用层协议通信，发送HTTP响应

12 : 最后由客户端断开连接，断开连接时，发送 close_notify 报文

<img src='https://github.com/PDKSophia/read-booklist/raw/master/book-image/http-29.png' width=580 height=700>

### HTTPS的优缺点
#### 优点 
1 : 使用HTTPS协议可认证用户和服务器，确保数据发送到正确的客户机和服务器

2 : HTTPS协议是由SSL+HTTP协议构建的可进行加密传输、身份认证的网络协议，要比http协议安全，可防止数据在传输过程中不被窃取、改变，确保数据的完整性

3 : HTTPS是现行架构下最安全的解决方案，虽然不是绝对安全，但它大幅增加了中间人攻击的成本。

4 : 相比之下，SEO更加友好

#### 缺点
1 : HTTPS协议握手阶段比较费时，会使页面的加载时间延长近50%，增加10%到20%的耗电

2 : HTTPS连接缓存不如HTTP高效，会增加数据开销和功耗，甚至已有的安全措施也会因此而受到影响

3 : SSL证书要钱，而且证书通常需要绑定IP，不能在同一IP上绑定多个域名，IPv4资源不可能支撑这个消耗。
