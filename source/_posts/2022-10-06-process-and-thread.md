---
title: 进程与线程
tags:
  - 面经
  - OS
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.6/cover.jpg
categories:
  - OS
description: 记录一下面经，进程与线程的区别和通信方式
date: 2022-10-06 02:08:01
---


> 封面 《サクラノ詩 －櫻の森の上を舞う－》

# 进程
## 定义
> 进程是一个独立执行的程序，是操作系统进行资源分配和调度的基本概念，操作系统进行资源分配和调度的一个独立单位。

## 进程组成部分
进程实体=程序段+数据段+进程控制块(process control block，PCB)
- 程序段： 程序代码存放程序段
- 数据段： 程序运行时使用、产生的运算数据。如全局变量、局部变量、宏定义的常量就存放在数据段内
- PCB: 操作系统通过PCB来管理进程,因此PCB中应该包含操作系统对其进行管理所需的各种信息

### PCB的组成部分
- 进程描述信息 
    - 进程唯一的标记符，类似唯一id
    - 用户标识符，进程归属的用户，用户标识符主要为共享和保护服务
- 进程控制和管理信息
    - 进程当前状态，比如运行、就绪、阻塞等，作为处理机分配调度的依据
    - 进程优先级，描述进程抢占处理机的优先级，优先级高的进程可以优先获得处理机
- 资源分配清单
    - 用于说明有关内存地址空间或虚拟地址空间的状况，所打开文件的列表和所使用的输入/输出设备信息
- CPU 相关信息
    - 指 CPU 中各寄存器值，当进程被切换时，CPU状态信息都必须保存在相应的 PCB中，以便进程重新执行时，能再从断点继续执行。

## 进程的状态
![进程状态切换 图源见水印](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.6/process-state.png)
- 创建态（new）：进程正在被创建
- 就绪态（Ready）：可运行，但因为其他进程正在运行而暂停停止
- 运行态（Runing）：时刻进程占用 CPU
- 结束态（Exit）：进程正在从系统中消失时的状态
- 阻塞状态（Blocked）：该进程等待某个事件（比如IO读取）停止运行，这时，即使给它CPU控制权，它也无法运行

## 进程的上下文切换
进程的任何操作都是在操作系统内核的支持下运行的，进程切换发生在内核态。

进程切换就是把前一个进程的CPU上下文保存起来，然后加载当前任务的CPU上下文，最后跳转到程序计数器所指的新位置，运行任务

## 进程通信
### 通信作用
进程的数据空间是独立的，私有的，不能相互访问，但是在某些情况下进程之间需要通信来实现某功能或交换数据，包括：

- 数据传输：一个进程需要将它的数据发送给另一个进程。
- 共享数据：多个进程想要操作共享数据，一个进程对共享数据的修改，别的进程应该立刻看到。
- 通知事件：一个进程需要向另一个或一组进程发送消息，通知它（它们）发生了某种事件（如通知进程退出）。
- 进程控制：一个进程希望控制另一个进程的运行。

### 进程通信
进程通信（Inter Process Communication）有两种形式：
- LPC（local procedure call）：信号量、管道、消息队列、共享内存、socket等
- RPC（remote procedure call）：基于网络协议封装


进程通信的方式大概分为六种。

- 管道：包括无名管道（pipe）及命名管道（named pipe），无名管道可用于具有父进程和子进程之间的通信。命名管道克服了管道没有名字的限制，因此，除具有管道所具有的功能外，它还允许无亲缘关系进程间的通信。
- 消息队列（message）：进程可以向队列中添加消息，其它的进程则可以读取队列中的消息。
- 信号（signal）：信号用于通知其它进程有某种事件发生。
- 共享内存（shared memory）：多个进程可以访问同一块内存空间。
- 信号量（semaphore）：也叫信号灯，用于进程之间对共享资源进行加锁。
- 套接字（socket）：可用于不同计算机之间的进程间通信。

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.6/IPC.png)

# 线程
## 定义
> 线程是进程的子任务，是CPU调度和分派的基本单位，用于保证程序的实时性，实现进程内部的并发；线程是操作系统可识别的最小执行和调度单位。每个线程都独自占用一个虚拟处理器：独自的寄存器组，指令计数器和处理器状态。每个线程完成不同的任务，但是共享同一地址空间（也就是同样的动态内存，映射文件，目标代码等等），打开的文件队列和其他内核资源。

一个进程内可以有许多线程，线程不拥有自己的资源，线程与其他线程共享进程内的资源

与进程类似，线程也有TCB(Thread Control Block)

## 线程的类别
- 用户级线程
内核意识不到用户级线程的存在，使用线程库设计多线程程序，对于一个进程来说，一个线程阻塞，整个进程都会被阻塞。
- 内核级线程
由操作系统层面实现线程，应用程序没有实现线程管理，但是切换的代价要比用户级线程大

## 多线程模型
有些系统同时支持用户线程和内核线程由此产生了不同的多线程模型，即实现用户级线程和内核级线程的连接方式。
- 多对一模型： 多个用户及线程映射到一个内核级线程。每个用户进程只对应一个内核级线程
    - 优点:用户级线程的切换在用户空间即可完成，不需要切换到核心态，线程管理的系统开销小，效率高
    - 缺点:当一个用户级线程被阻塞后，整个进程都会被阻塞，并发度不高。多个线程不可在多核处理机上并行运行
- 一对一模型： 一个用户及线程映射到一个内核级线程。每个用户进程有与用户级线程同数量的内核级线程
    - 优点:当一个线程被阻塞后，别的线程还可以继续执行，并发能力强。多线程可在多核处理机上并行执行。
    - 缺点:一个用户进程会占用多个内核级线程，线程切换由操作系统内核完成，需要切换到核心态，因此线程管理的成本高，开销大。
- 多对多模型:n用户及线程映射到m个内核级线程(n >= m）。每个用户进程对应m个内核级线程
    - 克服了多对一模型并发度不高的缺点，又克服了一对一模型中一个用户进程占用太多内核级线程，开销太大的缺点

# 进程与线程的区别
| | 进程 | 线程 |
| --- | --- | --- |
| 定义 | 资源分配的基本单位 | CPU执行的基本单位 |
| 切换开销 | 大 | 小 |
| 包含关系 | 进程内可以有多个线程 | 线程生存在进程内 |
| 影响关系 | 一个进程崩溃后，在保护模式下不会对其他进程产生影响 | 一个线程崩溃整个进程都死掉 |
| 资源 | 独立的代码空间和内存空间 | 独立的运行栈和程序计数器 |
| 通信 | 进程通信 | 直接读写数据段 |
# 参考文献
[进程和线程的概念、区别及进程线程间通信](https://cloud.tencent.com/developer/article/1688297)

[进程、线程与协程傻傻分不清？一文带你吃透！](https://mp.weixin.qq.com/s/jhOSjVyRA6rNKqVT2pKMIQ)

[C语言技术网](https://freecplus.net/d95f4eaf18eb46d19b82383519126dec.html)

[三分钟基础：用户级线程和内核级线程有什么区别？](https://mp.weixin.qq.com/s/iHQGe2J-4C405CYzBIqXNg)