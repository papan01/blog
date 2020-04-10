---
title: "編寫JavaScript的小技巧"
date: "2020-04-08"
category: "FrontEnd"
cover: "/images/person-standing-on-wrecked-plane.jpg"
tags:
  - JavaScript
---

我在Youtube上面看到了一支影片[「JavaScript Pro Tips - Code This, NOT That」](https://www.youtube.com/watch?v=Mus_vwhTCq0)，裡面的教導了一些寫JavaScript的小技巧，覺得很棒，所以在此把想它記錄下來。

## Console Log

- Bad Code 💩

```javascript
const foo = { name: 'tom',   age: 30, nervous: false };
const bar = { name: 'dick',  age: 40, nervous: false };
const baz = { name: 'harry', age: 50, nervous: true };

console.log(foo);
console.log(bar);
console.log(baz);
```

原因:在DevTool上看到的log只會呈現Object，無法一眼看出是哪一個。
![js-pro-tips-1](/static/images/js-pro-tips-1.png)

- Good Code 👍

```javascript
// Computed Property Names
console.log('%c My Friends', 'color: orange; font-weight: bold;' )
console.log({ foo, bar, baz });

// Console.table(...)
console.table([foo, bar, baz])

// Console.time
console.time('looper')

let i = 0;
while (i < 1000000) { i ++ }

console.timeEnd('looper')

// Stack Trace Logs
const deleteMe = () => console.trace('bye bye database')

deleteMe()
deleteMe()
```

1. 將它們置入於物件中，在console上就能看得到它們的名稱。
2. 可以替它們增加一點樣式，讓我們一眼就注意到想注意的部分。
3. 使用`console.table`表格化，也能增加可讀性。
4. 透過`console.time`與`console.timeEnd`計算執行時間。
5. `console.trace`能在console上顯示程式碼在哪裡被執行，讓你快速找到執行的位置。

![js-pro-tips-2](/static/images/js-pro-tips-2.png)

## Destructuring

- Bad Code 💩

```javascript
const turtle = {
    name: 'Bob 🐢',
    legs: 4,
    shell: true, 
    type: 'amphibious',
    meal: 10,
    diet: 'berries'
}

function feed(animal) {
    return `Feed ${animal.name} ${animal.meal} kilos of ${animal.diet}`;
}
```

原因:不斷的重複使用`animal`來獲取其屬性。

- Good Code 👍

```javascript
function feed({ name, meal, diet }) {
    return `Feed ${name} ${meal} kilos of ${diet}`;
}
// OR
function feed(animal) {
    const { name, meal, diet } = animal;
    return `Feed ${name} ${meal} kilos of ${diet}`;
}

console.log(feed(turtle))
```

透過destructuring來處理`animal`能減少直接使用`animal`。若是處理龐大的物件，能在destructuring時就知道只需要用到它其中的哪些屬性。

## Template Literals

- Bad Code 💩

```javascript
const horse = {
    name: 'Topher 🐴',
    size: 'large',
    skills: ['jousting', 'racing'],
    age: 7
}
  
let bio = horse.name + ' is a ' + horse.size + ' horse skilled in ' + horse.skills.join(' & ')
```

原因: 不斷的透過`+`來串連一個字串，這會讓程式碼變很長且修改也較不易。

- Good Code 👍

```javascript
const { name, size, skills } = horse;
bio = `${name} is a ${size} horse skilled in ${skills.join(' & ')}`
console.log(bio);

// Advanced Tag Example
// [1]
function horseAge(str, age) {
    const ageStr = age > 5 ? 'old' : 'young';
    const str0 = str[0] // "This horse is "
    return `${str0}${ageStr} at ${age} years`;
}

const bio2 = horseAge`This horse is ${horse.age}`;
console.log(bio2)

// [2]
function template(strings, ...keys) {
  return (function(...values) {
    var dict = values[values.length - 1] || {};
    var result = [strings[0]];
    keys.forEach(function(key, i) {
      var value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}

var t1Closure = template`${0}${1}${0}!`;
t1Closure('Y', 'A');  // "YAY!"
```

使用反引號`` `...` ``進行字串內插，這樣看起來也比較簡潔有力，增加或減少空隔也比較容易看到。裡面進階的用法能使處理字串的函式顯得更靈活。

## Spread Syntax

- Bad Code 💩

```javascript
// Objects
const pikachu = { name: 'Pikachu 🐹'  };
const stats = { hp: 40, attack: 60, defense: 45 }

pikachu['hp'] = stats.hp
pikachu['attack'] = stats.attack
pikachu['defense'] = stats.defense
// OR
const lvl0 = Object.assign(pikachu, stats)
const lvl1 = Object.assign(pikachu, { hp: 45 })

// Arrays
let pokemon = ['Arbok', 'Raichu', 'Sandshrew'];

pokemon.push('Bulbasaur')
pokemon.push('Metapod')
pokemon.push('Weedle')
```

原因: 不論是物件或者陣列，透過一行一行的執行都顯得有點太麻煩了，且有時候我們更想要獲得一個immutable object，那麼使用`Object.assign(..)`其實不算是個太糟的方式，但有更好的方法。

- Good Code 👍

```javascript
// Objects

const lvl0 = { ...pikachu, ...stats }
const lvl1 = { ...pikachu, hp: 45 }

// Arrays

// Push
pokemon = [...pokemon, 'Bulbasaur', 'Metapod', 'Weedle']
// Shift
pokemon = ['Bulbasaur', ...pokemon, 'Metapod', 'Weedle', ]
```

Spread Syntax使用三個間隔號，透過`...`將指定物件或者陣列賦予到一個新的物件或者陣列，這看起來簡潔有力且又方便使用。

## Loops

- Bad Code 💩

```javascript
const orders = [500, 30, 99, 15, 223];

let total = 0;
let withTax = [];
let highValue = [];
for (i = 0; i < orders.length; i++) {
    // Reduce
    total += orders[i];
    // Map
    withTax.push(orders[i] * 1.1);
    // Filter
    if (orders[i] > 100) {
        highValue.push(orders[i])
    }
}
```

原因:上面的`for...loop`其實算是蠻正常的使用方式，但有點醜陋，或許我們可以用Javascript array method代替更好。

- Good Code 👍

```javascript
// Reduce
const total = orders.reduce((acc, cur) => acc + cur)

// Map
const withTax = orders.map(v => v * 1.1)

// Filter
const highValue = orders.filter(v => v > 100);

/**
 * Every
 * @returns false
 */
const everyValueGreaterThan50 = orders.every(v => v > 50)

/**
 * Every
 * @returns true
 */
const everyValueGreaterThan10 = orders.every(v => v > 10)

/**
 * Some
 * @returns false
 */
const someValueGreaterThan500 = orders.some(v => v > 500)

/**
 * Some
 * @returns true
 */
const someValueGreaterThan10 = orders.some(v => v > 10)
```

這樣看起來簡潔有力多了!

## `async`與`await`

- Bad Code 💩

```javascript
const random = () => {
    return Promise.resolve(Math.random())
}

const sumRandomAsyncNums = () => {
    let first;
    let second;
    let third;

    return random()
        .then(v => {
            first = v;
            return random();
        })
        .then(v => {
            second = v;
            return random();
        })
        .then(v => {
            third = v;
            return first + second + third
        })
        .then(v => {
            console.log(`Result ${v}`)
        });
}
```

原因:想像`random()`是我們真實世界在使用API與database溝通，接著需要等待獲取到的資料執行下一步驟，所以就會像上面這樣寫了一長串的程式碼。

- Good Code 👍

```javascript
const sumRandomAsyncNums = async() => {

    const first = await random();
    const second = await random();
    const third = await random();

    console.log(`Result ${first + second + third}`);
}
```

使用`async`與`await`能達到相同的目的且可讀性也較好。

## Rest Params

- Bad Code 💩

```javascript
function totalHitPoints(a, b, c, d) {
    return a + b + c + d;
}
```

原因: 缺乏彈性。

- Good Code 👍

```javascript
function totalHitPoints(...hits) {
    return hits.reduce((a, b) => a + b);
}

totalHitPoints(1,2,3,4,5,6,7)
```

與Spread Syntax一樣使用三個間隔號，只是用於函式的參數之中，這在其他程式語言中也有類似的用法，稱為**可變參數函數**。

## Reference

- [JavaScript Pro Tips - Code This, NOT That](https://www.youtube.com/watch?v=Mus_vwhTCq0)
- [github/code-this-not-that-js](https://github.com/codediodeio/code-this-not-that-js)
