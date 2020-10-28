## 简易 react 脚手架

> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io)

在开始之前，先把我们的目录结构搭建起来，由于我比较喜欢一些 npm 包，所以自己写了一个简易版的 `react-quick-cli` 脚手架，[感兴趣的可以点击这里](https://github.com/PDKSophia/react-quick-cli)

### 新建一个空白文件

```bash
mkdir react-quick-cli
```

### 初始化项目

进入到 `react-quick-cli` 文件夹，初始化项目。然后会让你填一些项目相关的信息，跟着提示填就是了。没啥说的。注意 name 不要和现有的其他 npm 包重名了，不然一会儿发 npm 包的时候会失败，可以先去 [npmjs.com](https://www.npmjs.com/) 搜一下有没有重名的。

```bash
cd react-quick-cli
npm init
```

### package.json

因为这是一个 react 的组件包，不多说啥了，需要什么的，自己装，目前我就支持 `less`、`ts` 等常用的配置，下边这是我的 package.json

```js
{
  "name": "react-quick-cli",
  "version": "1.0.0",
  "description": "快速开发react第三方包脚手架，已完成基本配置",
  "main": "dist/index.js",
  "scripts": {
    "start": "webpack-dev-server --config config/webpack.dev.config.js",
    "build": "webpack --config config/webpack.prod.config.js",
    "pub": "npm run build && npm publish",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/PDKSophia/react-quick-cli.git"
  },
  "keywords": [
  ],
  "author": "彭道宽",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/PDKSophia/react-quick-cli/issues"
  },
  "homepage": "https://github.com/PDKSophia/react-quick-cli#readme",
  "devDependencies": {
    "@babel/cli": "^7.5.5",
    "@babel/core": "^7.5.5",
    "@babel/plugin-proposal-class-properties": "^7.12.1",
    "@babel/preset-env": "^7.5.5",
    "@babel/preset-react": "^7.0.0",
    "@babel/preset-typescript": "^7.12.1",
    "@testing-library/jest-dom": "^4.0.0",
    "@testing-library/react": "^9.3.0",
    "@types/jest": "^24.0.18",
    "@types/node": "^10.12.24",
    "@types/react": "^16.8.0",
    "@types/react-dom": "^16.8.0",
    "@types/react-test-renderer": "^16.8.0",
    "babel-loader": "^8.0.6",
    "css-loader": "^3.2.0",
    "del": "^5.0.0",
    "gulp": "^4.0.2",
    "gulp-typescript": "^5.0.1",
    "husky": "^3.0.9",
    "jest": "^24.1.0",
    "less": "^3.12.2",
    "less-loader": "^7.0.2",
    "mini-css-extract-plugin": "^0.8.0",
    "prettier": "^1.18.2",
    "pretty-quick": "^2.0.0",
    "react": "^16.9.0",
    "react-dom": "^16.9.0",
    "react-test-renderer": "^16.8.0",
    "rollup": "^1.21.4",
    "style-loader": "^1.0.0",
    "ts-jest": "^24.0.2",
    "tslint": "^5.18.0",
    "typescript": "^3.9.7",
    "webpack": "^4.39.3",
    "webpack-cli": "^3.3.7",
    "webpack-dev-server": "^3.8.0",
    "webpack-merge": "^4.2.2"
  },
  "dependencies": {
    "@types/hoist-non-react-statics": "^3.3.1",
    "@types/react-reconciler": "^0.18.0",
    "babel-plugin-import": "^1.13.1",
    "react-reconciler": "^0.25.1"
  }
}
```

### 执行下载依赖包

```js
npm install
```

### 新增 src

src 是开发目录，这里就是你写的第三方组件，比如我这里就只需要导出一个组件，在 src 文件夹下，我们写一个 main.js

```js
// src/main.js
import React from 'react'
import styles from './index.less'
class Main extends React.Component {
  render() {
    return (
      <div className={styles.title}>
        <span className={styles.text}>react-quick-cli</span>
      </div>
    )
  }
}

export default Main
```

然后在 src 文件夹中，写一个 index.js，把这个 main 组件导出去

```js
// src/index.js
import Main from './main'
export default Main
```

## 新增 example

顾名思义，就是简单例子的展示，我们写好了第三方组件包，如何验证我们写的组件有没有问题？总不能真的推到 npm 上，然后自己拉下来验证吧？不会吧不会吧？

所以新增了一个文件夹，主要引用的是打包之后的文件，然后进行展示，比如上边，我们的第三方包主要是导出一个 Main 组件，那么我们在 example 中可以这么验证

```js
// example/app.js
import React from 'react'
import { render } from 'react-dom'
import Main from '../../dist' // 引入的是打包之后的组件包，主要用于展示打包之后的组件是否有问题
// import Main from '../../src'  // 引入的是未打包中的组件包，主要是修改了组件包的代码，能够在开发中实时看到

const App = () => {
  return (
    <div>
      本地开发
      <Main />
    </div>
  )
}
render(<App />, document.getElementById('root'))
```

自然而然，我们想在开发过程中，看到效果，就得有个 html 页面，所以看这里

```html
<html>
  <head>
    <title>react-quick-cli</title>
    <meta charset="utf-8" />
    <meta name="viewport" />
  </head>
  <body>
    <div id="root"></div>
    <script src="bundle.js"></script>
    <!-- 这句十分重要 -->
  </body>
</html>
```

### 加入 webpack 打包

之所以不用 create-react-app 是因为，想改一下 webpack 配置，得用 `react-app-rewired`，自己捣鼓，很蛋疼，就自己写了

我们新增一个 config 文件夹，用于存放 webpack 相关配置，[更多信息可以看这里](https://github.com/PDKSophia/react-quick-cli/tree/master/config)

下面展示的是开发过程中的配置

```js
const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const devConfig = {
  mode: 'development',
  entry: path.join(__dirname, '../example/src/app.js'), // 这里的入口就是 example 的入口
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: 'bundle.js', // 使用 webpack-dev-server 启动开发服务时，并不会实际在`src`目录下生成bundle.js，打包好的文件是在内存中的，但并不影响我们使用。
    libraryTarget: 'umd', // 采用通用模块定义
    libraryExport: 'default', // 兼容 ES6 的模块系统、CommonJS 和 AMD 模块规范
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.min.css', // 提取后的css的文件名
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, '../example/src/'),
    compress: true,
    host: '127.0.0.1', // webpack-dev-server启动时要指定ip，不能直接通过localhost启动，不指定会报错
    port: 7001, // 启动端口为 7001 的服务
    open: true, // 自动打开浏览器
  },
}

module.exports = merge(devConfig, baseConfig) // 将baseConfig和devConfig合并为一个配置
```

因为有分环境，打包的时候，开发环境跑的是 `webpack.dev.config.js`，打包的时候跑的是 `webpack.prod.config.js`，还有些不一样，我们可以从 package.json 中看到

```js
  "scripts": {
    "start": "webpack-dev-server --config config/webpack.dev.config.js",
    "build": "webpack --config config/webpack.prod.config.js",
    "pub": "npm run build && npm publish",
  }
```

### 打包

到这一步，只需要打包，就能发布了。执行 `npm run build` 打包之后，会生成一个 dist 目录，为啥？因为你的 `webpack.prod.config.js` 中有配置 output :

```js
const prodConfig = {
  mode: 'production',
  entry: path.join(__dirname, '../src/index.js'),
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: 'index.js',
    libraryTarget: 'umd', // 采用通用模块定义
    libraryExport: 'default', // 兼容 ES6 的模块系统、CommonJS 和 AMD 模块规范
  },
}
```

然后这时候我们一定要修改 package.json 中的 main 字段指向的主文件信息

```js
{
  "name": "react-quick-cli",
  "version": "1.0.0",
  "main": "dist/index.js",
}
```

### 忽略要上的文件

新建一个文件，名为.npmignore，是不需要发布到 npm 的文件和文件夹，规则和.gitignore 一样。如果你的项目底下有.gitignore 但是没有.npmignore，那么会使用.gitignore 里面的配置

```bash
.*
*.md
*.yml
build/
node_modules/
src/
test/
example
```

### 发布

先去 npm 注册一个账号 （一定要进行邮箱验证），然后进入根目录，运行 npm login

它会让你输入你的用户名，密码和邮箱，若登录成功，会显示：

```bash
  Logged in as 你的名字 on https://registry.npmjs.org/.
```

接着执行 npm publish 发布到 npm 官网上

当你的包需要更新时，需要自己手动修改 package.json 中的 version 版本号，惯例是+1 啦，比如 1.0.0-->1.0.1。然后 npm login, npm publish。即可。

如果发现 npm login 不行，报 409 error，那么你可以考虑换下淘宝源

```bash
npm login --registry http://registry.npmjs.org
npm publish --registry http://registry.npmjs.org
```

## 链接

下边是简易版的脚手架 react-quick-cli : https://github.com/PDKSophia/react-quick-cli

基于简易版脚手架写了一些包 :

- [sugar-hox-devtools](https://github.com/PDKSophia/sugar-hox-devtools)
- [rc-redux-model](https://github.com/SugarTurboS/rc-redux-model)
