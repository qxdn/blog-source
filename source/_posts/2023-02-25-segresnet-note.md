---
title: SegResNet论文笔记
tags:
  - 机器学习
categories: 机器学习
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.6/cover.png
description: >-
  最近读了《Automated head and neck tumor segmentation from 3D PET/CT HECKTOR 2022
  challenge
  report》这篇论文，里面提到使用的autosegresnet是使用的segresnet作为backbone。因此来读一下segresnet的论文
date: 2023-02-25 18:11:32
---


> 封面《AMBITIOUS MISSION》

# 前言
最近读了《Automated head and neck tumor segmentation from 3D PET/CT HECKTOR 2022 challenge report》这篇论文，里面提到使用的autosegresnet是使用的segresnet作为backbone。因此来读一下SegResNet的论文。这里的SegResNet是monai项目中的叫法，monai是一个用于医疗影像的库，该网络的api文档在[这](https://docs.monai.io/en/stable/networks.html#segresnet)源码在[这](https://docs.monai.io/en/stable/_modules/monai/networks/nets/segresnet.html)。比较简单易懂的源码在这[github](https://github.com/IAmSuyogJadhav/3d-mri-brain-tumor-segmentation-using-autoencoder-regularization)

# 网络结构
![网络结构](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.6/SegResNet.png)
SegResNet的网络结构如上图所示，采用CNN的encoder-decoder结构，encoder来提取图像特征，decoder来重构分割结果，此外还引入了VAE结构来恢复原始图像，VAE部分只在训练期间训练encoder。其中绿色的部分是一个类似于ResNet的部分，其中由GN-RELU-CONV3x3x3-GN-RELU-CONV3x3x3组成。

## encoder
encoder部分中，每个res block由2组conv、norm和relu组成，norm部分采用Group Norm，在Batch较小的时候效果比Batch Norm效果好，encoder部分中和CNN类似，每次下采样的时候通道数翻一倍。卷积的初始通道数为32，总共下采样8倍。

## decoder
decoder部分与encoder部分类似，但是每层只有一个block。上采样采用1x1x1大小的卷积输出通道数减半，和3D双线性上采样再加上同层的encoder的输出。最后一层的卷积采用1x1x1的卷积，输出通道数为分割的类别，激活函数使用sigmoid。

## VAE
SegResNet的输入大小为4x160x192x128，其中encoder部分的输出为256x20x24x16，这里SegResNet采用了VAE结构。VAE的结构和内容下次再讲，这里需要知道的是VAE需要通过训练获取均值向量mean和方差向量std，然后通过重参化进行采样，避免直接采样使得网络不可导。
$$
Z = mean + \varepsilon \times std \qquad   \varepsilon \sim \mathcal{N}(0, 1)   
$$
SegResNet中将输出的256通道拆分为2个128通道分别作为均值和方差。结构类似于decoder部分，但是不使用encoder部分的输出。

# loss
SegResNet的Loss包含3部分，公式如下
$$
L = L_{dice} + 0.1 * L_{L_2} + 0.1 * L_{KL} 
$$

## dice loss
dice loss用于decoder部分输出和gt之间的比较，原始是分割3个类，这里每个分割类别都算了一个dice loss

## l2 loss
l2 loss用于计算VAE部分重构输出和原始图像之间的loss

## kl loss
这是来自于VAE部分的loss，在这计算公式如下
$$
L_{KL} = 1 \frac{1}{\sum \mu^2 + \sigma^2 - log\sigma^2 - 1 }
$$

# 后记
个人看来在SegResNet中采用VAE作为其中是很有创新意义，采用原始数据来协调训练encoder部分，提高了网络性能。

# 参考文献
[Automated head and neck tumor segmentation from 3D PET/CT HECKTOR 2022 challenge report](https://arxiv.org/abs/2209.10809)

[3D MRI brain tumor segmentation using autoencoder regularization](https://arxiv.org/abs/1810.11654)

[monai](https://docs.monai.io/en/stable/index.html)

[SegResNet](https://docs.monai.io/en/stable/networks.html#segresnet)

[3D MRI Brain Tumor Segmentation Using Autoencoder Regularization (Github)](https://github.com/IAmSuyogJadhav/3d-mri-brain-tumor-segmentation-using-autoencoder-regularization)