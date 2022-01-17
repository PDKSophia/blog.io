> 📢 我除了菜，啥都不是

前段时间，组里决定做一个跨项目、跨业务的 UI 组件库，原因是我们部门的产品越来越多，且每个产品设计到多端（如 Web/Mobile/PC/Android 等）而为了快速响应目标，决定做一套统一且可视化的，拥有部门特色的 UI 组件库。

视觉已经给出了所有组件样式、交互效果，而我们前端组内部也经过一轮轮的评审和讨论，最终每个人都分了几个组件进行开发。而我呢，也分到了几个组件，有稍微简单点的，有存在复杂交互及状态的，这篇文章，主要是记录自己**第一次**开发一个公共组件的思考~

> 我负责的组件是 : Skeleton 骨架占位组件 、Card 卡片组件、Button 按钮组件、栅格组件

## 前期准备工作

这属于第一次开发公共组件，之前呢主要都还是在项目里边，抽离一些简单复用逻辑的业务组件，举个例子，对于 `Button` 组件，与我来说，我之前更多可能考虑的就只是一些常用的状态，比如说之前的`Button`组件代码是这样的 :

```jsx
/**
 * @class Button
 * @extends {React.Component}
 * @property {string} text - 按钮文本
 * @property {string} size - 按钮大小，small/middle/big
 * @property {string} icon - 按钮携带的icon，不需要则为空
 * @property {string} color - 类型，可选值为 orange/ghost/white
 * @property {object} style - 样式
 * @property {string} textSize - 按钮文案文字大小，small/middle/big/super
 * @property {boolean} disabled - 可否点击
 * @property {string} iconSeat - 按钮icon的位置，left/right
 * @property {function} onHandleClick - 点击事件
 * @property {boolean} isLock - 是否锁定点击（注：如果需要使用锁，请保证所有操作为同步或者所有的异步行为执行完再return）
 */
```

这是我结合业务内容，抽离的`Button`组件，有一丝丝公共组件的样子，但是其实还是远远不够的。于是，此次在开发公共组件之前，我特意的去做了充足的准备。

### 组件化开发

什么是组件化？这个问题相信大部分前端工程师都知道~ 在跟我小学弟学妹们装 X 的时候，他们问我，什么是组件，我笑而不语，甩出了`www.baidu.com`网址，告诉他们，自己查...

> 组件化是指解耦复杂系统时将多个功能模块拆分、重组的过程，有多种属性、状态反映其内部特性。

简单来说，我们可以把页面当作是变形金刚，由各不同零件组件，比如说 `Header零件`、`Hand零件`、`Footer零件`等...

然后呢，在我们想要制造一个变形金刚时，直接就用这些零件，就能快速 do 出一个产品了~

### 设计原则

相信大家也不想听我逼逼，直接进入主题，我想要设计一个大家都能普遍使用的组件，我该如何去设计，我上网搜了许多相关的文章，例如 :

<img src="https://user-gold-cdn.xitu.io/2020/3/26/1711591ecd809e16?w=653&h=557&f=png&s=56591" width=400 />

在我看了一些文章之后，整理了一些其它人对组件设计的看法（底部会贴出友情链接），首先，我们得拥有一套组件化设计思维，要它有啥用？它能帮我们高效开发啊~

#### 官方文档

这个文档必须详细，不然别人咋看，同时每一个组件，都应尽可能的表达，该组件的由来、使用场景、如何设计、API、传参等

> 👉 感兴趣的可以去看看 ant design 的文档，它除了使用文档，在 github 上还有每个组件的说明文档

#### 代码阅览

应该提供一个可以让开发者实时调试代码的地方，使其他这些组件的使用者可以更好地理解各个 props，相信比较流行热门的 UI 库，都有这种骚操作~

#### 使用实例

提供一些如何将其数据导入 UI 的实例代码，使其他开发者可以更快上手与他们的使用情况。

### 如何设计

