---
title: "筆記:行動裝置上使用iframe遇到的各種問題"
date: "2020-09-07"
category: "FrontEnd"
cover: "/images/mobile-iframe.jpg"
tags:
  - JavaScript
  - CSS
---

因為公司與其他brand合作的方式是將我們的網頁透過iframe嵌入其中，但這導致在行動裝置上產生了一系列的問題，所以在此記錄下這些研究的過程，希望能給其他遇到類似問題的人一點幫助。

## 情境

我們網頁Designer希望content的scroll bar不要超出它的範圍，也就是希望不要跑到header或者bottom navigation上，因為這個需求導致在行動裝置上就只有一個頁面的高度，而瀏覽器都有top address bar與bottom action bar，預設行為是當user向下滑動頁面時，會自動縮起top address bar與bottom action bar，但由於前面提到的需求，這導致我們無法縮放top address bar與bottom action bar(範例可以用手機看[https://app.ft.com](https://app.ft.com))，不能縮放的問題被上面的長官接受了，接著就是將iframe至於brand的header底下即可。

## 問題

在我們放到brand的網站底下後，發現了幾個問題，這裡一一列出遇到的問題。

1. iOS 12 iframe無法responsive，導致整個網頁跑版。
2. 如何撐滿iframe的高度保持於一個頁面。
3. 當user只有開一個tab時，將網頁從portrait轉到landscape再轉回portrait底下會預留一塊bottom action bar的空位(此問題可在[https://app.ft.com](https://app.ft.com)中reproduce，所以這不單只出現在iframe中)。

我們主要測試的browser有Safari、Chrome、UC Browser，所以以下所提到的解法只有在上述的browser測試過。

![mobile-iframe-1](/static/images/mobile-iframe-1.png)

底下的程式碼為最終解決這些問題的結果，下面將一一解釋使用的目的:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,shrink-to-fit=no"
    />
    <title>Ifram Testing</title>
    <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <nav class="navbar">Brand Header</nav>
    <main class="content">
      <iframe
        id="myIframe"
        src="https://app.ft.com"
        allowtransparency="true"
        frameborder="0"
      ></iframe>
    </main>
    <script type="text/javascript" src="iframeModule.js"></script>
    <script type="text/javascript">
      const iframeModule = new IframeModule(50, "myIframe");
      iframeModule.init();
    </script>
  </body>
</html>
```

`style.css`:

```css
* {
  box-sizing: border-box;
}

body {
  padding: 0;
  margin: 0;
  height: 100%;
}

.navbar {
  position: fixed;
  top: 0;
  transition: 0.2s ease-in-out;
  width: 100%;
  z-index: 999;
  background-color: #060606;
  height: 50px; /* brand header height */
}

.content {
  position: fixed;
  margin-top: 50px; /* brand header height */
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.content iframe {
  height: 100%;
  width: 100%;
}

.content iframe.ios {
  min-width: 100%;
  width: 1px;
}
```

`iframeModule.js`:

```js
function IframeModule(headerHeight, iframeID) {
  const iframe = document.getElementById(iframeID);
  const isiOS = navigator.userAgent.match(/(iPod|iPhone|iPad)/);

  function getIFrameHeight() {
    return window.innerHeight - headerHeight + "px";
  }

  function setIFrameHeight() {
    iframe.style.height = getIFrameHeight();
  }

  function registerOrientationChange(callback) {
    window.addEventListener("orientationchange", function () {
      const afterOrientationChange = function () {
        callback();
        window.removeEventListener("resize", afterOrientationChange);
      };
      window.addEventListener("resize", afterOrientationChange);
    });
  }

  function init() {
    window.addEventListener("DOMContentLoaded", setIFrameHeight);
    if (isiOS) {
      iframe.setAttribute("scrolling", "no");
      iframe.classList.add("ios");
      registerOrientationChange(function () {
        if (window.matchMedia("(orientation: portrait)").matches) {
          document.getElementsByTagName("html")[0].style.height = "100vh";
          setTimeout(function () {
            document.getElementsByTagName("html")[0].style.height = "100%";
          }, 300);
        }
        setIFrameHeight();
      });
    } else {
      registerOrientationChange(function () {
        setIFrameHeight();
      });
    }
  }

  return {
    init,
  };
}
```

## 問題1: iOS 12 iframe responsive

此問題的解法比較簡單，若我們能夠控制iframe裡面內容物的CSS，只要在內容`html`加入下面這段CSS既可:

```css
    width: 1px;
    min-width: 100%;
```

但若我們無法控制內容物的CSS，只能透過改變iframe的style來解決:

```css
iframe.ios {
    width: 1px;
    min-width: 100%;
}
```

但只加上面的這樣還不夠，還必須加上`scrolling="no"`才行

```html
<iframe src="http://example.com" allowtransparency="true" frameborder="0" scrolling="no"></iframe>
```

最後我們只要偵測是iOS裝置使用者再加上上述這些屬性即可:

```js
...
const iframe = document.getElementById(iframeID);
const isiOS = navigator.userAgent.match(/(iPod|iPhone|iPad)/);
if (isiOS) {
      iframe.setAttribute("scrolling", "no");
      iframe.classList.add("ios");
}
...
```

## 問題2: 撐滿iframe高度於一個頁面

起初我嘗試透過動態計算`window.innerHeight - {brand header height}`設置iframe的高度，當我嘗試在實體手機上測試來回的從portrait轉到landscape再轉回portrait時，
發現有時候高度計算會錯誤，導致我的iframe只有landscape時的高度，所以我就上網找了一下解決方案，剛好stackoverflow有一篇在討論這個問題:[Mobile viewport height after orientation change](https://stackoverflow.com/questions/12452349/mobile-viewport-height-after-orientation-change)，其中我篩選掉了使用`setTimeout`的解決方式，因為那時間你很難明確地掌握，如果可以避免使用我都會盡量避免使用，
所以我嘗試了裡面幾個vote比較高的解法，但依舊會旋轉過後計算錯誤的時候，儘管它不是很常發生。

```javascript
...
window.addEventListener("orientationchange", function () {
  const afterOrientationChange = function () {
    iframe.style.height = window.innerHeight - headerHeight + "px";
    window.removeEventListener("resize", afterOrientationChange);
  };
  window.addEventListener("resize", afterOrientationChange);
});
...
```

接著我朝CSS的方向尋求答案，看看上述`main`元素的部分:

```html
...
<main class="content">
  <iframe
    id="myIframe"
    src="https://app.ft.com"
    allowtransparency="true"
    frameborder="0"
  ></iframe>
</main>
...
```

我嘗試將`.content` selector設置如下:

```css
.content {
  position: fixed;
  margin-top: 50px; /* brand header height */
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
```

當我只靠配置CSS撐滿畫面高度時，發現了兩個問題:

1. 當有多個tab、landscape的狀態下，預設會出現top address bar，由於多出這段高度，使得iframe中的bottom navigation會被擠出畫面外。
2. 在有些Android設備上的UC Browser底下會多一塊空間，在iframe與bottom action bar中間。

最後我將上述兩種方式合併，就解決了這些問題，或許還有其他方式可以解決這類問題，不過目前我只試出這種方法已達到我們的需求。

## 問題3: 當只有一個tab時，旋轉導致不必要的空白

如下圖所示:

![mobile-iframe-2](/static/images/mobile-iframe-2.jpeg)

在最底下會保留一塊空白的部分，那段空白屬於bottom action bar所殘留下來的。起初我想透過觸發scroll的方式來達到彈出bottom action bar已解決那段空白的問題，但最終還是宣告失敗。
後來想透過設定高度的方式將我的iframe達到撐滿整個畫面的效果，但我沒有找到任何一種方式可以獲取瀏覽器top address bar與bottom action bar高度的方法。

最終公司的前輩找到了一個方式解決這個問題:

```js
if (window.matchMedia("(orientation: portrait)").matches) {
    document.getElementsByTagName("html")[0].style.height = "100vh";
    setTimeout(function () {
        document.getElementsByTagName("html")[0].style.height = "100%";
    }, 300);
}
```

如前面所提，我個人會盡量避免使用`setTimout`，但由於沒有任何一種event可以讓我監聽bottom action bar是否有出現，所以造就了這種奇怪的解法，但它至少可以解決這問題。

## Reference

- [FT](https://app.ft.com)
- [Mobile viewport height after orientation change](https://stackoverflow.com/questions/12452349/mobile-viewport-height-after-orientation-change)
- [How to get an IFrame to be responsive in iOS Safari?](https://stackoverflow.com/questions/23083462/how-to-get-an-iframe-to-be-responsive-in-ios-safari)
