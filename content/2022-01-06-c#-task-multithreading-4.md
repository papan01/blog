---
title: "C# Parallel Programming:#4 Using PLINQ"
date: "2022-01-06"
category: "BackEnd"
cover: "/images/computer-pen.jpg"
tags:
  - C#
  - Parallelism
---

PLINQ 為平行處理版的 LINQ，目的是加速查詢速度，不過在絕大多數情況下使用 PLINQ 沒有太多的好處，甚至執行速度上比使用普通 LINQ 還慢，所以在使用前須做些評估與實驗。
LINQ 有支援許多查詢方式，LINQ to Objects、LINQ to XML、LINQ to ADO.NET 等等，而 PLINQ 是針對 LINQ to Objects 所設計的。

## 使用 PLINQ

LINQ 可以支援任何實作 `IEnumerable` 與 `IEnumerable<T>`的物件，只要透過`AsParallel()`就可以進行轉換成 PLINQ，它會回傳`ParallelQuery`這個型別的物件，而它也實作了`IEnumerable`，且它隸屬於`System.Linq`這個 namespace 之下，接著就可以透過正常 LINQ 的查詢方式來使用:

```csharp
Stopwatch watch = Stopwatch.StartNew();
var parallelRange = Enumerable.Range(0, 100000).AsParallel().Where(i => i % 3 == 0).ToList();
watch.Stop();
Console.WriteLine($"Time Parallel elapsed {watch.ElapsedMilliseconds}");
Console.WriteLine($"Parallel: Total items are {parallelRange.Count}");
Stopwatch watch2 = Stopwatch.StartNew();
var range = Enumerable.Range(0, 100000).Where(i => i % 3 == 0).ToList();
watch2.Stop();
Console.WriteLine($"Time elapsed {watch2.ElapsedMilliseconds}");
Console.WriteLine($"Sequential: Total items are {range.Count}");
Console.ReadLine();

//Parallel time elapsed 95
//Parallel: Total items are 33334
//Time elapsed 1
//Sequential: Total items are 33334
```

可以看到使用 PLINQ 所耗費的時間更多，所以不是所有情況下都使用 PLINQ。

上面我們使用`Enumerable`來生成可列舉的集合，而 LINQ 還提供了類別`ParallelEnumerable`，來看看它與`Enumerable`的比較:

| Enumerable                                  | ParallelEnumerable             |
| ------------------------------------------- | ------------------------------ |
| LINQ to Objects types                       | PLINQ types                    |
| `System.Collections.IEnumerable`            | `System.Linq.ParallelQuery`    |
| `System.Collections.Generic.IEnumerable<T>` | `System.Linq.ParallelQuery<T>` |

`ParallelEnumerable`會實作 LINQ to Objects 所支援的查詢方式，例如:

```csharp
public static class Enumerable
{
    public static IEnumerable<int> Range(int start, int count);
    public static IEnumerable<TResult> Repeat<TResult>(TResult element, int count);
    //...
}

public static class ParallelEnumerable
{
    public static ParallelQuery<int> Range(int start, int count);
    public static ParallelQuery<TResult> Repeat<TResult>(TResult element, int count);
    //...
}
```

且它還包含了一組方法，以供啟用平行處理特有的行為:

- `AsParallel`: 以平行方式進行查詢，為 `ParallelEnumerable` 預設行為。
- `AsSequential`: 以非平行方式進行查詢。
- `AsOrdered`: 執行期間仍會是平行處理並保持順序。
- `AsUnordered`: 執行期間不用保持順序，此為預設行為。
- `WithCancellation`: 可將`CancellationTokenSource`的 token 傳入，以進行後續取消的動作。
- `WithDegreeOfParallelism`: 設置 task 上限的數量。
- `WithMergeOptions`: 設置 PLINQ 應該如何將平行結果合併成單一序列回給呼叫方執行緒。
- `WithExecutionMode`: PLINQ 不見得保證每次都會進行平行處理，可以透過此方法強制它使用平行處理。
- `ForAll`: 平行處理所有資料，與`Parallel.ForEach()`的差異在於最終不會進行合併的動作。
- `Aggregate`: 可對執行緒平行運算啟用一個中繼運算的地方，並且可以輸入一個最後彙總函式，做為整合所有平行運算的地方。

