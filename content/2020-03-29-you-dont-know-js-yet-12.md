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

你可能曾經聽過**呼叫堆疊(call-stack)**，可以想像它是由許多execution context所堆疊而成的stack，會根據我們目前執行到哪一步驟程式碼進行pop或push，所以它會紀錄當前是哪個函式被執行，我們關心的呼叫點就是當前要被執行的函式它是被誰給呼叫的。

![call-stack-1](/static/images/call-stack-1.png)
<figcaption><em>Call Stack(https://thepracticaldev.s3.amazonaws.com/i/mtsdy5lyka61ksrrzeww.png)</em></figcaption>

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

`baz()`是我們當前要執行的函式，所以它會被放到呼叫堆疊中，此時呼叫點為全域範疇，因為`baz()`是在全域範疇中被呼叫的，接著在`baz()`中又呼叫了`bar()`，所以當進入到`bar()`中時，呼叫點就變為`baz`，以此類推下去。但我們很難透觀察將這些關係一眼就映射到大腦中，且也有可能出錯，另一個比較好的方式是使用Debug Tool來分析，下圖是我使用Chrome DevTools將上面的例子設定一個中斷點，通常我們可以設在最內層也就是`foo()`當中，藉此觀察其呼叫堆疊:

![call-stack-2](/static/images/call-stack-2.png)

通常呼叫點會是你當前停留函式的上一個，從上圖的Call Stack來看，`foo()`的呼叫點就是`bar`。

## 規則

前面介紹完呼叫點後，接著我們來看看呼叫點是如何決定當函式執行期間`this`會指向何處。

在下面將會介紹四種不同的規則，我們需要觀察呼叫點後選擇哪一種規則適用當前情況，在介紹完規則之後，會再說明它們的優先順序。

### 預設綁定(Default Binding)

第一種規則為最常見的狀況，從字面上的意思顯而易見的可以知道它的優先權最低，也就是在另外幾種規則都沒發生的情況下，就會是這個預設的規則。

考慮以下程式碼:

```javascript
function foo() {
    console.log( this.a );
}

var a = 2;

foo(); // 2
```

直接單獨的呼叫程式碼，此時的`this`在默認情況下是直接指向全域範疇(或者全域物件)，所以在全域範疇中透過`var`定義變數等同於在全域範疇中加入屬性，上面的`console.log( this.a )`若在browser環境下可以替換成`console.log( window.a )`，這是最單純的預設綁定。

但若在這裡使用嚴格模式(strict mode)，則這個預設的規則屬於不合法的，此時會拋出`TypeError`:

```javascript
function foo() {
    "use strict";

    console.log( this.a );
}

var a = 2;

foo(); // TypeError: `this` is `undefined`
```

但這個限定必須是`foo`裡的內容涵蓋於嚴格模式中，若是以下程式碼這種情況，則不在這限制範圍:

```javascript
function foo() {
    console.log( this.a );
}

var a = 2;

(function(){
    "use strict";

    foo(); // 2
})();
```

不過在現代ES modules廣泛使用的情況下，因為ES modules預設就是嚴格模式，若未進行`this`的綁定，基本上都會拋出`TypeError`。

### 隱性綁定

第二個規則在於呼叫點是否經由一個物件，考慮以下程式碼:

```javascript
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2,
    foo: foo
};

obj.foo(); // 2
```

首先`foo()`是先宣告後才加到`obj`物件的屬性中，無論是直接在`obj`中宣告函式或者是像上面一樣先宣告後加入，`obj`都不會"真正"的擁有或者包含這個函式。

這裡的呼叫點透過`obj`參考函式`foo`，在呼叫函式`foo()`的這段時間，我們可以說`obj`在"此時此刻"擁有或者包含函式`foo`。前面有說過，`this`會根據被呼叫的狀況而有所不同，在這個例子中，`foo()`被呼叫的同時，它會賦予物件`obj`的reference，而隱性綁定的規則在於，若它經由一個物件的reference，物件將被綁定於函式呼叫中的`this`，所以上面例子中的`this.a`也等同於使用`obj.a`。

但這裡要注意的是，只有物件屬性鏈的最後一層會影響到`this`或呼叫點:

```javascript
function foo() {
    console.log( this.a );
    console.log( this.b );
}

var obj2 = {
    a: 42,
    foo: foo
};

var obj1 = {
    a: 2,
    b: 3,
    obj2: obj2
};

obj1.obj2.foo();
// 42
// undefined
```

#### 隱性丟失(Implicitly Lost)

在某些情況下，隱性綁定會有丟失的情況，此時`this`就會退回到預設綁定，之後就根據是否在嚴格模式中將`this`指向全域範疇或者拋出`TypeError`:

```javascript
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2,
    foo: foo
};

var bar = obj.foo;

bar(); //undefined
```

這裡`bar`被賦予`obj.foo`的reference，但實際上這跟直接賦予它`foo`而不透過`obj`沒什麼區別，所以這裡必需判斷其行為是預設綁定。

再看看一個類似的例子:

```javascript
function foo() {
    console.log( this.a );
}

function doFoo(fn) {
    // `fn` is just another reference to `foo`

    fn(); // <-- call-site!
}

var obj = {
    a: 2,
    foo: foo
};

var a = "oops, global"; // `a` also property on global object

doFoo( obj.foo ); // "oops, global"
```

這裡將`obj.foo`作為參數傳遞給`doFoo(..)`是類似的情況，`foo()`中的`this`一樣遵循著預設綁定。

上述這種情況導致丟失`this`是相當常見的，這也是`this`容易造成混淆的其中一種原因，像上面這種callback函式的用法已經證明了我們無法控制函式的reference該如何被執行，也就是你無法傳遞一個函式的reference並讓它伴隨著綁定某個物件一起被傳遞，所以接下來將會看到另外一種方式用來固定`this`以解決這個問題。