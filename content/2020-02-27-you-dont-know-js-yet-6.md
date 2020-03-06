---
title: "You don't know JavaScript Yet:#6 範疇鏈"
date: "2020-02-27"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在巢狀範疇中，連接範疇與範疇之間的部分稱為範疇鏈，它定義了如何存取變數以及去哪裡存取變數。在前一章我們有解釋過[語彙範疇](/archives/2020-02-23-you-dont-know-js-yet-5)的部分，若沒看過的朋友可以去看看一下，可以幫助您閱讀這篇。

## 遮蔽(Shadowing)

這裡先開門見山解釋遮蔽(Shadowing)是什麼意思:

- **遮蔽(Shadowing)**: 若在不同的巢狀範疇中有兩個以上相同的識別字(Identifier)，那麼當進行查找時，搜尋到第一個符合的識別字，就會停止搜尋。

讓我們用例子慢慢解釋:

```javascript
var studentName = "Suzy";

function printStudent(studentName) {
    studentName = studentName.toUpperCase();
    console.log(studentName);
}

printStudent("Frank");
// FRANK

printStudent(studentName);
// SUZY

console.log(studentName);
// Suzy
```

首先看到`var studentName = "Suzy"`(line 1)為全域範疇的變數，另外一個相同名稱的變數存在於函式`printStudent(studentName)`參數範疇，而現在的問題是，函式`printStudent(..)`中的`studentName = studentName.toUpperCase()`，`studentName`會是參考全域範疇的變數還是參數範疇中的變數?

