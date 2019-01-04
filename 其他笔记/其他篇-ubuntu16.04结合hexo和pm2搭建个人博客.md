---
title: ubuntu16.0.4结合hexo和pm2搭建个人博客
date: 2018-08-30 14:55:47
tags:
---

## 前言
之前一直在找比较好的博客开源框架，但是用来用去，emmmm，还是选择了wordpress，原因是简单，而且很多坑基本都可以解决。但是后来觉得wordpress太没技术含量了，so ？ 今天搞了一中午，终于把新版本的博客搭起来了！！！

## 百度 
对的，就是百度，输入框一搜索 " hexo " ，就一堆的 hexo + github 巴拉巴拉的文章，可能博主笨，一直没整好，后面想了想，关联到GitHub上，还不如挂自己服务器上呢。所以这篇文章主要就是mark一下，如何在ubuntu上，采用hexo + pm2 搭建个人博客

## 开始
### A . 安装node.js (略过，不会的去百度如何在Ubuntu上安装node.js)
```javascript
    sudo apt-get install nodejs
    sudo apt install nodejs-legacy
    sudo apt install npm

    [如果你觉得慢，你可以换成淘宝镜像]
    sudo npm config set registry https://registry.npm.taobao.org
    // 可以通过 sudo npm config list 查看是否生效
    
    [ 安装最新的nodejs（stable版本）]
    sudo npm install -g n
    sudo n stable
    sudo node -v
```

### B . hexo 细讲 (如果要快速上手直接看下边的C部分)
```javascript
    1: 安装
       npm install -g hexo-cli 

       [可能会有权限问题，请 sudo npm install -g hexo-cli]
       // [ 查看是否安装成功 ]
       hexo -v

    2: 修改配置
       配置文件在_config.yml，具体修改请看官方文档

       看这里 : https://hexo.io/zh-cn/docs/configuration.html
    
    3: 修改主题
       请看官方文档讲解

       看这里 : https://hexo.io/zh-cn/docs/themes.html
```

### C . 快速用hexo写文章
```javascript
    1: 安装
       npm install -g hexo-cli 

    2: 初始化项目，这里项目名为blog
       hexo init blog
    
    3: 进入到blog中
       cd blog

    4: 执行一下命令
       hexo clean  // 清除缓存文件 (db.json) 和已生成的静态文件 (public)。比如你更换主题无效，可能需运行该命令
       
       hexo generate  // 生成静态文件。 可缩写为 hexo g

       hexo server -p 4000  // 启动服务器。默认情况下，访问网址为： http://localhost:4000  ，可缩写为 hexo s ， 端口默认4000，可以自己改
       [注意 : hexo 3.0把服务器独立成个别模块，需要单独安装：npm i hexo-server。]
       
       其他命令看这里 : https://hexo.io/zh-cn/docs/commands.html
    
    5: 访问
       当你把上边的命令执行完之后，在浏览器中访问 localhost:4000，即可看到页面
       
       [ 注意: 如果您的网站存放在子目录中，例如 http://yoursite.com/blog，则请将您的 配置文件中_config.yml中的url 设为 http://yoursite.com/blog 并把 root 设为 /blog/ ]
```

### D . pm2的使用
```javascript
    1 : pm2的简介

        官网 : http://pm2.keymetrics.io/

        主要特性：
        1、内建负载均衡（使用Node cluster 集群模块） 
        2、后台运行 
        3、0秒停机重载 
        4、具有Ubuntu和CentOS 的启动脚本 
        5、停止不稳定的进程（避免无限循环） 
        6、控制台检测 
        7、提供 HTTP API 
        8、远程控制和实时的接口API ( Nodejs 模块,允许和PM2进程管理器交互 )

    2 : 安装
        npm install -g pm2 

        [可能会有权限问题，请 sudo npm install -g pm2]

    3 : pm2的用法
        pm2 start app.js -i 4   // 后台运行pm2，启动4个app.js 
                                // 也可以把'max' 参数传递给 start
                                // 正确的进程数目依赖于Cpu的核心数目
        pm2 start app.js --name my-api // 命名进程
        pm2 list               // 显示所有进程状态
        pm2 monit              // 监视所有进程
        pm2 logs               //  显示所有进程日志
        pm2 stop all           // 停止所有进程
        pm2 restart all        // 重启所有进程
        pm2 reload all         // 0秒停机重载进程 (用于 NETWORKED 进程)
        pm2 stop 0             // 停止指定的进程
        pm2 restart 0          // 重启指定的进程
        pm2 startup            // 产生 init 脚本 保持进程活着
        pm2 web                // 运行健壮的 computer API endpoint 
        pm2 delete 0           // 杀死指定的进程
        pm2 delete all         // 杀死全部进程
        ...
        ...
        ...
    
```

### E . 搭配ubuntu + hexo + pm2 三件套
```javascript
    这里就不多了，首先安装node，然后安装hexo，并且按照C部分能够正常访问 ： localhost:4000 之后，通过pm2进程守护，先安装pm2，安装完了继续往下看

    在blog文件夹下，新建一个app.js，写入下面的代码

    var spawn = require('child_process').spawn;

    free = spawn('hexo', ['server', '-p 4001']);
    // 其实就是等于执行hexo server -p 4001 (端口修改为4001)

    free.stdout.on('data', function (data) {

        console.log('standard output:\n' + data);

    });

    free.stderr.on('data', function (data) {

        console.log('standard error output:\n' + data);

    });

    free.on('exit', function (code, signal) {

        console.log('child process eixt ,exit:' + code);

    });

    接着执行pm2命令
    // 在此之前你可能需要执行一下 hexo clean
    pm2 start app.js 

    之后服务器关闭，进程仍然存活，仍能够通过 http://yoursite.com:4001访问到你的博客

    [注意 : 可能之后你需要重启进程，即 : pm2 restart app.js]
```

这是博主搭的博客 : http://blog.pengdaokuan.cn:4001
