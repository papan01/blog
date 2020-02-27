---
title: "You don't know JavaScript Yet:#5 說明語彙範疇"
date: "2020-02-23"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在前一篇文章中有稍微介紹了一點語彙範疇(Lexical Scope)的概念:*在編譯期確定程式碼的所屬範疇，將此範疇模型稱為「語彙範疇」*。
在此篇當中則會以一些隱喻來更深入描述它的行為，理解JS Engine、Compiler與Scope Manager之間是如何交互運作的。

## 第一個隱喻:彈珠與泡泡

第一個例子是將理解範疇比喻為有顏色的彈珠與泡泡。

想像你有很多個紅色、藍色與綠色的彈珠，要將他們分類到對應顏色的泡泡，當你想要某種顏色的彈珠時，你就知道你該去哪個泡泡拿。
而這個比喻中，變數就是彈珠，而泡泡就是範疇(函式或者區塊中)，當然這裡只是概念上的想像，實際上每個彈珠的顏色會取決於發現彈珠的範疇(泡泡)。

拿上一篇的程式作為例子:

```javascript
// outer/global scope: RED

var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getStudentName(studentID) {
    // function scope: BLUE

    for (let student of students) {
        // loop scope: GREEN

        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);

console.log(nextStudent);
// Suzy
```

這裡用註解標記了三個範疇(泡泡)，透過下圖可以更清楚的看出各個範疇所涵蓋的範圍:

![YDKJSY-5-1](/static/images/you-dont-know-js-yet-5-1.png)
<figcaption><em>Colored Scope Bubbles(https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/images/fig2.png)</em></figcaption>

1. 紅色泡泡為全域範疇，其中包含三個變數(Variable)/識別字 (Identifier)，`students`(line 1)、`getStudentName`(line 8)與`nextStudent`(line 16)。
2. 藍色泡泡為函式`getStudentName(..)`(line 8)的範疇，只包含一個變數/識別字 ，參數`studentID`(line 8)
3. 綠色泡泡為`for loop`(line 9)的範疇，只包含一個變數/識別字 ，`student`(line 9)。

[[info]]
|實際上`studentID`並不完全屬於藍色泡泡的範疇，將在稍後介紹隱含範疇(Implied Scopes)中的參數範疇(Parameter Scope)。

每個範疇都被定義於函式(functions)或者區塊(blocks)中，彼此有可能被另外一個泡泡包覆著(巢狀範疇)，而每個ㄧ個範疇不會同時隸屬於其他範疇。每個彈珠(變數/識別字 )的顏色都根據所在的範疇(泡泡)而不同。

JS engine在編譯的過程中，當遇到了變數時，就會去詢問"*我現在在哪一個範疇(泡泡)當中?*"，該變數被指定為相同的顏色，表示它屬於該範疇(泡泡)。從上面的例子我們可以來看看範疇有哪些行為:

- 綠色泡泡被包覆於藍色泡泡中，藍色泡泡又被包覆於紅色泡泡中，範疇可以為任意深度的巢狀範疇。
- 當需要存取變數/識別字 時，只能從當前範疇往外找，而不能向下搜尋，紅色泡泡只能拿紅色的彈珠，不能去拿藍色或者綠色的彈珠，而藍色泡泡可以拿紅色與藍色的彈珠，但不能拿綠色彈珠的，綠色泡泡則可以拿紅色、藍色與綠色的彈珠。
- 在執行期時，我們可以將那些非宣告的變數(non-declaration)確認顏色的過程稱為查找(lookup)。第9行`students`是引用而不是宣告，此時JS engine不知道它的顏色，因此它會詢問當前藍色泡泡中是否有此變數，若沒有則往外去找，接著詢問紅色泡泡是否有此變數，而紅色泡泡中有名為`students`的變數，因此可以確認其為紅色彈珠。

JS engine通常不會在執行期去確認這些變數屬於哪一個範疇，這裡的查找(lookup)只是用於幫助我們理解概念。再編譯期，幾乎所有引用的變數都是已知它來自哪個範疇，所以這些變數的範疇是在此確認的，並與其他變數儲存在一起，以避免不必要的查找(lookup)。

