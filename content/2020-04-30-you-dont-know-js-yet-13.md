---
title: "You don't know JavaScript Yet:#13 Object"
date: "2020-04-30"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

JS中的物件(Object)就如同你在其他程式語言看到的一般，想像它與現實世界中的物件一樣，擁有一些特性或者行為。物件是一個擁有其自己的屬性(property)與方法(method)的實體，以車子為例，車子有輪胎、顏色、長度等屬性，有前進、後退、轉彎等方法，所以常常可以聽到程式人員說要把某某東西物件化，通常就是希望能夠將邏輯整理在一起方便使用與閱讀。在這章中我們將詳細的討論JS中的物件。

[[info]]
|由於在編寫這篇文章的同時，原文正在改版之際，還沒有這冊的第二版，所以這篇文章先以第一版的內容為主，之後第二版出了再進行修改。

## 語法(Syntax)

物件通常來自兩種形式:

- 陳述式

  ```javascript
  var myObj = {
    key: value
    // ...
  };
  ```

- 建構式

  ```javascript
  var myObj = new Object();
  myObj.key = value;
  ```

上面這兩種形式的結果完全相同，都是生成一個物件，差別在於使用陳述式的方式可以在一開始就一次插入多個屬性，若用建構式則要一個一個加入。所以通常我們比較常看到是使用陳述式的方式來建構物件。

## 型別(Type)
