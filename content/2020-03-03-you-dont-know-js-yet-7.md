---
title: "You don't know JavaScript Yet:#7 全域範疇"
date: "2020-03-03"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

全域範疇通常泛指最外層的範疇，但在我們寫程式的時候，會因為我們使用的JS環境以及編寫方式對於這個最外層的定義有些混淆，
所以這章將會說明如何去存取全域範疇以及它究竟指的是什麼地方。

## JS環境與編寫方式產生的差異

我們編寫JS的時候多數情況下不會只有一個檔案，而會根據不同的功能適度地將它們拆分到不同檔案上，那麼這些檔案是如何在執行時提供給其他檔案使用的呢?這裡我們會以browser環境中開發JS主要的三個方式來介紹:

第一，如果使用ES modules(沒有使用bundler)，那麼這些檔案會被個別的載入，每個檔案都屬於一個module，透過使用關鍵字`import`引用其他檔案達到相互協作，而這中間不需要透過任何範疇。

第二，如果使用bundler(例如webpack)，所有的檔案都會被bundle成一個大的檔案，接著你再使用這個大的檔案在你的網頁上，那麼瀏覽器只需要處理這個大的檔案即可。但即使只有一個檔案，裡面仍然需要一些機制用來註冊引用的名稱，以便於存取，例如使用wrapper function或 universal module definition(UMD)，透過一個額外的範疇將module置入其中，每個module都可以共享這個範疇的變數:

```javascript
(function wrappingOuterScope(){
    var moduleOne = (function one(){
      // ..
    })();
    var moduleTwo = (function two(){
        // ..  
        function callModuleOne() {
            moduleOne.someMethod();
        }  
        // ..
    })();
})();
```

上面的例子可以看到`moduleOne`與`moduleTwo`共用了`wrappingOuterScope`的內部範疇，以便它們使用共同需要的變數。
這就像是一個全域範疇的替身，用來儲存整個應用程式所有的module。

第三，若沒有使用ES modules或者bundler，那麼就是使用最傳統的方式進行個別載入(使用`<script>`或者其他動態載入的方式)，如果沒有使用上面程式碼那種wrapper function，全域範疇就會是module間唯一的溝通管道:

```javascript
var moduleOne = (function one(){
    // ..
})();
var moduleTwo = (function two(){
    // ..

    function callModuleOne() {
        moduleOne.someMethod();
    }

    // ..
})();
```

如果把它們拆成兩個檔案不會造成什麼影響，只是會多一次載入的動作:

moduleOne.js:

```javascript
var moduleOne = (function one(){
    // ..
})();
```

moduleTwo.js:

```javascript
var moduleTwo = (function two(){
    // ..

    function callModuleOne() {
        moduleOne.someMethod();
    }

    // ..
})();
```

除了這些由我們宣告與定義的module之外，全域範疇上還有一些元素可以使用:

- 由JS內建的:
  - 基本型別: `undefined`、 `null`、 `Infinity`、 `NaN`。
  - 原生的: `Date()`、 `Object()`、 `String()`，等等。
  - 全域函式: `eval()`、 `parseInt()`，等等。
  - 命名空間: `Math`、 `Atomics`、 `JSON`。
  - JS的朋友們: `Intl`、`WebAssembly`。
- 根據JS環境內建的:
  - `console`。
  - DOM(`window`、`document`，等等)。
  - timers(`setTimeout(..)`，等等)。
  - Web APIs: [navigator](https://developer.mozilla.org/en-US/docs/Web/API/Navigator)、 [history](https://developer.mozilla.org/en-US/docs/Web/API/History_API)、 [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)，等等。

大多數的開發者都同意不該把全域範疇作為一個變數的垃圾桶，這會使程式碼容易產生Bug且難以維護。

## 全域範疇究竟指的是哪裡

很直覺的，我們可能都認為位於文件中最外層的範疇就是全域範疇，但實際上並非那麼簡單。不同的JS環境(可能是browser或者node，等等)全域範疇所指的地方也會不同，這也是許多JS開發者會誤解的地方。

### Browser中的`Window`

考慮以下的程式碼，simple.js:

```javascript
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!
```

我們可以透過inline `<script>`、`<srcipt src="..">`或者動態生成`<script>`DOM元素來載入這段程式碼，無論哪種方法，這都會讓上述程式碼中的`studentName`與`hello`識別字被宣告於全域範疇中。這意味著你可以使用全域物件(在browser環境中為`window`)來存取它們:

```javascript
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ window.studentName }!`);
}

