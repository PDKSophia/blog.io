## 前言

> 📢 博客首发 : [阿宽的博客](https://github.com/PDKSophia/blog.io)

> 🍉 授权转载团队博客 : [SugarTurboS Blog](https://github.com/SugarTurboS/Blogs)

在上篇[【KT】查缺补漏 React 状态管理探索](https://juejin.im/post/5edf6b63518825365d47ed73)发出之后，留下了一个问题，那就是 hox 真的很香吗 ? 香不香我不知道，下边是我使用 `hox` 之后的一些感想...

不得不说，实在是太难顶了，最后改了一下源码，实现了一个低配版的 model tree ...

<span style="color: #FA5523">以下内容是阿宽的个人感受，仅代表个人观点，如有错误，还望指出 🤝 ～</span>

## 正文开始

网上搜了一下 `Hox` 文章，相对较少，并且大部分是介绍型的文章（就是告诉你这是什么库，怎么用），经过在项目中，落地实践了一个模块之后，也算是有所小收获，下边是我的一些感受...

### 如何划分颗粒度

_想跟大家探讨如何“划分颗粒度”的问题_，怎么理解呢？比如我们现在有个 reducer，里边有近 40 个字段，这应该很常见吧，对于一个复杂模块，存在一个 reducer 拥有三四十个字段，是个再正常不过的事情了~

问题在于我们如何定义“细”这个纬度，这个问题跟 hox 是没关系的，它只是能将你的 hooks 变成持久化，全局共享的数据，我们讨论的是 : 该写一个 model hooks 还是写 n 个 model hooks ?

这个问题在我重构实践的时候，也一直在困扰我，最后还是决定，分三种情况，如下 :

- 一个字段就是一个 model 文件
- 一个 useXXXModel 里边允许定义多个字段
- 一个 model 文件，允许存在 n (n<5)个 useXXXModel

下边展开说说我为什么这么设置 :

1. 一个字段就是一个 model 文件

其实我不太赞同这样的颗粒度划分，为什么呢? 划分的太细了，你想啊，如果一个小模块，有 10 个字段，那你就对应有 10 个文件，really ? 那为什么我还要说这种情况呢？因为如果你这个字段比较独立，与其他字段毫无关联，同时比较复杂，可能你会在你的 model 里边做一些副作用操作，那么写成这样，可能相对比较好 ?

> 哪有好与不好，最终看你自己如何定义，按照你自己喜欢的写就好了

但是这种情况，就会导致你代码量有点大，举个例子，你这个组件 index.js 需要这 10 个数据，那么代码就会是这样的

```js
import useClassModel from '@src/model/user/useClassModel'
import useSubjectModel from '@src/model/user/useSubjectModel'
import useChapterModel from '@src/model/user/useChapterModel'
// 此处还需import 7个文件 ...

function User() {
  const { classId, changeClassId } = useClassModel()
  const { subjectName, changeSubjectName } = useSubjectModel()
  const { chapterName, changeChapterName } = useChapterModel()
  // 此处还有代码...
}
```

然后你修改时候，逻辑代码可能就是这样

```js
function changeSelectClass (class) {
    changeClassId(class.id); // 修改班级id
    changeClassName(class.clsname); // 修改班级名
    changeSubjectName(class[0].subjects[0].subjectName) // 修改班级，默认切换此班级下的第一个学科
    changeSubjectCode(class[0].subjects[0].subjectCode)
    changeChapterName(class[0].subjects[0].subjectCode.chapter[0].chapterName) // 默认选中此学科下的第一个章节
    changeChapterCode(class[0].subjects[0].subjectCode.chapter[0].chapterCode)
}
```

想表达的就是，这种方式，你的代码量会上来，不过问题不大，个人认为这种代码阅读性还可以

2. 一个 useXXXModel 里边允许定义多个字段

这种情况我建议是“强关联”的时候这么写，什么是强关联？ 比如 classId 和 className，subjectCode 和 subjectName 这种，就是一个改变，另一个肯定也会改变，这种情况可以写在一个 useModel 中。如下

```js
function useSelectSubject() {
  const [subjectCode, changeSubjectCode] = useState(undefined)
  const [subjectName, changeSubjectName] = useState(undefined)
  const setSubjectCode = (subjectCode: string) => changeSubjectCode(subjectCode)
  const setSubjectName = (subjectName: string) => changeSubjectName(subjectName)

  return {
    subjectCode,
    subjectName,
    setSubjectCode,
    setSubjectName,
  }
}
```

当然你也可以用一个对象包这两个字段，一切随你喜欢，我只是想表达，既然是有关系的，一个变另一个也变的，可以放在一块

3. 一个 model 文件，允许存在 n (n<5)个 useXXXModel

会不会存在一种情况，就是你可能有好几个字段，这好几个字段可以按照上边 “强关联” 分割成 n 个，但你又不想有 n 个 `.js` 文件，并且可能这 n 个文件是这个模块公用的。

> 总不能新建一个文件夹，然后将 n 个文件都写成 useN1Model.js、useN2Model.js、useN3Model.js 吧，不会吧不会吧 ?

我个人建议是 : 该文件控制在 150 行代码以内，大概 5 个 model 即可，超出 5 个，则拆分，当然，这只是我个人的建议而已啦

```js
// 比如我这个就叫做 useBaseModel.js
import { createModel } from 'hox'

function useSelectClass() {}
function useSelectSubject() {}
function useSelectChapter() {}

export default {
  useSelectClass: createModel(useSelectClass),
  useSelectSubject: createModel(useSelectSubject),
  useSelectChapter: createModel(useSelectChapter),
}
```

在使用的时候只需要 `import` 一次就好了，而且这个在阅读性上，也还行，毕竟这三个 `useModel` 都是具有关联性的

```js
import useBaseModel from '@src/model/user/useBaseModel'

function User() {
  const { className } = useBaseModel.useSelectClass()
  const { subjectName } = useBaseModel.useSelectSubject()
  const { chapterName } = useBaseModel.useSelectChapter()
}
```

### 文件目录划分

官方对 hox 特性的说明 : 随地可用，**所以 model 层的文件目录规范也要统一**，虽然之前使用 redux 的时候，业务 reducer 也是放在业务文件夹下，但是因为 `combineReducer` 的存在，我们是可以在 store 的入口文件 index.js 看到所有 import 进来的 reducer

但是 hox，你不使用 createModel 时，它就是一个业务 hooks，随时建，随时用，会导致后期维护非常麻烦，特别是无 dev-tools 下，你根本不知道哪些 hooks 是变成了持久化、全局共享的 model hooks

> 会不会有一种情况，那就是 A 在开发的时候，一开始它写的就是一个业务 hooks，后边它需要把这个数据变成全局共享，于是它直接在当前目录下，直接用 `createModel` 包一下，完事，后边的开发人员发现有人这样写了，照猫画虎，渐渐的... 这就是典型的“破窗效应”啊

> 破窗效应 : 一幢有少许破窗的建筑，如果那些窗不被修理好，可能将会有破坏者破坏更多的窗户。一面墙，如果出现一些涂鸦没有被清洗掉，很快的，墙上就布满了乱七八糟、不堪入目的东西

我建议，原来我们写 store 的文件夹，改成 model，同时 model 下的文件夹架构和业务一致。

### 生态圈小

网上查询 hox 相关文章，几乎很少，github 目前 `star 519`，`issues 9` ，算小众的库，当然这也不是一个大问题，因为你不使用它的 createModel 将数据持久化，那么本质上就是自定义 hooks

如果有问题，大部分都还是自己逻辑问题，可能自定义写的 hooks 有点毛病，只需要自己 log 排查问题即可。

### 无 dev tools 支持

这才是痛点 ！！！**你想想，我们使用了 createModel 包裹之后，如何知道这个数据是否真的被持久化、全局共享呢** ？

常规操作就是，在组件中 import 这个数据源，然后 console.log 打印看看，但是在 [redux-devtools](https://github.com/reduxjs/redux-devtools) 插件下，我们可以直接看到这颗 state tree 的。这就很方便了。

比如我想看看 user 下是否存在我想要的字段，那么我只需要在插件中看一下 state tree

![](https://user-gold-cdn.xitu.io/2020/7/23/1737970b9378394a?w=1676&h=792&f=png&s=184697)

还有一种场景，比如我们在 A 组件中，发送请求，然后往 model 中修改了一些数据，这些数据在 B 组件才用到，A 组件用不到，**在没报错的情况下，我们无法知道数据是否真的被修改**

#### 解决方案

实在是很难过了，我总不能真的去 import 进来，然后去 console.log 吧？于是跟鹏哥一起琢磨了一下，**直接修改源码**，然后实现一个简单的 model tree 吧 ...

1. 注入每个 hooks 的命名空间

这里有个问题，那就是我们给 createModel 传递的是一个 hooks，是你在 useSelectClass 中，return { classId, changeClassId } 这个对象，所以你是不知道当前这个 hook 的名称，为此我们给这个 hooks 注入一个命名空间

```js
function useSelectClass() {}
useSelectClass.namespace = 'useSelectClass'

export default {
  useSelectClass: createModel(useSelectClass),
}
```

然后修改`createModel`源码，原来只需要给 `Executor` 传递 2 个字段，现在给它支持 namespace

```js
// createModel.js
render(
  <Executor
    onUpdate={(val) => {
      container.data = val
      container.notify()
    }}
    hook={() => hook(hookArg)}
    namespace={hook.namespace} // 新增此字段支持
  />
)
```

2. 过滤 hooks 中的方法，毕竟我们只是想展示一个 model tree 嘛 ～ 然后将这个 hooks 挂载到 window 下

```js
function Executor(props) {
  // 下边这段代码是新增的
  if (!window.hox) {
    window.hox = {}
  }
  let keys = Object.keys(data)
  let maps = {}
  keys.forEach((key) => {
    if (typeof data[key] !== 'function') {
      maps[key] = data[key]
    }
  })
  window.hox = {
    ...window.hox,
    [props.namespace]: { ...maps }, // 以namespace为key，过滤function后的数据为value
  }
  return null
}
```

3. 通过 Object.defineProperty 重写 set、get，监听 window.hox 的变化

此时去打印 window.hox ，是有数据的，又离成功近了一步，但是问题来了，我们修改 model 值之后，我们要实时响应，该这么办？记得之前看 Vue 双向绑定原理，哦豁，有了，`Object.defineProperty` 用起来

在我们写的 dev-tools 组件中，监听一下 window.hox ，将最新的 model 数据，存入 state，然后搭配 Ant Design Tree 组件，最终渲染

```js
componentDidMount() {
  window.b = {};
  const _this = this;
  Object.defineProperty(window, 'hox', {
    set: function(value) {
      window.b = value;
      _this.setState({
        model: value
      });
    },
    get: function() {
      return window.b;
    }
  });
}
```

> 原本我们用的不是 window.b = {} , 而是 let a = {}，然后在 set 中，a = value，但是发现会存在问题，什么问题? 小伙伴们可以想一下，或者实践一波

4. 递归遍历，构造 Tree 组件需要的数据，然后渲染

这是最费时的了，我们要将这种数据格式，转成 Tree 想要的数据格式，写了好多遍都没写对，后边还是鹏哥给了提示，感谢鹏哥

```js
// 我们的数据
window.hox = {
  useUserModel: {
    name: '彭道宽',
    school: [
      {
        s_name: 'xxx大学',
        time: '2015-2019',
      },
      {
        s_name: 'xxx高中',
        time: '2012-2015',
      },
    ],
    currentCompany: {
      c_name: 'CVTE',
      c_job: '前端工程师',
    },
  },
}
```

```js
// Ant Design Tree 数据
antdTree = [
  {
    title: 'useUserModel',
    key: '0',
    children: [
      {
        title: 'name',
        key: '0-0',
        children: [],
      },
      {
        title: 'school',
        key: '0-1',
        children: [
          {
            title: 's_name',
            key: '0-1-0',
            children: [],
          },
        ],
      },
    ],
  },
]
```

上边的我就不一一写的，问题在于，如何遍历 ? 小伙伴们可以想一想 ? 不想的就直接到下一步吧

```js
format = (model) => {
  let result = []
  const deep = (children, value, idx) => {
    Object.keys(value).forEach((key, index) => {
      let temp = {}
      temp.key = `${idx}-${index}`
      // 这是我对title的处理，因为非function/object，直接就渲染值在后面
      temp.title = this.renderTitle(value[key], key)
      temp.children = []
      if (this.checkIsObjectOrArray(value[key])) {
        // 如果是对象或者数组，那就递归
        deep(temp.children, value[key], temp.key)
      }
      children.push(temp)
    })
  }
  Object.keys(model).forEach((key, index) => {
    let temp = {}
    temp.key = index
    temp.title = this.renderTitle(model[key], key)
    temp.children = []
    if (this.checkIsObjectOrArray(model[key])) {
      deep(temp.children, model[key], index)
    }
    result.push(temp)
  })
  return result
}
```

效果如图 👇

<img src="https://user-gold-cdn.xitu.io/2020/7/23/173799c32c1b60de?w=640&h=659&f=png&s=63777" width=400 />

5. 问题不大，基本完工，我们再稍微完善一下这个 dev-tools 组件，参考一下 redux 的插件，最终效果如图

<img src="https://user-gold-cdn.xitu.io/2020/7/23/173799d4348e0ae0?w=597&h=702&f=png&s=87472" width=400 />

<br />

<img src="https://user-gold-cdn.xitu.io/2020/7/23/173799e504224e76?w=638&h=741&f=png&s=91696" width=400 />

## 缺点

如果我代码这么写，你们觉得有什么问题吗?

```js
function useSelectClass() {
  const [classId, setClassId] = useState('')
  const changeClassId = (classId) => setClassId(classId)

  useEffect(() => {
    // 一顿操作，然后把classId改了
    const data = handle()
    setTimeout(() => {
      setClassId(data)
    }, 10000)
  })
  return { classId, changeClassId }
}
export default createModel(useSelectClass)
```

你们觉得我这么写，会不会有问题呢 ？有，如果我作为使用者，我取这个 classId 值，那么在这个 10s 内，我取的是一个 undefined，然后 10s 后，突然 classId 变了；还有一种可能，你依赖 classId，当 classId 变了之后你发送请求，10s 之前你发现没问题，10s 之后，哦豁，怎么突然多发了一遍请求 ?

所以我认为要约束，规定 model 的 hooks 不要写副作用，它就存粹的 getValue、setValue 就好了

或许有人会说，那你也可以在 redux 这么做啊，不是吧，reducer 可是一个纯函数啊，小老弟，不知道纯函数的去科普一下哈

还有一个问题，不应该说是缺点，就是想讨论 : 相对于 redux 的集中式管理 store 与 hox 的分散式且无 dev-tools 情况下的管理

## 最后

如果我是一个新人，我就只会 react，什么 redux、什么 dva、mobx 我都不会，我就只想写一些小项目，那么我会选择 hox ～～

对于小项目，可能需要 store 存储的字段比较少，那么配上简陋版本的 dev-tools，hox 或许会比较香，引入 redux 那套 action->saga->reducer 等，前期投入比较大，但是对于大项目，还是用 redux 吧，毕竟 redux 算比较成熟，生态圈也很丰富

个人还是觉得 hox 这个设计思想还是挺不错的，但是我很担心一点，那就是 : **这会不会是一个 KPI 的产物，到后期没人维护，也没人更新。**

好了，对于 hox，今天就聊到这，大家散了散了。最后建议，感兴趣的可以去看看源码，确实还可以，涨知识了...

## 相关链接

- [hox](https://github.com/umijs/hox)
- [团队博客](https://github.com/SugarTurboS/Blogs)
- [阿宽的博客](https://github.com/PDKSophia/blog.io)
- [【KT】查缺补漏 React 状态管理探索](https://juejin.im/post/5edf6b63518825365d47ed73)
- [【KT】轻松搞定 Redux 源码解读与编程艺术](https://juejin.im/post/5dad64aef265da5b8d18dd26)
