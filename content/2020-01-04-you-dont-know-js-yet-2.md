---
title: "You don't know JavaScript Yet:#2 概觀JS"
date: "2020-01-04"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

這是我閱讀[You Don't Know JS Yet: Get Started-Surveying JS](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/get-started/ch2.md)的讀書筆記，這章節主要的內容在講述值、型別、函數、比較和模組化等等，這不算是一個「JS入門」的章節，所以不會有太多詳細的介紹，更多是稍微提到或者是點醒讀者一些可能認知上的誤解。

## 值(Values)

值的概念有一點抽象，它是程式中最基本的單元，它可以是數字或者字串甚至是幾何學上的一個點。
值可以用兩種形式表現:**原始值(primitive values)**與**物件(object)**。

簡單的例子:

```javascript
console.log("我的名子叫Papan01");
console.log(23);
```

從上面的例子來看`"我的名子叫Papan01"`與`23`就是原始值，語意上就是原始定義的值，它們無法被改變，例如`2`你不能讓它指定變成`3`或者在程式的別的地方又創造一個`2`。

我們在表示字串的時候可以使用`"`或者`'`來圍住它，選擇其中一個並且在你的程式中保持一致性，有助於日後的維護與可讀性。
還有另外一種就是當你想在你的字串中穿插變數，你可以使用`` ` ``並且搭配`${..}`，考慮以下的例子:

```javascript
const name = "Papan01";
console.log("我的名子叫${name}")
//我的名子叫${name}

console.log("我的名子叫${name}")
//我的名子叫${name}

console.log(`我的名子叫${name}`)
//我的名子叫Papan01
```

這稱之為內插(Interpolation)，但盡量是在你有必要進行內插時使用`` ` ``，平常時還是`"`或`'`擇一使用(取決於你整個專案，記得保持一致性)。

還有其他的原始值像是布林(booleans)與數值(numbers)。

```javascript
while(false) {
  console.log(3.141592);
}
```

`while`的條件式為`false`所以它永遠不會進入迴圈，布林值所表示的就是`false`以及與之相反的`true`。

上面的`3.141592`就是數值，而這個就是廣為人知在數學上的PI，我們也可以用預先定義好的`Math.PI`來代替它，還有另外一種變種的數值稱為`bigint`(big-integer)，這是用來儲存較大的數字用的(可以存大於2的53次方以上的數值，原本的number的最大值就為2的53次方)。

除了字串、布林與數值外，還有另外兩種原始值在JS當中:`null`與`undefined`，這兩個有些不同，但多數情況下表示它們是空值(或者不存在)的意思。
許多工程師把它們當作相同的東西，多數情況下沒有什麼問題，但最安全的方式還是只使用`undefined`來作為空值的表現。

```javascript
while(value != undefined) {
  console.log(`接收到值:${value}`);
}
```

最後一種原始值稱為`Symbol`，它是一種特殊用途的值，它通常拿來做為物件中的特殊key值。

```javascript
hitchhikersGuide[Symbol("foo")];
```

平常我們不會使用到`Symbol`，只有在開發一些比較low-level的libraires或者frameworks時才可能需要用到。

### 陣列(Arrays)和物件(Objects)

JS中的陣列可以包含任何型態的值，無論是原始值或者是物件，並且有順序的方式儲存:

```javascript
names=["Frank","Kyle","Peter","Susan"];
names.length; //4
names[0]; //Frank
names[1]; //Kyle
```

而物件與陣列類似，但它沒有順序之分，且在存取時，使用的是一個key或者property的名稱而並非像陣列一樣用數字作為索引:

```javascript
name = {
  first: "Louis",
  last: "Peng",
  age: "31"
  specialties:["basketball"]
}
console.log(`My name is ${name.first})
```

除了像上面那種方式使用`name.first`存取資料以外，我們也可以使用`name[first]`達到同樣的效果。

### 型別(Types)

為了區別這些值，可以使用`typeof`來判斷它的型別是原始值(primitive)或者物件(object)或者是其它種類型:

```javascript
typeof 42;                  // "number"
typeof "abc";               // "string"
typeof true;                // "boolean"
typeof undefined;           // "undefined"
typeof null;                // "object" -- oops, JS bug!
typeof { "a": 1 };          // "object"
typeof [1,2,3];             // "object"
typeof function foo(){};    // "function"
```

這裡有幾個比較奇怪的地方，`typeof null`得到的卻是object，這是JS的已知BUG，沒有改掉的原因應該是已經存在許久，若改掉可能會導致很多網頁壞掉。
另一個是`typeof function`得到的是function這個比較特別的型別，但function其實也是object的衍生物，但用同樣邏輯看待陣列，`typeof [1,2,3]`得到的卻是
object。

## 變數(Variables)

變數必須在使用前先進行宣告(declared)，可以透過識別字(identifier)來進行宣告，考慮以下這種例子:

```javascript
var name = "Kyle";
var age;
```

`var`這個關鍵字為其中一種宣告變數的方式，再看看另外一種方式:

```javascript
let name = "Kyle";
let age;
```

使用`let`跟使用`var`有些不同之處，會因為所在的範疇(scope)而有不一樣的存取限制，看看以下的例子:

```javascript
var adult = true;

