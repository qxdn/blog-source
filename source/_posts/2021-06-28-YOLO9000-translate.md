---
title: 毕业设计（五）YOLO9000翻译
tags:
  - 机器学习
  - 毕业设计
  - yolo
categories: 机器学习
date: 2021-06-28 20:10:41
---


渣翻，轻喷。下次再也不玩word转markdown了，难受
<!--more-->

# 摘要
让我们来介绍一下YOLO9000，YOLO9000是一个最先进的，能够检测超过9000个物体类别的实时物体检测系统。首先，我们提出许多新颖且取材自先前工作的方法去提升YOLO的检测效果。提升后的模型就是YOLOv2，在标准的检测任务如PASCAL VOC和COCO中效果是最好的。通过使用新颖的多尺度训练方法，YOLOv2模型可以在多种输入尺寸上运行，并且在速度和准确率上做到简单的折中。在速度67 FPS的时候，YOLOv2在VOC 2007数据集上获得了76.8 mAP的效果。在40 FPS的时候，YOLOv2获得了78.6 mAP，性能优于最先进的方法，如Faster R-CNN、ResNet和SSD，同时运行速度还快的明显。最后，我们提出一种方法可以联合训练物体检测和分类。通过使用这个方法，我们可以在COCO检测数据集和ImageNet分类数据集上同时训练YOLO9000。我们的联合训练使得YOLO9000能够预测没有标签数据的目标类。我们在ImageNet检测任务上验证了我们的方法，YOLO9000在COCO数据集上有的44个类中，获得了19.7 mAP的成绩。而在COCO训练集没有的156个类上，YOLO9000获得了16.0 mAP。而且，YOLO9000可以在保持实时的情况下，识别超过9000个不同的类。


![图 1：YOLO9000。YOLO9000可以实时检测大量的物体类](/images/GraduationProject/YOLO9000-translate-1.png)