1. 标准性
2. 独立性
3. 复用与易用
4. 无环依赖原则(ADP)
5. 入口处检查参数的有效性，出口处检查返回的正确性
6. 稳定抽象原则(SAP)
7. ......

上边`如何设计`我坦白，是从 👉[聊聊组件设计](https://juejin.im/post/5d566e82f265da03f77e653c) 写过来的，懒得写了~(尊重作者，尊重原创，大家直接去看他的文章哈~)

## 着手开发

我们组里的组件库，是基于 `Ant Design` 进行开发，嗯，我一开始以为是项目中已经 `npm install antd` 了，谁知道当我去看 `package.json` 时，发现并没得，于是我去问了一下负责这个组件库的 C 同学，原来...是要我们去看 Ant Design 的代码， 然后借鉴一波，去除国际化、还有一些不同的差异项，再加入自己部门特色的交互、样式~

奥力给，这啥啊，什么玩意啊，就直接去看源码了 ？？？

<img src="https://user-gold-cdn.xitu.io/2020/3/26/17115a51e144c850?w=182&h=182&f=jpeg&s=5824" width=200 />

于是，我从我负责的组件里边，挑选了一个最简单的 `Card 组件`，进行研究了一波，wc，不看不知道，一看吓一跳...原来我还是太菜了...

<img src="https://user-gold-cdn.xitu.io/2020/3/26/17115a77b191396f?w=310&h=186&f=png&s=4684" width=300 />

这个卡片组件，如果没看源码之前，我估计就是这样 :

```jsx
/**
 * @class Card
 * @extends {React.Component}
 * @property {string} title - 标题
 * @property {string} content - 内容
 * @property {string} size - 卡片大小
 * @property {string} extra - 右上角extra
 * @property {object} style - 样式
 * @property {function} onClick - 点击事件
 */
```

沿着这个思路，一路走下去，发现，如果传 `content` 肯定不对啊，为啥，如果用户想改这个文案内容的样式呢，简单，给他开放一个 `contentStyle`就好了嘛~

那如果用户想换行，又该咋办，简单，这个 `content<String>` 就改成 `content<Array>` 嘛，判断 `typeof content`，如果是数组就遍历渲染文案~

那如果用户传`ReactNode`类型的呢，比如这样

```jsx
const loadingNode = (
  <div>loading</div>
)

<Card content={loadingNode} />
```

再或者，用户想这样~

```jsx
const loadingNode = `<p className="loading">我是loading</p>`;

<Card content={loadingNode} />;
```

用户真实想要的是，你通过 `dangerouslySetInnerHTML` 进行转义，而不是你直接显示这个 content。

算了不想了，直接去看源码吧 ~

## 看源码的痛

初次一看，啥啊，这个 `config-provider` 是个啥玩意？这个 `SizeContext` 又是个啥，这个 less 文件咋都是用的 `@xxx`啊，怎么一个文件引入的这么多变量，都是外部的。

> 当我去看了 [React 实战：设计模式和最佳实践](https://juejin.im/book/5ba42844f265da0a8a6aa5e9) 这本小册之后，我知道了，这 `config-provider`、`ConfigConsumer` 是个啥玩意。，然后再看完一个完整组件之后，才发现，Ant Design 🐂 B ！！！

**以我自己开发的 `Card` 组件来举例~** ， 我们先来共识一下，这个组件的一些样式

### 属性

| 参数         | 说明                                                | 类型              | 默认值                   |
| ------------ | --------------------------------------------------- | ----------------- | ------------------------ |
| size         | 卡片大小                                            | string            | middle                   |
| style        | 卡片样式                                            | object            | -                        |
| loading      | 当卡片内容还在加载中时，可以用 loading 展示一个占位 | boolean           | true                     |
| isShadow     | 卡片是否存在阴影                                    | boolean           | true                     |
| title        | 卡片标题                                            | string\|ReactNode | -                        |
| headStyle    | 自定义标题区域样式                                  | object            | -                        |
| headWrapName | 自定义标题区域 className                            | string            | `${prefixCls}`-card-head |
| extra        | 卡片右上角的操作区域                                | string\|ReactNode | -                        |
| onClick      | 卡片点击事                                          | () => void        | -                        |

然后呢，我们通过引入 `import { ConfigConsumer, ConfigConsumerProps } from '../config-provider'` 进行处理，**别问，问就是还没咋搞懂，总之就是高阶组件的疯狂操作，感兴趣的可以去看看，这个玩意真的有点意思** 👉 [config-provider](https://github.com/ant-design/ant-design/tree/master/components/config-provider)

我们接着对一些 props 进行处理 ~

```jsx
// 获取前缀，比如像ant-design一样，所有的class都是以 antd- 开头
const prefixCls = getPrefixCls('card', customizePrefixCls);

// 定义头部
let head: React.ReactNode;

// 定义加载时的状态
let loadingBlock: React.ReactNode;

if (title || extra) {
  head = (
    <div
      style={headStyle}
      className={`${prefixCls}-head ${headWrapName && headWrapName}`}
    >
      <div className={`${prefixCls}-head-wrapper`}>
        {title && <div className={`${prefixCls}-head-title`}>{title}</div>}
        {extra && <div className={`${prefixCls}-extra`}>{extra}</div>}
      </div>
    </div>
  );
}

const body = (
  <div className={`${prefixCls}-body`}>{loading ? loadingBlock : children}</div>
);
```

在我们导出之前，我们通过`SizeContext`高阶组件进行包装~

```jsx
<SizeContext.Consumer>
  {(size) => {
    // 如果你有自定义的size，以你的为准，没有则以SizeContext中默认的size
    const mergedSize = customizeSize || size;

    // 处理所有的className
    const classString = classNames(prefixCls, className, {
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-shadow`]: isShadow,
      [`${prefixCls}-${mergedSize}`]: mergedSize,
    });

    return (
      <div className={classString} style={style} onClick={onClick && onClick}>
        {head}
        {body}
      </div>
    );
  }}