if(adult) {
  var name = "Kyle";
  let age = 39;
  console.log("LOL!");
}

console.log(name);
// Kyle
console.log(age);
// Error!
```

在`if`這個範疇裡面有使用`var`宣告的name與使用`let`宣告的`age`，但在離開了這個範疇之後，`name`依舊可以從中獲得訊息，但當我們想取得`age`時，就會拋出錯誤，這意味著使用`var`它將能再更大範圍的地方被存取到。

接著我們來看看第三種`const`的用法，它與`let`相似，但它必須在宣告時就賦予它一個值且在這之後它的值將不能被修改:

```javascript
const myBirthday = true;
let age = 39;
if(myBirthday) {
  age += 1;           // OK!
  myBirthday = false; //Error!
}
```

比較令人困惑的部分是當使用`const`來宣告陣列或者物件時，其內容物是可以被修改的但不能被重新賦予新的值:

```javascript
const actors = [ "Morgan Freeman", "Jennifer Aniston"];
actors[2] = "Tom Cruise"; // OK
actors = [];              // Error!
```

最好的方式是讓`const`只賦予一個簡單的原始值，這樣比較清楚且不會造成日後他人不小心修改到。

[[info]]
| 針對`var`/`let`/`const`，這裡建議使用`let`與`const`就好，我們通常會希望變數在離開宣告的Scope時就被自動清除，當然這不代表`var`毫無用處，我們依舊可以在適當的地方使用它。

## 函式(Functions)

函式一詞在不同的地方有不同的意義，例如在FP(functional programming)中，其具有精確的數學定義與嚴格的規則。

在JS中，我們把函式視為一種特殊的值，它為了達到某種目的而且可以重複的使用，當我們提供一些input給函式，它會返回一個或多個結果，它看起來如下:

```javascript
function awesomeFunction(coolThings) {
  // ..
  return amazingStuff;
}
```

我們還可以把它存在變數當中:

```javascript
// let awesomeFunction = ..
// const awesomeFuntion = ..
var awesomeFunction = function(coolThings) {
  // ..
  return amazingStuff;
}
```

並不是所有的程式語言都像JS一樣把函式作為一個值並且可以儲存在變數當中。我們也能把函式放進物件當中如同變數一般:

```javascript
var whatToSay = {
  greeting() {
    console.log("Hello!");
  },
  question() {
    console.log("What's you name?");
  },
  answer() {
    console.log("My name is Papan01.");
  }
}

whatToSay.greeting(); // Hello!
```

## 比較(Comparisons)

在我們寫JS的時候肯定會用到比較運算，例如`>`、`==`、`===`等等，這小節會把重點放在`===`與`==`上。

首先來看`===`嚴格相等(strict equality)，JS的嚴格相等通常比較兩邊的值(value)與型別(type)是否相同且不允許在比較中進行任何強制轉型(coercion):

```javascript
3 === 3.0;              // true
"yes" === "yes";        // true
null === null;          // true
false === false;        // true