當我讀完原文時發現自己對於變數(Variable)/識別字 (Identifier)的定義有點模糊，所以這裡稍微先整理一下這兩個名詞的意思:

- **識別字 (identifier)**: 識別字 用於在程式中的一個實體名稱，變數也是識別字 的一種。其他像是class name，function name等等都是屬於識別字 (意味著有進行宣告的動作)。
- **變數(Variable)**: 變數則為一個名稱用於賦予記憶體位置，通常夾帶一個值(value)，可以在程式執行時對其進行修改。

### 參數範疇(Parameter Scope)

考慮以下情況:

```javascript
// outer/global scope: RED(1)

function getStudentName(studentID) {
    // function scope: BLUE(2)

    // ..
}
```

這裡的`studentID`只是一般的參數，所以與我們之前介紹的沒什麼不同。但是考慮參數有可能有預設值或者使用ES6的rest(`使用...`)作為參數，情況就不一樣了:

```javascript
// outer/global scope: RED(1)

function getStudentName(/* BLUE(2) */ studentID = 0) {
    // function scope: GREEN(3)

    // ..
}
```

可以看到參數的部分自成一個範疇，在非一般參數形式會有許多極端的情況，將其視為一個範疇能更有效地控制它們。

```javascript
function getStudentName(studentID = maxID, maxID) {
    // ..
}
```

此段程式碼會造成TDZ(Temporal Dead Zone) error，有關TDZ的描述會在後面章節補上，這裡就把它想為在賦值前對其進行存取，就會導致error，因為參數由左向右操作，
`maxID`已經被定義，但是它還沒進行初始化，若反過來就不會產生TDZ error。

```javascript
function getStudentName(maxID,studentID = maxID) {
    // ..
}
```

在考慮另外一種情況，將函式當作參數，並且給予預設值，此時情況會更為複雜，它會針對參數產生自己的閉包(closure):

```javascript
function whatsTheDealHere(id,defaultID = () => id) {
    id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 5
```

會造成此結果是因為我們在裡面對`id`進行賦值，而`defaultID`的閉包會包含參數`id`，但若我們在裡面定義`id`情況就不一樣了:

```javascript
function whatsTheDealHere(id,defaultID = () => id) {
    var id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 3
```

裡面的`var id = 5`覆蓋了參數`id`，但是結果`defaultID`的閉包卻是包含參數`id`，由此可證明參數列上擁有範疇的存在。

```javascript
function whatsTheDealHere(id,defaultID = () => id) {
    var id;

    console.log(`local variable 'id': ${ id }`);
    console.log(`parameter 'id' (via closure): ${ defaultID() }`);

    console.log("reassigning 'id' to 5");
    id = 5;

    console.log(`local variable 'id': ${ id }`);
    console.log(`parameter 'id' (via closure): ${ defaultID() }`);
}

whatsTheDealHere(3);
// local variable 'id': 3
// parameter 'id' (via closure): 3
// reassigning 'id' to 5
// local variable 'id': 5
// parameter 'id' (via closure): 3
```

這裡比較有疑問的是第一個`id`打印的訊息為什麼是`3`而不是`undefind`，在這種特殊情況下(出於傳統兼容性問題)JS不會初始化為`undefind`，而是使用參數`id`將其初始化為`3`，
而兩個`id`實際上是不一樣的變數，它們隸屬於不同範疇中，透過`defaultID`他始終透過閉包打印`3`，當然在實際運用上不會看到如此醜陋的寫法，應該盡量避免使用。

## 第二個隱喻:朋友間的對話

先來介紹一下這幾位朋友的角色:

- ***Engine***: 負責整個JS程式從頭到尾的編譯與執行。
- ***Compiler***: Engine的朋友之一，負責解析與生成程式碼。
- ***Scope Manager***: Engine的另一個朋友，收集並維護所有已宣告的變數/識別字 的查找列表，並且制定一些讓正在執行的程式碼存取的規則。

我們一樣使用前面的程式碼作為範例:

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

首先我們先來看看`var students = [..]`它如何宣告、初始化與賦值的部分。我們的朋友Engine它會看到兩個不同的操作，第一個是在編譯期Compiler處理的過程，第二個是執行期由Engine處理的過程。

