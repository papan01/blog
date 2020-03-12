---
title: "You don't know JavaScript Yet:#9 有限的接觸範疇"
date: "2020-03-12"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

前面的章節中介紹有關於範疇與變數在JS中是如何運作的，在這一章節將討論為什麼會需要不同階層的範疇(函式範疇與區塊範疇)來組織程式碼，以及如何減少與範疇的過度接觸。

## 最少接觸原則

在計算機科學、資訊安全或者其他領域中，"**最小權限原則(The Principle Of Least Privilege(POLP))**"為一個用於軟體安全架構的設計理念，它與我們當前要討論的"**最少接觸原則(The Principle Of Least Exposure(POLE))**"有關，其為POLP的變種。

POLP要求系統中的每一個元件只能訪問當下它所需要的訊息或者資源，以最小的權限、最少的訪問與最少的接觸為原則，達到鞏固整個系統安全，若某個元件故障，對其他元件的影響也會降到最低。

若POLP專注於系統層級元件的設計，POLE則專注於更低層中，範疇間的交互運作的設計。

那麼要如何最大限度的減少與範疇之間的接觸呢?其實很簡單，把變數宣告於它應該存在的範疇中就好。

想想看為什麼我們不把變數全部都放在全域範疇就好了?我曾經看過不少人在寫程式時使用了大量的全域變數，當我必須去維護這份程式碼時，那簡直就是惡夢的開始，我很難掌控一個變數它究竟被哪些函式或者範疇使用，我對這些變數進行操作都要小心翼翼的擔心是否會破壞了其它函式的邏輯，最後我選擇進行重構。儘管多數人都會認為這是一個壞主意，但這個問題仍然值得討論，當程式中某個範疇將它的變數提供給另外一個範疇時，可能會有以下三種風險:

- **命名衝突(Naming Collisions)**:若在程式中兩個不同地方使用了共享範疇(例如全域範疇)裡面的變數/函式，那麼就會發生命名衝突，若其中一個地方使用的方式不符合另外一個地方的預期，就容易產生Bug。例如，假設程式中所有的`for`迴圈都共用全域範疇中的變數`i`，很湊巧的我有一個函式A它使用了這個`i`進行迴圈，而迴圈裏頭呼叫了另外一個函式B，而這函式B也使用了全域範疇中的`i`，那麼這個迭代的結果肯定不符合預期。
- **意外行為(Unexpected Behavior)**:若將某個本該隸屬於私有的(private)的變數/函式公開於外部給其他範疇使用，這意味著其他開發人員可能會以你意想不到的方式使用，這將會違反預期上的行為導致Bug。例如，有一個陣列是以`number`型別儲存，但有人將其修改為以`bool`或者`string`的型別，那麼那些意想不到的行為也隨之浮現。
- **無意的依賴(Unintended Dependencys)**:若你不必要地公開變數/函式，這等同於邀請其他開發人員使用與依賴這些私有的變數/函式，儘管不會發生上述意外行為的問題，但在將來面對到重構時，你將不能像以前一樣任意的修改變數/函式，因為這可能會導致你間接了破壞其他開發人員的程式，因為那些並不在你的掌控之中。例如，假設你的程式原本依賴於一個陣列是以`number`型別儲存，但後來你認為它應該使用其他資料結構，但因為其他開發人員也是遵循你當初的設計，這時你就必須負起修改所有受影響程式碼的責任。

簡單來說，POLE希望把變數/函式盡量以私有的方式(private)來管理，以最低限度公開必要的變數/函式。

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

在上面我們已經知道隱藏變數與函式的重要性，但現在依舊不知道該如何下手，所以我們這裡用一個例子作為示範，數學運算中的**階乘(factorial)**相信大家都不陌生，這還額外的使用另外一個技巧稱為"**memoization**"，它的用途是減少不必要的重複計算。假設我們已經計算過6!，將會把結果儲存於某個地方，當我們想在算7!時，就只要使用7*6!即可，考慮以下程式碼:

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

函式`hideTheCache`的作用只是提供了一個範疇將`cache`放置其中，但因為`factorial`需要提供給外部使用同時它又必須存取內部的`cache`，所以它必須也待在同個範疇當中，這裡透過`return factorial`將其公開給外部範疇使用，同時堵絕外部直接使用`cache`的可能。

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

在上面那個例子中，你可能注意到在尾端似乎多了一個`()`，這實際上就代表我們在宣告的同時也呼叫了這個函式表達式。

而這有一個專業的術語稱為:**立即呼叫函式表達式(Immediately Invoked Functions Expressions(IIFE))**，意思就如同它的名稱一般。

當我們要創建一個範疇來隱藏變數/函式時，IIFE就能幫到我們忙。由於它是一個函式表達式，因此可以允許在JS中的任何位置使用。無論是匿名或者命名函式都不影響它的運作:

```javascript
// outer scope

(function(){
    // inner hidden scope
})();

// more outer scope
```

這裡與上面`hideTheCache`表達式有一個需要注意的地方，`function hideTheCache(..)`在上面使用時，外面還包覆了`(..)`，這個在上面那個例子中是可以省略的，但在這個例子中，由於它只是想直接呼叫這個函式表達式，這裡就變為是必須的，為了保持一致性，當我們使用IIFE時就將其包覆於`(..)`中。

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

`!`、`+`和其他幾個運算子都可以用來放在函式前面，將其轉換為函式表達式，在最後使用`()`調用就使其為IIFE。

無論使用哪種方式，替它命名只有好處沒有壞處。

### 謹慎使用IIFE



