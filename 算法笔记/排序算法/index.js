function quickSort(arr) {
  if (arr.length === 0) {
    return []
  }
  let index = Math.floor(arr.length / 2)

  let midValue = arr.splice(index, 1)

  let leftArr = [],
    rightArr = []

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < midValue) {
      leftArr.push(arr[i])
    } else {
      rightArr.push(arr[i])
    }
  }
  return quickSort(leftArr).concat(midValue, quickSort(rightArr))
}

var arr = [20, 40, 30, 10, 60, 50]
console.log(quickSort(arr))
