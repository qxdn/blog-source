---
title: ConvNeXt论文笔记
tags:
  - python
  - 机器学习
categories: 机器学习
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/cover.png'
description: 年初的时候看来ConvNeXt的论文，一直想写一篇笔记，但是总是没有时间来写。现在有空可以写一下。
date: 2022-08-03 03:23:18
---


> 封面 《紅月ゆれる恋あかり》

# 前言
年初的时候看到别人推荐了ConvNeXt论文，看到了下面这张图，了解到了ConvNeXt比Swin Transformer效果好，因此读了一下这篇论文，写一下笔记。

![效果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/compare.png)

# ConvNeXt的改进点

![总体改进](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/Improve.png)

ConvNeXt的总体改进如上所示，各个改进和其效果都可以看的比较明白

## Macro Design
### Changing stage compute ratio
在原先的ResNet中各个stage之间的比例是(3:4:6:4)，而在swin transformer中这个比例是(1:1:3:1)在large模型中这个比例是(1:1:9:1)，因此作者将ResNet各个阶段的比例设置为(3:3:9:3)，准确率从78.8%上升到了79.4%。此外作者还表示这个比例还有优化空间

### Changing stem to “Patchify”
什么是stem？stem简单来说就说第一个下采样，主要的功能是压缩输入，减少计算量
![stem](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/stem.png)
在原本的ResNet中，stem层使用的是卷积核大小为7×7，stride=2的卷积核，其结果就是4倍的下采样。而在vit模型中，stem层用的是更加激进的卷积，卷积大小是14或者16，且移动没有重叠的。而在swin中stem使用的是相似的卷积，但是卷积大小是4×4。因此ConvNeXt中使用的是卷积大小4×4，stride=4的卷积。这使得准确率从79.4%上升到79.6%。

## ResNeXt-ify
ResNeXt在准确度和FLOPs之间有一个较好的权衡，ResNeXt的block结构如下所示，其结合了Inception的思想。
![ResNeXt](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/resnext.png)
与原本的ResNeXt block不同的是，在ConvNeXt，ResNeXt的卷积部分使用的Group数和Channel的数量相同。同时，作者还认为depthwise卷积的操作和self-attention类似。这使得准确率下降到了78.3%,但是GFLOPs从4.4下降到了2.4。

此外还将网络的channel改到了和swin一样的96，这使得准确率提高到了80.5%，但是GFLOPs上升到了5.3

## Inverted Bottleneck
Transformer block的MLP层与MobileNetV2的反转瓶颈层很像，因此ConvNeXt也设计了一个反转瓶颈层即中间粗两边细的结构。在Transformer中MLP的隐藏层的维度都是4倍于输入维度，因此反转瓶颈层的中间层也是四倍缩放。下图中(a)是ResNet的block，而(b)是ConvNeXt建立的反转瓶颈层，(c)是降空间depthwise的层上移。

![Inverted Bottleneck](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/InvertedBottleneck.png)

使用反转瓶颈后，小模型中准确率从80.5%上升到80.6%，大模型的准确率从81.9%上升到82.6%，且FLOPs都减小。

## Large Kernel Sizes
### Moving up depthwise conv layer
因为在transformer模型上，MSA(Multi head self-attetion)是在MLP前面的，因此在反转瓶颈的时候，将depthwise卷积放到前面，即Inverted Bottleneck中的(b)到(c)。此外中间的1×1的卷积在代码里面是使用全连接层来实现的，因为1×1卷积和全连接几乎等价。

这使得FLOPs下降到4.1G，准确率到79.1%

### Increasing the kernel size
作者尝试增大卷积核的大小，可以看到卷积核加到7×7之后趋于饱和，因此选择在每个block中使用7×7的卷积核作为depthwise卷积。准确率上升到了80.6%。
![kernel size](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/filter.png)


## Micro Design
### Replacing ReLU with GELU
大多数卷积网络使用的是RELU激活，而transformer大多使用GELU激活，因此使用GELU激活，这对准确率没有什么影响

### Fewer activation functions
相较于ResNet，transformer拥有更少的激活函数。每一个transformer block中只有1个激活函数在MLP层之中，因此ConvNeXt也做类似，每个block在两个1×1之间加GELU激活。其结构如下图所示。这使得准确率从80.6%提升到了81.3%。

![ConvNeXt Block](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.5/block.png)

### Fewer normalization layers
transformer block中也是拥有较少的norm层，因此作者只保留了1×1卷积前面的BN层，这使得准确率到了81.4%，超过了Swin-T。需要注意的是作者尝试把BN加在Block前面，但是效果没有什么提升。

### Substituting BN with LN
在Transformer中经常使用LN，因此作者使用LN替换原来的BN，这使得准确率上升到了81.5%。

### Separate downsampling layers
在ResNet中空间下采样是在每个block stage的开头完成，通过使用3×3卷积stride=2，shortcut部分使用1×1卷积stride=2实现。而在swin transformer中在每个stage之间使用一个单独下采样层。因此作者使用2×2，stride=2的单独下采样层来实现。同时在下采样的卷积前使用layernorm可以帮助其收敛，而在stem层的layernorm加在卷积后面。这使得准确率提高到了82.0%，超过了Swin。


# 后记
以上就是一直拖着没更新的ConvNeXt了，这是一个纯卷积神经网络，实现起来比较容易，且效果要好于Swin-T。是个不错的网络。


# 参考文献
[Why does CNNs usually have a stem?](https://stackoverflow.com/questions/68258188/why-does-cnns-usually-have-a-stem)

[Aggregated Residual Transformations for Deep Neural Networks](https://arxiv.org/abs/1611.05431v2)

[A ConvNet for the 2020s](https://arxiv.org/abs/2201.03545)