---
title: "從建立Blog我學習到了什麼"
date: "2019-12-11"
category: "FrontEnd"
cover: "../images/gatsby.webp"
tags:
  - GatsbyJS
---

最近學習React後，就想使用React建立自己的blog，於是搭配了webpack慢慢建立我心目中以為的架構，
順便練習React，但寫到一半我發現自己認為的架構不夠有彈性，且此時我編寫的方式是一頁幹到底，沒有想到SSR的部分，
所以了解到自己缺乏許多編寫ＷebApp上的知識😫，所以停下腳步開始找別人在建立靜態網站都是使用什麼工具
，有找到像是[Wordpress](https://zh-tw.wordpress.com/)或是[Ｍedium](https://medium.com/)可以很輕易建立自己的
Blog，但身為一個寫程式的就是想自己寫寫看，於是後來找到了[Hexo](https://hexo.io/zh-tw/index.html)與[GatsbyJS](https://www.gatsbyjs.org/)
，有先嘗試使用Hexo，但後來看GatsbyJS是使用React後，就轉為使用GatsbyJS，所以此文章也會以我在GatsbyJS中學習到的東西。這個Blog的Source Code在(https://github.com/papan01/gatsby-starter-papan01)，
有興趣的可以看一下。

## 學習到的知識
- React Hooks
  
  在之前學習React的時候都是使用class-base的方式撰寫，而在我動手寫之前就決定要全部使用Hooks來寫我的Blog，順便作為練習。
- Audit Score
  
  當我們編寫好網頁後有時候很難評估到底你寫得好不好，好在我們可以透過一些工具來幫助我們評估我們的網站。
  1. [Lighthouse](https://developers.google.com/web/tools/lighthouse/):

    Lighthouse可以幫我們評估網頁的performance, accessibility, progressive web apps (PWAs)等等，我們可以透過chrome的開發人員工具，裡面的audit找到它。






