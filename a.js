class Parent {
  constructor (name) {
    this.name = name
  }
  
  doing () {
    console.log('parent doing something')
  }

  getName () {
    console.log('parent name: ', this.name)
  }

}

class Child extends Parent {
  constructor (name, parentName) {
    super(parentName)
    this.name = name
  }

  sayName () {
    console.log('child name: ', this.name)
  }
}

var ch1 = new Child('son', 'father')
ch1.sayName() // child name: son
ch1.getName() // parent name: son
ch1.doing() // parent doing something

var parent = new Parent('father')
parent.getName() // parent name: father