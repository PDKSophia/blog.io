---
title: linux服务器报No space left on device错误的解决过程
date: 2018-08-30 14:55:47
tags:
---

## 起因
今天本来高高兴兴的想把 `npm run build` 后的代码 push 到服务器上，然后它居然报错了！！！
```javascript
  cp: /var/xxx/xxx/js/chunk-vendors.f1b81010.js.map: No space left on device
```

## 解决过程

作为一个前端工程师，对于运维这玩意，嗯，只能找百老师了，于是去百度查了一下，之后看了很多文章，终于解决
```javascript
  1. df -h // 查看服务器磁盘使用空间
```
不出啥意外的话，你会看到这种玩意

| Filesystem | Size | Used | Availd | Use% | Mounted on |
| :------: | :------: | :------: | :------: | :------: |  :------: | 
| udev | 414M | 0 | 414M | 0% | /dev |
| tmpfs | 87M | 9.4M | 78M | 11% | /run |
| ... | ... | ... | ... | ... | ... |
| /dev/vdal | 50G | 47G | 0 | 100% | / |
| ... | ... | ... | ... | ... | ... |

卧槽，什么鬼，这个 `/dev/vdal` 居然用了 47G ！！！这是个啥？于是我去看了下哪个目录占用空间大(不出意外就是这个 `/dev/vdal` )
```javascript
  2. sudo du -sh *  // 查看文件夹占用内存
```
然后从中我发现了这个玩意

|  |  |
| :------: | :------: |
| 16M | bin |
| ... | ... |
| 44G | home |
| ... | ... |

果然，在 home 下边占用了 44G 的磁盘内存，但是知道了哪个文件夹占用那么大的内存有什么用？我不会解决啊！！！还是先查一下，超过100M大小的大文件，看看有没有什么收获
```javascript
  3. sudo find / -size +100M -exec ls -lh {} \; // 查找超过100M的文件
```
然后结果如下
```javascript
  -rw-rw-r-- 1 ubuntu ubuntu 32G Nov 27 06:16 /home/ubuntu/.pm2/logs/app-error.log
  -rw-rw-r-- 1 ubuntu ubuntu 12G Nov 27 06:03 /home/ubuntu/.pm2/pm2.log
  -r-------- 1 root root 128T Nov 27 16:13 /proc/kcore
```
卧槽，pm2，好熟悉，记起来了，之前通过pm2去守护进程，但是好像，没能关闭！！！于是去查看了一下这个 `.log` 文件
```javascript
  4. cd /home/ubuntu/.pm2
  5. sudo lsof | grep 'pm2.log'
```

|  |  | | | |  | | | |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | 
| PM2\x20v3 | 19973 |  | ubuntu | 1w | REG | 253,1 12429815808 | 452913 | /home/ubuntu/.pm2/pm2.log |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | 
| node | 19973 | 19975 | ubuntu | 25w | REG | 253,1      0| 452922 | /home/ubuntu/.pm2/logs/sever-error.log |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | 

__列表中有很多进程都在打开该文件，虽然文件删除了，但是打开该文件的进程没有关闭，也就是说文件实际上还是存在，rm仅仅是删除了该文件的标记。也就是说，就是有些文件删除时还被其它进程占用，此时文件并未真正删除，只是标记为 deleted，只有进程结束后才会将文件真正从磁盘中清除__。

然后，我就将这两个 `.log` 文件删除了。。。通常的话应该是 `把占用文件的相关进程关闭` 或者 `以清空的方式替代删除` 
```javascript
  6. rm pm2.log logs/app-error.log
```
这是操作前的结果

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/linux-1.jpg' width=550 height=200>

这是操作后的结果

<img src='https://github.com/PDKSophia/blog.io/raw/master/image/linux-1.jpg' width=550 height=200>

#### 相关链接
df与du不一致情况分析 : https://blog.csdn.net/carolzhang8406/article/details/7228248

centos 如何清除 /dev/vdal 系统盘 : http://www.cnblogs.com/xjxz/p/6085943.html

No space left on device : https://blog.csdn.net/WuZuoDingFeng/article/details/76155433
