---
title: "C# Parallel Programming:#1.5 APM, EAP 與 TAP"
date: "2021-04-28"
category: "BackEnd"
cover: "/images/coffee.jpg"
tags:
  - C#
  - Parallelism
---

.NET Framework 在非同步的開發上提供了幾個 pattern，**Asynchronous Programming Model (APM，非同步程式設計模型)**、**Event-based Asynchronous Pattern (EAP，事件架構非同步模式)**、**Task-based asynchronous pattern(TAP，以工作為基礎的非同步模式)**，這些算是.NET 從以前到現在不斷演進非同步的過程，有時在看些文章時不時會出現這些名詞，所以希望透過這篇來記錄一下這幾個 pattern 間的差異。

## Asynchronous Programming Model (APM)

在.NET Framework 1.1 的時候推出了 APM，它可以說是最早版本的非同步模型，這個模型的特性就是都會有`BeginXXXX`與`EndXXXX`這樣一對 function，`BeginXXXX`會回傳實作 interface`IAsyncResult`的物件，這個物件會儲存非同步期間作業的相關訊息，呼叫的同時會開啟另一個 thread 來處理工作。在標準中會有兩個參數(但不見得一定只能有這兩個)，第一個是`AsyncCallback`，用於在完成作業後會呼叫此 callback，若不需要則傳遞`null`即可，第二個為一個物件型別的 state，它由使用者自己定義，可以用於傳遞一些自訂義的狀態，若未指定則通常代表實作`IAsyncResult`的物件。

`EndXXXX`會回傳最後工作的結果，且其有阻塞的作用，當非同步的工作未完成，呼叫的 thread 就會一直卡在此 function 當中。

`WebRequest`類別就是實作 APM 的其中一種，但這裡我們還是自己實作看看比較容易懂:

```csharp
public class AddOneToNum
{
    class AddOneToNumAsyncResult : IAsyncResult
    {
        private int targetNum;

        private AsyncCallback asyncCallback;

        public int totalSum;

        public object AsyncState { get; }

        private ManualResetEvent waitHandle;

        public WaitHandle AsyncWaitHandle
        {
            get
            {
                if(waitHandle == null)
                {
                    waitHandle = new ManualResetEvent(false);
                }
                return waitHandle;
            }
        }

        public bool CompletedSynchronously { get; private set; }

        public bool IsCompleted { get; private set; }

        public AddOneToNumAsyncResult(int num, AsyncCallback callback, object state)
        {
            AsyncState = state;
            asyncCallback = callback;
            targetNum = num;
            ThreadPool.QueueUserWorkItem(addOneToNum, this);
        }

        private static void addOneToNum(object state)
        {
            var result = state as AddOneToNumAsyncResult;
            for(int i = 1; i <= result.targetNum; i++)
            {
                Thread.Sleep(200);
                result.totalSum += i;
            }
            result.CompletedSynchronously = false;
            result.IsCompleted = true;
            ((ManualResetEvent)result.AsyncWaitHandle).Set();
            result.asyncCallback?.Invoke(result);
        }
    }

    public int Num;

    public IAsyncResult BeginAdd(AsyncCallback userCallback, object asyncState)
    {
        IAsyncResult result = new AddOneToNumAsyncResult(Num, userCallback, asyncState);
        return result;
    }

    public int EndAdd(IAsyncResult result)
    {
        AddOneToNumAsyncResult r = result as AddOneToNumAsyncResult;
        r.AsyncWaitHandle.WaitOne();
        return r.totalSum;
    }
}
```

`AddOneToNum`這個類別主要工作就是加總從 1 到目標數，裡面有包含`BeginAdd`與`EndAdd`兩個方法以符合我們 APM 的要求，而`AddOneToNumAsyncResult`這個類別實作了`IAsyncResult`，裏頭包含我們所有需要的訊息，我們來看看幾個比較重要的部分:

