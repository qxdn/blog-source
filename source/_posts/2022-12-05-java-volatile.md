---
title: java-volatile
tags:
  - java
  - 并发
categories: java
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.0/cover.png'
description: 随便写一点好了
date: 2022-12-05 21:23:11
---


> 封面《千の刃濤、桃花染の皇姫》

> 在同步执行不重要的时候，编译器、运行时刻和处理器会进行一些优化，虽然这些优化通常是有益的，但是有时候会有一些微妙的问题
> 缓存和指令重排是并发中容易出问题的优化，在Java和JVM中提供了许多方法来控制内存顺序，volatile关键字便是其中之一

# 多处理器结构

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.0/cpu.png)


计算机执行程序的时候每条指令都是在CPU中执行的，而执行指令过程中，势必涉及到数据的读取和写入。由于程序运行过程中的临时数据是存放在主存（物理内存）当中的，这时就存在一个问题，由于CPU执行速度很快，而从内存读取数据和向内存写入数据的过程跟CPU执行指令的速度比起来要慢的多，因此如果任何时候对数据的操作都要通过和内存的交互来进行，会大大降低指令执行的速度。因此在CPU里面就有了高速缓存。

当程序在运行过程中，会将运算需要的数据从主存复制一份到CPU的高速缓存当中，那么CPU进行计算时就可以直接从它的高速缓存读取数据和向其中写入数据，当运算结束之后，再将高速缓存中的数据刷新到主存当中。

```java
class SharedObj
{
   // Changes made to sharedVar in one thread
   // may not immediately reflect in other thread
   static int sharedVar = 6;
}
```
举个例子，假设有两个线程使用`SharedObj`，如果两个线程运行在两个不同的处理器上（如下图所示），那么每个线程有一份本地的`sharedVariable`缓存。如果其中一个线程改变其变量，可能不会马上反映到主线程中，另一个线程不会注意到数据改变了，导致了数据的不一致。关于缓存一致性可以读[这篇](https://en.wikipedia.org/wiki/Cache_coherence)

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.0/shared-memory.png)

# volatile作用
## 内存可见性
可见性问题主要指一个线程修改了共享变量值，而另一个线程却看不到。引起可见性问题的主要原因是每个线程拥有自己的一个高速缓存区——线程工作内存。volatile关键字能有效的解决这个问题。

让我们来看下面这个例子
```java
public class Demo {

    static int num;

    public static void main(String[] args) {

        Thread readerThread = new Thread(() -> {
            int temp = 0;
            while (true) {
                if (temp != num) {
                    temp = num;
                    System.out.println("reader: value of num = " + num);
                }
            }
        });

        Thread writerThread = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                num++;
                System.out.println("writer: changed value to = " + num);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            // 退出程序，否则readerThread会一直等
            System.exit(0);
        });

        readerThread.start();
        writerThread.start();
    }
}
```
输出如下
```
reader: value of num = 1
writer: changed value to = 1
writer: changed value to = 2
writer: changed value to = 3
writer: changed value to = 4
writer: changed value to = 5
```
没加volatile的时候reader只读到0-1的变化。

接下来修改代码
```java
volatile static int num;
```
输出如下
```
writer: changed value to = 1
reader: value of num = 1
writer: changed value to = 2
reader: value of num = 2
writer: changed value to = 3
reader: value of num = 3
writer: changed value to = 4
reader: value of num = 4
writer: changed value to = 5
reader: value of num = 5
```
可以看到输出reader可以读到num的变化，volatile指示编译器，这个变量是共享的且不稳定，每次要到主程序中读取。

## 禁止指令重排
一般来说，处理器为了提高程序运行效率，可能会对输入代码进行优化，它不保证程序中各个语句的执行先后顺序同代码中的顺序一致，但是它会保证程序最终执行结果和代码顺序执行的结果是一致的
```java
int a = 10;    //语句1
int r = 2;    //语句2
a = a + 3;    //语句3
r = a*a;     //语句4
```
这段代码有4个语句，那么可能的一个执行顺序是：
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.0/reorder.jpg)
但是执行顺序不可能是:语句2-语句1-语句4-语句3。因为处理器在进行重排序时是会考虑指令之间的数据依赖性，如果一个指令Instruction 2必须用到Instruction 1的结果，那么处理器会保证Instruction 1会在Instruction 2之前执行。

