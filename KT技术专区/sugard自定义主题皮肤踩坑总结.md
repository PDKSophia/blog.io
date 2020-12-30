# 前言

近三个月未见，这三个月里也有一些文章积累，只是真的没时间去写文章，都是以笔记的方式去做记录，恰好这两天在做 2020 个人总结，我想还是组织一下语言，输出几篇文章～

> 上一次主要是研究 Redux 相关技术调研，还存在许多需要去学的知识点，本来只是想了解一下 redux 相关知识，然后写了一篇[【KT】查缺补漏 React 状态管理探索](https://juejin.cn/post/6854573215440699399)，之后去看了 Redux 的源码，发现优秀代码原来是这么写的，于是就有了[【KT】轻松搞定 Redux 源码解读与编程艺术](https://juejin.cn/post/6844904183426973703)，紧接着与阿杰交流中，听到了 hox 库，于是就去看了[它的源码并写了篇文章](https://juejin.cn/post/6854573215440699399#heading-15)，到最后受阿磊的启发，写了个 Redux 中间件，并且写了篇文章记录许多坑，[【KT】rc-redux-model 你还在 redux 中写重复啰嗦的样板代码吗](https://juejin.cn/post/6874751458508537864)

好像有点偏离本文章的主题，不要慌，阿宽又把话题拉回来了，这一次的主题是：在 sugard 中，我如何实现自定义主题皮肤，中间又遇到了什么坑，如何解决？(当然解决方案不一定是最优的，如果有更好建议可以提出～)

# 背景

在今年 3 月，我们研发团队决定联合视觉团队，共同打造一套符合自身业务的 UI 组件库，毕竟迭代需求过程中，视觉对于 UI 组件的也是有规范的，当研发与视觉统一规范之后，是否可以整一波 UI 组件库呢？于是项目从立项到落地再到文档的补全上线，前后花了近半年的时间。有幸参与此 UI 库的建设，我也负责了几个组件，我还记得期间发过[前端渣渣开发 UI 公共组件的新认识](https://juejin.cn/post/6844904103592591368)、[前端渣渣的我再也不敢说我会写 Button 组件了](https://juejin.cn/post/6844904134047432711)相关的文章，此次这篇文章是对于组件库要落地到项目中，遇到的问题和自定义皮肤主题过程中，遇到的困难点。感兴趣的可以在评论区讨论～～

# 问题总结

## 1. 本地开发卡顿

在我接到需要自定义主题皮肤色需求时，屁颠屁颠的去拉了项目，本地运行，然后发现有个很恶心的问题，那就是**开发卡顿**，怎么理解呢？在开发过程中，发现开启 Chrome devtools 去获取元素样式，特别卡顿，存在延迟问题。具体有多卡顿呢？打开开发者工具，定位一个元素，想知道该元素的 style，会发现，Styles 处会 loading 大概 2s 才会加载出来...

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04043242a17945838e3d508a7729b0dd~tplv-k3u1fbpfcp-watermark.image" width=500 />

当加载出来之后，从一个元素切换到另一个元素，也是会存在延迟，并不会马上更新 Styles，需要等待近 2s ～ 5s 左右的时间，才会更新 Styles，也就是，2s ～ 5s 之后，Styles 处的才是我想要的样式。如果等待过程，你不断的切样式，那么等待时间会更久。

打开活动监视器，发现 CPU 占用率极其异常

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bdb538ed84e462c9ddcb895c60de1a9~tplv-k3u1fbpfcp-watermark.image"  />

很奇怪啊，怎么回事，于是我去跑了一下 performance

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9a2bc91dff44df09a40fa7a06e09f65~tplv-k3u1fbpfcp-watermark.image">

**蒙蔽了，😭 没有很红，甚至绿的不行**，看起来没啥问题，没有特别红的地方，如果特别红，说明帧数已经下降到影响用户体验的程度。 FPS 在 13，比较低（fps = 60 性能最佳，fps < 24 会让用户感觉到卡顿，人眼识别主要是 24 帧）再去看看 Memory 会不会有所收获，让人失望的是，我也没发现什么奇怪的现象。

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1868c38b32a4ddb9ac13eec87fc820e~tplv-k3u1fbpfcp-watermark.image" />

那就是可能某些组件的问题了，会不会是组件不断的 render ，或者是因为组件在一个页面中全展示，数量导致的问题？

采用了二分法，先只展示一半组件，将另一半注释，发现快了一些，不断二分法，到最后只展示一个组件，发现确实快了

再慢慢的添加展示的组件数量，2 个、3 个、4 个，发现确实随着数量的增多，慢慢变卡顿了。

规避方案：拆！但是拆完之后，一个页面显示一个组件，发现还是卡顿，于是看了一下 Styles，发现了一个问题，为什么同一段代码，加载了这么多次

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e621a6df1324ed5b31deb682dcf0f11~tplv-k3u1fbpfcp-watermark.image" />

发现此段代码，是因为每个组件都引入了文件夹中的 `style/index.less`

> 下面是 Badge 组件和 Checkbox 组件的 less 文件

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14c4aa03c695448ca6be829a4fa15ae4~tplv-k3u1fbpfcp-watermark.image" />

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27b5201a2d054a48bd9426365e49ad24~tplv-k3u1fbpfcp-watermark.image" />

那么问题就在于：如何解决重复 css 的问题，最后使用 [optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin) 插件进行处理

这个插件主要是支持我们自定义一些优化手段，具体使用可以自行去看文档，内部对于 cssProcessor 默认采用 cssnano 进行处理

(下面来自源码: https://github.com/NMFR/optimize-css-assets-webpack-plugin/blob/master/src/index.js)

```js
this.options.cssProcessor = !options || !options.cssProcessor ? require('cssnano') : options.cssProcessor;
```

然后通过 [last-call-webpack-plugin](last-call-webpack-plugin) 去做拦截，通过 [cssnano](https://cssnano.co/docs/Introduction/) 去做优化

下面引用 cssnano 文档的一段话解释吧 ~

> cssnano uses PostCSS to process the CSS under the hood. Because a lot of modern CSS tools use PostCSS, you can compose them together to work on a single abstract syntax tree (AST). This means that the overall processing time is reduced because the CSS does not have to be parsed multiple times.

我们可以从文档中看到，所有最佳的优化在这里 ：https://cssnano.co/docs/optimisations/

```js
uniqueSelectors

Naturally sorts selectors for every rule, and removes duplicates.
```

## 2. 项目引用报错

按照 README 文档说明，npm install 之后，引入对应组件即可，但事实证明，路没有那么顺畅

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c1466e10b6c4141a5bf537ab164de7d~tplv-k3u1fbpfcp-watermark.image" width=500 />

当真的接入之后，发现会抱各种问题，如下图所示

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/749de1558e964eeca41b9bcd5d88f88c~tplv-k3u1fbpfcp-watermark.image" />

去搜了一下，原来是 `sugard` 里边 Carousel 组件依赖了 react-slick 库，而这个库中存在一些文件格式，如 .gif 等，需要通过 `url-loader`、`file-loader` 处理

在 issues 中找到此问题的解决方案：[why is the css invalid?](https://github.com/akiran/react-slick/issues/520#issuecomment-304154701)

通过在自己项目中添加 webpack 配置

```js
module.exports = {
  module: {
    rules: [
      ...{
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      }
    ]
  }
};
```

## 3. 自定义主题色

终于到了最重要的环节，首先去看了一下 antd 自定义主题色到处理方式：[定制主题](https://ant.design/docs/react/customize-theme-cn#%E5%AE%9A%E5%88%B6%E6%96%B9%E5%BC%8F)，大致思路就是 :

**antd 的实现方式是通过 less-loader，在 less 编译为 css 时，通过配置的 lessOptions 进行替换**

那么我们也按照它这样做，行不行？于是在 sugard 的 webpack 里边配置了一下 Button 组件的重写自定义样式。

```js
{
    test: /\.less$/,
    include: /node_modules/,
    use: [
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              modifyVars: {
                // normal 类型
                "btn-normal-color": "#ccc", // 灰色字
                "btn-normal-bg": "#ffff00", // 黄色底
                // orange 类型
                "btn-orange-color": "#1890ff", // 蓝色字
                "btn-orange-bg": "#52c41a", // 绿色底
                // danger 类型
                "btn-danger-color": "#f74f56", // 红色字
                "btn-danger-bg": "#faad14" // 屎黄色底
              },
              javascriptEnabled: true
            }
          }
        }
    ]
}
```

### 3.1 换肤失败，配置不生效

发现并不生效，为什么呢？我们再看看 antd 的自定义配置说明

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22135d3395524079ae7a9c4134fa7617~tplv-k3u1fbpfcp-watermark.image" width=600  />

我们从代码中去看，其实 antd 是有两套样式，一套是 css ，一套是 less，默认是采用的 css，但用户想要自定义，那么就采用 less，然后通过 less-loader 处理

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b47fb6bc0cec426ca6ed3fa3348100b4~tplv-k3u1fbpfcp-watermark.image" width=300 />

而我们的 sugard，打包出来的 lib 和 es 只有一套 css，并不会有什么用，因为根本无 less 文件可操作

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e3a8e7b71f54b8eac5ba3ec5ababe19~tplv-k3u1fbpfcp-watermark.image" width=230 />

目前先验证是否真的可以自定义话，所以在 sugard，配置 webpack，在打包之前通过 less-loader 处理一波

于是去 sugard 的 webpack 中配置，然后运行，又出问题了

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c63f29436ae84e6c9d1f60bd2a514094~tplv-k3u1fbpfcp-watermark.image" />

再次排查，具体内容可以看这个 issues：https://github.com/ant-design/ant-design/issues/7927

看下来最佳的解决方案是降低 less 版本和 less-loader 版本 ，相关 issues
的评论

- https://github.com/ant-design/ant-motion/issues/44#issuecomment-398957855
- https://github.com/ant-design/ant-motion/issues/44#issuecomment-404395035
- https://github.com/ant-design/ant-motion/issues/44#issuecomment-436499930
- https://github.com/ant-design/ant-motion/issues/44#issuecomment-478448106
- https://github.com/ant-design/ant-motion/issues/44#issuecomment-621974263
- https://github.com/ant-design/ant-motion/issues/44#issuecomment-678760074

暂时降低版本，验证一波，版本选择：**less@2.7.3**， **less-loader@4.1.0**

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1d91dae1d3e0497b91e9cb3d3e6fe400~tplv-k3u1fbpfcp-watermark.image" />

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff8203ef2e844fd2ab017b5b7ca39eb6~tplv-k3u1fbpfcp-watermark.image" />

当我降低版本之后，满怀兴致的跑项目，没想到....还是报错了

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa0881c8d5ad4b438d52e3e204f8a4fc~tplv-k3u1fbpfcp-watermark.image" />

排查发现，原来是配置重复，感兴趣可以看这个 [Error: Didn't get a result from child compiler](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/126)

最佳回复是：[两个 loader 匹配一样的规则，就会出错](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/126#issuecomment-542565698)

当我把问题解决了之后，兴致勃勃的准备换肤，发现又有问题了。配置的 less-loader → lessOptions 居然不生效

通过排查 package.json ，发现一些问题，下面针对这些问题，逐步进行定位：

项目跑的是 npm run pub 和 npm run start

- npm run pub 是编译和打包 dist 与 lib/es
- npm run start 跑的是组件实时预览 demo 例子，其中 demo 组件引用的是打包 lib 目录

**主要是看打包的时候，最后输出的 css 文件数据到底是什么**。以修改 sugar-button-orange 为例

修改前 :

```css
.sugar-button-orange { color : '#fff', background: '#ffab30' }
```

期望的修改后 :

```css
.sugar-button-orange { color: '#1890ff', background: '#52c41a' }
```

### 3.2 webpack.base.js 配置无效

在 webpack.base.js 中配置 less-loader，但是当编译之后，发现好像没被替换。于是看打包，发现 lib-build 和 dist-build 两个打包机制不一样（这就涉及到业务具体代码了...）

总之说一下思路就是: 编译成 es 和 lib 的方式为获取 components 所有组件下的 less 文件，配置 lessOptions，通过 less.render 方式，得到处理后的 result

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff86c43d168147cd8adaf8b127157d2f~tplv-k3u1fbpfcp-watermark.image" />

如上，我们打印 result.css ，可以看到，编译后的 sugar-button-orange 是被替换过的，是我们所期望的。

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ff82a1ecc114ff9b16d4eb8a6478493~tplv-k3u1fbpfcp-watermark.image" width=300 />

得到编译后的 result.css，将组件下的 less 文件 contents 内容替换，同时重写 replace 文件名，这里我定义成 css1，不出意外的话，此时的 es 目录和 lib 目录下，每个组件的 css 文件后缀都应为 .css1

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e03780bf2573480db0fa3fd8b93b500e~tplv-k3u1fbpfcp-watermark.image" width=500 />

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57d63fdc56a24d70a7f1870c1ba8794e~tplv-k3u1fbpfcp-watermark.image" width=250 />

在进入到 index.css1 文件，可以看到，sugar-button-orange 确实是改变了；

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6ad1745407f47269b84109381035b19~tplv-k3u1fbpfcp-watermark.image" width=350 />

OK，这时候我们把 .css1 换成 .css 就可以了，最后打包出来的换肤 css 就大功告成了～

再次打包，前往组件 demo 验证是否能成功换肤

（下面这图是 dist 目录中的 sugard.min.css，实际上对于 es/lib 是通过 gulp 进行打包的，而 dist 是通过 gulp 打包的）

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2781d40e1c14a9db7e8439a01c795fb~tplv-k3u1fbpfcp-watermark.image" />

至此，换肤终于可以实现～ 下面看看默认主题皮肤和自定义之后的主题皮肤

【默认主题皮肤】

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a91ed207082a46d19d84670f4e513a43~tplv-k3u1fbpfcp-watermark.image"  />

【自定义主题皮肤】

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a4e6dcfe3504a87a5e20ff45292071e~tplv-k3u1fbpfcp-watermark.image" />

## 4. 换肤方案坑不少

基于自定义换肤，进行了一轮评审，主要讨论的换肤方案有:

**方案一：多个包仓库（一个主题色就是一个包）**

- 每种主题色就是打成一个包，如 sugard-themeA、sugard-themeB、sugard-themeC
- 优点：开发成本低，视觉给一份皮肤配置，开发只要塞进 lessOptions.modifyVars ，然后打个包就好
- 缺点：仓库量大，不切实际

**方案二：一个包，但是按照主题皮肤分目录**

- 皮肤配置文件下，n 个皮肤文件就打出来多个文件夹目录
  例如 themeA、themeB 两种皮肤，那么打出来的 lib 目录下，就是两个文件夹，每个文件夹下，是该皮肤配色的组件，换言之，Button 组件就有两份
- 优点：只有一个 sugard 独立包
- 缺点：文件夹多，多一套主题皮肤，就多一倍的组件数量文件夹。

**方案三：一个包，对应组件下多几套皮肤 css**

- 与方案二类似，不同的是 lib 下的每个组件，都有 n 套皮肤 css，例如：Button 组件下，有 index.defalut.css、index.themeA.css、index.themeB.css
- 优点
  - 与目前 sugard 打包的方式差不多，更加符合设计规则，同时在业务端，可以自行选择多套皮肤组件，比如我 A 页面的 Button 想用 index.themeA.css，B 页面想用 index.themeB.css ，也是可行的
  - 这样更加灵活，使得 sugard 与皮肤之间关系弱化，并不是说我使用 teacher 主题皮肤，就都是该皮肤主题，不能使用其他皮肤的主题了。
- 缺点：相对其他方案，缺点可忽略

相比之下，选择方案三，如果小伙伴有更好的方案/建议，也可以提出，虚心请教一波～

## 5. 拆分打包文件

【在初期项目技术选型上，采用 gulp 和 webpack 进行编译打包，后续我们会进行复盘然后优化】

由于所有的打包逻辑都放在 gulpfile.js 文件中，目前逻辑比较多，es 模块和 commonJS 模块的编译以及 dist 打包都放在了一起，所以根据文档，打算拆分，根据[文档进行分割](https://www.gulpjs.com.cn/docs/getting-started/javascript-and-gulpfiles/)

下面说一下现在 sugard 的 es/lib 编译流程和 dist 打包流程

es/lib 编译流程：

1. 通过 gulp 打包，首先通过 `gulp.src` 获取我们想要处理的文件流，也就是读取 components/ 所有组件中的 .less 文件，然后把文件流通过 pipe 方法倒入插件中，这里我们用的 through2 插件
2. 通过 [through2](https://github.com/rvagg/through2#readme) 进行处理流，关于 throught2 的部分理解，可看：[npm 里的 through2 这个模块是什么功能](https://www.zhihu.com/question/39391770)、[through2 原理解析](https://segmentfault.com/a/1190000011740894)
3. 通过 through2.obj 对文件流进行处理，内部自行实现 transorm 方法，这里实现了将 less 转成 css ，[源码代码看这里](https://gitlab.gz.cvte.cn/student/common-components/frontend-components/easiclass-common/sugar-design/-/blob/dev-1.1.x/build/gulpfile.js#L30)
4. 通过得到编译转换后的 result.css，将组件下的.less 文件内容替换成 result.css ，并同时将 .less 后缀改为 .css 后缀
5. 再将通过处理后的流，通过 pipe 方法倒入到 gulp.dest() 中，这里就是将处理后的文件流导出到 es/lib 中

```js
// 编译组件为es和commonJS，每次编译前，都将旧的文件删除
function compile(modules) {
  rimraf.sync(modules !== false ? libDir : esDir);
  const lessStreamToCss = gulp
    .src(['../components/**/*.less'], ignoreConfig)
    .pipe(
      through2.obj(function(file, encoding, next) {
        // 只对入口index.less进行编译
        if (file.path.match(/(\/|\\)index\.less$/)) {
          transformLess(file.path)
            .then(css => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
            })
            .catch(e => {
              console.error('[less error]:', e);
              next();
            });
        } else {
          next();
        }
      })
    )
    .pipe(gulp.dest(modules === false ? esDir : libDir));

  const assets = gulp
    .src(['../components/**/*.@(jpg|jpeg|png|svg)'], ignoreConfig)
    .pipe(gulp.dest(modules === false ? esDir : libDir));

  const source = [
    '../components/**/*.tsx',
    '../components/**/*.ts',
    '../typings/**/*.d.ts',
    '../components/**/*.jsx',
    '../components/**/*.js'
  ];
  const tsProject = ts.createProject('../tsconfig.json');
  const tsResult = gulp.src(source, ignoreConfig).pipe(tsProject());
  const tsFilesStream = babelify(tsResult.js, modules);
  const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir));
  return merge2([lessStreamToCss, tsFilesStream, tsd, assets]);
}
```

## 6. 自定义皮肤 json 处理

定义 theme 文件夹，存放所有皮肤配置，现在需要对 esModule、commonJS、unpkg 三种方式进行编译打包

### 6.1 编译成 es 和 commonJS

- 对所有 `components/\*\*/.less` 文件进行编译处理，剔除 style 文件夹下的文件，只对组件的 less，进行皮肤处理。
- 每个组件文件夹下，都生成对应都 [themeName].css 文件（缺点是: 共用样式都打多遍）

<span style="color: #FA5523">✋ 梦想很美好，现实很残酷！！</span>

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/789d80a1ad984ba49695484e92c761d1~tplv-k3u1fbpfcp-watermark.image" />

仔细阅读一下这段代码！！！这是生成主题文件.css ，那么会有什么问题的，就是我们通过 through2 插件对文件流进行多次处理，使得 Write callback called multiple times ！！！

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a779f1f4933c4142acde62a34a5bad0f~tplv-k3u1fbpfcp-watermark.image" />

于是我在 node 官网上看到同一个 issues : [NodeJS streams callback called multiple times](https://github.com/nodejs/help/issues/1997#issuecomment-612321928)，说是 remove the cb() in every loop ，当我把 next 移除之后，又报了问题

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20a88af19ac342a2a3d46d6671d1cfa6~tplv-k3u1fbpfcp-watermark.image" />

再回过头看，我们的逻辑是错误的，正确的流程应该是：**在 gulp 编译打包 es 和 lib 时，对 theme 文件的数量，进行多个任务处理。比如 10 个主题皮肤，就跑 10 个任务，则不是在一个任务中，进行多任务处理。**

将代码流程改写为以下方式即可 :

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4b24166f4fa4839a69c7644a90c647c~tplv-k3u1fbpfcp-watermark.image" />

只需要在 compileTheme 函数中实现生成主题皮肤文件即可～ 最终打包编译出来的 es 和 lib 文件下，组件都带有主题皮肤 css 啦～

## 7. 使用编译后的主题皮肤文件

编译之后，每个业务组件都需要手动引入主题文件，如

```js
import React from 'react';
import { Button } from '@sugard/lib';
// 手动引入需要的主题皮肤css
import '@sugard/lib/button/index.themeA.css'; // 引入主题A的css
// import '@sugard/lib/button/index.themeB.css'; // 引入主题B的css
```

事实证明，是可行的，**但会有个问题，就是每次开发的人，都需要手动 import 需要的主题色**，对于一个应用/系统来说，不会存在多套皮肤，也就是确定了一套皮肤就会在项目中一直使用此皮肤了。

所以在想，如何解决这个问题？

### 7.1 解决业务组件手动引入主题皮肤 css 问题

我们可以默认主题皮肤 css 已经打包好存在于文件夹了。比如 Button 组件，**它存在 index.themeA.css、index.themeB.css 皮肤**，那么我们认为它已经存在了，然后在 Button/index.js 中引入皮肤 css 即可

第一步：我们在 components 文件下，找到 Button 组件，然后在 index.tsx 中添加这段代码

```js
import './index.less';
if (window.THEME === 'themeA') {
  require('./index.themeA.css');
} else if (window.THEME === 'themeB') {
  require('./index.themeB.css');
} else {
  // ...
}
```

意思就是，当我们定义主题是 themeA，那么就会加载 index.themeA.css，但是通过 window.THEME 实在是太粗暴了，通过翻阅文档，知道 `webpack.DefinePlugin` 支持自定义变量。那么我们只需要业务端在运行项目的时候，在自己的 webpack 配置中定义变量就好啦～

在业务端的 webpack 配置:

```js
plugins: [
  new webpack.DefinePlugin({
    THEME: JSON.stringify('themeA')
  })
];
```

然后对打包之后的 es / lib 组件进行添加这段代码

【⚠️ 就是说：我们在打包好组件之后，把主题皮肤文件也打好，然后对打包之后的组件代码中，去添加这段代码（我们默认已经存在这些主题代码了）】

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b21ac887dd7b46c1a96ced52400be662~tplv-k3u1fbpfcp-watermark.image" />

这样就解决了在业务端每次都需要手动 import [themeName.css] 的问题了。

### 7.2 解决编译打包前，都需要往 components 中每个组件都添加判断条件的代码

**虽然我们解决了后期业务端引用时，对主题皮肤的手动引入问题，但是付出的代价就是我们需要改编译打包前的所有 components 组件，都需要手动添加判断条件**

那么有没有什么插件，能够不需要修改我原先代码，但是在编译打包的时候，手动插入我想要的一段代码呢？找来找去....好像并没有现成的插件，至此，我有两种解决方案：

1. 在编译打包之后，gulp.dest() 输出文件流之前，读取文件，然后手动注入
2. 写一个 babel 插件，通过插件 transform 插入想要的代码块

要挑战困难点的，所以想着：写一个 babel 插件，去处理这块～

【现在想想，自己真的作死！！！】

## 8. babel-plugin-submit-code 自定义插件

我们期望：在 babel 转码的三个阶段（分析、转换、生成）中，能够在转换阶段，通过自定义插件，将我们的一段代码插入～

如果想了解 babel 自定义插件，可以网上搜一搜相关文章，感兴趣的可以看看这几篇：

- [babel 插件开发入门指南](https://www.chyingp.com/posts/how-to-write-a-babel-plugin/)

- [深入 babel，这一篇就够了](https://juejin.cn/post/6844903746804137991)

- [babel 官方插件开发文档指南](https://github.com/brigand/babel-plugin-handbook/blob/master/translations/zh-Hans/README.md)

- [babel-plugin-react-chao 源码](https://github.com/SugarTurboS/babel-plugin-react-chaos/blob/master/index.js)

建议可以先细心看看文档、文章，然后再去开发一个 babel 插件...

### 8.1 插入一段源代码，但给我的是字符串

简单做法就是：对于文件中 `import './index.less'` ，在其后面插入同级节点

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/efdf09b4089e45d38384095edc528cc7~tplv-k3u1fbpfcp-watermark.image" />

然后发现....插入的确实是一段字符串代码，可以看到 lib 文件夹下的 Button，代码如下

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c88165f0cea4c65a37f57d1644aecc3~tplv-k3u1fbpfcp-watermark.image" width=550 />

但这不是我想要的，于是我试着在插入的时候，把前面的双引号去掉，直接报错，后面通过**字符串源码替换节点**，才能搞定

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75801c01119d47cf98e0ab39d92a8487~tplv-k3u1fbpfcp-watermark.image" width=550 />

最后我们再看看，打包之后的样式是怎样的？

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9e55e056e66495388d8624e2ca34258~tplv-k3u1fbpfcp-watermark.image" width=420 />

我们插入了一段立即执行函数，可以看到我们的 bundle.js ，在 webpack 编译的时候，会一行一行的执行，然后 require 我们需要的皮肤 css

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/508ae1ce55b2423cb19e71f23d8e9899~tplv-k3u1fbpfcp-watermark.image" width=480 />

### 8.2 对于每个 符合.less 后面的都插入，极其不符

我们只想在 `component/button/index.tsx` 中，对于此文件。进行插入，但是可能 A.tsx 也 `import './index.less'` ，这时候 A 文件也插入了这段代码，但这并不是我们所期望的

**我们只想对于每个组件的入口文件 index.tsx 进行此操作。**

通过看 babel 插件官方文档，打印 path ，发现无从下手，更多的都是对文件内容文本的展示，为了验证，我写了个 demo 组件，然后进行打印

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7986e79122ff490e99370dc7bbb3be0f~tplv-k3u1fbpfcp-watermark.image" width=350 />

这时候我们打印 babel 转换后的 path

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cc3f72eb2e4457ebb4d2726eda64d54~tplv-k3u1fbpfcp-watermark.image" width=500 />

可以在框框中看到，我们插入了 `import './index.less;'` 这行代码

好像真的没什么可操作的，无法得知该文件的路径，个人理解它就像链条一样，有个 parent Node，我们总不能自己拼接拼接得到整条节点链路。

这里留个悬念，有小伙伴有想法如何解决吗？

# 结尾

不知不觉，又是给大家撸了一篇【实践+踩坑】的文章，文章略长，但确实我某段时间内的“成长”，特别感谢你能看到这里，希望这篇文章能对你有一丝丝对帮助。

再说说从中的一些收获和感想吧～

【基建很重要】对于我来讲，我本来觉得开发一个公共的组件很简单，但真的投入去做时，竟无从下手，如何设计？怎么写代码更加优雅？所以才会有我前边的[前端渣渣的我再也不敢说我会写 Button 组件了](https://juejin.cn/post/6844904134047432711)文章，当然也从中去阅读了我认为优秀的 antd 源码，也见识到了原来代码可以这么写！

【保持好奇心】其实我对于 babel 真的是不了解，属于“只知其名，未见其状态的境界，不瞒大家，对于 webpack 我也是简单了解，但是通过这次机会，去把项目中的 webpack 配置、打包方式，以及去了解 babel、写一个 babel 插件，这些都是之前我的知识盲区，虽然现在也还是不太熟悉，但最起码我不再停留于知道 babel 是什么，做了什么工作，而是真的去看它工作机制并且基于文档等去撸了一个简易版的 babel 插件。【纸上得来终觉浅，绝知此事要躬行】

【少逼逼，多思考，多沉淀】还是想得少，对于问题需要静下心去研究去排查，耐住性子去插 issues，去找文章解决方案，但我还是有一点缺点，就是解决问题完了就完了，透过表面去看本质，得更深层次的去研究！

# 相关链接

- [antd 定制主题](https://ant.design/docs/react/customize-theme-cn#%E5%AE%9A%E5%88%B6%E6%96%B9%E5%BC%8F)

- [前端渣渣的我再也不敢说我会写 Button 组件了](https://juejin.cn/post/6844904134047432711)

- [babel 插件开发入门指南](https://www.chyingp.com/posts/how-to-write-a-babel-plugin/)

- [深入 babel，这一篇就够了](https://juejin.cn/post/6844903746804137991)

- [babel 官方插件开发文档指南](https://github.com/brigand/babel-plugin-handbook/blob/master/translations/zh-Hans/README.md)

- [npm 里的 through2 这个模块是什么功能](https://www.zhihu.com/question/39391770)

- [through2 原理解析](https://segmentfault.com/a/1190000011740894)