</SizeContext.Consumer>
```

对于样式，不是直接在 `less` 文件写一些 color 或者 font-size 的，对于`ant-design`来说，他们有一个 style 文件，里边存放着许多定义好的变量，甚至于 theme 文件，可以说，到时候如果想自定义主题，只需要讲其中的 theme 文件 copy 一份，然后进行修改，就能直接完成自定义主题的需求了~

怎么说呢，其实抽离了一些复杂的需求出去之后，相对的这个 Card 组件就简单了很多，我们再多去看看几个组件，会发现，真香，原来组件还可以这么设计，相对自己之前设计的那些 low B 组件，这个组件看起来就高大上太多了。🙃

## 后续

回过头来看，这篇文章有点像随手写的笔记，没得啥干货，不过**主要的目的还是想传递给大家一个思想：就是有时间，可以考虑去看看一些优秀组件的源码** ~ 奥力给 ！

**📢 更新一下，这是后记，[前端渣渣的我再也不敢说我会写 Button 组件了](https://juejin.im/post/5e8d4300f265da47f85de3db)**，这是我开发 Button 组件遇到的问题和思考，希望对你们有点用~

## 目前进度

组内目前的一个进度也在有序进行中，毕竟大家都一致认同这个项目，且 v1 版本相对较为宽松，先出基础版，再深挖细节和优化 ~

<img src="https://user-gold-cdn.xitu.io/2020/3/26/17115c6857547c20?w=613&h=815&f=png&s=55484" width=500 />

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c34312e0b386?w=726&h=530&f=png&s=39894" width=650 />

# 相关链接

- [聊聊组件设计](https://juejin.im/post/5d566e82f265da03f77e653c)
- [知乎-前端 UI 组件化的一些思考](https://zhuanlan.zhihu.com/p/25820838)
- [（译）React 组件设计模式基础](https://juejin.im/post/5a73d6435188257a6a789d0d)
