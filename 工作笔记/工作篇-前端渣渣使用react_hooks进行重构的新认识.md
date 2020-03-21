# 前言

> 📢 这篇文章相对较长，是我重构的一次记录。请耐住性子，慢慢看下去 ~ 为了方便理解，函数/变量的取名有些 low，emmm，大家不要介意~

前几天，中途临时接到一个需求，**复杂程度虽然不高，但也不低**，时间很赶（原本半个月，硬生生五天五夜肛完），基于这个需求，为了赶上送测，代码怼上去的，bug 相对较多，这不，送测阶段，回过头去看这模块的代码（自己都看不下去）...决定，利用这周末时间，用 react hooks 进行重构一波 ~

> 为什么要用 hooks 进行重构，这是因为基于业务逻辑，个人认为用 hooks 适合，同时我感觉使用 hooks 相对于 class component 的写法，在代码阅读上会更加清晰（当然这是个人看法），同时我本身之前也只是看了看 hooks 的文档，使用了一些简单的 API，这次想借此机会，好好学一下 hooks ~

😊 废话不多说，直接看需求吧 ~

# 需求

**真实业务需求已被我和谐**，首先，我们有一个页面，这个页面是这样的 ~ 应该都能理解这个组件是长什么样了吧？

<img src="https://user-gold-cdn.xitu.io/2020/3/14/170d70cb0183faa5?w=813&h=449&f=png&s=32235" width=550 />

给你们简单画一下，就是这个样子 👇

<img src="https://user-gold-cdn.xitu.io/2020/3/14/170d711d8936b002?w=891&h=644&f=png&s=29863" width=500 />

<img src="https://user-gold-cdn.xitu.io/2020/3/14/170d71111639e3cc?w=925&h=650&f=png&s=33140" width=500 />

这下子应该懂了吧 ~ 我们继续看一下需求是什么 ：

- 头部 A 组件，有一个叫做 **接收** 的操作，接收完之后，刷新自己，同时需要 B 和 C 组件进行更新
- 右侧 C 组件，有一个叫做 **更新**、**删除**的操作，操作完之后，刷新自己，同时需要更新 A 已经 B

这么一看，其实并不复杂啊，但是问题在于 ：

1. 所有的请求，都在各自的组件中进行，你不可能在A组件中，把B、C组件的请求逻辑copy一遍

2. 上边只是写的 A、B、C 组件，但是实际上，真实触发此操作的是在它们的子组件进行

3. 我已经把这些请求、赋值等都做完了，这时候才知道需要更新，但我并不想去动原先的代码

4. 真实的业务场景更加复杂，比如，这个页面父组件的显示，还依赖于 tabs 的值（举例，tabs = `场景1`，data = `场景1`, tabs = `场景2`，data = `场景2`）

> 也就是这个页面父组件，它显示的数据，会根据 `tabs` 的不同，显示不同

## 主要问题

### 请求在各自组件中进行

以右侧-C 组件为例子，它是一个列表，存在着`更新`、`删除`操作，那么它的代码就是这样的

```js
// 组件C
componentDidMount() {
    this.fetchList();
}

fetchList = () => {
    if (tabs === '场景1') {
        fetchList1()
    } else if (tabs === '场景2') {
        fetchList2()
    }
}

handleUpdate = () => {
  // 刷新逻辑
  // ...
  this.fetchList()
}

handleDelete = () => {
  // 删除逻辑
  // ...
  this.fetchList()
}

render() {
    const data = tabs === '场景1' ? list1 : list2;
    return (
        <List data={data} deleteCallback={this.handleDelete} updateCallback={this.handleUpdate} />
    )
}
```

看出问题了吗，A、B、C 组件，每次在请求、渲染之前，都要判断当前 reducer 中 tabs 的值。真实业务复杂程度相对较高，举个例子，组件 B 的逻辑可能是这样的 👇

```js
// 组件B
componentDidMount() {
    if (tabs === '场景1') {
        // 获取列表
        promisify(getList1)(params, res => {
            if (res.code === 0) {
                storeToRedux('场景1-列表', res.data);
                // 根据列表第一条数据id，获取详情
                getDetail(res.data[0].id)
            }
        })
    } else if (tabs === '场景2') {
        // 获取列表
        promisify(getList2)(params, res => {
            if (res.code === 0) {
                storeToRedux('场景2-列表', res.data);
                // 根据列表第一条数据id，获取详情
                getDetail(res.data[0].id)
            }
        })
    }
}

render() {
    const data = tabs === '场景1' ? list1 : list2;
    const detail = tabs === '场景1' ? detail1 : detail12;
    return (
        // ...
    )
}
```

