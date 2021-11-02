---
layout: post
title: "毕业设计（二）darknet编译"
description: "使用vcpkg编译darknet"
date:  2021-03-05
author: "qxdn"
tags:
    - 机器学习
    - 毕业设计
    - yolo
    - darknet
categories: 机器学习
---


## 前言
寒假训练了4个版本的yolo，其中yolov4和yolov4-tiny是基于darknet的。由于都是在[colab](https://colab.research.google.com/notebooks/welcome.ipynb)上训练的，不好展示，所以打算在win10上跑一下，因此本文旨在win10编译darknet的踩坑记录。

## 安装Visual Studio
这个不用多说，安装2017或者2019版就行，需要开启英语语言

## 安装CUDA
参考上一篇安装CUDA就行，需要CUDAv10.0以上，并且安装时要点VS集成

## vcpkg安装
参考vcpkg的官方下载方式，`powershell`中执行如下命令
```powershell
git clone https://github.com/microsoft/vcpkg
cd vcpkg
bootstrap-vcpkg.bat
```
如果执行`bootstrap-vcpkg.bat`时，下载`vcpkg.exe`遇到网络问题，可以直接去`release`里面下载二进制文件

## vcpkg安装依赖
根据AlexeyAB的repo说明，`powershell`执行如下命令
```powershell
vcpkg install darknet[full]:x64-windows
```
### 遇到的问题

**事后得知，此处遇到的网络问题可以试一试校园网，校园网似乎对从外网下载文件有较好的效果**

安装opencv时，需要从`raw.githubusercontent.com`下载东西，然而遇到了host问题。首先尝试修改了host，结果遇到了`SSL connect error`问题，于是在加了几个host发现还是失败了。遂尝试使用VPN代理，按照输出将`HTTP_PROXY`和`HTTPS_PROXY`加入到环境变量，依然不行。尝试直接在powershell中使用变量。
```powershell
$env:HTTPS_PROXY="https://127.0.0.1:7890/"
$env:HTTP_PROXY="http://127.0.0.1:7890/"
```
此时的staus输出为
```powershell
 Failed. Status: 4;"A requested feature, protocol or option was not found built-in in this libcurl due to a build-time decision."

 Failed to download file.
 If you use a proxy, please set the HTTPS_PROXY and HTTP_PROXY environment variables to "https://user:password@your-proxy-ip-address:port/".

 If error with status 4 (Issue #15434),
 try setting "http://user:password@your-proxy-ip-address:port/".

 Otherwise, please submit an issue at https://github.com/Microsoft/vcpkg/issues

```
因此根据要求执行下面代码
```powershell
$env:HTTPS_PROXY="http://127.0.0.1:7890/"
```
此时重新执行安装命令，即可完成下载。

安装opencv时遇到
```
CMake Error at scripts/cmake/vcpkg_execute_build_process.cmake:144 (message):
    Command failed: C:/src/vcpkg/downloads/tools/cmake-3.19.2-windows/cmake-3.19.2-win32-x86/bin/cmake.exe --build . --config Debug --target install -- -v -j9
    Working Directory: C:/src/vcpkg/buildtrees/opencv4/x64-windows-dbg
    See logs for more information:
      C:\src\vcpkg\buildtrees\opencv4\install-x64-windows-dbg-out.log

Call Stack (most recent call first):
  scripts/cmake/vcpkg_build_cmake.cmake:96 (vcpkg_execute_build_process)
  scripts/cmake/vcpkg_install_cmake.cmake:27 (vcpkg_build_cmake)
  ports/opencv4/portfile.cmake:385 (vcpkg_install_cmake)
  scripts/ports.cmake:133 (include)
```
尝试如下指令
```powershell
vcpkg install darknet[opencv-base,cuda,cudnn]:x64-windows
```


## 编译darknet
提前安装[ninja](https://github.com/ninja-build/ninja)并添加到环境变量

修改`Makefile`
```Makefile
GPU=1
CUDNN=1
CUDNN_HALF=1
OPENCV=1

#我是gtx1050，根据makefile里面的注释自己的修改
ARCH= -gencode arch=compute_61,code=sm_61 -gencode arch=compute_61,code=compute_61 
```

按照AlexeyAB的repo，执行如下代码，注意CMake的版本，过低将无法编译。注意下面的顺序，如果有问题需要清理一下缓存，不然会一直编译失败
```powershell
$env:VCPKG_ROOT="vcpkg的位置"
git clone https://github.com/AlexeyAB/darknet
cd darknet
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

如果正确执行上述步骤的话，编译是不会出错的

## 测试darknet

### 原图
![origin](/images/GraduationProject/origin.jpg)

```powershell
darknet.exe detector test cfg/coco.data cfg/yolov4.cfg yolov4.weights origin.jpg  -thresh 0.25
```
### 输出
```
CUDA-version: 11000 (11000), cuDNN: 8.0.4, GPU count: 1  
 OpenCV version: 4.5.1
 0 : compute_capability = 610, cudnn_half = 0, GPU: GeForce GTX 1050 
net.optimized_memory = 0 
mini_batch = 1, batch = 8, time_steps = 1, train = 0
   layer   filters  size/strd(dil)      input                output
   0 Create CUDA-stream - 0
 Create cudnn-handle 0 
conv     32       3 x 3/ 1    608 x 608 x   3 ->  608 x 608 x  32 0.639 BF
   1 conv     64       3 x 3/ 2    608 x 608 x  32 ->  304 x 304 x  64 3.407 BF
   2 conv     64       1 x 1/ 1    304 x 304 x  64 ->  304 x 304 x  64 0.757 BF
   3 route  1                                      ->  304 x 304 x  64 
   4 conv     64       1 x 1/ 1    304 x 304 x  64 ->  304 x 304 x  64 0.757 BF
   5 conv     32       1 x 1/ 1    304 x 304 x  64 ->  304 x 304 x  32 0.379 BF
   6 conv     64       3 x 3/ 1    304 x 304 x  32 ->  304 x 304 x  64 3.407 BF
   7 Shortcut Layer: 4,  wt = 0, wn = 0, outputs: 304 x 304 x  64 0.006 BF
   8 conv     64       1 x 1/ 1    304 x 304 x  64 ->  304 x 304 x  64 0.757 BF
   9 route  8 2                                    ->  304 x 304 x 128 
  10 conv     64       1 x 1/ 1    304 x 304 x 128 ->  304 x 304 x  64 1.514 BF
  11 conv    128       3 x 3/ 2    304 x 304 x  64 ->  152 x 152 x 128 3.407 BF
  12 conv     64       1 x 1/ 1    152 x 152 x 128 ->  152 x 152 x  64 0.379 BF
  13 route  11                                     ->  152 x 152 x 128
  14 conv     64       1 x 1/ 1    152 x 152 x 128 ->  152 x 152 x  64 0.379 BF
  15 conv     64       1 x 1/ 1    152 x 152 x  64 ->  152 x 152 x  64 0.189 BF
  16 conv     64       3 x 3/ 1    152 x 152 x  64 ->  152 x 152 x  64 1.703 BF
  17 Shortcut Layer: 14,  wt = 0, wn = 0, outputs: 152 x 152 x  64 0.001 BF
  18 conv     64       1 x 1/ 1    152 x 152 x  64 ->  152 x 152 x  64 0.189 BF
  19 conv     64       3 x 3/ 1    152 x 152 x  64 ->  152 x 152 x  64 1.703 BF
  20 Shortcut Layer: 17,  wt = 0, wn = 0, outputs: 152 x 152 x  64 0.001 BF
  21 conv     64       1 x 1/ 1    152 x 152 x  64 ->  152 x 152 x  64 0.189 BF
  22 route  21 12                                  ->  152 x 152 x 128 
  23 conv    128       1 x 1/ 1    152 x 152 x 128 ->  152 x 152 x 128 0.757 BF
  24 conv    256       3 x 3/ 2    152 x 152 x 128 ->   76 x  76 x 256 3.407 BF
  25 conv    128       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 128 0.379 BF
  26 route  24                                     ->   76 x  76 x 256
  27 conv    128       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 128 0.379 BF
  28 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  29 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  30 Shortcut Layer: 27,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  31 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  32 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  33 Shortcut Layer: 30,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  34 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  35 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  36 Shortcut Layer: 33,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  37 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  38 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  39 Shortcut Layer: 36,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  40 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  41 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  42 Shortcut Layer: 39,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  43 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  44 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  45 Shortcut Layer: 42,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  46 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  47 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  48 Shortcut Layer: 45,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  49 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  50 conv    128       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 128 1.703 BF
  51 Shortcut Layer: 48,  wt = 0, wn = 0, outputs:  76 x  76 x 128 0.001 BF
  52 conv    128       1 x 1/ 1     76 x  76 x 128 ->   76 x  76 x 128 0.189 BF
  53 route  52 25                                  ->   76 x  76 x 256 
  54 conv    256       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 256 0.757 BF
  55 conv    512       3 x 3/ 2     76 x  76 x 256 ->   38 x  38 x 512 3.407 BF
  56 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
  57 route  55                                     ->   38 x  38 x 512
  58 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
  59 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  60 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  61 Shortcut Layer: 58,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  62 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  63 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  64 Shortcut Layer: 61,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  65 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  66 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  67 Shortcut Layer: 64,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  68 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  69 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  70 Shortcut Layer: 67,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  71 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  72 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  73 Shortcut Layer: 70,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  74 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  75 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  76 Shortcut Layer: 73,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  77 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  78 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  79 Shortcut Layer: 76,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  80 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  81 conv    256       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 256 1.703 BF
  82 Shortcut Layer: 79,  wt = 0, wn = 0, outputs:  38 x  38 x 256 0.000 BF
  83 conv    256       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 256 0.189 BF
  84 route  83 56                                  ->   38 x  38 x 512 
  85 conv    512       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 512 0.757 BF
  86 conv   1024       3 x 3/ 2     38 x  38 x 512 ->   19 x  19 x1024 3.407 BF
  87 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
  88 route  86                                     ->   19 x  19 x1024
  89 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
  90 conv    512       1 x 1/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.189 BF
  91 conv    512       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x 512 1.703 BF
  92 Shortcut Layer: 89,  wt = 0, wn = 0, outputs:  19 x  19 x 512 0.000 BF
  93 conv    512       1 x 1/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.189 BF
  94 conv    512       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x 512 1.703 BF
  95 Shortcut Layer: 92,  wt = 0, wn = 0, outputs:  19 x  19 x 512 0.000 BF
  96 conv    512       1 x 1/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.189 BF
  97 conv    512       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x 512 1.703 BF
  98 Shortcut Layer: 95,  wt = 0, wn = 0, outputs:  19 x  19 x 512 0.000 BF
  99 conv    512       1 x 1/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.189 BF
 100 conv    512       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x 512 1.703 BF
 101 Shortcut Layer: 98,  wt = 0, wn = 0, outputs:  19 x  19 x 512 0.000 BF
 102 conv    512       1 x 1/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.189 BF
 103 route  102 87                                 ->   19 x  19 x1024
 104 conv   1024       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x1024 0.757 BF
 105 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
 106 conv   1024       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x1024 3.407 BF
 107 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
 108 max                5x 5/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.005 BF
 109 route  107                                            ->   19 x  19 x 512
 110 max                9x 9/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.015 BF
 111 route  107                                            ->   19 x  19 x 512
 112 max               13x13/ 1     19 x  19 x 512 ->   19 x  19 x 512 0.031 BF
 113 route  112 110 108 107                        ->   19 x  19 x2048
 114 conv    512       1 x 1/ 1     19 x  19 x2048 ->   19 x  19 x 512 0.757 BF
 115 conv   1024       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x1024 3.407 BF
 116 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
 117 conv    256       1 x 1/ 1     19 x  19 x 512 ->   19 x  19 x 256 0.095 BF
 118 upsample                 2x    19 x  19 x 256 ->   38 x  38 x 256
 119 route  85                                     ->   38 x  38 x 512
 120 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 121 route  120 118                                ->   38 x  38 x 512 
 122 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 123 conv    512       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 512 3.407 BF
 124 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 125 conv    512       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 512 3.407 BF
 126 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 127 conv    128       1 x 1/ 1     38 x  38 x 256 ->   38 x  38 x 128 0.095 BF
 128 upsample                 2x    38 x  38 x 128 ->   76 x  76 x 128
 129 route  54                                     ->   76 x  76 x 256
 130 conv    128       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 128 0.379 BF
 131 route  130 128                                ->   76 x  76 x 256
 132 conv    128       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 128 0.379 BF
 133 conv    256       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 256 3.407 BF
 134 conv    128       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 128 0.379 BF
 135 conv    256       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 256 3.407 BF
 136 conv    128       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 128 0.379 BF
 137 conv    256       3 x 3/ 1     76 x  76 x 128 ->   76 x  76 x 256 3.407 BF
 138 conv    255       1 x 1/ 1     76 x  76 x 256 ->   76 x  76 x 255 0.754 BF
 139 yolo
[yolo] params: iou loss: ciou (4), iou_norm: 0.07, obj_norm: 1.00, cls_norm: 1.00, delta_norm: 1.00, scale_x_y: 1.20
nms_kind: greedynms (1), beta = 0.600000
 140 route  136                                            ->   76 x  76 x 128
 141 conv    256       3 x 3/ 2     76 x  76 x 128 ->   38 x  38 x 256 0.852 BF
 142 route  141 126                                ->   38 x  38 x 512 
 143 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 144 conv    512       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 512 3.407 BF
 145 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 146 conv    512       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 512 3.407 BF
 147 conv    256       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 256 0.379 BF
 148 conv    512       3 x 3/ 1     38 x  38 x 256 ->   38 x  38 x 512 3.407 BF
 149 conv    255       1 x 1/ 1     38 x  38 x 512 ->   38 x  38 x 255 0.377 BF
 150 yolo
[yolo] params: iou loss: ciou (4), iou_norm: 0.07, obj_norm: 1.00, cls_norm: 1.00, delta_norm: 1.00, scale_x_y: 1.10
nms_kind: greedynms (1), beta = 0.600000
 151 route  147                                            ->   38 x  38 x 256
 152 conv    512       3 x 3/ 2     38 x  38 x 256 ->   19 x  19 x 512 0.852 BF
 153 route  152 116                                ->   19 x  19 x1024
 154 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
 155 conv   1024       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x1024 3.407 BF
 156 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
 157 conv   1024       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x1024 3.407 BF
 158 conv    512       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 512 0.379 BF
 159 conv   1024       3 x 3/ 1     19 x  19 x 512 ->   19 x  19 x1024 3.407 BF
 160 conv    255       1 x 1/ 1     19 x  19 x1024 ->   19 x  19 x 255 0.189 BF
 161 yolo
[yolo] params: iou loss: ciou (4), iou_norm: 0.07, obj_norm: 1.00, cls_norm: 1.00, delta_norm: 1.00, scale_x_y: 1.05
nms_kind: greedynms (1), beta = 0.600000
Total BFLOPS 128.459
avg_outputs = 1068395
 Allocate additional workspace_size = 52.43 MB
Loading weights from yolov4.weights...
 seen 64, trained: 32032 K-images (500 Kilo-batches_64)
Done! Loaded 162 layers from weights-file 
 Detection layer: 139 - type = 28 
 Detection layer: 150 - type = 28 
 Detection layer: 161 - type = 28
origin.jpg: Predicted in 184.923000 milli-seconds.
person: 98%
car: 94%
truck: 31%
car: 88%
car: 99%
person: 99%
person: 37%
car: 99%
bus: 57%
truck: 60%
car: 99%
```
### 结果
可以看到预测结果，同时darknet里面也输出了GPU的信息
![predictions](/images/GraduationProject/predictions.jpg)

## 结论
win10版本的darknet gpu版本安装完成。道路坎坷，记录下踩过的坑
