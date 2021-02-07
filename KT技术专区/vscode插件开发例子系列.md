# 背景


> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io)

> 📢 团队博客: [SugarTurboS](https://github.com/SugarTurboS/Blogs)

> 🌈 仓库源码 : [learn-vscode-extension](https://github.com/PDKSophia/learn-vscode-extension) ，求个 ✨ star


好久不见，整了一个月的`Electron+React+Node实现项目辅助工具`好不容易搞完了，然后在项目组里推广，经过一周在团队内部使用，使用效果并不理想，无人问津，经过反馈，原因在于组员更多操作还是在 vscode 中完成， 这就很蛋疼了，都是给 vscode 惯的，好家伙，向 vscode 低头，于是我尝试这个项目辅助工具做到 vscode 插件中～

⚠️ 请注意：这篇文章是说明在开发 vscode 插件时的一些坑以及 demo 的例子，至于`Electron+React+Node实现项目辅助工具`系列文章在准备中，还有最终实践落地的 vscode 实战插件文章也躺在草稿箱里

# 吐槽一下

我怀疑我是被“搞”了，本来这个项目辅助工具使用 `Electron` 开发时，我就觉得这是个坑，毕竟我没写过 electron，等我做完了之后，好家伙，跟我说:“还需要下载个 PC 包安装，再运行应用？”，“操作繁琐”，让我做个 vscode 插件

vscode 插件我也没搞过啊，这是让我“迎难(男)而上”了！好了，废话不多说，直接开始吧。 怎么说呢，在做之前，也在网上搜过一些文章，奈何大部分都停留在 **install + hello world** 阶段，意思就是教你如何安装，然后写一个 hello world 简单的小 demo，当然，这也没问题，但这并不是我想要的，**我想要的是需要各种场景下的 demo 例子**，经过一些文章的查找和翻阅官方文档，[整理了一些常见的例子](https://github.com/PDKSophia/learn-vscode-extension)，后续会持续更新，包括项目最终落地的 vscode 实战插件等～

# 初步尝试

## 一、安装依赖

微软为了造福大众，提供了一个 `yeoman` 脚手架，通过此脚手架可以生成开发插件的模版代码。可以通过命令进行安装

```bash
npm install -g yo generator-code
```

这时候你应该是有一下环境的

- nodejs
- npm
- yeoman
- generator-code

## 二、初始化 Demo 插件

当上面的安装完毕之后，只需要进入你开发目录文件夹，通过脚手架生成一个开发 vscode 插件的项目。

```bash
yo code
```

根据提示信息填写相关内容

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f50d78d466d4206802f2f0fcd801d66~tplv-k3u1fbpfcp-watermark.image)

这时候我们的 vscode 插件项目就完成初始化了～ 下面看看相关文件的说明！

## 文件说明

项目中两个重要的文件我们需要看一下：**extension.ts** 和 **package.json**

### 3.1 extension.ts

该文件是入口文件，下面我们写一段简单的 demo 代码

此段代码意思为：注册一个 beehive.toastDemo 事件，当触发此事件会显示一段 message

```typescript
// extension.ts
import * as vscode from 'vscode'
export function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  let disposable = vscode.commands.registerCommand('beehive.toastDemo', () => {
    vscode.window.showInformationMessage('toastDemo touched !')
  })
  context.subscriptions.push(disposable)
}
export function deactivate() {}
```

### 3.2 package.json

该文件配置项太多，建议去官方文档翻阅

关键的主要是: **activationEvents** 和 **contributes** 这两个属性，关于这两个属性你可以看[官方文档](https://code.visualstudio.com/api/references/contribution-points)

下面讲一下 contributes 这玩意，contributes 是这个插件的核心，指代这个插件有哪些功能。通过官方文档我们也能知道(这些都在[demo 例子](https://github.com/PDKSophia/learn-vscode-extension/issues)中有写到)：

- configuration：通过这个配置项我们可以设置一个属性，这个属性可以在 vscode 的 settings.json 中设置，然后在插件工程中可以读取用户设置的这个值，进行相应的逻辑。
- commands：定义的命令，在 vscode 中通过 `cmd+shift+p` 进行输入定义好的命令就可触发对应事件。
- menus：自定义编辑器右侧菜单栏
- keybindings：可以设置快捷键
- languages：设置语言特点，包括语言的后缀等
- grammars：可以在这个配置项里设置描述语言的语法文件的路径，vscode 可以根据这个语法文件来自动实现语法高亮功能
- snippets：设置语法片段相关的路径

以上边注册的 `toastDemo` 为例，此时的 package.json 应为：

```json
{
  "activationEvents": ["onCommand:beehive.toastDemo"],
  "contributes": {
    "commands": [
      {
        "command": "beehive.toastDemo",
        "title": "demo1: beehive.toastDemo !"
      }
    ]
  }
}
```

## 四、运行 vscode 插件

点击此 Debug Icon，或者是 vscode 菜单栏：Run -> Start Debugging

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f292b39e2eac47a9800df5cf266f264b~tplv-k3u1fbpfcp-watermark.image" width=320 />

当我们点击下 Run Extension 时，会开一个本地 vscode 窗口

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5038b137ee948f1a725f7b9e95dd8e1~tplv-k3u1fbpfcp-watermark.image" width=450 />

我们在新开的 vscode 窗口中输入 : `cmd + shift + P`

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aeb375687ab9407195311cfc25d2a1b6~tplv-k3u1fbpfcp-watermark.image" width=400 />

然后输入我们注册的事件：`beehive.toastDemo`，然后我们按下回车，就会执行我们写的事件回调了！

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e2da6a965544aedb5b36a607624a3f0~tplv-k3u1fbpfcp-watermark.image" width=360 />

至此，我们的第一个简单 Demo 完成！如果你还不了解，[👉 建议直接去看源码，特别简单](https://github.com/PDKSophia/learn-vscode-extension/issues)

# 例子

我写个 vscode 插件，肯定不只是想展示一个 `toastMessage` 弹窗吧 ？？？我想做些交互效果咋办，想自定义 Menu、想展示 WebView、想自定义左侧侧边栏咋整？？不慌，往下看，下面是我整理的一些小 demo，虽然不一定能满足你的需求，但是希望应该能给你一些帮助～

## 1.输入内容(Input)

### 场景

该场景适合一些需要输入内容之后做的操作；

- 输入 text ，发起接口请求等
- 输入 text ，执行一些逻辑操作
- ......

### 代码展示

```typescript
// demo1 需要Input输入内容
// beehive-inputName.ts
import * as vscode from 'vscode'

module.exports = function (context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('beehive.inputName', () => {
    vscode.window
      .showInputBox({
        ignoreFocusOut: true,
        password: false,
        prompt: 'entry your name',
      })
      .then((value) => {
        if (value === undefined || value.trim() === '') {
          vscode.window.showInformationMessage('Please type your name.')
        } else {
          const name = value.trim()
          vscode.window.showInformationMessage('your name is: ', name)
          return
        }
      })
  })

  context.subscriptions.push(disposable)
}
```

入口文件需要引入该文件

```typescript
// extension.ts
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  require('./beehive-inputName')(context) // demo1 输入Input内容
}

export function deactivate() {}
```

通过 package.json 也需要注册此事件

```json
{
  "activationEvents": ["onCommand:beehive.inputName"],
  "contributes": {
    "commands": [
      {
        "command": "beehive.inputName",
        "title": "demo1: beehive.inputName !"
      }
    ]
  }
}
```

### 效果展示

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5073c2589d4c49b8ad1675afdcd0794c~tplv-k3u1fbpfcp-watermark.image" width=420 />

### 源码展示

- [beehive-inputName.ts](https://github.com/PDKSophia/learn-vscode-extension/blob/master/src/beehive-inputName.ts)

## 2.自定义 WebView 页面

### 场景

该插件场景适合做一些简单页面展示、欢迎页面等

### 代码展示

```typescript
// demo2 自定义显示页
// 具体看 package.json 中的 configuration 和 commands
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

module.exports = function (context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'beehive.customWelcome',
    () => {
      const panel = vscode.window.createWebviewPanel(
        'welcome',
        '自定义欢迎页',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      )

      const htmlPath = path.join(
        context.extensionPath,
        'src/customWelcome.html'
      )
      let html = fs.readFileSync(htmlPath, 'utf-8')
      panel.webview.html = html
    }
  )

  context.subscriptions.push(disposable)
}
```

```typescript
// extension.ts
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  require('./beehive-customWelcome')(context) // demo2 加载自定义WebView欢迎页
}

export function deactivate() {}
```

```json
// package.json
{
  "activationEvents": ["onCommand:beehive.customWelcome"],
  "contributes": {
    "commands": [
      {
        "command": "beehive.customWelcome",
        "title": "demo4: beehive.customWelcome !"
      }
    ]
  }
}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>自定义欢迎页面</title>
    <style>
      .app {
        margin: 12px 0;
        font-size: 24px;
      }
      .title {
        font-size: 18px;
        margin-top: 24px;
      }
    </style>
  </head>
  <body>
    <div class="app">
      Welcome BeeHiver ～
      <div class="title">后人哀之而不鉴之 亦使后人而复哀后人也 !</div>
    </div>
    <img
      src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
      width="300"
    />
  </body>
</html>
```

### 效果展示

<img src="https://user-images.githubusercontent.com/29560420/106861315-90af4a80-6700-11eb-83c6-976f8ee3d90d.png" width=400 />

### 源码展示

- [beehive-customWelcome.ts](https://github.com/PDKSophia/learn-vscode-extension/blob/master/src/beehive-customWelcome.ts)

## 3.快捷键注册

### 场景

每次我们都需要 cmd+shift + P 调出选择器，然后输入我们注册的事件名，特别麻烦，vscode 支持快捷键注册，下面看看如何实现吧！

### 代码展示

```json
{
  "activationEvents": ["onCommand:beehive.keybindings"],
  "contributes": {
    "commands": [
      {
        "command": "beehive.keybindings",
        "title": "demo4: beehive.keybindings !"
      }
    ],
    "keybindings": [
      {
        "command": "beehive.keybindings",
        "key": "Cmd+]",
        "mac": "Cmd+]",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

然后此时我们通过 `Run Extension` (上面有说如何运行插件) ，在本地窗口，我们随便打开一个文件，然后按下 : `cmd+]` 就可以触发我们定义的 `beehive.keybindings` 事件

> 🙋‍♂️ 可能有人要问，为什么要打开文件？直接按快捷键为什么没有反应？原因是：我们上面写了 when 条件，**当编辑器被聚焦编辑(editorTextFocus)时，才去注册的此事件**，懂？

### 源码展示

- [beehive-keybindings.ts](https://github.com/PDKSophia/learn-vscode-extension/blob/master/src/beehive-keybindings.ts)

## 4.自定义菜单 Menu

### 场景

适用于一些快捷按钮的自定义，可通过 Menu 操作

### 代码展示

```typescript
// demo4 自定义菜单
import * as vscode from 'vscode'
module.exports = function (context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('beehive.customMenu', () => {
    vscode.window.showInformationMessage("I' am custom menu !")
  })
  context.subscriptions.push(disposable)
}
```

```typescript
// extension.ts
import * as vscode from 'vscode'
export function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  require('./beehive-customMenu')(context) // demo4 自定义菜单
}
export function deactivate() {}
```

```json
// package.json
{
  "activationEvents": ["onCommand:beehive.customMenu"],
  "contributes": {
    "commands": [
      {
        "command": "beehive.customMenu",
        "title": "demo5: 启动自定义菜单"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "command": "beehive.customMenu",
          "alt": "beehive.customMenu",
          "group": "navigation"
        }
      ]
    }
  }
}
```

关于这些字段信息，我就不一一贴了，官方文档很多说明，直接看这里: [👉 文档相关字段说明](https://code.visualstudio.com/api/references/contribution-points)

### 效果展示

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be81fa18178b4280b908edf3d89e4863~tplv-k3u1fbpfcp-watermark.image" width=500 />

点击之后，触发事件

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbadce7979a24e0883f4f097444e3d1c~tplv-k3u1fbpfcp-watermark.image" width=500 />

### 源码展示

- [beehive-customMenu.ts](https://github.com/PDKSophia/learn-vscode-extension/blob/master/src/beehive-customMenu.ts)

## 5.悬停提示

### 场景

当你鼠标光标 hover 至某个代码时，你想要显示一些文字内容

### 代码展示

```typescript
// demo5 对package.json中的author进行悬停提示
import * as vscode from 'vscode'

module.exports = function (context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerHoverProvider('json', {
    provideHover(document, position, token) {
      const fileName = document.fileName
      const word = document.getText(document.getWordRangeAtPosition(position))
      if (/\/package\.json$/.test(fileName) && /\bauthor\b/.test(word)) {
        return new vscode.Hover('悬停提示: 彭道宽牛逼!')
      }
      return undefined
    },
  })

  context.subscriptions.push(disposable)
}
```

上面对于文件以及关键词 keyword 可以根据业务自行抽离，这里就不写那么多，自行领悟～

```typescript
// extension.ts
import * as vscode from 'vscode'
export function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  require('./beehive-hoverTips')(context) // demo5 悬停提示
}
export function deactivate() {}
```

### 效果展示

![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a590d36dbecd46c38998e8dc5ad8e84b~tplv-k3u1fbpfcp-watermark.image)

### 源码展示

- [beehive-hoverTips.ts](https://github.com/PDKSophia/learn-vscode-extension/blob/master/src/beehive-hoverTips.ts)

## 6.代码片段

### 场景

输入一个前缀，会得到一个或多个提示，然后回车带出很多代码。

### 代码展示

需要修改 package.json 中的 snippets 的配置

```json
// package.json
{
  "contributes": {
    "snippets": [
      {
        "language": "html",
        "path": "./src/snippets/html.json"
      }
    ]
  }
}
```

然后添加一个 html.json 配置

```json
{
  "PDK": {
    "prefix": ["PDK", "PD", "PK", "DK"],
    "body": ["<PDK>", "${1}", "</PDK>"],
    "description": "彭道宽自定义的snippets"
  }
}
```

关于每个字段，可以通过官方文档了解：[create-your-own-snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_create-your-own-snippets)

上面我们是设置语言为 : **html**，所以在运行插件，并保证插件被激活，在规定的语言 html 中，输入 prefix 相关的关键词，就可以啦

### 效果展示

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80b4c821fc40487282a14ea64e654473~tplv-k3u1fbpfcp-watermark.image" width=300 />

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6b6794936f54ac79592874de68a162f~tplv-k3u1fbpfcp-watermark.image" width=300 />

### 源码展示

- [snippets 中的 package 配置](https://github.com/PDKSophia/learn-vscode-extension/blob/master/package.json#L72)

## 7.自定义侧边栏+面板

### 背景

需要在左侧自定义侧边栏，完成一些交互逻辑操作

### 代码实现

⚠️ 需要注意：**侧边栏按钮(Tree View Container)和面板视图(Tree View)要同时配置，否则不生效**

#### 侧边栏的展示

首先，我们先看官方文档，看看如何在左边这个侧边栏添加我们自定义的内容

[👉 contribution-points#contributes.viewsContainers](https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers)

```json
// package.json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "sugar",
          "title": "Sugar-BeeHive",
          "icon": "./src/logo/sugar.svg"
        }
      ]
    },
    "views": {
      "sugar": [
        {
          "id": "BeeHive-Command",
          "name": "01.命令集"
        },
        {
          "id": "BeeHive-PackageAnalysis",
          "name": "02.包分析"
        }
      ]
    }
  }
}
```

⚠️ 注意点：**views 中 key 要和 activitybar 中的属性 id 保持一致，如 sugar 在两者中是一致的**

这时候运行我们的插件：`Run Extension`，就可以看到在左侧有我们自定义的侧边栏啦

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c07922c7cbf142edba76fa30d5a9227a~tplv-k3u1fbpfcp-watermark.image" width=300 />

> 关于图标 svg 这个大家自己注意一下路径就好了，我这边重点不是图标哈～

上面我们配置完 `package.json` 之后，我们再回到文档，会看到这么一段话：[tree-view#activationEvents](https://code.visualstudio.com/api/extension-guides/tree-view#activation)

如果需要，你就加上下面这段代码即可

```json
{
  "activationEvents": ["onView:BeeHive-Command"]
}
```

#### 如何定义面板内容

上面是展示出来了侧边栏，但是我们需要展示内容啊，怎么整？通过官方文档：[tree-data-provider](https://code.visualstudio.com/api/extension-guides/tree-view#tree-data-provider) 可以实现一个小 demo，下面这段代码也是基于官方文档改的

```typescript
// beehive-sidebar.ts
// demo7 自定义侧边栏入口和面板
import * as vscode from 'vscode'