下面會介紹上述幾種行為，而沒介紹到的就如上述所簡述的那樣。

### `AsOrdered`與`AsUnordered`

有時我們希望在平行處理時，結果能夠保持原本的順序，PLINQ 可以使用`AsOrdered()`來完成這件事，它會在執行時保持平行處理，但最後須要負擔額外的效能來針對排序進行合併的動作:

```csharp
var range = Enumerable.Range(1, 10);
Console.WriteLine("Parallel Ordered");
Stopwatch watch = Stopwatch.StartNew();
range.AsParallel().AsOrdered().Select(i => i).ToList().ForEach(i => Console.Write(i + "-"));
watch.Stop();
Console.WriteLine();
Console.WriteLine($"Time elapsed {watch.ElapsedMilliseconds}");

var range2 = Enumerable.Range(1, 10);
Console.WriteLine("Parallel Unordered");
Stopwatch watch2 = Stopwatch.StartNew();
range2.AsParallel().Select(i => i).ToList().ForEach(i => Console.Write(i + "-"));
watch2.Stop();
Console.WriteLine();
Console.WriteLine($"Time elapsed {watch2.ElapsedMilliseconds}");

Console.ReadLine();

//Parallel Ordered
//1-2-3-4-5-6-7-8-9-10-
//Time elapsed 102
//Parallel Unordered
//6-8-4-2-3-5-7-1-9-10-
//Time elapsed 4
```

### 取消 PLINQ

與前幾篇在說明取消平行處理時類似，PLINQ 提供了`WithCancellation`這個方法，只要提供`CancellationToken`，之後當我們呼叫`CancellationTokenSource.Cancel`就會拋出`OperationCancelledException`這個異常，看看下面例子:

```csharp
var range = Enumerable.Range(1, 10000000).ToArray();
CancellationTokenSource cs = new CancellationTokenSource();
Task.Factory.StartNew(() =>
{
    Thread.Sleep(100);
    cs.Cancel();
});
try
{
    var results =
        (from num in range.AsParallel().WithCancellation(cs.Token)
         where num % 3 == 0
         orderby num descending
         select num).ToArray();
    foreach (var item in results ?? Array.Empty<int>())
    {
        Console.WriteLine(item);
    }
}
catch (OperationCanceledException e)
{
    Console.WriteLine(e.Message);
}
catch (AggregateException ex)
{
    foreach (var inner in ex.InnerExceptions)
    {
        Console.WriteLine(inner.Message);
    }
}
Console.ReadLine();

//The query has been canceled via the token supplied to WithCancellation.
```

### Degree of Parallelism