# 前言
物体检测算法通常要求快速、准确和有能力识别大量的物体。自从神经网络的引入，检测算法变得越来越快速、准确。然而，大多数检测方法仍然受限于少数物体。
当前的物体检测数据集与其他分类数据集和标注数据集，数据集的量很少。最常见的检测数据集含有数千到数十万张图片，包含几十到数百个标签。分类数据集含有百万张图片，包含数十或者数百或者数千个类别。
我们希望检测数据集的规模能达到分类数据集的规模。但是，为检测数据集打标签比分类或者标注（标注通常是用户免费提供）的数据集要花费更多。因此，我们不太可能在近未来看到检测数据集和分类数据集有相同的规模。
我们提出了一种新的方法利用已有的大量分类数据集，并使用其去拓展当前检测系统的规模。我们的方法使用了一个对象分类的层次视图，这使得我们能够将不同的数据集合起来。
我们还提出了一种联合训练算法，使得我们能够在检测数据和分类数据上训练我们的物体检测器。我们的方法利用已经打好标签的检测图像去学习定位物体的准确度，同时利用分类图像去提升其词汇量和鲁棒性。
通过使用这个方法，我们训练了一个实时的物体检测器YOLO9000，它可以检测超过9000个物体类别。首先，我们基于YOLO检测系统进行提升并获得了一个最先进的实时检测器YOLOv2。然后，我们使用我们的数据集组合方法和联合训练算法在超过9000个类的ImageNet和COCO的物体检测集上训练一个模型。
所有的代码和预训练模型在<http://pjreddie.com/yolo9000/>。
# 更好
YOLO与最先进的检测系统相比，有大量的缺点。与Fast R-CNN相比，YOLO的误差分析表明YOLO产生了大量的定位错误。此外，与基于区域建议方法相比，YOLO的召回率相对较低。因此，我们主要提升召回率和定位准确率同时保持分类的准确率。
计算机视觉通常倾向于更大，更深的网络。更好的表现通常取决于训练更大的网络或者将多个模型合在一起。但是，我们希望更准确的检测器同时检测依然速度很快。我们简化了网络，使其更容易训练，而不是扩大我们的网络。我们将过去工作中的大量想法和我们自己的新颖的思想结合起来去提升YOLO的表现。结果的概要在表2中。
**Batch Normalization（批次归一化）.**
批次归一化使得模型在收敛性方面有显著的提升，同时消除了其他形式的正则化。通过在YOLO的全部卷积层中增加批次归一化，我们获得了超过2%
mAP的提升。批次归一化还有助于正则化模型。通过使用批次归一化，我们可以从模型中去除dropout层，同时不会过拟合。
**High Resolution Classifier（高分辨率分类器）.**
所有最先进的检测方法都是使用在ImageNet上预训练好的分类器。从AlexNet开始，大多数分类器对输入大小小于256×256的图像进行操作。原始YOLO在224×224分辨率下训练分类网络，提升分辨率到448来训练检测网络。这意味着网络必须同时切换到学习物体检测并调整到新的输入分辨率。
对于YOLOv2，我们首先在ImageNet上以448×448分辨率训练了10个时期进行微调，这给了网络时间去调整其卷积核，使其能够在更高的分辨率上表现的更好。然后根据检测结果对网络进行微调。这个高分辨率分类网络给了我们大概4%
mAP的提升。
**Convolutional With Anchor Boxes（锚框卷积）.**
YOLO直接使用全连接层在卷积特征提取器的顶端预测边框的坐标。Faster R-CNN没有直接预测坐标，而是使用手选的先验框来预测边框。Faster R-CNN中的区域建议网络（RPN）只使用卷积层来预测锚框的偏差值和置信度。因为预测层是卷积的，所以RPN在特征图的每个位置预测这些偏差。预测偏差而不是预测坐标简化了问题，并使得网络更容易学习。
我们使用锚框去预测边框，并去除了全连接层。首先，我们去除了一个池化层使得网络输出的卷积层有了更高的分辨率。我们还将网络的输入从448×448缩小到了416。我们这么做是希望我们的特征图有奇数个位置，这样就有单个中心格。物体，特别是大物体，倾向于占据图像的中心，所以最好用中心的单个格子去预测这些物体而不是使用相邻的四个格子。YOLO的卷积层使用因子32对图像进行降采样，所以通过输入分辨率为416的图像，我们可以得到13×13大小的特征图。
当我们移动锚框的时候，我们还将类预测机制从空间位置和每个锚框的预测类和物体性中解耦。继续YOLO，物体性预测依然预测正确标签与建议框之间的IOU，分类预测器去预测框中物体是什么类别的条件概率。
使用锚框使我们的准确率得到了小小的下降。YOLO只能为每个图像预测98个框，但是使用锚框我们的模型可以预测超过1000个。不使用锚框，我们的中等模型获得69.5 mAP和81%的召回率。使用锚框，我们的模型获得69.2 mAP和88%的召回率。虽然mAP下降了，但召回率的上升意味着我们的模型有更多空间去提升。
**Dimension Clusters（尺寸聚类）.**
当我们使用有锚框的YOLO时，我们遇到了两个问题。第一个问题是框的尺寸是手选的。神经网络可以学习适当的调整框，但是如果我们在开始的时候挑选更好的先验框，就可以使网络更容易学习去预测好的检测。
我们在训练集的边框上使用k-means聚类算法去自动寻找最佳先验而不是手动挑选。如果我们使用标准的使用欧几里德距离的k-means算法，更大的框会比小的框产生更多的错误。然而，我们真正想要的基于IOU分数的先验，而IOU分数独立于框的大小。因此，对于我们的距离度量，我们使用：
$$d\left( box,centroid \right) = 1 - IOU\left( box,\ centroid \right)$$
我们使用了不同的k值来跑k-means算法，并绘制最近质心的平均IOU，见图2。权衡模型复杂度和高召回率之间，我们选择了k=5。聚类的质心与手工选取的锚框有显著差异。短而宽的框很少，而高瘦的框很多。
![图 2：VOC和COCO数据上的聚类框尺寸。我们在边框上运行k-means算法去获得我们模型的一个较好的先验。左边的图像展示了不同的k值情况下的平均IOU。我们发现当k=5时，在召回率和模型复杂度之间有一个较好的平衡。右边的图像展示了VOC和COCO数据集上的相关质心。两个数据集的先验都偏向于瘦高框。而COCO的框比VOC的框大一些。](/images/GraduationProject/YOLO9000-translate-2.png)
在表1中我们对比了我们聚类政策选择的最近质心和手选的锚框的平均IOU。在只有5个先验质心的表现为平均IOU 61.0与9个锚框的表现平均IOU 60.9相似。这表明使用k-means来生成边框开始使得模型有更好的表现，并使任务更易于学习。
![表 1:VOC 2007上最近先验的平均IOU。VOC2007上对象的平均IOU与使用不同生成方法之前最接近、未修改的IOU。聚类比使用手工挑选的先验有更好的结果。](/images/GraduationProject/YOLO9000-translate-3.png)
**Direct location prediction（直接位置预测）.**
YOLO使用锚框后，我们遇到的第二个问题是：模型不稳定，特别是在早期迭代的时候。大多数不稳定的原因来自预测框的（x，y）位置。在区域建议网络中，网络预测$t_{x}$和$t_{y}$，中心坐标（x，y）的计算如下：
$$x = \left( t_{x} \times \omega_{a} \right) - x_{a}$$
$$y = \left( t_{y} \times h_{a} \right) - y_{a}$$
比如，预测$t_{x} = 1$时会向右移动一个锚框的宽度，预测$t_{x} = \  - 1$时会向左移动同样的一个锚框宽度。
这个公式并没有任何约束，所以任何一个锚框可以出现在图像的任何一个点，而不用管位置预测框。在随机初始化模型的情况下，模型要花很长时间才能稳定的去预测敏感偏差。
我们没有预测偏移量，而是采用YOLO的方法，预测相对于网格单元位置的位置坐标。这将正确标签的值限制在0和1之间。我们使用逻辑激活函数来限制网络的预测在这个范围内。
网络在输出特征图的每个单元格预测5个边框。网络为每个边框预测5个坐标，$t_{x}$、$t_{y}$、$t_{w}$、$t_{h}$和$t_{o}$。如果单元格与图像左上角的偏移量为（$c_{x}$，$c_{y}$），且边框具有宽度和高度$p_{w}$，$p_{h}$，则预测值公式为：
$$b_{x} = \sigma\left( t_{x} \right) + c_{x}$$
$$b_{y} = \sigma\left( t_{y} \right) + c_{y}$$
$$b_{w} = p_{w}e^{t_{w}}$$
$$b_{h} = p_{h}e^{t_{h}}$$
$$P_{r}\left( \text{Object} \right)*IOU\left( b,object \right) = \sigma\left( t_{o} \right)$$
因为我们约束了位置预测，所以参数更容易学习，使得模型更稳定。使用尺寸聚类和直接预测边框的中心位置比使用锚框的版本提升了YOLO大概5%的精确度。
**Fine-Grained Features（细粒度特征）.**
这个改进的YOLO在13×13的特征图上进行检测。虽然这对大型物体充足，但更细的特征对小物体有好效果。Faster R-CNN和SSD都在网络中的特征图上运行他们的区域建议网络以获得一系列分辨率。我们使用一种不同的方法，简单添加一个passthrough层从之前几层获得26×26分辨率的特征。
像ResNet的恒等映射一样，passthrough层通过相邻的特征叠加到不同的通道而不是空间位置来连接更高分辨率的特征和低分辨率的特征。这将26×26×512的特征图转换层13×13×2048的特征图，这使得其可以被原先的特征图连接。我们的检测器在这个拓展后的特征图上运行，这样能获得更细的特征。这使得性能有1%的提升。
![图 3：有尺寸先验与位置预测的边框。我们从聚类质心的偏移量预测框的宽高。我们使用一个sigmoid函数来预测框相对于滤波器应用位置的中心坐标。](/images/GraduationProject/YOLO9000-translate-4.png)
**Multi-Scale Training（多尺度训练）.**
最初的YOLO使用448×448分辨率的输入。随着锚框加入网络，我们将分辨率改到416×416。但是，由于我们的模型只使用卷积层和池化层，所以它可以被动态的调整。我们YOLOv2能够在不同大小的图像上运行，所以我们这样训练模型。
我们每隔几次小迭代就改变网络而不是固定网络的输入图像大小。我们的网络每10个批次就随机选择一个新的图像尺寸。因为我们的模型以32的倍率进行降采样，所以我们以32的倍数变化：{320，352，...，608}。因此，最小的可选输入时320×320，最大的是608×608。我们重设网络到那个尺寸并继续训练。
这种机制迫使网络学会在不同的输入尺寸上进行预测。这意味着同一个网络可以在不同的分辨率下预测检测。网络在更小的尺寸下运行得更快，所以YOLOv2在速度和准确性之间提供了一个简单的折衷。
在低分辨率下，YOLOv2是一种廉价、相当精确的探测器。在288×288的分辨率下，其运行速度超过90 FPS而mAP和Fast R-CNN一样好。这使得其非常适合较小的GPU、高分辨率视频或者多个视频流。
在高分辨率下YOLOv2是最先进的检测器，在VOC2007数据集上有78.6的mAP同时还保持着实时的速度。YOLOv2与其他框架在VOC2007的比较见表3和图4。
![图 4 VOC 2007上的准确率和速度](/images/GraduationProject/YOLO9000-translate-5.png)
![表 3 在PASCAL VOC2007上的检测框架。YOLOv2比以前的检测方法更快更准确。它还可以运行在不同的分辨率之间来平衡速度和准确性。每个YOLOv2入口实际上是相同的训练模型，具有相同的权重，只是在不同的大小下进行评估。所有的时间信息都在Geforce GTX Titan X（原始，不是Pascal模型）上。](/images/GraduationProject/YOLO9000-translate-6.png)
**Further Experiments（进一步实验）.**
我们在VOC2012上训练了YOLOv2检测器。表4显示了YOLOv2与其他最先进的检测系统的性能比较。YOLOv2实现73.4 mAP，同时运行速度远远快于竞争的方法。我们还在COCO数据集上训练了我们的模型并和其他的方法进行比较，结果在表5。在VOC评估（IOU=.5）上，YOLOv2得到44.0 mAP，与SSD和Faster R-CNN相当。
# 更快
我们希望检测能准确，但是我们也希望能够快。大多数用于探测的应用，如机器人或自动驾驶，依赖于低延迟预测。为了最大限度地提高性能，为了使YOLOv2快，我们从头开始设计。大多数检测框架都依赖VGG-16作为基本的特征提取器。VGG-16是一个功能强大、准确的分类网络，但它不必要的复杂。VGG-16的卷积层需要306.9亿个浮点运算去处理单个224×224分辨率的图像。
YOLO框架使用基于GoogLeNet架构的定制网络。这个网络比VGG-16快，仅使用85.2亿个运算去前向传播。然而，它的准确度比VGG-16稍差。在ImageNet上，对于单张裁剪图像，224×224分辨率下的top-5准确率，YOLO的自定义模型获得了88.0%，而VGG-16则为90.0%。
![表 2 YOLO到YOLOv2的路径。大多数列出的设计决策都会导致mAP的显著增加。两个例外是换到带有全卷积网络的锚框和使用新网络。在使用新的网络切割计算时，切换到锚框方法在不改变mAP的情况下提高了召回率33%。](/images/GraduationProject/YOLO9000-translate-7.png)
![表 4 PASCAL VOC2012测试检测的结果。YLOV2的性能与最先进的探测器（如Faster R-CNN，ResNet和SSD512）一样，且速度快2-10倍。](/images/GraduationProject/YOLO9000-translate-8.png)
**Darknet-19.**
我们提出了一个新分类模型作为YOLOv2的基础。我们的模型建立在先前的网络设计的工作以及该领域的共同知识的基础上。与VGG模型类似，我们主要使用3×3卷积核，并且在每次池化之后将通道数增加一倍。在网络中网络（NIN）的输出后，我们使用全局平均池化预测，把1×1的卷积核置于3×3的卷积核之间，用来压缩特征。我们使用批次归一化稳定模型训练，加速收敛和正则化模型。
我们最终的模型，叫Darknet-19，拥有19个卷积层和5个最大池化层。完整的网络描述见表6。Darknet-19只需要55.8亿次运算去处理一张图像。但在ImageNet上却达到了72.9%的top-1准确率和91.2%的top-5准确率。
**Training for classification（分类训练）.**
我们使用Darknet神经网络框架，在标准ImageNet 1000分类数据集上使用随机梯度下降（起始学习速率为0:1）、多项式速率衰减（幂为4）、权重衰减为0:0005和动量为0:9对网络进行160个时期的训练。在训练期间，我们使用标准的数据增强技巧，包括随机裁剪、旋转、色调、饱和度和曝光变化。
如上所述，在我们对224×224的图像进行初始训练之后，我们在更大的尺寸448上对模型进行微调。对于这次微调，我们训练了上述参数但是只使用了10个时期并且以的学习率开始。在这种更高分辨下，我们的网络达到了top-1准确率76.5%，top-5准确率93.3%。
**Training for detection（检测训练）.**
我们修改这个网络进行检测，删除了最后一个卷积层，作为替代添加了3个有1024个滤波器的3×3卷积层，然后再加上最后一个1×1的卷积层，输出与我们检测需要的输出一样。对于VOC，我们预测5个框，每个框有5个坐标和20个类别，所以有125个滤波器。我们还在最后的3×3×512层和倒数第二个卷积层之间加了一个passthrough层，以便我们的模型可以使用细粒的特征。
我们训练网络160个时期，以学习率开始，并在第60和90个时期的时候除以10。我们使用0.0005的权重衰减和0.9的动量。我们对YOLO和SSD进行类似的数据增强，随机裁剪，色彩偏移等。我们对COCO和VOC使用相同的训练策略。
![表 5 COCO test-dev2015上的测试结果](/images/GraduationProject/YOLO9000-translate-9.png)
![表 6 Darknet-19](/images/GraduationProject/YOLO9000-translate-10.png)
# 更强
我们提出一种再分类数据和检测数据上联合训练的机制。我们的方法使用标记为检测的图像来学习边框坐标预测和目标之类的特定检测信息以及如何对常见目标进行分类。它使用仅具有类别标签的图像来扩展可检测类别的数量。
在训练期间，我们混合检测数据集和分类数据集的图像。当我们的网络看到了标记为检测的图像时，我们使用完整的YOLOv2 loss函数进行反向传播，当它看见一个分类图像时，我们只是用分类特定的loss函数进行反向传播。
这种方法遇到了一点挑战。检测数据集只有通用目标和通用标签，如“狗”或“船”。分类数据集有更广更深的标签范围。ImageNet有超过一百种品种的狗，包括“诺福克㹴犬”，“约克夏㹴”和“贝林登犬”。如果我们想在两个数据集上训练，我们需要一个连贯的方式来合并这些标签。
大多数分类方法使用一个softmax层去计算所有可能类的最终概率分布。使用softmax假定类别之间时相互排斥的。这给数据集组合带来了问题，比如你不想用这个模型组合ImageNet和COCO，因为“诺福克㹴犬”和“狗”不是互斥的。
我们可以使用一个多标签的模型来组合假定不互助的数据集。这个方法无视我们所知道的数据的全部结构，比如COCO中所有的类是互斥的。
**Hierarchical classification（分层分类）.**
ImageNet的标签从WordNet提取，这是一个用于构建概念及其关系的语言数据库。在WordNet中，“诺福克㹴犬”和“约克夏㹴”都是“㹴”的下义词，“㹴”是“猎犬”的一种，“猎犬”是“狗”的一种，“狗”是“犬类动物”的一种等等。绝大多数的分类方法假定标签是一个扁平结构，但是对于联合数据集，结构正是我们所需要的。
WordNet的结构就像一个有向图，而不是树，因为语言是复杂的。比如“狗”既是“犬科动物”的一种，也是“家畜”的一种，这两个在WordNet中都是同义词。我们没有使用完整的图结构，而是通过ImageNet的概念构建一个分层树来简化问题。
为了构建这棵树，我们检测了ImageNet中的视觉名词，并查看它们通过WordNet图到根节点的路径，本例中为“物理物体”。许多同义词在图中只有一条路径，所以我们先将所有这些路径添加到我们的树中。然后我们反复检查我们留下的概念，并在树上添加尽可能少的路径。因此，如果一个概念有两条路径到根节点，一条路径会给树增加三条边，另一条路径只增加一条边，那么我们选择更短的路径。
最终的结果就是WordTree，一个视觉概念分层模型。为了使用WordTree进行分类，我们预测每个节点的条件概率，以得到同义词集合中每个同义词下义词的概率。比如，在“㹴”节点我们预测：
$$P_{r}\left( Norfolk\ terrier\ |terrier \right)$$
$$P_{r}\left( Yorkshire\ terrier|terrier \right)$$
$$P_{r}\left( Bedlington\ terrier|terrier \right)$$
如果我们想要计算一个特定节点的绝对概率，我们只需要简单的随着通道到树的根节点，并乘以条件概率。所以，如果我们想要知道一张图是不是为“诺福克㹴犬”我们计算：
$$P_{r}\left( \text{Norfolk\ terrier} \right) = P_{r}\left( Norfolk\ terrier|terrier \right) \times P_{r}\left( terrier|hunting\ dog \right) \times \ldots \times P_{r}(mammal|P_{r}\left( \text{animal} \right) \times P_{r}\left( animal|physical\ object \right)$$
对于分类目的，我们假定图像含有一个目标：$P_{r}\left. (\text{physical\ object} \right.) = 1$。
为了验证这种方法，我们在使用了1000类的ImageNet构建的WordTree上训练Darknet-19。为了构建WordTree1k，我们添加了所有将标签空间从1000扩展到1369的中间节点。在训练过程中，我们将正确标签向树后向传播，以便如果图像被标记为“诺福克㹴犬”，则它也被标记为“狗”和“哺乳动物”等。为了计算条件概率，我们的模型预测一个有1369个值的向量，并且我们计算了相同概念的下义词在所有同义词集上的softmax，见图5。
使用与之前相同的训练参数，我们的分层Darknet-19达到了top-1 71.9%的准确性，top-5 90.4%的准确性。尽管增加了369个额外概念，我们的网络预测了一个树形结构，我们的准确率仅下降了一点点。以这种方式进行分类也有一些好处。以这种方式进行分类也有一些好处。在新的或未知的目标类别上性能会降低。例如，如果网络看到一只狗的照片，但不确定它是什么类型的狗，它仍然会更高置信度地预测“狗”，但是在下义位扩展之间有更低的置信度。
这个公式同样适用于检测，现在，我们使用YOLOv2的物体预测器给我们一个的值，而不是假定每张图都有一个物体。检测器预测一个边框和概率树。我们向下遍历树，我们取最高置信度的路径分割，直到达到一个阈值，然后我们预测物体类。
![图 5 ImageNet和WordTree预测对比。大多数ImageNet模型使用单个大的softmax函数去预测概率分布。使用WordTree，我们对上下义词执行多个softmax操作。](/images/GraduationProject/YOLO9000-translate-11.png)
**Dataset combination with WordTree（数据集与词语树结合）.**
我们可以使用合理的WordTree将多个数据集以合理的方式组合在一起。我们只需要将数据集中的类别映射到数中的语法集。图6展示了一个使用WordTree组合ImageNet和COCO的例子。WordTree是非常多样化的，因此我们可以将此项技术用于大多数数据集。
![图 6 使用WordTree层次结构组合数据集。使用WordNet概念图，我们建立了一个视觉概念的层次树。然后我们可以通过将数据集中的类映射到树中的同义词来合并数据集。这是WordTree为了便于说明的简化视图](/images/GraduationProject/YOLO9000-translate-12.png)
**Joint classification and detection（分类检测联合）.**
现在我们可以使用WordTree去组合数据集，我们可以在分类和检测数据集上训练我们的联合模型。我们想要训练一个非常大规模的检测器，所以我们使用COCO检测数据集和完整版本ImageNet的前9000个类创建我们的组合数据集。我们还想评估我们的方法，所以我们添加任意ImageNet挑战中未包含的类。相应的这个数据集的WordTree有9418个类别。ImageNet是一个很大的数据集，所以我们通过对COCO进行过采样来平衡数据集，使得ImageNet只比COCO数据集大于4倍。
使用这个数据集，我们训练了YOLO9000。由于受到输出大小的限制，我们使用YOLOv2的基础结构但是只有3个先验而不是5个。当我们的网络看到一个检测图像时，我们正常的反向传播loss。对于分类loss，我们只在标签更高等级上反向传播函数。例如，如果标签是“dog”，我们会将任何错误分配给树下面的预测，“德国牧羊犬”和“金毛猎犬”，因为我们没有这些信息。
当它看到分类图像的时候，我们只反向传播分类loss。要做到这点，我们只需要找到这个类最高概率的边框，然后计算预测树上的loss。我们还假定预测框和标签框重叠至少0.3个IOU，并基于此假设反向传播对象性loss。
使用这种联合训练，YOLO9000学习使用COCO中的检测数据来查找图像中的目标，并学习使用ImageNet的数据对这些目标进行分类。
我们在ImageNet检测任务上评估YOLO9000。ImageNet的检测任务与COCO共享44个目标类别，这意味着YOLO9000只能看到大多数测试图像的分类数据，而不是检测数据。YOLO9000在从未见过任何标记的检测数据的情况下，整体上获得了19.7 mAP，在不相交的156个目标类别中获得了16.0 mAP。这个mAP高于DPM算法的结果，但是YOLO9000是在只有部分监督的不同的数据集上训练的。它也同时实时检测9000个其他类别。
当我们分析YOLO9000在ImageNet上的表现的时候，我们发现它很好的学习新的动物种类，但是学习如衣服、装备这种类别的时候比较困难。新动物容易学习是因为目标检测可以从COCO的动物类中得到很好的泛化。相反的，COCO中没有任何衣服的边框标签，只有人的。所以YOLO9000很难对“墨镜”、“泳裤”等类建模。
![表 7 在ImageNet上YOLO9000预测最好和最差的类。156个弱监督类中AP值最高和最低的类。YOLO9000学习各种动物模型的效果很好，但在服装或装备等新发类上学习却很吃力。](/images/GraduationProject/YOLO9000-translate-13.png)
# 结论
我们介绍了YOLOv2和YOLO9000，两个实时系统。YOLOv2是各种检测数据集上最先进的，比其他检测系统快。此外，它可以运行在各种图像大小，提供速度和准确性之间的平滑折衷。
YOLO9000是一个通过联合优化检测、分类数据集检测超过9000个类的实时检测框架。我们使用WordTree将各种来源的数据和我们联合优化技术组合在一起，并同时在ImageNet和COCO上训练。YOLO9000是缩小检测数据集和分类数据集之间大小差距的重要一步。
我们的许多技术都可以泛化到目标检测之外，我们在ImageNet上的WordTree为图像分类提供了更丰富，详细的输出空间。使用分层分类的数据集组合在分类和分割领域很有用。像多尺度训练这样的训练技术可以为各种视觉任务提供益处。
对于未来的工作，我们希望使用类似的技术来进行弱监督的图像分割。我们还计划在训练期间使用更强大的匹配策略为分类数据分配弱标签，以改善检测结果。计算机视觉受到大量标记数据。我们将继续寻找方法，将不同来源和不同结构的数据整合起来，形成更强大的视觉世界模型。
# 引用
[1] S. Bell, C. L. Zitnick, K. Bala, and R. Girshick. Insideoutside net: Detecting objects in context with skip pooling and recurrent neural networks. arXiv preprint arXiv:1512.04143, 2015. 6
[2] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and L. Fei-Fei. Imagenet: A large-scale hierarchical image database. In Computer Vision and Pattern Recognition, 2009. CVPR 2009. IEEE Conference on, pages 248–255. IEEE, 2009. 1
[3] M. Everingham, L. Van Gool, C. K. Williams, J. Winn, and A. Zisserman. The pascal visual object classes (voc) challenge. International journal of computer vision, 88(2):303–338, 2010. 1 
[4] P. F. Felzenszwalb, R. B. Girshick, and D. McAllester. Discriminatively trained deformable part models, release 4. http://people.cs.uchicago.edu/pff/latent-release4/. 8
[5] R. B. Girshick. Fast R-CNN. CoRR, abs/1504.08083, 2015.4, 5, 6
[6] K. He, X. Zhang, S. Ren, and J. Sun. Deep residual learning for image recognition. arXiv preprint arXiv:1512.03385, 2015. 2, 4, 5
[7] S. Ioffe and C. Szegedy. Batch normalization: Accelerating deep network training by reducing internal covariate shift. arXiv preprint arXiv:1502.03167,2015. 2, 5
[8] A. Krizhevsky, I. Sutskever, and G. E. Hinton. Imagenet classification with deep convolutional neural networks. In Advances in neural information processing systems, pages 1097–1105, 2012. 2
[9] M. Lin, Q. Chen, and S. Yan. Network in network. arXiv preprint arXiv:1312.4400, 2013. 5
[10] T.-Y. Lin, M. Maire, S. Belongie, J. Hays, P. Perona, D. Ramanan, P. Doll´ar, and C. L. Zitnick. Microsoft coco: Common objects in context. In European Conference on Computer Vision, pages 740–755. Springer, 2014. 1, 6
[11] W. Liu, D. Anguelov, D. Erhan, C. Szegedy, and S. E. Reed. SSD: single shot multibox detector. CoRR, abs/1512.02325, 2015. 4, 5, 6
[12] G. A. Miller, R. Beckwith, C. Fellbaum, D. Gross, and K. J. Miller. Introduction to wordnet: An on-line lexical database. International journal of lexicography, 3(4):235–244, 1990.6
[13] J. Redmon. Darknet: Open source neural networks in c. http://pjreddie.com/darknet/, 2013–2016. 5
[14] J. Redmon, S. Divvala, R. Girshick, and A. Farhadi. You only look once: Unified, real-time object detection. arXiv preprint arXiv:1506.02640, 2015. 4, 5
[15] S. Ren, K. He, R. Girshick, and J. Sun. Faster r-cnn: Towards real-time object detection with region proposal networks. arXiv preprint arXiv:1506.01497,2015. 2, 3, 4, 5, 6
[16] O. Russakovsky, J. Deng, H. Su, J. Krause, S. Satheesh, S. Ma, Z. Huang, A. Karpathy, A. Khosla, M. Bernstein, A. C. Berg, and L. Fei-Fei. ImageNet Large Scale Visual Recognition Challenge. International Journal of Computer Vision (IJCV), 2015. 2
[17] K. Simonyan and A. Zisserman. Very deep convolutional networks for large-scale image recognition. arXiv preprint arXiv:1409.1556, 2014. 2, 5
[18] C. Szegedy, S. Ioffe, and V. Vanhoucke. Inception-v4, inception-resnet and the impact of residual connections on learning. CoRR, abs/1602.07261, 2016. 2
[19] C. Szegedy, W. Liu, Y. Jia, P. Sermanet, S. Reed, D. Anguelov, D. Erhan, V. Vanhoucke, and A. Rabinovich. Going deeper with convolutions. CoRR, abs/1409.4842,2014. 5
[20] B. Thomee, D. A. Shamma, G. Friedland, B. Elizalde, K. Ni, D. Poland, D. Borth, and L.-J. Li. Yfcc100m: The new data in multimedia research. Communications of the ACM, 59(2):64–73, 2016. 1