const scripts = [
  {
    script: 'webpack:dev',
  },
  {
    script: 'webpack:prod',
  },
  {
    script: 'server:dev',
  },
  {
    script: 'server:test',
  },
  {
    script: 'server:test-1',
  },
  {
    script: 'server:test-2',
  },
]

/**
 * @description 重写每个节点
 */
export class SideBarEntryItem extends vscode.TreeItem {
  constructor(
    private version: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState)
    this.tooltip = `${this.label}-${this.version}`
    // this.description = `${this.version}-${Math.ceil(Math.random() * 1000)}`
  }
}

/**
 * @description 入口文件
 */
export class SideBarBeeHiveCommand
  implements vscode.TreeDataProvider<SideBarEntryItem> {
  constructor(private workspaceRoot?: string) {}
  getTreeItem(element: SideBarEntryItem): vscode.TreeItem {
    return element
  }

  getChildren(
    element?: SideBarEntryItem
  ): vscode.ProviderResult<SideBarEntryItem[]> {
    if (element) {
      //子节点
      var childrenList = []
      for (let index = 0; index < scripts.length; index++) {
        var item = new SideBarEntryItem(
          '1.0.0',
          scripts[index].script,
          vscode.TreeItemCollapsibleState.None
        )
        item.command = {
          command: 'BeeHive-Command.openChild', //命令id
          title: scripts[index].script,
          arguments: [scripts[index].script], //命令接收的参数
        }
        childrenList[index] = item
      }
      return childrenList
    } else {
      //根节点
      return [
        new SideBarEntryItem(
          '1.0.0',
          '项目一',
          vscode.TreeItemCollapsibleState.Collapsed
        ),
        new SideBarEntryItem(
          '1.0.0',
          '项目二',
          vscode.TreeItemCollapsibleState.Collapsed
        ),
      ]
    }
  }
}

