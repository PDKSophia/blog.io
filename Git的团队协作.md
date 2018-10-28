## Git的团队协作
博主一直都是个人做一个联手的项目，所以git的操作也就只会git init ，git add 等简单操作，这不，最近自己想做一个项目平台，可是人手不足，于是需要多人进行一个团队开发，所以记录一下团队间的一个git协作流的过程

### 1. 创建开发分支
我们新建一个项目的时候，会默认有一个master分支，master一般用来发布稳定版本，dev分支用来发布开发版本。包括像在一些公司，还会有一个人qa分支，用来测试。这边我们先创建一个dev分支。分支创建完毕后，会自动跳转到dev分支。由于dev分支是从master分支上创建的，因此内容与master分支一致

### 2. fork项目到个人仓库
一般都是由项目负责人初始化项目，这时候你需要Fork团队项目到个人仓库，fork完后，你会在你的项目中，看到你fork的项目

### 3. clone 项目到本地
【 `注意` 】：这里clone的地址是你fork完之后，你的项目地址，而不是团队的地址，不然到时候你push代码，就会直接push到团队项目上了。

打开git，复制你的项目地址
```javascript
  git clone https://github.com/你的github/erek-manage
```
代码就会被clone到本地，这时候你会发现，你的分支是master分支。并没有把dev分支clone下来，使用 ` git branch ` 命令查看本地分支，发现本地只有master分支。

上面的操作完成后，你就可以在本地进行开发了。但是如果要将你修改完的代码合并到团队项目上，还需要进行下面的操作

### 4. 和团队项目保持同步
首先查看有没有设置upstream，使用 ` git remote -v ` 命令来查看

```javascript
  git remote -v

  // 你会看到
  
  origin https://github.com/你的github/erek-manage.git (fetch)
  origin https://github.com/你的github/erek-manage.git (push)
  
```
如果没有显示upstream，则使用 git remote add upstream 团队项目地址 命令。

```javascript
  git remote add upstream https://github.com/团队的github/erek-manage.git

  // 这时候再使用 git remote -v

  git remote -v

  // 你会发现
  origin https://github.com/你的github/erek-manage.git (fetch)
  origin https://github.com/你的github/erek-manage.git (push)

  upstream https://github.com/团队的github/erek-manage.git (fetch)
  upstream https://github.com/团队的github/erek-manage.git (push)
```

如果设置好了，就开始同步。首先执行 `git fetch upstream` 获取团队项目最新版本

### 5. push修改到自己的项目上
记住一点，你`clone`的地址是你自己库的地址，然后添加的 `upstream` 是团队的地址，你修改代码后，push到的是自己的地址
```javascript
  git add .
  git commit -m 'fix: 修复了什么bug; add: 新增了什么' // commit一定要写你这次提交的代码，做了什么事情
  git push -u origin master // 提交到origin的master分支
   
```
### 6. 请求合并到团队项目上
在github或者coding中，有一个按钮叫做 `pull request` 或者是 `merge request`，意思就是发送合并请求，也就是把你的代码合并到团队的项目代码中，然后点击就好了，点击之后会让你选择从你的库的哪个分支，合并到团队库的哪个分支

一般来说，都是从你的库master分支合并到项目库的dev分支，然后项目负责人审核及同意合并请求，之后dev无问题，再合并到qa分支上测试，master分支始终是线上跑的分支，只接受经过qa分支测试后的合并请求

### 7. 团队项目负责人审核及同意合并请求
一般来讲，在公司中，你是无权自己通过审核的，你只能发送一个merge request，之后leader会检查审核一下你的代码，然后决定是否同意合并，之后通过了，就会把代码合并到dev分支，最后再合并到qa，以及master

### 8. 更新本地代码
你push了你写的代码，老大也push了他写的代码，同事也push了他写的代码，所以你开发前，得先更新一下本地代码，不然会出现冲突

比如你本地的a.js文件里边有段代码，同事A把这段代码改了之后合并到线上。这时候你如果不更新pull一下代码，然后你本地把这段代码也改了，在push的时候，就会出现冲突了，因为不知道是采用你的，还是采用同事A的，这时候就要解决冲突了。所以每次开发前，还是习惯性的pull一下团队最新代码

```javascript
  git pull upstream master
```

并且你每次发送请求merge request的时候，还是要跟同事以及leader说一声

