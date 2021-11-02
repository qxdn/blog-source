---
title: MinGW编译C++无法输出string
tags:
  - C++
top_img: /images/mingw64problem/top_img.png
cover: /images/mingw64problem/top_img.png
categories: C++
date: 2021-03-19 14:26:06
description: 记录MinGW的一个问题
---


在调试程序的时候遇到了一个奇葩的问题，C++无法使用string。最后发现居然是MinGW64的问题
<!--more-->

# 起因

在帮助别人调试[vscode-debug-visualizer](https://github.com/hediet/vscode-debug-visualizer)这个插件的时候，遇到了无法出结果的问题。经过一系列定位后发现，居然是使用了string就无法运行，而编译不会出错。

# 测试程序
```c++
//main.c
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main()
{
    // visualize `myGraphJson`!
    string myGraphJson = "{\"kind\":{\"graph\":true},"
        "\"nodes\":[{\"id\":\"1\"},{\"id\":\"2\"}],"
        "\"edges\":[{\"from\":\"1\",\"to\":\"2\"}]}";
    cout << myGraphJson;
}
```

# 错误现象
使用编译指令如下
```powershell
g++ -g main.c -o main.exe
```
结果正常，运行
```
.\main.exe
```
输出为空

使用gdb进行debug。错误如下
```powershell
ERROR: Unable to start debugging. Unexpected GDB output from command "-exec-run". During startup program exited with code 0xc0000139.
```

# 解决方案
在[stackoverflow](https://stackoverflow.com/questions/18668003/the-procedure-entry-point-gxx-personality-v0-could-not-be-located)上找到解决方案。

从`MinGW`的安装目录里面找到`bin`文件夹。将里面的`libstdc++-6.dll`拷贝到工作目录。目录结构如下
```
+ .vscode
    launch.json
    tasks.json
libstdc++-6.dll
main.cpp
```

再次进行编译、运行
```powershell
g++ -g main.c -o main.exe
.\main.exe
```
输出
```powershell
{"kind":{"graph":true},"nodes":[{"id":"1"},{"id":"2"}],"edges":[{"from":"1","to":"2"}]}
```
gdb的debug结果正常

# 吐槽
这个问题在7年前就被提出了，居然现在还有。MinGW真是坑啊，用了环境变量也没用。