export class SideBarBeeHivePackageAnalysis
  implements vscode.TreeDataProvider<SideBarEntryItem> {
  constructor(private workspaceRoot?: string) {}
  getTreeItem(element: SideBarEntryItem): vscode.TreeItem {
    return element
  }

  getChildren(
    element?: SideBarEntryItem
  ): vscode.ProviderResult<SideBarEntryItem[]> {
    if (element) {
      //子节点
      var childrenList = []
      for (let index = 0; index < scripts.length; index++) {
        var item = new SideBarEntryItem(
          '1.0.0',
          scripts[index].script,
          vscode.TreeItemCollapsibleState.None
        )
        item.command = {
          command: 'BeeHive-PackageAnalysis.openChild', //命令id
          title: scripts[index].script,
          arguments: [index], //命令接收的参数
        }
        childrenList[index] = item
      }
      return childrenList
    } else {
      //根节点
      return [
        new SideBarEntryItem(
          '1.0.0',
          '按钮组',
          vscode.TreeItemCollapsibleState.Collapsed
        ),
      ]
    }
  }
}

module.exports = function (context: vscode.ExtensionContext) {
  // 注册侧边栏面板
  const sidebarBeeHiveCommand = new SideBarBeeHiveCommand()
  const sidebarBeeHivePackageAnalysis = new SideBarBeeHivePackageAnalysis()
  vscode.window.registerTreeDataProvider(
    'BeeHive-Command',
    sidebarBeeHiveCommand
  )
  vscode.window.registerTreeDataProvider(
    'BeeHive-PackageAnalysis',
    sidebarBeeHivePackageAnalysis
  )

  //注册命令
  vscode.commands.registerCommand('BeeHive-Command.openChild', (args) => {
    console.log('[BeeHive-Command.openChild] 当前选中的是:', args)
    vscode.window.showInformationMessage(args)
  })
  vscode.commands.registerCommand(
    'BeeHive-PackageAnalysis.openChild',
    (args) => {
      console.log('[BeeHive-PackageAnalysis.openChild] 当前选中的是:', args)
      vscode.window.showInformationMessage(args)
    }
  )
}
```

然后在入口文件 `extension.ts` 添加该文件

```typescript
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  require('./beehive-sidebar')(context) // demo7 自定义侧边栏入口和面板
}

