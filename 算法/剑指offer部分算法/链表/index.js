function linkList() {
  // 定义节点的函数
  var initialNode = function(val) {
    this.val = val
    this.next = null
  }

  var length = 0
  var head = new initialNode('head') // 定义头指针
  length++

  // 在尾部新增一个结点
  this.addAtHead = function(val) {
    let node = new initialNode(val)
    let current = null
    if (!head) {
      head = node
    } else {
      current = head
      while (current.next) {
        current = current.next
      }
      current.next = node
    }
    length++
    return true
  }

  // 在指定位置索引index处插入结点val
  this.addAtIndex = function(index, val) {
    // 排除插入位置不正确的情况
    if (index < 0) {
      return false
    }
    // 如果单链表长度为 3，插入位置为5，不允许插入
    if (index > length) {
      return false
    }
    let node = new initialNode(val)
    let current = head
    let previous = null // 保存上一个结点，等会用到
    let idx = 0 // 下标索引

    if (index === 0) {
      node.next = current // 插入位置为第一个，在头指针前
      head = node
    } else {
      while (idx++ <= index) {
        previous = current // 当前的 previous 指向头指针
        current = current.next
      }
      previous.next = node
      node.next = current
    }
    length++
    return true
  }

  // 按照索引值index删除结点
  this.removeAtIndex = function(index) {
    if (index < 0 || index > length) {
      return false
    }
    let current = head
    let previous = null
    let idx = 0

    if (index === 0) {
      head = current.next // 当前的头指针指向下一结点
    } else {
      while (idx++ < index) {
        previous = current
        current = current.next
      }
      previous.next = current.next
    }
    length--
    return current.val
  }

  // 在尾部删除一个结点
  this.deleteAtTail = function() {
    if (length < 1) {
      return false
    }
    let current = head,
      previous = ''

    // 整个链表只有一个头结点，删除头结点，头指针指向null，表示单链表空
    if (length === 1) {
      head = null
      length--
      return current.val // 返回头结点的数据域
    }

    while (current.next !== null) {
      previous = current // 保存当前的这个结点
      current = current.next
    }

    previous.next = null
    length--
    return current.val // 返回被删除结点的数据域
  }

  // 判断链表是否为空
  this.isEmpty = function() {
    if (length === 0) {
      return true
    }
    return false
  }

  // 获取链表的长度
  this.getLinkLength = function() {
    return length
  }

  // 获取头结点
  this.getHead = function() {
    if (length === 0) {
      return null
    }
    return head // head是头结点，返回的是val数据域和next指针域
  }

  // 获取尾结点
  this.getTail = function() {
    if (length === 0) {
      return null
    }
    let current = head
    let tailNode = null
    while (current) {
      if (current.next === null) {
        tailNode = current
        break
      } else {
        current = curren.next
      }
    }
    return tailNode
  }

  // 打印当前链表的所有结点
  this.show = function() {
    let current = head
    let result = ''
    while (current.next != null) {
      result += current.next.val + ' > ' // 不显示头结点的数据域，因为head的数据域为空, 然后从头结点的下一个结点开始输出数据域的内容
      current = current.next
    }
    return result
  }

  // 查找一个结点
  this.find = function(val) {
    let node = null
    let current = head
    while (current) {
      if ((current.val = val)) {
        node = current
        break
      } else {
        current = current.next
      }
    }
    return node
  }

  // 尾部新增一个结点，并设置一个环
  this.setCycle = function(val) {
    var node = new initialNode(val)
    node.next = this.find('e') // 设置新增的val结点的next为e
    // let current = null
    // if (!head) {
    //   head = node
    // } else {
    //   current = head
    //   while (current.next) {
    //     current = current.next
    //   }
    //   current.next = node
    // }
    // length++
    // return true
  }
}

var list = new linkList()
list.addAtHead('a')
list.addAtHead('b')
list.addAtHead('c')
list.addAtHead('d')
list.addAtIndex(2, 'e') // 索引下标从0开始
// list.setCycle('f')
console.log(list.show()) // a > b > e > c > d
