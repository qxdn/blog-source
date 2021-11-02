---
layout: post
title: "毕业设计（一）环境搭建"
description: "安装CUDA cuDNN pytorch"
date:  2021-01-19
author: "qxdn"
tags:
    - 机器学习
    - 毕业设计
    - yolo
categories: 机器学习
---


## 前言
体验过CPU和GPU速度之后，就不会再想使用CPU版本的机器学习框架进行训练。

## 安装CUDA
第一步就是要完成cuda的安装，进入`NIVIDA控制面板`->`系统信息`->`组件`，查看`3D设置`中的`NVCUDA64.DLL`，这里显示的就是当前显卡驱动所支持的CUDA信息，所要安装的CUDA版本不得大于这里显示的版本。然后前往[CUDA官网](https://developer.nvidia.com/zh-cn/cuda-downloads)下载CUDA。建议在下载之前先去其他一些网址看一下支持的CUDA版本，以免到时候重新安装

- [tensorflow](https://tensorflow.google.cn/install/source_windows) (换成English可以看最新支持)
- [pytorch](https://pytorch.org/get-started/locally/)

![GPU信息](/images/GraduationProject/GPUInfo.png)

如果发现自己安装的版本没有已经构建好的版本还有两种方法。
- 自行从源码编译，这点不推荐，想起来我之间自己在树莓派上面编译opencv的经历颜文字(ಥ _ ಥ)，强烈不推荐。
- 卸载重装CUDA

重装CUDA比较简单,见下图中的NVIDIA应用除了`NVIDIA的图形驱动程序`和`NVIDIA Physx系统软件`都卸载就行。如果下不动的就使用迅雷11，新版迅雷配合网盘简直神一般的体验。

![GPU信息](/images/GraduationProject/uninstall.png)


安装完成后可以在命令行里面使用`nvcc -V`看看结果。

## cuDNN安装
cuDNN安装比较简单，首先进入[官网](https://developer.nvidia.com/rdp/cudnn-archive)，选择你安装的CUDA的对应版本即可。下载也需要进行注册，填一个调查问卷，但是因为我实在进不去，就使用迅雷接管下载链接之间下载。将解压后的`bin`、`include`、`lib`三个文件复制进入`C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.0`即可。我安装的版本是`8.0.4`


## pytorch安装
听闻pytorch容易调试，且搭建网络比较快，而我此前只是用过tensorflow2.0中的keras进行过搭建，因此本次毕设初步打算使用pytorch作为工具，也可能不用呢(￣y▽,￣)╭ 。使用pytorch推荐的conda安装方法

```bash
conda install pytorch torchvision torchaudio cudatoolkit=11.0 -c pytorch
```

这里我是使用清华镜像源的，是否要加`-c pytorch`还是看你的`.condarc`怎么写的，如果写了`custom_channels`且里面的`pytorch`也是用了清华源的可以加，没有的话就去掉`-c pytorch`，然而我镜像源也下不了（吐了），发现浏览器也下不了，就只能用迅雷接管下载，然后本地安装。
```bash
#本地安装
conda install --use-local cudatoolkit-11.0.221-h74a9793_0.conda
conda install --use-local pytorch-1.7.1-py3.8_cuda110_cudnn8_0.tar.bz2
```
然后进行测试
![verify](/images/GraduationProject/verify.png)

## 后记
环境的搭建就到此为止，安装并不难，只是我没想到我尽然会连镜像源都下不动😩。后续视情况可能会使用GPU服务器，但是现在先在本地收集数据集和预先学习。
