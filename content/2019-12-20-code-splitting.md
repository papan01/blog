---
title: "Code Splitting:使用Webpack與React"
date: "2019-12-20"
category: "FrontEnd"
cover: "/images/black-box-with-green-bow-accent.jpg"
tags:
  - Webpack
---

在我學習React時，我沒有照著教學書上的建議使用Create React App，因為我想了解如何自己配置Ｗebpack，
但那時我也不太會Ｗebpack，所以我就React、Webpack甚至TypeScript一直摻著給它學下去(這裡建議先學習React跟Ｗebpack，
而TypeScript比較類似選讀，因為網路上查到與React相關的資料百分之90％都不是使用TypeScript)，後來慢慢學習才知道其實
Create React App有內建的Webpack設定來打包你的程式，GatsbyJS或者NextJS也都有類似的功能。為了讓自己搞懂
Code Splitting到底如何實作，這裡寫下我的實作心得，以下皆是以使用Webpack與React來介紹。

## Code Splitting在做什麼

目的:改善網頁載入時的效率，透過瀏覽器cache機制減少載入大小。

假設今天你有三個頁面，若在未設置多個entry與split chunk的情況下，這代表你的所有程式碼都會被打包到同一個檔案當中，
這意味著使用者在首次載入你的網頁時，需花費較多的時間把所有的程式碼都載入下來，若你只是一個小專案可能還沒有什麼感覺，
但隨著時間專案越變越大時，載入的效率也會越來越低弱，所以我們可以通過以下兩種方式來達到code splitting進而改善這個問題:

1. 移除重複的modules:使用[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/)將第三方module(例如:react、react-dom或者lodash等)或者common的部分(例如layout component)獨立打包出來。

1. Dynamic Imports:透過import()來達到code split。

## 移除重複的modules

首先我建立了一個簡單的專案，裡面有三個頁面Index、About以及favorites以及對應的compnent，裡面都包含了react、react-dom以及一個只包含h1的componet，底下是還未進行code split前檔案大小(.map可以暫時忽略不看):

```shell
                    Asset       Size  Chunks                         Chunk Names
        about.c75ae574.js    129 KiB       0  [emitted] [immutable]  about
    about.c75ae574.js.map    317 KiB       0  [emitted] [dev]        about
               about.html  356 bytes          [emitted]
    favorites.9f05d66b.js    129 KiB       1  [emitted] [immutable]  favorites
favorites.9f05d66b.js.map    317 KiB       1  [emitted] [dev]        favorites
           favorites.html  364 bytes          [emitted]
        index.b3b58fb9.js    129 KiB       2  [emitted] [immutable]  index
    index.b3b58fb9.js.map    317 KiB       2  [emitted] [dev]        index
               index.html  356 bytes          [emitted]
Entrypoint index = index.b3b58fb9.js index.b3b58fb9.js.map
Entrypoint about = about.c75ae574.js about.c75ae574.js.map
Entrypoint favorites = favorites.9f05d66b.js favorites.9f05d66b.js.map
```

以及從Webpack Bundle Analyzer中可以看到三個chunk個有共同的部分(node-modules):
[[info]]
| *[Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)是一個可以觀察你輸出檔案大小的好工具。*
![code-splitting-1](/static/images/code-splitting-1.png)

接下來我希望能夠把react、react-dom抽離出來以減少index、about和favorites這三個chunk的size，在webpack.config中加入底下的程式碼，
目的是告訴Webpack把match test都打包成名為vendor的chunk:

```javascript
...
optimization: {
  splitChunks: {
    cacheGroups: {
      // Split vendor code to its own chunk(s)
      vendors: {
        name: 'vendor',
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        chunks: 'all',
      },
    },
  },
},
...
```

我們來看看下面重新build後的結果，可以發現index、about和favorites的size都變小了，而多了一個名為vendor的chunk，
而react與react-dom合計接近130KB，所以實際上vendor裡頭就是包含了react與react-dom：

```shell{2,4,5,7,8,10-11}
                       Asset       Size  Chunks                         Chunk Names
           about.397f9ce8.js   3.57 KiB       1  [emitted] [immutable]  about
       about.397f9ce8.js.map   16.5 KiB       1  [emitted] [dev]        about
                  about.html  427 bytes          [emitted]
       favorites.75536698.js   3.58 KiB       2  [emitted] [immutable]  favorites
   favorites.75536698.js.map   16.5 KiB       2  [emitted] [dev]        favorites
              favorites.html  435 bytes          [emitted]
           index.32821cb4.js   3.56 KiB       3  [emitted] [immutable]  index
       index.32821cb4.js.map   16.5 KiB       3  [emitted] [dev]        index
                  index.html  427 bytes          [emitted]
    vendor.91146e7a.chunk.js    126 KiB       0  [emitted] [immutable]  vendor
vendor.91146e7a.chunk.js.map    303 KiB       0  [emitted] [dev]        vendor
Entrypoint index = vendor.91146e7a.chunk.js vendor.91146e7a.chunk.js.map index.32821cb4.js index.32821cb4.js.map
Entrypoint about = vendor.91146e7a.chunk.js vendor.91146e7a.chunk.js.map about.397f9ce8.js about.397f9ce8.js.map
Entrypoint favorites = vendor.91146e7a.chunk.js vendor.91146e7a.chunk.js.map favorites.75536698.js favorites.75536698.js.map
```

