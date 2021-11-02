---
title: 安装tensorflow-gpu版本
tags:
  - 机器学习
top_img: /images/install-tensotflow-gpu/top-img.png
cover: /images/install-tensotflow-gpu/top-img.png
categories: 机器学习
date: 2021-03-26 17:42:15
description: 对于个人而言，还是比较习惯使用tensorflow的keras
---


对于个人而言，还是比较习惯使用tensorflow的keras
<!--more-->

# 安装cuda和cudnn
安装方法可以见[pytorch的安装](https://qianxu.run/2021/01/18/installpytorch/)，对于tensorflow已有的gpu支持可以见[此](https://tensorflow.google.cn/install/source_windows#gpu)。不提前装cuda和cudnn的方法见[使用conda安装cuda和cudnn](#使用conda安装cuda和cudnn)


# 安装tensorflow-gpu
由于我刚好符合`tensorflow-gpu 2.4.0`，而`conda`还没有这个包，因此使用`pip`进行安装

```python
pip install tensorflow-gpu==2.4.0 -i https://pypi.tuna.tsinghua.edu.cn/simple
```
镜像源可能下载速度还是不行，可以直接本地安装

# 验证gpu
运行代码
```python
import tensorflow as tf

print(tf.__version__)
print(tf.config.list_physical_devices())
```
输出结果如下
```powershell
2021-03-26 17:00:35.277510: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cudart64_110.dll2.4.0
2021-03-26 17:00:39.259583: I tensorflow/compiler/jit/xla_cpu_device.cc:41] Not creating XLA devices, tf_xla_enable_xla_devices not set
2021-03-26 17:00:39.261539: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library nvcuda.dll      
2021-03-26 17:00:39.307535: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1720] Found device 0 with properties: 
pciBusID: 0000:01:00.0 name: GeForce GTX 1050 computeCapability: 6.1
coreClock: 1.493GHz coreCount: 5 deviceMemorySize: 2.00GiB deviceMemoryBandwidth: 104.43GiB/s
2021-03-26 17:00:39.308404: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cudart64_110.dll2021-03-26 17:00:39.322068: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cublas64_11.dll 
2021-03-26 17:00:39.322414: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cublasLt64_11.dll
2021-03-26 17:00:39.329903: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cufft64_10.dll  
2021-03-26 17:00:39.332538: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library curand64_10.dll 
2021-03-26 17:00:39.347776: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cusolver64_10.dll
2021-03-26 17:00:39.357722: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cusparse64_11.dll
2021-03-26 17:00:39.362238: I tensorflow/stream_executor/platform/default/dso_loader.cc:49] Successfully opened dynamic library cudnn64_8.dll   
2021-03-26 17:00:39.362701: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1862] Adding visible gpu devices: 0
[PhysicalDevice(name='/physical_device:CPU:0', device_type='CPU'), PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
```

# 使用conda安装cuda和cudnn 
事实上使用conda的时候不提前装cuda和cudnn也是可以的。
执行以下代码即可。注意对比tensorflow的gpu支持版本，见[此](https://tensorflow.google.cn/install/source_windows#gpu)
```python
conda install cudatoolkit=10.1 cudnn=7.6.5
```