我们来想想，A、B、C 组件，都需要这么写，累不累，麻不麻烦？我们再来看另一个问题

### 内容页和缺省页的切换

上边也给出图片了，有数据的时候，显示内容页（B、C 组件），无数据的时候，需要显示缺省组件，那么代码可能就是这样的

```js
// 为了更加容易理解，取名就比较直观，don't care ~
render() {
    const bList = tabs === '场景1' ? reduxBList1 : reduxBList2;
    const cList = tabs === '场景2' ? reduxCList1 : reduxCList2;
    // ... 如果更多，那就会写的更多

    return (
        <div>
            {bList.length === 0 && cList.length === 0 && (
                <Empty />
            ) : (
                <div>
                  <B-Component />
                  <C-Component />
                </div>
            )}
        </div>
    )
}
```

可能会觉得，不这么写，还能怎么写？？我们继续往下看

### 接收、更新、删除之后，如何让别的组件更新

这个是最难受的一个问题，因为真的时间紧，我不想改动原先的代码，所以我用了一个很蠢的办法，就是在 redux 中定义变量，用于通知更新。

```js
// redux
let initRedux = Immutable({
  noticeUpdateToA: false, // 通知A组件进行更新
  noticeUpdateToB: false, // 通知B组件进行更新
  noticeUpdateToC: false // 通知C组件进行更新
});
```

所以代码就是这样的，我以 B 组件为例子，不管如何，在执行完操作之后，都会修改 redux 中的这些值，同时在组件的 `componentWillReceiveProps` 中监听

```js
// 组件B
componentDidMount() {
    this.fetchList();
}

componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.noticeUpdateToB) {
        this.fetchList();
    }
}

fetchList = () => {
    if (tabs === '场景1') {
        // 获取列表
        promisify(getList1)(params, res => {
            if (res.code === 0) {
                storeToRedux('场景1-列表', res.data);
                // 根据列表第一条数据id，获取详情
                getDetail(res.data[0].id)
                
                // ❗❗❗ 需要改为false
                storeToRedux({
                    noticeUpdateToB: false
                })
            }
        })
    } else if (tabs === '场景2') {
        // 获取列表
        promisify(getList2)(params, res => {
            if (res.code === 0) {
                storeToRedux('场景2-列表', res.data);
                // 根据列表第一条数据id，获取详情
                getDetail(res.data[0].id)
                
                // ❗❗❗ 需要改为false
                storeToRedux({
                    noticeUpdateToB: false
                })
            }
        })
    }
}
```

这波操作，是真的骚啊，但是，你就会发现，真的太恶心了!!!

而且有时候，一个请求，会发送两遍。等等，你问我为啥会请求两次？你看看 `C组件的子组件D` 的代码，就知道了。

```js
// C组件
componentDidMount() {
    this.fetchList();
}

fetchList = () => {
    if (tabs === '场景1') {
        fetchList1()
    } else if (tabs === '场景2') {
        fetchList2()
    }
}

// C下的子组件D
componentDidMount () {
    if (this.props.detail.id) {
        this.getDetails();
    }
}

componentWillReceiveProps(nextProps) {
    if (this.props.detail.id !== nextProps.detail.id) {
        this.getDetails();
    }
    if (nextProps.detail && nextProps.noticeUpdateToC) {
        this.getDetails();
    }
}
```

看到了吗，C组件下的Ｄ组件，根据C列表传入的详情id，去请求，真实的业务场景更加复杂，你想想，一个组件，在它的`DidMount`和`updateMount`周期，去发送请求，然后这个请求，根据 tabs 不同，请求的url不同，请求回来了，还要根据返回的数据，再一次请求详情，然后再做一些其它 🐓 儿的操作。

关键是，这还不是一个组件，三个组件都这样，说不定之后这块复杂起来，更加难以维护！！！

> 💥 最主要的是，每个组件，都要引入connect、引入 bindActionCreators ，然后自己还要写connect(mapStateToProps, mapDispatchToProps)，最简便的方法就是 CTRL + C/V 了。当我并不像当个低端的 copyer。这里你可以写一个管理当前的connectReducer函数，在这个函数中处理connect，这里我不过多介绍 ~ 我会在结尾的彩蛋中直接贴代码 ~ 

