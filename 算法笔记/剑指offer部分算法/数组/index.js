// var stack1 = []
// var stack2 = []

// function enqueue(value) {
//   stack1.push(value) // 入栈1
// }

// function dequeue() {
//   if (stack2.length <= 0) {
//     while (stack1.length > 0) {
//       // 从stack1出栈入stack2
//       let ele = stack1.pop()
//       stack2.push(ele)
//     }
//   }
//   if (stack2.length === 0) {
//     console.log('没值')
//   }
//   return stack2.pop()
// }

// // 入队
// enqueue('a')
// enqueue('b')
// enqueue('c')
// enqueue('d')
// // 出队
// console.log(dequeue())
// console.log(dequeue())
// console.log(dequeue())
// console.log(dequeue())

// // a, b, c, d

// var queue1 = []
// var queue2 = []

// function pushStack(value) {
//   queue1.push(value)
// }

// function popStack() {
//   if (queue2.length === 0) {
//     while (queue1.length > 1) {
//       let ele = queue1.shift()
//       queue2.push(ele)
//     }
//     return queue1.shift()
//     // 此时queue1 = ['d'], queue2 = ['a', 'b', 'c']
//   }

//   if (queue1.length === 0) {
//     while (queue2.length > 1) {
//       let ele = queue2.shift()
//       queue1.push(ele)
//     }
//     return queue2.shift()
//     // 此时queue2 = ['c'], queue1 = ['a', 'b']
//   }
// }

// // 进栈
// pushStack('a')
// pushStack('b')
// pushStack('c')
// pushStack('d')
// // 出栈
// console.log(popStack())
// console.log(popStack())
// console.log(popStack())
// console.log(popStack())

// // d, c, b, a

// function fibonaci(n) {
//   if (n === 0) {
//     return 0
//   }
//   if (n === 1) {
//     return 1
//   }
//   return fibonaci(n - 1) + fibonaci(n - 2)
// }

// console.log(fibonaci(10))

// function fibonaci2(n) {
//   var arr = [0, 1]
//   if (n < 2) {
//     return arr[n]
//   }
//   for (let i = 2; i <= n; i++) {
//     let temp = arr[0] + arr[1]
//     arr[0] = arr[1]
//     arr[1] = temp
//   }
//   return arr[1]
// }
// console.log(fibonaci2(6))

// function numberOf1(n) {
//   var count = 0
//   var flag = 1
//   while (flag) {
//     if (n & flag) {
//       count++
//     }
//     flag = flag << 1
//   }
//   return count
// }
// console.log(numberOf1(5))

function numberOf1(n) {
  var count = 0
  while (n) {
    ++count
    n = (n - 1) & n
    console.log('@@@', n)
  }
  return count
}
console.log(numberOf1(15))
