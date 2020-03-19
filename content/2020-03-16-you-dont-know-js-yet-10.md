---
title: "You don't know JavaScript Yet:#10 閉包(Closures)"
date: "2020-03-16"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在[「You don't know JavaScript Yet:#3 深入JS的核心」](/archives/2020-01-07-you-dont-know-js-yet-3)中曾經有談論過關於[閉包(Closures)](/archives/2020-01-07-you-dont-know-js-yet-3#閉包closure)，在前面幾個章節中也時不時會提到閉包，但一直未深入討論這個話題，終於到了這章能好好地探究它了。閉包是程式語言重要的特色之一，它不僅只在JS中存在，若要當一個JS大師，那麼善用閉包是必須熟悉的技巧。

## 初探閉包

「閉包是函式的一種特性，它也只會發生於函式中。」

從上面這句話可以知道，若我們要觀察閉包的行為，只能透過建立函式來觀察，所以在這裡我們沿用前面章節中[「第一個隱喻:彈珠與泡泡」](/archives/2020-02-23-you-dont-know-js-yet-5#第一個隱喻彈珠與泡泡)的例子:

```javascript
// outer/global scope: RED(1)

function lookupStudent(studentID) {
    // function scope: BLUE(2)

    var students = [
        { id: 14, name: "Kyle" },
        { id: 73, name: "Suzy" },
        { id: 112, name: "Frank" },
        { id: 6, name: "Sarah" }
    ];

    return function greetStudent(greeting){
        // function scope: GREEN(3)

        var student = students.find(
            student => student.id == studentID
        );

        return `${ greeting }, ${ student.name }!`;
    };
}

var chosenStudents = [
    lookupStudent(6),
    lookupStudent(112)
];

// accessing the function's name:
chosenStudents[0].name;
// greetStudent

chosenStudents[0]("Hello");
// Hello, Sarah!

chosenStudents[1]("Howdy");
// Howdy, Frank!
```

首先`lookupStudent(..)`會回傳函式`greetStudent(..)`，這裡執行了兩次並將結果儲存於陣列`chosenStudents`當中，我們透過`.name`這個屬性來確認函式是否符合我們的預期，它也確實是`greetStudent(..)`的實例。

接著在每次`lookupStudent(..)`執行完畢後，通常內部變數都會透過GC(garbage collected)自動釋放記憶體，只保留回傳值`greetStudent(..)`，這邊就是我們想要觀察的地方。`greetStudent(..)`允許輸入一個參數`greeting`，同時在它裡面使用了來至於`lookupStudent`範疇中的`students`與`studentID`，這種參考外部範疇變數的行為稱為**閉包(closure)**，若學術一點的說法:*`greetStudent(..)` closes over the outer variables `students` and `studentID`*，這句話傳達幾個意思:

1. `greetStudent(..)`為閉包，意味著它是函是。
2. 閉包將一些變數`students`與`studentID`封存(closes over, 若有更好的翻譯歡迎提供)於它的範疇當中。

在第三章中曾經有給閉包一個簡單的定義:「閉包是讓函式記住與持續訪問在其範疇之外的變數的一種能力，即使該函式在其他範疇中執行也是如此。」，用這個定義來看這個例子，閉包使得`greetStudent(..)`能持續訪問它範疇之外的變數(`students`與`studentID`)即使`lookupStudent(..)`已經執行完畢，所以`students`與`studentID`並不會被GC給清掉而是保留它們的記憶體。在這之後`greetStudent`在全域範疇中執行時，這些變數依然被保留著。

如果JS沒有閉包的能力，當`lookupStudent(..)`回傳`greetStudent(..)`之後，代表`students`與`studentID`都將被GC給回收，若此時在執行任意一個`greetStudent(..)`，它會嘗試去尋找函式範疇BLUE(2)中的變數，但BLUE(2)已經不存在了，所以會拋出`ReferenceError`。但實際上執行`chosenStudents[0]("Hello")`是有跑出`Hello, Sarah`的，所以代表`students`與`studentID`都還存在於記憶體當中，這就是閉包的能力。

在上面的例子當中我們還遺漏了一點小細節，上面的[箭頭函式(arrow functions)](/archives/2020-02-27-you-dont-know-js-yet-6#箭頭函式arrow-functions)也是一個範疇，這是我們常疏忽的地方:

```javascript
var student = students.find(
    student =>
        // function scope: ORANGE(4)
        student.id == studentID
);
```

ORANGE(4)中參考了BLUE(2)的`studentID`，這個箭頭函式是基於持有`studentID`的閉包，所以實際上`greetStudent(..)`沒有持有`studentID`，不過這不影響運作，但了解事實有助於理解閉包，即使是小小的箭頭函式也能擁有閉包。

讓我們看看一個經常被引用作為閉包的例子:

```javascript
function adder(num1) {
    return function addTo(num2){
        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

每一次實例化`adder(..)`都將變數`num1`封存於`addTo(..)`中，當`adder(..)`執行完畢也不會釋放`num1`的記憶體，所以當上面執行`add10To(15)`時，就等同於`10 + 15`，每次執行`add10To(..)`都會是`10 + num2`。

但在這裡要說一個很容易被忽略的重要細節，前面再介紹[「語彙範疇」](/archives/2020-02-23-you-dont-know-js-yet-5)時，我們知道範疇決定於編譯期，但在上面的例子，每次進行實例化`adder(..)`都會創建一個新的函式`addTo(..)`，並且為它們建立新的閉包，儘管閉包是基於語彙範疇，但閉包的特徵表現於函式實例化的時候。

### 即時鏈結，而非快照

在前面的兩個例子中，我們透過閉包保存的變數來讀取值，感覺很像是當我們要讀取值時，閉包在某個時間點將值的快照(閉包當時的值)傳給我們，這是很多人容易誤解的地方。

閉包實際上為即時鏈結，你不只可以對變數進行讀取的動作，也能夠進行賦值的動作，這代表閉包所封存的是一個完整的變數，這也是閉包為什麼如此強大並且用在許多程式語言上的原因。

讓我們來看看例子:

```javascript
function makeCounter() {
    var count = 0;

    return getCurrent(){
        count = count + 1;
        return count;
    };
}

var hits = makeCounter();

hits();     // 1
hits();     // 2
hits();     // 3
```

變數`count`被封存於內部函式`getCurrent()`中，`hits()`每次執行都會使`count`遞增。儘管閉包所封存的變數通常來至於函式中，但這並非必要的，只要任意範疇中有一個函式，且這函式使用外部範疇的變數即可:

```javascript
var hits;
{   // an outer scope (but not a function)
    let count = 0;
    hits = function getCurrent(){
        count = count + 1;
        return count;
    };
}
hits();     // 1
hits();     // 2
hits();     // 3
```

[[info]]
|這裡使用函式表達式的原因於前一章有提到，避免[FiB](/archives/2020-03-12-you-dont-know-js-yet-9#function-declarations-in-blocks-fib)所帶來的危害。

還有一種錯誤的狀況也很常見:

```javascript
var keeps = [];

for (var i = 0; i < 3; i++) {
    keeps[i] = function keepI(){
        // closure over `i`
        return i;
    };
}

keeps[0]();   // 3 -- WHY!?
keeps[1]();   // 3
keeps[2]();   // 3
```

你可能期待`keeps[0]()`會回傳`0`，但由於變數`i`是透過`var`進行宣告的，在第八章的[「可以使用變數的時間點」](/archives/2020-03-06-you-dont-know-js-yet-8#可以使用變數的時間點)中有提過，若使用`var`宣告的變數會與最近的函式範疇連結(若沒有函式範疇則與全域範疇連結)，所以這裡你可以看成如下:

```javascript
var keeps = [];
var i;
for (i = 0; i < 3; i++) {
    keeps[i] = function keepI(){
        // closure over `i`
        return i;
    };
}

keeps[0]();   // 3 -- WHY!?
keeps[1]();   // 3
keeps[2]();   // 3
```

當`for`迴圈執行結束後，最後`i`的值為`3`，前面提到閉包並非使用快照，而是即時鏈結，這邊就是一個好的證明。所以要解決這問題的最快方法就是把`var`改成`let`即可:

```javascript
var keeps = [];

for (let i = 0; i < 3; i++) {
    // the `let i` gives us a new `i` for
    // each iteration, automatically!
    keeps[i] = function keepEachI(){
        return i;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

這樣在迴圈中每次都會建立一個獨立的`i`出來，就不會有上面的問題。

### 如果沒辦法看見它呢

如果一個閉包它存在於程式的某處，但我們無法察覺到它的存在，這重要嗎?實際上不重要。重要的是我們能透過觀察來察覺閉包的存在。

我們用幾個例子來強調這點:

```javascript
function say(myName) {
    var greeting = "Hello";
    output();

    function output() {
        console.log(
            `${ greeting }, ${ myName }!`
        );
    }
}

say("Kyle");
// Hello, Kyle!
```

內部函式`output()`使用了`greeting`與`myName`，但調用`output()`也在同一個範疇當中，所以這只是單純的語彙範疇且並沒有閉包存在，但它看起來像是有閉包存在一樣。

再看看另外一個例子:

```javascript
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getFirstStudent() {
    return function firstStudent(){
        return students[0].name;
    };
}

var student = getFirstStudent();

student();
// Kyle
```

實際上全域變數沒辦法透過觀察來確認它是否用於閉包，因為它在任何地方都能夠被使用，且在範疇鏈當中沒有比它在更上層的範疇了。`students`雖然被用於內部函式`firstStudent()`當中，但由於`students`位處於全域範疇當中，透過這樣調用跟使用正常的語彙範疇沒什麼區別。所有函式都能使用全域變數，無論該程式語言是否支援閉包，使用閉包有點多此一舉的感覺。

下一個例子中，變數若沒有被使用到，就不會有閉包的存在:

```javascript
function lookupStudent(studentID) {
    return function nobody(){
        var msg = "Nobody's here yet.";
        console.log(msg);
    };
}

var student = lookupStudent(112);

student();
// Nobody's here yet.
```

內部函式`nobody()`中未曾使用到`studentID`也未封存任何變數，它只用到自己範疇內的`msg`，當執行`lookupStudent(..)`時，`studentID`因為沒有被`nobody()`使用到，所以最後GC會對其進行記憶體清除的動作。

最後一個例子，若函式未被調用，儘管它有閉包的行為存在，但它依然不算是一個閉包:

```javascript
function greetStudent(studentName) {
    return function greeting(){
        console.log(
            `Hello, ${ studentName }!`
        );
    };
}

greetStudent("Kyle");

// nothing else happens
```

由於這邊調用`greetStudent(..)`但未使用一個變數接收它的回傳值，所以當執行完畢回傳值也直接被回收掉了，技術上來說JS在短暫時間內有閉包的存在，但因為我們無法觀察到，所以也沒什麼意義。

### 可觀察的定義

「當一個函式使用外部範疇的變數時，即使在無法存取這些變數的範疇中執行這個函式，也能觀察到閉包(Closure is observed when a function uses variable(s) from outer scope(s) even while running in a scope where those variable(s) wouldn't be accessible.)。」

上面這段(翻的不好請見諒😓)有幾個意義存在:

- 必須有一個函式被調用。
- 這個函式至少使用一個外部範疇的變數。
- 必須再與這個(些)變數不同的範疇中，使用這個函式。

這意味著我們應該以是否能夠觀察到閉包會對程式造成影響或者產生什麼行為來定義閉包，而不是將閉包透過某種學術定義來說明它。

## 閉包的生命週期與垃圾回收(Garbage Collection, GC)

由於閉包本質上與函式的實例關聯著，只要這個函式reference一直被使用著，閉包中的變數也會持續存在著。

假設你有十個函數全部都封存某個變數，但隨著時間流逝，其中九個函式reference已經被丟棄了，但只要還有一個函式的reference還存在，仍然會保留該變數，直到最後一個函式reference被丟棄，這個變數就會被GC處理掉。

這對於程式的效能來說很重要，因為這代表著如果有一堆函式封存了一堆變數，這些變數都存在於記憶體當中，它們可能意外地阻止了GC做清除的動作，進而導致記憶體的過度使用，所以當函式reference不再被需要使用時就進行丟棄的動作是很重要的。

考慮一下程式碼:

```javascript
function manageBtnClickEvents(btn) {
    var clickHandlers = [];

    return function listener(cb){
        if (cb) {
            let clickHandler =
                function onClick(evt){
                    console.log("clicked!");
                    cb(evt);
                };
            clickHandlers.push(clickHandler);
            btn.addEventListener(
                "click",
                clickHandler
            );
        }
        else {
            // passing no callback unsubscribes
            // all click handlers
            for (let handler of clickHandlers) {
                btn.removeEventListener(
                    "click",
                    handler
                );
            }

            clickHandlers = [];
        }
    };
}

// var mySubmitBtn = ..
var onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt){
    // handle checkout
});

onSubmit(function trackAction(evt){
    // log action to analytics
});

// later, unsubscribe all handlers:
onSubmit();
```

我們建立函式`checkout(..)`與函式`trackAction(..)`作為參數傳給`cb`進行監聽點擊事件並且函式`onClick`會對`cb`進行封存。在最後一行我們不帶任何參數用來執行清除的動作，這將會取消所有曾經監聽過的點擊事件並且把`clickHandlers`清成空陣列，這代表經由`cb`使用`checkout(..)`與`trackAction(..)`的函式reference都一併被清除了，所以GC就會釋放它們的記憶體。

考慮程式整體運行狀況以及效能，將不再需要使用的事件取消監聽比進行監聽更為重要。

### 封存部分變數還是整個範疇

我們應該只封存我們有參考到的變數，還是將整個範疇鏈的變數都進行封存呢?

概念上來說，只封存有參考到的變數就好，但實際情況沒有我們想的那麼簡單，考慮以下程式碼:

```javascript
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record){
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // sort by grades, descending
        grades.sort(function desc(g1,g2){
            return g2 - g1;
        });

        // only keep the top 10 grades
        grades = grades.slice(0,10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

var addNextGrade = manageStudentGrades([
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    // ..many more records..
    { id: 6, name: "Sarah", grade: 91 }
]);

// later

addNextGrade(81);
addNextGrade(68);
// [ .., .., ... ]
```

函式`manageStudentGrades(..)`接收一組學生成績的陣列並且回傳函式`addGrade(..)`的reference給`addNextGrade`，每當呼叫`addNextGrade(..)`就會新增一個成績，接著將成績排序後取前十名，`grades`透過閉包保存於`addGrade(..)`之中，這是其中一個被`addGrade(..)`封存的變數，還有另外一個被封存的對象是函式`sortAndTrimGradesList()`，函式也是閉包封存的對象之一。

想想看還有哪些是被封存的變數?

函式`getGrade(..)`有被封存嗎?它只被用於`manageStudentGrades(..)`範疇的一開始，但沒被用於`addGrade(..)`與`sortAndTrimGradesList()`中，所以它沒有被封存。

再看看`studentRecords`，它與`getGrade(..)`一樣只被用於範疇的一開始，若`studentRecords`有被封存的話，那麼對記憶體來說絕對是一大負擔，但我們透過觀察，實際上它並沒有被封存。

根據我們前面理解閉包的定義，當`manageStudentGrades(..)`執行完畢時，未被封存的變數都會被GC給清除掉。我們可以嘗試使用在chrome上的DevTools中進行Debug，設立一個中斷點在`addGrade(..)`中，接著可以注意到變數`studentRecords`未被列出它的值，這能夠證明它並沒有被封存。

但是上述這種驗證方式可靠嗎?看看下面例子:

```javascript
function storeStudentInfo(id,name,grade) {
    return function getInfo(whichValue){
        // warning:
        //   using `eval(..)` is a bad idea!
        var val = eval(whichValue);
        return val;
    };
}

var info = storeStudentInfo(73,"Suzy",87);

info("name");
// Suzy

info("grade");
// 87
```

注意到內部函式`getInfo`並沒有封存`id`、`name`或者`grade`，但是我們透過執行`info(..)`仍然可以獲得這些值，這違背我們上面談論到的。

所以根據這邊的結果，所有的變數不論是否有被內部函式參考都會被閉包保留著。那麼回到我們一開始的議題，這樣是否傾向於整個範疇鏈的變數都會被封存呢?視情況而定。

許多現代化的JS engine都會做最佳化的動作，將那些未明確使用的變數從閉包中移除。但正如我們上面看到使用`eval(..)`的情況，在某些情況下JS engine則無法做優化的動作，這時閉包中就會擁有所有的原始變數。換句話說，閉包必須根據不同的範疇進行最佳化的動作，它會盡量減少變數保留的數量，這結果就如同我們一開始說明閉包那樣，沒用到的變數都將被GC清除掉。

但在幾年前，許多JS engine都沒有進行這種優化，若你運行在老舊的設備或者未更新的瀏覽器中，記憶體占用的時間會比我們想像中還要來的長。由於這個優化並非在規範當中，所以我們不該依賴每台電腦的JS engine都會幫我們做這種事。

若你使用了一個較大的陣列或者物件，當你不再使用它並且不希望保留它的記憶體時，進行手動丟棄的動作(有點像養成良好資源回收的概念)，而不是依賴閉包的優化與GC。

讓我們試著修改前面`manageStudentGrades(..)`的例子，變數`studentRecords`由於我們不再使用它了，所以可以透過下面方式來進行手動清除:

```javascript
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    // unset `studentRecords` to prevent unwanted
    // memory retention in the closure
    studentRecords = null;

    return addGrade;
    // ..
}
```

我們並沒有真正的從閉包中清除掉`studenRecords`，因為那並不再我們能控制的範圍內，我們只能確保它就算被遺留於閉包當中，它至少不會占用太多的記憶體，至於最後清除這個變數的工作，就交給GC處理就好。除了`studenRecords`以外，實際上`getGrade`也是我們需要清理的對象。

了解閉包在程式中出現的位置以及它包含哪些變數是很重要的，仔細的管理這些閉包，僅保留最基本的需求而不浪費多餘的記憶體，不論在哪種程式語言中都是很重要的一環。

## 另一種角度看閉包

我們先來看看前面的例子:

```javascript
// outer/global scope: RED(1)

function adder(num1) {
    // function scope: BLUE(2)

    return function addTo(num2){
        // function scope: GREEN(3)

        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

我們當前的觀點認為，無論在何處傳遞和調用函式，閉包都會保留一個回去原始範疇的隱藏路徑，以便於訪問被封存的變數。我們透過下圖來說明此概念：

![YDKJSY-10-1](/static/images/you-dont-know-js-yet-10-1.png)
<figcaption><em>Fig.1:Visualizing Closures(https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/images/fig4.png)</em></figcaption>

上面例子中的內部函式`addTo(..)`透過函式`adder(..)`回傳它的實例給RED(1)範疇中的變數(`add10To`與`add42To`)，但我們可以用另外一種思考方式，可以假想回傳的函數實例實際上是回傳它所屬位置的範疇，當然這也包含整個範疇鏈，也就是說這個賦值的動作實際上是把整個範疇都傳遞過去，而非只是一個函式，我們透過下圖來觀察與上面的差異:

![YDKJSY-10-2](/static/images/you-dont-know-js-yet-10-2.png)
<figcaption><em>Fig.2:Visualizing Closures (Alternative)(https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/images/fig5.png)</em></figcaption>

從上圖可以看到函式`adder(..)`每次都會創立一個新的BLUE(2)範疇，其中包含了變量`num1`，以及函式`addTo(..)`的實例與它的範疇GREEN(3)，與*Fig.1*不同的地方在於`addTo(..)`它的位置留在BLUE(2)之中，然後`add10To`與`add42To`移到RED(1)之中，且它們不再只是表示`addTo(..)`的實例。當`add10To`被執行時，它依舊存在於BLUE(2)，所以它可以很自然的存取範疇鏈的變數。

所以上面兩個描述方式哪一個是對的呢?實際上兩個都是對的，只是用範疇鏈的觀點來看待閉包，更貼近我們實際使用程式時的狀況。閉包描述了一個函式的實例不僅僅只是一個函式而已，還有其背後連結整個範疇鏈的能力。不論你選擇哪一種方式來理解閉包，我們透過程式觀察到的狀況都是一樣的。