---
title: "You don't know JavaScript Yet:#8 變數神秘的生命週期"
date: "2020-03-06"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

在前面的幾個章節中，我們曾經提到了關於「提升」(hoisting)與「TDZ」(Temporal Dead Zone)等名詞，但一直未對這些名詞有詳細的說明
，而變數的生命週期與這兩個名詞息息相關，裡面隱藏了許多細節，我們將在這章探討當變數被創建到可以被使用的整個過程。

## 可以使用變數的時間點

變數在什麼時候可以於範疇中使用?我想很直覺的，多數人的答案可能會是:當變數被宣告或者創建後就可以使用，但實際上並非那麼單純。
考慮以下程式碼:

```javascript
greeting();
// Hello!

function greeting() {
    console.log("Hello!");
}
```

上面這段程式碼再平常不過了，你也一定有寫過類似的程式碼，它可以正常的執行，但你是否有想過為什麼宣告在執行之後卻能夠正常的執行呢?
在[範疇](/archives/2020-01-31-you-dont-know-js-yet-4)這一章節談論到，範疇在編譯期就已經被決定好，所有的識別字都會在此時註冊(register)於範疇中。除此之外，在每次進入範疇時，所有的識別字都被註冊於範疇的開頭，即使變數被宣告於範疇中最下面的地方，依舊會在編譯期被合法的註冊於範疇開頭，而這有一個術語稱為**提升(Hoisting)**。

但只單靠hoisting依舊無法解釋為什麼`greeting()`可以在宣告前就被呼叫，也就是說我們無法解釋`greeting`的值(function reference)是如何被賦予的，答案是因為函式宣告比起其他變數有一個特別的特徵稱為*function hoisting*。當函式的識別字被註冊於範疇的開頭時，會自動的初始化其function reference，這就是為什麼我們可以在整個範疇中使用函式的原因。

這裡有一個重點，*function hoisting*與透過`var`宣告的識別字進行hoisting的動作時，都會與最近的函式範疇連結(如果沒有函式範疇，則會與全域連結)，而不是區塊範疇。

[[info]]
|使用`let`或者`const`仍然會被hoist(但行為上與`var`有些差異，詳細將會在後面介紹TDZ時說明)，但是這兩種宣告會與最近的區塊範疇連結，而非函式範疇(這將會在下一章中介紹)。

### Hoisting: 函式宣告 vs. 函式表達式

*Function hoisting*只適用於[函式宣告](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)而不適用於[函式表達式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function):

```javascript
greeting();
// TypeError

var greeting = function greeting() {
    console.log("Hello!");
};
```

上面的第一行就會拋出一個`TypeError`，在這個Error中隱藏許多訊息。`TypeError`表示我們嘗試去做某件事但不被允許，根據執行的JS環境會有不同的錯誤訊息，例如在node環境下執行會拋出`TypeError: greeting is not a function`。注意到這裡並不是拋出`ReferenceError`，JS並沒有告訴我們它沒有找到`greeting`這個識別字，而是告訴我們它有找到`greeting`，但在此時`greeting`還未持有function reference，所以只能使用透過函式宣告的識別字。

那麼此時的`greeting`是什麼呢，我們將上面程式碼改成如下

```javascript
console.log(typeof greeting);
// undefined

var greeting = function greeting() {
  console.log('Hello!');
};
```

實際上在透過`var`宣告的變數都會被初始化為`undefined`，一但初始化之後就可以被使用(進行賦值或者檢索)，所以上面第一行的`greeting`實際上已經存在但未被賦值，直到第四行透過函式表達式賦值後才有function reference。

根據上面我們可以歸納如下:

- 一個`function`宣告在其被提升的同時也進行賦予function reference的動作(*function hoisting*)。
- 透過`var`宣告的變數被提升時，都會被初始化為`undefined`。
- 對一個變數使用函式表達式進行賦值時，直到執行期才會將其function reference賦予變數。

## Variable Hoisting

在上面我們討論過了關於*function hoisting*的部分，接著來看看*variable hoisting*的行為:

```javascript
greeting = "Hello!";
console.log(greeting);
// Hello!

var greeting = "Howdy!";
```

前面已經提過`var`所宣告的變數會被提升到該範疇的開頭，所以不難想像會有這種結果，在編譯期，識別字`greeting`被提升並且賦予`undefined`，到了執行期第一行程式就可以合法地進行賦值。

