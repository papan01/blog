---
title: "You don't know JavaScript Yet:#8 變數神秘的生命週期"
date: "2020-03-06"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在前面的幾個章節中，我們曾經提到了關於「提升」(hoisting)與「TDZ」(Temporal Dead Zone)等名詞，但一直未對這些名詞有詳細的說明
，而變數的生命週期與這兩個名詞息息相關，裡面隱藏了許多細節，我們將在這章探討當變數被創建到可以被使用的整個過程。

## 可以使用變數的時間點

變數在什麼時候可以於範疇中使用?我想很直覺的，多數人的答案可能會是:當變數被宣告或者創建後就可以使用，但實際上並非那麼單純。
考慮以下程式碼:

```javascript
greeting();
// Hello!

function greeting() {
    console.log("Hello!");
}
```

上面這段程式碼再平常不過了，你也一定有寫過類似的程式碼，它可以正常的執行，但你是否有想過為什麼宣告在執行之後卻能夠正常的執行呢?
在[範疇](/archives/2020-01-31-you-dont-know-js-yet-4)這一章節談論到，範疇在編譯期就已經被決定好，所有的識別字都會在此時註冊於範疇中。除此之外，在每次進入範疇時，所有的識別字都被創建於範疇的開頭，即使變數被宣告於範疇中最下面的地方，依舊會在編譯期被合法的創建於範疇開頭，而這有一個術語稱為**提升(Hoisting)**。

但只單靠hoisting依舊無法解釋為什麼`greeting()`可以在宣告前就被呼叫，也就是說我們無法解釋`greeting`的值(function reference)是如何被賦予的，答案是因為函式宣告比起其他變數有一個特別的特徵稱為*function hoisting*。當函式的識別字被宣告於範疇的開頭時，會自動的初始化其function reference，這就是為什麼我們可以在整個範疇中使用函式的原因。

這裡有一個重點，*function hoisting*與透過`var`宣告的識別字進行hoisting的動作時，都會與最近的函式範疇連結(如果沒有函式範疇，則會與全域連結)，而不是區塊範疇。

[[info]]
|使用`let`或者`const`仍然會被hoist(但行為上與`var`有些差異，詳細將會在後面介紹TDZ時說明)，但是這兩種宣告會與最近的區塊範疇連結，而非函式範疇(這將會在下一章中介紹)。

### Hoisting: 函式宣告 vs. 函式表達式

*Function hoisting*只適用於[函式宣告](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)而不適用於[函式表達式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function):

```javascript
greeting();
// TypeError

var greeting = function greeting() {
    console.log("Hello!");
};
```

上面的第一行就會拋出一個`TypeError`，在這個Error中隱藏許多訊息。`TypeError`表示我們嘗試去做某件事但不被允許，根據執行的JS環境會有不同的錯誤訊息，例如在node環境下執行會拋出`TypeError: greeting is not a function`。注意到這裡並不是拋出`ReferenceError`，JS並沒有告訴我們它沒有找到`greeting`這個識別字，而是告訴我們它有找到`greeting`，但在此時`greeting`還未持有function reference，所以只能使用透過函式宣告的識別字，非函式都會拋出錯誤。

那麼此時的`greeting`是什麼呢，我們將上面程式碼改成如下

```javascript
console.log(typeof greeting);
// undefined

var greeting = function greeting() {
  console.log('Hello!');
};
```

實際上在透過`var`宣告的變數都會被初始化為`undefined`，一但初始化之後就可以被使用(進行賦值或者檢索)，所以上面第一行的`greeting`實際上已經存在但未被賦值，直到第四行透過函式表達式賦值後才有function reference。

根據上面我們可以歸納如下:

- 一個`function`宣告在其被提升的同時也進行賦予function reference的動作(*function hoisting*)。
- 透過`var`宣告的變數被提升時，都會被初始化為`undefined`。
- 對一個變數使用函式表達式進行賦值時，直到執行期才會將其function reference賦予變數。

## Variable Hoisting

在上面我們討論過了關於*function hoisting*的部分，接著來看看*variable hoisting*的行為:

```javascript
greeting = "Hello!";
console.log(greeting);
// Hello!

var greeting = "Howdy!";
```

前面已經提過`var`所宣告的變數會被提升到該範疇的開頭，所以不難想像會有這種結果，在編譯期，識別字`greeting`被提升並且賦予`undefined`，到了執行期第一行程式就可以合法地進行賦值。

## 從另一個角度看Hoisting

考慮上面那段程式碼，我們可以換個角度來看，想像成JS在執行前會重寫程式碼:

```javascript
var greeting;           // hoisted declaration
greeting = "Hello!";    // the original line 1
console.log(greeting);  // Hello!
greeting = "Howdy!";    // `var` is gone!
```

JS在執行前將所有的變數宣告都提升到範疇的開頭，相對的`function`宣告也可以這麼看待，考慮以下程式碼:

```javascript
studentName = "Suzy";
greeting();
// Hello Suzy!

function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;
```

接著經過JS重寫之後:

```javascript
function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;

studentName = "Suzy";
greeting();
// Hello Suzy!
```

透過這樣的整理我們就能把它當作是由上到下逐行執行的程式碼了，這樣對於理解hoisting也有幫助，但實際上JS並不會有重寫程式碼這個動作，
它是透過剖析整個程式碼，配置所有識別字所屬的範疇，再經由範疇來搜尋它們。

## 重複宣告

如果重複宣告變數會有什麼樣的結果呢?看看下面這段程式碼:

```javascript
var studentName = "Frank";
console.log(studentName);
// Frank

var studentName;
console.log(studentName);   // ???
```

