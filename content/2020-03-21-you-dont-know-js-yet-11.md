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

現代前端框架很多都是使用Component為單元來架構程式碼，這種趨勢也進一步推動封裝的精神。將所有建構搜尋目錄的相關內容(功能、樣式或者HTML等等)整合到一個Component中，並且將其命名為`SearchList`，使其能被其他部分的程式碼使用。

[「最少曝光原則(The Principle Of Least Exposure, POLE)」](/archives/2020-03-12-you-dont-know-js-yet-9#最少曝光原則)在前面的章節中有提過，該原則旨在把變數/函式盡量以私有的(private)方式來管理，以最低限度公開必要的變數/函式。在JS中，我們經常透過建立語彙範疇來達到此目的。

封裝與POLE的目的都是希望能讓我們更好的組織程式碼，當我們知道某些事物在哪裡，它本身的邊界或者與其他事物的連接點能清晰明瞭時，就能讓程式碼更具可讀性且更容易維護，避免過度曝光變數與函式能減少Bug的產生。

這些是將JS程式碼組織到模組中的一些好處。

## 什麼是模組(Module)

模組(module)是收集相關資料與功能，將它們組合成一個邏輯單元，其特徵區分為隱藏私有訊息與公有可訪問的訊息，可被訪問的部分通常稱為"公有API"。模組屬於有狀態的，當它在運作的過程中，隨著時間推移會進行資料維護的動作，我們可以透過這些公有API進行訪問以及更新。

為了更好的理解模組是什麼，底下我們將那些設計程式碼架構的方式分為模組與非模組來進行比較。

### Namespaces (無狀態類)

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

### Data Structures (有狀態類)

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

### Modules (有狀態的存取控制)

為了體現模組模式的精神，我們不只要將資料與功能組合成一個有狀態的邏輯單元，同時還加入存取機制(私有/公有)。

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

#### Module Factory(用於多個實例)

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

## Node CommonJS Modules

在前面的章節中曾經在另外一個議題上討論過[「Node CommonJS Modules」](/archives/2020-03-03-you-dont-know-js-yet-7#node)。它與前面討論的經典模組不太一樣，CommonJS modules是基於檔案來管理模組，每一個檔案都是一個模組，所以在這檔案中你可以任意的使用IIFE或者模組工廠。

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

變數`records`與函式`getName(..)`位於此模組中最上層的範疇，但這不是全域範疇，這曾經在前面的章節有討論過，所以你可以把這個範疇想成是上面例子中`defineStudent()`內的範疇。若要在CommonJS中公開API給外部使用，可以將欲公開的變數或函式添加到`module.exports`的屬性中。至於要將`module.exports`放置於哪裡沒有硬性的規定，建議將它們統一置於模組的最上面或最下面。

