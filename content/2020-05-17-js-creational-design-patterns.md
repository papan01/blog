---
title: "Javascript Design Patterns: Creational Design Patterns"
date: "2020-05-17"
category: "Design-Pattern"
cover: "/images/spring-book-with-feather-sketch.jpg"
tags:
  - JavaScript
---

設計模式(design pattern)是程式設計中一些常見問題的解決方案，相信大家都有聽過[Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)這本由Gang of Four(GoF)所編寫的經典書籍，裡面整理了經典的23個設計模式，主要可以將它們分成以下幾個種類: creational、structural與behavioral。在本章中我將介紹creational中的幾個設計模式是如何運於javascript中。

## 目的

創建型設計模式(creational design patterns)著重於處理物件創建的機制，以適合的方式針對當前情況創建物件。若以正常的方式創建物件，隨著程式逐漸茁壯可能會導致整個專案增加複雜性，而這些模式的宗旨在於通過**控制創建過程**來解決此問題。

## Constructor Pattern

在傳統的物件導向程式語言(OOP)中，建構子(constructor)是一個特別的函式用於初始化一個新的物件並且對其進行記憶體的配置。而在javascript當中，因為不像其他傳統class-based的程式語言，JS的建構子就只是一個單純的函式，與類別無關，也因此如此，這個設計模式比較常看到是在說明與Javascript有關。我們通常會編寫建構子函數以完成物件類型的定義，其中包含該物件的類型名稱、屬性與方法，以及當我們在創建該物件時所需要帶入的參數等等。

### 建立物件

這裡先簡單介紹一下javascript如何建立物件以及賦予屬性。

我們可以透過以下三種方式建立物件:

```javascript
// 1. 使用一對大括號表示
const object1 = {};
// 2. 使用Object.create
const object2 = Object.create( Object.prototype );
// 3. 透過Object constuctor
const object3 = new Object();
```

然後可以透過四種方式進行配置屬性:

```javascript
const myObject = {};
// 1. 使用dot語法
// Set屬性
myObject.someKey = "Hello World";
// Get屬性
var value = myObject.someKey;

// 2. 使用中括號
// Set屬性
myObject["someKey"] = "Hello World";
// Get屬性
var value = myObject["someKey"];

// 下面只能在ES5之後使用

// 3. Object.defineProperty
// Set屬性
Object.defineProperty( myObject, "someKey", {
    value: "Hello World",
    writable: true,
    enumerable: true,
    configurable: true
});
// Get使用1或2的方式

// 4. Object.defineProperties
// Set屬性
Object.defineProperties( myObject, {
  "someKey": {
    value: "Hello World",
    writable: true
  },

  "anotherKey": {
    value: "Foo",
    writable: false
  }
});
// Get使用1或2的方式
```

## 基本的建構子範例

```javascript
function Student( name, year, grade) {
  this.name = name;
  this.year = year;
  this.grade = grade;
}

Student.prototype.toString = function () {
  return `Name:${this.name} Year:${this.year} Grade:${this.grade}`;
};
```

上面可以看到我們是透過`prototype`替`Student`添加它的方法，而不是寫在`Student`這個函式中，若寫在裡面的話代表每次建構一個`Student`物件都會建立一個新的`toString()`方法，這樣比較浪費記憶體空間，所以比較好的做法是透過`prototype`添加。

或許你曾經在某些教科書上看過這種寫法，因為這十分的常見，不過在實務上比較多的寫法是等等要介紹的module pattern。

## Module Pattern

將程式進行模組化(modularization)通常有助於保持程式碼單元的清晰分離和組織，所以在現代的javascript中，已經有好幾種方便我們實踐模組化的選項可以使用了:

- 傳統的modules
- AMD modules
- CommonJS modules
- ES6 modules

這裡就不一一介紹，因為基本上它們的概念是差不多的，只是在語法上有些差異。

以下我將介紹我比較熟悉的傳統modules與ES6 modules