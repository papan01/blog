---
title: "Javascript Design Patterns: Creational Design Patterns"
date: "2020-05-17"
category: "Design-Pattern"
cover: "/images/spring-book-with-feather-sketch.jpg"
tags:
  - JavaScript
---

設計模式(Design Pattern)是程式設計中一些常見問題的解決方案，相信大家都有聽過[Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)這本由Gang of Four(GoF)所編寫的經典書籍，裡面整理了經典的23個設計模式，主要可以將它們分成以下幾個種類: creational、structural與behavioral。在本章中我將介紹creational中的幾個設計模式是如何運於javascript中。

## 目的

創建型設計模式(creational design patterns)著重於處理物件創建的機制，以適合的方式針對當前情況創建物件。若以正常的方式創建物件，隨著程式逐漸茁壯可能會導致整個專案增加複雜性，而這些模式的宗旨在於通過**控制創建過程**來解決此問題。

屬於此類別的模式有：

- Constructor(此設計模式不在GoF所提到的23設計模式中)
- Factory
- Abstract Factory
- Prototype
- Singleton
- Builder

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