42 === "42";            // false
"hello" === "Hello";    // false
true === 1;             // false
0 === null;             // false
"" === null;            // false
null === undefined;     // false
```

再看看以下的例子:

```javascript
NaN === NaN; // false
0 === -0;    //true
```

- NaN因為它不等於任何值，所以它也不等於自己。
- 0跟-0相等。

這裡建議在比較這兩個時候，對於`NaN`我們可以使用`Number.isNaN(..)`來進行比較以及`0`跟`-0`時使用`Object.is(..)`來進行比較，
你也可以用`Object.is(..)`對NaN進行判斷，你可以把`Object.is(..)`當作比`===`更嚴格的`====`👍(當然你不能在程式中使用四個等號)。

```javascript
Object.is(0, ' ');          //false
Object.is(null, undefined); //false
Object.is([1], true);       //false
Object.is(NaN, NaN);        //true
```

當我們使用嚴格相等進行物件、陣列、函式比較時，它又變得沒那麼直觀了:

```javascript
[1,2,3] === [1,2,3]          //false
{ a: 42 } === { a: 42 }      //false
( x => x*2 ) === ( x => x*2 ) //fasle
```

當我們面對到的是物件時，內容的比較通常我們稱為結構相等(structural equality)。但在JS當中並未定義結構相等進行物件比較，而是使用識別相等(identity equality)或者稱為參考相等(reference equality)，而JS中所有的物件都是使用參考(reference)保存:

```javascript
var x = [ 1, 2, 3 ];

// assignment is by reference-copy, so
// y references the *same* array as x,
// not another copy of it.
var y = x;

y === x;              // true
y === [ 1, 2, 3 ];    // false
x === [ 1, 2, 3 ];    // false
```

上面`y === x`為true，因為兩個都有相同數組的參考，但最後面兩個都是新的數組`[1, 2, 3]`所以這兩個都是false，因為前面有說過只會去比較參考，
所以內容或者結構都不重要了。

### 強制轉型比較(Coercion Comparisons)

接著我們來說說`==`寬鬆相等(loose equality)，寬鬆相等在許多的JS社群引發眾怒，大夥都公開批評它的設計不良，使用容易產生危險、出錯，連
JS的創造者Brendan Eich都對自己的這個設計失誤感到失望。

因為寬鬆相等在進行比較時並不會比較型別，也因此這樣造成多數人的誤解，進而覺得難用。

與`===`類似，兩者都會進行值的比較，所以當兩邊比較的型別相等時，實際上`==`與`===`做的事情一模一樣沒有區別，只是當兩邊比較的型別不同時，`==`會進行強制轉型，一旦轉為相同的型別之後，再進行值的比較，而`===`不會進行強制轉型:

```javascript
42 == "42";             // true
1 == true;              // true
```

上面兩個例子因為兩邊的型別不同所以`"42"`與`true`會被轉型為`42`與`1`，`==`喜歡在需要進行轉型時，把需要轉型的型別轉換為數值。

而諸如`>`、`<`、`<=`、`>=`之類的比較也像`==`一樣，在進行前先確認型別是否需要轉型，若需要則進行強制轉型(通常為數值)。

最後這兩張圖可以幫助你更清楚它們的關係:

- `===`嚴格相等

  ![strict-equality](/static/images/strict-equality.png)

- `==`寬鬆相等

  ![loose-equality](/static/images/loose-equality.png)

## 如何組織我們的JS

JS使用兩種主要的模式來組織程式碼:**類別(classes)**和**模組(modules)**，這兩個模式互不相斥，所以可以同時使用或者只使用一種甚至都不使用。
理解這些模式是精通JS的必經之路。

### 類別(Classes)

物件導向(object-oriented)、類別導向(class oriented)與類別(classes)這幾個名詞有些微的一點差異，它們的定義是不通用的。若您有學過C++或者Java等物件導向(object-oriented)語言，那麼這部分對您應該相當熟悉。

類別是對自訂數據結構的"型別(type)"作定義，其中包含數據與對數據進行操作的行為(method，方法)，但類別並不是具體的值(value)，這個值就是本篇一開始所介紹的，我們需要透過實例化(instantiation)使其成為一個物件，我們通常會透過關鍵字`new`進行一次或多次的實例化，變成物件後，就能對其進行操作，看看以下的範例:

```javascript
class Page {
    constructor(text) {
        this.text = text;
    }

    print() {
        console.log(this.text);
    }
}

class Notebook {
    constructor() {
        this.pages = [];
    }

    addPage(text) {
        var page = new Page(text);
        this.pages.push(page);
    }

