---
title: python装饰器
tags:
  - python
top_img: /images/python-decorator/top_img.png
cover: /images/python-decorator/top_img.png
categories: python
date: 2021-05-26 22:00:04
---


由于前几天了解到了python的装饰器，感觉有点点类似于AOP思想，因此记录一下学习笔记。
封面《金色ラブリッチェ》
<!--more-->

# 闭包(closure)
在讲python装饰器前，需要先介绍一下闭包
> In programming languages, a closure, also lexical closure or function closure, is a technique for implementing lexically scoped name binding in a language with first-class functions. Operationally, a closure is a record storing a function together with an environment. The environment is a mapping associating each free variable of the function (variables that are used locally, but defined in an enclosing scope) with the value or reference to which the name was bound when the closure was created.

直接展示例子
```python
def f():
    x=1
    def g(y):
        return x + y
    # 返回闭包
    return g  

closure = f()
# 输出3
print(closure(2))
```
本来在`f()`执行完后，x就会被内存回收，但是内部函数使用了x，因此x内存不会被回收。
闭包的好处在于函数内的参数不会被内存回收，可以隐藏一些内容，同时避免了命名冲突。缺点在于内存无法自动回收，容易溢出。

# 装饰器(decorator)
先来看看一个简单的装饰器例子
```python
import time
# 外部
def timer(func):
    #内部
    def wapper(*args,**kwargs):
        start = time.time()
        ans = func(*args,**kwargs)
        end = time.time()
        print(end - start)
        return ans
    return wapper
@timer
def loop(nums):
    for i in range(nums):
        pass
    print("over")
loop(55555555)
print(loop.__name__)
```
其输出结果如下
```shell
over
1.4170827865600586
wapper
```
其调用方式拆分为如下几步
```python
wapper = timer(loop)
wapper(55555555)
```
可以看到我们使用了一个装饰器来增强了loop方法，为其添加了计算耗时的功能。外部函数传进去的是函数，内部函数传进的是参数。args和kwargs可以看[这](https://stackoverflow.com/questions/36901/what-does-double-star-asterisk-and-star-asterisk-do-for-parameters)。简单来说就是args是以元组传参，kwargs是以键值对来传参。
另外这种实现装饰器的方法很简单，但是也有缺陷，就是__name__属性发生了变化。这对一些使用__name__的库来说有缺陷。可以使用自带functools库来完成。
## 修复__name__
```python
import time
import functools

def timer(func):
    @functools.wraps(func)
    def wapper(*args,**kwargs):
        start = time.time()
        ans = func(*args,**kwargs)
        end = time.time()
        print(end - start)
        return ans  
    return wapper

@timer
def loop(nums):
    for i in range(nums):
        pass
    print("over")
loop(55555555)
print(loop.__name__)
```
其输出结果如下
```shell
over
1.1916275024414062
loop
```
functools.warps(func)将原函数的__module__,\_\_name__,\_\_doc__,\_\_dict__等拷贝func中。
可以看到使用functools后\_\_name__信息变成了原函数的名字

## 带参数的装饰器
```python
import time
import functools
def timer_with_parm(name):
    def timer(func):
        @functools.wraps(func)
        def wapper(*args,**kwargs):
            print("this is:"+name)
            start = time.time()
            ans = func(*args,**kwargs)
            end = time.time()
            print(end - start)
            return ans
        return wapper
    return timer
@timer_with_parm("timer1")
def loop(nums):
    for i in range(nums):
        pass
    print("over")
loop(55555555)
print(loop.__name__)
```
其输出结果如下
```shell
this is:timer1
over
1.2349653244018555
loop
```
其调用方式拆分为如下几步
```python
timer = timer_with_parm("timer1")
wapper = timer(loop)
wapper(55555555)
```
可以看到decorator中的参数已经被传入了，且通过wapper函数输出了。

# 总结
python的装饰器实现了AOP模型，简化了代码


# 参考
[1][闭包wiki](https://en.wikipedia.org/wiki/Closure_(computer_programming))
[2][args和kwargs](https://stackoverflow.com/questions/36901/what-does-double-star-asterisk-and-star-asterisk-do-for-parameters)
[3][理解Python装饰器(Decorator)](https://www.jianshu.com/p/ee82b941772a)