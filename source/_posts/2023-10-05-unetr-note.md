---
title: UNETR论文笔记
tags:
  - 机器学习
categories: 机器学习
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.7/cover.jpg'
description: 最近做的网络里面用了UNETR，而且好久前看过但是一直没写，所以这次就来写一下笔记
date: 2023-10-05 01:30:30
---

> 封面《殻ノ少女》

# 前言
最近读了UNETR的论文，需要了解这个模型，因此就记录一下学习笔记。UNETR是一种将UNet和Transformer结合的网络结构，可以用于图像分割任务。

# 结构
传统CNN网络在分割领域有了很大的成功，但是CNN因其结构原因在全局特征信息和长范围空间依赖性上表现较差，这对分割结果有很大的影响。

Transformer因其attention机制，在全局特征方面有很好的表现，因此UNETR提出了一种新的网络结构，将UNet和Transformer结合，如下图所示。
其相对其他以往的分割网络有一下特征
- 直接为3D分割量身定制，直接使用体积数据
- 直接将transformer作为网络的编码器，而非使用其作为网络中的attention层。所有ViT中间层的输出大小都是一样的
- 不依赖CNN backbone生成输入序列，而是直接使用tokenized patch

![UNETR](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.7/UNETR.png)

在backbone方面完全采用了ViT的结构，其结构与Transformer一样，patch embedding采用了卷积网络结构，patch size和stride size都为16，并将大小为$(N,C,H,W,D)$的图像转换为$(N,L,C)$，其中$L=\frac{H}{4} × \frac{W}{4} × \frac{D}{4}$

在特征金字塔的路径上先将ViT中3、6、9、12层的输出从$(N,L,C)$ reshape成$(N,C,\frac{H}{16},\frac{W}{16},\frac{D}{16})$再进行反卷积上采样，对于下方的特征则是直接反卷积上采样，两者特征直接拼接再卷积提取特征。

# 损失函数
损失函数方面采用soff dice loss + CE loss，其定义如下
$$
 L(G,Y) = 1 - \frac{2}{J} \Sigma_{j=1}^J \frac{\Sigma_{i=1}^I G_{i,j}Y_{i,j} }{\Sigma_{i=1}^I G_{i,j} + \Sigma_{i=1}^I Y_{i,j}} 
 - \frac{1}{I} \Sigma_{i=1}^I \Sigma_{j=1}^J G_{i,j}log(Y_{i,j})
$$
其中$I$是体素数量，$J$是类别数量，$G$是ground truth，$Y$是预测值。

# 后记
笔者在[ISLES2022](http://www.isles-challenge.org/)数据集上以输入大小(2,96,96,96)，优化器为adamw，损失函数为dice loss的情况下训练了UNETR，是目前各个网络这效果最好的，其dice系数在79.9%。但是由于使用了transformer其计算量和显存开销依然不可忽视。

# 参考文献
[UNETR](https://arxiv.org/abs/2103.10504)

[ISLES](http://www.isles-challenge.org/)