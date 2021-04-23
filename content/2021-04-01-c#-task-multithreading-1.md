---
title: "C# Parallel Programming:#1 Task Parallel Library (TPL)"
date: "2021-04-01"
category: "BackEnd"
cover: "/images/books.jpg"
tags:
  - C#
  - Parallelism
---

微軟從 C# 4.0 後為了 Parallel Programming 加入了**工作平行程式庫 Task Parallel Library(TPL)**，其主要指的是 _System.Threading_ 和 _System.Threading.Tasks_ 中的一組 API，目的是要簡化使用 parallelism 的處理流程。在這章會先簡單的介紹電腦其**作業系統 Operating System (OS)**對於 multitasking 的影響，以及說明 TPL 提供的三種不同 class: _Thread_、_BackgroundWorker_ 與 _ThreadPool_ 如何使用在 multithreading。

## OS 與 Multitasking

**Multitasking**指的是電腦能夠在同一時間執行一個以上的 process 的能力，能夠執行的數量取決於處理器的核心數，單核處理器只能在同一時間處理一個 task，這裡先稍微解釋一下何謂 task:

- **Task**: 通常這個詞被用於 scheduling 當中，它代表 OS scheduling 中的 processes 與 threads。

所以若有一個雙核處理器，它就能同時間去處理兩個 task，以此類推，通常我們看到 CPU 所執行的程式數量遠大於我們看到的核心數，這些其實是取決於 CPU 的 scheduling algorithms，它會不斷地在不同的 scheduling 中切換。有關於 cpu scheduling 的議題可以參考https://www.studytonight.com/operating-system/cpu-scheduling

## Hyper Threading

**Hyper-Threading(HT)**是 Intel 開發的一項技術，在 2002 年時，公開於 Xeon 處理器中，其目的是為了提升平行運算的能力，它能夠使處理器中的每個 core 從原本只能執行一個 task 提升到兩個，若處理器支援 HT，那麼我們就可以進到 BIOS 去啟用它:

- 單一單核處理器: 同時間只能處理一個 task。
- 單一單核處理器並且啟用 HT: 同時間能處理兩個 task。
- 單一雙核處理器: 同時間能處理兩個 task。
- 單一雙核處理器並且啟用 HT: 同時間能處理四個 task。
- 單一四核處理器: 同時間能處理四個 task。
- 單一四核處理器並且啟用 HT: 同時間能處理八個 task。

可以在https://www.wepc.com/news/intel-new-list-hyper-threaded-cpu-leak/ 查看你的處理器是否有支援 HT。

## Flynn's taxonomy

