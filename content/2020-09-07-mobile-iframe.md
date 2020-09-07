---
title: "筆記:行動裝置上使用iframe遇到的各種問題"
date: "2020-09-07"
category: "FrontEnd"
cover: "/images/mobile-iframe.jpg"
tags:
  - JavaScript
  - CSS
---

因為公司與其他brand合作的方式是將我們的網頁透過iframe嵌入其中，但這導致在行動裝置上產生了一系列的問題，所以在此希望能記錄下這些研究的過程，給其他遇到類似問題的人一點幫助。

## 情境

我們網頁Designer希望content的scroll bar不要超出它的範圍，也就是希望不要跑到header或者bottom navigation上，因為這個需求導致在行動裝置上就只有一個頁面的高度，而瀏覽器都有top address bar與bottom action bar，預設行為是當user向下滑動頁面時，會自動縮起top address bar與bottom action bar，但由於前面提到的需求，這導致我們無法縮放top address bar與bottom action bar(範例可以用手機看[https://app.ft.com](https://app.ft.com))，不能縮放的問題被上面的長官接受了，接著就是將iframe至於brand的header底下即可。

## 問題

在我們放到brand的網站底下後，發現了幾個問題，這裡一一列出遇到的問題。

1. iOS 12 iframe無法responsive，導致整個網頁跑版。
2. 如何撐滿iframe的高度保持於一個頁面。
3. 當user只有開一個tab時，將網頁從portrait轉到landscape再轉回portrait底下會預留一塊bottom action bar的空位(此問題可在[https://app.ft.com](https://app.ft.com)中reproduce)。

我們主要測試的browser有Safari、Chrome、UC Browser，所以以下所提到的解法只有在上述的browser測試過。

![mobile-iframe-1](/static/images/mobile-iframe-1.png)

## 問題1: iOS 12 iframe responsive

