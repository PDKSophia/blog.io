## 异步加载js, async和defer

有三种 : defer  、  async  、  动态创建script标签  、  按需异步载入js

+ defer : 并行下载js，会按照页面上的script标签的顺序执行，然后在文档解析完成之后执行脚本。
+ async : 并行加载脚本文件，下载完毕立即解释执行代码，不会按照页面上的script顺序执行。

<img src="https://sfault-image.b0.upaiyun.com/215/179/2151798436-59da4801c6772_articlex" height="400" width="500">

### 解析

`<script src="script.js"></script>`

没有 defer 或 async，浏览器会立即加载并执行指定的脚本，“立即”指的是在渲染该 script 标签之下的文档元素之前，也就是说不等待后续载入的文档元素，读到就加载并执行。

`<script async src="script.js"></script>`

有 async，加载和渲染后续文档元素的过程将和 script.js 的加载与执行并行进行（异步）。

`<script defer src="myscript.js"></script>`

有 defer，加载后续文档元素的过程将和 script.js 的加载并行进行（异步），但是 script.js 的执行要在所有元素解析完成之后，DOMContentLoaded 事件触发之前完成。