費林分類法(Flynn's taxonomy)於 1966 年由*Michael J.Flynn*提出，它將高效計算機根據指令流(instruction stream)與資料流(data stream)的相對關係分類為四種，說明這四種前先來解釋指令流與資料流這兩個名詞在這裡的意義:

- 指令流(information stream): 一些指令從 memory 被讀取之後送往 CPU 稱為指令流。
- 資料流(data stream): 在 memory 與 CPU 之前進行一些運算元(operand，+、-、\*、/ 、變數等...)的操作稱為資料流。

![csharp-multithreading-1](/static/images/csharp-multithreading-1.png)

<figcaption><em>Information Stream and Data Stream</em></figcaption>

接著來看看這四種分類方式:

- **Single Instruction, Single Data (SISD)**: 在此架構下只有單一控制單元(control unit)從 memory 獲取單一指令流，所以同一時間只能執行一個指令，所有單核處理器的電腦都是基於此架構。
- **Single Instruction, Multiple Data (SIMD)**: 在此架構會有單一指令流與多個資料流，此單一指令流會平行的被執行於多個資料流上，指令流會被有順序的執行，所以這類電腦會有如 pipeline 的機制。
- **Multiple Instructions, Single Data (MISD)**: 在此架構會有多個指令流與單個資料流，此架構通常比較少見，通常運用於一些有容錯(fault tolerance)的系統上，當系統的某些組件損壞時，它依舊可以正常運行，例如太空梭上的電腦。
- **Multiple Instructions, Multiple Data (MIMD)**: 在此架構會有多個指令流與多個資料流，處理器上的每個核能夠各自執行不同的指令流與資料流，現今多數的電腦都是在此架構上。

![csharp-multithreading-2](/static/images/csharp-multithreading-2.png)

<figcaption><em>Flynn's taxonomy</em></figcaption>

## Program, Process 與 Thread

由於這三個名詞在某些程度上容易造成混淆，所以在這裡先稍微解釋一下:

- **Program(程序)**: 指那些還未被執行的程式碼，當被執行時就會產生一個 process，所以當這個程式被執行多次就會產生多個 process。
- **Process(進程)**: 指那些已被載入到 memory 的程式碼，等著被 CPU 執行的 program，若我們打開活動監視器(工作管理員)可以看到每個 process 都會有各自的 PID。
- **Thread(執行緒)**: Process 是 thread 的容器，最常聽到的比喻就是工廠(process)與工人(thread)，一個 process 底下有許多的 thread，每個 thread 負責各自的工作，但也會有與其他 thread 一起工作的時候(concurrency)。

在 Windows application 中，像是 Windows Forms(WinForms)或者 Windows Presentation Foundation(WPF)都會有一個專門管理 UI 與一些互動事件的 thread，我們稱此為 UI thread 或者 foreground thread(前景執行緒)，有 foreground thread 想當然也會有 background thread(背景執行緒)，我們來看看這兩個的差異:

- **Foreground thread(前景執行緒)**: 與 application 的生命週期有關，只要有任何一個 foreground thread 存在，那麼這個 application 就會一直持續運作，直到所有 foreground thread 被結束。
- **Background thread(背景執行緒)**: 與 application 的生命週期無關，當 application 被關閉(意味著所有 foreground 也都結束工作了)，所有 background thread 也會跟著一起結束。

### COM 與 Apartment

**Component Object Model(COM)**是一種定義二進位互動性的標準，以建立在執行期間可互動的軟體程式庫，此標準並不局限於 Windows 上，只是 Microsoft 的許多產品與技術都建立在 COM 之上，實作 COM 的語言沒有侷限，代表我們可以在例如 C++或者.NEW Framework 中實現它，但為什麼會在這提到這個呢，這跟後面要講的 apartment 與 thread 有關，詳細的介紹可以參考官網[COM](https://docs.microsoft.com/en-gb/windows/win32/com/the-component-object-model)的介紹。

**Apartment**是 COM objects 的容器，每個 COM object 只會存留在一個 apartment 當中，一個 apartment 可能不只包含一個 COM object，它有兩種類型:

- **Single-Threaded Apartment(STA)**: 此 apartment 只有會有一個 thread，其中的 COM objects 只能被此單一 thread 訪問。
- **Multi-Threaded Apartment(MTA)**: 此 apartment 可以有多個 thread，其中的 COM objects 能被所有屬於此 apartment 的 thread 訪問。

整理一下上面的關係:

1. 每個 Process 可以有多個 threads, 可以是 foreground thread 或 background thread。
2. 每個 apartment 都有屬於它的 thread(s)，可以是一個(STA)或多個(MTA)。
3. 每個 Process 可以多個 STA 但只能有一個 MTA。
4. COM objects 被建立於 apartments 當中，每一個 COM object 只會存在於一個 apartment，apartment 之間不能互相分享。

```csharp
using System;
using System.Windows.Forms;

namespace STA
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new Form1());
        }
    }
}
```

## Multithreading

無論是 desktop application 或者 web application 都可以使用多個 thread，使用的上限取決於硬體的能力，而 thread 本身也有先後執行的概念，
`System.Threading.ThreadPriority`可以讓我們設置該 thread 的優先度:

- Highest
- AboveNormal
- Normal(default)
- BelowNormal
- Lowest

不同的 OS 都有自己的 thread scheduling algorithm，但大體上遵循如下:

1. 找到權重最高的 thread，優先將其排進 schedule 當中。
2. 如果有多個最高權重的 thread，則當該 thread 被執行就排進 schedule。
3. 當高權重的 thread 完成執行的動作，就輪到次高權重的 thread 執行。
4. 如果有新的高權重 thread 加進去 schedule 當中，則權重較低的 thread 會被往後推遲。

除此之外還會牽扯到 context switch 與 concurrency 的議題，這些都與 OS scheduling 息息相關，我們暫時不討論這些議題。

接著我們將討論*Thread*、_BackgroundWorker_ 與 *ThreadPool*如何運用在 multithreading 上。

### Thread Class

使用*System.Threading*創建 thread 是.NET 中最簡單且直觀的方式，直接看範例程式碼:

```csharp
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Start!!!");
        PrintOneToNumber(10);
        Console.WriteLine("Finish!!!");
        Console.ReadLine();
    }

    private static void PrintOneToNumber(int number)
    {
        for(int i = 1; i <= number; i++)
        {
            Console.Write(i);
        }
        Console.WriteLine();
    }
}
```

上面這段程式碼是沒有使用 thread 的狀況，我們來看看 output:

```vim
Start!!!
12345678910
Finish!!!
```

接著我們創建一個 thread 來跑這`PrintOneToNumber`這個 function:

```csharp{6,10-14,16}
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Start!!!");
        CreateThreadToPrintOneToNumber(10);
        Console.WriteLine("Finish!!!");
        Console.ReadLine();
    }

    private static void CreateThreadToPrintOneToNumber(int number)
    {
        Thread thread = new Thread(new ParameterizedThreadStart(PrintOneToNumber));
        thread.Start(number);
    }

    private static void PrintOneToNumber(object number)
    {
        for(int i = 1; i <= (int)number; i++)
        {
            Console.Write(i);
        }
        Console.WriteLine();
    }
}
```

output:

```vim
Start!!!
Finish!!!
12345678910
```

上面我們在`CreateThreadToPrintOneToNumber`裡面使用了`System.Threading.Thread`來建立一個 thread，由於我們的`PrintOneToNumber`是需要帶參數的，所以我們需要使用`System.Threading ParameterizedThreadStart` 進行委派(delegate)。須注意第 16 行我們將`number`的型別從`int`換成`object`，這是因為`System.Threading ParameterizedThreadStart`只允許參數型別為 object 的 function，我們也可以使用 lambda 簡化此部分:

```csharp
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Start!!!");
        CreatThreadToPrintOneToNumber(10);
        Console.WriteLine("Finish!!!");
        Console.ReadLine();
    }

    private static void CreatThreadToPrintOneToNumber(int number)
    {
        Thread thread = new Thread(() => PrintOneToNumber(number));
        thread.Start();
    }

    private static void PrintOneToNumber(int number)
    {
        for(int i = 1; i <= number; i++)
        {
            Console.Write(i);
        }
        Console.WriteLine();
    }
}
```

我們來看看使用 thread 前後差異，在沒有任何新的 thread 被建立的情況下，所有程式碼都 run 在 main thread 上:

```vim
                | Start!!! |  12345678910 | Finish!!! |
Main Thread  ---------------------------------------------

```

在來看看我們後來使用 thread 的版本:

```vim
                | Start!!! | Finish!!! |
Main Thread  ---------------------------------------------
                                         | 12345678910 |
Child Thread ---------------------------------------------
```

這裡要提到`Thread.IsBackground`這個屬性，這個屬性預設是`false`代表我們在建立 thread 時它都是屬於 foreground thread，我們在上面的程式碼使用了`Console.ReadLine()`讓使用者輸入任意鍵才會繼續執行，但就算把這段拔掉 child thread 依舊會執行完畢，因為前面有說過所有 foreground thread 執行結束 application 才會真正停止，但我們將`Thread.IsBackground`設成 true，再把`Console.ReadLine()`拔掉，我們就能驗證上面說當所有 foreground thread 結束，background thread 也會一併中止這件事:

```csharp
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Start!!!");
        CreatThreadToPrintOneToNumber(10);
        Console.WriteLine("Finish!!!");
    }

    private static void CreatThreadToPrintOneToNumber(int number)
    {
        Thread thread = new Thread(() => PrintOneToNumber(number));
        thread.IsBackground = true;
        thread.Start();
    }

    private static void PrintOneToNumber(int number)
    {
        for(int i = 1; i <= number; i++)
        {
            Console.Write(i);
        }
        Console.WriteLine();
    }
}
```

output:

```vim
Start!!!
Finish!!!
12
```

Child thread 只來得及 print `12`就被結束了，每次執行不一定有一樣結果，有時候連第一次迭代都還來不及就被結束了。

### ThreadPool Class

建立 thread 是有負擔的，每次建立一個 thread 需耗費 1 MB 的 memory 以及幾百微秒(μs)的 CPU time，所以我們不能肆無忌憚的一直建立 thread，毫無考慮的增加可能導致效能變得更差，因為當我們建立太多的 thread 代表 CPU 與 memory 必須分配更多資源給我們，相對地等同於搶走其他 OS 上的基礎程式資源(權重較低)使得電腦整體變得更慢。但由我們自己來評估何謂最佳的 thread 數也是很困難的，所以我們可以交給**Common Language Runtime(CLR)**，CLR 有其自己的一套 algorithm 來定義何謂最佳的 thread 數量在任何時間點，它會管理一個 threads 的 pool，在程式中就是這裡要介紹的`ThreadPool`，每個 application 都有它自己的`ThreadPool`，thread 的最佳數量在不同的.NET frameworks 版本也都不一樣:

- .NET Framework 2.0 可設每個核心 25 個
- .NET Framework 3.5 可設每個核心 250 個
- .NET Framework 4.0 & 32-bit 可設 1023 個
- .NET Framework 4.0 & 64-bit 可設 32768 個

來看看改用`ThreadPool`的版本:

```csharp
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Start!!!");
        CreatThreadToPrintOneToNumber(10);
        Console.WriteLine("Finish!!!");
        Console.ReadLine();
    }

    private static void CreatThreadToPrintOneToNumber(int number)
    {
        ThreadPool.QueueUserWorkItem(PrintOneToNumber, number);
    }

    private static void PrintOneToNumber(object number)
    {
        for(int i = 1; i <= (int)number; i++)
        {
            Console.Write(i);
        }
        Console.WriteLine();
    }
}
```

output:

```vim
Start!!!
Finish!!!
12345678910
```

`ThreadPool`可以設置其最大與最小的 thread 數:

- `ThreadPool.SetMinThreads`
- `ThreadPool.SetMaxThreads`

在使用`ThreadPool`時，須注意一些事項:

- `ThreadPool`是 background thread，若需要 foreground thread，那麼`ThreadPool`可能不適合。
- 若須要針對 thread 的權重進行配置，那麼`ThreadPool`也不適用。
- `ThreadPool`預設是 MTA，所以若需要 STA 也不適用。
- 無法替`ThreadPool`配置 name 屬性(`Thread`有此屬性可讓我們存取)。

上面程式碼是使用`ThreadPool`的其中一種方式還有其他方式也是等同於使用`ThreadPool`，所以我們整理一下:

1. Task Parallel Library(.NET Framework 4.0 以上)
2. Asynchronous delegates
3. BackgroundWorker
4. ThreadPool.QueueUserWorkItem

在某些情況下也等同於間接使用`ThreadPool`:

- WCF, Remoting, ASP.NET 與 ASMX Web Services 等 server 型應用程式
- `System.Timers.Timer` 與 `System.Threading.Timer`
- 在.NET Framework 中使用 Async 結尾與 Begin 開頭的方法
- PLINQ

### BackgroundWorker

如上面提到的，`BackgroundWorker`也會使用到`ThreadPool`，它能提供給我們更多權限去管理`ThreadPool`，例如它提供`WorkerReportsProgress`、`ReportProgress`與`ProgressChanged`讓我們監控 thread 的狀況，`CancelAsync`用來取消此 thread。`BackgroundWorker`隸屬於`System.ComponentModel`，讓我們來看看程式碼:

```csharp
class Program
{
    static void Main(string[] args)
    {
        var backgroundWorker = new BackgroundWorker
        {
            WorkerReportsProgress = true,
            WorkerSupportsCancellation = true
        };

        backgroundWorker.ProgressChanged += ProgressChanged;
        backgroundWorker.RunWorkerCompleted += RunWorkerCompleted;
        backgroundWorker.DoWork += SimulateServiceCall;
        backgroundWorker.RunWorkerAsync();
        Console.WriteLine("To Cancel Worker Thread Press C.");
        while (backgroundWorker.IsBusy)
        {
            if (Console.ReadKey(true).KeyChar == 'C')
            {
                backgroundWorker.CancelAsync();
            }
        }
    }

    private static void ProgressChanged(object sender, ProgressChangedEventArgs e)
    {
        Console.WriteLine($"{e.ProgressPercentage}% completed");
    }

    private static void RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
    {
        if (e.Cancelled)
        {
            Console.WriteLine("Canceled!");
        }
        else if (e.Error != null)
        {
            Console.WriteLine(e.Error.Message);
        }
        else
        {
            Console.WriteLine($"Result from service call is { e.Result }");
        }
    }

    private static void SimulateServiceCall(object sender, DoWorkEventArgs e)
    {
        var worker = sender as BackgroundWorker;
        StringBuilder data = new StringBuilder();
        for (int i = 1; i <= 100; i++)
        {
            if (!worker.CancellationPending)
            {
                data.Append(i);
                worker.ReportProgress(i);
                Thread.Sleep(100);
            }
            else
            {
                e.Cancel = true;
                return;
            }
        }
        e.Result = data;
    }
}
```

這裡要稍微講一下 Event-Based Asynchronous Pattern(EAP)，此 pattern 能夠簡單的提供使用 multithreading 的能力而無須自行啟動或管理 thread，`BackgroundWorker`與`WebClient`都是基於此 pattern 設計的。

接著我們先來看`DoWork`、`RunWorkerAsync`與`RunWorkerCompleted`，前兩個算是必要的，從命名就能看出它們的用途，接下來一一介紹:

- `DoWork`: 接受一個 event 其中包含我們需要讓此 thread 做的事
- `RunWorkerAsync`: 請求此 thread 開始執行`DoWork`
- `RunWorkerCompleted`則是當`DoWork`做完或者有 throw error 接著執行的 event

要使`BackgroundWorker`支援 progress reporting 需要以下幾個步驟:

1. 將`WorkerReportsProgress`這個 property 設成 true。
2. 在`DoWork`的 handle event 中使用`ReportProgress`，它可以接收`percentageProgress`(int)與`userState`(object)兩個參數。
3. 配置`ProgressChanged` event，此 event 需要有`ProgressPercentage`參數讓我們使用`ReportProgress`過來的資料。

要使`BackgroundWorkder`支援 cancellation 需要以下幾個步驟:

1. 將`WorkerSupportsCancellation`這個 property 設成 true。
2. 在`DoWork`的 handle event 中判斷`CancellationPending`這個 property 是否為 true，若為 true 我們可以將`DoWorkEventArgs`中的`Cancel` property 設為 true，這樣在最後的`RunWorkerCompleted`被執行時就會知道這是被 cancel 的。
3. 呼叫`CancelAsync`來請求 cancellation。

## 總結

最我們來說說 parallel programming 的優缺點:

優點:

- 增進 performance，將 task 分散在不同 thread 的上，平行執行能夠讓我們更快速地完成。
- 改善 GUI 上 user 的使用者體驗，我們將一些 I/O 的操作交由非 GUI thread 去執行，讓 GUI thread 能夠專心的處理與 user 的交互行為。
- 更有效的利用電腦資源。

缺點:

- 增加 debug 與測試的複雜度。
- Context switch 產生額外的開銷，無論是 thread 層面或者 process 層面。
- 若為 concurrency 需注意 race condition 與 deadlock。

可能還有些沒提到的優缺點，這些都是我們面臨大型專案需要考慮到的因素。

## Reference

- [Threading in C#, by Joe Albahari](http://www.albahari.com/threading/)
- [Hands-On Parallel Programming with C# 8 and .NET Core 3](https://www.amazon.com/Hands-Parallel-Programming-NET-Core/dp/178913241X)
