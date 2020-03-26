---
title: "You don't know JavaScript Yet:#11 模組模式(Module Pattern)"
date: "2020-03-21"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

**模組模式(Module Pattern)**是利用[「閉包(Clouse)」](/archives/2020-03-16-you-dont-know-js-yet-10)的特性，將變數與方法進行封裝，使我們能夠在函式中包含公有(public)/私有(private)的變數與方法，避免過度依賴全域範疇。

## 封裝與最少曝光原則(POLE)

若曾經有學過物件導向(object-oriented)類的程式語言一定對封裝(encapsulation)並不陌生，通常可以利用`public`或`private`等關鍵字來管理屬性與方法，將物件擁有的屬性和方法隱藏起來，只保留特定的屬性與方法與外部聯繫。在這裡我們以更廣泛的描述來定義它:封裝的目的是將訊息(數據)和行為(功能)捆綁或共置在一起，以達到它們共同的目標。以JS為例，我們將搜尋目錄相關功能的程式碼都置入於`search-list.js`中，這也是一種封裝的概念。

現代前端框架很多都是使用Component為單元來架構程式碼，這種趨勢也進一步推動封裝的精神。將所有建構搜尋目錄的相關內容(功能、樣式或者HTML等等)整合到一個Component中，並且將其命名為`SearchList`，使其能被其他部分的程式碼使用。

