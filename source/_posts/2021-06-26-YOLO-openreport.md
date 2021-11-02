---
title: 毕业设计（四）基于深度学习算法YOLO的行人车辆检测——开题报告
tags:
  - 机器学习
  - 毕业设计
  - yolo
categories: 机器学习
date: 2021-06-26 13:06:06
description: 毕设开题报告
---


# 目的及意义（含国内外的研究现状分析）
## 研究目的
&emsp;&emsp;本次毕业设计拟对COCO数据集进行提取，并结合其他自制数据集补充，得到行人车辆的图片和标签，搭建You Only Look Once(YOLO)网络模型，训练得到针对车辆和行人的目标检测模型。
## 研究意义
&emsp;&emsp;目标检测是计算机视觉中的一个重要分支，常用的方法有R-CNN<sup>[^1]</sup>、Fast R-CNN<sup>[^2]</sup>、Faster R-CNN<sup>[^3]</sup>、YOLO<sup>[^4]</sup>、SSD<sup>[^5]</sup>等。在这些算法之中，YOLO以其较高的准确率、实时性和较小的模型而较为出名。YOLOv4 tiny<sup>[^6]</sup>的模型大小可以到达到23 MB，而且Intersection over Union（IoU）在50%以上的average precision（AP）可以达到40.2%，基于YOLO模型训练出来的车辆与行人检测模型，可以部署在一些嵌入式设备中，从而运用在自动驾驶领域。
## 国内外研究现状
&emsp;&emsp;自2012年Hinton设计的AlexNet获得ImageNet竞赛冠军以来，人们便开始更多的关注卷积神经网络CNN，之后也启发了VGG、GoogLeNet等知名的卷积神经网络，而YOLOv1就是基于GoogLeNet的backbone进行改进。在YOLOv1提出以前，常用的基于深度学习的目标检测算法为R-CNN系列，其方法可以认为先使用Region Proposal Network（RPN）网络生成一系列样本的候选框，然后使用CNN网络对候选框进行识别并分类。这种方法的精确度取决于其候选框的提取，而且耗时大，Faster R-CNN网络在GPU上检测PASCAL VOC的速度达到5 frame per second(FPS)，而mean average precision(mAP)达到73.2%<sup>[^3]</sup>。这种方法因为需要两步进行检测，所以被称为two-stage方法。
&emsp;&emsp;Joseph Redmon提出的YOLOv1模型基于GoogLeNet进行改善，开创性的将候选框和各个类的识别结果合在一起输出，并针对loss函数进行了重新设计。这种将two-stage方法中的两步合为一步的方法也被称为one-stage方法。这种开创性的设计使得YOLOv1在GPU上检测PASCAL VOC的速度达到45 FPS，加速版本YOLO还可以达到150 FPS，并且mAP达到63.4。相较于Faster R-CNN，虽然mAP变小了，但是模型的fps得了极大的提升，可以运用于实时系统<sup>[^4]</sup>。
&emsp;&emsp;为了提升模型的精确度，YOLOv2在所有卷积层中使用了Batch Normalization（BN）层，减少了训练时模型对初始化权重的敏感程度，避免模型过拟合。为了减少网络对不同分辨率输入的敏感程度，YOLOv2对网络进行了多个分辨率尺度的训练。受到了Faster R-CNN的启发，YOLOv2使用预制的Anchor Box去预测Bounding Box并去掉了全连接层，加快了计算，预制的Anchor Box通过对数据集中的物体框使用K-mean聚类算法获得。为了提高小目标的检测效果，作者提出了passthrough层，获取更细的特征<sup>[^7]</sup>。
&emsp;&emsp;YOLOv1和YOLOv2对小目标的检测效果一直不好，为了提升YOLO网络对小目标的检测性能，YOLOv3借鉴特征金字塔<sup>[^8]</sup>，一共有三个尺寸的特征图用于检测目标，小尺寸的特征图检测大物体，大尺寸的特征图检测小物体。为了提升网络性能，参考了ResNet结构,引入了残差块<sup>[^9]</sup>。
&emsp;&emsp;YOLOv4使用了近年来深度学习方面的许多技巧，包含了mish激活函数、CIoU loss函数、mosaic数据增强等。通过使用这些技巧，YOLOv4在COCO数据集上的mAP达到了65.7%,而速度达到了62 FPS<sup>[^10]</sup>。