## 從另一個角度看Hoisting

考慮上面那段程式碼，我們可以換個角度來看，「**想像**」成JS在執行前會重寫程式碼:

```javascript
var greeting;           // hoisted declaration
greeting = "Hello!";    // the original line 1
console.log(greeting);  // Hello!
greeting = "Howdy!";    // `var` is gone!
```

JS在執行前將所有的變數宣告都提升到範疇的開頭，相對的`function`宣告也可以這麼看待，考慮以下程式碼:

```javascript
studentName = "Suzy";
greeting();
// Hello Suzy!

function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;
```

接著經過JS重寫之後:

```javascript
function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;

studentName = "Suzy";
greeting();
// Hello Suzy!
```

透過這樣的整理我們就能把它當作是由上到下逐行執行的程式碼了，這樣對於理解hoisting也有幫助，但實際上JS並不會有重寫程式碼這個動作，
它是透過剖析整個程式碼，配置所有識別字所屬的範疇，再經由範疇來搜尋它們，所以上面這些搬移的動作是透過我們「**想像**」出來的，不要有JS會幫你搬移的想法。

## 重複宣告

如果重複宣告變數會有什麼樣的結果呢?看看下面這段程式碼:

```javascript
var studentName = "Frank";
console.log(studentName);
// Frank

var studentName;
console.log(studentName);   // ???
```

若在之前我們未曾看過有關於hoisting的部分，我們通常會認為第二個`var studentName`會重新宣告一次，所以最後的`console.log(studentName)`會是`undefinded`，但回顧上面關於hoisting的描述，很顯然的我們可以確定它並不會印出`undefinded`而是`Frank`，只要想像前一節的模式將程式碼重寫如下:

```javascript
var studentName;
var studentName;    // clearly a pointless no-op!

studentName = "Frank";
console.log(studentName);
// Frank

console.log(studentName);
// Frank
```