與上篇提到的[Degree of Parallelism](/archives/2021-12-24-c-task-multithreading-3#degree-of-parallelism)類似，`WithDegreeOfParallelism`可讓我們控制 PLINQ 使用 task 的數量。

### 合併選項

使用 PLINQ 來進行查詢時，它會將資料進行分割並且分配到不同 thread 上去執行，最終將資料合併至呼叫方的 thread 上，這合併的過程中會因為查詢運算子而有不同的行為，而`WithMergeOptions`則可以讓我們設置合併的方式，多數情況下我們不需要自己設置，甚至在某些查詢運算子會有其預設的合併方式，通常只有需要測試或改善效能時才會用的到，它提供了三種合併方式:

- `ParallelMergeOptions.NotBuffered`:

  若使用此選項，每個 thread 在結果產生時會直接回傳結果，不會暫存於緩衝區中，所以此選項執行速度通常會是三種合併方式最快的一種，但仍有可能慢於其它兩種在某些查詢運算子上，`ForAll`一律會使用此選項:

```csharp
var range = ParallelEnumerable.Range(1, 100);
Stopwatch watch = null;
ParallelQuery<int> notBufferedQuery =
range.WithMergeOptions(ParallelMergeOptions.NotBuffered)
.Where(i => i % 10 == 0)
.Select(x => {
    Thread.SpinWait(1000);
    return x;
});
watch = Stopwatch.StartNew();
foreach (var item in notBufferedQuery)
{
    Console.WriteLine($"{item}:{watch.ElapsedMilliseconds}");
}
Console.WriteLine($"\nNotBuffered Full Result returned in { watch.ElapsedMilliseconds} ms");

// 30:124
// 40:138
// 60:138
// 70:139
// 80:139
// 90:139
// 10:139
// 20:139
// 50:139
// 100:139

// NotBuffered Full Result returned in 140 ms
```

- `ParallelMergeOptions.AutoBuffered`:

  此選項會將結果暫存置緩衝區，接著定期的將緩衝區中資料全部送給呼叫方的 thread 上，緩衝區的大小與如何產生的都無法由我們來控制，此為預設行為:

```csharp
var range = ParallelEnumerable.Range(1, 100);
Stopwatch watch = null;
ParallelQuery<int> autoBufferedQuery =
range.WithMergeOptions(ParallelMergeOptions.AutoBuffered)
.Where(i => i % 10 == 0)
.Select(x => {
    Thread.SpinWait(1000);
    return x;
});
watch = Stopwatch.StartNew();
foreach (var item in autoBufferedQuery)
{
    Console.WriteLine($"{item}:{watch.ElapsedMilliseconds}");
}
Console.WriteLine($"\nAutoBuffered Full Result returned in { watch.ElapsedMilliseconds} ms");

// 80:125
// 90:144
// 10:144
// 20:145
// 30:145
// 40:145
// 60:145
// 70:145
// 100:146
// 50:146

// AutoBuffered Full Result returned in 146 ms
```

- `ParallelMergeOptions.FullyBuffered`:

  此選項會等到所有結果都進到緩衝區才送給呼叫端的 thread，例如當我們使用`OrderBy`時，因為需要等到所有結果都出來後才能進行排序，所以`OrderBy`的合併行為預設就是`ParallelMergeOptions.FullyBuffered`:

```csharp
var range = ParallelEnumerable.Range(1, 100);
Stopwatch watch = null;
ParallelQuery<int> fullyBufferedQuery =
range.WithMergeOptions(ParallelMergeOptions.FullyBuffered)
.Where(i => i % 10 == 0)
.Select(x => {
   Thread.SpinWait(1000);
   return x;
});
watch = Stopwatch.StartNew();
foreach (var item in fullyBufferedQuery)
{
   Console.WriteLine($"{item}:{watch.ElapsedMilliseconds}");
}
Console.WriteLine($"\nFullyBuffered Full Result returned in { watch.ElapsedMilliseconds} ms");

// 10:141
// 20:157
// 30:157
// 40:157
// 50:157
// 60:157
// 70:158
// 80:158
// 90:158
// 100:158

// FullyBuffered Full Result returned in 158 ms
```

## PLINQ 注意事項

在許多情況下，PLINQ 能提供效能改善，但必須根據狀況來使用，所以這裡列出使用 PLINQ 須注意的事項:

- **平行處理不能保證一定比較快**: 平行處理一定必須付出額外的代價來進行配置動作與資料傳遞的處理，當資料量不夠大時或者運算邏輯沒有很複雜時，使用平行處理只會降低效能。
- **避免寫入共用的記憶體位置**: 此問題會牽涉到兩個資料結構上常見的問題 race condition 與 dead lock，只要牽扯到這類問題就是從 Parallelism 衍生為 Concurrency，當然最好的形況下就是資料都互不相干，使平行處理達到最大的效用。
- **避免呼叫非執行緒安全的方法**: 例如 I/O 類的方法，這種同時間讀寫很容易導致資料損毀，所以應該避免使用這類方法。
- **儘可能避免不必要的排序**: 在平行處理中無法保證資料分割與處理的順序，前面有提到可以使用`AsOrdered`來使其能將結果依序產出，但代價就是必須記錄分隔順序，這會減慢執行速度。

## Reference

- [Hands-On Parallel Programming with C# 8 and .NET Core 3](https://www.amazon.com/Hands-Parallel-Programming-NET-Core/dp/178913241X)
