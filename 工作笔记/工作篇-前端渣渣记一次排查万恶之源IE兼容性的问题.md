## 前言

🙃 **兼容性 BUG 万恶之源 : IE 浏览器**

昨天晚上，本来舒舒服服的躺在被窝睡觉，睡前一看企业邮箱，哦豁，好家伙，给我报了四个BUG，我再进入一看，映入眼前的是 : `360兼容模式下，在A页面点击按钮无法跳转`、`IE浏览器在B页面点击返回按钮无效果，停留在当前页面`、`C页面弹窗按钮，点击之后，弹窗没关闭，点击无效果`...

什么鬼，玩我呢？这几个 BUG 的最终原因都是IE上无法跳转（小声逼逼，测试说操作步骤不同，我心累了）于是今天早上，再次踏上漫长的 fix bug 之路。

## 代码

咋，还能代码有问题？相信这段代码，大家都会写吧？

```jsx
<Button onClick={this.backEvent} />
```

```js
backEvent = () => {
  // 返回前做些其它的处理
  let cb_function = dosomething();

  const { history } = this.props;
  if (history) {
    history.push(cb_function);
  }
};
```

然后跑项目，找到页面所在的位置，点击返回，果然，gg了

![](https://user-gold-cdn.xitu.io/2020/3/10/170c32039353bc00?w=1083&h=255&f=png&s=55836)

这啥鸡儿玩意，什么叫做`对象不支持此操作`，咋滴，变脸了呢，在 Chrome 下你可不是这样的。

## 排查

既然它说这个对象不支持这个操作，那是指 `history` 对象不支持这个`PUSH`操作？

于是我去把这个玩意，打印了一下

![](https://user-gold-cdn.xitu.io/2020/3/10/170c329b5581ddac?w=1574&h=481&f=png&s=193468)

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c32a13b0f81ae?w=586&h=803&f=png&s=60518" height=550 />

玩尼玛呢，有的啊，这什么骚操作，为啥就报错了？？？

于是我又去项目中，看了一下关于 `this.props.history.push` 的正确使用方式，就是这么写的啊。wc ！

```html
<!-- 项目中其它地方用到的 this.props.history.push -->
<!-- 代码真实跳转路径和文案已被我和谐 -->
<div
  styleName="item"
  onClick={() => {
    this.props.history.push('/juejin');
  }}
>
  跳到掘金
</div>
```

难道是我写这段代码之前没有烧香拜佛的原因？没办法了，只能够，使用必杀技了，**debugger ！！！**

## Debugger

先来 debugger 可以正常跳转的代码。

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c3360c17b8d76?w=754&h=317&f=png&s=30449" width=500 />

这个 push 方法是 `react-router` 注入的，我们可以 debugger 看到，进入了 pushState 中，紧接着我们继续 debugger

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c336b92fb426c?w=821&h=682&f=png&s=192104" width=700 />

再往下，发现进入了 `setState({ action, location })`， 接着推入栈

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c3372914acb46?w=674&h=469&f=png&s=66455" width=500 />

**结果就是 : 成功跳转!!!**

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c33808e47ee64?w=258&h=196&f=jpeg&s=7394" width=200 />

我们再来 debugger 一下`异类`的代码，在 IE 中，一步一步 debugger。在这里创建了一个 location 对象

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c339596601d67?w=955&h=357&f=png&s=127829" width=700 />

紧着着，这里会使用 `createHref(location)` 函数，生成一个 `href` 对象，获取 `key` 和 `state`

目的就是在可以使用 `react-router`注入的 `history` 中，去操作 `pushState` 方法。

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c33a3a9478a62?w=918&h=776&f=png&s=214168" width=700 />

没毛病，但是，到了这里之后，再往下走，就跳到了一个名为 : **useLocation.js** 的文件中

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c33aee22b35a4?w=984&h=460&f=png&s=102421" width=700 />

在这个文件夹中，就报了 对象不支持此操作。就很骚气。 what ????? 这什么鸡儿玩意啊，卧槽

## 猜测

首先怀疑是 `pushState` 的兼容性问题，于是去看了一下兼容性

<img src="https://user-gold-cdn.xitu.io/2020/3/10/170c33c04e6cea8c?w=867&h=339&f=png&s=76824" />

果然自己还是太蠢了，回过头想想，要真是 pushState 兼容性问题的话，那么第一个跳转也不可能成功。

难道是我的问题？还是 react-router 的问题？还是 IE 问题？

## 解决

其实并没有解决，因为我真不知道如何解决了，所以用了降级方法，就是 window.location.href 原生方法。

> react-router 对于不可使用 canUseHistory 时，也是采用的 window.location.href

```js
// 部分代码无偿奉献
function push(path, state) {
  var action = 'PUSH';
  // 得到一个 location 对象
  var location = createLocation(path, state, createKey(), history.location);

  transitionManager.confirmTransitionTo(
    location,
    action,
    getUserConfirmation,
    function(ok) {
      if (!ok) return;
      // 创建一个 href 对象
      var href = createHref(location);
      var key = location.key,
        state = location.state;

      if (canUseHistory) {
        // 第二个不可跳转的，就死在了这里，我也不知道为什么
        globalHistory.pushState({
            key: key,
            state: state
        }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          // 第一个可以跳转的就进入到了这里
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex + 1);
          nextKeys.push(location.key);
          allKeys = nextKeys;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        // 原生跳转
        window.location.href = href;
      }
    }
  );
}
```

## 再次出现问题

在我使用 `window.location.href` 解决了上述的问题之后，我以为此事到此结束，但是!!!又出问题了，什么问题呢？测试报了一个现象 : 

> 首先进入项目主页面，此时的 breadcrumb 面包屑都可以跳转（使用的history.push），之后进入到 A 页面，在 A 页面中点击 `返回` 按钮（此时的返回通过 window.location.href）实现了。成功返回之后，再次点击 breadcrumb ，无响应，不跳转了。

我懵逼了，这是什么鬼玩意啊，总不能将整个项目的跳转方式都换成 `window.location.href` 吧，于是，再次去排查

## Event

我们看到，它报了一个 `Event` 错误

```js
const event = new Event()
```

![](https://user-gold-cdn.xitu.io/2020/3/20/170f621f130a4b95?w=1129&h=434&f=png&s=61876)

OK，你牛逼 👍，除了牛逼没啥说的，那咋办，在汉鑫哥的帮助下，一起排查，定位到了 `useLocation` 文件上，前边好好的可跳转，都没这个文件的啥事，咋这里就有这个玩意了呢？这个文件是哪来的？

再一看，原来这个文件是在 `react-use` 里边的，刚好在 A组件中，使用到了这个库，去 `node_modules` 中找这个文件，看到这段代码

<img src="https://user-gold-cdn.xitu.io/2020/3/20/170f625e0601d5fd?w=892&h=535&f=png&s=69580" width=500 />

没毛病啊，这是啥情况，再次进行 Debugger，发现，只要没引入这个 A组件，那么在 IE 上，都可以正常跳转，在引入了这个 A组件（也就是用了这个库），就出问题了。

为了验证这个问题，把项目中用到 `react-use` 的都注释掉（幸好就一个组件用到了这个库），重启，打开IE，怀着激动的心情，去试了一下，卧槽！！！！居然可以了！！！！！

问题应该是，原本应该pushState的，在引入这个组件（加载这个库）了之后，就都被hack掉了，之后的跳转，都通过 Event，而 Event 在IE上又不兼容，所以凉了。（个人猜测）

## 最后

千呼万唤始出来，我尿了，IE真的是太难过，每次做个东西，都要兼容IE、Edge，我内心是崩溃的，不过感谢IE，让我更加有耐心了，比哄女朋友还更加有耐心，感恩有你 （微笑.jpg）