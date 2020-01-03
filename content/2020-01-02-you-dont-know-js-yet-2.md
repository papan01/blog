---
title: "You don't know JavaScript Yet:#2 概觀JS"
date: "2020-01-02"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

這是我閱讀[You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)的讀書筆記，
這章節主要的內容在講述值、型別、函數、比較等等，這不算是一個「JS入門」的章節，所以不會有太多詳細的介紹，
更多是稍微提到或者是點醒讀者一些可能認知上的誤解。

## 值(Values)

值的概念有一點抽象，它是程式中最基本的單元，它可以是數字或者字串甚至是幾何學上的一個點。
值可以用兩種形式表現:**原始值(Primitive Values)**與**物件(Object)**。

簡單的例子:

```javascript
console.log("我的名子叫Papan01");
console.log(23);
```

從上面的例子來看`"我的名子叫Papan01"`與`23`就是原始值，語意上就是原始定義的值，它們無法被改變，例如`2`你不能讓它指定變成`3`或者在程式的別的地方又創造一個`2`。

我們在表示字串的時候可以使用`"`或者`'`來圍住它，選擇其中一個並且在你的程式中保持一致性，有助於日後的維護與可讀性。
還有另外一種就是當你想在你的字串中穿插變數，你可以使用`` ` ``並且搭配`${..}`，考慮以下的例子:

```javascript
const name = "Papan01";
console.log("我的名子叫${name}")
//我的名子叫${name}

console.log("我的名子叫${name}")
//我的名子叫${name}

console.log(`我的名子叫${name}`)
//我的名子叫Papan01
```

這稱之為內插(Interpolation)，但盡量是在你有必要進行內插時使用`` ` ``，平常時還是`"`或`'`擇一使用(取決於你整個專案，記得保持一致性)。

還有其他的原始值像是布林(booleans)與數值(numbers)。

```javascript
while(false) {
  console.log(3.141592);
}
```

`while`的條件式為`false`所以它永遠不會進入迴圈，布林值所表示的就是`false`以及與之相反的`true`。

上面的`3.141592`就是數值，而這個就是廣為人知在數學上的PI，我們也可以用預先定義好的`Math.PI`來代替它，還有另外一種變種的數值稱為`bigint`(big-integer)，這是用來儲存較大的數字用的(可以存大於2的53次方以上的數值，原本的number的最大值就為2的53次方)。

除了字串、布林與數值外，還有另外兩種原始值在JS當中:`null`與`undefined`，這兩個有些不同，但多數情況下表示它們是空值(或者不存在)的意思。
許多工程師把它們當作相同的東西，多數情況下沒有什麼問題，但最安全的方式還是只使用`undefined`來作為空值的表現。

```javascript
while(value != undefined) {
  console.log(`接收到值:${value}`);
}
```

最後一種原始值稱為Symbol，它是一種特殊用途的值，它通常拿來做為物件中的特殊key值。

```javascript
hitchhikersGuide[Symbol("foo")];
```

平常我們不會使用到Symbol，只有在開發一些比較low-level的libraires或者frameworks時才可能需要用到。

### 陣列(Arrays)和物件(Objects)

JS中的陣列可以包含任何型態的值，無論是原始值或者是物件，並且有順序的方式儲存:

```javascript
names=["Frank","Kyle","Peter","Susan"];
names.length; //4
names[0]; //Frank
names[1]; //Kyle
```

而物件與陣列類似，但它沒有順序之分，且在存取時，使用的是一個key或者property的名稱而並非像陣列一樣用數字作為索引:

```javascript
name = {
  first: "Louis",
  last: "Peng",
  age: "31"
  specialties:["basketball"]
}
console.log(`My name is ${name.first})
```

除了像上面那種方式使用`name.first`存取資料以外，我們也可以使用`name[first]`達到同樣的效果。

### 型別(Types)

為了區別這些值，可以使用`typeof`來判斷它的型別是原始值(primitive)或者物件(object)或者是其他種類型:

```javascript
typeof 42;                  // "number"
typeof "abc";               // "string"
typeof true;                // "boolean"
typeof undefined;           // "undefined"
typeof null;                // "object" -- oops, JS bug!
typeof { "a": 1 };          // "object"
typeof [1,2,3];             // "object"
typeof function foo(){};    // "function"
```

這裡有幾個比較奇怪的地方，`typeof null`得到的卻是object，這是JS的已知BUG，沒有改掉的原因應該是已經存在許久，若改掉可能會導致很多網頁壞掉。
另一個是`typeof function`得到的是function這個比較特別的型別，但function其實也是object的衍生物，但用同樣邏輯看待陣列，`typeof [1,2,3]`得到的卻是
object。

## 變數(Variables)

變數必須在使用前先進行宣告(declared)，可以透過識別字(identifier)來進行宣告，考慮以下這種例子:

```javascript
var name = "Kyle";
var age;
```

`var`這個識別字為其中一種宣告變數的方式，再看看另外一種方式:

```javascript
let name = "Kyle";
let age;
```

使用`let`跟使用`var`有些不同之處，會因為所在的範疇(Scope)而有不一樣的存取限制，看看以下的例子:

```javascript
var adult = true;