首先我們來關注Compiler的部分，關於Compiler在編譯期做了些什麼，可以參考我上一篇[編譯程式碼](https://papan01.com/archives/2020-01-31-you-dont-know-js-yet-4#%E7%B7%A8%E8%AD%AF%E7%A8%8B%E5%BC%8F%E7%A2%BC)，一旦Compiler生成程式碼之後就有諸多細節需要考慮，首先我們可以合理的假設Compiler會對其配置記憶體，標記它為`students`，然後Engine將後面數組的reference指派給它等等:

1. 當Compiler遇到`var students`時，它會去詢問Scope Manager是否變數`students`已經存在於某個特定的範疇中，若已存在則忽略此宣告並且繼續往下，否則，Compiler會生成程式碼要求Scope Manager在執行期時創建一個名為`students`的變數在範疇中。

2. Compiler將生成程式碼供Engine執行時處理`students = []`賦值的動作，Engine在執行時會去詢問Scope Manager是否有變數`students`在此範疇當中，若沒有則會往其它範疇找(下面會介紹巢狀範疇(Nested Scope))，一旦Engine找到此變數的位置，就會將`[..]`的reference進行賦值的動作。

下面我們用對話的方式呈現，第一階段為Compiler與Scope Manager的對話:

> ***Compiler***:Hi *Scope Manager(全域範疇)*，我發現了一個識別字 宣告為`students`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:沒有，沒聽說過，所以我剛已為您創建了它。
>
> ***Compiler***:Hi *Scope Manager(全域範疇)*，我發現了一個識別字 宣告為`getStudentName`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:沒有，沒聽說過，所以我剛已為您創建了它。
>
> ***Compiler***:Hi *Scope Manager(全域範疇)*，`getStudentName`指向一個函式，我們需要一個新的範疇。
>
> ***Scope Manager(函式範疇)***:了解，這裡就是。
>
> ***Compiler***:Hi *Scope Manager(函式範疇)*，我發現了一個參數名為`studentID`，你有聽過它嗎?
>
> ***Scope Manager(函式範疇)***:沒有，但我已將其註冊於此範疇中。
>
> ***Compiler***:Hi *Scope Manager(函式範疇)*，我找到了一個`for`迴圈，我們需要一個新的範疇。
>
> ...

接著我們來看執行時的對話，這次的主角換成Engine與Scope Manager:

> ***Engine***:Hi *Scope Manager(全域範疇)*，在我們開始前，你可以幫我找一下識別字 `getStudentName`嗎，好讓我為它配置功能。
>
> ***Scope Manager(全域範疇)***:Yep，給你。
>
> ***Engine***:Hi *Scope Manager(全域範疇)*，我找到了target reference名為`students`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:有，它已經被宣告於這個範疇中，且已將它初始化為`undefinded`，可進行賦值了，給你。
>
> ***Engine***:Hi *Scope Manager(全域範疇)*，我找到了target reference名為`nextStudent`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:有，它已經被宣告於這個範疇中，且已將它初始化為`undefinded`，可進行賦值了，給你。
>
> ***Engine***:Hi *Scope Manager(全域範疇)*，我找到了source reference名為`getStudentName`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:有，它已經被宣告於這個範疇中，給你。
>
> ***Engine***:太好了，`getStudentName`是一個函式，我將執行它。
>
> ***Engine***:Hi *Scope Manager(全域範疇)*，我們現在需要實例化函式的範疇。
>
> ...

[[info]]
|這裡有提到target與source，可以參考我前一篇所寫的[compiler的細語](https://papan01.com/archives/2020-01-31-you-dont-know-js-yet-4#compiler%E7%9A%84%E7%B4%B0%E8%AA%9E)。

我們整理一下針對`var students = [..]`處理的兩個步驟:

1. Compiler將先宣告好範疇中的變數。
2. 而Engine執行時，會對變數進行賦值的動作，透過詢問Scope Manager進行查找的動作，一但找到就進行賦值。

## 巢狀範疇(Nested Scope)

在前面的例子Engine在遇到`getStudentName`的source reference會要求Scope Manager進行實例化函式範疇，接著透過查找參數`studentID`
將`73`賦予給它。`getStudentName(..)`在全域範疇中，而for迴圈又在`getStudentName(..)`的範疇中，所以範疇可以是任意深度的巢狀範疇。

每一個範疇都有屬於它們自己的Scope Manager，每次執行都會實例化一次，並且自動對裡面的識別字 進行註冊(此動作稱之為hoisting，在之後的文章中介紹)。任何識別字 來自一個函式的宣告，都會自動的被初始化使其關聯於該函式，而任何識別字 透過`var`進行宣告(同理`const`、`let`也是)，都會自動的被初始化為`undefined`以便可以使用，否則，變數都將保留為未初始化的狀態(屬於TDZ的狀態)並且不能被使用直到它被宣告與初始化後才能夠被執行。

我們來看一下這段語句`for (let student of students) {`，`students`不再該範疇當中，它是如何找到它的:

> ***Engine***:Hi *Scope Manager(函式範疇)*，我找到了source reference名為`students`，你有聽過它嗎?
>
> ***Scope Manager(函式範疇)***:沒有，我從來沒聽過它，您可能需要去外面的範疇尋找。
>
> ***Engine***:Hi *Scope Manager(全域範疇)*，我找到了source reference名為`students`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:有，它已經被宣告於這個範疇中，給你。

### 查找失敗(Lookup Failures)

如果Engine不斷地往外詢問也找不到該識別字 ，則就會產生錯誤條件。錯誤條件視其為嚴格模式或者變數的規則(target或者source)而有不同。

#### 未定義的混亂

當變數為source時，如果在進行查找中未找到該識別字 ，則會被視為未宣告(undeclared)的變數，會引發`ReferenceError`。當變數為target時，
如果是運行在嚴格模式下，則會與source類似，被視為未宣告的變數而引發`ReferenceError`。

當拋出error message時，未宣告的變數在多數的JS環境下會顯示類似`Reference Error: XYZ is not defined`，`not defined`在英文中與`undefined`幾乎同義，但在JS中兩者是有落差的，`not defined`在JS中指的是`not declared`或者`undeclared`，而`undefined`則是指我們有找到此變數，但是它並未在這時間點被賦值。但在JS當中依舊使人產生混亂，考慮以下程式碼:

```javascript
var studentName;
typeof studentName;     // "undefined"

typeof doesntExist;     // "undefined"
```

這兩個變數透過`typeof`產生出來的結果一樣，但實際上這很容易造成混亂，因為`doesntExist`並沒有進行宣告，若根據上面的規則來說，它應屬於`undeclared`，所以JS開發人員需要小心的處理這部分。

我們接下來看看若變數為target且在非嚴格模式下，會使其變成意外的全局變數(accidental-global variable):

```javascript
function getStudentName() {
    // assignment to an undeclared variable :(
    nextStudent = "Suzy";
}

getStudentName();

console.log(nextStudent);
// "Suzy" -- oops, an accidental-global variable!
```

看看它們的溝通模式:

> ***Engine***:Hi *Scope Manager(函式範疇)*，我找到了target reference名為`nextStudent`，你有聽過它嗎?
>
> ***Scope Manager(函式範疇)***:沒有，我從來沒聽過它，您可能需要去外面的範疇尋找。
>
> ***Engine***:Hi *Scope Manager(全域範疇)*，我找到了target reference名為`nextStudent`，你有聽過它嗎?
>
> ***Scope Manager(全域範疇)***:沒有，但我們在非嚴格模式下，我幫你創建它了，儘管拿去使用。

在嚴格模式下，會啟動保護的機制:

> ***Scope Manager(全域範疇)***:沒有，我從來沒聽過它，抱歉，我必須拋出`ReferenceError`。

總是使用嚴格模式可以防止這些問題，在現代多數的前端框架都已經默認為開啟的狀態，但仍然需要意識到這點。

## 總結

在過去可能認為範疇只是一簡單的限制變數能存取的範圍，但JS中的範疇又與其他語言有點差異，會根據不同情況而有不同行為，
雖然在平常中我們不太會用到很極端的例子，但理解它們如何運作有助於我們寫程式時的思維。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
- [You don't know JavaScript Yet:#3 深入JS的核心](/archives/2020-01-07-you-dont-know-js-yet-3)
- [You don't know JavaScript Yet:#4 範疇](/archives/2020-01-31-you-dont-know-js-yet-4)