- `totalSum`: 最後輸出的結果，由我們自訂義的。
- `AsyncWaitHandle`: 用於阻塞呼叫方的 thread，直到非同步的 thread 完成工作為止，這裡使用了`ManualResetEvent`作為阻塞的手段，`EndAdd`中使用`WaitOne`來進行阻塞，它必須等到有人呼叫`Set`才會釋放此 thread 使其繼續執行，此為`IAsyncResult`必須實作的方法之一。
- `CompletedSynchronously`: 表示此工作是由非同步的 thread 完成還是由呼叫`BeginAdd`的 thread 完成，通常都設其為 false，否則就沒有非同步的意義了，此為`IAsyncResult`必須實作的方法之一。
- `IsCompleted`: 表示非同步的工作是否已完成，此為`IAsyncResult`必須實作的方法之一。
- `AsyncState`: 如上面所提到的，一個選擇性的物件，包含了一些非同步的相關資訊，此為`IAsyncResult`必須實作的方法之一。
- `AddOneToNumAsyncResult` constructor: 這裡為創建 thread 的部分，這裡我選擇使用`ThreadPool`。
- `addOneToNum`: 此為主要工作邏輯的部分，並且我們在完成工作後將訊息寫回`IAsyncResult`中。

再來看我們主程式的部分:

```csharp
class Program
{
    static void Main(string[] args)
    {
        var addOneToNum = new AddOneToNum();
        addOneToNum.Num = 100;
        IAsyncResult r = addOneToNum.BeginAdd((obj) =>
        {
            Console.WriteLine("AddOneToNum Thread Id:{0}", Thread.CurrentThread.ManagedThreadId);
        }, null);

        Console.WriteLine("Main Thread Id:{0}", Thread.CurrentThread.ManagedThreadId);
        Console.WriteLine("Main Thread Id:{0} Total:{1}", Thread.CurrentThread.ManagedThreadId, addOneToNum.EndAdd(r));
        Console.ReadLine();
    }
}
```

這裡`BeginAdd`的第一個參數傳遞了一個 callback function，此 callback function 必須要根據以下形式:

```csharp
public delegate void AsyncCallback(IAsyncResult ar);
```

這個`obj`等同於`addOneToNum.BeginAdd`回傳的`IAsyncResult`，若需要使用到這個部分通常會與`BeginAdd`的第二個參數`AsyncState`有關係，但我這裡沒有使用到。

`EndAdd`接受一個`IAsyncResult`的物件，此物件就是由`BeginAdd`所產生的。

output:

```vim
Main Thread Id:1
AddOneToNum Thread Id:4
Main Thread Id:1 Total:5050
```

Print 的順序可能不一定會照著上面那樣，callback 與 main thread 最後等`EndAdd`結果回來幾乎差不多時間。

實作 APM 的方法不是只有上面這樣，也有比較簡易我們不需要自己實作`IAsyncResult`的方式也能達到一樣的目的。

## Event-based Asynchronous Pattern (EAP)

