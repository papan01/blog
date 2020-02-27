---
title: "You don't know JavaScript Yet:#4 範疇"
date: "2020-01-31"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

我們在編寫程式時，通常會存在許多變數，而這些變數都有它所居住的地方，等到我們需要時去存取它。JS定義了一個明確的規則用來管理這些變數稱為範疇(Scope)，在我們討論範疇之前，我們必須先理解JS是如何處理與執行程式。

## 編譯程式碼

在[You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)中，我們討論過關於JS是屬於編譯(Compiler)語言，而我們需要討論此行為的原因是因為範疇完全取決於編譯時期。

我們的程式碼通常經由編譯執行以下三個階段:

1. 語彙單元化(Tokenizing)/語彙分析(Lexing)：將字串拆解成有意義的(對程式語言來說)組塊，這些組塊就叫做token(語彙單元)，例如:
`var a = 2;` 就會解析成`var`、`a`、`=`、`2`、`;`，空白則視情況是否具有意義。

2. 剖析或稱語法分析(Parsing):透過上一步驟由token所構成的串流(stream)或者陣列(array)組成抽象語法樹(abstract syntax tree，AST)。

3. 產生程式碼(Code Generation):將AST轉換成可執行的程式碼，通常是機器語言，這步驟會隨著語言以及平台的不同有大幅度的變化。

JS Engine所進行的工作比上述的三個階段複雜得多，與其他語言一樣在剖析與產生程式碼的的過程中，會有最佳化執行效能的步驟，包含消除不必要的元素等等。但與其他語言不同的部分，JS沒有充足的時間來進行最佳化，因為JS的編譯不是在建置(build)步驟中預先處理，它必須在執行前的幾毫秒(或者更短)內發生，所以JS會使用各種技巧例如使用JIT來延遲編譯或者hot re-compile等等。

## 兩個階段

JS程序至少在兩個階段中進行處理：首先進行剖析/編譯，然後執行。

剖析/編譯階段與執行階段是分開的我們可以透過觀察得到這個事實，儘管JS沒有明確的執行編譯，但它實際的行為確實是先編譯後執行，我們透過以下三個程序特徵來證明這一點:語法錯誤(syntax errors)、早期錯誤(early errors)與提升(hoisting)。

考慮以下這種狀況:

```javascript
var greeting = "Hello";
console.log(greeting);
greeting = ."Hi";
// SyntaxError: unexpected token .
```

這段程式碼不會print出`"Hello"`，取而代之的是SyntaxError，由於`"Hi"`之前的`.`造成語法錯誤，若JS是逐行執行那麼很有可能會先print`"Hello"`之後在拋出SyntaxError，但實際上JS Engine在執行前會剖析整個程式碼。

第二個例子:

```javascript
console.log("Howdy");
saySomething("Hello","Hi");
// Uncaught SyntaxError: Duplicate parameter name not allowed in this context

function saySomething(greeting,greeting) {
    "use strict";
    console.log(greeting);
}
```

這段程式碼不會print出`"Howdy"`，儘管格式是正確的語句，而問題出在`saySomething(...)`，由於裏頭使用了嚴格模式，所以禁止函式使用重複名稱的參數，若在非嚴格模式下是允許那麼做的，這不像上一個例子中的語法錯誤，而是屬於嚴格模式規範中的早期錯誤。那麼JS Engine是如何知道`greeting`參數已經重複?甚至如何知道`"use strict"`的存在?合理的答案就是JS Engine在執行前會剖析整個程式碼。

最後一個例子:

```javascript
function saySomething() {
    var greeting = "Hello";
    {
        greeting = "Howdy";
        let greeting = "Hi";
        console.log(greeting);
    }
}

saySomething();
// ReferenceError: Cannot access 'greeting' before initialization
```

這裡需要注意的是錯誤發生是在`greeting = "Howdy"`上，而錯誤描述說明的語句是指`let greeting = "Hi"`而不是上面的`var greeting = "Hello"`，由於過早訪問變數產生衝突，這還牽扯到暫時死區(Temporal Dead Zone，TDZ)與提升(Hositing)，這兩個議題將在後面章節談到，而這也是JS Engine是否在較早過程中已經處理了此程式碼並且設置了範疇與變數的存取，只有在執行前進行剖析才能準確地完成。

## Compiler的細語

我們將用以下程式碼做為這小節的範例:

```javascript
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getStudentName(studentID) {
    for (let student of students) {
        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);

console.log(nextStudent);
// Suzy
```

除了宣告之外，程式碼中所有變數或者識別字均為以下兩種角色的其中一種:目標(target)/來源(source)。

[[warning]]
|或許你有讀過有關於Left-Hand Side(LHS)與Right-Hand Side(RHS)，其中LHS表示target而RHS表示source，
|就像使用`=`進行賦值的左右兩側一樣，但是target與source並不是總是出現在`=`左右兩側，因此我們在考慮target與source時可以不必規定是在
|左右兩側的哪裡，避免混淆。

