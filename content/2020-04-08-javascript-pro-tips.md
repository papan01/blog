---
title: "編寫JavaScript的小技巧"
date: "2020-04-08"
category: "FrontEnd"
cover: "/images/person-standing-on-wrecked-plane.jpg"
tags:
  - JavaScript
---

我在Youtube上面看到了一支影片[「JavaScript Pro Tips - Code This, NOT That」](https://www.youtube.com/watch?v=Mus_vwhTCq0)，裡面的教導了一些寫JavaScript的小技巧，覺得很棒，所以在此把想它記錄下來。

## Console

- Bad Code 💩

```javascript
const foo = { name: 'tom',   age: 30, nervous: false };
const bar = { name: 'dick',  age: 40, nervous: false };
const baz = { name: 'harry', age: 50, nervous: true };

console.log(foo);
console.log(bar);
console.log(baz);
```

原因:在DevTool上看到的log只會呈現Object，無法一眼看出是哪一個。
![call-stack-1](/static/images/call-stack-1.png)

- Good Code 👍

```javascript
// Computed Property Names
console.log('%c My Friends', 'color: orange; font-weight: bold;' )
console.log({ foo, bar, baz });

// Console.table(...)
console.table([foo, bar, baz])

// Console.time
console.time('looper')

let i = 0;
while (i < 1000000) { i ++ }

console.timeEnd('looper')

// Stack Trace Logs
const deleteMe = () => console.trace('bye bye database')

deleteMe()
deleteMe()
```

1. 將它們置入於物件中，在console上就能看得到它們的名稱。
2. 可以替它們增加一點樣式，讓我們一眼就注意到想注意的部分。
3. 使用`console.table`表格化，也能增加可讀性。
4. 透過`console.time`與`console.timeEnd`計算執行時間。
5. 