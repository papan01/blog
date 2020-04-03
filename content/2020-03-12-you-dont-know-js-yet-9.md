---
title: "You don't know JavaScript Yet:#9 限制範疇曝光"
date: "2020-03-12"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---
前面的章節中介紹有關於範疇與變數在JS中是如何運作的，在這一章節將討論為什麼會需要不同階層的範疇(函式範疇與區塊範疇)來組織程式碼，以及如何減少範疇中變數過度曝光。

## 最少曝光原則

在計算機科學、資訊安全或者其他領域中，"**最小權限原則(The Principle Of Least Privilege(POLP))**"為一個用於軟體安全架構的設計理念，它與我們當前要討論的"**最少曝光原則(The Principle Of Least Exposure(POLE))**"有關，其為POLP的變種。

POLP要求系統中的每一個元件只能訪問當下它所需要的訊息或者資源，以最小的權限、最少的訪問與最少的曝光為原則，達到鞏固整個系統安全，若某個元件故障，對其他元件的影響也會降到最低。

若POLP專注於系統層級元件的設計，POLE則專注於更低層中，範疇間的交互運作的設計。

那麼要如何最大限度的減少範疇之間的接觸呢?其實很簡單，把變數宣告於它應該存在的範疇中就好。

想想看為什麼我們不把變數全部都放在全域範疇就好了?我曾經看過不少人在寫程式時使用了大量的全域變數，當我必須去維護這份程式碼時，那簡直就是惡夢的開始，我很難掌控一個變數它究竟被哪些函式或者範疇使用，我對這些變數進行操作都要小心翼翼的擔心是否會破壞了其它函式的邏輯，最後我選擇進行重構。儘管多數人都認為將變數放在全域範疇是一個壞主意，但這個問題仍然值得討論，當程式中某個範疇將它的變數提供給另外一個範疇時，可能會有以下三種風險:

- **命名衝突(Naming Collisions)**:若在程式中兩個不同地方使用了共享範疇(例如全域範疇)裡面的變數/函式，那麼就會發生命名衝突，如果其中一個地方使用的方式不符合另外一個地方的預期，就容易產生Bug。例如，假設程式中所有的`for`迴圈都共用全域範疇中的變數`i`，很湊巧的我有一個函式A它使用了這個`i`進行迴圈，而迴圈裏頭呼叫了另外一個函式B，而這函式B也使用了全域範疇中的`i`，那麼這個迭代的結果肯定不符合預期。
- **意外行為(Unexpected Behavior)**:若將某個本該隸屬於私有(private)的變數/函式公開於外部給其他範疇使用，這意味著其他開發人員可能會以你意想不到的方式使用，這將會違反預期上的行為導致Bug。例如，有一個陣列是以`number`型別儲存，但有人將其修改為以`bool`或者`string`的型別，那麼那些意想不到的行為也隨之浮現。
- **無意的依賴(Unintended Dependencys)**:若你不必要地公開變數/函式，這等同於邀請其他開發人員使用與依賴這些私有的變數/函式，儘管沒有發生上述**意外行為**的問題，但在將來面對到重構時，你將不能像以前一樣任意的修改變數/函式，因為這可能會導致你間接了破壞其他開發人員的程式，因為那些並不在你的掌控之中。例如，假設你的程式原本依賴於一個陣列是以`number`型別儲存，但後來你認為它應該使用其他資料結構，但因為其他開發人員也是遵循你當初的設計，這時你就必須負起修改所有受影響程式碼的責任。

簡單來說，POLE希望把變數/函式盡量以私有的(private)方式來管理，以最低限度公開必要的變數/函式。

看看一個簡單的例子:

```javascript
function diff(x,y) {
    if (x > y) {
        let tmp = x;
        x = y;
        y = tmp;
    }

    return y - x;
}

diff(3,7);      // 4
diff(7,5);      // 2
```

在函式`diff`中，為了確保`y`減去`x`會大於等於0，當`x`大於`y`時就進行交換的動作。其中`tmp`隱藏於`if`區塊中而不是放於外部範疇，這就是基本的POLE。

