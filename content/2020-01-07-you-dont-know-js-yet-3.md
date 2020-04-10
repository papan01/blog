---
title: "You don't know JavaScript Yet:#3 深入JS的核心"
date: "2020-01-07"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

前兩篇文章講的是在JS中比較height-level的部分，在這篇中將會深入討論JS核心的工作原理。這篇是[You Don't Know JS Yet: Get Started-Digging to the Roots of JS](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/get-started/ch3.md)的閱讀筆記，有更多關於以下議題的討論將放在以後的篇章中。

## 迭代(Iteration)

在程式中處理大量的資料常見的手法就是使用迭代，在JS中的迭代器也如同其他語言一般一直不斷的在進步，底下我們就來看看JS常用的迭代方式。

### ES6 迭代協定

可迭代(iterable)協定允許JS物件定義它們自己的迭代行為，內建的可迭代物件有`String`、`Array`、`Map`與`Set`等等，若自己定義的物件則需要自己實現迭代行為，ES6提供了`Symbol.iterator`屬性，在物件中透過定義`Symbol.iterator`就被認為是一個可迭代的。`Symbol.iterator`本身是一個無參數函式，當我們透過`for..of`時就會執行這個函數並且返回一個迭代器(iterator)。
迭代器協定定義了`next()`這個方法，而`next()`必須回傳一個擁有以下兩個屬性之物件的無參數函式：

- **done(boolean)**:若迭代器已迭代完畢整個可迭代序列，則值為`true`。在這個情況下value可以是代表迭代器的回傳值。若迭代器能夠產出序列中的下一個值，則值為`false`。相當於完全不指定`done`屬性。
- **value**: 任何由迭代器所回傳的值。可於`done`為`true`時省略。

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

另外一種`...`運算子是迭代器的另一種機制，它有兩種對稱形式展開(spread)與其餘(rest)。

在JS當中有兩種可能性需要用到展開:陣列或者作為傳遞參數用，看看下面例子:

```javascript
// 將迭代器展開傳遞進陣列中，迭代的value都會儲存於vals當中。
var vals = [ ...it ];

// 將迭代器展開傳遞進函式中，迭代的value會作為參數傳遞。
doSomethingUseful( ...it );
```

`...`的展開形式都遵循迭代器協定(與for..of相同)，以從迭代器中檢索所有可用值並將其放置(展開)到接收上下文中(陣列，或作為參數傳遞)。

接著我們還看看內建的物件是如何進行迭代的，陣列就如同上述一般沒有什麼問題，字串則可直接使用`for..of`遍歷或者也可以透過`...`運算子進行操作:

```javascript
const greeting = "Hello world!";
const chars = [...greeting]
// [ "H", "e", "l", "l", "o", " ",
//   "w", "o", "r", "l", "d", "!" ]
```

而`Map`是一個透過key來獲取值的資料結構，它的迭代方式稍有不同，看看以下的範例:

```javascript
// given two DOM elements, `btn1` and `btn2`

var buttonNames = new Map();
buttonNames.set(btn1,"Button 1");
buttonNames.set(btn2,"Button 2");

for (let [btn,btnName] of buttonNames) {
    btn.addEventListener("click",function onClick(){
        console.log(`Clicked ${ btnName }`);
    });
}
```

這裡我們透過`[btn,btnName]`(這也稱為"array destructuring")來獲取一對key(鍵)/value(值)(`btn1`/`Button 2`, `btn2`/`Button 2`)接著就能簡單地進行操作了;若只需要值，我們可以透過`values()`
來獲取值的部分就好:

```javascript
for (let btnName of buttonNames.values()) {
    console.log(btnName);
}
// Button 1
// Button 2
```

有時候進行陣列迭代我們需要得到index，這時我們可以使用`entries()`:

```javascript
var arr = [ 10, 20, 30 ];

for (let [idx,val] of arr.entries()) {
    console.log(`[${ idx }]: ${ val }`);
}
// [0]: 10
// [1]: 20
// [2]: 30
```

在多數情況下，JS中內建的迭代器都具有以下三種迭代行式: keys-only(`keys()`)、values-only(`values()`)與entries(`entries()`)。

## 閉包(Closure)

「閉包是讓函式記住與持續訪問在其範疇之外的變數的一種能力，即使該函式在其他範疇中執行也是如此。」

我們平常在寫程式時一定都有使用過閉包，但可能不是很了解閉包，因為網路上有許多抽象的定義甚至用很正式的學術語言來談論它，但這對我們來說沒有幫助，
所以在這邊我們想給予它一些清楚且具體的定義。

首先看看閉包的兩個特徵:

- 所有的函式都是閉包，而物件則不是。
- 若要觀察閉包，我們需要在與最初定義該函式不同範疇之下，執行該函式。

看看以下例子:

```javascript
function greeting(msg) {
    return function who(name) {
        console.log(`${ msg }, ${ name }!`);
    };
}

var hello = greeting("Hello");
var howdy = greeting("Howdy");

hello("Kyle");
// Hello, Kyle!

hello("Sarah");
// Hello, Sarah!

howdy("Grant");
// Howdy, Grant!
```

`greeting(..)`會回傳函式`who(..)`的一個實例，`who(..)`中有使用了`greeting(..)`的參數`msg`，當我們第一次執行`greeting(..)`後，將會把參數`msg`的reference分配給`hello`變數，第二次呼叫同理。

當`greeting(..)`呼叫完畢後我們通常希望垃圾回收機制能幫我們把所有變數從memory中清除掉，但在上面的例子中`msg`並沒有被清掉，這就是閉包的功能。此時在`hello`與`howdy`中的`msg`與當初賦予它們的`msg`具有相同的reference，也就是`greeting(..)`範疇的reference，所以實際上這些變數是直接被保留下來的。

再看看另外一個例子:

```javascript
function counter(step = 1) {
    var count = 0;
    return function increaseCount(){
        count = count + step;
        return count;
    };
}

var incBy1 = counter(1);
var incBy3 = counter(3);

incBy1();       // 1
incBy1();       // 2

incBy3();       // 3
incBy3();       // 6
incBy3();       // 9
```

所有`increaseCount()`都共用了`count`且在每次執行時會獲取當前`count`並且更新計數，因為它們是相同的reference，而`step`則作為參數各自獨立。

上面兩個例子的外部範疇都是一個函式，但實際上不一定要是函式，只要外部範疇至少有一個變數是被內部函式存取就好。

```javascript
for (let [idx,btn] of buttons.entries()) {
    btn.addEventListener("click",function onClick(evt){
       console.log(`Clicked on button (${ idx })!`);
    });
}
```

每次迭代都為`btn`增加點擊事件，其中`onClick`使用了外部變數`idx`，儘管`idx`使用`let`宣告，但實際上`onClick`已經保留了`idx`的值了，所以每次點擊都能夠獲取到當前button的index，此行為與前面的閉包是一樣的邏輯。

閉包在任何語言中被普遍的運用且是編程模式中重要的一環，在[You Don't Know JS Yet: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md)專門討論範疇與閉包，若有不清楚的地方可以先去看看，我會在往後補上該冊的筆記。

## 關鍵字`this`

在我看到這部分之前，我對`this`的觀念跟書上說的一樣，將其他語言的`this`與JS中的`this`混為一談，
最常被誤解的一種就是:函式中的`this`指向其函式本身，另外一種誤解(我原本也那麼認為):方法中的`this`指向其所屬實例，但這兩個都不正確。

在定義函式時，它會將相關的變數通過閉包附加到它的範疇當中，而範疇是用來控制當前函式所有變數的reference。但函式除了範疇之外還有另外一個特徵會影響到它能存取的變數，我們稱其為"execution context"
，它會透過`this`關鍵字暴露給函式。

範疇是靜態的，在我們定義函式的時候就決定要存取哪些變數，但execution context是動態的，完全取決於函式呼叫的方式。

你可以把execution context作為一個有形的物件，它的屬性能提供函式執行時使用。

看看下面的例子:

```javascript
function classroom(teacher) {
    return function study() {
        console.log(
            `${ teacher } wants you to study ${ this.topic }`
        );
    };
}

var assignment = classroom("Kyle");
```

外部函式`classroom(..)`返回一個`study()`的實例，除此之外沒別的了。但內部函式`study()`除了將`teacher`變數透過閉包保存於它的範疇當中外，裡面還使用了`this`關鍵字，
這意味著`study()`已與execution context聯繫。接著我們使用`classroom(..)`將其內部函式配置給`assignment`變數，此時我們執行`assignment`(如同執行`study()`)會發生什麼事呢?

```javascript
assignment();
// Kyle wants you to study undefined  -- Oops :(
```

可以預料到`this.topic`為`undefined`，因為我們未提供任何execution context。由於在執行`assignment`時，找不到當前函式的execution context中有`topic`這個屬性，所以它就會向外去找
global execution context，但依舊沒找到`topic`這個屬性，所以就回傳`undefined`。

```javascript
var homework = {
    topic: "JS",
    assignment: assignment
};

homework.assignment();
// Kyle wants you to study JS
```

我們建立一個`homework`物件，其中把`assignment`作為它的屬性並且執行它，此時`this`表示為執行它的物件`homework`。

```javascript
var otherHomework = {
    topic: "Math"
};

assignment.call(otherHomework);
// Kyle wants you to study Math
```

最後一個例子我們透過呼叫`call(..)`將一個物件(這裡為otherHomework)傳遞給`this`的reference，使其能獲取到`topic`屬性。

從上面這些例子來看，`this`會根據執行時的行為來動態獲取屬性，也因此提供了更好的靈活性使用來自不同物件的數據與功能。

## 原型(Prototype)

假設我們要獲取物件的某個屬性不存在會發什麼事呢?得到的就是`undefined`，而prototype我們可以把它想像是隱藏在物件定義中的一個屬性，
每一個實例都能用獲取它，當物件找不到它要的屬性時，就會去找prototype中有沒有，當然這還會涉及到一個叫原型鏈(prototype chain)的東西。

「原型鏈是將一連串的物件透過prototype連結起來。」

原型鏈的目的是希望能透過prototype去委派其他物件獲取或執行本身沒有的屬性或者方法，來達到共同協作的功能。

```javascript
var homework = {
    topic: "JS"
};
```

`homework`只有`topic`一個屬性，但所有物件預設的prototype都會與物件`Object.prototype`鏈結，其中它有`toString()`與`valueOf()`等方法，
所以看看下面:

```javascript
homework.toString();    // [object Object]
```

當我們執行`toString()`時會先去找`homework`有沒有此方法，但上面我們並沒有定義`toString()`，所以它會繼續往下找進而找到`Object.prototype.toString()`。

### 物件鏈結

要建立物件原形鍊，可以透過`Object.create(..)`來創建:

```javascript
var homework = {
    topic: "JS"
};

var otherHomework = Object.create(homework);

otherHomework.topic;
// "JS"
```

`Object.create(..)`的參數允許輸入一個物件，該物件將會與新創建的物件鏈結，然後返回新創建(並鏈結)的物件。看看下面的關係圖就能清楚地看出它們之間的關聯性:
![YDKJSY-3-1](/static/images/you-dont-know-js-yet-3-1.png)

原型鏈中的屬性只適合用於獲取，若你直接對屬性賦值，則它只會反映在該物件上，不會對其他原型鏈上的其他物件造成影響:

```javascript
homework.topic;
// "JS"

otherHomework.topic;
// "JS"

otherHomework.topic = "Math";
otherHomework.topic;
// "Math"

homework.topic;
// "JS" -- not "Math"
```

但此時otherHomework就會[shadowing](/archives/2020-02-27-you-dont-know-js-yet-6#%E9%81%AE%E8%94%BDshadowing)topic屬性:
![YDKJSY-3-1](/static/images/you-dont-know-js-yet-3-2.png)

### 回頭來看`this`

前面提到`this`是動態的，取決於函式如何執行，而上面物件透過原型鏈委派的方式執行方法，此時`this`也會跟著prototype改變。

```javascript
var homework = {
    study() {
        console.log(`Please study ${ this.topic }`);
    }
};

var jsHomework = Object.create(homework);
jsHomework.topic = "JS";
jsHomework.study();
// Please study JS

var mathHomework = Object.create(homework);
mathHomework.topic = "Math";
mathHomework.study();
// Please study Math
```

`jsHomework`與`mathHomework`都與`homework`鏈結，`jsHomework.study()`委派給`homework.study()`執行，若在其他語言中，此時的`this`可能只會去尋找`homework`中有沒有`topic`這個屬性，
因為`study()`是定義在`homework`之中，但在JS中它依舊能夠找到`jsHomework`中的`topic`，並且合乎預期的執行，這是JS中`this`的動態能力。

## 總結

[You Don't Know JS Yet: Get Started](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/get-started)大致上就差不多到這邊，原文中還有第四章，但那章是在介紹接下來幾冊的導覽。在原文中有兩個附錄:[Appendix A: Exploring Further](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/get-started/apA.md)與[Appendix B: Practice, Practice, Practice!](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/get-started/apB.md)，附錄A有些額外的知識可以去看一下，而附錄B則是作者出一些題目讓我們練習用的，強烈建議你可以去看看附錄B，好讓自己更熟悉一點。這本書看到這邊我依舊還有許多疑問沒有弄清楚，但我想往後看下去會越看越明白，後面幾冊的筆記我會再花時間慢慢補上，希望對您有些幫助。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
