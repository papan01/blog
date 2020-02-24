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

## 彈珠與泡泡

第一個例子是將理解範疇比喻為有顏色的彈珠與泡泡。

想像你有很多個紅色、藍色與綠色的彈珠，要將他們分類到對應顏色的泡泡，當你想要某種顏色的彈珠時，你就知道你該去哪個泡泡拿。
而這個比喻中，變量就是彈珠，而泡泡就是範疇(函式或者區塊中)，當然這裡只是概念上的想像，實際上每個彈珠的顏色會取決於發現彈珠的範疇(泡泡)。

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

1. 紅色泡泡為全域範疇，其中包含三個變量/標識符，`students`(line 1)、`getStudentName`(line 8)與`nextStudent`(line 16)。
2. 藍色泡泡為函式`getStudentName(..)`(line 8)的範疇，只包含一個變量/標識符，參數`studentID`(line 8)
3. 綠色泡泡為`for loop`(line 9)的範疇，只包含一個變量/標識符，`student`(line 9)。

[[info]]
|實際上`studentID`並不完全屬於藍色泡泡的範疇，將在稍後介紹隱含範疇(Implied Scopes)中的參數範疇(Parameter Scope)。

每個範疇都被定義於函式(functions)或者區塊(blocks)中，彼此有可能被另外一個泡泡包覆著(巢狀範疇)，而每個ㄧ個範疇不會同時隸屬於其他範疇。每個彈珠(變量/標識符)的顏色都根據所在的範疇(泡泡)而不同。

JS engine在編譯的過程中，當遇到了變量時，就會去詢問"*我現在在哪一個範疇(泡泡)當中?*"，該變量被指定為相同的顏色，表示它屬於該範疇(泡泡)。從上面的例子我們可以來看看範疇有哪些行為:

- 綠色泡泡被包覆於藍色泡泡中，藍色泡泡又被包覆於紅色泡泡中，範疇可以為任意深度的巢狀範疇。
- 當需要存取變量/標識符時，只能從當前範疇往外找，而不能向下搜尋，紅色泡泡只能拿紅色的彈珠，不能去拿藍色或者綠色的彈珠，而藍色泡泡可以拿紅色與藍色的彈珠，但不能拿綠色彈珠的，綠色泡泡則可以拿紅色、藍色與綠色的彈珠。
- 在執行期時，我們可以將那些非聲明性的變量(non-declaration)確認顏色的過程稱為查找(lookup)。第9行`students`是引用而不是聲明，此時JS engine不知道它的顏色，因此它會詢問當前藍色泡泡中是否有此變量，若沒有則往外去找，接著詢問紅色泡泡是否有此變量，而紅色泡泡中有名為`students`的變量，因此可以確認其為紅色彈珠。

JS engine通常不會在執行期去確認色些變量屬於哪一個範疇，這裡的查找(lookup)只是用於幫助我們理解概念。再編譯期，幾乎所有引用的變量都是已知其它來自哪個範疇，所以這些變量的範疇是在此確認的，並與其他變量儲存在一起，以避免不必要的查找(lookup)。

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
而兩個`id`實際上是不一樣的變量，它們隸屬於不同範疇中，透過`defaultID`他始終透過閉包打印`3`，當然在實際運用上不會看到如此醜陋的寫法，應該盡量避免使用。
