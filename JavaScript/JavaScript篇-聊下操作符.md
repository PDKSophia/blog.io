## == 操作符

```javascript
比较运算 x == y ， 其中 x 是值， y 是值， 产生 true 或 false
以下是一些常见到规则 : 

1. 如果 Type(x) 与 Type(y) 相同
    a . Type(x)为undefined，则返回true
    b . Type(x)为null，则返回true
    c . Type(x)为Number
        i. 如果x是NaN，返回false
        ii. 如果y是NaN，返回false
        iii. 如果x和y值相等，返回true
        iv. 如果x是0，y是-0，返回true
    
    d . Type(x)为String，如果x和y是一致的字符序列，则返回true，否则返回false
    e . Type(x)为Boolean，只有x和y都为true才返回true，否则返回false

2. 如果x为null且y为undefined，返回true
3. 如果x为undefined且y为null，返回true
4. 如果Type(x)为Number，Type(y)为String，返回 x = ToNumber(y)的结果，比如 2 == '2'
5. 如果Type(x)为String，Type(y)为Number， ToNumber(x) = y的结果，比如 '2' == 2
6. 如果Type(x)为Boolean，返回 ToNumber(x) = y 的结果，比如 ToNumber(true) == 2
7. 如果Type(y)为Boolean，返回 x = ToNumber(y) 的结果，比如 2 == ToNumber(true) 
8. 如果Type(x)为String或者Number，且Type(y)为Object，返回比较 x == ToPrimitive(y)的结果
9. 如果Type(x)为Object，且Type(y)为String或者Number，返回比较 ToPrimitive(x) == y 的结果

```
```javascript
    console.log([] == ![]) 为什么打印 true

    [] == ![]  // -> true

    1. 首先js引擎要计算的是等号右边的![]，右边到 [] 为true，![]取反得到 false

    2. 所以式子现在为 : [] == false

    3. 由第7条规则，所以 [] == ToNumber(false), 即 [] == 0

    4. 因为[]的typeof是Object，0的typeof是Number，所以根据第9条规则， ToPrimitive([]) == 0， 即 '' == 0

    5. 由第5条规则，''的typeof是String，0的typeof是Number，所以ToNumber('') == 0 ，即 0 == 0

    6. 所以打印出true
    
```