到了.NET Framework 2.0 時，推出了 EAP，其為 APM 的改良版，最大差異在於使用事件委派(所以才叫 event-based)代替 callback，並且不會阻塞呼叫方 thread，當工作完成會自己呼叫委派的事件，對比 APM 有一對`BeginXXXX`與`EndXXXX`，EAP 需要有`Async`結尾的 function(可能不只一個) 作為發起點。在上一篇的[BackgroundWorker](/archives/2021-04-01-c-task-multithreading-1#backgroundworker)就是最好的例子。

一樣，我們自己寫比較容易懂:

```csharp
class AddOneToNumEAP
{
    public class RunAddCompletedEventArgs : AsyncCompletedEventArgs
    {
        public int Result { get; set; }

        public RunAddCompletedEventArgs(int result, Exception error) : base(error, false, null)
        {
            Result = result;
        }
    }

    public delegate void RunAddCompletedEventHandler(object? sender, RunAddCompletedEventArgs e);

    public event RunAddCompletedEventHandler RunAddCompleted;

    public AddOneToNumEAP(int num)
    {
        targetNum = num;
    }

    public void StartAsync()
    {
        int res = 0;
        Exception err = null;
        WaitCallback wait = new WaitCallback((x) =>
        {
            try
            {
                res = addOneToNum();
            }
            catch (Exception ex)
            {
                err = ex;
            }
            finally
            {
                RunAddCompleted.Invoke(null, new RunAddCompletedEventArgs(res, err));
            }
        });
        ThreadPool.QueueUserWorkItem(wait);
    }

    private readonly int targetNum;

    private int addOneToNum()
    {
        int res = 0;
        for (int i = 1; i <= targetNum; i++)
        {
            Thread.Sleep(200);
            res += i;
        }
        return res;
    }
}
```

上面程式碼中我們定義了`RunAddCompletedEventArgs`與 delegate `RunAddCompletedEventHandler`用於給使用者委派其自訂義的事件於`RunAddCompleted`中;運算邏輯寫於`addOneToNum`中，當`StartAsync`被呼叫後，會創建一個 thread 用於執行此部分，最後再將結果或者 error 透過`RunAddCompleted`中被委派的事件回傳給使用者，由於這裡只是個範例，所以我只寫了一個給使用者委派的事件，像[BackgroundWorker](/archives/2021-04-01-c-task-multithreading-1#backgroundworker)中，就提供了`ReportProgress`與`DoWork`等等給使用者委派。

再來看我們主程式的部分:

```csharp
class Program
{
    static void Main(string[] args)
    {
        var addOneToNumEAP = new AddOneToNumEAP(100);
        addOneToNumEAP.RunAddCompleted += (sender, e) =>
        {
            if(e.Error != null) Console.WriteLine("AddOneToNumEAP Error:{0}", e.Error.Message);
            else Console.WriteLine("AddOneToNumEAP Thread Id:{0}, result:{1}", Thread.CurrentThread.ManagedThreadId, e.Result);
        };
        addOneToNumEAP.StartAsync();
        Console.WriteLine("Main Thread Id:{0}", Thread.CurrentThread.ManagedThreadId);
        Console.ReadLine();
    }
}
```

主程式部分相當單純，建構物件，委派事件，呼叫`StartAsync`。

Output:

```vim
Main Thread Id:1
AddOneToNumEAP Thread Id:4, result:5050
```

## Task-based asynchronous pattern(TAP)

到了.NET Framework 4.0 以上，推出了 APM 與 EAP 的再改良版 TAP，此非同步模式也被官方網站推薦使用，其基於**工作平行程式庫 Task Parallel Library(TPL)**中的 namespace `System.Threading.Tasks`中的類別`Task`與`Task<TResult>`，命名上與 EAP 有些類似，會有`Async`結尾的 function，其 return 的 type 可以是`Task`或`Task<TResult>`，除了`Async`結尾的 function 以外還會有一個對應的 synchronous function(但非必要)，其 return 的 type 可以是`void`或者`TResult`根據其對應的`Async` function 而定，若 TAP 中的 function 已經有名為`Async`結尾的了，可以改為`TaskAsync`結尾。

看看簡單的範例:

```csharp
class AddOneToNumTAP
{
    public Task<int> AddOneToNumAsync(int num)
    {
        return Task.Run(() =>
        {
            Console.WriteLine("AddOneToNum Thread Id:{0}", Thread.CurrentThread.ManagedThreadId);
            int result = 0;
            for (int i = 1; i <= num; i++)
            {
                Thread.Sleep(200);
                result += i;
            }
            return result;
        });
    }
}

class Program
{
    static void Main(string[] args)
    {
        var tap = new AddOneToNumTAP();
        var sum = tap.AddOneToNumAsync(100);
        Console.WriteLine("Main Thread Id:{0}", Thread.CurrentThread.ManagedThreadId);
        Console.WriteLine("Sum:{0}", sum.Result);
        Console.ReadLine();
    }
}

//output
Main Thread Id:1
AddOneToNum Thread Id:4
Sum:5050
```

TAP 比起 EAP 與 APM 簡短許多，看看`AddOneToNumAsync`這個 function，基本上在 TAP 中的所有非同步 function 的 return type 就如上所說，只能是`Task`或`Task<TResult>`，這裡我使用`Task.Run`來建立一個非同步的工作，它的背後等同於在`ThreadPool`上執行這段工作，上面我使用了 lambda 表達式作為參數傳遞，也可以用`Action`與`delegate`替代。主程式的部分比較值得注意的是`sum.Result`，它有阻塞的功能，會等到非同步的工作完成才會釋放主程式的 thread。在 C# 5(.NET Framework 4.5)中新增了`async`/`await`這對語法糖，與 javascript 中的類似，用於控制非同步用，這部分留給後面篇章在解釋。

## Reference

- [Threading in C#, by Joe Albahari](http://www.albahari.com/threading/)
- [Hands-On Parallel Programming with C# 8 and .NET Core 3](https://www.amazon.com/Hands-Parallel-Programming-NET-Core/dp/178913241X)
