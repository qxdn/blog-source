---
title: MobileNets论文笔记
tags:
  - 机器学习
top_img: https://cdn.jsdelivr.net/gh/qxdn/qxdn.github.io@latest/source/images/mobilenets-note/top_img.jpg
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn.github.io@latest/source/images/mobilenets-note/top_img.jpg
catagories: 机器学习
date: 2021-05-20 16:45:44
---


因为听说了MobileNets中的深度可分离卷积的大名，因此拜读了一下论文
<!--more-->

# 引言
&emsp;&emsp;在许多嵌入式设备上，受限于有限的计算资源，往往无法跑一些效果较好的大模型。在MobileNet以前，许多论文都是集中于减少模型体积，而不是速度。
&emsp;&emsp;MobileNets是基于深度可分离卷积(depthwise separable convolutions)，这在Inception Model、Falattened networks中都有提到。降低模型体积的方法有剪枝、压缩、哈希、霍夫曼编码和蒸馏等等。

# 创新点
&emsp;&emsp;MobileNet提出了一种深度可分离卷积结构，将标准卷积分为了深度卷积(depthwise convolution)和逐点卷积(pointwise convolution)两步。传统标准卷积往往在进行计算的时候会同时改变通道数和特征图的大小。而深度可分离卷积的第一步深度卷积则是不改变输出的通道数，只改变特征图的大小，第二步逐点卷积则是以1*1大小的卷积核对特征图做处理，只改变输出的通道数不改变特征图的大小。

# 计算量对比
&emsp;&emsp;假定卷积的输入为$D_F*D_F*M$的特征图，输出为$D_F*D_F*N$的特征图。$D_F$为特征图的长宽，$M$为特征图的通道数，$N$为输出的通道数。
&emsp;&emsp;传统卷积需要一个大小为$M*D_K*D_K*N$的卷积核，$D_K$为其内核大小，$M$为输入通道数，$N$为输出通道数。则其计算量如下。
$$D_K*D_K*M*N*D_F*D_F$$
&emsp;&emsp;对于深度可分离卷积来说需要一个$M*D_K*D_K*1$的深度卷积核核一个$M*1*1*N$的逐点卷积核。其计算量如下，式子左边为深度卷积的计算量，右边为逐点卷积的计算量。
$$D_K*D_K*M*D_F*D_F+D_F*D_F*M*N$$
&emsp;&emsp;经过对比可以得知其压缩量如下。
$$
\frac{D_K*D_K*M*D_F*D_F+D_F*D_F*M*N}{D_K*D_K*M*N*D_F*D_F} = \frac{1}{N}+\frac{1}{D_K^2}  
$$
&emsp;&emsp;由于神经网络中经常使用3*3的卷积核，因此可以减少大约8到9倍的计算量。
![标准卷积核深度可分离卷积结构对比](/images/mobilenets-note/DW_CONV.png)

# 实验结果
这一部分有大量的对比实验详细可以看[原文](https://arxiv.org/abs/1704.04861)。使用全卷积和深度可分离卷积的MobileNet对比如下图，准确率下降了1%，计算量下降到了原来的11%，参数量下降到了4.2%。![全卷积和深度可分离卷积MobileNet对比](/images/mobilenets-note/compare.png)

# 总结
&emsp;&emsp;深度可分离卷积只是一种轻量级的网络结果，不是模型压缩方法。但是其降低计算量的效果的理论支持合理有据，虽然个人觉得准确率部分可能有点点夸张，需要后续自行实验验证一下。

# 参考文献
[1]Howard A G, Zhu M, Chen B, et al. Mobilenets: Efficient convolutional neural networks for mobile vision applications[J]. arXiv preprint arXiv:1704.04861, 2017.