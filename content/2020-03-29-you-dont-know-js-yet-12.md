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

這樣比前面使用物件取代`this`好，不過依然沒正視`this`的問題，為了能用上`this`，我們可以透過`call(..)`強制`foo`指向其本身:

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

`baz()`是我們當前要執行的函式，所以它會被放到呼叫堆疊中，此時呼叫點為全域範疇，因為`baz()`是在全域範疇中被呼叫的，接著在`baz()`中又呼叫了`bar()`，所以當進入到`bar()`中時，呼叫點就變為`baz`，以此類推下去。但我們很難透過觀察將這些關係一眼就映射到大腦中，且也有可能出錯，另一個比較好的方式是使用Debug Tool來分析，下圖是我使用Chrome DevTools將上面的例子設定一個中斷點，通常我們可以設在最內層也就是`foo()`當中，藉此觀察其呼叫堆疊:

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

但若在這裡使用嚴格模式(strict mode)，則這個預設的規則屬於不合法的，`this`屬於`undefined`:

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

不過在現代ES modules廣泛使用的情況下，就不需要自己再額外加入`"use strict"`，因為ES modules預設就是嚴格模式。

### 隱性綁定(Implicit Binding)

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

這裡的呼叫點透過`obj`參考函式`foo`，在呼叫函式`foo()`的這段時間，我們可以說`obj`在"此時此刻"擁有或者包含函式`foo`。前面有說過，`this`會根據被呼叫的狀況而有所不同，在這個例子中，`foo()`被呼叫的同時，它會賦予物件`obj`的reference，而隱性綁定的規則在於，若它經由一個物件的reference，物件將被綁定於函式呼叫中的`this`，所以上面例子中的`this.a`也等同於使用`obj.a`。

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

### 顯性綁定(Explicit Binding)

上面的隱性綁定必須將函式的reference作為物件的屬性，然後透過物件呼叫該函式使得`this`能夠與該物件進行綁定。那麼有沒有能夠達到相同目的，但不需要像前面一樣賦予屬性又能綁定`this`呢?。在JS當中，所有的函式都能使用一些方法(透過`Function.Prototype`)，其中`call(..)`、`apply(..)`與`bind(..)`這三種方法可以讓我們進行綁定的動作，它們有一個共同點，就是第一個參數可以傳遞我們想要與`this`綁定的物件，這裡先介紹`call(..)`與`apply(..)`，它們兩個的用途一樣，差別在於後面傳入參數的形式不同而已，看看下面例子:

```javascript
function foo(b, c) {
    console.log( this.a + b + c );
}

var obj = {
    a: 2,
};

foo.call(obj, 3, 4) // 9
foo.apply(obj, [4, 5]) // 11
```

透過這兩個方法，強制`obj`與`foo(..)`中的`this`進行綁定。

如果我們使用原始值(primitive value，例如`string`、`number`或`boolean`)作為第一個參數與`this`進行綁定，那麼這些原始值將被視為透過標準內建物件(`new String(..)`、`new Number(..)`或`new Boolean(..)`)建立，這通常被稱為"boxing"。

```javascript
function foo(b, c) {
    console.log( this + b + c );
}

foo.call(2, 3, 4) // 9
foo.apply(2, [4, 5]) // 11
```

不過只單靠這樣依舊無法解決我們直接呼叫函式時`this`被丟失的問題，但我們可以透過一些小技巧來使其被強制綁定。

#### 強制綁定(Hard Binding)

考慮以下程式碼:

```javascript
function foo() {
    console.log( this.a );
}

var obj = {
    a: 2
};

var bar = function() {
    foo.call( obj );
};

bar(); // 2
setTimeout( bar, 100 ); // 2

// `bar` hard binds `foo`'s `this` to `obj`
// so that it cannot be overriden
bar.call( window ); // 2
```