window.hello();
// Hello, Kyle!
```

這是JS規範預設的行為，外部範疇為全域範疇，`studentName`被創建為全域變數。但在其它的JS環境中並非如此，所以你無法說文件最外層中的範疇為全域範疇，這也是令人容易混淆的地方，視JS環境而定是我們需要注意的地方。

### 全域變數遮蔽(shadowing)全域物件屬性

在前一章我們有描述過何謂[遮蔽(shadowing)](https://papan01.com/archives/2020-02-27-you-dont-know-js-yet-6#%E9%81%AE%E8%94%BDshadowing)，在這裡想討論的是有關於"全域變數(global variable)"與"全域物件屬性(global object property)"在全域範疇中若有相同名稱會有什麼差異:

```javascript
window.something = 42;

let something = "Kyle";

console.log(something);
// Kyle

console.log(window.something);
// 42
```

在這種情況下，全域變數總是會遮蔽全域物件屬性，當然這是一種壞的撰寫方式，這樣寫只會讓讀你程式的人拳頭緊緊的而已，要避免這種狀況最好的辦法是使用`var`進行全域宣告，`let`與`const`用於區塊範疇中。

### Window的屬性:name

考慮以下程式碼:

```javascript
var name = 42;

console.log(typeof name, name);
// string 42
```

`window.name`為預先定義好的全域物件屬性，我們這邊再利用`var`進行宣告，但是這樣做實際上並沒有遮蔽`window.name`，所以這個`var`其實是被忽略的，如果我們使用`let`那麼由前面一小節的結論，它是會進行遮蔽的動作的。而在這邊還有一個比較特殊的情況，我們透過`42`賦值，理當說`name`的型別會被轉換為`number`，但在這裡卻是字串`"42"`，這是因為`window.name`透過getter/setter進行存取時，會強制使其為字串型別。

### Web Workers

[Web Workers](https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Workers_API/Using_web_workers)提供簡單的方法讓網頁在背景透過Thread執行，而不干擾使用者介面運行。由於這些Web Workers都單獨的在Thread上運行，它們與主程序上的溝通有些限制，避免產生race conditions或者其他複雜的情況，例如它們沒有訪問DOM的權限。但有些Web APIs可以提供給Web Workers使用，如`navigator`。

由於Web Workers被視為獨立的工作者，所以它並沒有與主程序共用全域範疇，取而代之的是使用`self`關鍵字:

```javascript
var studentName = "Kyle";
let studentID = 42;

function hello() {
    console.log(`Hello, ${ self.studentName }!`);
}

self.hello();
// Hello, Kyle!

self.studentID;
// undefined
```

上面可以看到透過`var`與`function`宣告的變數都有鏡射到`self`這個全域範疇中，而使用`let`則沒有。

### Developer Tools Console/REPL

在這一系列文章中的第一章曾經提到有關於[有些東西並非JS](/archives/2020-01-01-you-dont-know-js-yet-1#有些東西並非js)，在開發人員工具中實際上不會建立一個完全一致的JS環境，而在這裡關於範疇的議題，可能會有以下幾種行為上的差異:

- 全域範疇的行為。
- 提升(hoisting)。
- 在最外層的範疇中使用`let`或`const`進行宣告。

在使用console / REPL時，儘管看起來在最外層的範疇中輸入語句是在實際的全局範疇中進行處理的，但這並不是很準確。因為這些工具通常會在一定程度上模擬全局範疇，但畢竟是模仿，並不會嚴格遵守規範。這些工具優先考慮開發人員的便利性，這意味著有時觀察到的行為可能會偏離JS規範。

### ES Modules(ESM)

在之前第二章中的[ES Modules](/archives/2020-01-04-you-dont-know-js-yet-2#es-modules)有ESM的基本介紹，而在這裡則是要討論當使用ESＭ時，文件中最外層範疇所受到的影響，看看下面程式碼:

```javascript
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

