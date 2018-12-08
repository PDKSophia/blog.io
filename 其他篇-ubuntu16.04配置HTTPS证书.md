---
title: 其他篇-ubuntu16.04配置HTTPS证书
date: 2018-12-08 20:00:32
tags:
---
## 其他篇-ubuntu16.04配置HTTPS证书
### 前言
有一次给别人发网址，然后被警告说是不安全网站，what ？ 这就很难受了，于是就想自己配一个HTTPS的证书，下边以腾讯云平台上，Ubuntu16.04进行配置


### 获取SSL证书
- 腾讯云的SSL证书服务中，域名型的（DV）SSL证书是免费的，那么我们这次主要是申请这个证书，如需其他类型证书，也请付费申请。

- 进入SSL证书管理控制台，点击申请证书，然后填写信息，等待大概一个小时左右，证书就能申请下来

- 在证书申请通过后，下载证书。里边会有四个文件夹，可以查看[官方文档](https://cloud.tencent.com/document/product/400/4143#1.-apache-2.x-.E8.AF.81.E4.B9.A6.E9.83.A8.E7.BD.B2)

### 上传SSL证书
将下载好之后的证书，解压，可以看到里面有Apache, IIS, Nginx, Tomcat等证书，这里根据自己的服务器环境选择对应的证书。这里根据我使用的是Apache环境，通过命令行将证书文件上传到Apache目录下，我上传的路径是/etc/apache2/https_ctr，https_ctr是我自己创建存储证书的文件夹。

```javascript
  // 因为我的scp 上传报权限问题，所以我先传到/var/www/html/tempDir 再 copy 过去
  
  // 本地终端
  cd www.pengdaokuan.cn // 打开证书文件夹
  scp -r * ubuntu@xxx.xxx.xx.xx:/var/www/html/tempDir // 上传


  // ssh 远程连接服务器
  ssh ubuntu@xxx.xxx.xx.xx  // 远程连接，输入密码

  cd /var/www/html/tempDir

  sudo cp -r * /etc/apache2/https_ctr // copy 到 /etc/apache2/https_ctr 文件夹下

```

### 开启SSL模块
```javascript
  sudo a2enmod ssl
```

### 启用SSL站点
```javascript
  sudo a2ensite default-ssl
```

### 添加HTTPS的Apache配置
待证书上传完成后，我在路径 /etc/apache2/sites-available 下创建一个文件，名为 `vhostssl.conf`，在这个文件里写我这个站点的https配置信息。
```javascript
  Listen 443
  <VirtualHost *:443>
    ServerName www.pengdaokuan.cn:443    // 你的网址
    DocumentRoot "/var/www/html"
    ServerAlias www.pengdaokuan.cn   // 你的网址
    SSLEngine on
    SSLCertificateFile "/etc/apache2/https_ctr/Apache/2_example.com.crt"
    SSLCertificateKeyFile "/etc/apache2/https_ctr/Apache/3_example.com.key"
    SSLCertificateChainFile "/etc/apache2/https_ctr/Apache/1_root_bundle.crt"
  </VirtualHost>
```
在 vhostssl.conf 文件内写入上述的配置信息，其中注意将example替换为你自己的域名，并且修改成正确的证书路径。

配置文件完成后，进入/etc/apache2/sites-enabled/ 路径

```javascript
  ln -s ../sites-available/vhostssl.conf
```

执行这个命令，添加一个软链至sites-available目录。

在这些工作都做完后，重启Apache

### 重启
```javascript
  sudo service apache2 restart
```
