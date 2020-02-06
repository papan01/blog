---
title: "從建立Gatsby's Blog我學習到了什麼"
date: "2019-12-11"
category: "FrontEnd"
cover: "/images/gatsby.jpg"
tags:
  - GatsbyJS
---

最近學習 React 後，就想使用 React 建立自己的 blog，於是搭配了 webpack 慢慢建立我心目中以為的架構，
順便練習 React，雖然我寫了一個看似不錯的網站，但我發現每次要加入新文章都得大費周章，而那時候也不知道使用 Markdown 之類的格式，
漸漸的覺得自己蠻幹不是辦法，所以了解到自己缺乏許多編寫Ｗ ebApp 上的知識就停下腳步開始找別人在建立靜態網站都是如何編寫的
，於是找到像[Wordpress](https://zh-tw.wordpress.com/)或是[Ｍ edium](https://medium.com/)之類可以很輕易建立自己
Blog 的網站，但身為一個軟體開發者就是想自己寫寫看，於是後來找到了[Hexo](https://hexo.io/zh-tw/index.html)與[GatsbyJS](https://www.gatsbyjs.org/)
，有先嘗試使用 Hexo，但後來看 GatsbyJS 是使用 React 後，就轉為使用 GatsbyJS，所以此文章也會以我在 GatsbyJS 中學習到的東西。這個 Blog 就是使用 GatsbyJS 所寫的，
Source Code 在[gatsby-starter-papan01](https://github.com/papan01/gatsby-starter-papan01)，有興趣的可以看一下。

## 從中學習到的知識

- React Hooks

  在之前學習 React 的時候都是使用 class-base 的方式撰寫，而在我動手寫之前就決定要全部使用 Hooks 來寫我的 Blog，順便作為練習。

- Audit Score

  當我們編寫好網頁後有時候很難評估到底你寫得好不好，好在我們可以透過一些工具來幫助我們評估網站。

  [Lighthouse](https://developers.google.com/web/tools/lighthouse/):

  Lighthouse 可以幫我們評估網頁的 performance, accessibility, progressive web apps (PWAs)等等，我們可以透過chrome的開發人員工具，裡面的 audit 找到它。

  [WebPageTest](https://www.webpagetest.org/):

  WebPageTest 也是可以一個可以幫我們測試網站速度的工具，只要進去網頁輸入你想評估的網址即可。

- Code Splitting

  我們通常會使用 Webpack 之類的工具來 bundle 我們 import 的檔案，將多個檔案合併成一個檔案，就稱之為 bundle。當我們的應用程式漸漸變大時，我們 bundle 的檔案也會越來越大，
  這會使得使用者在載入你的網頁時會載入一些他可能用不到的部分，甚至導致你的載入時間變長。解決方式就是『split』你的 bundle，我們可以使用 Dynamic import:

  ```javascript
  import React, { Component } from "react";
  class App extends Component {
    handleClick = () => {
      import("./moduleA")
        .then(({ moduleA }) => {
          // Use moduleA
        })
        .catch(err => {
          // Handle failure
        });
    };
    render() {
      return (
        <div>
          <button onClick={this.handleClick}>Load</button>
        </div>
      );
    }
  }
  export default App;
  ```

  若你使用 Webpack 你則需要設置你的 chunk(參考[Webpack Code Spliting](https://webpack.js.org/guides/code-splitting/#dynamic-imports))。
  而 GatsbyJS 裡面也是使用 Webpack，它是根據『Pages』去做 split，在專案中的.cache/async-requires.js 可以看到它生成的結果(參考[Gatsby Code Spliting](https://www.gatsbyjs.org/docs/how-code-splitting-works/))。這部分我也只學了點皮毛，若之後有學習更深入，在單獨寫一篇心得 😓。

- Pagination

  我想這不論在寫哪種網頁都會遇到類似的問題，而 GatsbyJS 當中可以透過 createPages 來創建多個分頁(參考[Gatsby Pagination](https://www.gatsbyjs.org/docs/adding-pagination/))，接著只要建立對應的 Link 即可，但我在中途還遇到另外一個問題就是 Pagination Algorithm，我們平常看到其他網頁再分頁過多時都是**1、2、3、...、最後一頁**，之類的顯示方式，所以就上網找了一下這該如何實作:

  ```javascript
  function pagination(currentPage, pageCount, delta = 2) {
    const separate = (a, b) => [
      a,
      ...({
        0: [],
        1: [b],
        2: [a + 1, b]
      }[b - a] || ["...", b])
    ];

    return Array(delta * 2 + 1) //以delta = 2, currentPage = 1, pageCount = 10為例
      .fill() //[undefind, undefined, undefined, undefined, undefined];
      .map((_, index) => currentPage - delta + index) // [-1, 0, 1, 2, 3]
      .filter(page => page > 0 && page <= pageCount) // [1, 2, 3]
      .flatMap((page, index, { length }) => {
        if (!index) return separate(1, page); //第一頁
        if (index === length - 1) return separate(page, pageCount); //最後一頁

        return [page];
      }); //Array [1, 2, 3, "...", 10]
  }
  ```

- SEO(Search Engine Optimization)

  SEO 用於增加你的網站被搜尋到的可能性，根據不同的搜尋引擎有不同的搜尋演算法，當我們使用上面提到的 lighthouse 時，裡面也有 SEO 的分數。
  [React-Helmet](https://github.com/nfl/react-helmet)是幫助你增加 document head 的好工具，例如你想加入 title、meta 等等 tag 都可以很方便的使用。
  而我在自己的網站加入 Sitemap, Schema.org, OpenGraph tags, Twitter tags 等等有助於 SEO 的東西。

- RSS feeds

  以前根本不會使用 RSS，也不知道這是做什麼用的，後來看到有些人的 Blog 都有 RSS link，所以就上網查了一下這該怎麼使用，若沒使用過的可以去 Chrome
  安裝擴充套件[RSS feed reader](https://chrome.google.com/webstore/detail/rss-feed-reader/pnjaodmkngahhkoihejjehlcdlnohgmp?hl=zh-TW)，
  接著若有看到別人的網站有提供 RSS，可以點擊一下就能訂閱別人的網站了(可以使用最底下我的 RSS 試試看 🤭)，若有新文章也會通知你。
  若你想在自己的 Blog 建立 RSS Link，在 GatsbyJS 中可以使用[gatsby-plugin-feed](https://www.gatsbyjs.org/packages/gatsby-plugin-feed/)。

- Code quality

  這是我在寫 github 專案的 README.md 時，看到別人有使用的好東西，它可以評估你程式碼的品質，還會幫你打分數，並且檢查你有哪些地方可以改進的地方，
  我自己對於程式碼的整潔度要求蠻高的，所以這工具對我來說實在太棒了，而這個 Blog 的 source code 也被我丟了上去，第一次就拿了 A👍，
  代表平常對自己的要求還是有用的。

- GraphQL

  GraphQL 是由 Facebook 所開發的，目前我只會在 GatsbyJS 上使用 GraphQL，因為它裡面就必須搭配 GraphQL 使用，但它其實可以在許多程式語言上使用，且使用起來非常便利，
  GatsbyJS 中可以透過 GraphQL 去搜尋檔案、圖片、文章等等，便利你建立分頁。

## 結語

上面是一些我這一個月學習以及使用 GatsbyJS 時順便學習到的東西，若有問題歡迎在下面留言或者與我聯繫。