    print() {
        for (let page of this.pages) {
            page.print();
        }
    }
}

var mathNotes = new Notebook();
mathNotes.addPage("Arithmetic: + - * / ...");
mathNotes.addPage("Trigonometry: sin cos tan ...");

mathNotes.print();
// ..
```

`Page`類別中的數據為文本其儲存於`this.text`屬性中，而`print()`則是將文本打印到`console`的行為(方法)。

而`Notebook`的數據為儲存`Page`實例的陣列，它的行為(方法)有`addPage()`與`print()`。

`var mathNotes = new Notebook()`這一段為`Netebook`類別實例化的地方，`var page = new Page(text)`則為`Page`類別實例化的地方，
行為(方法)只能在在實例上調用(不能直接透過類別呼叫)，例如上面的`mathNotes.addPage("Arithmetic: + - * / ...")`與`page.print()`。

若不使用類別依舊可以達到上面的功能，但在缺乏組織性的情況下，程式碼會難以管理及閱讀並且更容易出錯。

### 類別繼承(Class Inheritance)

繼承與多型(polymorphism)是類別導向的固有設計。看看以下的例子:

```javascript
class Publication {
    constructor(title,author,pubDate) {
        this.title = title;
        this.author = author;
        this.pubDate = pubDate;
    }

    print() {
        console.log(`
            Title: ${ this.title }
            By: ${ this.author }
            ${ this.pubDate }
        `);
    }
}

class Book extends Publication {
    constructor(bookDetails) {
        super(
            bookDetails.title,
            bookDetails.author,
            bookDetails.publishedOn
        );
        this.publisher = bookDetails.publisher;
        this.ISBN = bookDetails.ISBN;
    }

    print() {
        super.print();
        console.log(`
            Published By: ${ this.publisher }
            ISBN: ${ this.ISBN }
        `);
    }
}

class BlogPost extends Publication {
    constructor(title,author,pubDate,URL) {
        super(title,author,pubDate);
        this.URL = URL;
    }

    print() {
        super.print();
        console.log(this.URL);
    }
}
```

`Book`和`BlogPost`都使用`extends`來擴展`Publication`，每個建構函數(constructor)中的super(..)可以委託父類`Publication`的構造函數進行初始化的工作，然後根據其各自的類型(即子類)執行更具體的操作。例如:

```javascript
var YDKJS = new Book({
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    publishedOn: "June 2014",
    publisher: "O'reilly",
    ISBN: "123456-789"
});

YDKJS.print();
// Title: You Don't Know JS
// By: Kyle Simpson
// June 2014
// Published By: O'reilly
// ISBN: 123456-789

var forAgainstLet = new BlogPost(
    "For and against let",
    "Kyle Simpson",
    "October 27, 2014",
    "https://davidwalsh.name/for-and-against-let"
);

forAgainstLet.print();
// Title: For and against let
// By: Kyle Simpson
// October 27, 2014
// https://davidwalsh.name/for-and-against-let
```

子類與父類都有`print()`方法，子類可以使用相同的名稱來覆寫(overridden)方法，每個被覆寫的`print()`方法裡使用了`super(..)`來執行父類的`print()`，這也是多型的特性之一。

### 模組(Modules)

模組與類別在本質上有相同的目標，既將數據與行為組合成邏輯單元，但模組與類別在語法上完全不一樣，模組可以透過包含(include)與訪問(access)其他模組來達到相同的功能。

### 經典模組(Classic Modules)

ES6為模組添加了新的語法，但在這之前模組就已經被廣泛運用在JS當中，儘管沒有任何額外的專用語法。

經典模組透過外部函式來返回一個模組的實例(與類別不同，不需透過new關鍵字)，這個實例包含了一個或多個方法用於操作隱藏在模組內部中的數據。
因為模組實際上只是一個函式，調用它就等同於產生該模組的實例，因此對這種函數的另一種描述稱為"模組工廠(module factories)"。

我們來看一下經典模組的樣貌:

```javascript
function Publication(title,author,pubDate) {
    var publicAPI = {
        print() {
            console.log(`
                Title: ${ title }
                By: ${ author }
                ${ pubDate }
            `);
        }
    };

    return publicAPI;
}

