---
title: "You don't know JavaScript Yet:#1 什麼是JavaScript"
date: "2020-01-01"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

這是我閱讀[You Don't Know JS Yet: Get Started-What Is JavaScript?](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/get-started/ch1.md)的讀書筆記，希望藉此記錄下來作為重點整理，以便往後複習。這章節的內容主要在講述有關於JavaScript知識，但不是「新手入門」那種如何宣告變數與寫Hello World之類的。

## 關於JavaScript的名稱

我想多數人在第一次看到JavaScript時，一定認為它與Java有某種關係存在，但實際上一點關係都沒有😑。實際上Brendan Eich(JavaScript的主要架構師與創造者)在一開始把它命名為Ｍocha，在Netscape(Brendan Eich當時的公司)內部，則使用了LiveScript作為它的名稱，但是當公開投票命名該語言時，"JavaScript"最終贏得了勝利，只因為當時Java是主流語言，而為了吸引使用Java的程式開發者使用JavaScript所以前面用了Java，而Script一詞在當時很流行，用來代表「輕量(lightweight)」的程式語言，所以就誕生了一個嵌入在Web中的腳本語言。Sum(現在的Oracle)與Netscpae把JavaScript送去ECMA(European Computer Manufacturers Association)進行標準化作業，但因為商標的問題，就出現我們常看見的「ECMAScript」這個奇怪的名字，而我們現在通常把它視為一種標準。

## JavaScript規範

[TC39](https://github.com/tc39)是一個管理JavaScript的技術指導委員會，主要的任務就是為了管理語言的官方規範，他們會定期開會，商議變更進行投票，然後再提交給ECMA標準化。TC39委員會的會員大約由50到100人組成，而這些人來至瀏覽器(Mozilla，Google，Apple)和設備製造商(Samsung)等等。
所有TC39提案都通過五個階段進行，由於我們是程式發開者，所以它是從0開始的！階段0到階段4。您可以在此處了解有關階段流程的更多信息:<https://tc39.es/process-document/>。我們一般人也能提出想法，但只有TC39的委員認為它是可行的，才會正式提案為"階段0"，當提案狀態來到"階段4"後，該提案就會被視為下一年度的修訂標準中，相關的提案可以參考:<https://github.com/tc39/proposals/>。所有的瀏覽器與設備製造商都致力於實現這些標準，只是會有實現功能的時間問題，這意味著我們只需要學習一種JavaScript，它就能在所有支援JavaScript的瀏覽器或設備上運行。

### 基於Web的規範

JavaScript的運行環境不斷的擴展，從Web到Server(Node.js)甚至機器人、燈泡(原文提到燈泡，恕我孤陋寡聞，沒看過燈泡跑JS🤔)，但一切的規範都要基於Web，任何會破壞Web內容的規範基本上都會被拒絕更改，在這些情況下，TC39通常會回溯，只選擇符合Web的情況，例如，TC39計劃為Arrays添加一個contains(..)方法，但是發現該名稱與某些網站上舊有的JS frameworks衝突，因此他們將名稱更改為不衝突的include(..)。但有些時候TC39也會讓Web不太可能符合標準繼續堅持下去...。從原文的這段看來，基本上只是看TC39的委員們想或不想而已🤯，在[ECMA2019](https://www.ecma-international.org/ecma-262/10.0/#sec-additional-ecmascript-features-for-web-browsers)中有列出了有些規範與Web上JS的規範不匹配的情況，而這些是允許的例外。

### 不是所有JS都在規範當中

我們都有用過下面的程式碼的經驗:

```javascript
alert("Hellow JS!");
console.log("Hellow World");
```

但實際上無論`alert(..)`還是`console.log(..)`都不再JS的規範當中，它們卻在許多環境下可以執行，由於它們的通用性，幾乎每個JS環境都定義了它們。

### 有些東西並非JS

我們在Developer Tools中使用console/REPL(Read-Evaluate-Print-Loop)感覺像是JS的運行環境，但實際上不是。這類工具的優先考量都是DX(Developer Experience)，
它們呈現的內容與JS規範還是有所差異，將其視為一個JS的友好環境並且閱讀JS規格，兩者搭配使用是很有幫助的。

### Programming Paradigm

**Paradigm**一詞用來表示程式碼的基礎樣式，常見的有:procedural, object-oriented(OO/classes), and functional(FP)。

1. **Procedural**: 透過預先定義好的操作由上到下、線性順序執行，通常把這些操作的相關集合稱為procedures，此類型的語言有: Fortran、ALGOL、COBOL、Pascal、C等等。

2. **Object-Oriented(OO/classes)**: 將邏輯與數據整合成一個稱為class的單元，此類型的語言有: C++、C#、Java、Python等等。

3. **Functional(FP)**: 將程式碼組織為函數，通常函數中比較偏向純粹的計算，再透過呼叫獲取數值，此類型的語言有: F#、Haskell、Lisp等等。

許多語言其實是支持所謂的multi-paradigm，這意思是工程師可以使用以上任何一種樣式來設計他們的程式碼，而JS也是屬於multi-paradigm。

### 向前兼容/向後兼容

JS是屬於向後兼容但不向前兼容，這意味著如果你使用了1995年編寫的JS程式碼，依舊能在現今的JS上運行，這無疑是一項偉大的創舉，要知道一直能保持向後兼容
近25年，絕非簡單的事，但這也造成了巨大的負擔。此規則有一些小例外，TC39還是會去修改舊有的程式，但會去收集網路上現有的資料來評估修改過後破壞的規模，以權衡更多的網站與用戶。

HTML與CSS是屬於向前兼容但不向後兼容，若你使用1995年編寫的HTML或CSS在現代的瀏覽器上，可能將無法使用，但是，如果你在2010年之後的瀏覽器上使用2019年的新功能，
則頁面不會損壞，那些無法被辨識的CSS/HTML將被忽略，只解讀瀏覽器能解讀的。

HTML與CSS本質上是屬於陳述某件東西，選擇性忽略較為容易，但JS屬於編程語言，若跳過一些語法很容易造成混亂與不確定性，所以它沒有具備向前兼容。

### 跨越障礙

前面了解到JS並非向前兼容，這意味著我們若想在只支援到ES2015瀏覽器去跑ES2019的最新功能，這將會使程式中斷，解決方式是使用Transpiling。
Transpiling是一種將程式碼從某種形式轉換成另一種形式的術語，而我們常見解決這類問題的翻譯器就是[Babel](https://babeljs.io)，它可以把較新的JS語法轉成瀏覽器可以閱讀的語法。
例如底下的例子:

```javascript
if (something) {
  let x = 3;
  console.log(x);
} else {
  let x = 4;
  console.log(x);
}
```

這是我們自己撰寫程式時的樣子，但透過babel後則可能的樣子如下:

```javascript
var x$0;
var x$1;
if (something) {
  x$0 = 3;
  console.log(x$0);
} else {
  x$1 = 4;
  console.log(x$1);
}
```

原本裡面使用let宣告的變數，被抽離出來使用了獨一無二的名稱作為代替，從而產生無干擾的結果。

[[info]]
| 我們為什麼要使用最新的ES2019而不使用既有能跑的JS呢?因為新的規範往往能夠使你的程式碼較為乾淨且能夠有效傳遞編程思維，這有助於我們追蹤、Refactoring等等。

### 填補差異

如果與向前兼容沒有關係，而是像缺少最近才添加的API有關，最常見的解決方案為替缺少的API提供一個定義，此模式稱為**Polyfill**。考慮下面的程式碼:

```javascript
// getSomeRecords() returns us a promise for some
// data it will fetch
var pr = getSomeRecords();

// show the UI spinner while we get the data
startSpinner();

pr
.then(renderRecords)   // render if successful
.catch(showError)      // show an error if not
.finally(hideSpinner)  // always hide the spinner
```

這段程式碼使用了ES2019中promise的prototype方法`finally(..)`，如果在ES2019以前的環境底下執行此段程式碼，會發生錯誤。
而ES2019環境中，`finally(..)`的基本polyfill可能如下所示:

```javascript
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function f(fn){
        return this.then(fn,fn);
    };
}
```

`if`聲明為了防止已經定義過`finally(..)`，若在較舊的環境中，則會被定義。Babel通常會檢測出哪些程式碼可以滿足我們的需求，並自動提供程式碼，
但有時候可能需要顯式的定義它們，這時候可以用類似上面的程式碼定義。

## JS是Interpreted(直譯)還是Compiled(編譯)語言

大多數的人認為JS是一種Interpreted(Scripting)語言，但實際上JS是**Compiled語言**。

在程式語言中，與Compiled語言相比，Interpreted語言一直被視為次等語言，因為被認為未做性能優化，或者認為它們常使用動態類型，
而非靜態類型，這感覺上像是另類的種族歧視。Compiled通常會產生二進制(binary)形式之後再去執行，由於我們在JS上沒有見過這種行為，
所以我們就認為JS是Interpreted語言，但在過去十年，**可執行**的形式已經變得相當多樣化，我們使用什麼形式的程式已經不再重要。

Interpreted語言通常是由上到下、一行一行的逐行執行，通常在執行開始前不會通過程式進行前處理，如下圖所示:
![you-dont-know-js-yet-1-1](/static/images/you-dont-know-js-yet-1-1.png)
如果程式中的第5行有錯誤，Interpreted語言通常會執行完1-4行，直到第5行才會拋出錯誤並且中斷。

比較一下有在執行前預先通過程式處理的情況(此動作稱為解析(parsing)):
![you-dont-know-js-yet-1-2](/static/images/you-dont-know-js-yet-1-2.png)

在此處理模型下，第5行的錯誤將會在解析階段就被捕獲，通常此種錯誤屬於語法上的錯誤，runtime上的錯誤也只能等到執行時才能發現。
所有的Compiled語言都是已解析的，解析後的最後一步就是生成可執行的形式。一旦程式碼解析完畢，將會把解析過後的程式轉換成另外一種稱為抽象語法樹(Abstract Syntax Tree，AST)的形式，解析的動作可以看做把`var x = 2`拆解成`var`、`x`、`=`、`2`，接著再組成AST。

而JS程式在執行前就已進行解析，在規範中必須將早期錯誤(early errors)在執行前就先被發現出來，通常是一些靜態錯誤，例如變數名稱重複等等。
在解析之後會轉換為二進制(binary)的形式，然後交給"JS Virtual Machine"去執行，有些人說Virtual Machine是以Interpreted的方式去執行byte code，
但用同樣的論點去說明Java或其他JVM驅動語言也是一樣的道理，這樣說明Java不是Compiled語言而是Interpreted語言嗎?這相當矛盾。

而JS Engine解析過後的程式碼可以再利用JIT(Just-In-Time)進行多次的處理與優化，這些動作被說明為Interpretation或者Compilation都是合理的，但實際上這是一個相當複雜的步驟。

總結一下JS的整個流程:

1. 工程師寫好程式碼，使用Babel將其進行編譯，然後透過Webpack進行打包(或者其他建構方式)，然後交付給JS Engine。
1. JS Engine將它解析成AST。
1. 然後JS Engine再將AST轉換為某種二進制的中間表示式(binary intermediate representation(IR))，然後透過負責最佳化的JIT compiler進行轉換或者細化。
1. 最後JS Virtual Machine執行程式。
![you-dont-know-js-yet-1-3](/static/images/you-dont-know-js-yet-1-3.png)

## 嚴格模式

嚴格模式於ECMAScript5發布時所添加，作為為了鼓勵更好的JS程式而提供的選擇機制。

嚴格模式會有以下幾個特點:

- 當它捕獲一些常見的程式漏洞，它會拋出異常。
- 當採用相對不安全的操作時(例如嘗試訪問global object)，它可以防止或者發出錯誤。
- 它會禁用ECMAScript未來版本中可能會定義的一些語法。
- 有些時候使用嚴格模式可以比非嚴格模式下運行得更快。

通常一個JS專案都是由一個團隊一起維護，使用嚴格模式或者linters(我自己是使用ESLint)可以有效地防止一些早期錯誤(early errors)，
且有助於程式碼的可讀性與一致性。

來看看如何開啟嚴格模式:

```javascript
// only whitespace and comments are allowed
// before the use-strict pragma

"use strict";

// everything in this file runs in strict
// mode
```

[[warning]]
| 注意在use strict之前只能有空白或者註解，若在這之前使用的程式碼都會被判斷為非嚴格模式。

我們也可以在function中加入嚴格模式:

```javascript
function someOperations() {
    // whitespace and comments are fine here
    "use strict";

    // all this code will run in strict mode
}
```

上面兩種方式只能擇一使用，而在function中加入嚴格模式的理由只有當你現有的程式碼並非在嚴格模式下，而你想要逐步修改，
否則我們通常在新的檔案中都會直接使用全域的嚴格模式。

隨著使用ES6 module的編寫方式到來，許多程式已經默認開啟嚴格模式了，因為ES6 module是默認開啟的狀況。

## 總結

JS是ECMAScript標準(在撰寫本文時為ES2019版本)的實現，該標準由TC39委員會指導並由ECMA託管。它可以在瀏覽器和其他JS環境(例如Node.js)中運行。

JS是一種multi-paradigm語言，意味著語法和功能讓開發人員可以混合使用。

JS是一種編譯(compiler)語言，在執行之前先進行處理並驗證程序(並且報告任何錯誤！)。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