export hello;
```

若我們只是單純的載入這個檔案，與前面的行為沒什麼區別，但若透過關鍵字`import`導入此檔案，全域範疇的行為可能就不是我們想的那樣，根據之前的邏輯來看，`studentName`與`hello`都屬於全域變數，並且我們也可以透過全域物件`window`(若在browser環境下)使用它們，但實際上這裡最外層的範疇並非全域範疇，反而比較像是模組範疇，它並沒有像全域範疇那樣，將全域變數隱式的加入到全域物件屬性中，所以也沒有像`window`這種全域物件可以使用，但這並不是說你不能在這裡使用`window`來使用全域物件屬性。

ESM鼓勵最大程度地減少對全域範疇的依賴，在全局範疇中，我們可以導入當前模組所需要的任何模組，這樣就很少會看到全域範疇或其全域物件的用法，但是實際上依舊有大量的內建全域變數可以使用。

### Node

在Node中每個檔案都是module(ES module或者CommonJS module)，這所造成的影響也會與上述ES modules類似，實際上Node最外層的範疇永遠不會是全域範疇。在這裡我們使用CommonJS module作為例子(這是Node一開始就支援的module規格，後來才加入ES module):

```javascript
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

module.exports.hello = hello;
```

如之前我們介紹wrapper function一般，Node也會有效率的使用一個wrapper function將`var`或者`function`所宣告的變數置入其中，以便使用，所以它們會隸屬於該函式的範疇，而不會是全域範疇，我們可以把上面代碼想像透過Node包裝後的結果如下(只是示意，與實際有所差異):

```javascript
function Module(module,require,__dirname,...) {
    var studentName = "Kyle";

    function hello() {
        console.log(`Hello, ${ studentName }!`);
    }

    hello();
    // Hello, Kyle!

    module.exports.hello = hello;
}
```

從上面很明顯看到為什麼`studentName`與`hello`不屬於全域變數。

Node定義了一些諸如`require()`之類的全域變數，但它實際上不屬於全域範疇內的識別字(意思就是不是全域物件屬性)，它比較像是透過注入的方式到每一個module中，有點類似於上面程式碼中那樣。那麼我們到底該如何在Node中使用全域範疇?Node提供了一個物件`global`，它類似於在browser中的`window`一樣:

```javascript
global.studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

module.exports.hello = hello;
```

上面我們將`studentName`加入到全域物件`global`中，此時它就會類似於前面所述的全域變數一般提供使用，`global`這個識別字不是由JS所定義的，而是由Node所定義的。

## Global This

綜合我們上述所講的，JS在不同環境中可能會或者可能不會的行為:

- 在最外層的範疇中使用`var`或`function`(或`let`，`const`和`class`)宣告一個全域變數。
- 如果將var或function用於宣告，則還會將全域變數加入為全域物件屬性。
- 使用`window`，`self`或`global`等識別字引用全域物件。

這裡還要介紹另外一個透過`new Function(..)`來獲取全域物件的方法:

```javascript
const theGlobalScopeObject = (new Function("return this"))();
```

使用`new Function`有點類似於`eval()`，它可以動態的建構輸入字串參數作為其函式內容的函式，所以`this`將會作為全域物件的reference回傳。
所以在上面我們介紹了`window`、`self`、`global`與`new Function`作為我們使用全域物件的手段。
而在ES2020中，JS定義了一個對於全域物件標準化的reference，稱為`globalThis`，這可以用來代替上述的方法。
我們也可以寫一個polyfill用於所有環境中:

```javascript
const theGlobalScopeObject =
    (typeof globalThis !== "undefined") ? globalThis :
    (typeof global !== "undefined") ? global :
    (typeof window !== "undefined") ? window :
    (typeof self !== "undefined") ? self :
    (new Function("return this"))();
```

不過這當然不是一個好的方式，但如果你想安全的使用全域物件，至少這個能起到作用。

## 總結

全域範疇在不同環境中有不同的存取方式，在ES6的`import`與`export`出現之後，已經較少直接在全域範疇宣告變數使用了，
但我們依舊有使用到它的機會，所以了解全域範疇依然是重要的。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
- [You don't know JavaScript Yet:#3 深入JS的核心](/archives/2020-01-07-you-dont-know-js-yet-3)
- [You don't know JavaScript Yet:#4 範疇](/archives/2020-01-31-you-dont-know-js-yet-4)
- [You don't know JavaScript Yet:#5 說明語彙範疇](/archives/2020-02-23-you-dont-know-js-yet-5)
- [You don't know JavaScript Yet:#6 範疇鏈](/archives/2020-02-27-you-dont-know-js-yet-6)