虽然重排不影响单线程内程序执行结果，但是多线程中会有影响
```java
//线程1:
context = loadContext();   //语句1
inited = true;             //语句2
 
//线程2:
while(!inited ){
  sleep()
}
doSomethingwithconfig(context);
```
上面代码中，由于语句1和语句2没有数据依赖性，因此可能会被重排序。假如发生了重排序，在线程1执行过程中先执行语句2，而此是线程2会以为初始化工作已经完成，那么就会跳出while循环，去执行doSomethingwithconfig(context)方法，而此时context并没有被初始化，就会导致程序出错。

> 在Java中，volatile关键字除了可以保证变量的可见性，还有一个重要的作用就是防止JVM的指令重排序。如果我们将变量声明为volatile，在对这个变量进行读写操作的时候，会通过插入特定的内存屏障的方式来禁止指令重排序。

# volatile不保证原子性
volatile关键字保证变量的可见性，但是不保证对变量操作是原子性。
```java
public class Demo {

    volatile static int num = 0;

    public static void main(String[] args) throws InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        for (int i=0;i<5;i++){
            threadPool.execute(()->{
                for (int j=0;j<500;j++){
                    num++;
                }
            });
        }
        // 等5秒保证执行完上面代码
        Thread.sleep(5000);
        System.out.println(num);
        threadPool.shutdown();
    }
}
```
以上代码按照预期应该是输出2500，然而实际的输出结果不一定是2500，比如2136。
这是因为`num++`不是原子性的，其包含三步
- 读取num的值。
- 对num加1。
- 将num的值写回内存。

改进也很简单，使用`synchronized`、`Lock`或者`JUC`即可。
## synchronized
```java
public class Demo {

    volatile static int num = 0;

    public synchronized void increase(){
        num++;
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        Demo demo = new Demo();
        for (int i=0;i<5;i++){
            threadPool.execute(()->{
                for (int j=0;j<500;j++){
                    demo.increase();
                }
            });
        }
        // 等5秒保证执行完上面代码
        Thread.sleep(5000);
        System.out.println(num);
        threadPool.shutdown();
    }
}
```

## JUC
```java
public class Demo {

    static AtomicInteger num = new AtomicInteger(0);

    public void increase(){
        num.getAndIncrement();
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        Demo demo = new Demo();
        for (int i=0;i<5;i++){
            threadPool.execute(()->{
                for (int j=0;j<500;j++){
                    demo.increase();
                }
            });
        }
        // 等5秒保证执行完上面代码
        Thread.sleep(5000);
        System.out.println(num);
        threadPool.shutdown();
    }
}
```

## Lock
```java
public class Demo {

    static int num = 0;

    static Lock lock = new ReentrantLock();

    public void increase(){
        lock.lock();
        num++;
        lock.unlock();
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        Demo demo = new Demo();
        for (int i=0;i<5;i++){
            threadPool.execute(()->{
                for (int j=0;j<500;j++){
                    demo.increase();
                }
            });
        }
        // 等5秒保证执行完上面代码
        Thread.sleep(5000);
        System.out.println(num);
        threadPool.shutdown();
    }
}
```

# Java和C/C++中volatile的区别
Java和C/C++中的volatile关键字不一样，在java中volatile告诉编译器变量不能缓存该值，需要到主存中去读取

C/C++中，开发嵌入式设备需要volatile，需要读取和写入内存映射的硬件设备，其值可能随时变化，所以用volatile告诉编译器不要将其优化。

# 参考资料
[Guide to the Volatile Keyword in Java](https://www.baeldung.com/java-volatile)

[Java并发编程：volatile关键字解析](https://www.cnblogs.com/dolphin0520/p/3920373.html)

[volatile Keyword in Java](https://www.geeksforgeeks.org/volatile-keyword-in-java/)