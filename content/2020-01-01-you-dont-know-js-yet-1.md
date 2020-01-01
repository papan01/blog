---
title: "You don't know JavaScript Yet:#1 什麼是JavaScript"
date: "2020-01-01"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
---

這是我閱讀[You don't know JavaScript Yet](https://github.com/getify/You-Dont-Know-JS)的讀書筆記，希望藉此記錄下來作為重點整理，以便往後複習。這章節的內容主要在講述有關於JavaScript知識，但不是「新手入門」那種如何宣告變數與寫Hello World之類的。

## 關於JavaScript的名稱

我想多數人在第一次看到JavaScript時，一定認為它與Java有某種關係存在，但實際上一點關係都沒有😑。實際上Brendan Eich(JavaScript的主要架構師與創造者)在一開始把它命名為Ｍocha，在Netscape(Brendan Eich當時的公司)內部，則使用了LiveScript作為它的名稱，但是當公開投票命名該語言時，"JavaScript"最終贏得了勝利，只因為當時Java是主流語言，而為了吸引使用Java的程式開發者使用JavaScript所以前面用了Java，而Script一詞在當時很流行，用來代表「輕量(lightweight)」的程式語言，所以就誕生了一個嵌入在Web中的腳本語言。Sum(現在的Oracle)與Netscpae把JavaScript送去ECMA(European Computer Manufacturers Association)進行標準化作業，但因為商標的問題，就出現我們常看見的「ECMAScript」這個奇怪的名字，而我們現在通常把它視為一種標準。

## JavaScript規範

[TC39](https://github.com/tc39)是一個管理JavaScript的技術指導委員會，主要的任務就是為了管理語言的官方規範，他們會定期開會，商議變更進行投票，然後再提交給ECMA標準化。TC39委員會的會員大約由50到100人組成，而這些人來至瀏覽器(Mozilla，Google，Apple)和設備製造商(Samsung)等等。
所有TC39提案都通過五個階段進行，由於我們是程序員，所以它是從0開始的！階段0到階段4。您可以在此處了解有關階段流程的更多信息:<https://tc39.es/process-document/>。我們一般人也能提出想法，但只有TC39的會員認為它是可行才會正式提提案為"階段0"，當提案狀態來到"階段4"後他就會被視為下一年度的修訂標準中，相關的提案可以參考:<https://github.com/tc39/proposals/>。所有的瀏覽器與設備製造商都致力於實現這些標準，只是會有實現功能的時間問題，這意味著我們只需要學習一種JavaScript，它就能在所有支援JavaScript的瀏覽器或設備上運行。

### 基於Web的規範

JavaScript的運行環境不斷的擴展，從Web到Server(Node.js)甚至機器人、燈泡(原文提到燈泡，恕我孤陋寡聞，沒看過燈泡跑JS🤔)，但一切的規範都要基於Web，任何會破壞Web內容的規範基本上都會被拒絕更改，在這些情況下，TC39通常會回溯，只選擇符合Web的情況，例如，TC39計劃為Arrays添加一個contains(..)方法，但是發現該名稱與某些網站上舊有的JS frameworks衝突，因此他們將名稱更改為一個不衝突的include(..)。但有些時候TC39也會讓Web不太可能符合標準繼續堅持下去...。從原文的這段看來，基本上只是看TC39的委員們想或不想而已🤯，所以在[ECMA2019](https://www.ecma-international.org/ecma-262/10.0/#sec-additional-ecmascript-features-for-web-browsers)中有列出了有些規範與Web上JS的規範不匹配的情況，而這些是允許的例外。