## 隱藏於範疇之中

在上面我們已經知道隱藏變數與函式的重要性，但上面的例子還無法展現POLE的重要性，所以我們這裡用另外一個例子作為示範。數學運算中的**階乘(factorial)**相信大家都不陌生，這裡還額外的使用另外一個技巧稱為"**memoization**"，它的用途是減少不必要的重複計算。假設我們已經計算過6!，將會把結果儲存於某個地方，當我們想在算7!時，就只要使用7*6!即可，考慮以下程式碼:

```javascript
var cache = {};

function factorial(x) {
    if (x < 2) return 1;
    if (!(x in cache)) {
        cache[x] = x * factorial(x - 1);
    }
    return cache[x];
}

factorial(6);
// 720

cache;
// {
//     "2": 2,
//     "3": 6,
//     "4": 24,
//     "5": 120,
//     "6": 720
// }

factorial(7);
// 5040
```

我們將所有曾經計算過的結果儲存於`cache`當中，以便保留先前的計算，但這個緩存很顯然應該屬於`factorial(..)`私有的部分，而不應該放它至於外部範疇當中，這違背我們上面提到有關POLE的部分，因為它很有可能被其他人輕易地修改。

所以我們應該怎麼修改它呢?一個簡單的方式是使用一個wrapper function作為中間層，搭配**閉包(closures)**(下一章中介紹)來解決這問題:

```javascript
// outer/global scope

function hideTheCache() {
    // "middle scope", where we hide `cache`
    var cache = {};

    return factorial;

    // **********************

    function factorial(x) {
        // inner scope
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }
}

var factorial = hideTheCache();

factorial(6);
// 720

factorial(7);
// 5040
```

函式`hideTheCache`的作用只是提供了一個範疇將`cache`放置其中，但因為`factorial`需要提供給外部使用同時它又必須存取內部的`cache`，所以它必須待在同個範疇當中，這裡透過`return factorial`將其公開給外部範疇使用，同時堵絕外部直接使用`cache`的可能。

但這衍生一個問題...，這樣做等同於每次我在必須隱藏某些物件時就必須宣告一個wrapper function，這有點太麻煩了，而且還必須想著如何命名`hideTheCache`之類的名稱以避免命名衝突。

解決方式是使用函式表達式來代替，而不是在每次出現這類情況時就定義一個新的函數:

```javascript
var factorial = (function hideTheCache() {
    var cache = {};

    function factorial(x) {
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }

    return factorial;
})();

factorial(6);
// 720

factorial(7);
// 5040
```

