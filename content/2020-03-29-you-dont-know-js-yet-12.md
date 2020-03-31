---
title: "You don't know JavaScript Yet:#12 令人頭疼的this"
date: "2020-03-29"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在學習JS中，`this`絕對是數一數二令人困惑的部分，不論是新手或是老手，相信很多人很難正確的解釋`this`究竟是什麼。在我寫這篇文章的同時，我也屬於那個不會解釋`this`的新手，所以在這篇文章當中，我將記錄下我觀看[You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/this%20%26%20object%20prototypes)前兩章談論`this`的筆記。

[[info]]
|由於在編寫這篇文章的同時，原文正在改版之際，還沒有這冊的第二版，所以這篇文章先以第一版的內容為主，之後第二版出了再進行修改。

## 混淆之處

在開始解釋`this`之前，我們先來談論幾個容易誤解`this`的部分。

由於`this`這個關鍵字不僅只在JS中被使用，在其他程式語言中也有它的蹤影，所以若已經學過其他程式語言的開發人員，很容易將`this`的概念直接轉移到JS上。另外由於`this`這個字本身的意思也容易讓開發人員直接按照字面意思想像它是什麼。

底下將討論兩個`this`容易被誤解成的東西:

### `this`指向其函式本身

在JS中，所有函式都是物件，這容易讓人以為在函式中使用`this`就代表指向其函式本身，但這樣的說法其實不太正確，讓我們用例子來證明:

```javascript
function foo(num) {
    console.log( "foo: " + num );

    // keep track of how many times `foo` is called
    this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
    if (i > 5) {
       foo(i);
    }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 0 -- WTF?
```

為什麼最後的`foo.count`的結果會是`0`呢?理當說我們確實有在迭代中執行了四次`this.count++`才對，且在`foo.count = 0`這段程式碼上我們也確實替它加上了`count`這個屬性，但實際上函式中的`this`並未指向函式本身，即使它使它們擁有相同的名稱`count`，但它們分別指向不同的地方(詳細的解釋會在後面說明)，所以容易誤會的原因就是如此。

有些開發人員遇到這問題時，選擇透過另外一種方式試圖解決它，而逃避面對`this`運作的根本原理，透過建立一個物件來保存`count`屬性:

```javascript{5,8-10}
function foo(num) {
    console.log( "foo: " + num );

    // keep track of how many times `foo` is called
    data.count++;
}

var data = {
    count: 0
};

var i;

for (i=0; i<10; i++) {
    if (i > 5) {
       foo( i );
    }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( data.count ); // 4
```

這當然算是一種解決方式，但依舊還是不了解`this`是怎麼運作的。

要在函式中引用其自己本身，透過`this`通常沒辦法做到，但可以透過函式的識別字來指向它自己:

```javascript
function foo() {
    foo.count = 4; // `foo` refers to itself
}

setTimeout( function(){
    // anonymous function (no name), cannot
    // refer to itself
}, 10 );
```

上面有識別字的函式稱為**具名函式(named function)**，而下面傳遞給`setTimeout`一個沒識別字的函式稱為**匿名函式(anonymous function)**，`foo`由於它有名稱，所以可以直接透過`foo`來訪問其本身。但匿名函式沒有明確的識別字，所以沒有方法可以指向其本身。

根據這個邏輯我們可以把上面的例子改寫成:

```javascript{5, 8}
function foo(num) {
    console.log( "foo: " + num );

    // keep track of how many times `foo` is called
    foo.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
    if (i > 5) {
        foo( i );
    }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 4
```

這樣使用比前面使用物件取代`this`好，不過依然沒正視`this`的問題，為了能用上`this`，我們可以透過`call(..)`強制`foo`指向其本身:

```javascript{7, 18}
function foo(num) {
    console.log( "foo: " + num );

    // keep track of how many times `foo` is called
    // Note: `this` IS actually `foo` now, based on
    // how `foo` is called (see below)
    this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
    if (i > 5) {
        // using `call(..)`, we ensure the `this`
        // points at the function object (`foo`) itself
        foo.call( foo, i );
    }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 4
```

現在還有點混亂沒有關係，在後面會解釋為什麼必須要這樣做才能起作用。

### `this`指向其函式範疇

另一個令人容易誤解的是認為`this`是以某種方式指向其函式範疇，但這是一個棘手的問題，因為這種誤解在某些時候它看似是對的，而在另外一種意義上又是完全錯誤的。但還是要澄清一下，`this`無論如何都不代表它指向函式範疇，雖然範疇有點像是一個物件，能讓我們對其所擁有的屬性(範疇內的變數)進行訪問，但在JS中，我們無法透過程式碼表明要指向這個範疇的物件，範疇的掌控權是在JS engine手上。

## 那麼什麼是`this`

在第三章中的[「關鍵字this」](/archives/2020-01-07-you-dont-know-js-yet-3#關鍵字this)曾經有短暫提到關於`this`，當時曾經說過`this`會根據函式被呼叫的方式而有所不同。當一個函式被呼叫時，會創建一個名為"execution context"的東西，裡面會儲存跟這個函式有關的一些訊息，例如函式在哪裡被呼叫、函式如何被呼叫以及它擁有哪些變數等等。而execution context其中的一個屬性就是`this`的reference，在函式運行時可以透過`this`關鍵字暴露給函式使用。但`this`不是這短短幾句話就能解釋清楚的，下面將會一步一步慢慢的釐清`this`究竟是什麼，以及該如何用它，首先我們將先談論當函式被呼叫時，`this`完全基於函式是如何被呼叫的(call-site)。

## 呼叫點(Call-site)

`this`會在每次函式被呼叫時，與函式建立綁定的動作，所以要了解`this`如何綁定就必須先暸解**呼叫點(call-site)**，而呼叫點在乎的是函式被呼叫的地方，而不是它宣告的地方。

你可能曾經聽過**呼叫堆疊(call-stack)**，可以想像它是由許多execution context所堆疊而成的stack，會根據我們目前執行到哪一步驟程式碼進行pop或push，所以它會紀錄當前是哪個函式被執行，所以我們關心的呼叫點就是這個當前要被執行的函式之前。

考慮以下程式碼:

```javascript
function baz() {
    // call-stack is: `baz`
    // so, our call-site is in the global scope

    console.log( "baz" );
    bar(); // <-- call-site for `bar`
}

function bar() {
    // call-stack is: `baz` -> `bar`
    // so, our call-site is in `baz`

    console.log( "bar" );
    foo(); // <-- call-site for `foo`
}

function foo() {
    // call-stack is: `baz` -> `bar` -> `foo`
    // so, our call-site is in `bar`

    console.log( "foo" );
}

baz(); // <-- call-site for `baz`
```

