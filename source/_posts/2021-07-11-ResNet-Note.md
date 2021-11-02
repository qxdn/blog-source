---
title: ResNet论文笔记
tags:
  - 机器学习
categories: 机器学习
top_img: /images/ResNet-Note/top_img.png
cover: /images/ResNet-Note/top_img.png
date: 2021-07-11 18:07:44
description: ResNet的论文笔记
---


ResNet是解决了深度学习网络中随着网络深化，网络能力反而退化的问题。
封面《恋×シンアイ彼女》
<!--more-->

# 前言
卷积神经网络中网络的深度是非常关键的，许多非凡的视觉识别任务都收益于非常深的模型。因此便有一个问题“学习更好的网络是否就像堆叠更多的层一样简单？”回答这个问题的其中一个臭名昭著的障碍就是“梯度消失/爆炸”，其阻碍了网络收敛。然而这个问题被通过初始归一化和中间层归一化解决了。
当更深的网络能够收敛的时候，网络退化的问题出现了。随着网络深度的增加，准确率达到饱和然后迅速下降。让人意外的是这种退化并不是由过拟合导致的，随着层数的不断增加，模型反而有了更高的训练误差。

![](/images/ResNet-Note/fig1.png)

# 正文
为了解决退化问题，何凯明团队提出了一种新型网络结构——残差结构。其结构如下图所示，新增加的层为恒等映射层，另一个为从浅层学习结果的复制。原本底层的输出变成了$H(x)$，增加的非线性连接去拟合$F(x):=H(x)-x$，原始的映射重构成了$F(x)+x$。何凯明团队假定残差部分比原本映射更容易优化。如果恒等映射是最优的，那么只需要讲残差部分置0即可，这比拟合非线性层更容易。
![](/images/ResNet-Note/res_block.png)
$F(x)+x$可以通过前向神经网络加上“短路“（shortcut）来实现，无需额外参数和计算复杂度，依然可以用SGD来优化。

# 网络结构
## plain network
受到VGG启发，何凯明团队基于以下原则设计了一种新的结构plain-network作为测试的基准线
- 输出大小一样的层拥有一样的卷积核数
- 特征图变成原来一半的时候输出的卷积核翻倍
同时使用步长为2的卷积替代下采样，使用全局平均池化和带有softmax的1000输出全连接作为输出。该结构比VGG花费更少的卷积核，复杂度更低。计算量为3.6 BFLOPs（乘加），只有原本VGG的18%。
![](/images/ResNet-Note/architectures.png)

## residual network
plain network的残差版，对于输入输出维度相等时直接”短路“即可，即上图中的实线。对于维度上升的，图中虚线部分，则有两种方案：
1. 短路部分依然使用恒等映射，维度增加的部分补0填充，这样不会引入新的参数
2. 使用公式$y=F(x,{W_i})+W_sx$匹配维度，使用1×1卷积实现。
对于两种实现方案，连接不同大小的特征图时，都需要步长为2。

![](/images/ResNet-Note/table1.png)
表一为其结构的各种变种。

# 实验
![](/images/ResNet-Note/fig4.png)
![top1-error](/images/ResNet-Note/top1-error.png)

# 更深的瓶颈结构
为了减少深层网络的训练时间，作者重新设计了一种瓶颈结构，如下图所示。使用1×1，3×3，1×1卷积替换原来的2层卷积。其中1×1的卷积用于升降维，使得3×3卷积的输入维度和输出维度减小，这降低了网络复杂度和计算量。（在后续一些网络如YOLO中都能看到bottleneck结构）
![](/images/ResNet-Note/bottleneck.png)

# 小结
ResNet中的残差结构解决了网络退化问题，且结构简单，现实方便也没有增加太多的计算量。在后续的网络中几乎全都有残差结构，而且网络深度也开始到了上百层,训练时也更容易OOM了（哭）。

# 参考文献
[1] He K, Zhang X, Ren S, et al. Deep residual learning for image recognition[C]//Proceedings of the IEEE conference on computer vision and pattern recognition. 2016: 770-778.