[「最少曝光原則(The Principle Of Least Exposure, POLE)」](/archives/2020-03-12-you-dont-know-js-yet-9#最少曝光原則)在前面的章節中有提過，該原則旨在把變數/函式盡量以私有的(private)方式來管理，以最低限度公開必要的變數/函式。在JS中，我們經常透過建立語彙範疇來達到此目的。

封裝與POLE的目的都是希望能讓我們更好的組織程式碼，當我們知道某些事物在哪裡，它本身的邊界或者與其他事物的連接點能清晰明瞭時，就能讓程式碼更具可讀性且更容易維護，避免過度曝光變數與函式能減少Bug的產生。

這些是將JS程式碼組織到模組中的一些好處。

## 什麼是模組(Module)

模組(module)是收集相關資料與功能，將它們組合成一個邏輯單元，其特徵區分為隱藏私有訊息與公有可訪問的訊息，可被訪問的部分通常稱為"公有API"。模組屬於有狀態的，當它在運作的過程中，隨著時間推移會進行資料維護的動作，我們可以透過這些公有API進行訪問以及更新。

為了更好的理解模組是什麼，底下我們將那些設計程式碼架構的方式分為模組與非模組來進行比較。

### 命名空間(無狀態類)

如果只是將一些功能組合為一個集合而沒有資料，這就不算是模組所預期的封裝行為。這種將無狀態的函式進行分組於某個範圍中，這範圍有個專有名詞稱為**命名空間(namespace)**:

```javascript
// namespace, not module
var Utils = {
    cancelEvt(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
    },
    wait(ms) {
        return new Promise(function c(res){
            setTimeout(res,ms);
        });
    },
    isValidEmail(email) {
        return /[^@]+@[^@.]+\.[^@.]+/.test(email);
    }
};
```

`Utils`在許多程式碼中相當常見，用於將一些常用的函式整理於這個區塊中，但這些函式皆為靜態且獨立的。但這樣並不能算是模組，通常會說我們定義了一個名為`Utils`的命名空間。

### 資料結構(有狀態類)

即使在一個物件中包含了資料與功能，若沒有任何限制存取的機制，那麼這樣也不算是模組，且違反了POLE對於封裝的理念:

```javascript
// data structure, not module
var Student = {
    records: [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ],
    getName(studentID) {
        var student = this.records.find(
            student => student.id == studentID
        );
        return student.name;
    }
};

Student.getName(73);
// Suzy
```

`records`未隱藏於公有API之後，`Student`儘管具有資料與功能的部分，但未限制其存取機制，所以它並非是一個模組，或者應該稱其為資料結構(data structures)的實例。

### 模組(有狀態的存取控制)

為了體現模組模式的精神，我們不只要將資料與功能組合成一個有狀態的邏輯單元，同時還要加入存取機制(私有/公有)。

我們將使用上一節`Student`的例子，將其改造為模組，這裡將會使用被稱為"經典模組(classic module)"的形式表示，這個形式原本被稱為"揭露模組(revealing module)"，其最早出現於2000年初期。考慮以下程式碼:

```javascript
var Student = (function defineStudent(){
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
})();

Student.getName(73);   // Suzy
```

`Student`為一個模組的實例，我們將`records`隱藏其中，不讓外部直接存取，這意味這它是受保護的，並且將`getName(..)`作為公有API提供給外部使用。

我們透過[IIFE](/archives/2020-03-12-you-dont-know-js-yet-9#immediately-invoked-functions-expressionsiife)`defineStudent()`返回一個物件`publicAPI`，這個物件擁有函式`getName(..)`這個屬性。將公有API命名為`publicAPI`不是必須的，你可以根據你的習慣或者團隊的規範來命名，或者直接返回一個物件的形式，免去額外的命名。從外部透過`Student.getName(..)`調用曝光的內部函式，該函式透過閉包維護內部資料`records`。我們不一定要回傳一個物件，也可以直接回傳一個函式，這依舊符合經典模組的核心要點。

根據語彙範疇的工作原理，在模組中定義的變數與函式都屬於私有的，只有作為屬性加入到函式返回的公有API物件中，才能提供給外部使用。

使用IIFE意味著我們的程式只需要模組的單個實例，通常這被稱為"singleton"。若你曾經閱讀過design pattern，對這個名詞應該不太陌生，通常使用這種模式表示在你的程式中，只需要一個此模組的實例，若已經建立過一個實例了，則會返回該實例的reference。

#### 模組工廠(用於多個實例)

若你想要創建多個實例，只要稍微改一下程式即可:

```javascript
// factory function, not singleton IIFE
function defineStudent() {
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
}

var fullTime = defineStudent();
fullTime.getName(73);            // Suzy
```

這邊不使用IIFE，作為代替的是直接宣告了一個標準函式，在此情況下通常稱為"模組工廠(module factory)"函式。除了可以創建多個實例外，其他的操作與前面介紹的沒什麼區別。

#### 經典模組的定義

這裡將定義經典模組(classic module)應該具備什麼:

- 必須在外部範疇至少被執行一次。
- 模組的內部範疇必須至少隱藏一項訊息，這些訊息代表模組的狀態。
- 模組必須回傳公有API，其中至少包含一個函式，這個函式必須封存(閉包)那些表示模組狀態的訊息，以便保留當前的狀態。

## Node CommonJS模組

在前面的章節中曾經在另外一個議題上討論過[「Node CommonJS模組」](/archives/2020-03-03-you-dont-know-js-yet-7#node)。它與前面討論的經典模組不太一樣，CommonJS模組是基於檔案來管理模組，每一個檔案都是一個模組，所以在這檔案中你可以任意的使用IIFE或者模組工廠。

這裡一樣透過改寫上面的例子:

```javascript
var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}

// ************************
module.exports.getName = getName;
```

變數`records`與函式`getName(..)`位於此模組中最上層的範疇，但這不是全域範疇，這曾經在前面的章節有討論過，所以你可以把這個範疇想成是上面例子中`defineStudent()`內的範疇。若要在CommonJS中公開API給外部使用，可以將欲公開的變數或函式添加到`module.exports`的屬性中，`module.exports`本身就像個空的物件。至於要將`module.exports`放置於哪裡沒有硬性的規定，建議將它們統一置於模組的最上面或最下面。

有些開發人員習慣替換掉預設物件`module.exports`:

```javascript
// defining a new object for the API
module.exports = {
    // ..exports..
};
```

這不是一個好的做法，如果多個像這樣的模組互相依賴，則會出現意外行為，因此不建議這樣做。如果想要透過物件一次導出多個API，可以透過以下方式:

```javascript
Object.assign(module.exports,{
   // .. exports ..
});
```

這與前不同之處在於將欲導出的API置入物件中，`Object.assign`會將這個物件的屬性進行淺拷貝到`module.exports`中，而並非像上面透過替換的方式。

接著我們來看看如何導入這些模組:

```javascript
var Student = require("/path/to/student.js");

Student.getName(73);
// Suzy
```

`require(..)`為Node所提供的方法，你可以在後面帶入檔案的路徑就能導入該模組。

CommonJS的所有模組都是使用singleton的模式，也就是不論你在哪裡導入該模組，都會返回相同的reference。用`require(..)`進行導入時，它會一次性的導入所有該模組的公有API，若只想使用其中一部分，可以透過以下的方式:

```javascript
var getName = require("/path/to/student.js").getName;
// or alternately:
var { getName } = require("/path/to/student.js");
```

CommonJS與經典模組類似，被導出的API一樣會對模組內部的資料保持閉包的特性，這也是程式如何保持singleton模組狀態的生命週期。

[[info]]
|若看到`require("student")`非相對路徑的寫法，它通常會從`node_modules`中尋找。


## 現代ES模組(ESM)

ESM與CommonJS有許多相似之處，都是以檔案做為一個模組，並且都是singleton實例，預設所有變數與函式都是私有的(private)。但有一個不同的地方在於所有ESM檔案都預設為嚴格模式，不需要再額外加`"use strict"`，且無法將其設為非嚴格模式。

ESM使用關鍵字`export`代替CommonJS的`modules.exports`，而使用關鍵字`import`代替`require(..)`。我們一樣使用前面的例子進行改寫:

```javascript
var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}

// ************************

export getName;
```

這裡與使用CommonJS類似，你可以在任何你想要的地方使用`export`導出API，你也可以透過另外一種形式使用:

```javascript
export function getName(studentID) {
    // ..
}
```

這樣表示`getName`是一個標準的函式同時也是要被導出的API。還有另外一個關鍵字`default`，它需與`export`搭配使用:

```javascript
export default function getName(studentID) {
    // ..
}
```

我們可以將上面這兩種導出方式分為*default*與*named*，每個模組中可以有多個*named exports*，但只能有一個*default export*。我們透過例子看看它們的差別，首先是*named*：

```javascript
import { getName } from "/path/to/students.js";

getName(73);   // Suzy
```

我們可以透過`{..}`來指定我們想要導入的API，所以允許一次導入多個，我們還可以透過`as`關鍵字來改變被導出API的名稱:

```javascript
import { getName as getStudentName }
   from "/path/to/students.js";

getStudentName(73);
// Suzy
```

如果`getName`被改成使用`export default`的話，我們可以透過以下方式來導入:

```javascript
import getName from "/path/to/students.js";

getName(73);   // Suzy
```

這裡省略了`{..}`，這也代表你只能導入預設的API，若你也想替它改變名稱，可以這樣做:

```javascript
import { default as getOtherName, /* .. others .. */ }
   from "/path/to/students.js";

getOtherName(73);   // Suzy
```

最後一種導入的方式可以透過`*`一次性的導入所有公有API，但相對的你必須一定要替它命名:

```javascript
import * as Student from "/path/to/students.js";

Student.getName(73);   // Suzy
```

## 總結

不論你使用上面哪一種方式來編寫模組，重要的是要知道模組所帶來的好處與效益，其對於我們在組織程式碼能帶來巨大的幫助。

這一章也是原文第二冊[You Don't Know JS Yet: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)的最後一章。在這冊中，講述了許多JS被廣泛討論的議題(hoisting、closures等等)，希望這些筆記能對你有些幫助，由於在撰寫這些文章的同時，原文正在替後面幾冊進行改版，後面的筆記會再慢慢補上。

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
