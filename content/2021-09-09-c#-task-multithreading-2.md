---
title: "C# Parallel Programming:#2 Task Parallelism"
date: "2021-09-09"
category: "BackEnd"
cover: "/images/pen.jpg"
tags:
  - C#
  - Parallelism
---

在前面一章我們介紹了.NET 中 Task Parallel Library (TPL)一些 thread 的基本用法，其目的是希望能夠使開發者容易使用，除了`Thread` 與 `ThreadPool` 之外，還有這篇要介紹的`System.Threading.Tasks`，其中有涵蓋許多類別，執行方式類似於 javascript 中的`Promise`，且涵蓋了`Thread`與`ThreadPool`的一些優點，我們先來看看這三者的差異性。

## `Thread`、`ThreadPool`與`Task`

這三個在使用上的選擇很容易混淆，且我們平常使用時，都認為只要有達到目的就好，這樣做雖然沒什麼錯，但若我們能深入了解或許能避免產生 bug 與改善 performance。

### `Thread`

`Thread`屬於 OS-level thread，它擁有自己的 stack 與 kernel resources，且提供較靈活的操作空間，例如我們能使用`Abort()`、`Suspend()`與`Resume()`等方法來操作此 thread，但其缺點就在創建的成本，上一篇有提到，每次建立一個 thread 都必須耗費一些 memory 與 CPU time 用於它的 stack 上以及 threads 間 context-switch 的成本，所以較好的做法是利用 thread pool 來執行程式碼，交給 CLR 管理這一切。但有時候你別無選擇，因為你希望能替 thread 設置 name 好讓你 debug 容易些，或者你需要一個 apartment state 用來 show 你的 UI，又或者你希望有個 object 只能在特定的 thread 裡面被使用，那麼使用`Thread`能簡單的達到這些效果。

### `ThreadPool`

`ThreadPool`是由 CLR 管理 threads 的容器，你能操作的空間有限，像上面`Thread`能做的事`ThreadPool`幾乎都不能，但它的好處就是可以避免我們過度創建過多的 thread，但缺點就是你無法得知你送進去的工作是否已經完成，也沒辦法拿到任何 result，很適合丟了就不管的簡短工作。

### `Task`

最後是我們這章要介紹的`Task`，它不像`Thread`一樣創建了一個 OS-level thread，而是將工作交由`TaskScheduler`來負責執行，而`TaskScheduler`預設的行為就像`ThreadPool`一樣。
`Task`不像`ThreadPool`，它能夠讓我們知道工作是否已經完成，以及拿到最後的 result，所以在大部分時候，都建議使用`Task`來代替上面兩個方案。底下將介紹它有哪些功能，

## 建立與執行

TPL 提供了很多方式讓我們建立與執行 parallelism 的工作，而這篇的主軸`System.Threading.Tasks`這個 namespace 下有許多類別與方法能達到此目的，這裡先介紹以下三種比較常見的用法:

- `System.Threading.Tasks.Task` 類別
- `System.Threading.Tasks.Task.Factory.StartNew` 方法
- `System.Threading.Tasks.Task.Run` 方法

### `System.Threading.Tasks.Task`

