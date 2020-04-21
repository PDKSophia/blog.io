## 前言

> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io/blob/master/%E5%B7%A5%E4%BD%9C%E7%AC%94%E8%AE%B0/React%E7%AF%87-%E5%89%8D%E7%AB%AF%E6%B8%A3%E6%B8%A3%E5%AF%B9%E6%89%8B%E6%8A%8A%E6%89%8B%E5%BC%80%E5%8F%91%E5%85%AC%E5%85%B1%E7%BB%84%E4%BB%B6%E7%9A%84%E6%80%9D%E8%80%83%E5%92%8C%E8%AE%BE%E8%AE%A1.md)

前段时间发了一篇[《前端渣渣开发 UI 公共组件的新认识》](https://juejin.im/post/5e7c23d2f265da42b71a03cf)随笔，之后将 antd 一些组件的源码看了一下，特别是 `Button` 组件的源码，我真的是跪了，`what the f**k`，原来还能这么设计，`less` 居然还能这么用。这不，参考`Antd Button`源码，结合视觉交互，经过三次的设计评审，终于在今天，把 `Button` 组件撸出来了。下边记录一下自己的设计和开发思路~

> **👌 希望大家能耐得住性子去看，因为这个 Button 组件有太多种情况了，包括在设计、开发中遇到的一些坑，当然我这个设计不一定是好的，所以也希望，大家看完之后可以给点建议，谢谢大家喏~**

### 看完文章你会收获什么？

我也不知道你能收获什么，这篇文章主要是记录我在开发一个公共组件的一些思考设计和遇到的坑，如果你也是跟我一样，想知如何写一个公共组件，或者是开发一个公共组件该做些什么准备，那么这篇文章可能会让你有一丝丝的启发~

## 效果

担心大家一直听我逼逼，给大家一种纸上谈兵的错觉，我就先上效果图。最终的实现 👇

> 💨 ButtonIcon 和 ButtonText 未来得及开发，这两个组件问题不大

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c34312e0b386?w=726&h=530&f=png&s=39894" width=650 />

## 设计思想

在谈具体设计和开发之前，请允许我说几句话，个人想法: **前期的设计及评审很重要，不要盲目就下手去撸代码，也不要闭门造车，自己一个人搞，一定要在开发之前，将你能考虑到的所有情况和规则罗列出来，进行评审**，组内成员提出建议并且进行查缺补漏（因为使用者就是你身边的小伙伴，相信他们会给你提很多“无理”的要求）

### 组件设计

下边是我根据视觉小姐姐给的视觉稿，结合交互，最终将 Button 组件分为 👇

#### 使用场景

按照使用场景，Button 组件可分为 :

- 普通按钮
- 图标按钮
- 文本按钮
- 组合按钮
- 幽灵按钮
- 反白按钮

#### 按类型

按类型划分，Button 组件可分为 :

- 主按钮
- 次按钮

#### 按大小

按大小划分，Button 组件可分为 :

- 小按钮
- 标准按钮
- 大按钮
- 拇指按钮

#### 按主题色

按主题色划分，Button 组件可分为 :

- 主题按钮
- 警示按钮
- 危险按钮

上边是我所能想到的所有按钮划分，划分完了之后，我们得进一步确认一些属性，**<span style="color: #FA5523">这里想跟大家探讨一下两个重要的玩意： type & ghost </span>**

这里有小伙伴要懵逼了，这个属性不是很简单吗，为什么要单独拿这个属性出来讨论呢？来来来，我们讨论一下 ~

且不说组内视觉给的，我们来看看业内一些优秀 UI 库，他们对 `Button type` 的定义

**Ant Design**

对于 type 的定义，仅支持主按钮、次按钮、虚线按钮和链接按钮。

<img src="https://user-gold-cdn.xitu.io/2020/4/20/171977711b713e35?w=678&h=249&f=png&s=12953" width=500 />

在我的认知中，对于按钮的颜色说明，是这样的 👇

- 蓝色，主色调，表按钮是用来说明意义。
- 绿色，成功色调，表按钮是成功
- 橙色，警示色调，表按钮是警告、提示
- 红色，错误色调，表按钮是错误、危险

所以对于 `Antd` 有一点我是比较疑惑，如果用我的这种认知去看它的`Button组件`，当设置 `type=primary` 时是蓝色，那么，自然而然的，我想要危险红色，是不是设置 `type=danger` 就对了呢？

> ✋ 不好意思，你想太多了

`Antd`单独提供了一个`danger`属性，用于设置该按钮为危险按钮。也就是说，这样才是对的 👇

```tsx
<Button type="primary" /> // 蓝色
<Button type="primary" danger />  // 红色
```

**iView**

我们再来看一下 `iView` 对于 `Button type`的一个定义。

<img src="https://user-gold-cdn.xitu.io/2020/4/20/171978329e96cddc?w=664&h=281&f=png&s=18508" width=550 />

咦，我们可以发现，好像它对 `type` 的定义更加符合我们的认知

```tsx
<Button type="primary" /> // 蓝色
<Button type="info" />  // 淡蓝色
<Button type="success" />  // 绿色
<Button type="warning" />  // 橙色
<Button type="danger" />  // 红色
```

**Element UI**

我们再看一下 `element UI` 是如何定义的，跟 `iView` 差不多类似，也是符合我们认知的。

<img src="https://user-gold-cdn.xitu.io/2020/4/20/171978a5864d50b7?w=862&h=152&f=png&s=13490" width=550 />

那么问题来了，我这个`Button`是否跟`iView、Element UI`一样，集成到 type，还是类似与`Ant Design`一样，给个单独的属性？基于这个问题，在第一次评审，跟组里的小伙伴经过探讨，最终决定，单独给定一个属性叫做 `color` ，由这个属性决定按钮的主题色。而 `type` 仍表示它的一个“类型”

再来讨论一个叫做`ghost`的玩意，初始的时候，我是将其定义为一种“类型”，但是后来，我发现，这个 `ghost` 它也是受主题色的影响，比如你红色时，幽灵按钮的文本颜色是红色，你绿色的时候，幽灵按钮的文本颜色是绿色，
比如这个样子 👇

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719bedf4fe445a9?w=485&h=58&f=png&s=5416" width=350 />

> ❗ 这里你可能要问了，不是有一个叫做 color 字段，用于修改主题色吗？

是的，但是有个问题我们要思考，什么是类型？举个 🌰，我们常问，“你喜欢什么类型的电影”，你可以说`惊悚`、`动作`、`速度`等类型的电影，但你说，我喜欢**好看**的电影，我们认真想一下，**“好看”**，它属于类型吗？不属于类型，“好看”是这部电影的一个“属性”。

当我们把这些属性定义好了之后，下边就没有我们担心的了。我们来思考一下，如何去开发这个组件~

### 设计方案

![](https://user-gold-cdn.xitu.io/2020/4/20/171979f9185fce08?w=522&h=201&f=png&s=10658)

按照使用场景，最终我们可以定义出，如 `Button`、`ButtonIcon`、`ButtonText`，再进一步的分析，会发现，这三种（甚至多种）类型的按钮，都会存在一些公共的状态属性，如 `size`、`style`、`onClick`、`className` 等，那么我们可以通过什么方式去实现呢？

> ✋ 本来想使用继承方式进行设计，但在 React 官网中，[组合 VS 继承](https://zh-hans.reactjs.org/docs/composition-vs-inheritance.html)中，可看到，React 推荐使用组合而非继承来实现组件间的代码重用。React 推崇 HOC 和组合的方式，React 希望组件是按照最小可用的思想来进行封装，在 OOP 原则中，这叫单一职责原则。换句话说，React 希望一个组件只专注于一件事。

在这里使用继承是比较怪异的，比如你的代码写成这样 👇

```js
// 基类
class BaseButton extends React.Component {}

// 继承
class Button extends BaseButton {}
class ButtonIcon extends BaseButton {}
class ButtonText extends BaseButton {}
```

总感觉这里的继承是强行使用的，我们换成高阶组件的方式，会不会好一些？

```js
// 高阶组件
const BaseButtonHoc = WrapperComponent => {
    return class extends React.Component{
        return (
          <React.Fragment>
            <WrapperComponent {...this.props} />
          </React.Fragment>
        )
    }
}
export default BaseButtonHoc;
```

```js
// 使用
export default BaseButtonHoc(Button);
export default BaseButtonHoc(ButtonIcon);
export default BaseButtonHoc(ButtonText);
```

嗯，看起来高阶组件方式更加使用，就用它吧 ~

> ⚠ 注意，ButtonGroup 只是一个包裹着 Button 的容器，这里不是 `BaseButtonHoc` 衍生出来的类型。

### 开发遇到的问题

#### 1. Button 样式优先级的定义

为什么一开始我说要必须罗列好所有规则，因为中间只要有不符的，那么不好意思，你可能需要重写样式。

拿 `ButtonHOC` 高阶组件来说，一开始我的设计就存在问题了，我们来看代码（我知道你们很不想看一坨代码，我尽量减少）

在看之前，我们先来达成共识，`Button` 组件所接受的属性有：👉

| 参数      | 说明                           |
| --------- | ------------------------------ |
| size      | 按钮大小                       |
| type      | 设置按钮类型                   |
| color     | 按钮颜色，搭配 type 共同使用   |
| ghost     | 幽灵属性，使按钮背景透明       |
| antiWhite | 反白属性，适用于深色背景       |
| block     | 将按钮宽度调整为其父宽度的选项 |
| disabled  | 按钮失效状态                   |
| style     | 配置按钮的样式                 |
| onClick   | 点击按钮时的回调               |

然后我就写下了这样的一段代码。

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719bf6c11e52016?w=901&h=393&f=png&s=77163" width=650 />

这里有人会问了，`disabled`为什么出现这么多？这就是我想吐槽的地方，因为视觉和交互方面就要这样，换句话说 :

> 正常情况下，color 不同，disabled 之后对应的 hover、active、focus 不同。

> 幽灵情况下，color 不同，disabled 之后对应的 hover、active、focus 也会不同。

> 反白情况下，color 不同，disabled 之后对应的 hover、active、focus 也会不同。

而且最让人恶心的是，`ghost`、`antiWhite`、`color` 这三种，可随意搭配， 也就有 8 种可能，对不起，我尿了。

**这就是我一开始没定义好样式优先级的锅，自己给自己埋坑**，于是代码自然而然的，哎，不提也罢。

在确认了优先级规则之后 : props style > disabled > ghost > antiWhite > color

将代码改成了这样，果然，管他什么属性、类型，一切按我的规则来！

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719bffe6162c2fc?w=978&h=390&f=png&s=86727" width=650 />

自然而然的，less 代码就相对好写了许多。

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c017d52e24db?w=452&h=417&f=png&s=37078" width=250 />
<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c02674003783?w=531&h=522&f=png&s=51703" width=250 />
<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c0351d7cc3b2?w=521&h=626&f=png&s=53130" width=250 />
<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c0434128c469?w=568&h=388&f=png&s=35258" width=270 />

#### 2. ButtonGroup 的坑

前边也说了，ButtonGroup 只是一个包裹着 Button 的容器，它不是 `BaseButtonHoc` 衍生出来的类型。是不是你就觉得，害，这不就用一个`div`包裹按钮组件而已嘛，这有啥好纠结的，嘿，我当时也是这么认为的，知道我真的去做了之后，才发现，这他娘玩屁啊。

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c120f6491a4e?w=549&h=130&f=png&s=10435" />

当时我第一眼，没错了，按照代码来说，确实应该是这样，但这不是我想要的啊...

为什么会出现这种情况，大家想一下其实也知道，因为`Button`本身默认带有圆角，我只是在外部加了一个`div`，所以自然就是这样咯，相比说到这里，已经有小伙伴知道如何处理了，没错，就是你想的那样，我的解决方法就是 :
**ButtonGroup 下把 Button 的边框和圆角强制去掉**

```less
// 组合按钮
.@{button-group-prefix-cls} {
  // 组合下的Button边框都去掉
  .@{button-prefix-cls} {
    border: none;
    border-radius: 0;
  }
}
```

这段代码，不会再出现上边说的`实际`情况了。但随之而来的，又是一个新问题，那就是，我真的想设置圆角怎么办？
咦，不错，你跟我想的一样，**我们把它重置了，现在再给它加回来**。

```less
.@{button-group-prefix-cls} {
  // 重新设置边框及圆角
  &-circle {
    .@{button-prefix-cls} {
      &:first-child {
        border-top-left-radius: @btn-border-radius;
        border-bottom-left-radius: @btn-border-radius;
      }
      &:last-child {
        border-top-right-radius: @btn-border-radius;
        border-bottom-right-radius: @btn-border-radius;
      }
    }
  }
}
```

稳妥，想一想，还有问题嘛？嘿，你还别说，还有一个大问题，那就是，我传入的 Button 有大有小咋搞！

```tsx
<ButtonGroup>
  <Button size="small">小按钮</Button>
  <Button size="large">大按钮</Button>
</ButtonGroup>
```

<img src="https://user-gold-cdn.xitu.io/2020/4/21/1719c1c2af8007b3?w=455&h=156&f=png&s=7208" width=350 />

何解？我当时萌生的第一个想法，那就是 : 取得子组件中最大尺寸 size，然后重写各`Button`组件的 `props size`，比如上边的 demo 中，我找到最大尺寸是 large，那么我重写每个 Button 的 size 都改为 large，但是，被现实狠狠打了一巴掌，因为我们在 `ButtonGroup` 里边是一个 `children` 玩意。

```js
class ButtonGroup extends React.PureComponent<AbstrunctButtonGroupProps> {
  renderButtonGroup = ({ getPrefixCls }: ConfigConsumerProps) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      ..., // 不展开写了
      children
    } = this.props;

    const prefixCls = getPrefixCls('button-group', customizePrefixCls);
    const classes = classNames(prefixCls, className, ...不展开写了);

   // 渲染子children
    return (
      <div style={style} className={classes}>
        {children}
      </div>
    );
  };

  render() {
    return <ConfigConsumer>{this.renderButtonGroup}</ConfigConsumer>;
  }
}
```

最后决定，**给 ButtonGroup 一个 size 属性，由这个属性决定组合按钮的样式**，换言之，我不管你`Button`给什么尺寸，以我为准，下面这段代码最终显示的样式，是小尺寸的样式

```tsx
<ButtonGroup size="small">
  <Button size="large">取消</Button>
  <Button size="middle">提示</Button>
  <Button size="thumb">危险</Button>
</ButtonGroup>
```

怎么做到的？老规矩，重写样式咯~

```less
.@{button-group-prefix-cls} {
  // 解决组件大小组合使得高度、宽度不一致问题
  &-small {
    .@{button-prefix-cls} {
      min-width: @button-sm-width;
      height: @button-sm-height;
      line-height: @button-sm-height;
      font-size: @button-sm-font-size;
    }
  }
}
```

### ButtonIcon 的支持

正常来说，我们图标组件，只需要这样就可以解决 👇

```tsx
<Button>
  <Icon />
  图标按钮
</Button>
```

但我为什么还要加一个 `ButtonIcon`，因为视觉和交互有个骚操作，那就是 : Icon 会变色，包括它的状态会跟你当前按钮有强关联的关系。所以这边只能基于 `ButtonHoc` 衍生出此类型按钮~

```tsx
<ButtonIcon icon={} color="danger">
  带有图标的危险按钮
</ButtonIcon>
```

## 其它

对于整个 `Button` 组件的代码，我放在了这里 : [Button 源码](https://github.com/PDKSophia/DesignPatternsToJS/blob/master/component/button/Design.md)，因为文章不想贴太多代码，有想法的可以移步哈~ 当然，我更加希望的是你能去看源码，因为你看完之后，你就觉得我写的是渣了~ 我只是借鉴参考其中的一些设计思想，低成本的开发了一个公共组件~

## 总结

谢谢你看到这里，最近也是开发了一些公共组件，说一下自己感想吧，我之前一直想自己做一个组件库，造个轮子，对于写 UI 组件库来讲，最简单就是写一个`Button`组件了，那是“年少轻狂”，感觉 Button 组件这么简单，是最好写的组件了，但现在回过头来看，**越简单的东西，越难!!!**

在此之前，自己属于使用者，创项目时，总会 `npm install UI库`，基于该库，简单的二次封装，但从未去看过它内部的实现原理，直到这次，“迫不得已”去看的源码，看了之后，才发现，人与人之间真的有差距。

**开源即责任**，如果你做的东西，想被更多人使用，那就意味着，你得承担更多！每个人都有一个开源梦，我之前也造过轮子，这个 [vue-erek-manage](https://github.com/PDKSophia/vue-erek-manage) 是我之前借鉴 `Ant Design Pro` 造的，我天真以为做完这个东西，功能实现了，就能给大家用了，But，我自己用了之后，分分钟想捶死自己，以当时我的能力，我的设计缺陷，我的代码风格，我的技术水平，导致我在使用过程需要不断的去改框架里的代码。

好像扯远了，好了，不跟你们唠叨这么多了，你们这些有技术的人，讲话都不负责任的，我们这些菜鸡讲话是要负责任的，明早还要起来干活呢~（引用一个抖音段子来结尾，逃...）

## 相关连接

- [阿宽的博客](https://github.com/PDKSophia/blog.io)

- [阿宽的书单](https://github.com/PDKSophia/read-booklist)
