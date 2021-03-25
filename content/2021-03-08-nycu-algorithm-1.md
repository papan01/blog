---
title: "NYCU-演算法筆記:#1 stable matching"
date: "2021-03-08"
category: "Computer Science"
cover: "/images/insect.jpg"
tags:
  - Algorithms
---

演算法沒有一個明確的定義，但簡單來說是一個用於解決問題的 procedure;
[Donald Knuth, 1968](https://en.wikipedia.org/wiki/Donald_Knuth)認為演算法為:
**A finite, definite, effective procedure, with some output**，下面將解釋這句話認為演算法必須包含哪些特性，
並且將會用一個例子(Stable Matching)作為演算法的入門。

## Definition

我們根據 [Donald Knuth](https://en.wikipedia.org/wiki/Donald_Knuth) 的定義認為一個演算法必須包含以下條件:

- Input: 非必要。
- Output: 必要。
- Definiteness: 描述必須是乾淨且不容易讓人誤解的。
- Finiteness: 必須在有限的步驟內產生 output，若會導致無窮迴圈則代表這不算是一種演算法。
- Effectiveness: 每一個步驟都是有效的，能夠在紙筆上寫下來的，若你無法透過紙筆寫下該步驟，代表這不是一個有效的步驟。
- Procedure: 必須為一段程序，根據特定的步驟組成。

## Stable Matching

假設我們是一家交友公司，現在總共有 100 位男生與 100 位女生需要配對，所有男生或女生都需要對異性進行選擇排序，根據喜好排序他們心目中的 ranking，
且所有人都必須至少配對到，不能有任何烙單的，且不能重複配對，我們希望最後所有男生或女生都能得到**Happy**並且**Stable**的，而裡的**Stable**指的所有的配對都沒有出現**喜歡對方更勝於配對結果**的情況。

![stable-matching-1](/static/images/nycu-algorithm-1-1.png)

<figcaption><em>Stable Matching-1</em></figcaption>

假設我們有 X、Y 和 Z 男生與 A、B 和 C 女生，他們的心目中的排序如上圖所示，接著我們嘗試進行 stable matching，目標是配對完後每個人都是**Happy**並且是**Stable**的，所以我們先嘗試進行配對，
從 Z 開始配對他最喜歡的結果:

![stable-matching-2](/static/images/nycu-algorithm-1-2.png)

<figcaption><em>Stable Matching-2</em></figcaption>

從上面這個配對結果來看，肯定有人是不**Happy**的，那麼這樣的配對是否**Stable**呢?

![stable-matching-3](/static/images/nycu-algorithm-1-3.png)

<figcaption><em>Stable Matching-3</em></figcaption>

X 與 B 互相喜歡對方更勝於配對的結果，所以這樣的配對結果為 unstable。

在我們解決這問題之前，先介紹一些專有名詞:

- **Perfect matching**: 這裡的 perfect 並非指所以配對都是**Happy**的結果，而是指所有人都有匹配到對象，因為在實際的問題當中可能不是每個人都能配對到對像。
- **Stability**: 指的是沒有 unstable 的情況發生。
- **Stable matching**: 意指**Perfect matching** 並且 **Stability**。
- **The stable matching problem**: 從這個問題來看就是給定 n 個男生與 n 個女生的喜好排序從中能夠至少找到一組 stable matching 的結果，且這個喜好排序必須是**complete(所有對象都必須被排到)**並且**no ties(沒有平手的情況，意思是不能把多個對象排在同一個 ranking 中)**。

### Gale–Shapley Algorithm

接下來要介紹針對此問題的演算法:**[Gale and Shapley Algorithm](https://en.wikipedia.org/wiki/Gale%E2%80%93Shapley_algorithm)**，這個演算法的機制簡單來說就是在每次迭代中，男生向女生求婚，而女生有權利拒絕或者接受，但女生在當下的拒絕或者接受不代表最終的配對結果(deferred decision making)，這整個演算法每個人會有三個階段:

- Free(自由之身)
- Engaged(訂婚狀態，此時可以悔婚回到 free)
- Married(最後的結果，在最後所有人會同時進入到這個階段)

當所有人都進入 engaged 這個 procedure 就會停止下來，此時最後的結果就不會再有異動了，最後再將所有人的狀態切成 married。

```c
# Gale-Shapley
initialize each person to be free
while (some man m is free and hasn't proposed to every woman) do
    w = highest ranked woman in m's list to whom m has not yet proposed
    if (w is free) then
       (m, w) become engaged
    else if (w prefers m to her fiance m') then
       (m, w) become engaged
       m' become free
return the set S of engaged pairs
```

我們來看看這段 procedure 的流程，首先初始化所有人都為 free 的狀態，接著開始進行迭代，迭代的中止條件為每位男生都不為 free 的狀態(意味著至少配對到一位女生)，迭代中找到一位為 free 的男生並且從他的喜好排序中找到最高位且還沒被他求過婚的女生，若女生是 free 的狀態，就先將他們先變為 engaged，因為女生可以反悔，所以先同意這次求婚沒有太大的損失，但若這位女生已處於 engaged 的狀態，這位女生可以將她的未婚夫與這位向她求婚的男生進行比較，若她接受這位向她求婚的男生，就將他們配對為一對，將其未婚夫變成 free 的狀態，直到所有男生都不是 free 的狀態結束迭代。

### 分析

這個 procedure 是以男生為主動，女生可以選擇答應或者拒絕，以這樣的角度來說，對於男生是比較有優勢的，對於女生來說她只能等著被人追求，是屬於比較悲觀的那一方。這個 procedure 在 1962 年時被創造出來是為了解決大學聯考學生選擇系所的一個制度，就算到現今我們的大考中心依舊是以這個 procedure 作為 base，只是可能有一點小小不同，但本質還是一樣。

### 證明

在證明之前我們先將上面的問題彙整成比較制式的形式(formulating):

- Given:
  - M: n men
  - W: n women
  - M x W: Each person has ranked all members of the opposite sex with a unique number between 1 and n in order of preference
- Goal:
  - Marry the men an women off such that
  - There are no two people of opposite sex who would both rather have each other than their current partners
    - If there are no such people, all the marriages are stable.

接著來看看這個 procedure 是否有成為演算法的條件，後面會證明這些條件是否都成立:

- Termination(finiteness): 至少在 n<sup>2</sup>之後會停止迭代。
- Perfection: 每個人最終都有配對到對象。
- Stability: 由於是雙方自己選擇的，最終都會是 stable。

這個 procedure 還有幾個上面提到的特性:

- Male-optimal and female-pessimal: 男生為最佳的結果，女生屬於被動悲觀的結果。
- All executions yield the same matching: 在相同的 input 條件下，每次迭代的結果都會相同。

通常證明都是透過**反證法**或者**數學歸納法**來證明是否足以符合條件，接下來我們將透過反證法來證明各個條件。

#### Termination

```c{4}
# Gale-Shapley
initialize each person to be free
while (some man m is free and hasn't proposed to every woman) do
    w = highest ranked woman in m's list to whom m has not yet proposed
    if (w is free) then
       (m, w) become engaged
    else if (w prefers m to her fiance m') then
       (m, w) become engaged
       m' become free
return the set S of engaged pairs
```

從上面的第四行來看，每次迭代都會有一位男生向女生求婚，並且一定會產生一組配對，因為只要女生是 free 的狀態，她就一定得先同意，就算她已經屬於訂婚狀態，如果她反悔當前配對數量也是保持不變，只是對象換了，所以最終在 n<sup>2</sup>之後一定會停止迭代。

從觀察發現男生求婚的對象都是從最喜歡的開始，而女生通常可能是反方向且被動的與男生訂婚:

![stable-matching-4](/static/images/nycu-algorithm-1-4.png)

<figcaption><em>Stable Matching-4</em></figcaption>

#### Perfection

首先我們假設這個 procedure 最終會有一位男性為自由之身，這樣就不構成 perfect matching，

```c{3}
# Gale-Shapley
initialize each person to be free
while (some man m is free and hasn't proposed to every woman) do
    w = highest ranked woman in m's list to whom m has not yet proposed
    if (w is free) then
       (m, w) become engaged
    else if (w prefers m to her fiance m') then
       (m, w) become engaged
       m' become free
return the set S of engaged pairs
```

從第三行來看，若最終有一個男生是自由之身，那麼這行 while 條件中的"some m is free"是成立而"hasn't proposed to every woman"不成立才有可能跳出 while 迴圈，但若有一位男生是自由之身意味著也會有一位女生是自由之身，而女生為自由之身的話就代表沒有男生向她求過婚，這就會產生矛盾(contradiction)，所以最終跳出迴圈勢必所有男生與女生都不為自由之身才有可能。

#### Stability

這裡我們假設最終結果會有一對是 unstable 的情況，那麼我們就能夠說明這個 procedure 不構成 stability 的條件，我們用下面這個圖來試著反證:

![stable-matching-5](/static/images/nycu-algorithm-1-5.png)

<figcaption><em>Stable Matching-5</em></figcaption>

假設上面黑色線是最後 return 的配對結果，紅線代表存在 unstable 的配對，這代表 m 喜歡 w'更勝於 w，w'喜歡 m 更勝於 m'。從上面的結果推論，m 最終的求婚對象一定是 w，這是我們上面可以觀察到的，他前面可能經過好幾次被拒絕的情況，但最終與 m 配對那麼我們可以考慮兩種情況，就是 m 是否有向 w'求婚過:

- Case 1: No, 如果是這樣，代表 m 的喜好排序中，w 是高於 w'的，所以這就產生了矛盾。

- Case 2: Yes, 如果這樣代表 w'有喜歡某個 m"更勝於 m 所以才會拒絕 m，若是這樣我們可以推測兩種可能:
  - m" = m'，這不可能。
  - w'喜歡 m'更勝於 m"，但若是這樣代表 w'喜歡 m'更勝於 m，所以產生矛盾。

#### Uniqueness

Stable matching 最後的結果不會是唯一的，因為我們只要交換男生與女生的位置，改由女生有主動權，那麼最後的結果就會不一樣但依舊是 stable matching。

![stable-matching-6](/static/images/nycu-algorithm-1-6.png)

<figcaption><em>Stable Matching-6</em></figcaption>

#### Male-Optimality

接著來試著證明 Male-Optimality 這個特性，以下是這個特性所擁有的條件:

- S<sup>\*</sup>={(m, best(m))}: m ∈ M}: 對於所有男生來說可能都是最佳的結果。
  - 對於所有女生來說，所有的配對結果都是有效的配對(stable)。
  - 對於所有男生來說都是可以配對的對象中最好的對象。

下圖為一個極端的特例，對於男生來說都配對到最好的結果，但對女生來說卻不是，但這依然是 stable 的。

![stable-matching-7](/static/images/nycu-algorithm-1-7.png)

<figcaption><em>Stable Matching-7</em></figcaption>

根據上面的特性，我們假設最後的結果:S 中會有一位男生:m 他最後配對的結果沒有配對到他該配對到的最佳對象:w，並且我們讓 m 是第一個執行 while 迴圈的男生，此時所有人都是自由之身，
所以我們可以推論 w 沒有配對到 m 那是因為 w 拒絕過 m 與另一位男生 m'再一起，

S -> (m', w)

接著我們假設另外一組 stable matching 的結果 S'，在這結果中 m 是與 w 配對再一起的，而 m'則與另外一位 w'配對一起。

S'-> (m, w), (m', w')

在前面 S 結果中我們推測 w 的喜好排序是 m' > m，所以接下來我們只要證明 m'喜歡 w 更勝於 w'就可以得到一個 unstable 的狀態，就會產生矛盾。
在 S 結果中我們可以得出 m'他還沒有被任何女生拒絕過，這代表輪到他求婚時他一定是先向 w 求婚，否則不可能有(m',w)的結果，這邊就推得在 m'的喜好排序中 w > w'的，這樣我們就推得出 S'的配對結果其實是 unstable 的。