如何判斷target與source呢?在任一個地方被賦予值的就是target，否則就是source。

### Targets

看看我們在這小節所定義的變數:

```javascript
var students = [
  ...
];
```

這裡顯然是一個賦值操作，所以`students`就是target，相同的`nextStudent`也是，再看看下面:

```javascript
for (let student of students) {
```

`student`在迭代中被賦值所以它是target，另外一個target:

```javascript
getStudentName(73)
```

`73`賦值給參數`studentID`，所以這裡也有一個target。
最後還有一個target:

```javascript
function getStudentName(studentID) {
```

`function`的宣告是比較特別的一種target，想像把它看成`var getStudentName = function(studentID)`，但這樣不是很精確，
實際上`getStudentName`與`= function(studentID)`都是在編譯期(compile-time)就進行了處理，這兩個的關聯在範疇的開頭就自動建立起來了，而不是等到`=`的賦值動作。

所以在這個例子中一共有五個target。

### Sources

接著我們來看看有哪些是source，在`for (let student of students)`中，之前說過`student`是target，而`students`就是source。
`if (student.id == studentID)`裡的`student`與`studentID`都屬於source，同樣的`return student.name`的`student`也是。
`getStudentName(73)`中的`getStudentName`也是屬於source，`console`也屬於source，作為參數傳遞的`nextStudent`也是。

[[info]]
|你可能對於`id`、`name`與`log`感到困惑，但們不屬於變數而是屬性。

原文中的這一小節是為了下一章進行鋪路，在下一張會更深入了解為何要討論target與source的重要性。

## 作弊:在執行期修改範疇

在前面我們說明了範疇是在編譯就已經確定的，並且不受執行期的任何條件影響，但在非嚴格模式下，有辦法透過兩種技術欺騙此規則來達到修改範疇，
但我們不應該使用這兩種技術，無論如何我們都應該在嚴格模式下開發。

首先是`eval(..)`函式它允許接受一段字串形式的程式碼並在執行期即時編譯與運行，如果這段字串包含`var`、`function`的宣告，這些宣告將會修改`eval(..)`當前所在的範疇:

```javascript
function badIdea() {
    eval("var oops = 'Ugh!';");
    console.log(oops);
}

badIdea();
// Ugh!
```

如果`eval(..)`不存在則會引發ReferenceError，但`eval(..)`在運行時修改了`badIdea`函式的範疇，這表示每次執行`badIdea`都將修改已編譯好與優化過的範疇，所以不要使用它。

第二種是使用關鍵字`with`，它會將一個物件動態的轉換到其範疇:

```javascript
var badIdea = {
    oops: "Ugh!"
};

with (badIdea) {
    console.log(oops);
    // Ugh!
}
```

這裡全域範疇沒有被修改，但是badIdea的範疇是在執行期被轉換而不是編譯期。

竟量避免使用這兩種技術，只要你使用嚴格模式就可以避免掉。

## 語彙範疇(Lexical Scope)

在編譯期我們會確定程式碼的所屬範疇，我們將此範疇模型稱為「語彙範疇」，語彙範疇完全由程式碼的函式(function)、區塊(block)與範疇所控制。

如果在函式宣告變數，編譯器在剖析該函式時就會處理此變數並將該變數與函式關聯在一起，如果變數在區塊中透過`let`或者`const`宣告，則它會與最近的`{..}`區塊關聯，而不是與函式關聯(例如使用`var`宣告就會與函式關聯)。

變數的reference必須在語彙範疇其視為有效的，否則通常會引發`undeclared`錯誤，如果變數不在其所在範疇內，則會一直往外面的範疇去尋找，直到找到或者達到全域範疇為止。

編譯的動作實際上不做任何保留範疇與變數的記憶體，而是會創建執行時所有用得到語彙範疇的映射(map)關係，你可以想像它將此映射作為程式碼插入，該程式碼將定義所有的範疇(稱為語彙環境，lexical environments)，並給所有範疇標記ID。因此，範疇是在編譯期間進行規劃的，這就是我們將「語彙範疇」稱為編譯時決策的原因，但實際上它們直到執行時才被創建。每次需要執行時，每個範疇都會從記憶體當中實例化。

## 總結

這裡有些部分在原文中都保留於後面的章節講述，這一章算是先給我們預習一下，在本文中我們可以看到作者想要表達的幾個地方:

- 語彙範疇是在編譯期定義的範疇，而範疇在我們寫好程式碼就已成定局。
- 盡量使用嚴格模式來編寫程式碼，避免使用`eval(..)`與`with(..)`，因為這會導致JS Engine進行最佳化的結果無效。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
- [You don't know JavaScript Yet:#3 深入JS的核心](/archives/2020-01-07-you-dont-know-js-yet-3)
