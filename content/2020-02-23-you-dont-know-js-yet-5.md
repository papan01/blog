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

## 彈珠與桶子

第一個例子是將理解範疇比喻為有顏色的彈珠與桶子。

想像你有很多個紅色、藍色與綠色的彈珠，要將他們分類到對應顏色的桶子，當你想要某種顏色的彈珠時，你就知道你該去哪個桶子拿。
而這個比喻中，變量就是彈珠，而桶子就是範疇(函式或者區塊中)，當然這裡只是概念上的想像，實際上每個彈珠的顏色會取決於發現彈珠的範疇(桶子)。

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

這裡用註解標記了三個範疇:

1. RED(最外層的全域範疇)
1. BLUE(函式`getStudentName`中的範疇)
1. GREEN(迴圈中的範疇)


![YDKJSY-5-1](/static/images/you-dont-know-js-yet-5-1.png)
<figcaption><em>Colored Scope Bubbles(https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/images/fig2.png)</em></figcaption>