接著透過Webpack Bundle Analyzer來看就可以看出code split之後的差異了:
![code-splitting-2](/static/images/code-splitting-2.png)

這意味著我們在首次拜訪網站時，我們依舊要下載index.[chunkhash:8].js與vendor.[chunkhash:8].js這時與原本未作code split時所需下載的總大小一樣(但多一次請求)，但是若使用者導覽到about.html時，瀏覽器就只需要載入about.[chunkhash:8].js就可以了，而vendor.[chunkhash:8].js因為在cache中，所以會回傳304:
![code-splitting-3](/static/images/code-splitting-3.png)
![code-splitting-4](/static/images/code-splitting-4.png)

## Dynamic Imports

[ECMAScript proposal:import()](https://github.com/tc39/proposal-dynamic-import)定義了為動態載入時使用，Ｗebpack會在針對程式碼中的import()進行類似於前面code splitting的行為，為了演釋dynamic Import，我們把前面的程式碼都先刪除掉，這裡我以動態載入lodash並且只用index作為範例，底下為index中唯一包含的component:

```tsx
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

interface Props {
  str: string;
}

const PrintHeader: React.SFC<Props> = props => {
  const { str } = props;
  const res = _.join([str, 'code', 'spliting'], ' ');
  return <h1>{res}</h1>;
};

PrintHeader.propTypes = {
  str: PropTypes.string.isRequired,
};

export default PrintHeader;
```

我們來看看build完之後的結果:

```shell
                Asset       Size  Chunks                         Chunk Names
    index.d664f96a.js    199 KiB       0  [emitted] [immutable]  index
index.d664f96a.js.map    994 KiB       0  [emitted] [dev]        index
           index.html  356 bytes          [emitted]
Entrypoint index = index.d664f96a.js index.d664f96a.js.map
```

接著我要修改PrintHeader中import lodash的部分，使其變為dynamic import，我們再來看看結果會有什麼不同:

```javascript{1,10-16}
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

interface Props {
  str: string;
}

const PrintHeader: React.SFC<Props> = props => {
  const { str } = props;
  const [header, setHeader] = useState(str);
  useEffect(() => {
    import(/* webpackChunkName: "lodash" */ 'lodash').then(({ default: _ }) => {
      setHeader(_.join([str, 'code', 'spliting'], ' '));
    });
  }, [header, str]);
  return <h1>{header}</h1>;
};

PrintHeader.propTypes = {
  str: PropTypes.string.isRequired,
};

export default PrintHeader;
```

在這邊我使用[React Hooks](https://zh-hant.reactjs.org/docs/hooks-intro.html)並且使用這小段要展示的import()，你可能有注意到webpackChunkName這段註解，這段文字是有意義的，當你配置webpackChunkName時，webpack就會根據你提供的名稱來命名chunk，若沒設置的話，則名稱為一個數字;接著我們來看一下build完後的結果:

```shell{2,5}
                               Asset       Size  Chunks                         Chunk Names
                   index.3015bdd4.js    131 KiB       0  [emitted] [immutable]  index
               index.3015bdd4.js.map    324 KiB       0  [emitted] [dev]        index
                          index.html  356 bytes          [emitted]
    vendors~lodash.c49fe80f.chunk.js     70 KiB       1  [emitted] [immutable]  vendors~lodash
vendors~lodash.c49fe80f.chunk.js.map    673 KiB       1  [emitted] [dev]        vendors~lodash
Entrypoint index = index.3015bdd4.js index.3015bdd4.js.map
```

我們可以發現多了一個vendors~lodash的chunk，但在index.html當中並不會看到有包含這個js，我們實際開啟這頁面就可以看到它的行為是當載入時才去載入需求的js，vendors~loadsh是在index.[chunkhash:8].js 被載入之後才知道要載入vendors~loadsh.[chunkhash:8].chunk.js:
![code-splitting-5](/static/images/code-splitting-5.png)

## 結語

以上是我自己在弄懂Code Splitting寫的一些實驗，若你在Google搜尋React Code Splitting可能還會找到有關於[React.lazy](https://zh-hant.reactjs.org/docs/code-splitting.html)或者[react-loadable](https://github.com/jamiebuilds/react-loadable)等關於這個議題的文章，React.lazy適用於動態import component用的，概念跟我上面說的類似，而react-loadable一樣可以達到React.lazy的功能，但還能用於SSR時使用，React.lazy的官方文件有說明它並不能用於SSR，而有關於SSR的部分我還不熟悉，所以就沒有放在這個文章當中。
