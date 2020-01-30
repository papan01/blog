---
title: "You don't know JavaScript Yet:#4 範疇"
date: "2020-01-31"
category: "FullStack"
cover: "/images/you-dont-know-js.png"
tags:
  - JavaScript
  - YDKJSY
---

我們在編寫程式時，通常會存在許多變數，而這些變數都有它所居住的地方，等到我們需要時去存取它。JS定義了一個明確的規則用來管理這些變量稱為範疇(Scope)，在我們討論範疇之前，我們必須先理解JS是如何處理與執行程式。

## 編譯程式碼

在[You don't know JavaScript Yet:#1 什麼是JavaScript](/archives/2020-01-01-you-dont-know-js-yet-1)中，我們討論過關於JS是屬於Compiler(編譯)語言，而我們需要討論此行為的原因是因為範疇完全取決於編譯時期。

程序通常經由Compiler執行以下三個階段:
