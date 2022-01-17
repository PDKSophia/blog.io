# 前言

> 完整代码在这里 : [资源文件下载](https://github.com/PDKSophia/DesignPatternsToJS/blob/master/commonClasses/Download/README.md)

昨天晚上产品经理对我说，这边需要做一个功能: 点击按钮，下载所有的资源文件。

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b979174f15b5?w=240&h=240&f=gif&s=13044" width=120 />

这不挺简单，心想，直接通过 `a.download` 直接解决不就 ok 了。谁知...

我尿了... 对不起，是我年轻了。

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b87623d3a273?w=258&h=196&f=jpeg&s=7394" width=120 />

# 毛毛躁躁

与后台确定了一下返回的数据，这边后台会返回一个 `资源链接` 和 `资源名`。我们通过这个资源链接，去浏览器中输入，是可以查看的。

于是我兴致勃勃的通过 `a.download` 去下载，发现，问题出现了

下载下来的不知道是什么鸡儿玩意，根本无法打开，文件损坏

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b87c8fda9637?w=260&h=260&f=jpeg&s=10325" width=100 />

# 再理理思路

## 首先确保这个文件是否可以下载

> 例如我们的图片资源是 : httpp://images/b532cecf17544c7784c321937eaaba20 （故意打错 https）

> 然后我们给他加个`attname` : httpp://www.baidu.com/images/b532cecf17544c7784c321937eaaba20?attname=test.jpg（故意打错 https）

发现，通过这种方式，下载后就可以正常打开了，如果直接下载，那就会报 `根本无法打开，文件损坏`

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b9698be1575a?w=225&h=225&f=jpeg&s=7635" width=100 />

## 最终解决

通过 download 属性指定下载的名字，然后模拟一个点击事件。

```js
function downloadURL(url, name = '') {
  const link = document.createElement('a');
  link.download = name;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

但是呢，有问题。来看看有啥问题，首先，这个兼容性上，就有问题了。可以看到 ie 不支持，低版本的 ios safari 也不行，兼容性问题。

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b88d6a98080a?w=1259&h=338&f=png&s=46146" />

我们可通过 Blob 二进制对象进行下载。

最终，通过 Chrome、FireFox、360 均可下载，但在 IE 和 Edge 中就不行，但是也没报错。

**通过查询资料，发现 IE / Edge 和高大上的 Chrome /Firefox 对于 window.URL.createObjectURL 创建 Blob 链接最直观的区别在于 : 得到的 blob 链接形式不一样**

> Chrome 和 Firefox 会生成的带有当前域名的标准 blob 链接形式（例如 https : //www.baidu.com/86e01467-6654-4b74-98b3-ca25f396bc2f）

> 而 IE 和 Edge 会生成的不带域名的 blob 链接（例如 242CACD6-06D5-4145-A6DA-55DBE47409DB），所以如果用上面代码的方式，是下载不了文件的，并且浏览器也不会报错。

**解决方案 : 使用 window.navigator.msSaveOrOpenBlob(blob, filename)，代替 window.URL.createObjectURL**

## 相关代码

```js
/**
 * @desc 资源下载文 件
 * @Support Image/Audio/Video/Word/PDF
 * @param {Object} resource - 资源文件
 * resource: {
 *     link: '', 文件下载地址
 *     reName: '', 用户自定义导出的文件名
 *     fileType: '', 源文件类型，当文件名为空或不携带类型时，此字段必须需要
 *     fileName: '', 源文件名，尽可能带有类型，如 a.jpg、b.mp3
 * }
 */
function fetchBlob(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText || 'Download failed.'));
      }
    };
    xhr.onerror = function () {
      reject(new Error('Download failed.'));
    };
    xhr.send();
  });
}

function downloadURL(url, name = '') {
  const link = document.createElement('a');
  link.download = name;
  link.href = url;
  if ('download' in document.createElement('a')) {
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // 对不支持download进行兼容
    click(link, (link.target = '_blank'));
  }
}

// 参考 FileSaver.js ，链接地址
// https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
function click(node) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    let evt = document.createEvent('MouseEvents');
    console.log(evt);
    evt.initMouseEvent(
      'click',
      true,
      true,
      window,
      0,
      0,
      0,
      80,
      20,
      false,
      false,
      false,
      false,
      0,
      null
    );
    node.dispatchEvent(evt);
  }
}

/**
 * @desc 拼接下载链接
 * 添加 attname 属性用于下载资源文件
 */
function retrieveReallyLink(link, name) {
  let originUrl = `${link}?attname=${name}`;
  if (/\?/.test(link)) {
    originUrl = `${link}&attname=${name}`;
  }
  return originUrl;
}
/**
 * @desc 处理文件名
 * 1，用户自定义导出的文件名reName为准，无reName，以fileName为准，无fileName，给定默认文件名
 * 2. type类型以fileName的为主，fileName不存在或不携带类型，则以传入的 fileType 为主
 */
function retrieveReallyName(resource) {
  const { fileName = '', fileType = '', reName = '' } = resource;
  let type = fileType;
  let originName = '';
  if (fileName && fileName.indexOf('.') > -1) {
    type = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  }
  if (reName) {
    originName = `${reName}${type}`;
  } else if (fileName) {
    originName =
      fileName.indexOf('.') > -1 ? `${fileName}` : `${fileName}${type}`;
  } else {
    originName = `新建下载文件${type}`;
  }
  return originName;
}

/**
 * @desc 资源下载
 * @param {Object} resource
 */
export function downloadFile(resource) {
  const { link = '' } = resource;
  const originName = retrieveReallyName(resource);
  const originUrl = retrieveReallyLink(link, originName);

  return fetchBlob(originUrl)
    .then((resp) => {
      if (resp.blob) {
        return resp.blob();
      } else {
        return new Blob([resp]);
      }
    })
    .then((blob) => {
      if ('msSaveOrOpenBlob' in navigator) {
        window.navigator.msSaveOrOpenBlob(blob, originName);
      } else {
        const obj = URL.createObjectURL(blob);
        downloadURL(obj, originName);
        URL.revokeObjectURL(obj);
      }
    })
    .catch((err) => {
      throw new Error(err.message);
    });
}

/**
 * @desc 获取文件类型，当后台文件名为空或不携带类型时，需要通过此方法获取文件类型
 * @param {Number} resourceType 资源类型，参考 constant 文件定义的resoureType
 */
export function retrieveFileType(resourceType) {
  let resultType = '';
  switch (resourceType) {
    case 1:
      resultType = '.mp4';
      break;
    case 2:
      resultType = '.png';
      break;
    case 3:
      resultType = '.doc';
      break;
    case 4:
      resultType = '.ppt';
      break;
    case 5:
      resultType = '.mp3';
      break;
    case 8:
      resultType = '.pdf';
      break;
    default:
      break;
  }
  return resultType;
}
```

## 最终效果图

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b90235d3620f?w=920&h=789&f=png&s=153460" width=350 />

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b92137979410?w=1281&h=681&f=png&s=175247" width=350 />

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b90fb8789505?w=831&h=436&f=png&s=151293" width=350 />

<img src="https://user-gold-cdn.xitu.io/2020/2/28/1708b931021ec146?w=1204&h=684&f=png&s=146417" width=350 />

# 友情链接

- [FileSaver.js](https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js)
- [知乎-js 如何下载图片、pdf、mp3 等各类多媒体文件](https://zhuanlan.zhihu.com/p/77529101)