在我寫這系列的第五章中[「第二個隱喻:朋友間的對話」](/archives/2020-02-23-you-dont-know-js-yet-5#第二個隱喻朋友間的對話)曾經有提到，當Compiler遇到已經宣告過的變數，則會選擇忽略它，所以這裡第二個`var studentName`會直接被忽略。

這裡有一個重點，`var studentName`不代表`var studentName = undefinded`，這是很多人容易誤解的地方，只有當Compiler第一次遇到這個變數時，會自動將其初始化為`undefinded`，之後都選擇忽略，看看下面程式碼:

```javascript
var studentName = "Frank";
console.log(studentName);   // Frank

var studentName;
console.log(studentName);   // Frank <--- still!

// let's add the initialization explicitly
var studentName = undefined;
console.log(studentName);   // undefined <--- see!?
```

在一次的我們重寫這段程式碼就能夠清楚說明這點:

```javascript
var studentName;
var studentName;
var studentName;

studentName = "Frank";
console.log(studentName);
// Frank
console.log(studentName);
// Frank
studentName = undefined;
console.log(studentName);
// undefined
```

從上面的結論來看透過`var`重複宣告會直接被忽略，再看看若是`function`也會有一樣的結果:

```javascript
var greeting;

function greeting() {
    console.log("Hello!");
}

// basically, a no-op
var greeting;

typeof greeting;        // "function"

var greeting = "Hello!";

typeof greeting;        // "string"
```

第一個`var greeting`為首次宣告，所以會被自動初始化為`undefinded`，接著`function`宣告會直接將其function reference賦予給`greeting`，接著第二個`var greeting`會被忽略，最後的`var greeting = ..`則會進行賦值的動作。

接著來看看`let`:

```javascript
let studentName = "Frank";

console.log(studentName);

let studentName = "Suzy";
```

這段程式碼不會成功的執行，會拋出`SyntaxError`，因為`let`是不允許重複宣告的，會打印出類似`studentName has already been declared`的錯誤訊息，取決於你的JS環境。除此之外，如果使用`let`與`var`進行重複宣告依舊是不合法的:

```javascript
var studentName = "Frank";

let studentName = "Suzy";
```

或

```javascript
let studentName = "Frank";

var studentName = "Suzy";
```

都會拋出`SyntaxError`，至於為什麼`var`可以允許重複宣告而`let`不行呢，實際上本來`let`也是可以的，但決定這件事的TC39委員們認為重複宣告是一種不良的習慣，它可能會引發許多Bug，所以決定在ES6引入`let`時不讓它允許重複宣告。

再來看看`const`，它就像是受約束的`let`，可想而知它也不允許重複宣告。`const`還有一些約束成為它不能被重複宣告的原因:

- 使用`const`進行宣告必須要賦予初始值。
- 透過`const`宣告的變數不被允許重新賦值。

首先若我們使用`const`進行宣告而不給予初始值，則會拋出`SyntaxError`:

```javascript
const empty;   // SyntaxError
```

若進行重新賦值的動作則會拋出`TypeError`:

```javascript
const studentName = "Frank";
console.log(studentName);
// Frank

studentName = "Suzy";   // TypeError
```

[[warning]]
|這裡要注意到`SyntaxError`與`TypeError`之間差異，這常容易被忽略。`SyntaxError`會在編譯期拋出，意思就是程式還沒執行前就拋出Error，而`TypeError`則是程式已經執行後，遇到錯誤才拋出，所以上面那段程式碼會先打印出`Frank`，等到對`studentName`進行賦值時才會拋出`TypeError`。

所以`const`宣告必須對其初始化與不允許重新賦值的特性也導致它不被允許重複宣告，反過來說，`const`若要重複宣告則必須要能夠重新賦值，但這對它來說是不合法的:

```javascript
const studentName = "Frank";

// obviously this must be an error
const studentName = "Suzy";
```

### Loop

在迴圈中使用宣告會有重複宣告的問題嗎，來看看下面的例子:

```javascript
var keepGoing = true;
while (keepGoing) {
    let value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

上面的`value`算重複宣告嗎?這樣會導致`SyntaxError`嗎?實際上不算重複宣告所以也不會拋出Error。每次一次進入`while`區塊都是一個新的範疇，而在前面有提到`let`會與最近的區塊範疇連結，`value`是屬於在該範疇當中的識別字，當範疇被實例化，`value`也只會被宣告一次，因此不會構成重複宣告。但若是`var`呢?

```javascript
var keepGoing = true;
while (keepGoing) {
    var value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

這會是重複宣告嗎?答案也不是。前面有提到`var`會與最近的函式範疇連結，若沒有函式範疇則會與全域範疇連結，所以在這裡它會與`keepGoing`屬於同一個範疇(這裡為全域範疇)，所以也不存在重複宣告的問題。

在來看看`for`迴圈中的行為:

```javascript
for (let i = 0; i < 3; i++) {
    let value = i * 10;
    console.log(`${ i }: ${ value }`);
}
// 0: 0
// 1: 10
// 2: 20
```

`value`類似於上面的情況，這裡的重點是`i`，它屬於重複宣告嗎?首先需要考慮的是`i`它屬於哪個範疇，在這裡只有兩種選擇，一種是全域範疇，另外一種則是`for`迴圈中的範疇，實際上在這裡`i`是屬於`for`迴圈中的範疇，透過改寫就能清楚了解:

```javascript
{
    // a fictional variable for illustration
    let $$i = 0;

    for ( /* nothing */; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        let i = $$i;

        let value = i * 10;
        console.log(`${ i }: ${ value }`);
    }
    // 0: 0
    // 1: 10
    // 2: 20
}
```

這樣就能看出`i`與`value`都跟上一個討論的例子一樣，在每次進入範疇時，會產生一個實例並且創建所屬的識別字，所以不會有重複宣告的問題。

再來看看其他形式的`for`迴圈:

```javascript
for (let index in students) {
    // this is fine
}

for (let student of students) {
    // so is this
}
```

這兩個結果都與上面的結論一樣，`index`與`student`的範疇都屬於迴圈中，上面這些看起來都沒什麼問題，接著來看看`const`:

```javascript
var keepGoing = true;
while (keepGoing) {
    const value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

這個例子與上面使用`let`時一樣，所以沒什麼問題，再來看看`for`迴圈，首先先看看`for..in`與`for..of`:

```javascript
for (const index in students) {
    // this is fine
}

for (const student of students) {
    // this is also fine
}
```

這也與使用`let`一樣的結果，而有問題的是下面這種情況:

```javascript
for (const i = 0; i < 3; i++) {
    // oops, this is going to fail with
    // a Type Error after the first iteration
}
```

這裡為什麼改用`const`就出問題了呢?用上面的邏輯來看理當說`for`迴圈中的範疇不會有重複宣告的問題才對，一樣的我們透過改寫來看看問題出在哪:

```javascript
{
    // a fictional variable for illustration
    const $$i = 0;

    for ( ; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        const i = $$i;
        // ..
    }
}
```

實際上問題出在`$$i++`這裡，因為`const`不允許重新賦值的動作，所以當`for`迴圈第一次迭代之後就會拋出Error。

上面我們透過改寫的方式只是幫助我們理解用的，或許你可能會期待JS把`const $$i = 0`改成使用`let $$i = 0`，這樣就可以允許在標準的`for`迴圈中使用`const`，這當然是有可能的，但是我們若不看改寫的部分，`const i = 0`很明顯的就不允許被重新賦值，若JS允許了這件事，則會產生奇怪的矛盾，所以這裡不允許被這樣使用是合理的。

## 未初始化的變數(又稱為TDZ)

前面提到過，使用`var`宣告的變數會被提升到它所屬範疇的最上面，並且被自動的初始化`undefined`

但在這裡要看的是有關於`let`與`const`，因為這兩個在被提升時，會與`var`有著不同的行為:

```javascript
console.log(studentName);
// ReferenceError

let studentName = "Suzy";
```

當執行程式第一行就會先拋出`ReferenceError`，錯誤訊息根據JS的環境會類似於`Cannot access studentName before initialization`，錯誤訊息告訴我們未對`studentName`進行初始化，代表`studentName`存在但它還未初始化，所以我們換個方式試試看對它進行初始化:

```javascript
studentName = "Suzy";   // let's try to initialize it!
// ReferenceError

console.log(studentName);

let studentName;
```

結果還是一樣得到`ReferenceError`，我們已經在第一行試圖對這個"未初始化"的變數`studentName`進行初始化，但為什麼依舊得到相同的結果呢?唯一解決的方式是在`let`與`const`宣告時對其進行賦值:

```javascript
let studentName = "Suzy";
console.log(studentName);   // Suzy
```

這裡實際上是將`let studentName = undefined`透過`"Suzy"`代替`undefined`，或者把它看成以下程式碼:

```javascript
// ..

let studentName;
// or:
// let studentName = undefined;

// ..

studentName = "Suzy";

console.log(studentName);
// Suzy
```

或許看到這邊你會覺得上面`let studentName`沒有對它賦予一個初始值呀，這裡要回顧前面說過的`var studentName`不等於`var studentName = undefined`的問題，這對於`let`來說是相等的，唯一的差別是`var studenName`會自動初始化於範疇的最上方，而`let studentName`不會，這也是為什麼上面需要把`let`宣告放到使用之前的原因(攸關於TDZ)，因為直到遇到`let`宣告，才會有自動初始化的動作，但你會想說:"`let`與`const`也會有**提升(hoisting)**不是嗎?"，這是可能是因為對於hoisting產生的誤解，讓我們底下慢慢分析。

前面提到hoisting會將識別字註冊(register)於範疇的最上方，實際上Compiler會在註冊的同時刪除透過`var/let/const`宣告的識別字，並且將它們替換成適當的識別字於範疇的最上方，所以分析上面的行為，我們會發現Compiler實際上在這中間多執行了一道指令，在`studentName`被宣告時，對其進行自動初始化的指令，在未進行初始化前我們都無法使用它。

TC39提出了一個專業術語:Temporal Dead Zone(TDZ)，*變數在進入範疇到被初始化的這段時間被稱為TDZ*，在這段時間中因為變數未被初始化所以它無法被使用，當完成初始化之後，TDZ也跟著結束。

技術上來說`var`也擁有TDZ，但這段時間基本上等於0，所以我們也無法透過程式觀察到，但`let`與`const`的TDZ是可以透過程式來觀察的。

TDZ描述的是一段時間而非程式中的位置，考慮以下程式碼:

```javascript
askQuestion(); //TDZ of studentName start!
// ReferenceError

let studentName = "Suzy"; //TDZ of studentName end!

function askQuestion() {
    console.log(`${ studentName }, do you know?`);
}
```

進入範疇後`studentName`的TDZ也同時開始了，在一開始呼叫函式`askQuestion`，但此時`studentName`還在TDZ中，意味著無法使用`studentName`，所以當嘗試去使用還在TDZ中的變數會拋出`ReferenceError`。還記得前面說過對於hoisting的誤解嗎?許多人認為這樣的結果代表`let`與`const`不會被提升(hoisting)，但實際上是因為誤解了hoisting的意思。

只要想著hoisting是將識別字"**註冊(register)**"於範疇最上方即可。看看`var`與`let/const`的差別，關鍵在於是否在提升後有"**自動初始化**"這件事上，`var`會在被提升之後進行自動初始化，而`let/const`則不會，會被誤導的原因多半是因為我們前面透過「**想像**」來改寫程式碼的那部分，記住，JS並沒有真正執行這一步驟，那只是用來幫助我們理解而已。Hoisting跟自動初始化是不同操作，不該把它們統稱為hoisting。

我們已經看過`let`與`const`不會自動初始化於範疇的最上方，接下來我們搭配前面章節所說的[遮蔽(shadowing)](/archives/2020-02-27-you-dont-know-js-yet-6#遮蔽shadowing)來證明它具備hoisting:

```javascript
var studentName = "Kyle";
{
    console.log(studentName);
    // ???
    let studentName = "Suzy";
    console.log(studentName);
    // Suzy
}
```

想想第三行的`console.log(studentName)`會打印出什麼呢?如果`let studentName`不具備hoisting的話，則這裡毫無疑問會打印出`Kyle`，因為此時只有外部範疇的`studentName`存在。但實際上第三行的`console.log(studentName)`會引發`ReferenceError`或者也能說它為TDZ Error，造成這樣的原因是因為`let studentName`的確有hoisting的行為存在，在進入範疇`{...}`後進行註冊的動作，此時裡面的`studentName`會被註冊於該範疇當中，但因為是`let`所以不會被自動初始化，意味著它還在TDZ狀態當中，所以當`console.log(studentName)`嘗試獲取它時，會引發`ReferenceError`。

綜合上述所說的，TDZ Error只會發生在`let/const`宣告，`var`因為在經過hoisting之後會自動初始化，所以它可以說完全沒有存在於TDZ中，但`let/const`的初始化會被延遲到它們的宣告出現後才進行。

那麼該如何避免TDZ Error?

最好的方式就是將`let/const`宣告放在該範疇的最上方，使其TDZ持續的長度短到接近0(與var相似)最好，這樣就不會有TDZ的存在。

## 總結

關於*提升(Hoisting)*、*重複宣告(re-declaration)*與*TDZ*的文章在JS的社群中可以找到一大堆，由於這些議題是讓許多JS開發人員容易誤解或者是因為曾經寫過其他語言而用其他語言的想法來看待它，所以有許多人會特別地為它們寫些文章好釐清它們的原理。這裡整理一下關於它們的各自描述:

- *提升(Hoisting)*:將該範疇中的所屬識別字"**註冊(register)**"於範疇的最上方，若宣告使用`var`，則會進行自動初始化，否者若是`let/const`則會等到宣告時才對其進行初始化。

- *重複宣告(re-declaration)*:只有`var`會有此問題，在第一個宣告之後的宣告都將被忽略(若有賦值則會執行賦值)，`let/const`則因為特性不被允許重複宣告。

- *TDZ(Temporal Dead Zone)*:變數在進入範疇到被初始化的這段時間被稱為TDZ，只有`let/const`需要注意到TDZ的問題。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
- [You don't know JavaScript Yet:#2 概觀JS](/archives/2020-01-04-you-dont-know-js-yet-2)
- [You don't know JavaScript Yet:#3 深入JS的核心](/archives/2020-01-07-you-dont-know-js-yet-3)
- [You don't know JavaScript Yet:#4 範疇](/archives/2020-01-31-you-dont-know-js-yet-4)
- [You don't know JavaScript Yet:#5 說明語彙範疇](/archives/2020-02-23-you-dont-know-js-yet-5)
- [You don't know JavaScript Yet:#6 範疇鏈](/archives/2020-02-27-you-dont-know-js-yet-6)
- [You don't know JavaScript Yet:#7 全域範疇](/archives/2020-03-06-you-dont-know-js-yet-7)
