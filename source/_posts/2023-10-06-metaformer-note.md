---
title: metaformer论文笔记
tags:
  - 机器学习
categories: 机器学习
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.8/cover.png'
description: 最近使用了metaformer，因此记录一下论文笔记
date: 2023-10-06 03:07:20
---


> 封面 《天結いキャッスルマイスター》

# 前言

因为最近的用的网络里面采用了 Metaformer 作为 backbone，因此读一下 Metaformer 的论文，顺便记录一下。

# 结构

Transformer block 一般由两部分组成，一个是令牌混合器（token mixer），另一个是融合通道信息的（channel mlp）。一个普遍的观点是，attention 机制在 transformer 中共享最大，但是最近的工作表明将 attention 换成 Spatial MLP 后模型的表现仍然良好。基于这个观察 Metaformer 的作者提出了 Metaformer，将 transformer 中的 token mixer 换成其他模块，其认为 transformer 的宏观设计比 token mixer 更为重要。

metaformer 的结构如下，其一共有 4 种 former，分别为 IdentityFormer，RandFormer,ConvFormer,TransFormer。
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.8/metaformer.png)

Metaformer block 的公式总结如下

$$
X' = X + TokenMixer(Norm_1(X)) \\

X'' = X' + \sigma(Norm_2(X')W_1)W_2
$$

其中$Norm_1$和$Norm_2$为正则化，TokenMixer 为 metaformer 的令牌混合器，$\sigma$为激活函数$W_1$和$W_2$为 channel MLP 的可学习参数

## IdentityFormer

IdentityFormer 中给 IdentityMapping 就是直接进行恒等映射

$$
IdentityMapping(X) = X
$$

## RandomFormer

$$
RandomMixing(X) = XW_R
$$

其中 $X \in R^{N \times C}$ 是输入序列长度为 N，通道数为 C，$W_R \in R^{N \times N}$，为一个矩阵，其在随机初始化后冻结不可训练

## ConvFormer
卷积采用mobileNetV2的结构中翻转可分离卷积的设计，采用pointwise卷积和depthwise卷积的结构，其公式如下
$$
{Convolutions(X)} = {Conv_{pw2}}( {Conv_{dw}}(\sigma ({Conv_{pw1}}(X))))
$$

## CAFormer
CAFormer如上图所示，即backbone的部分为convformer，部分为transformer。


# StarRELU激活函数
## ReLU
在大多transformer中使用ReLU激活函数,每个ReLU消耗1FLOP计算单元
$$
ReLU(x) = max(0,x)
$$

## GELU
而GPT、Bert和ViT等网络默认使用GELU激活函数，其计算公式如下
$$
GELU(x) = x\Phi(x) \approx 0.5 \times x(1 + \tanh(\sqrt{\frac{2}{\pi}}(x + 0.044715x^3)))
$$

其中$\Phi(x)$为高斯分布的累积分布函数(Cumulative Distribution Function for Gaussian Distribution ,CDFGD)，每个计算单元消耗14FLOPS,tanh简单视作消耗6个FLOPS，乘加算一个

## SquaredReLU
为了简化GELU，作者发现可以将CDFGD替换为ReLU，,每个计算单元消耗2FLOPS
$$
SquaredReLU(x) = xReLU(x) = (ReLU(x))^2
$$

## StarReLU
作者发现SquaredReLU的性能在某些任务不太行，其假设输入性能差是输出的分布变化导致，假设输入遵循均值为0，方差为1的高斯分布，即$x \sim N(0,1)$，此时我们有
$$
E(x^2) = Var(x) = 1 \\
E((ReLU(x))^2) = \frac{1}{2}E(x^2) = 0.5 \\
E(x^4) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{+\infty} z^4exp(-\frac{z^2}{2})dz  \\
     =  -\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{+\infty} z^3d(exp(-\frac{z^2}{2})) \\
  = (-z^3\frac{1}{\sqrt{2\pi}}exp(-\frac{z^2}{2}))|_{-\infty}^{+\infty} + 3\int_{-\infty}^{+\infty}  z^2\frac{1}{\sqrt{2\pi}}exp(-\frac{z^2}{2})dz \\
  = 0 + 3E(x^2) = 3 \\
E((ReLU(x))^4) = \frac{1}{2}E(x^4) = 1.5 \\
Var((ReLU(x))^2) = E((ReLU(x))^4) - E((ReLU(x))^2)^2 = 1.5 - 0.5^2 = 1.25
$$
为了消除偏差影响，采用减去均值除以方差的形式，公式如下
$$
StarReLU(x) = \frac{(ReLU(x))^2 - E((ReLU(x))^2)}{\sqrt{Var((ReLU(x))^2)}} = \frac{(ReLU(x))^2 - 0.5}{\sqrt{1.25}} \\
\approx  0.8944(ReLU(x))^2 - 0.4472
$$
作者假定输入成高斯分布，为了适应不同情况，将将其改为可学习的缩放和偏移参数，公式如下，这样只消耗4个FLOPS
$$
StarReLU(x) = s \cdot (ReLU(x))^2 + \beta
$$

# 总结
本篇论文认为transformer的宏观设计比token mixer更为重要，在将token mixer换成pooling，identity，conv等操作后，模型的表现依然良好。并且提出了一种新的激活函数StarReLU，其消耗的FLOPS更少。

笔者在自己的数据集上尝试使用metaformer，其参数量比UNETR少，且效果接近UNETR。

# 参考文献

[MetaFormer Is Actually What You Need for Vision](https://arxiv.org/abs/2111.11418)

[MetaFormer Baselines for Vision](https://arxiv.org/abs/2210.13452)