# 研究（设计）的基本内容、目标、拟采用的技术方案及措施
## 研究的基本内容
（1）深入了解学习深度学习的理论基础知识
（2）学习YOLO网络的评价指标和网络中的backbone、neck、head、bounding box、anchor、mosaic数据增强、loss函数设计等技术方面的细节
（3）针对现有数据集的检测结果对YOLO网络进行调整优化，目前在这方面已经有研究参考<sup>[^11]</sup><sup>[^12]</sup><sup>[^13]</sup><sup>[^14]</sup>。
## 研究目标
（1）收集车辆和行人相关数据集
（2）复现YOLO网络
（3）根据现有数据集的特点，使用K-means聚类方法获得合适的anchor以提升网络检测性能
（4）搭建YOLO网络并进行训练，实现对行人和车辆的检测
## 本文拟采用的技术方案及措施
（1）文献研究法
利用图书馆、网络等途径，广泛收集相关的文献资料，加以阅读和分析，以了解目标检测的发展历史，了解目标检测算法的各类技巧的原理，以便深刻了解YOLO网络使用和改进的技巧。
（2）数据集收集
对于深度学习来说，数据集中样本的数量对模型的性能有较大影响。因此数据集的选择就比较重要。COCO数据集是微软团队推出的一个数据集，相较于以前常用的PASCAL VOC,COCO的类别以及每张图的实例和标签都要多<sup>[^15]</sup>。因此现在许多研究使用COCO来训练模型<sup>[^9]</sup><sup>[^10]</sup>。因此本次设计将从COCO数据集中提取行人以及各个车辆的图片、标注，同时从其他数据集和网络图片标注等方式填充更多数据作为本次设计的数据集。
（3）YOLO网络
YOLO是一个目标检测算法，YOLO网络将目标检测问题转换为回归问题，直接利用卷积神经网络预测目标的Bounding Box和各个类别的置信概率，使得算法的计算速度非常快，且YOLO结构简单、模型小可以部署在一些嵌入设备上面。本次毕业设计拟使用收集到的行人车辆数据对YOLO模型进行训练，并根据检测效果调整网络的超参数以做到更好的检测效果。
## 技术路线图
![图1 技术路线图](/images/GraduationProject/roadmap.png)

# 进度安排
2021.3.1-2021.3.31 学习深度学习相关知识，设计并开发算法雏形
2021.4.1-2021.4.30 针对现有算法进行测试，并且尝试对网络参数进行修改和微调
2021.5.1-2021.5.20 撰写并修改毕业论文
2021.5.21-2021.5.31 准备答辩

# 阅读的参考文献不少于15篇（其中近五年外文文献不少于3篇）
[^1]: Girshick R, Donahue J, Darrell T, et al. Rich feature hierarchies for accurate object detection and semantic segmentation[C] CVPR. 2014: 580-587.
[^2]: Girshick R. Fast r-cnn[C] IEEE international conference on computer vision. 2015: 1440-1448.
[^3]: Ren S , He K , Girshick R , et al. Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks[J]. IEEE Transactions on Pattern Analysis & Machine Intelligence, 2017, 39(6):1137-1149.
[^4]: Redmon J , Divvala S , Girshick R , et al. You Only Look Once: Unified, Real-Time Object Detection[C]CVPR. IEEE, 2015:779-788.
[^5]: Liu W, Anguelov D, Erhan D, et al. Ssd: Single shot multibox detector[C] Springer, Cham, 2016: 21-37.
[^6]: Wang C Y, Bochkovskiy A, Liao H Y M. Scaled-YOLOv4: Scaling Cross Stage Partial Network[J]. arXiv preprint arXiv:2011.08036, 2020.
[^7]: Redmon J , Farhadi A . YOLO9000: Better, Faster, Stronger[J]. 2017:6517-6525.
[^8]: Lin T Y , Dollár, Piotr, Girshick R , et al. Feature Pyramid Networks for Object Detection[C]CVPR.2017:2117-2125.
[^9]: Redmon J , Farhadi A . YOLOv3: An Incremental Improvement[J]. arXiv preprint arXiv:1804.02767, 2018.
[^10]: Bochkovskiy A , Wang C Y , Liao H Y M . YOLOv4: Optimal Speed and Accuracy of Object Detection [J]. arXiv preprint arXiv:2004.10934, 2020.
[^11]: 胡臣辰,陈贤富.基于YOLO改进残差网络结构的车辆检测方法[J].信息技术与网络安全,2020,39(09):56-60.
[^12]: 鞠默然,罗海波,王仲博,何淼,常铮,惠斌.改进的YOLO V3算法及其在小目标检测中的应用[J].光学学报,2019,39(07):253-260.
[^13]: 付云霞.基于YOLO算法的行人检测[J].科学技术创新,2020(29):110-111.
[^14]: 顾恭,徐旭东.改进YOLOv3的车辆实时检测与信息识别技术[J].计算机工程与应用,2020,56(22):173-184.
[^15]: Lin T Y , Maire M , Belongie S , et al. Microsoft COCO: Common Objects in Context[C] European Conference on Computer Vision. Springer International Publishing, 2014: 740-755.
