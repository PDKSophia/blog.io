// function todo(fn, delay) {
//   let timer = null
//   return function() {
//     let _this = this
//     let args = arguments
//     clearTimeout(timer)

//     timer = setTimeout(() => {
//       fn.apply(_this, args)
//     }, delay)
//   }
// }

// Function.prototype._call = function(context) {
//   var context = context || window
//   context.fn = this
//   var args = []

//   for (let i = 1; i < arguments.length; i++) {
//     args.push('arguments[' + i + ']')
//   }

//   var result = eval('context.fn(' + args + ')')
//   delete context.fn
//   return result
// }

// Function.prototype._apply = function(context) {
//   var context = context || window
//   context.fn = this
//   var args = []

//   for (let i = 0; i < arguments[1].length; i++) {
//     args.push('arguments[1][' + i + ']')
//   }

//   var result = eval('context.fn(' + args + ')')
//   delete context.fn
//   return result
// }

Function.prototype._bind = function(context) {
  var self = this
  var args = Array.prototype.slice.call(arguments, 1)

  return function() {
    var bindArgs = Array.prototype.slice.call(arguments)
    return self.apply(context, args.concat(bindArgs))
  }
}
