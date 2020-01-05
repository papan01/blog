---
title: "You don't know JavaScript Yet:#3 深入JS的核心"
date: "2020-01-05"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

前兩篇文章講的是在JS中比較Height-Level的部分，在這篇中將會深入討論JS核心的工作原理，當然這只是[You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)入門的前幾篇而已，有更多關於JS的討論將放在以後的篇章中。

## 迭代(Iteration)

在程式中處理大量的資料常見的手法就是使用迭代，在JS中的迭代器也如同其他語言一般一直不斷的在進步，底下我們就來看看JS常用的迭代方式。

## ES6 迭代協定

可迭代(iterable)協定允許JS物件定義它們自己的迭代行為，內建的可迭代物件有`Array`、`Map`與`Set`等等，若自己定義的物件則需要自己實現迭代行為，ES6提供了`Symbol.iterator`屬性，在物件中透過定義`Symbol.iterator`就被認為是一個可迭代的。`Symbol.iterator`本身是一個無參數函式，當我們透過`for..of`時就會執行這個函數並且返回一個迭代器(iterator)。
迭代器協定定義了`next()`這個方法，而`next()`必須包回傳一個擁有以下兩個屬性之物件的無參數函式：

- **done(boolean)**:若迭代器已迭代完畢整個可迭代序列，則值為 true。在這個情況下 value 可以是代表迭代器的回傳值。若迭代器能夠產出序列中的下一個值，則值為 false。相當於完全不指定 done 屬性。
- **value**: 任何由迭代器所回傳的值。可於done為true時省略。

首先看看下面的範例:

```javascript
function makeIterator(array) {
  let nextIndex = 0;
  return {
    next() {
      const iterator =
        nextIndex < array.length
          ? { value: array[nextIndex], done: false }
          : { value: undefined, done: true };
      nextIndex += 1;
      return iterator;
    },
  };
}

const it = makeIterator(['a', 'b']);

console.log(it.next()); // { value: "a", done: false }
console.log(it.next()); // { value: "b", done: false }
console.log(it.next()); // { value: undefined, done: true }
```

但這種方式必須手動處理，所以我們可以透過`for..of`進行循環迭代:

```javascript
// given an iterator of some data source:
const it = ['a', 'b'];

// loop over its results one at a time
for (const val of it) {
  console.log(`Iterator value: ${val}`);
}
//Iterator value: a
//Iterator: b
```

再來看看自定義可迭代的物件:

```javascript
class SimpleClass {
  constructor(data) {
    this.index = 0;
    this.data = data;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        if (this.index < this.data.length) {
          return {value: this.data[this.index++], done: false};
        } else {
          this.index = 0; //If we would like to iterate over this again without forcing manual update of the index
          return {done: true};
        }
      }
    }
  };
}

const simple = new SimpleClass([1,2,3,4,5]);

for (const val of simple) {
  console.log(val);  //'0' '1' '2' '3' '4' '5'
}
```

`SimpleClass`定義了`[Symbol.iterator]`方法，所以我們可以對它的實例進行迭代。

另外一種`...`運算子是迭代器的另一種機制，它有兩種對稱形式展開(spread)與其餘(rest)。

在JS當中有兩種可能性需要用到展開:陣列或者作為傳遞參數用，看看下面例子:

```javascript
// 將迭代器展開傳遞進陣列中，迭代的value都會儲存於vals當中。
var vals = [ ...it ];

// 將迭代器展開傳遞進函式中，迭代的value會作為參數傳遞。
doSomethingUseful( ...it );
```

`...`的展開形式都遵循迭代器協定(與for..of)相同，以從迭代器中檢索所有可用值並將其放置(展開)到接收上下文中(陣列，或作為參數傳遞)。