export function deactivate() {}
```

如果需要点击左侧侧边栏的节点时触发内容，只需要在 `arguments` 里面回传一些内容，然后做对应的业务操作即可

### 效果展示

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82c4c91b9d58499a8531bc55bba416b4~tplv-k3u1fbpfcp-watermark.image)

### 源码阅读

- [beehive-sidebar.ts](https://github.com/PDKSophia/learn-vscode-extension/blob/master/src/beehive-sidebar.ts)
- [package.json 中的 viewsContainers](https://github.com/PDKSophia/learn-vscode-extension/blob/master/package.json#L23)
- [package.json 中的 views](https://github.com/PDKSophia/learn-vscode-extension/blob/master/package.json#L32)

## 打包、发布

这东西就不需要我教了吧？搜一下还是有这方面的文章的，我就不当搬运工了，感兴趣的自行去搜一搜，或者等我后续实战文章出来看看？

# 唠嗑几句

上面的几个例子差不多够一个新手开发 vscode 插件了，所有的 demo 例子我都放在: [learn-vscode-extension](https://github.com/PDKSophia/learn-vscode-extension)中，后面也会将实战的项目辅助工具插件放在该仓库里

如果你开发过vscode插件，你就知道文档写的有多“全”了，属于你知道很全，但是这个属性或者字段在插件中长什么样，得自己去“悟”，很蛋疼，我开发过程，如果需要些部分的插件功能，得去插件市场下载对应插件，使用一波，然后再去 github 阅读对应源码。比如我们常用的 : [vscode-gitlens](https://github.com/eamodio/vscode-gitlens/blob/main/package.json)等 

顺便澄清一下，组员不用 PC 端的项目辅助工具真的不是我写的烂!!!

贴几张图看看 PC 端的项目辅助工具，会将上边的功能都继承到该 vscode 插件中，后面 PC 端的代码 + vscode 插件代码都会脱敏开源～

1. 入口

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ce0f952f5184415a9d745e22e1f25af~tplv-k3u1fbpfcp-watermark.image"  >

2. 导入文件，历史操作区

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81f8d87561d34b558ba179c60274f7cd~tplv-k3u1fbpfcp-watermark.image" >

3. 导入的文件不符合规范

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5380da60466e4040885559962c05c213~tplv-k3u1fbpfcp-watermark.image" >

4. 符合规范，运行命令，文章检索

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5d5265f586743e59d168eb8bd7cc621~tplv-k3u1fbpfcp-watermark.image" >

太多堆积文章需要写了，等过完年再慢慢整理吧，祝大家过个好年

# 相关链接

- [阿宽的博客](https://github.com/PDKSophia/blog.io)
- [SugarTurboS](https://github.com/SugarTurboS)
- [vscode-gitlens](https://github.com/eamodio/vscode-gitlens/blob/main/package.json)
- [官方文档API](https://code.visualstudio.com/api/references/vscode-api)
- [小茗同学-vscode插件开发全攻略](https://www.cnblogs.com/liuxianan/p/vscode-plugin-overview.html)

> 夸一下小茗同学的文章，虽然我没怎么认真看内容，我都是看图，然后去看该图对应的源码，不过在前期开发vscode插件，可以说帮助还是比较大的～