你可能會有疑問:"上面的程式碼中還是創建了一個名為`hideTheCache`的函式呀。"，在前面的章節[「函式名稱範疇」](/archives/2020-02-27-you-dont-know-js-yet-6#函式名稱範疇)中有提過，函式表達式的範疇屬於它本身自己，所以它不會被外部範疇所使用，命名的目的是為了讓我們Debug時能清楚的知道錯誤的地方以及讓閱讀你程式碼的人一眼就能知道這函式的用途，若這部分不清楚可以回去看看一下。

### Immediately Invoked Functions Expressions(IIFE)

在上面那個例子中，你可能注意到在尾端似乎多了一個`()`，這實際上就代表我們在宣告的同時也呼叫了這個函式表達式，而這有一個專業的術語稱為:**立即呼叫函式表達式(Immediately Invoked Functions Expressions(IIFE))**，意思就如同它的名稱一般。

當我們要創建一個範疇來隱藏變數/函式時，IIFE就能幫到我們忙。由於它是一個函式表達式，因此可以允許在JS中的任何位置使用。無論是匿名或者命名函式都不影響它的運作:

```javascript
// outer scope

(function(){
    // inner hidden scope
})();

// more outer scope
```

這裡的例子與前面例子中的函式表達式`hideTheCache`有一個需要注意的地方，`function hideTheCache(..)`的外面包覆了`(..)`，在那個例子中是可以省略的，但在這裡的例子，當IIFE作為獨立使用時，就必須使用`(..)`將其包覆住，為了保持一致性，當我們使用IIFE時就將其包覆於`(..)`中。

### IIFE的變化

或許你可能有疑問為什麼IIFE需要使用`(..)`來包覆它，實際上只是因為避免誤認`function`這個宣告關鍵字它在進行函式宣告，但我們除了使用`(..)`以外，還可以用別的方式代替:

```javascript
!function thisIsAnIIFE(){
    // ..
}();

+function soIsThisOne(){
    // ..
}();
```

`!`、`+`和其他幾個運算子都可以用來放在函式前面，將其轉換為函式表達式，在最後使用`()`呼叫就使其為IIFE。

無論使用哪種方式，替它命名只有好處沒有壞處。

### 函式邊界

IIFE為一個完整的函式，所以在使用時要小心是否產生非預期的結果，例如，若在IIFE中使用`return`、`this`、`break`或`continue`等操作，這些都無法去控制外部範疇中的行為，也就是說如果你有一個函式其中包含了一個IIFE，若這IIFE裡面有使用`return`，只是表示IIFE這個函式的回傳值，而不是外面包覆函式的行為。

## 界定區塊範疇

一般來說我們可以使用一對大括號`{..}`作為一個區塊範疇，但實際上並非所有的`{..}`都是屬於一個範疇。一個區塊若在其中有包含`let`或`const`等宣告，那麼這個區塊必然為一個範疇:

```javascript
{
    // not necessarily a scope (yet)

    // ..

    // now we know the block needs to be a scope
    let thisIsNowAScope = true;

    for (let i = 0; i < 5; i++) {
        // this is also a scope, activated each
        // iteration
        if (i % 2 == 0) {
            // this is just a block, not a scope
            console.log(i);
        }
    }
}
// 0 2 4
```

還有些`{..}`語句並非是區塊範疇:

- 創立物件(Object)時，可以透過在`{..}`語句中加入key-value作為它的屬性/方法，但這不算是一個範疇。
- 類別(class)使用`{..}`語句將其屬性/方法包覆其中，這也不算是一個範疇。
- `function`宣告中的`{..}`它屬於函式的單一語句，技術上來說它不算是區塊範疇而是函式範疇。
- `switch`語句中的`{..}`不是區塊範疇。

在ES6之前，因為還沒有`let`與`const`的出現，只有`var`能使用，但它會與最近的函式範疇連結，而非區塊，所以`{..}`比較少被用到，但在ES6之後就開始漸漸的流行起來。大多數支援區塊範疇的程式語言，顯式的為一個或少數幾個變數創建區塊是很常見的，我們也應該在JS中廣泛的使用這種模式，以遵循POLE，將範疇中的公開變數降到最少。

看看下面的例子:

```javascript
if (somethingHappened) {
    // this is a block, but not a scope
    {
        //TDZ of msg start.
        // this is both a block and an explicit scope
        let msg = somethingHappened.message(); //TDZ of msg end.
        notifyOthers(msg);
    }
    // ..
    recoverFromSomething();
}
```

在`if`語句中我們為變數`msg`創建了一個區塊範疇，因為整個`if`語句中不需要用到該變數，大多數的開發人員(包括我自己在內)都會很直覺的將變數的控制放在`if`區塊中，若是只有幾行程式碼，可以根據個人的主觀來判斷，但隨著程式逐漸增長，這些變數就有過度曝光的問題。

只要遵循著POLE並且在合理範圍內為每個變數定義最小的區塊，就能避免過度曝光的問題。

回想前一篇中提到[TDZ](/archives/2020-03-06-you-dont-know-js-yet-8#未初始化的變數又稱為tdz)的部分，在當時建議將`let`與`const`宣告放在範疇的開頭，以減少TDZ持續的時間，將錯誤的風險降到最低，但若你需要在中間使用`let`宣告的話，最好是在使用一個區塊範疇將其包住。

再看看另外一個例子:

```javascript
function getNextMonthStart(dateStr) {
    var nextMonth, year;

    {
        let curMonth;
        [ , year, curMonth ] = dateStr.match(
                /(\d{4})-(\d{2})-\d{2}/
            ) || [];
        nextMonth = (Number(curMonth) % 12) + 1;
    }

    if (nextMonth == 1) {
        year++;
    }

    return `${ year }-${
            String(nextMonth).padStart(2,"0")
        }-01`;
}
getNextMonthStart("2019-12-25");   // 2020-01-01
```
首先我們來確認所屬範疇與它們的識別字:

1. 全域範疇有一個識別字，函式`getNextMonthStart(..)`。
2. `getNextMonthStart(..)`函式範疇有三個識別字，`dateStr`(參數)，`nextMonth`與`year`。
3. 內在的區塊範疇`{..}`，裡面有一個識別字`curMonth`。

為什麼我們不把`curMonth`放在與`nextMonth`、`year`同一個範疇呢?因為`curMonth`只被使用於兩個語句中，相比`year`與`nextMonth`，它們在整個函式範疇中一直有被使用到。由於這只是一個小例子，`curMonth`過度曝光的危害相當有限，但養成習慣遵循POLE，在將來程式碼逐漸增長時，這些習慣將對你帶來許多幫助。

### `var`與`let`

[[warning]]
|在原文這段[var與let](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch6.md#var-and-let)中，作者已表明`let`與`var`的混用一直存在巨大的爭議，在網路上有一派的人已經選擇棄用`var`改為全部使用`let`與`const`代替，由於我自己有使[ESLint](https://eslint.org/)的習慣，它預設的規則就是禁用`var`，所以不論你支持使用與否，你可以根據自己的使用狀況來判斷哪邊比較適合你。

在前一篇文章中提過，透過`var`宣告的變數會與最近的函式範疇連結，儘管它在某個區塊範疇中，回顧前面的例子:

```javascript
function diff(x,y) {
    if (x > y) {
        var tmp = x;    // `tmp` is function-scoped
        x = y;
        y = tmp;
    }

    return y - x;
}
```

變數`tmp`與`diff(..)`的函式範疇範疇連結，而並非`if`語句的區塊範疇，那麼我們在這裡使用`let`理當說會更好，不是嗎?沒錯，這裡的確使用`let`會比`var`好，因為`tmp`只有在`if`語句的區塊範疇需要被使用到。

根據作者的觀點認為混用`let`與`var`的一個關鍵原因在於視覺上讓別人一眼就知道變數與哪個範疇"**連結**"，在這裡`tmp`只在區塊範疇中使用，所以這裡使用`let`可以清楚的告訴別人它不會被外部範疇所使用，這觀點與POLE一致。假設我們有許多的變數全都使用`let`進行宣告其實我們很難一眼看出它究竟是與哪個範疇連結，除非我們良好的遵循POLE的原則，透過替變數建立區塊將變數曝光降到最低。

看看一個例子:

```javascript
function getStudents(data) {
    var studentRecords = [];

    for (let record of data.records) {
        let id = `student-${ record.id }`;
        studentRecords.push({
            id,
            record.name
        });
    }

    return studentRecords;
}
```

變數`studentRecords`被用於整個函式中，所以這裡使用`var`會是較好的選擇(因為與函式範疇連結)。而`record`與`id`只在`for`迴圈中使用，所以用`let`是較好的選擇。

再看看另外一種用法:

```javascript
function commitAction() {
    do {
        let result = commit();
        var done = result && result.code == 1;
    } while (!done);
}
```

`result`使用`let`沒什麼問題，因為它只被使用於`do...while`中，`done`是比較值得討論的地方，因為`do...while`看不見自己區塊範疇中使用`let`宣告的變數，所以我們必須使用`var`將其提升(hoisting)至外部範疇使其能看到`done`這個變數。還有另外一種選擇是將`done`宣告於函式範疇中，我想多數人會選擇這種方式，但`done`只用在這個區塊範疇中，透過`var`進行提升的動作或許比較有可讀性。

### 何時使用`let`

使用`let`與`var`的時機取決於*如何使變數曝光程度降到最低*，以作者觀點來看，多數情況下於函式範疇中使用`var`進行宣告，其它皆使用`let`進行宣告。當你在某個地方要進行變數宣告時，你需要想的是它是否需要被提升(hoisting)，這個變數究竟應該歸屬於哪個範疇當中。

來看看前面`diff(..)`的例子，在ES6之前，我們可以寫成像以下程式碼:

```javascript
function diff(x,y) {
    var tmp;

    if (x > y) {
        tmp = x;
        x = y;
        y = tmp;
    }

    return y - x;
}
```

這其實沒什麼太大問題，但根據POLE，`tmp`應該隸屬於`if`語句的區塊範疇，但因為ES6之前沒有`let`所以我們無法對`tmp`進行區塊的監控，但我們依舊可以將其改寫如下來傳達我們的意圖:

```javascript
function diff(x,y) {
    if (x > y) {
        // `tmp` is still function-scoped, but
        // the placement here semantically
        // signals block-scoping
        var tmp = x;
        x = y;
        y = tmp;
    }

    return y - x;
}
```

這樣的改寫只是希望告訴其他閱讀者，變數`tmp`只希望被用於這個範疇當中，但後來`let`的出現，這種情況使用`let`是最好的選擇。

再看看另外一種例子:

```javascript
for (var i = 0; i < 5; i++) {
    if (checkValue(i)) {
        break;
    }
}

if (i < 5) {
    console.log("The loop stopped early!");
}
```

這樣的寫法比較罕見，且這樣寫也容易讓人覺得是一段不良的程式碼，一種比較好的替代方法是使用一個外部變數:

```javascript
var lastI;

for (let i = 0; i < 5; i++) {
    lastI = i;
    if (checkValue(i)) {
        break;
    }
}

if (lastI < 5) {
    console.log("The loop stopped early!");
}
```

### 談談`try...catch`

於ES3(1999年)引入了`try...catch`語句:

```javascript
try {
    doesntExist();
}
catch (err) {
    console.log(err);
    // ReferenceError: 'doesntExist' is not defined
    // ^^^^ message printed from the caught exception

    let onlyHere = true;
    var outerVariable = true;
}

console.log(outerVariable);     // true

console.log(err);
// ReferenceError: 'err' is not defined
// ^^^^ this is another thrown (uncaught) exception
```

`err`被`catch`語句宣告於它的區塊範疇中，若想將訊息與外部溝通，可以透過`var`進行宣告，它將會提升至外部範疇中。

在ES2019改變了`catch`語句，對於`catch`後面`err`這類的宣告變的是可選擇的，若忽略了宣告，則`catch`區塊就表示它不再是一個範疇。因此如果需要對錯誤進行對應的反應而不再乎錯誤訊息，可以直接忽略宣告:

```javascript
try {
    doOptionOne();
}
catch {   // catch-declaration omitted
    doOptionTwoInstead();
}
```

這樣的寫法乾淨簡單，且移除不必要的範疇。

## Function Declarations in Blocks (FiB)

使用`let`或`const`宣告的變數是與區塊範疇連結，而`var`宣告的變數是與函式範疇連結，這是我們前面一直提到的。那麼試想如果把函式宣告於區塊範疇中呢?這種行為稱為**FiB**。

我們通常會以為函式宣告與`var`宣告是會有相同的行為，所以若將函式宣告於區塊範疇之中，是否也會提升至外部的函式範疇呢?

可以說是也可以說不是，這裡可能會造成些困惑，讓我們用例子慢慢解釋:

```javascript
if (false) {
    function ask() {
        console.log("Does this run?");
    }
}
ask();
```

想想看這段程式碼會如何運作?在我們不知道答案之前可以先有三個合理的推論:

1. `ask()`呼叫失敗，拋出`ReferenceError`，因為它不在外部範疇當中。
2. `ask()`的呼叫導致`TypeError`，代表其識別字`ask`有被提升(hoisting)至外部範疇，但它被定義為`undefined`(因為`if`語句未運行)。
3. `ask()`呼叫成功。

這裡令人感到困惑的原因是因為結果會根據所運行的JS環境而有所不同。在JS規範中，在區塊中宣告函式是屬於區塊範疇，所以答案應該是(1)，但大多數瀏覽器的JS engine(包含chrome的v8，所以Node也是)的結果會是(2)。

為什麼瀏覽器的JS engine會不遵守JS規範呢?原因在於ES6介紹區塊範疇之前，這些JS engine對於FiB已經具有某些行為了，但因為擔心修改這個問題會破壞一些現有網頁的JS程式碼，所以在JS規範中有個附錄B中提到了一個例外，這個例外允許瀏覽器的JS engine擁有某些不在規範中的行為。

[[info]]
|Node也會有這個問題的原因是因為v8引擎先用於瀏覽器中，但Node與瀏覽器共用v8引擎，所以這個異常也存在於Node之中。

在區塊中使用函式宣告最常見的例子就是根據JS環境進行有條件的函式定義:

```javascript
if (typeof Array.isArray != "undefined") {
    function isArray(a) {
        return Array.isArray(a);
    }
}
else {
    function isArray(a) {
        return Object.prototype.toString.call(a)
            == "[object Array]";
    }
}
```

這裡判斷`Array.isArray`是否有被定義，出於性能優化的原因，使用這種方式只要執行一次就能夠確保`isArray`能符合我們的需求，之後在任何需要用到的地方都不需要再重複檢查一次。

[[warning]]
|除了因為上述FiB存在的風險外，使用這種條件式的宣告函式還有另外一個問題，那就是會增加你Debug時的負擔，因為你必須知道你實際在運行時它使用的是哪一個`isArray`，有時候是判斷條件的部分出了問題，定義越多版本就越難維護與推理。

再看看另外一個極端的例子，它會根據JS engine屬於瀏覽器或非瀏覽器環境而有所不同:

```javascript
if (true) {
    function ask() {
        console.log("Am I called?");
    }
}

if (true) {
    function ask() {
        console.log("Or what about me?");
    }
}

for (let i = 0; i < 5; i++) {
    function ask() {
        console.log("Or is it one of these?");
    }
}

ask();

function ask() {
    console.log("Wait, maybe, it's this one?");
}
```

想想看`ask()`的結果會是什麼?若根據前一篇中[「可以使用變數的時間點」](/archives/2020-03-06-you-dont-know-js-yet-8#可以使用變數的時間點)的邏輯，因為它是這段程式碼中最後一個`ask`的函式宣告，所以毫無疑問會打印出`Wait, maybe it's the one?`，但事實並非如此。
若你運行的環境是在Node中，答案確實會符合我們上述的預期，但若你執行在瀏覽器環境(這裡以chrome為例)下，則會打印出`Or is it one of these?`。

由於FiB的各種怪異行為，為了確保程式碼能夠穩定執行，最好的解決方式就是不要使用FiB，換言之就是將函式宣告於外層範疇中。我們回顧上面`isArray`的例子並對它進行改寫:

```javascript
function isArray(a) {
    if (typeof Array.isArray != "undefined") {
        return Array.isArray(a);
    }
    else {
        return Object.prototype.toString.call(a)
            == "[object Array]";
    }
}
```

將判斷式放入函式之中，避免使用FiB，但這樣的缺點就是犧牲一點效能，因為在每次使用都必須進行判斷，或者可以使用另外一種方式:

```javascript
var isArray = function isArray(a) {
    return Array.isArray(a);
};

// override the definition, if you must
if (typeof Array.isArray == "undefined") {
    isArray = function isArray(a) {
        return Object.prototype.toString.call(a)
            == "[object Array]";
    };
}
```

雖然上面的`if`語句區塊中使用了函式表達式，但這樣並不算是FiB，由於函式表達式的所屬範疇屬於它自己本身，並不會提升到區塊範疇中，這樣就能有效地避免FiB。

## 總結

- 盡可能的遵循POLE能防止變數過度的曝光，減少程式的相依性。
- `let`與`var`使用的選擇根據變數依附於哪個範疇當中(是否使用`var`則視團隊/個人)。
- 避免使用FiB，將函式宣告於區塊之外以避免FiB造成的混淆。

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
