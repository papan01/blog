---
title: "C# Parallel Programming:#5 Synchronization Primitives"
date: "2022-07-18"
category: "BackEnd"
cover: "/images/city.jpg"
tags:
  - C#
  - Parallelism
---

在我接觸到 **Synchronization Primitives** 這個名詞之前，我還不太清楚它指的是什麼東西，在.NET 官網的中文翻譯稱為[「同步處理原始物件」](https://docs.microsoft.com/zh-tw/dotnet/standard/threading/overview-of-synchronization-primitives)，所以在這篇會來介紹什麼是**Synchronization Primitives**以及其用途。

## 什麼是 Synchronization Primitives

在講解**Synchronization Primitives**之前，必須先來聊解什麼是**臨界區間(Critical Section)**，若有讀過或上過作業系統(Operating System)可能對此名詞不陌生，當在 multi-thread 的環境下，由於會有存取共享記憶體(share memory)的部分，若每個 thread 在同時間進行存取某個記憶位置，肯定會有資料上的不確定性，也就是 race condition 的問題，所以**臨界區間**是為了解決此問題而存在，它會存於在每個 thread 中，利用一些機制保證當存取某段記憶體位置時，同時間只能有一個 thread 進行，在程式碼中會分成三個區段:

- 進入區(entry section):進去臨界區間前的那段控制程式碼。
- 離開區(exit section): 離開臨界區間前的那段控制程式碼。
- 剩餘區(remainder section): 不是進入區、臨界區間與離開區的都是剩餘區。

```csharp
while(true) {
  進入區
    臨界區間
  離開區
    剩餘區
}
```

臨界區間的成立必須有三個必要條件:

- 互斥(mutual exclusion) : 同時間最多只能有一個 thread 進入臨界區間。
- 能持續運作(progress): 若臨界區間沒有任何 thread 在其中，只有不再剩餘區間的 thread 可以競爭進入臨界區間且必須在有限時間內產出優勝者。
- 有限等待(bounded waiting): 當某個 thread 到進入區等待進入時，其它 thread 進入臨界區間的次數必須有個上限值，既不能使某個 thread 無限等待。

而這篇要說的**Synchronization Primitives**其實就是用來同步存取共享記憶體與協調 thread 之間的互動所提供的一些類別、方法或語法，我們將類型分為五種:

- Interlocked Operations
- Locking Primitives
- Signaling Primitives
- Lightweight Primitives
- Barrier 與 Countdown Events
- SpinWait

## Interlocked Operations

`Interlocked`這個 class 能讓我們在不同 thread 上透過 atomic operations 操作共用變數，atomic operations 操作的背後理念就是永遠不會在同一時間發生兩件事情，例如當我們同時按下兩顆鍵盤上的按鍵，無論如何一定有一個先後，不論我們按的有多快多同時，這意味著我們不需要等待或者產生任何碰撞。看看下面的例子:

```csharp
int _counter = 0;
Parallel.For(1, 1000, i =>
{
    Thread.Sleep(100);
    _counter++;
});
Console.WriteLine($"Value for counter should be 999 and is { _counter }");

//Value for counter should be 999 and is 959
```

可以看到結果的值不如我們預期，這是 race condition 造成的，因為當前 thread 所讀取的值並不保證是最新的結果。

為了避免這種情況，我們可以使用`Interlocked`所提供方法來達到 thread-safe 的效果:

```csharp
int _counter = 0;
Parallel.For(1, 1000, i =>
{
    Thread.Sleep(100);
    Interlocked.Increment(ref _counter);
});
Console.WriteLine($"Value for counter should be 999 and is { _counter }");

//Value for counter should be 999 and is 999
```

上面範例使用了`Increment`將變數遞增，除了此方法外還提供了`Add`、`And`、`CompareExchange`、`Decrement`、`Exchange`、`MemoryBarrier`、`Or`與`Read`等方法。

## Locking Primitives

為了實現**Critical Section**的機制，.NET 提供了一些類別或語法能夠使我們達到此目的，這些類別或語法能夠**locking(鎖定)**某些資源，使其同時間只能讓單一 thread 進行存取。

再介紹這些類別或語法之前，我們先來了解`ThreadState`，它能夠使用我們了解當下 thread 的狀態，下圖為 thread 的 life cycle:

![Thread Life Cycle](/static/images/csharp-multithreading-5-1.png)

- `Unstarted`: `Thread.Start`方法還沒被該 thread 呼叫。
- `Running`: `Thread.Start`已經被呼叫，並且沒有處於任何阻塞、暫停或停止的狀態。
- `WaitSleepJoin`: 當 thread 呼叫了`Wait()`、`Sleep()`或`Join()`，就會進入阻塞狀態。
- `StopRequested`: thread 正被要求停止中。
- `Stopped`: thread 已經停止。
- `SuspendRequested`: thread 正被要求暫停中。
- `Suspended`: thread 已經暫停。
- `AbortRequested`: `Abort()`已經被呼叫，但 thread 還沒有收到會嘗試終止它的 ThreadAbortException。
- `Aborted`: 目前 thread 已經無作用，但狀態還未切成`Stopped`。

### `lock`、`Mutex`、`Semaphore`與`SemaphoreSlim`

`lock`與`Mutex`只允許單一 thread 存取受保護的資源，而`lock`是類別`Monitor`所包裝過的語法糖，而`Semaphore`與`SemaphoreSlim`可以讓指定的 thread 數量同時存取受保護的資源。

`lock`與`Semaphore`不能夠跨 process，而`Mutex`與`SemaphoreSlim`能夠跨 process。

![Locking Primitives](/static/images/csharp-multithreading-5-2.png)

#### Lock

先來看看以下程式碼:

```csharp
var range = Enumerable.Range(1, 1000);
Stopwatch watch = Stopwatch.StartNew();
for(int i = 0; i < range.Count(); i++)
{
    Thread.Sleep(10);
    File.AppendAllText("test.txt", i.ToString());
}
watch.Stop();
Console.WriteLine($"Total time to write file is {watch.ElapsedMilliseconds}");

//Total time  to write file is 13303
```

我們嘗試將數字 1 到 1000 寫入某個檔案中，並且每次停滯 10 milliseconds, 再加上 IO 的時間，所以可以看到最後花費了 13303 milliseconds，若我們嘗試用`AsParallel()`與`AsOrdered()`使其能平行寫入並且又保持順序:

```csharp
var range = Enumerable.Range(1, 1000);
Stopwatch watch = Stopwatch.StartNew();
range.AsParallel().AsOrdered().ForAll(i =>
{
    Thread.Sleep(10);
    File.AppendAllText("test.txt", i.ToString());
});
watch.Stop();
Console.WriteLine($"Total time to write file is {watch.ElapsedMilliseconds}");
```

此時會拋出`System.IO.IOException: The process cannot access the file 'test.txt' because it is being used by another process`。

由於我們嘗試使多個 thread 同時間寫入檔案，所以系統拋出了這個例外訊息，這意味著檔案的寫入必須再受保護範圍內，所以我們可以使用`lock`來達成這項功能，由於`lock`需要接收一個`object`作為識別的媒介，所以需要先宣告一個靜態變數:

```csharp
static object _lock = new object();
...

var range = Enumerable.Range(1, 1000);
Stopwatch watch = Stopwatch.StartNew();
range.AsParallel().AsOrdered().ForAll(i =>
{
    Thread.Sleep(10);
    lock(_lock)
    {
        File.AppendAllText("test.txt", i.ToString());
    }
});
watch.Stop();
Console.WriteLine($"Total time to write file is {watch.ElapsedMilliseconds}");

//Total time to write file is 2345
```

由於我們已經使用`lock`來保護檔案寫入的部分，`Thread.Sleep(10)`可以當作是每個 thread 各自完成各自工作的時間，此時就能把它抽出來，這樣就能有效提升速度。

上面有提到`lock`是類別`Monitor`所包裝的語法糖，所以我們也能使用`Monitor`來實作:

```csharp
static object _lock = new object();
...

var range = Enumerable.Range(1, 1000);
Stopwatch watch = Stopwatch.StartNew();
range.AsParallel().AsOrdered().ForAll(i =>
{
    Thread.Sleep(10);
    Monitor.Enter(_lock);
    try
    {
        File.WriteAllText("test.txt", i.ToString());
    }
    finally
    {
        Monitor.Exit(_lock);
    }
});
watch.Stop();
Console.WriteLine($"Total time to write file is {watch.ElapsedMilliseconds}");

//Total time  to write file is 1771
```

#### Mutex

若有兩個以上的 process 同時對檔案進行寫入的動作，若使用上面的`lock`依舊會拋出`System.IO.IOException: The process cannot access the file 'test.txt' because it is being used by another process`這個例外，由於`lock`不支援跨 process，所以此時我們可以改用`Mutex`替代:

```csharp
private static Mutex mutex = new Mutex();
...

var range = Enumerable.Range(1, 1000);
Stopwatch watch = Stopwatch.StartNew();
range.AsParallel().AsOrdered().ForAll(i =>
{
    Thread.Sleep(10);
    mutex.WaitOne();
    File.AppendAllText("test.txt", i.ToString());
    mutex.ReleaseMutex();
});
watch.Stop();
Console.WriteLine($"Total time to write file is {watch.ElapsedMilliseconds}");

//Total time  to write file is 1965
```

透過宣告`Mutex`物件，使用`WaitOne()`與`ReleaseMutex`來鎖定與釋放共享資源，`WaitOne()`還可以讓我們指定時間內若未收到釋放的訊號，則自動放棄進入受保護的區域，例如:

```csharp
private static Mutex mutex = new Mutex();
...

var range = Enumerable.Range(1, 1000);
Stopwatch watch = Stopwatch.StartNew();
range.AsParallel().AsOrdered().ForAll(i =>
{
    Thread.Sleep(10);
    if (mutex.WaitOne(3000))
    {
        File.AppendAllText("test.txt", i.ToString());
        mutex.ReleaseMutex();
    }
    else
    {
        Console.WriteLine($"Timeout");
    };
});
watch.Stop();
Console.WriteLine($"Total time to write file is {watch.ElapsedMilliseconds}");

//Total time  to write file is 1971
```

#### Semaphore

上面提到的`lock`與`Mutex`同時間都只能使單一 thread 存取共享資源，而接下來要介紹的`Semaphore`可以讓我們設定允許通過的數量，它可以接受兩個參數，第一個參數為`initialCount`，可以設定多少 thread 在初始化後進入，第二個參數為`maximumCount`，可以設定可進入區間的最大 thread 數量。

看下面範例程式:

```csharp
Semaphore semaphore = new Semaphore(3, 3);
var range = Enumerable.Range(1, 1000);
range.AsParallel().AsOrdered().ForAll(i =>
{
    semaphore.WaitOne();
    Console.WriteLine($"Index {i} making service call using Task {Task.CurrentId}");
    Thread.Sleep(1000);
    Console.WriteLine($"Index {i} releasing semaphore using Task {Task.CurrentId}");
    semaphore.Release();
});

//Index 3 making service call using Task 3
//Index 2 making service call using Task 4
//Index 1 making service call using Task 6
//Index 1 releasing semaphore using Task 6
//Index 2 releasing semaphore using Task 4
//Index 3 releasing semaphore using Task 3
//Index 6 making service call using Task 8
//Index 7 making service call using Task 5
//Index 8 making service call using Task 9
//Index 6 releasing semaphore using Task 8
//Index 8 releasing semaphore using Task 9
//Index 7 releasing semaphore using Task 5
//Index 9 making service call using Task 3
//Index 11 making service call using Task 4
//Index 10 making service call using Task 6
//Index 10 releasing semaphore using Task 6
//Index 11 releasing semaphore using Task 4
//Index 5 making service call using Task 7
//...
```

可以看到同時間會有三個 thread 進入區間，接著被釋放後，又會緊接著讓下個 thread 進入。

`Semaphore`可以分 local semaphore 與 global semaphore，我們可以替它指定一個名子，若有指定它就會被創建為 global semaphore，若未指定，則為 local semaphore:

```csharp
Semaphore semaphore = new Semaphore(1,10, "Globalsemaphore");
```

## Signaling Primitives

**Signaling Primitives(訊號處理原始物件)**表示 thread 必須等待其他 thread 的信號(訊號)才能繼續執行，接下來會介紹幾種.NET 提供的類別或方法讓我們可以達到等待的功用:

- `Thread.Join`
- `EventWaitHandle`

### `Thread.Join`

直接來看一個簡單的例子:

```csharp
int result = 0;
Thread childThread = new Thread(() =>
{
    Thread.Sleep(5000);
    result = 10;
});
childThread.Start();
Console.WriteLine($"Result is {result}");

//Result is 0
```

上面的例子我們期待 result 可以等於 10，但由於 main thread 執行的太快，還沒等到 `childThread` 執行完成就已經先把 result 打印出來了，所以這時我們可以使用`Join()`來等待`childThread`執行完成:

```csharp
int result = 0;
Thread childThread = new Thread(() =>
{
    Thread.Sleep(5000);
    result = 10;
});
childThread.Start();
childThread.Join();
Console.WriteLine($"Result is {result}");

//Result is 10
```

### `EventWaitHandle`

`EventWaitHandle` 類別用於 thread 的同步處理，在介紹它之前，先來說說`AutoResetEvent`與`ManualResetEvent`這兩個類別，它們都可以使用`WaitOne`方法將 thread 的狀態變成 WaitSleepJoin，使用`Set`方法可以將狀態變回 Running 狀態，而這兩個類別的差別在於`AutoResetEvent`在呼叫`Set`之後會自動設回未收到信號的狀態，而`ManualResetEvent`在呼叫`Set`之後需要在呼叫`Reset`才會回到未收到信號的狀態，看看下面的範例

`AutoResetEvent`:

```csharp
static AutoResetEvent autoResetEvent = new AutoResetEvent(false);
static void Main(string[] args)
{
    int sum = 0;
    try
    {
        Task signallingTask = Task.Factory.StartNew(() =>
        {
            for (int i = 0; i < 10; i++)
            {
                Thread.Sleep(1000);
                autoResetEvent.Set();
                Console.WriteLine($"AutoResetEvent call set()");
            }
        });

        Parallel.For(1, 10, (i) => {
            Console.WriteLine($"Task with id {Task.CurrentId} waiting for signal to enter");
            autoResetEvent.WaitOne();
            Console.WriteLine($"Task with id {Task.CurrentId} received signal to enter");
            sum += i;
        });
    }
    catch (AggregateException ex)
    {
        foreach (var inner in ex.InnerExceptions)
        {
            Console.WriteLine(inner.Message);
        }
    }
    Console.ReadLine();
}

//Task with id 3 waiting for signal to enter
//Task with id 2 waiting for signal to enter
//Task with id 4 waiting for signal to enter
//Task with id 5 waiting for signal to enter
//Task with id 6 waiting for signal to enter
//Task with id 7 waiting for signal to enter
//Task with id 8 waiting for signal to enter
//Task with id 9 waiting for signal to enter
//Task with id 10 waiting for signal to enter
//AutoResetEvent call set()
//Task with id 2 received signal to enter
//AutoResetEvent call set()
//Task with id 3 received signal to enter
//AutoResetEvent call set()
//Task with id 4 received signal to enter
//AutoResetEvent call set()
//Task with id 5 received signal to enter
//AutoResetEvent call set()
//Task with id 6 received signal to enter
//AutoResetEvent call set()
//Task with id 7 received signal to enter
//AutoResetEvent call set()
//Task with id 8 received signal to enter
//AutoResetEvent call set()
//Task with id 9 received signal to enter
//AutoResetEvent call set()
//Task with id 10 received signal to enter
//AutoResetEvent call set()
```

在一開始我們建立了發送信號的 task，使其每秒會呼叫`Set`方法來釋放 thread，接著透過`Parallel`建了 10 個 tasks，其中我們使用了`WaitOne`方法來阻塞每個 task 繼續進行下去，所以在一開始所有 task 的會處於阻塞的狀態，直到發送信號的 task 開始呼叫`Set`。

`ManualResetEvent`:

```csharp
static ManualResetEvent manualResetEvent = new ManualResetEvent(false);
static void Main(string[] args)
{
    int sum = 0;
    try
    {
        Task signalOffTask = Task.Factory.StartNew(() =>
        {
            for (int i = 0; i < 10; i++)
            {
                Thread.Sleep(1000);
                manualResetEvent.Reset();
                Console.WriteLine("Signal Off");
            }
        });

        Task signalOnTask = Task.Factory.StartNew(() =>
        {
            for (int i = 0; i < 10; i++)
            {
                Thread.Sleep(3000);
                manualResetEvent.Set();
                Console.WriteLine("Signal On");
            }
        });


        for (int i = 0; i < 3; i++)
        {
            Parallel.For(0, 5, (i) => {
                Console.WriteLine($"Task with id {Task.CurrentId} waiting for signal to enter");
                manualResetEvent.WaitOne();
                Console.WriteLine($"Task with id {Task.CurrentId} received signal to enter");
                sum += i;
            });
            Thread.Sleep(2000);
        }
    }
    catch (AggregateException ex)
    {
        foreach (var inner in ex.InnerExceptions)
        {
            Console.WriteLine(inner.Message);
        }
    }
    Console.ReadLine();
}

//Task with id 7 waiting for signal to enter
//Task with id 3 waiting for signal to enter
//Task with id 6 waiting for signal to enter
//Task with id 5 waiting for signal to enter
//Task with id 4 waiting for signal to enter
//Task with id 8 waiting for signal to enter
//Task with id 9 waiting for signal to enter
//Task with id 10 waiting for signal to enter
//Signal Off
//Task with id 11 waiting for signal to enter
//Signal Off
//Signal On
//Task with id 6 received signal to enter
//Task with id 7 received signal to enter
//Task with id 5 received signal to enter
//Task with id 3 received signal to enter
//Task with id 4 received signal to enter
//Task with id 11 received signal to enter
//Signal Off
//Task with id 8 received signal to enter
//Task with id 9 received signal to enter
//Task with id 10 received signal to enter
//Signal Off
//Signal Off
//Signal On
```

與`AutoResetEvent`類似，但在上面多了一組 SignalOff 的 task，當`Set`被呼叫後，可以看到所有被阻塞的 task 都立刻被釋放了，直到`Reset`再次被呼叫才會再次阻塞。

這兩個類別皆繼承`EventWaitHandle`，`AutoResetEvent`等於使用`EventResetMode.AutoReset`來建立`EventWaitHandle`，而`ManualResetEvent`等於使用`EventResetMode.ManualReset`來建立`EventWaitHandle`。

## Lightweight Primitives

### ReaderWriterLockSlim

`ReaderWriterLockSlim`是輕量級版的`ReaderWriterLock`，它們允許多個 thread 進行讀取，在寫入時只允許單一 thread 進行，在官方網站已經建議使用`ReaderWriterLockSlim`來代替`ReaderWriterLock`，`ReaderWriterLockSlim`可以避免產生 deadlock(死結)且效能上也比`ReaderWriterLock`好，下面的例子使用了三個 reader thread 與一個 writer thread:

```csharp
static ReaderWriterLockSlim _readerWriterLockSlim = new ReaderWriterLockSlim();
static List<int> _list = new List<int>();
static void WriterTask()
{
    for (int i = 0; i < 4; i++)
    {
        try
        {
            _readerWriterLockSlim.EnterWriteLock();
            Console.WriteLine($"Entered WriteLock on Task {Task.CurrentId}");
            int random = new Random().Next(1, 10);
            _list.Add(random);
            Console.WriteLine($"Added {random} to list on Task {Task.CurrentId}");
            Console.WriteLine($"Exiting WriteLock on Task {Task.CurrentId}");
        }
        finally
        {
            _readerWriterLockSlim.ExitWriteLock();
        }
        Thread.Sleep(1000);
    }
}

static void ReaderTask()
{
    for (int i = 0; i < 2; i++)
    {
        _readerWriterLockSlim.EnterReadLock();
        Console.WriteLine($"Entered ReadLock on Task {Task.CurrentId}");
        Console.WriteLine($"Items: {_list.Select(j => j.ToString()).Aggregate((a, b) => a + "," + b)} on Task{Task.CurrentId}");
        Console.WriteLine($"Exiting ReadLock on Task {Task.CurrentId}");
        _readerWriterLockSlim.ExitReadLock();
        Thread.Sleep(1000);
    }
}

private static void ReaderWriteLockSlim()
{
    Task writerTask = Task.Factory.StartNew(WriterTask);
    for (int i = 0; i < 3; i++)
    {
        Task readerTask = Task.Factory.StartNew(ReaderTask);
    }
}

static void Main(string[] args)
{
    try
    {
        ReaderWriteLockSlim();
    }
    catch (AggregateException ex)
    {
        foreach (var inner in ex.InnerExceptions)
        {
            Console.WriteLine(inner.Message);
        }
    }
    Console.ReadLine();
}

// Entered WriteLock on Task 1
// Added 6 to list on Task 1
// Exiting WriteLock on Task 1
// Entered ReadLock on Task 4
// Entered ReadLock on Task 3
// Items: 6 on Task4
// Exiting ReadLock on Task 4
// Items: 6 on Task3
// Entered ReadLock on Task 2
// Exiting ReadLock on Task 3
// Items: 6 on Task2
// Exiting ReadLock on Task 2
// Entered WriteLock on Task 1
// Added 7 to list on Task 1
// Exiting WriteLock on Task 1
// Entered ReadLock on Task 2
// Entered ReadLock on Task 4
// Items: 6,7 on Task4
// Exiting ReadLock on Task 4
// Entered ReadLock on Task 3
// Items: 6,7 on Task2
// Exiting ReadLock on Task 2
// Items: 6,7 on Task3
// Exiting ReadLock on Task 3
// Entered WriteLock on Task 1
// Added 2 to list on Task 1
// Exiting WriteLock on Task 1
// Entered WriteLock on Task 1
// Added 6 to list on Task 1
// Exiting WriteLock on Task 1
```

### SemaphoreSlim

`SemaphoreSlim`是輕量級版的`Semaphore`，在前面有稍微提到過，它能允許指定數量的 thread 通過，看看下面的例子:

```csharp
 static void Main(string[] args)
{
    try
    {
        var range = Enumerable.Range(1, 12);
        SemaphoreSlim semaphore = new SemaphoreSlim(3, 3);
        range.AsParallel().AsOrdered().ForAll(i =>
        {
            try
            {
                semaphore.Wait();
                Console.WriteLine($"Index {i} making service call using Task {Task.CurrentId}");
                Thread.Sleep(1000);
                Console.WriteLine($"Index {i} releasing semaphore using Task {Task.CurrentId}");
            }
            finally
            {
                semaphore.Release();
            }
        });
    }
    catch (AggregateException ex)
    {
        foreach (var inner in ex.InnerExceptions)
        {
            Console.WriteLine(inner.Message);
        }
    }
    Console.ReadLine();
}

// Index 5 making service call using Task 7
// Index 1 making service call using Task 6
// Index 2 making service call using Task 8
// Index 5 releasing semaphore using Task 7
// Index 7 making service call using Task 5
// Index 1 releasing semaphore using Task 6
// Index 2 releasing semaphore using Task 8
// Index 10 making service call using Task 6
// Index 11 making service call using Task 8
// Index 11 releasing semaphore using Task 8
// Index 10 releasing semaphore using Task 6
// Index 7 releasing semaphore using Task 5
// Index 8 making service call using Task 9
// Index 3 making service call using Task 3
// Index 9 making service call using Task 7
// Index 9 releasing semaphore using Task 7
// Index 3 releasing semaphore using Task 3
// Index 8 releasing semaphore using Task 9
// Index 12 making service call using Task 8
// Index 6 making service call using Task 4
// Index 4 making service call using Task 2
// Index 12 releasing semaphore using Task 8
// Index 4 releasing semaphore using Task 2
// Index 6 releasing semaphore using Task 4
```

每次至多只會有三個 thread 在其中運行，每當其中一個釋放下一個就會補上。

### ManualResetEventSlim

`ManualResetEventSlim`是輕量級版的`ManualResetEvent`，它擁有比`ManualResetEvent`較好的 performance 與更少的開銷，我們可以像使用`ManualResetEvent`一樣:

```csharp
ManualResetEventSlim manualResetEvent = new ManualResetEventSlim(false);
```

只是需要使用`Wait()`來代替`WaitOne()`，與前面幾個輕量級版的類似。

<!-- Memory barriers 的存在是為了讓 CPU 或 compiler 運行中訪問 memory 必須是有順序的訪問，程式在運行中存取變數的順序不見得與編寫時的順序保持一致，因為將 memory 存取的順序重新排序可以得到更好的效能，但有些時候為了程式的邏輯正確性必須使 memory 存取的順序與程式執行順序保持一致，所以就需要 memory barriers 來達到此目的。

CPU 執行速度遠快過於 memory 的存取系統，以一個 2006 年的 CPU 可以再每 nanosecond 執行 10 幾條指令，但卻需要 10 幾 nanosecond 來從 memory 中獲取資料，因為這速度上的差異，所以都會夾帶幾個擁有幾 MB 的 cache，這些 cache 通常會分 level(我們常聽到的 L1、L2、L3 cache 等等)，越靠近 CPU 的 cache 存取速度越快，相對的大小越小，當然在 CPU 首次訪問某些資料時，cache 是沒有那份資料的(此行為稱 cache miss)，此時 CPU 需要花費幾百 cycle time 把該資料從對應的 cache line 載入到 CPU cache 中。 -->

## Barrier 與 Countdown Events

`Barrier`與`CountdownEvent`與前面介紹的 Synchronization Primitives 用途有些不同，此兩種比較偏向在**多個任務**與**不同階段**的處理流程。

### Barrier

若我們有四個 Task，每個 Task 須完成四個階段，每一階段都需等待其他`Task`完成後才能進行下個階段，那麼我們就可以使用`Barrier`來達成此目的:

![Barrier](/static/images/csharp-multithreading-5-3.png)

```csharp
static int _TaskNum = 4;
static Task[] _Tasks;
static Barrier _Barrier;


static void PhaseZero(int taskId)
{
    Console.WriteLine("Task: #{0} ===== Phase 0", taskId);
}

static void PhaseOne(int taskId)
{
    Console.WriteLine("Task: #{0} ***** Phase 1", taskId);
}

static void PhaseTwo(int taskId)
{
    Console.WriteLine("Task: #{0} $$$$$ Phase 2", taskId);
}

static void PhaseThree(int taskId)
{
    Console.WriteLine("Task: #{0} @@@@@ Phase 3", taskId);
}

static void Main(string[] args)
{
    try
    {
        _Tasks = new Task[_TaskNum];
        _Barrier = new Barrier(_TaskNum, (barrier) =>
        {
            Console.WriteLine("----------------{0} Phase Completed--------------------------", barrier.CurrentPhaseNumber);
        });

        for (int i = 0; i < _TaskNum; i++)
        {
            _Tasks[i] = Task.Factory.StartNew((num) =>
            {
                var task_id = (int)num;

                PhaseZero(task_id);
                _Barrier.SignalAndWait();

                PhaseOne(task_id);
                _Barrier.SignalAndWait();

                PhaseTwo(task_id);
                _Barrier.SignalAndWait();

                PhaseThree(task_id);
                _Barrier.SignalAndWait();
            }, i);
        }

        var finalTask = Task.Factory.ContinueWhenAll(_Tasks, (tasks) =>
        {
            Task.WaitAll(_Tasks);
            Console.WriteLine("=============================");
            Console.WriteLine("All Phase is completed");
            _Barrier.Dispose();

        });

        finalTask.Wait();
        Console.ReadLine();
    }
    catch (AggregateException ex)
    {
        foreach (var inner in ex.InnerExceptions)
        {
            Console.WriteLine(inner.Message);
        }
    }
}

//Task: #1 ===== Phase 0
//Task: #0 ===== Phase 0
//Task: #2 ===== Phase 0
//Task: #3 ===== Phase 0
//----------------0 Phase Completed--------------------------
//Task: #3 ***** Phase 1
//Task: #1 ***** Phase 1
//Task: #2 ***** Phase 1
//Task: #0 ***** Phase 1
//----------------1 Phase Completed--------------------------
//Task: #0 $$$$$ Phase 2
//Task: #3 $$$$$ Phase 2
//Task: #2 $$$$$ Phase 2
//Task: #1 $$$$$ Phase 2
//----------------2 Phase Completed--------------------------
//Task: #1 @@@@@ Phase 3
//Task: #3 @@@@@ Phase 3
//Task: #2 @@@@@ Phase 3
//Task: #0 @@@@@ Phase 3
//----------------3 Phase Completed--------------------------
//=============================
//All Phase is completed
```

`Barrier`的`SignalAndWait()`可以發出訊號，表示自己已抵達屏障，並且等待其他所有參加的 Task 到來，一旦等到所設定的數量，就會進入下一個階段。

### CountdownEvent

`CountdownEvent`需要接收到一定數量的訊號，才會繼續往下進行，下面我們建立五個Task，來測試:

```csharp
static int _TaskNum = 5;
static Task[] _Tasks;
static CountdownEvent countdownEvent = new CountdownEvent(5);

static void ProcessSomething(int taskId)
{
    Console.WriteLine("Task: #{0} ===== Do Something......", taskId);
}

static void Main(string[] args)
{
    try
    {
        _Tasks = new Task[_TaskNum];
        for (int i = 0; i < _TaskNum; i++)
        {
            _Tasks[i] = Task.Factory.StartNew((num) =>
            {
                var task_id = (int)num;
                ProcessSomething(task_id);
                countdownEvent.Signal();
            }, i);
        }

        countdownEvent.Wait();
        Console.WriteLine("=============================");
        Console.WriteLine("All Task is completed");
        Console.ReadLine();
    }
    catch (AggregateException ex)
    {
        foreach (var inner in ex.InnerExceptions)
        {
            Console.WriteLine(inner.Message);
        }
    }
}

//Task: #1 ===== Do Something......
//Task: #0 ===== Do Something......
//Task: #3 ===== Do Something......
//Task: #4 ===== Do Something......
//Task: #2 ===== Do Something......
//=============================
//All Task is completed
```

`CountdownEvent`的建構式可以指定需等待訊號的數量，每當`Signal()`被呼叫，`CountdownEvent`中的`CurrentCount`就會減一，而`Wait()`則會等待計數到達才釋放當前thread。

### SpinWait

`SpinWait` 是一個輕量型同步處理類型，多數時候我們會像`Thread.Sleep`一樣來使用它，但它比`Thread.Sleep`產生更少kernel間接費用在Context Switch上，`SpinWait`比較偏向在CPU進行等待，若等待時間較長或者條件不滿足時，則會自動轉換到kernel環境進行等待。

網路有些文章會說`SpinWait`的資源利用度會比`Thread.Sleep`來的好，但我自己測試的結果覺得差異性不大，但根據官方說法，在等待時間較短時，選擇使用`SpinWait`會是比較好的選擇，至少不需耗費資源再Context Switch上。