# 重构

忍无可忍，于是去拿了一张 A4 纸，把现阶段的一个流程图及关系图画了出来，同时理清楚了每一个思路，然后画了一下重构之后的关系图，并且咨询了一下导师，终于，在今天，踏出了第一步。

<img src="https://user-gold-cdn.xitu.io/2020/3/15/170dc8455158a84e?w=1410&h=636&f=png&s=61908" />

这个图不知道能不能说的清楚，大致就是这样的 ：

- 封装一个 hooks，用于获取当前的 tabs，然后在页面中，如果要用到就直接引入这个 hooks 即可

- 封装**A 组件**的请求，在外部的调用，无需在乎 tabs 是什么，总之，我引用这个 hooks，就只需要你发起 dispatch action 就好了。

- 其它组件请求也是这样，同时获取数据，也写一个 hooks，只需要返回我想要的结果，不需要我自己进行判断 tabs

> 因为这个 tabs 是存在 redux 中的，我们在每个页面都去写 connect 吧，多累呀 ~

下边我们以 **头部-C 组件** 来举例，看看重构后的最终效果 ~

## 自定义 hooks

```js
/**
 * @Desc 自定义hooks
 * @Author pengdaokuan
 */
import { useAsyncFn } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';

/**
 * @desc 当前 tabs = 场景1
 */
export function useTabsType() {
  const tabsType = useSelector(state => state.global.tabs);
  const isTabsScense1 = () => {
    return tabsType === '场景1';
  };
  return isTabsScense1;
}

/**
 * @desc 跳转到详情页面
 * @param {String} uid - 详情信息的uid
 */
export function useHandleDetails() {
  const handleToDetails = uid => {
    const url = `/juejin/author/pengdaokuan/${uid}`;
    window.open(window.location.origin + url, '_blank');
  };
  return handleToDetails;
}

/**
 * @desc 获取组件C的列表数据
 */
export function useFetchC_List() {
  const isTabs1 = useTabsType();
  const tabs1ActionName = 'FETCH_TABS_1_SHOP_LIST';
  const tabs2ActionName = 'FETCH_TABS_2_SHOP_LIST';
  const resuktActionName = isTabs1() ? tabs1ActionName : tabs2ActionName;

  const dispatch = useDispatch();
  const result = useAsyncFn(async () => {
    const useAction = await dispatch(resuktActionName);
    return useAction;
  });
  return result;
}

/**
 * @desc 获取当前tabs对应的数据
 */
export function useCurrentTabsData() {
  const isTabs1 = useTabsType();
  // 场景1
  const redux1_listA_data = useSelector(state => state.redux1.listA_data);
  const redux1_listB_data = useSelector(state => state.redux1.listB_data);
  const redux1_listC_data = useSelector(state => state.redux1.listB_data);
  // 场景2
  const redux2_listA_data = useSelector(state => state.redux2.listA_data);
  const redux2_listB_data = useSelector(state => state.redux2.listB_data);
  const redux2_listC_data = useSelector(state => state.redux2.listB_data);

  let tabsData = {};
  if (isTabs1()) {
    tabsData = {
      listA_data: redux1_listA_data,
      listB_data: redux1_listB_data,
      listC_data: redux1_listC_data
    };
  } else {
    tabsData = {
      listA_data: redux2_listA_data,
      listB_data: redux2_listB_data,
      listC_data: redux2_listC_data
    };
  }

  return [tabsData];
}
```

上边是部分的 hooks，我们来看看 **右侧-C 组件** 的相关代码

```js
// 组件C
import { useCurrentTabsData, useHandleDetails, useFetchC_List } from './useInitHooks';

function C_Layout() {
  const [tabsData] = useCurrentTabsData();
  const [fetchResult, fetchAction] = useFetchC_List();

  const handleToDetails = useHandleDetails();

  useEffect(() => {
    fetchAction();
  }, []);

  return (
    <div>
      {tabsData.listC.map(item => {
        return <Item handleToDetails={handleToDetails(item.uid)} />;
      })}
    </div>
  );
}

export default C_Layout;
```

上边就是对 **右侧-C 组件** 重构后的代码，其实真实业务，可能不止这么点代码，包括 `useTabsType` 这个 hooks，肯定不止就一种 tabs，这里我只是提供了我自己的思路 ~