當進行查找時，優先從當前範疇開始搜尋，所以函式範疇中未找到`studentName`，接著會往參數範疇(這裡我們使用[參數範疇](/archives/2020-02-23-you-dont-know-js-yet-5#%E5%8F%83%E6%95%B8%E7%AF%84%E7%96%87parameter-scope)概念)尋找，所以在這裡找到了`studentName`，就會停止往上繼續搜尋，所以全域範疇的`studentName`就不會被考慮，我們這邊就稱參數遮蔽(Shadowing)了全域變數。

### 避免遮蔽的技巧

底下將會介紹如何使用全域關鍵字來獲取全域變數避免被遮蔽，但不建議這樣使用，因為容易造成別人閱讀你的程式碼時產生混淆。
看看下面的例子:

```javascript
var studentName = "Suzy";

function printStudent(studentName) {
    console.log(studentName);
    console.log(window.studentName);
}

printStudent("Frank");
// "Frank"
// "Suzy"
```

這邊可以注意到函式裡面參考`window.studentName`，若在`bowser`環境下開發，則可以透過關鍵字`window`來存取全域變數，甚至創建新的變數。

[[info]]
|在我的程式語言學習之路上，看過許許多多的書籍以及網路上的文章，都會建議避免過度依賴全域變數，我想在這裡也是一樣的道理，通常我們都會進行模組化或者物件化之類操作，目的是讓程式碼更容易維護且更容易使人閱讀。

這個小技巧是能適用於`var`或者`function`所進行的宣告，若使用其他的關鍵字則不會產生鏡像的全域物件屬性:

```javascript
var one = 1;
let notOne = 2;
const notTwo = 3;
class notThree {}

console.log(window.one);       // 1
console.log(window.notOne);    // undefined
console.log(window.notTwo);    // undefined
console.log(window.notThree);  // undefined
```

### 非法遮蔽

並非所有遮蔽都是合法的，我們需要注意到的一種情況是`let`可以遮蔽`var`，`var`不能遮蔽`let`:

```javascript
function something() {
    var special = "JavaScript";
    {
        let special = 42;   // totally fine shadowing
        // ..
    }
}

function another() {
    // ..
    {
        let special = "JavaScript";
        {
            var special = "JavaScript";   // Syntax Error
            // ..
        }
    }
}
```

若實際去跑過這個程式，就會拋出`SyntaxError: ... : Identifier 'special' has already been declared`之類的錯誤訊息，造成此結果是因為`var`嘗試"跨越邊界"(這裡我認為可以解釋成無視它所屬的區塊)宣告與`let`宣告相同的名稱，這是不被允許的。

而"禁止跨越"的禁令則存在於每個函式結束的地方，看看以下的範例:

```javascript
function another() {
    // ..
    {
        let special = "JavaScript";

        whatever(function callback(){
            var special = "JavaScript";   // totally fine shadowing
            // ..
        });
    }
}
```

結論: ***`let`可以遮蔽外部範疇由`var`宣告的變數，但反過來則不行，唯一能讓`var`遮蔽外部`let`的方法為在它們中間存在函式區塊。***

## 函式名稱範疇

看看一個簡單的例子:

```javascript
function askQuestion() {
    // ..
}
```

它會宣告一個名為`askQuestion`的函式在其範疇中(這裡為全域範疇)，若用以下這種方式表達呢?

```javascript
var askQuestion = function(){
    // ..
};
```

這會與上面產生一樣的結果，差別在於此變數是透過[函式表達式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)宣告，所以它的定義將不會被"提升(hoist)"。而函式宣告與函式表達式兩者主要的差別在於識別字所產生的行為
，考慮以下例子:

```javascript
var askQuestion = function ofTheTeacher(){
    // ..
};
```

`askQuestion`本身沒什麼問題，它將結束於外部範疇(在此例由於它存在於全域範疇，所以沒有比全域範疇更外面的範疇了)，我們這邊的重點在於`ofTheTeacher`，它也如同其他變數或者函式一般的存在嗎?顯然不是。`ofTheTeacher`作為一個識別字被宣告於它自己當中:

```javascript
var askQuestion = function ofTheTeacher() {
    console.log(ofTheTeacher);
};

askQuestion();
// function ofTheTeacher()...

console.log(ofTheTeacher);
// ReferenceError: 'ofTheTeacher' is not defined
```

這裡造成的結果也屬於一種隱含範疇(Implied Scopes)，類似於前一篇所說的[參數範疇](/archives/2020-02-23-you-dont-know-js-yet-5#%E5%8F%83%E6%95%B8%E7%AF%84%E7%96%87parameter-scope)，它在外部範疇(全域範疇)與函式內部範疇(`function ofTheTeacher() { .. }`中)之間產生了一個隱含範疇，
我們透過下面例子來證明:

```javascript
var askQuestion = function ofTheTeacher(){
    // why is this not a duplicate declaration error?
    let ofTheTeacher = "Confused, yet?";
};
```

因為`let`是不允許重複宣告相同識別字的，但這裡不會產生重複宣告的`SyntaxError`，由此證明它並非存在於函式內部範疇中，在前一個例子我們也證明了它不再外部範疇中。一樣的我們幾乎不會這樣寫程式，所以很少會遇到這種問題，但它卻是幫助我們理解範疇的好例子。

除此之外它還擁有read-only的特性:

```javascript
var askQuestion = function ofTheTeacher() {
    "use strict";
    ofTheTeacher = 42;   // TypeError

    //..
};

askQuestion();
// TypeError
```

嚴格模式中會拋出`TypeError`;而非嚴格模式中依舊會賦值失敗但不會拋出錯誤訊息。

最後我們回到前面的例子:

```javascript
var askQuestion = function(){
   // ..
};
```

這裡的函式表達式是使用匿名的，我們也稱它為**匿名函式**，它沒有識別字所以不會去影響到其他範疇。

## 箭頭函式(Arrow Functions)

箭頭函式為ES6中新增加的一種函式表達式:

```javascript
var askQuestion = () => {
    // ..
};
```

箭頭函式透過`=>`進行定義的動作，不須透過`function`關鍵字。`(..)`中可以帶有參數，如同平常宣告函式一樣，而`{..}`中也是如此，
如果忽略`{..}`的部分，則代表直接回傳一個值，不需透過關鍵字`return`。箭頭函式與匿名函式有些類似的地方，它們都沒有識別字，也就是我們無法直接透過識別字使用它。箭頭函式可以讓語法較為簡潔，但由於它可以使用不同形式來表達(有無`(..)`或者`{..}`)，有時會讓人混亂:

```javascript
() => 42

id => id.toUpperCase()

(id,name) => ({ id, name })

(...args) => {
    return args[args.length - 1];
};
```

這裡會提到箭頭函式的原因是因為有些人認為箭頭函式與標準函式的語彙範疇行為上有所不同，但實際上這句話是錯的，除了箭頭函式是匿名的以外，其他部分與標準函式沒有區別，無論箭頭函式是否帶有`{..}`，內層(巢狀)範疇都與標準函式的行為相同。

## 總結

- 當函式被定義時會產生新的範疇，程式中由許多函式所結合，而這些函式的範疇彼此會產生一種階層的關係，我們稱它為範疇鏈，用來控制變數的存取。
- 遮蔽(Shadowing)是我們較常會遇到的問題，若在不同的範疇中使用了相同的變數名稱，就會有遮蔽的現象。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
- [You don't know JavaScript Yet:#3 深入JS的核心](/archives/2020-01-07-you-dont-know-js-yet-3)
- [You don't know JavaScript Yet:#4 範疇](/archives/2020-01-31-you-dont-know-js-yet-4)
- [You don't know JavaScript Yet:#5 說明語彙範疇](/archives/2020-02-23-you-dont-know-js-yet-5)

