## 1.前言
之前总是npm install 别人的包，使用别人的插件，刚好最近面试，面试官有问，自己写过插件吗？这不，今天花了一下午的时间，搞了一下这玩意～

这里我写了一个对话弹窗的组件，嗯，因为之前用别的框架，对话框Modal总是无法改成自己想要的，于是自己写了一个，突然一想，为何不做成一个npm 包呢，话不多说，开始吧

## 2.步骤
一: 跟平常一样写我们的vue代码

二: 发布到npm上

### 2.1 新建一个空白文件夹

```javascript
  mkdir npm // 这里文件夹名为 npm
```
### 2.2 初始化项目
初始化项目。然后会让你填一些项目相关的信息，跟着提示填就是了。没啥说的。注意name不要和现有的其他npm包重名了，不然一会儿发Npm包的时候会失败，可以先去npmjs.com搜一下有没有重名的。
```javascript
  npm init
```

### 2.3 package.json
因为这是一个vue的组件包，而且使用了es6和webpack，所以在devDependencies字段中，应该至少加入以下依赖，下边这是我的package.json，对应的字段，自己查一哈
```json
{
    "name": "p-dialog-modal",
    "version": "1.0.3",
    "description": "弹窗组件，自己的第一个npm包，有些粗略和简单",
    "main": "dist/pdkModal.min.js",
    "scripts": {
	"test": "echo \"Error: no test specified\" && exit 1",
	"start": "webpack-dev-server --hot --inline",
	"build": "webpack --display-error-details --config webpack.config.js"
    },
    "repository": {
	"type": "git",
	"url": "git+https://github.com/PDKSophia/p-dialog-modal.git"
    },
    "author": "PDK",
    "license": "ISC",
    "bugs": {
	"url": "https://github.com/PDKSophia/p-dialog-modal/issues"
    },
    "homepage": "https://github.com/PDKSophia/p-dialog-modal#readme",
    "devDependencies": {
	"babel-core": "^6.26.0",
	"babel-loader": "^7.1.2",
	"babel-plugin-transform-object-rest-spread": "^6.26.0",
	"babel-plugin-transform-runtime": "^6.23.0",
	"babel-polyfill": "^6.26.0",
	"babel-preset-es2015": "^6.24.1",
	"css-loader": "^0.28.7",
	"es6-promise": "^4.1.1",
	"less": "^2.7.3",
	"less-loader": "^4.0.5",
	"style-loader": "^0.19.0",
	"url-loader": "^0.6.2",
	"vue": "^2.5.9",
	"vue-hot-reload-api": "^2.2.4",
	"vue-html-loader": "^1.2.4",
	"vue-loader": "^13.5.0",
	"vue-router": "^3.0.1",
	"vue-style-loader": "^3.0.3",
	"vue-template-compiler": "^2.5.9",
	"vuex": "^3.0.1",
	"webpack": "^3.9.1",
	"webpack-dev-server": "^2.9.5"
    }
}

```
### 2.4 执行下载依赖包
```javascript
  npm install
```

### 2.5 新建 src 和 dist 文件夹
dist代表发布时的目录，src是开发目录。dist里面的js是到时候通过webpack打包后的文件。待会只会提交dist目录到npm官网上，src不提交。

src文件夹中，我们写一个app.vue
```html
  <!-- app.vue -->

  <template>
    <div>
	  <p>我是{{ user.name }}</p>
	  <p>我来自{{ user.from }}</p>
    </div>
  </template>

  <script>
    export default {
      data () {
        return {}
      },
      props: {
        user: {
          type: Object
        }
      }
    }
  </script>

  <style scoped lang='less'>
  </style>

```
src文件夹中，我们写一个index.js，目的就是把这个app导出去

```javascript
  // index.js

  import NpmVue from './app.vue'
  export default NpmVue

```

### 2.6 加入webpack打包配置，并把src中的内容打包进dist目录中
在根目录下新增webpack.config.js文件
```javascript
const path = require("path");
const webpack = require("webpack");
const uglify = require("uglifyjs-webpack-plugin");
 
module.exports = {
    devtool: 'source-map',
    entry: "./src/index.js",//入口文件，就是上步骤的src目录下的index.js文件，
    output: {
        path: path.resolve(__dirname, './dist'),//输出路径，就是上步骤中新建的dist目录，
        publicPath: '/dist/',
        filename: 'pdkModal.min.js', // 输出文件，对应package.json中的main字段
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [{
                test: /\.vue$/,  
                loader: 'vue-loader'
            },
            {
                test: /\.less$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: "less-loader" }
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
                loader: 'babel-loader'
            },
            {
                test: /\.(png|jpg|gif|ttf|svg|woff|eot)$/,
                loader: 'url-loader',
                query: {
                    limit: 30000,
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]
};

```

### 2.7 打包
执行 npm run build，就会在dist目录下生成一个pdkModal.min.js,这就是我们npm包的主文件

注意，这里要修改package.json中的main字段指向的主文件信息

```javascript
  npm run build
```

修改package.json中的main字段
```javascript
  {
	...
	"main": "dist/pdkModal.min.js" // 换成你的
  }

```

### 2.8 忽略要上的文件
新建一个文件，名为.npmignore，是不需要发布到npm的文件和文件夹，规则和.gitignore一样。如果你的项目底下有.gitignore但是没有.npmignore，那么会使用.gitignore里面的配置

```javascript
.*
*.md
*.yml
build/
node_modules/
src/
test/
```

### 2.9发布
先去npm注册一个账号 （一定要进行邮箱验证），然后进入根目录，运行 npm login

它会让你输入你的用户名，密码和邮箱，若登录成功，会显示：

```javascript
  Logged in as 你的名字 on https://registry.npmjs.org/.
```

接着执行 npm publish 发布到npm官网上

当你的包需要更新时，需要自己手动修改package.json中的version版本号，惯例是+1啦，比如1.0.0-->1.0.1。然后npm login,npm publish。即可。

### 链接

这是我自己写的包 : https://github.com/PDKSophia/p-dialog-modal