function Book(bookDetails) {
    var pub = Publication(
        bookDetails.title,
        bookDetails.author,
        bookDetails.publishedOn
    );

    var publicAPI = {
        print() {
            pub.print();
            console.log(`
                Published By: ${ bookDetails.publisher }
                ISBN: ${ bookDetails.ISBN }
            `);
        }
    };

    return publicAPI;
}

function BlogPost(title,author,pubDate,URL) {
    var pub = Publication(title,author,pubDate);

    var publicAPI = {
        print() {
            pub.print();
            console.log(URL);
        }
    };

    return publicAPI;
}
```

與類別相比，兩者有以下幾個差異:

- 類別中的數據與方法儲存於物件的實例當中，在裡頭存取數據需透過`this`，而模組只要是在它的範疇當中都能進行存取，無需使用`this`。
- 對於類別的實例化API是隱藏在類別的定義中的，並且所有的數據和方法都是公開的。模組可以透過公開的方法來創建，而只有開放的數據與方法可以使用，否則其他都是私有的。

在2019年針對模組化又有區分AMD(Asynchronous Module Definition)、UMD(Universal Module Definition)、CommonJS(classic Node.js style modules)與ES6的模組化，這些模組化的功能基本上都依賴於相同的基本原理，稍後會提到關於ES6模組化的部分。

下面為使用模組的例子:

```javascript
var YDKJS = Book({
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    publishedOn: "June 2014",
    publisher: "O'reilly",
    ISBN: "123456-789"
});

YDKJS.print();
// Title: You Don't Know JS
// By: Kyle Simpson
// June 2014
// Published By: O'reilly
// ISBN: 123456-789

var forAgainstLet = BlogPost(
    "For and against let",
    "Kyle Simpson",
    "October 27, 2014",
    "https://davidwalsh.name/for-and-against-let"
);

forAgainstLet.print();
// Title: For and against let
// By: Kyle Simpson
// October 27, 2014
// https://davidwalsh.name/for-and-against-let
```

### ES Modules

與經典模組相比有以下的差異:

- 不再透過函式來定義模組，改為一個檔案等同於一個模組。
- 不需要再多一層API進行交流，改為使用`export`這個關鍵字代替，而未使用`export`的部分都被視為是私有的。
- 不需要進行實例化，透過`import`導入模組時，會自動產生單一實例，所有對該模組進行`import`的檔案(模組)是對到同一個實例的參考(reference)，若你真的需要產生多個實例化則必須在模組中添加經典模組的工廠函式。

底下混合了經典模組以示範如何在ES模組當中產生多個實例。

首先看看`publication.js`:

```javascript
function printDetails(title,author,pubDate) {
    console.log(`
        Title: ${ title }
        By: ${ author }
        ${ pubDate }
    `);
}

export function create(title,author,pubDate) {
    var publicAPI = {
        print() {
            printDetails(title,author,pubDate);
        }
    };

    return publicAPI;
}
```

接著在`blogpost.js`中使用`import`關鍵字來參考`publication.js`這個模組:

```javascript
import { create as createPub } from "publication.js";

function printDetails(pub,URL) {
    pub.print();
    console.log(URL);
}

export function create(title,author,pubDate,URL) {
    var pub = createPub(title,author,pubDate);

    var publicAPI = {
        print() {
            printDetails(pub,URL);
        }
    };

    return publicAPI;
}
```

最後在`main.js`中執行:

```javascript
import { create as createBlogPost } from "blogpost.js";

var forAgainstLet = createBlogPost(
    "For and against let",
    "Kyle Simpson",
    "October 27, 2014",
    "https://davidwalsh.name/for-and-against-let"
);

forAgainstLet.print();
// Title: For and against let
// By: Kyle Simpson
// October 27, 2014
// https://davidwalsh.name/for-and-against-let
```

我們可以透過經典模組來達成多個實例，或者你也可以直接在模組中使用類別代替`creat(..)`這類的工廠函式，只要在使用時透過`new`就能產生一個新的實例，若模組不需要多個實例則可以不需要這些動作。

## 總結

這篇文章只是[You don't know JavaScript Yet: Get Started](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/get-started/README.md)中的第二章，所以許多深入議題的部份會在後面幾章才顯現出來，我也將逐步寫下我的筆記直到我把全部看完為止。

## Reference

- [You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)
- [You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)