这样一来，**组件 A 和 组件 B 也可以这么操作了~**

但是当我把 A、B、C 都这么写了之后，发现，我还要写 const、action、saga 对应的文件，就很难受。有没有好的办法呢？

# 利用 hooks，抛弃 Action、Saga 层

> emmmm，本想这个重写写篇文章的，但是想了想，都是对 hooks 的使用，还是写在这里吧 ~

> 👍 这波骚操作，是我导师迪哥写的，我觉得这波操作挺有意思~ 为我迪哥打 call！！！

我们知道，在 react 中，我们想要发请求获取数据，存入 redux，一般是这样的 :

**页面发起 Dispatch -> Action -> Saga -> Reducer**

举个例子，我们一般都是这样写一个请求的 👇

```js
// 页面组件-发起Dispatch
useEffect(() => {
  dispatch(props.fetchList);
});

// const.js
export const FETCH_LIST = 'FETCH_LIST';
export const FETCH_LIST_SUCCESS = 'FETCH_LIST_SUCCESS';

// action.js
export function fetchList(params, callback) {
  return {
    type: FETCH_LIST,
    params,
    callback
  };
}

// saga.js
function* fetchList({ params, callback }) {
  const res = yield call(); // 发起请求
  if (res.code === 0) {
    yield put({
      type: FETCH_LIST_SUCCESS,
      data: res.data
    });
  }
  if (isFunction(callback)) callback(null, res);
}

// reducer.js
function reduxReducer(state = initReducer, action) {
  switch (action.type) {
    case FETCH_LIST_SUCCESS:
      return Immutable.set(state, 'list', action.data);
    default:
      return state;
  }
}
```

这大家应该都看得懂吧，试想，我们每次写个东西，都要在 const 里边定义，再到 action、saga 文件去写对应的逻辑，有没有什么更好的骚气操作呢？

有，我迪哥就是这么写的，直接不要 action、saga，给你们看看怎么写的，代码已被和谐。

## 1.封装一个 Promise，用于请求

```js
function promiseDispatch(dispatch) {
  const Promise = require('bluebird');
  return params => {
    return Promise.promisify(callback => {
      dispatch({
        ...params,
        callback
      });
    })();
  };
}

/**
 * @description: 构造一个可发送请求方法
 */
export function useSendAsync() {
  const sendAsync = promiseDispatch(useDispatch());
  return (action, params) => {
    return sendAsync({
      ...params,
      action
    });
  };
}
```

## 2. 处理 reducer，自定义 hooks

**自定义两个快速获取 reducer 中值的 hooks 和导出一个提供修改 reducer 的 hooks**

```js
export function createReduxFunction(name, storeType, initType) {
  // 获取redux方法
  const getFunction = function(...keys) {
    // 具体如何获取，根据业务自行处理~
  };

  // 设置redux方法
  const setFunction = function(key) {
    // 具体如何设置，看业务自行处理
    // 这里主要就是对reducer中的key，进行赋值
  };

  // reduxState
  const reduxFunction = function(key) {
    // 具体看业务自行处理
  };

  const funcArray = [reduxFunction, getFunction, setFunction];

  return funcArray;
}
```

就很牛逼，然后在 reducer 文件中，引入即可

```js
export const [usePDKReducerRedux, usePDKReducerSelector, usePDKReducerFunction] = createReduxFunction(
  'PDKReducer',
  'STORE_LIB_PROPS'
);
```

## 抛弃 Action、Saga

还记得我们之前写的获取 C 列表的 hooks 吗？

```js
// 修改前
export function useFetchC_List() {
  const isTabs1 = useTabsType();
  const tabs1ActionName = 'FETCH_TABS_1_SHOP_LIST';
  const tabs2ActionName = 'FETCH_TABS_2_SHOP_LIST';
  const resuktActionName = isTabs1() ? tabs1ActionName : tabs2ActionName;
  
  const dispatch = useDispatch();
  const result = useAsyncFn(async () => {
    const useAction = await dispatch(resuktActionName);
    // 在 saga 进行 yield put 操作赋值 redux
    return useAction;
  });
  return result;
}

// 修改后
export function useFetchC_List() {
  const isTabs1 = useTabsType();
  const tabs1ActionName = 'FETCH_TABS_1_SHOP_LIST';
  const tabs2ActionName = 'FETCH_TABS_2_SHOP_LIST';
  const resuktActionName = isTabs1() ? tabs1ActionName : tabs2ActionName;

  const sendAsync = useSendAsync();
  const setTabs1_CList = usePDKReducerFunction('listC_1');
  const setTabs2_CList = usePDKReducerFunction('listC_2');
  return () =>
    sendAsync(resuktActionName).then(res => {
      if (res.code === 0) {
        // 直接set data to redux
        if (isTabs1()) {
            setTabs1_CList(res.data)
        } else {
            setTabs2_CList(res.data)
        }
      }
    });
}
```