if(adult) {
  var name = "Kyle";
  let age = 39;
  console.log("LOL!");
}

console.log(name);
// Kyle
console.log(age);
// Error!
```

在`if`這個範疇裡面有使用`var`宣告的name與使用`let`宣告的age，但在離開了這個範疇之後，name依舊可以從中獲得訊息，但當我們想取得age時，就會拋出錯誤，
這意味著使用`var`它將能再被更大範圍的地方被存取到，我們通常會希望變數在離開宣告的Scope時就被自動清除，當然這不代表`var`毫無用處，我們依舊可以在適當的地方使用它。

接著我們來看看第三種`const`的用法，它與`let`相似，但它必須在宣告時就賦予它一個且在這之後它的值將不能被修改:

```javascript
const myBirthday = true;
let age = 39;
if(myBirthday) {
  age += 1;           // OK!
  myBirthday = false; //Error!
}
```

比較令人困惑的部分是當使用`const`來宣告陣列或者物件時，其內容物是可以被修改的但不能被重新賦予新的值:

```javascript
const actors = [ "Morgan Freeman", "Jennifer Aniston"];
actors[2] = "Tom Cruise"; // OK
actors = [];              // Error!
```

最好的方式是讓`const`只賦予一個簡單的原始值，這樣比較清楚且不會造成日後他人不小心修改到。

[[info]]
| 針對`var`/`let`/`const`，這裡建議使用`let`與`const`就好，盡可能地避免使用`var`。

## 函式(Functions)

函式一詞在不同的地方有不同的意義，例如在FP(Functional Programming)中，其具有精確的數學定義與嚴格的規則。

在JS中，我們把函式視為一種特殊的值，它為了達到某種目的而且可以重複的使用，當我們提供一些input給函式，它會返回一個或多個結果，它看起來如下:

```javascript
function awesomeFunction(coolThings) {
  // ..
  return amazingStuff;
}
```

我們還可以把它存在變數當中:

```javascript
// let awesomeFunction = ..
// const awesomeFuntion = ..
var awesomeFunction = function(coolThings) {
  // ..
  return amazingStuff;
}
```

並不是所有的程式語言都像JS一樣把函式作為一個值並且可以儲存在變數當中。我們也能把函式放進物件當中如同變數一般:

```javascript
var whatToSay = {
  greeting() {
    console.log("Hello!");
  },
  question() {
    console.log("What's you name?");
  },
  answer() {
    console.log("My name is Papan01.");
  }
}

whatToSay.greeting(); // Hello!
```

## 比較運算(Comparisons)

在我們寫JS的時候肯定會用到比較運算，例如`>`、`==`、`===`等等，這小節會把重點放在`===`上。

`===`稱其為嚴格相等(Strict Equality)，我們先來看一些例子:

```javascript
3 === 3.0;              // true
"yes" === "yes";        // true
null === null;          // true
false === false;        // true

42 === "42";            // false
"hello" === "Hello";    // false
true === 1;             // false
0 === null;             // false
"" === null;            // false
null === undefined;     // false
```

JS的嚴格相等通常比較兩邊的值(Value)與型別(Type)是否相同且不允許在比較中進行任何強制轉型(coercion)，
再看看以下的例子:

```javascript
NaN === NaN; // false
0 === -0;    //true
```

- NaN因為它不等於任何值，所以它也不等於自己。
- 0跟-0相等。

這裡建議在比較這個兩個時候，對於`NaN`我們可以使用`Number.isNaN(..)`來進行比較以及面對`0`跟`-0`時使用`Object.is(..)`來進行比較，
你也可以用`Object.is(..)`對NaN進行判斷，可以把`Object.is(..)`當作比`===`更嚴格的`====`👍(當然你不能在程式中使用四個等號)。

```javascript
Object.is(0, ' ');          //false
Object.is(null, undefined); //false
Object.is([1], true);       //false
Object.is(NaN, NaN);        //true
```

再來看幾個例子，當我們使用嚴格相等進行物件、陣列、函式比較時，它又變得沒那麼直觀了:

```javascript
[1,2,3] === [1,2,3]          //false
{ a: 42 } === { a: 42 }      //false
( x => x*2 ) === ( x => x*2 ) //fasle
```