若在之前我們未曾看過有關於hoisting的部分，我們通常會認為第二個`var studentName`會重新宣告一次，所以最後的`console.log(studentName)`會是`undefind`，但回顧上面關於hoisting的描述，很顯然的我們可以確定它並不會印出`undefind`而是`Frank`，只要想像前一節的模式將程式碼重寫如下:

```javascript
var studentName;
var studentName;    // clearly a pointless no-op!

studentName = "Frank";
console.log(studentName);
// Frank

console.log(studentName);
// Frank
```

在我寫這系列的第五章中[「第二個隱喻:朋友間的對話」](/archives/2020-02-23-you-dont-know-js-yet-5#第二個隱喻朋友間的對話)曾經有提到，當Compiler遇到已經宣告過的變數，則會選擇忽略它，所以這裡第二個`var studentName`會直接被忽略。

這裡有一個重點，`var studentName`不代表`var studentName = undefind`，這是很多人容易誤解的地方，只有當Compiler第一次遇到這個變數時，會自動將其初始化為`undefind`，之後都選擇忽略，看看下面程式碼:

```javascript
var studentName = "Frank";
console.log(studentName);   // Frank

var studentName;
console.log(studentName);   // Frank <--- still!

// let's add the initialization explicitly
var studentName = undefined;
console.log(studentName);   // undefined <--- see!?
```

在一次的我們重寫這段程式碼就能夠清楚說明這點:

```javascript
var studentName;
var studentName;
var studentName;

studentName = "Frank";
console.log(studentName);
// Frank
console.log(studentName);
// Frank
studentName = undefined;
console.log(studentName);
// undefined
```

從上面的結論來看透過`var`重複宣告會直接被忽略，再看看若是`function`也會有一樣的結果:

```javascript
var greeting;

function greeting() {
    console.log("Hello!");
}

// basically, a no-op
var greeting;

typeof greeting;        // "function"

var greeting = "Hello!";

typeof greeting;        // "string"
```

第一個`var greeting`為首次宣告，所以會被自動初始化為`undefind`，接著`function`宣告會直接將其function reference賦予給`greeting`，接著第二個`var greeting`會被忽略，最後的`var greeting = ..`則會進行賦值的動作。

接著來看看`let`:

```javascript
let studentName = "Frank";

console.log(studentName);

let studentName = "Suzy";
```

這段程式碼不會成功的執行，會拋出`SyntaxError`，因為`let`是不允許重複宣告的，會打印出類似`studentName has already been declared`的錯誤訊息，取決於你的JS環境。除此之外，如果使用`let`與`var`進行重複宣告依舊是不合法的:

```javascript
var studentName = "Frank";

let studentName = "Suzy";
```

或

```javascript
let studentName = "Frank";

var studentName = "Suzy";
```

都會拋出`SyntaxError`，至於為什麼`var`可以允許重複宣告而`let`不行呢，實際上本來`let`也是可以的，但決定這件事的TC39委員們認為重複宣告是一種不良的習慣，它可能會引發許多Bug，所以決定在ES6引入`let`時決定不讓它允許重複宣告。

再來看看`const`，它就像是受約束的`let`，可想而知它也不允許重複宣告。`const`還有一些約束成為它不能被重複宣告的原因:

- 使用`const`進行宣告必須要賦予初始值。
- 透過`const`宣告的變數不被允許重新賦值。

首先若我們使用`const`進行宣告而不給予初始值，則會拋出`SyntaxError`:

```javascript
const empty;   // SyntaxError
```

若進行重新賦值的動作則會拋出`TypeError`:

```javascript
const studentName = "Frank";
console.log(studentName);
// Frank

studentName = "Suzy";   // TypeError
```
[[warning]]
|這裡要注意到`SyntaxError`與`TypeError`之間差異，這常容易被忽略。`SyntaxError`會在編譯期拋出，意思就是程式還沒執行前就拋出Error，而`TypeError`則是程式已經執行後，遇到錯誤才拋出，所以上面那段程式碼會先打印出`Frank`，等到對`studentName`進行賦值時才會拋出`TypeError`。

所以`const`宣告必須對其初始化與不允許重新賦值的特性也導致它不被允許重複宣告，反過來說，`const`若要重複宣告則必須要能夠重新賦值，但這對它來說是不合法的:

```javascript
const studentName = "Frank";

// obviously this must be an error
const studentName = "Suzy";
```

### Loop

在迴圈中使用宣告會有重複宣告的問題嗎，來看看下面的例子:

```javascript
var keepGoing = true;
while (keepGoing) {
    let value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

上面的`value`算重複宣告嗎?這樣會導致`SyntaxError`嗎?實際上不算重複宣告所以也不會拋出Error。每次一次進入`while`區塊都是一個新的範疇，而在前面有提到`let`會與最近的區塊範疇連結，`value`是屬於在該範疇當中的識別字，當範疇被實例化`value`也只會被宣告一次，因此不會構成重複宣告。但若是`var`呢?

```javascript
var keepGoing = true;
while (keepGoing) {
    var value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

這會是重複宣告嗎?答案也不是。前面有提到`var`會與最近的函式範疇連結，若沒有函式範疇則會與全域範疇連結，所以在這裡它會與`keepGoing`屬於同一個範疇(這裡為全域範疇)，所以也不存在重複宣告的問題。

在來看看`for`迴圈中的行為:

```javascript
for (let i = 0; i < 3; i++) {
    let value = i * 10;
    console.log(`${ i }: ${ value }`);
}
// 0: 0
// 1: 10
// 2: 20
```

`value`類似於上面的情況，這裡的重點是`i`，它屬於重複宣告嗎?
 
## 未初始化的變數(又稱為TDZ)