就很简单，直接一个请求，这里的 `sendAsync('FETCH_LIST')` 对应原先 saga 里的`FETCH_LIST`，然后获取数据后，一个 hooks 取得修改 reducer 的方法，把请求数据写入 reducer。

页面调用也更加方便了，直接一个 hooks，然后请求，请求完调用另一个 hooks 把数据写入 reducer，获取 reducer 数据之前的复杂逻辑，也用一个 hook 进行处理。

```js
const fetchList = useFetchC_List();
useEffect(() => {
  fetchList();
});
```

我觉得很 ok ~ 再次给迪哥打卡 !!!!

# 总结

不知道这篇文章，大家有没有看明白，其实说白了，就是自己写的代码太 low 了，然后重构，重构过程的一些思考和对 hooks 的使用，之前有看过一些 hooks 的教材，大部分都是对 useState、useEffect、useRef 这些常用的 API 进行介绍，但是对 hooks 在项目中的一些深入使用，相对较少，这次，也是借鉴了一下导师迪哥的骚操作，对 hooks 的使用，彷佛是打开了一片新天地，而且，不是我说，我觉得用 hooks 重构完之后，我这模块代码，逻辑清晰了很多，代码好看了很多，感觉写的真好，啊哈哈哈哈，王婆卖瓜，自卖自夸。

日常工作，虽然也有进步，但是更多的还是主动性，为什么要重构，其实以当前的代码，也不是不能跑，但是代码写的真的是太丑了（五天五夜赶出来的代码，哪想那么多），而且他人来接手这模块，看的也是头晕，加上重构采取自己之前接触较少的hooks，还能借此学习一波hooks，看一波前辈写的代码，何乐而不为呢？

# 彩蛋

如果你注意看的话，我上边有说会在彩蛋中，贴出一个处理connectReducer的代码，emmmm，这也是我重构的时候，借鉴迪哥写的，然后自己简单封装了一下，主要是因为，重构这个模块，这个模块的代码，比如叫做商城模块，那么这个商城模块都只插 shopReducer，写一个只处理商城模块的reducer，然后再写一个处理这个reducer的函数。所有组件只需要引入这个函数，就可以连上 shopReducer 了。

```js
/**
 * @desc 商城模块redux
 * @author pengdaokuan
 */
import React from 'react';
import { isArray, isString } from 'lodash'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './action'; // 连入当前商城模块的action

/**
 * @param {React.Component} SourceComponent 需要连接Redux的组件
 * @param {String/Array} keys 可以是string，也可以是array
 */
const ShopConnect = (SourceComponent, keys) => {
  class ShopConnect extends React.Component {
    render() {
      return <SourceComponent {...this.props} />;
    }
  }
  const mapStateToProps = state => {
    if (keys) {
      if (isString(keys)) {
        return {
          [keys]: state.shopReducer[keys]
        };
      } else if (isArray(keys)) {
        const redux = {};
        keys.forEach(key => {
          redux[key] = state.shopReducer[key];
        });
        return redux;
      }
    }
    return state.shopReducer;
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      ...bindActionCreators(actions, dispatch)
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(ShopConnect);
};

export default ShopConnect;
```

使用起来就特别方便了，只需要在组件中，引入即可，**我们就不用在组件里，写 connect、action，mapStateToProps, mapDispatchToProps** 写这些玩意，而且如果多个组件，都直连redux的时候，直接调用，多么舒服。你说是吧，节省了我每次开发一个小组件，用到 redux 的时候，都要去 copy 一下，多麻烦~

```js
import React from 'react';
import ShopConnect from './shopConnect';

class Demo extends React.Component {}

export default ShopConnect(Demo, 'goodlist'); // 获取shopReducer中的goodlist数据
```

好了，今天就讲到这，果然自己还是太菜了，好好学习，奥里给！！！