`Task`基於**[Task-Based Asynchronous Pattern(TAP)](/archives/2021-04-28-c-task-multithreading-1-5#task-based-asynchronous-patterntap)**的類別之一，透過方法`Start`來執行非同步的作業，若需要 return 值則需要使用 generic 的版本`Task<T>`，我們可以使用以下幾種方式來執行:

- lambda expression

```csharp
Task task = new Task (() => PrintNumber());
task.Start();
```

- `Action` delegate

```csharp
Task task = new Task (new Action (PrintNumber));
task.Start();
```

- `delegate`

```csharp
Task task = new Task (delegate {PrintNumber();});
task.Start();
```

### `System.Threading.Tasks.Task.Factory.StartNew`

我們也可以使用`Task.Factory`類別中的`StartNew`方法來執行我們的非同步工作，它允許我們帶入一些參數來控制其行為，這裡先看看簡單的用法，後面會在詳細的介紹:

- lambda expression

```csharp
Task.Factory.StartNew(() => PrintNumber());
```

- `Action` delegate

```csharp
Task.Factory.StartNew(new Action (PrintNumber));
```

- `delegate`

```csharp
Task.Factory.StartNew(delegate {PrintNumber();});
```

### `System.Threading.Tasks.Task.Run`

`Task.Run`是`Tasks.Task.Factory.StartNew`帶固定參數的包裝方法:

```csharp
Task.Factory.StartNew(someAction,
    CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default);
```

用法也跟上面雷同:

- lambda expression

```csharp
Task.Run(() => PrintNumber());
```

- `Action` delegate

```csharp
Task.Run(new Action (PrintNumber));
```

- `delegate`

```csharp
Task.Run(delegate {PrintNumber();});
```

## 獲取 return 值

上述介紹的三個方法與類別皆可以透過 generic 來獲取非同步執行完後的結果，在執行完後會返回以下類別的物件:

- `Task<T>`
- `Task.Factory.StartNew<T>`
- `Task.Run<T>`

我們能透過`Result` property 來獲取返回的值，它也有阻塞功能的功能，等同於使用`Task.Wait`:

```csharp
static void Main(string[] args)
{
    var t1 = Task.Run(() =>
    {
        return Sum(100000);
    });

    Console.WriteLine(t1.Result);

    var t2 = Task.Factory.StartNew(() =>
    {
        return Sum(100000);
    });

    Console.WriteLine(t2.Result);

    var t3 = Task.Run(() =>
    {
        return Sum(100000);
    });

    Console.WriteLine(t3.Result);
}

private static int Sum(int n)
{
    int sum = 0;
    for (int i = 0; i < n; i++)
    {
        sum += i;
    }
    return sum;
}

//704982704
//704982704
//704982704
```

## 取消工作

有些時候我們可能需要中斷非同步工作，我們可以透過`CancellationTokenSource`來創建一把取消非同工作的權杖，上述的三種都有提供多載方法，下面以`Task.Factory.StarNew`為例:

```csharp
static void Main(string[] args)
{
  CancellationTokenSource source = new CancellationTokenSource();
  CancellationToken token = source.Token;

  Task.Factory.StartNew(async () =>
  {
      for(int i = 0; i < 1000000; i++)
      {
          await Task.Delay(1000);
          Console.WriteLine(i);
          if (token.IsCancellationRequested)
          {
            token.ThrowIfCancellationRequested();
          }
      }
  }, token);

  Console.ReadLine();
  Console.WriteLine("Cancel Job");
  source.Cancel();
}
```

透過創建`CancellationTokenSource`來取得它的 token property，它可以給我們用來取消非同步工作用。上面的例子中，非同步工作會每一秒 print 當前迭代數字，我們可以透過按下任意鍵取消此非同步工作，`token.IsCancellationRequested`在接受到取消的訊息會被設為 true，`token.ThrowIfCancellationRequested`則用於跳出此非同步作業。

## Tasks.Task.Factory.StartNew 與 Tasks.Task.Run

前面提到`Tasks.Task.Run`是固定參數的`Tasks.Task.Factory.StartNew`的包裝方法，這裡就來介紹一下`Tasks.Task.Factory.StartNew`的多載用法:

```csharp
Task.Factory.StartNew(someAction,
    CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskScheduler.Default);
```

第一個參數我想沒什麼問題，就是帶入需要非同步的函式，第二個`CancellationToken`在上面也提到過，用於取消非同步工作，再來我們先看看`TaskCreationOptions`，它主要用於創建`TaskScheduler`時，它有以下七種選項:

- None(此為預設值)
- AttachedToParent
- DenyChildAttach
- HideScheduler
- LongRunning
- PreferFairness
- RunContinuationsAsynchronously

### AttachedToParent

若在一個`Task`中在創建另外一個`Task`，預設行為是不會等子`Task`結束工作:

```csharp
static void Main(string[] args)
{
    var parent = Task.Factory.StartNew(() => {
        Console.WriteLine("parent task executing.");

        var child = Task.Factory.StartNew(() => {
            Console.WriteLine("child task starting.");
            Thread.SpinWait(500000);
            Console.WriteLine("child task completing.");
        });
    });

    parent.Wait();
    Console.WriteLine("parent has completed.");
}

//parent task executing.
//parent has completed.
//child task starting.
```

上面範例中，還沒等到 child 程式就已經結束了，我們可以透過`AttachedToParent`，讓 parent 等待 child 完成:

```csharp{10}
static void Main(string[] args)
{
    var parent = Task.Factory.StartNew(() => {
        Console.WriteLine("parent task executing.");

        var child = Task.Factory.StartNew(() => {
            Console.WriteLine("child task starting.");
            Thread.SpinWait(500000);
            Console.WriteLine("child task completing.");
        }, TaskCreationOptions.AttachedToParent);
    });

    parent.Wait();
    Console.WriteLine("parent has completed.");
}

//parent task executing.
//child task starting.
//child task completing.
//parent has completed.
```

### DenyChildAttach

若父`Task`不希望它的子`Task`使用 AttachedToParent 到它身上，則可以使用此選項，那麼子`Task`的 AttachedToParent 將會失效。

### HideScheduler

子`Task`將會使用預設的`TaskScheduler`。

### LongRunning

`Task`中的 thread 都是由 thread pool 來管理，thread pool 的 thread 數量則根據電腦核心數來決定，當有一個需要長時間的工作進入到 thread pool 時，若沒有足夠的 thread 可用時(或者因為這個工作可能會使 thread pool 為了其他非同步工作配置新的 thread)，這個選項提供了一個超額訂閱的功能，為它創建一個額外的 thread，避免它去阻塞當前的 thread pool，至於多久才算是 long running 呢?我在網路上搜尋到的建議是超過半秒就可以使用此參數。

### PreferFairness

告訴`TaskScheduler`以公平的方式來安排工作執行的先後順序，越早安排的工作將可能越早被執行。

### RunContinuationsAsynchronously

此選項是避免在某些情況下程式造成 deadlocks(死結)，會以非同步(不同 thread 上)的方式執行後續的工作:

```csharp
static void Main(string[] args)
{
    ThreadPool.SetMinThreads(100, 100);
    Console.WriteLine("Main CurrentManagedThreadId:" + Environment.CurrentManagedThreadId);
    var tcs = new TaskCompletionSource<bool>();
    ContinueWith(1, tcs.Task);
    ContinueWith(2, tcs.Task);
    Task.Run(() =>
    {
        Console.WriteLine("Task Run CurrentManagedThreadId:" + Environment.CurrentManagedThreadId);
        tcs.TrySetResult(true);
    });
    Console.ReadLine();
}

static void print(int id) => Console.WriteLine($"continuation:{id}\tCurrentManagedThread:{Environment.CurrentManagedThreadId}");

static Task ContinueWith(int id, Task task)
{
    return task.ContinueWith(
         t => print(id),
         CancellationToken.None, TaskContinuationOptions.ExecuteSynchronously, TaskScheduler.Default);
}
//Main CurrentManagedThreadId:1
//Task Run CurrentManagedThreadId:4
//continuation:1  CurrentManagedThread:4
//continuation:2  CurrentManagedThread:4
```

在未設置`TaskCreationOption.RunContinuationAsyncchronously`情況下時，使用`ContinueWith`來接續前一個工作都還是會使用在同一個 thread 上，所以我們可以使用`TaskCreationOption.RunContinuationAsyncchronously`來解決這類問題:

```csharp{5}
static void Main(string[] args)
{
    ThreadPool.SetMinThreads(100, 100);
    Console.WriteLine("Main CurrentManagedThreadId:" + Environment.CurrentManagedThreadId);
    var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    ContinueWith(1, tcs.Task);
    ContinueWith(2, tcs.Task);
    Task.Run(() =>
    {
        Console.WriteLine("Task Run CurrentManagedThreadId:" + Environment.CurrentManagedThreadId);
        tcs.TrySetResult(true);
    });
    Console.ReadLine();
}

static void print(int id) => Console.WriteLine($"continuation:{id}\tCurrentManagedThread:{Environment.CurrentManagedThreadId}");

static Task ContinueWith(int id, Task task)
{
    return task.ContinueWith(
         t => print(id),
         CancellationToken.None, TaskContinuationOptions.ExecuteSynchronously, TaskScheduler.Default);
}

//Main CurrentManagedThreadId:1
//Task Run CurrentManagedThreadId:4
//continuation:1  CurrentManagedThread:5
//continuation:2  CurrentManagedThread:7
```

## 等待工作完成

上面提到我們可以透過`Task.Result`等待 return 值回來，TPL 還提供了其他種 API 供我們使用:

- `Task.Wait`
- `Task.WaitAll`
- `Task.WaitAny`
- `Task.WhenAll`
- `Task.WhenAny`

### `Task.Wait`

此方法會阻塞當前 thread 直到非同步工作完成，它還有幾種多載方法:

- `Wait(CancellationToken)`: 等待非同步工作完成或者 cancellation token 接受到取消的命令。
- `Wait(int)`: 限制非同步工作在有限時間內完成(milliseconds)，否則取消等待。
- `Wait(TimeSpan)`: 等待非同步工作在指定的時間間隔內完成。
- `Wait(int, CancellationToken)`: 限制非同步工作在有限時間內完成或者 cancellation token 接受到取消的命令，否則取消等待。

### `Task.WaitAll`

此方法可接受多`Task`，等待每個非同步工作都完成。

```csharp
Task taskA = Task.Factory.StartNew(() =>
Console.WriteLine("TaskA finished"));
Task taskB = Task.Factory.StartNew(() =>
Console.WriteLine("TaskB finished"));
Task.WaitAll(taskA, taskB);
Console.WriteLine("Calling method finishes");
```

### `Task.WaitAny`

此方法與`Task.WaitAll`類似，差別在於只要任一個非同步工作完成，就會取消等待。

```csharp
Task taskA = Task.Factory.StartNew(() =>
Console.WriteLine("TaskA finished"));
Task taskB = Task.Factory.StartNew(() =>
Console.WriteLine("TaskB finished"));
Task.WaitAny(taskA, taskB);
Console.WriteLine("Calling method finishes");
```

### `Task.WhenAll`

此方法與`Task.WaitAll`類似，但它不會阻塞當前 thread，取而代之會 return 一個`Task`類別的物件。

```csharp
Task taskA = Task.Factory.StartNew(() =>
Console.WriteLine("TaskA finished"));
Task taskB = Task.Factory.StartNew(() =>
Console.WriteLine("TaskB finished"));
var t = Task.WhenAll(taskA, taskB);
Console.WriteLine("Calling method finishes");
t.Wait();
```

### `Task.WhenAny`

此方法與`Task.WaitAny`類似，但它不會阻塞當前 thread，取而代之會 return 一個`Task`類別的物件。

```csharp
Task taskA = Task.Factory.StartNew(() =>
Console.WriteLine("TaskA finished"));
Task taskB = Task.Factory.StartNew(() =>
Console.WriteLine("TaskB finished"));
var t = Task.WhenAny(taskA, taskB);
Console.WriteLine("Calling method finishes");
t.Wait();
```

## 異常處理

我們來看一段程式碼，一個簡單捕獲非同步工作的 exception:

```csharp
static void Main(string[] args)
{
    try
    {
        var task = Task.Run(() =>
        {
            int n1 = 0, n2 = 1;
            var result = n2 / n1;
        });

        task.Wait();
    } catch(AggregateException ex)
    {
        Console.WriteLine($"Task has finished with exception { ex.InnerException.Message}");
    }
    Console.ReadLine();
}

//Task has finished with exception Attempted to divide by zero.
```

`AggregateException` 用來將多個錯誤合併成單一的 throwable 例外狀況物件。 它常被運用於 TPL 與 PLINQ 中，我們可以透過`InnerException.Message`來獲取異常拋出的訊息。
但有時候我們可能會用`WaitAll`組合多個非同步工作，這時我們可以透過`AggregateException`中的`InnerExceptions`來獲取拋出的異常訊息:

```csharp
static void Main(string[] args)
{
    Task taskA = Task.Factory.StartNew(() => throw new DivideByZeroException());
    Task taskB = Task.Factory.StartNew(() => throw new ArithmeticException());
    Task taskC = Task.Factory.StartNew(() => throw new NullReferenceException());

    try
    {
        Task.WaitAll(taskA, taskB, taskC);
    } catch( AggregateException ex)
    {
        foreach (Exception innerException in ex.InnerExceptions)
        {
            Console.WriteLine(innerException.Message);
        }
    }
    Console.ReadLine();
}

//Attempted to divide by zero.
//Overflow or underflow in the arithmetic operation.
//Object reference not set to an instance of an object.
```

若需要針對特定的 exception 進行處理可以使用`AggregateException.Handle`，當拋出異常時 return true，代表有在我們能夠處理的範圍內:

```csharp
static void Main(string[] args)
{
    Task taskA = Task.Factory.StartNew(() => throw new DivideByZeroException());
    Task taskB = Task.Factory.StartNew(() => throw new ArithmeticException());
    Task taskC = Task.Factory.StartNew(() => throw new NullReferenceException());

    try
    {
        Task.WaitAll(taskA, taskB, taskC);
    } catch( AggregateException ex)
    {
        ex.Handle(innerEx =>
        {
            if(innerEx is DivideByZeroException)
            {
                Console.WriteLine(innerEx.Message);
                return true;
            }
            return false;
        });
    }
    Console.ReadLine();
}
//Attempted to divide by zero.
//Unhandled exception. System.AggregateException: One or more errors occurred...
```

## Continuation tasks

若我們需要在非同步工作完成之後執行其它的工作，TPL 提供了一些有用的方法:

- `Task.ContinueWith`
- `Task.Factory.ContinueWhenAll`
- `Task.Factory.ContinueWhenAll<T>`
- `Task.Factory.ContinueWhenAny`
- `Task.Factory.ContinueWhenAny<T>`

### `Task.ContinueWith`

此方法可以讓我們接續前面的非同步工作，使用的方式與前面介紹的那些差異不大:

```csharp
static void Main(string[] args)
{
    Task.Run(() =>
    {
        Console.WriteLine("Fetching Data");
        return 200;
    }).ContinueWith((e) =>
    {
        Console.WriteLine("GetData {0}", e.Result);
    });
    Console.ReadLine();
}

//Fetching Data
//GetData 200
```

`ContinueWith`可以串連多個工作:

```csharp
Task.Run(() =>
{
    Console.WriteLine("Fetching Data");
    return 200;
}).ContinueWith((e) =>
{
    Console.WriteLine("GetData {0}", e.Result);
}).ContinueWith(()=>{
    Console.WriteLine("END");
});
```

TPL 還提供了`Threading.Tasks.TaskContinuationOptions`這個列舉讓我們控制 continue task 的行為:

- None: 預設值，只要主要的非同步工作完成(不論是被取消或者拋出異常)就會接續執行。
- OnlyOnRanToCompletion: 當主要的非同步工作成功的被完成才會執行(既不是被取消或者拋出異常)。
- NotOnRanToCompletion:: 當主要的非同步工作被取消或者拋出異常時，才會接續執行。
- OnlyOnFaulted: 只有當主要的非同步工作拋出異常時，才會接續執行。
- NotOnFaulted: 當主要的非同步工作沒有拋出異常，就會接續執行。
- OnlyOnCancelled: 只有當主要的非同步工作被取消時，才會接續執行。
- NotOnCancelled: 當主要的非同步工作沒有被取消，就會接續執行。

### `Task.Factory.ContinueWhenAll`、`Task.Factory.ContinueWhenAll<T>`

`ContinueWhenAll`可以讓我們同時間執行多個非同步工作，等到所有非同步工作都完成再接續執行另外的工作，與`WhenAll`類似，它會 return 一個`Task`類別的物件:

```csharp
int a = 2, b = 3;
Task<int> taskA = Task.Factory.StartNew<int>(() => a * a);
Task<int> taskB = Task.Factory.StartNew<int>(() => b * b);
Task<int> taskC = Task.Factory.StartNew<int>(() => 2 * a * b);
var t = Task.Factory.ContinueWhenAll<int>(new Task[]
{ taskA, taskB, taskC }, (tasks)
=> tasks.Sum(t => (t as Task<int>).Result));
Console.WriteLine(t.Result);

//25
```

### `Task.Factory.ContinueWhenAny`、`Task.Factory.ContinueWhenAny<T>`

`ContinueWhenAny`可以讓我們同時間執行多個非同步工作，當有任一個非同步工作完成，就會馬上執行，與`WhenAll`類似，它會 return 一個`Task`類別的物件:

```csharp
int number = 13;
Task<bool> taskA = Task.Factory.StartNew<bool>(() =>
number / 2 != 0);
Task<bool> taskB = Task.Factory.StartNew<bool>(() =>
(number / 2) * 2 != number);
Task<bool> taskC = Task.Factory.StartNew<bool>(() =>
(number & 1) != 0);
Task.Factory.ContinueWhenAny<bool>(new Task<bool>[]
{ taskA, taskB, taskC }, (task) =>
{
    Console.WriteLine((task as Task<bool>).Result);
});
Console.ReadLine();
```

## Work Stealing Queues

Work Stealing Queues 這個名詞不只用於 C#當中，它是用於解決 parallel 程序中 multithreaded 分配工作的問題，而 queue 這個資料結構的特徵就是 FIFO，在前面我們提過 TPL 是基於`ThreadPool`，`ThreadPool`擁有一個 global queue 與多個 threads，每個 thread 又各自擁有自己的 local queue，每個 thread 都有訪問 global queue 的權利:

![Thread Pool](/static/images/tpl-1-1.png)

當我們在主 thread 創建新的非同步工作時，就會將其排入 global queue 中:

![Thread Pool](/static/images/tpl-1-2.png)

local queue 的工作來自於該 thread 自己產生的工作，當 thread 把所有工作都完成時，會去 global queue 尋找有無新的工作，若沒有則會再去其他 thread 的 local queue 尋找，我們稱此最佳化技術為 Work-Stealing，且在竊取其他 thread 的工作同時，也會遵循 FIFO 的方式:

![Thread Pool](/static/images/tpl-1-3.png)

## Reference

- [Threads vs. Tasks](https://blog.slaks.net/2013-10-11/threads-vs-tasks/)
- [Hands-On Parallel Programming with C# 8 and .NET Core 3](https://www.amazon.com/Hands-Parallel-Programming-NET-Core/dp/178913241X)
- [ASYNCHRONOUS PROGRAMMING THE RIGHT WAY](https://bryanavery.co.uk/asynchronous-programming-the-right-way/#always-create-taskcompletionsourcet-with-taskcreationoptionsruncontinuationsasynchronously)
