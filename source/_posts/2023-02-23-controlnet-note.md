---
title: ControlNet论文笔记
tags:
  - 机器学习
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.5/cover.png
categories: 机器学习
description: 因为有点兴趣就读了一下ControlNet论文笔记
date: 2023-02-23 02:07:36
---


> 封面 《紅月ゆれる恋あかり》

# 前言
最近读了ControlNet的论文，觉得还挺有趣就写一下笔记吧。在以往的AI绘画中我们通常使用输入prompt来生成我们图像，这里会有一个问题就是使用prompt通常不能完美的满足我们的需要，如何实现对绘图的控制，这就是ControlNet做的事情。

# 结构
ControlNet是一种网络结构，可以增强特定任务下的预训练模型。ControlNet对神经网络块中的输入条件进行操作从而控制整个神经网络，这里网络块指的是resnet块、CBN块、多头注意力块、transformer块等常用于搭建神经网络的层。其结构如下图所示。

![block](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.5/block.png)

ControlNet锁住原始网络的参数$\Theta$，并且拷贝了一份可以训练的参数$\Theta_c$，除此以外还有额外的条件向量$c$。采用拷贝而不是直接训练原始权重是为了避免数据集过小的时候过拟合并且保留从数十亿张图像中训练到的大型模型的质量。

神经网络块和ControlNet之间是通过零卷积（zero
convolution）进行连接，零卷积即1*1大小的卷积，其权重和偏差都被初始化为0。这么设置使得一开始即使ControlNet不进行训练，ControlNet部分的输入和输出都为0加到原始网络里面也不会对原始网络有任何影响。公式推导如下：

假定原始的神经网络，其中一层的定义如下，其中$y$为该层的输出，$x$为该层的输入，$\Theta$为该层的参数,$F(x;\Theta)$表示该层的映射。
$$
y=F(x;\Theta)
$$
加入ControlNet后一层的表示方式如下，其中$y_c$为新的输出，$Z(x;\theta)$为零卷积映射，$\theta_{z_1}$和$\theta_{z_2}$为两个零卷积的参数,$\theta_c$为原始网络的权重复制。
$$
y_c = F(x;\Theta) + Z(F(x+Z(c;\theta_{z_1});\theta_c);\theta_{z_2})
$$
当训练刚开始时，由于零卷积的效果公式会有下面的效果
$$
\begin{cases}
Z(c;\theta_{z_1}) = 0 \\
F(x+Z(c;\theta_{z_1});\theta_c) = F(x;\theta_c) = F(x;\theta) \\
Z(F(x+Z(c;\theta_{z_1});\theta_c);\theta_{z_2}) = Z(F(x;\theta_c);\theta_{z_2}) = 0
\end{cases}
$$
因此在最开始的时候ControlNet就有原始网络的效果，后面就是在优化条件。

## 零卷积是怎么学习的
当一个卷积权重为0，输入的梯度也会是0，那么这个网络能学到参数吗？
假设有如下公式
$$
y = wx + b
$$
此时梯度计算如下
$$
\frac{\partial y}{\partial w}  = x 
\frac{\partial y}{\partial x}  = w 
\frac{\partial y}{\partial b}  = 1 
$$
当$w=0 x \ne 0$时，梯度如下
$$
\frac{\partial y}{\partial w}  \ne 0 
\frac{\partial y}{\partial x}  = 0 
\frac{\partial y}{\partial b}  \ne 0 
$$
因此只要一次梯度计算中$x$不为0，那么$w$的梯度就不为0，使得更新后的权重$w$不为0，使得后续$x$的梯度不为0，网络开始学习

# 整体结构
在Image2Image上ControlNet对Stable Diffusion的修改如下
![ControlNet](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.5/ControlNet.png)

# 训练
在ControlNet训练过程中，随机将50%的prompts替换成了空字符串，这有助于ControlNet从输入的条件向量中识别语义信息，这主要因为当prompt对SD Model不可见时，encoder倾向于从输入的条件向量中学习更多语义以替代prompt。

## 小规模训练
当计算量有限的时候，可以通过选择性的断开ControlNet和SD Model的部分连接加速训练，默认的模型如上所示，ControlNet和SD Middle Block、SD Decoder Block 1,2,3,4相连接，当与SD Decoder Block 1,2,3,4的连接断开时可以在3070TI的笔记本上提升1.6倍速度，当输出结构和条件之间有关联时可以将这些连接重新关联。

## 大规模训练
当计算量和数据集较大时，过拟合的风险较低，可以先训练ControlNet到足够的迭代次数，然后解锁stable diffusion的全部权重共同训练。

# 条件变量
官方给的条件变量有Canny算子计算的原图边缘、霍夫变换计算的、姿态检测得到的还有用户涂鸦线稿，主要都是生成了一个条件，后续stable diffusion生成的图片都与条件有一定的相似度。

# 参考文献
[Adding Conditional Control to Text-to-Image Diffusion Models](https://arxiv.org/abs/2302.05543)

[ControlNet](https://github.com/lllyasviel/ControlNet)
