---
title: "C# Parallel Programming:#3 Data Parallelism"
date: "2021-12-24"
category: "BackEnd"
cover: "/images/christmas.jpg"
tags:
  - C#
  - Parallelism
---

前面幾章我們已經針對 Task Parallel Library (TPL)有些基礎概念，在這章中將會使用別的方式針對資料層面進行平行處理([資料平行處理原則](https://docs.microsoft.com/zh-tw/dotnet/standard/parallel-programming/data-parallelism-task-parallel-library))。

以下是這章將會介紹到的部分:

- 透過 TPL 中的`System.Threading.Tasks.Parallel`實現資料平行處理原則。
- 取消資料平行處理。
- 了解變數的儲存機制於資料平行處理原則中([分割區域變數](https://docs.microsoft.com/zh-tw/dotnet/standard/parallel-programming/how-to-write-a-parallel-foreach-loop-with-partition-local-variables)與[執行緒區域變數](https://docs.microsoft.com/zh-tw/dotnet/standard/parallel-programming/how-to-write-a-parallel-for-loop-with-thread-local-variables))。

## Parallel Loops

當我們想讓資料平行處理，最好的情況下是所以資料都能夠被獨立計算，這樣能使我們在使用平行處裡上獲得最佳的效率，而我們這章要介紹的`System.Threading.Tasks.Parallel`也比較適合用於這種情況上，下面將介紹三種基本的使用方式:

- `Parallel.Invoke`
- `Parallel.For`
- `Parallel.ForEach`

### `Parallel.Invoke`

這是`System.Threading.Tasks.Parallel`中最簡單明瞭的使用方式，看一下它所接受的參數就可一目了然:

```csharp
public static void Invoke(
    params Action[] actions
)
```

使用這個方法有幾個特點需要注意:

- 沒有辦法保證執行的順序是根據參數輸入的順序。
- 這個方法不會有任何傳回值。
- 不論因為正常終止或異常終止，都會等到所有 `Action` 結束。

看看一個簡單的範例:

```csharp
try
{
    Parallel.Invoke(
    new Action(() => Console.WriteLine("Action 1")),
    new Action(() => Console.WriteLine("Action 2")),
    new Action(() => Console.WriteLine("Action 3")),
    new Action(() => Console.WriteLine("Action 4")),
    new Action(() => Console.WriteLine("Action 5")),
    new Action(() => Console.WriteLine("Action 6")),
    new Action(() => Console.WriteLine("Action 7")),
    new Action(() => Console.WriteLine("Action 8")),
    new Action(() => Console.WriteLine("Action 9")),
    new Action(() => Console.WriteLine("Action 10")));
}
catch (AggregateException aggregateException)
{
    foreach (var ex in aggregateException.InnerExceptions)
    {
        Console.WriteLine(ex.Message);
    }
}
Console.WriteLine("Unblocked");
Console.ReadLine();


//Action 3
//Action 1
//Action 6
//Action 2
//Action 5
//Action 4
//Action 8
//Action 7
//Action 9
//Action 10
//Unblocked
```

當我們需要將一些 `Action` 進行平行處理時，這個方法可以讓我們很簡單地達成，並且它會等到所有 `Action` 結束才繼續執行後續的程式碼。若有 exception 會由`AggregateException`來進行收集的動作，上面可以看到`AggregateException.InnerExceptions`是可以被迭代的。

### `Parallel.For`

類似平行處理中的`for`迴圈，它會回傳一個`ParallelLoopResult`的 instance，其中它有兩個 properties，`isCompleted`與`LowestBreakIteration`，可以讓我們確認執行的狀態，下面我們來看看此方法的宣告、可能出現的結果與例子:

```csharp
public static ParallelLoopResult For
(
    Int fromIncalme,
    Int toExclusiveme,
    Action<int> action
)
```

| IsCompleted | LowestBreakIteration    | Reason                    |
| ----------- | ----------------------- | ------------------------- |
| True        | N/A                     | Run to completion         |
| false       | Null                    | Loop stopped pre-matching |
| false       | Non-null integral value | Break called on the loop  |

```csharp
Parallel.For (0, 100, (i) => Console.WriteLine(i));
```

此方法的前面兩個參數接受開始與結束的 index，最後面接受一個整數泛型 `Action`，而在此之外我們可能已經有一組資料可以透過 index 來獲取對應的資料用於此 `Action`。
而`IsCompleted`為 false 的情況 就像我們在`for`迴圈時會使用的`break`，可以用於中斷迭代，後面會在介紹。

### `Parallel.ForEach`

它與`Parallel.For`一樣會回傳一個`ParallelLoopResult`的 instance，使用方式與`Parallel.For`稍有不同:

```csharp
public static ParallelLoopResult ForEach<TSource>
(
    IEnumerable<TSource> source,
    Action<TSource> body
);
```

來看看例子:

```csharp
List<string> urls = new List<string>() {"www.google.com",
                                        "www.yahoo.com",
                                        "www.bing.com" };
Parallel.ForEach(urls, url =>
{
    Ping pinger = new Ping();
    Console.WriteLine($"Ping Url {url} status is {pinger.Send(url).Status}
    by Task {Task.CurrentId}");
});

//Ping Url www.google.com status is Success By Task 1
//Ping Url www.yahoo.com status is Success By Task 2
//Ping Url www.bing.com status is Success By Task 3
```

概念上與`Parallel.For`類似，只是這裡會直接遍歷資料，而`Parallel.For`則能讓我們選擇資料區間。

## Degree of Parallelism

平行處理莫過於想要增加執行速度，基於此情況下我們都知道控制資源的重要性，有時我們會想控制 task 的數量，不希望被過度的創建，degree of parallelism 是指能同時平行執行的數量，上面我們介紹的三種方法可以透過`ParallelOptions` class 中的`MaxDegreeOfParallelism`來進行設置，預設為 64:

```csharp
public static void Invoke(
    ParallelOptions parallelOptions,
    params Action[] actions
);

public static ParallelLoopResult For(
    int fromInclusive,
    int toExclusive,
    ParallelOptions parallelOptions,
    Action<int> body
);

public static ParallelLoopResult ForEach<TSource>(
    IEnumerable<TSource> source,
    ParallelOptions parallelOptions,
    Action<TSource> body
);
```

看看下面例子:

```csharp
Parallel.For(1, 100, new ParallelOptions { MaxDegreeOfParallelism = 4 },
index =>
{
    Console.WriteLine($"Index {index} executing on Task Id { Task.CurrentId} ");
});

//Index 25 executing on Task Id 2
//Index 1 executing on Task Id 1
//Index 49 executing on Task Id 3
//Index 73 executing on Task Id 4
//Index 26 executing on Task Id 2
//Index 2 executing on Task Id 1
//Index 3 executing on Task Id 1
//Index 4 executing on Task Id 1
//Index 27 executing on Task Id 2
//...
```

可以看到上面只有 task ID 1、2、3 與 4 被使用到。

## 中斷迴圈

由於我們無法像`for`迴圈那樣使用`break`這種特殊語法來中斷平行處理中的工作，但我們可以使用以下幾種方式來中斷:

- `ParallelLoopState.Break`
- `ParallelLoopState.Stop`
- `CancellationToken`

### ParallelLoopState.Break

`ParallelLoopState.Break`是一個方法，當它被呼叫時，若有成功的中斷我們可以從`LowestBreakIteration`來得知觸發中斷的最低迭代數，但它不會立刻停止下來，它會等到所有小於`LowestBreakIteration`的迭代都完成了才停止運行，來看看下面的例子:

```csharp
var numbers = Enumerable.Range(1, 1000);
Parallel.ForEach(numbers, (i, parallelLoopState) =>
    {
        Console.WriteLine($"For i={i} LowestBreakIteration = {parallelLoopState.LowestBreakIteration} and Task id ={Task.CurrentId}");
        if (i >= 10)
        {
            parallelLoopState.Break();
        }
    });

//For i=6 LowestBreakIteration =  and Task id =1
//For i=4 LowestBreakIteration =  and Task id =4
//For i=1 LowestBreakIteration =  and Task id =2
//For i=2 LowestBreakIteration =  and Task id =5
//For i=3 LowestBreakIteration =  and Task id =3
//For i=5 LowestBreakIteration =  and Task id =6
//For i=8 LowestBreakIteration =  and Task id =8
//For i=7 LowestBreakIteration =  and Task id =7
//For i=17 LowestBreakIteration =  and Task id =7
//For i=10 LowestBreakIteration =  and Task id =1
//For i=11 LowestBreakIteration =  and Task id =4
//For i=12 LowestBreakIteration =  and Task id =2
//For i=13 LowestBreakIteration =  and Task id =5
//For i=14 LowestBreakIteration =  and Task id =3
//For i=15 LowestBreakIteration =  and Task id =6
//For i=16 LowestBreakIteration =  and Task id =8
//For i=9 LowestBreakIteration =  and Task id =9
//For i=21 LowestBreakIteration = 9 and Task id =10
//For i=20 LowestBreakIteration = 9 and Task id =9
//For i=19 LowestBreakIteration = 9 and Task id =1
//For i=18 LowestBreakIteration = 16 and Task id =7
```

### ParallelLoopState.Stop

`ParallelLoopState.Stop`能更快的停止迭代，因為它與`ParallelLoopState.Break`差別在與它不會等小於`LowestBreakIteration`的迭代都完成才停止，多數時候我們可能更傾向於使用`ParallelLoopState.Stop`。

### CancellationToken

`CancellationToken`在前面幾章介紹`Task`時有使用到過，我們可以創建一把權杖，讓我們在某個時間點進行中斷的動作:

```csharp
 try
{
    CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();
    Task.Factory.StartNew(() =>
    {
        Thread.Sleep(5000);
        cancellationTokenSource.Cancel();
        Console.WriteLine("Token has been cancelled");
    });

    Parallel.For(0, long.MaxValue, new ParallelOptions() { CancellationToken = cancellationTokenSource.Token }, index =>
    {
        Thread.Sleep(3000);
        Console.WriteLine($"Index {index}");
    });
}
catch (OperationCanceledException)
{
    Console.WriteLine("Cancellation exception caught!");
}

//Index 1152921504606846975
//Index 0
//Index 2305843009213693950
//Index 3458764513820540925
//Index 4611686018427387900
//Index 5764607523034234875
//Index 8070450532247928825
//Index 6917529027641081850
//Index 9223372036854775800
//Index 1
//Token has been cancelled
//Index 1152921504606846976
//Index 4611686018427387901
//Index 1152921504606846977
//Index 2305843009213693951
//Index 2
//Index 3458764513820540926
//Index 5764607523034234876
//Index 6917529027641081851
//Index 8070450532247928826
//Index 2305843009213693953
//Index 9223372036854775801
//Index 4
//Index 3458764513820540928
//Cancellation exception caught!
```

首先我們先創建一個`CancellationTokenSource`的物件，接著透過`Task`使其在五秒後呼叫`Cancel()`進行中斷動作，接著我們將此物件傳給`ParallelOptions.CancellationToken`，告訴此平行處理所歸屬的權杖是哪個，上面看到當`Cancel()`被呼叫了不會立刻停止，原因在於下面那些迭代都屬於正在執行中，概念與上面提到的類似。

## 變數儲存機制於平行處理中

在執行平行處理時，最終結果通常會儲存於一個全域變數(或者區域變數)，但通常這樣的作法會有額外的開銷(跨 thread)，若我們每個迭代都直接存取全域變數，會有 race condition 的問題，就算我們透過 lock 的機制來保護，那也變得失去使用平行處理的意義，比較好的做法是各自 thread 使用自己的區域變數，最後再將結果的集合往外面送。
為了減少這些開銷，這裡要介紹如何使用 thread-local-variables([執行緒區域變數](https://docs.microsoft.com/zh-tw/dotnet/standard/parallel-programming/how-to-write-a-parallel-for-loop-with-thread-local-variables))與 partition-local-variables([分割區域變數](https://docs.microsoft.com/zh-tw/dotnet/standard/parallel-programming/how-to-write-a-parallel-foreach-loop-with-partition-local-variables))。

### Thread local variable

這裡我們直接以例子說明，假設現在我們使用四個 `Task` 來計算 1 加到 60，平均每個 `Task` 需負責 15 個迭代，下面使用`Parallel.For`來實作此例子，接著我們再一一介紹:

```csharp
 var numbers = Enumerable.Range(1, 60);
long sumOfNumbers = 0;
Action<long> taskFinishedMethod = (taskResult) =>
{
    Console.WriteLine($"Sum at the end of all task iterations for task { Task.CurrentId} is { taskResult }");
    Interlocked.Add(ref sumOfNumbers, taskResult);
};

Parallel.For(0, numbers.Count() + 1,
    () => 0, // initialize the thread local variable
    (j, parallelLoopState, subtotal) =>
    {
      subtotal += j;
      return subtotal;
    } // method invoked by the loop on each iteration,
    taskFinishedMethod
);
Console.WriteLine($"The total of 60 numbers is {sumOfNumbers}");
```

首先`numbers`與 `sumOfNumbers`應該沒什麼問題，一個是需要被處理的資料，一個是最後儲存最後結果的變數，接著我們看`taskFinishedMethod`這個 `Action`，當`Parallel.For`中每個`Task`完成工作後就會執行此`Action`，其中使用`Interlocked`來保護變數`sumOfNumbers`。

`Parallel.For`的參數部分，與前面介紹的有點不同，前兩個參數一樣是開始與結束位置，第三個變數則用於初始化 thread local variable，第四個參數與上面介紹一樣，是邏輯處理的部分，但可以看到它的第三個參數`subtotal`，它就是這裡所指的 thread local variable，每次迭代都會將這個值傳給下個迭代，當執行完最後一次迭代就會執行`taskFinishedMethod`，之後再由`taskFinishedMethod`來處理最後的加總部分。

### Partition local variable

Partition local variable 概念上與 thread local variable 幾乎沒什麼區別，差別在於由`Task`的概念切換成 partition，且多個 partition 可以用在同一個 thread 上，下面使用`Parallel.ForEach`來實作:

```csharp
var numbers = Enumerable.Range(1, 60);
long sumOfNumbers = 0;
Action<long> taskFinishedMethod = (taskResult) =>
{
    Console.WriteLine($"Sum at the end of all task iterations for task { Task.CurrentId} is { taskResult }");
    Interlocked.Add(ref sumOfNumbers, taskResult);
};

Parallel.ForEach(numbers, () => 0, (j, parallelLoopState, subtotal) =>
    {
      subtotal += j;
      return subtotal;
    },
    taskFinishedMethod
);
Console.WriteLine($"The total of 60 numbers is {sumOfNumbers}");
```

從官網上來看，`Parallel.For`使用 thread local variable，`Parallel.ForEach`則使用 partition local variable，目前還沒找到其他方式來直接實作類似的概念，不過當我們使用資料平行處理原則時，可以留意一下這部分。

## Reference

- [Hands-On Parallel Programming with C# 8 and .NET Core 3](https://www.amazon.com/Hands-Parallel-Programming-NET-Core/dp/178913241X)