我們透過宣告一個函式`bar()`將`foo.call(..)`置於其內部中，強制讓`obj`與`this`綁定並且同時呼叫`foo()`，之後不論我們透過什麼方式執行`bar`，`foo()`中的`this`都會與`obj`綁定，我們將這種模式稱為**強制綁定(Hard Binding)**。

透過這種方式我們可以創建一個可以重複使用的函式:

```javascript
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}

// simple `bind` helper
function bind(fn, obj) {
    return function() {
        return fn.apply( obj, arguments );
    };
}

var obj = {
    a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

你可能覺得這個`bind`很熟悉，實際上它就是我們前面提過三個方法的最後一種`bind(..)`，它已於ES5作為函式的內建方法`Function.prototype.bind`，使用方式如下:

```javascript
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}

var obj = {
    a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

需要注意的是，`bind(..)`不同於`call(..)`與`apply(..)`，它會返回與第一個參數綁定的函式，而`call(..)`與`apply(..)`則是直接執行函式。

#### API呼叫經由"context"

許多第三方library或者JS內建的函式都會提供一個可選的參數，這個參數通常稱為"context"，也許你在其他程式碼中也看過類似"`ctx`"的命名，通常這種設計是確保你的callback函式中的`this`能與你輸入的物件進行綁定，而不需要再額外使用`bind(..)`:

```javascript
function foo(el) {
    console.log( el, this.id );
}

var obj = {
    id: "awesome"
};

// use `obj` as `this` for `foo(..)` calls
[1, 2, 3].forEach( foo, obj ); // 1 awesome  2 awesome  3 awesome
```

像上面這個例子可以很容易的猜測在`forEach`的內部使用了`call(..)`或`apply(..)`等顯性綁定，節省我們自己進行綁定的麻煩。

### `new`綁定(`new` Binding)

第四種關於`this`綁定的規則就是透過`new`關鍵字，不過我們必須先釐清`new`在JS中與其他物件導向語言的差別。

在傳統的物件導向語言中，通常類別(class)都會有一個建構子(constructor)，當類別透過`new`實例化時，類別的建構子就會被呼叫:

```javascript
something = new MyClass(..);
```

JS中的`new`基本上也類似於我們看到的那些物件導向語言，所以許多開發人員就直接將其他語言對於`new`機制淺移默化到JS中，但實際上JS使用`new`的機制與物件導向的類別沒什麼關聯，儘管它們的行為看起來很相似。

在JS中，建構子就只是一個當透過`new`實例化某個物件會被執行的函式，這個執行的動作與類別沒什麼區別，但JS的建構子是不依附於類別，且也不是實例化一個類別，建構子就僅僅只是一個單純的函式。

例如ES5.1規範說明當`Number(..)`函式作為一個建構子時:

>15.7.2 The Number Constructor  
When Number is called as part of a new expression it is a constructor: it initialises the newly created object.

這說明不僅僅只有標準內建物件(例如`Number(..)`等)可以透過`new`將其視為建構子，所有的函式只要在前面加了`new`被呼叫時，它都算是一個建構子，且會實例化一個新的物件，這也說明JS與傳統的物件導向不同，JS不存在一個與類別綁定的建構函式。

當我們透過`new`呼叫函式時，下面這幾件事情會被自動執行:

1. 將會創建一個新的物件。
2. 這新的物件會被鏈入原型鏈(prototype chain)(後面章節會談論到)。
3. 這個新的物件將會與函式呼叫的`this`綁定。
4. 除非這個函式本身返回了其他物件，否則這個被`new`呼叫的函式將會自動返回一個新建的物件。

使用例子如下:

```javascript
function foo(a) {
    this.a = a;
}

var bar = new foo( 2 );
console.log( bar.a ); // 2
```

將`new`置於函式呼叫之前，這將會執行上述提到的那幾個步驟，接著返回一個物件的實例。

## 一切皆有顺序

接著我們來談論前面談到四種規則的優先順序，因為它們可能有同時存在的時候。

首先是**預設綁定**，這前面也說過了，它的優先權一定是最低的。

**隱性綁定**與**顯性綁定**哪個優先權高呢?我們可以測試一下:

```javascript
function foo() {
    console.log( this.a );
}

var obj1 = {
    a: 2,
    foo: foo
};

var obj2 = {
    a: 3,
    foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

顯然**顯性綁定**的優先權大於**隱性綁定**。

接著來看看**`new`綁定**:

```javascript
function foo(something) {
    this.a = something;
}

var obj1 = {
    foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a ); // 2

obj1.foo.call( obj2, 3 );
console.log( obj2.a ); // 3

var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4
```

這裡只能確定**`new`綁定**的優先權比**隱性綁定**高，由於`new`無法與`call(..)`或`apply(..)`一起使用，所以我們無法直接這樣比較**`new`綁定**與**顯示綁定**誰的優先權高，但我們可以透過前面提到的**強制綁定**來測試看看。

根據我們前面的邏輯，**強制綁定**(顯性綁定的一種)的優先權應該會比**`new`綁定**來的高才是，讓我們測試看看:

```javascript
function foo(something) {
    this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3
```

`bar`透過`bind(..)`與`obj1`進行綁定的動作，但是`new bar(3)`沒有如我們預期般將`obj1.a`變為`3`，反而是使用`new`呼叫強制綁定的`bar`被覆蓋過去了。

若我們使用前面由我們自己定義的`bind(..)`:

```javascript
function bind(fn, obj) {
    return function() {
        fn.apply( obj, arguments );
    };
}
```

會發現`new`無法覆蓋`bind(..)`而來的強制綁定，這是因為內建的`Function.prototype.bind(..)`實際上做的事情比我們想像還要來得多，下面為MDN網頁上關於`bind(..)`的[Polyfill](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill):

```javascript
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}
```

允許`new`綁定覆蓋強制綁定的部分在於:

```javascript
this instanceof fNOP ? this : oThis,
// ... and:
if (this.prototype) {
    // Function.prototype doesn't have a prototype property
    fNOP.prototype = this.prototype;
}
fBound.prototype = new fNOP();
```

上面這段程式碼相當的複雜，請原諒我還沒搞懂該如何解釋它，根據原文描述，它的意圖在於判斷強制綁定是否是透過`new`來呼叫，如果是，將會創建一個新的物件來替換掉原本`this`所指向的物件。

那麼`new`綁定能覆蓋強制綁定有什麼用處呢?

主要用於創造一個忽略`this`綁定但帶有後面任意數量參數`arg1, arg2, ...`作為一個預先設定的函式。`bind(..)`除了第一個參數是`this`綁定之外，後面參數可以由我們自己掌控，作為當前函式的標準參數(技術上稱為"partial application"，也能稱為柯里化(currying))。

下面就是一個典型的例子:

```javascript
function foo(p1,p2) {
    this.val = p1 + p2;
}

// using `null` here because we don't care about
// the `this` hard-binding in this scenario, and
// it will be overridden by the `new` call anyway!
var bar = foo.bind( null, "p1" );

var baz = new bar( "p2" );

baz.val; // p1p2
```

### 判斷`this`

根據上面的結果，整理一下這四個規則的優先順序:

1. 函式是透過`new`被呼叫的嗎(`new`綁定)?如果是，就會將函式做為建構子，建立一個新的物件並將`this`指向它。  
`var bar = new foo()`
2. 函式是透過`call(..)`或`apply(..)`，甚至是透過`bind(..)`強制綁定後被呼叫的嗎(顯性綁定)?如果是，那麼`this`將指向指定的物件。  
`var bar = foo.call( obj2 )`
3. 函式是透過一個物件被呼叫的嗎(隱性綁定)?如果是，那麼`this`將指向該物件。  
`var bar = obj1.foo()`
4. 若非上述情況，則為預設綁定。如果再嚴格模式下，`this`會是`undefined`，否則就是全域物件(根據JS環境而定)。  
`var bar = foo()`

上面介紹的為正常情況下我們判斷`this`的規則，但...總有例外。

## 綁定的特例

如果我們嘗試在使用`call(..)`、`apply(..)`或`bind(..)`進行`this`綁定時，傳入的是一個`null`或者`undefined`作為綁定的對象，那麼這個綁定就會被忽略，直接變成預設綁定的結果:

```javascript
function foo() {
    console.log( this.a );
}

var a = 2;

foo.call( null ); // 2
```

那麼什麼情況下我們會傳遞`null`或`undefined`呢?假設你的參數存儲於一個陣列當中，你想將其展開傳入給函式，或者想使用柯里化替函式參數設定預設值:

```javascript
function foo(a,b) {
    console.log( "a:" + a + ", b:" + b );
}

// spreading out array as parameters
foo.apply( null, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2, b:3
```

由於`foo(..)`中沒有使用到`this`，所以實際上我們不再乎`apply(..)`與`bind(..)`的第一個參數傳入是什麼，這時就可以使用`null`。另外由於ES6已經有了展開語法(spread syntax)，`apply(..)`的部分其實也可以直接透過下面程式碼替代就好:

```javascript
foo(..[2, 3]);
```

不過傳遞`null`有潛在風險，因為若函式中確實使用了`this`，而此時它會退化到預設綁定，好死不死全域物件又有相同名稱的屬性，那麼這就變成非預期的情況，除非你本來就打算使用全域物件中的屬性。當這種情況發生時，是很難debug的。

為了解決這個問題，我們為`this`傳遞一個事先建立好的特殊物件，並且保證它不產生副作用。在數學中會將`ø`視為空集合，我們就借用它作為我們的特殊物件:

```javascript
function foo(a,b) {
    console.log( "a:" + a + ", b:" + b );
}

// our empty object
var ø = Object.create( null );

// spreading out array as parameters
foo.apply( ø, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```

透過`Object.create( null )`建立一個空的物件，它與`{}`相似，但少了委派指向`Object.prototype`的部分，所以空的更徹底。

### 間接

另外一種例外是間接的(無論是有心還是無心)引用了函式，那麼這函式就會退回到預設綁定:

```javascript
function foo() {
    console.log( this.a );
}

var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };

o.foo(); // 3
(p.foo = o.foo)(); // 2
p.foo(); // 4
```

`p.foo = o.foo`進行賦值的動作，此時這個賦值表達式的結果值只是一個指向底層函式物件的reference，所以此時受影響的呼叫點是`foo()`，而非`p.foo`或者`o.foo`，所以在這瞬間是退化到預設綁定的情況。

### 軟化綁定(Softening Binding)

前面有看過強制綁定，透過建立一個額外的函式強制將物件與`this`綁定，避免函式在被呼叫時不經意的退化到預設綁定，但這也會導致靈活度降低，因為這會阻止我們手動使用預設綁定或顯性綁定覆蓋`this`。所以這裡將介紹一個能夠為預設綁定提供一個預設值又能讓我們彈性的使用顯性綁定或隱性綁定的方法:

```javascript
if (!Function.prototype.softBind) {
    Function.prototype.softBind = function(obj) {
        var fn = this,
            curried = [].slice.call( arguments, 1 ),
            bound = function bound() {
            return fn.apply(
                (!this ||
                    (
                        typeof window !== "undefined" && this === window) ||
                        (typeof global !== "undefined" && this === global)
                    ) ? obj : this,
                    curried.concat.apply( curried, arguments )
                );
            };
        bound.prototype = Object.create( fn.prototype );
        return bound;
    };
}
```

這與`bind(..)`的原程式碼有點類似，我們透過檢查`this`，當它為`undefind`或者全域物件(`window`或`global`，根據JS環境)時，就讓`this`指向預設的物件，它也提供前面提過的柯里化:

```javascript
function foo() {
   console.log("name: " + this.name);
}

var obj = { name: "obj" },
    obj2 = { name: "obj2" },
    obj3 = { name: "obj3" };

var fooOBJ = foo.softBind( obj );

fooOBJ(); // name: obj

obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2   <---- look!!!

fooOBJ.call( obj3 ); // name: obj3   <---- look!

setTimeout( obj2.foo, 10 ); // name: obj   <---- falls back to soft-binding
```

## 當箭頭函式碰到`this`

ES6的箭頭函式(arrow function)不適用於我們上述所講的四種規則，它裡頭的`this`會與包覆它的函式範疇或者全域範疇裡的`this`相同。

看看下面的範例:

```javascript
function foo() {
    // return an arrow function
    return (a) => {
        // `this` here is lexically adopted from `foo()`
        console.log( this.a );
    };
}

var obj1 = {
    a: 2
};

var obj2 = {
    a: 3
};

var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, not 3!
```

`foo.call( obj1 )`返回一個箭頭函式`bar`，接著將`obj2`進行顯性綁定，但結果依然為`2`，因為`foo()`範疇中的`this`已經與`obj1`綁定，而這如同閉包(closure)般使得返回的箭頭函式也受其影響，此時無論透過哪種方式都無法覆蓋箭頭函式中的`this`，即使透過`new`也一樣。

在ES6之前，就有類似的做法能夠達到一樣的效果:

```javascript
function foo() {
    var self = this; // lexical capture of `this`
    setTimeout( function(){
        console.log( self.a );
    }, 100 );
}

var obj = {
    a: 2
};

foo.call( obj ); // 2
```

這似乎看起來是解決`this`的好方式，不過從別的角度來看也算是在躲避`this`的感覺，不過只要程式碼風格一致，不要交錯著混用，讓閱讀程式碼的人不會太過混淆都還是能接受的。

## 總結

`this`是一門大學問，我相信要徹頭徹尾的了解它必然得去仔細閱讀ECMAScript的規範。不過至少在這篇文章中，透過四個規則能讓我們清楚判斷`this`在此時此刻會是與誰綁定:

1. 函式是透過`new`被呼叫的嗎(`new`綁定)?如果是，就會將函式做為建構子，建立一個新的物件並將`this`指向它。  
2. 函式是透過`call(..)`或`apply(..)`，甚至是透過`bind(..)`強制綁定後被呼叫的嗎(顯性綁定)?如果是，那麼`this`將指向指定的物件。  
3. 函式是透過一個物件被呼叫的嗎(隱性綁定)?如果是，那麼`this`將指向該物件。  
4. 若非上述情況，則為預設綁定。如果再嚴格模式下，`this`會是`undefined`，否則就是全域物件(根據JS環境而定)。

若在使用`apply(..)`、`call(..)`或者`bind(..)`時，若沒有需要綁定的對象，可以建立一個空的物件傳遞，能避免無預警的例外。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
- [You don't know JavaScript Yet:#3 深入JS的核心](/archives/2020-01-07-you-dont-know-js-yet-3)
- [You don't know JavaScript Yet:#4 範疇](/archives/2020-01-31-you-dont-know-js-yet-4)
- [You don't know JavaScript Yet:#5 說明語彙範疇](/archives/2020-02-23-you-dont-know-js-yet-5)
- [You don't know JavaScript Yet:#6 範疇鏈](/archives/2020-02-27-you-dont-know-js-yet-6)
- [You don't know JavaScript Yet:#7 全域範疇](/archives/2020-03-03-you-dont-know-js-yet-7)
- [You don't know JavaScript Yet:#8 變數神秘的生命週期](/archives/2020-03-06-you-dont-know-js-yet-8)
- [You don't know JavaScript Yet:#9 限制範疇曝光](/archives/2020-03-12-you-dont-know-js-yet-9)
- [You don't know JavaScript Yet:#10 閉包(Closures)](/archives/2020-03-16-you-dont-know-js-yet-10)
- [You don't know JavaScript Yet:#11 模組模式(Module Pattern)](/archives/2020-03-21-you-dont-know-js-yet-11)
