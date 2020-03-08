---
title: "You don't know JavaScript Yet:#8 變數神秘的生命週期"
date: "2020-03-06"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在前面的幾個章節中，我們曾經提到了關於「提升」(Hoisting)與「TDZ」(Temporal Dead Zone)等名詞，但一直未對這些名詞有詳細的說明
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
在[範疇](/archives/2020-01-31-you-dont-know-js-yet-4)這一章節談論到，範疇在編譯期就已經決定，所有的識別字都會在此時就註冊於範疇中。除此之外，在每次進入範疇時，所有的識別字都被創建於範疇的開頭，即使變數被宣告於範疇中最下面的地方，依舊會在編譯期被合法的創建於範疇開頭，而這有一個術語稱為**提升(Hoisting)**。

但只單靠hoisting依舊無法解釋為什麼`greeting()`可以在宣告前就被呼叫，也就是說我們無法解釋`greeting`的值(function reference)是如何被賦予的，答案是因為函式宣告比起其他變數有一個特別的特徵稱為*function hoisting*。當函式的識別字被宣告於範疇的開頭時，會自動的初始化其function reference，這就是為什麼我們可以在整個範疇中使用函式的原因。

這裡有一個重點，*function hoisting*與透過`var`宣告的識別字進行hoisting的動作時，都會與最近的函式範疇連結，而不是區塊範疇。

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

前面已經提過`var`所宣告的變數會被提升到該範疇的開頭，所以不難想像會有這種結果，在編譯期時識別字`greeting`被提升並且賦予`undefined`，到了執行期第一行程式就可以合法地進行賦值。

