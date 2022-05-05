---
title: mmdetection自定义数据增强
tags:
  - python
  - mmdetection
  - 数据增强
  - 机器学习
categories: 机器学习
description: >-
  看了篇《Augmentation for small object
  detection》论文，想要把这个实现在目前的检测模型中，但是看了一下mmdetecttion的文档，没有特别详细的文档信息。因此写一篇记录一下
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/cover.jpg'
date: 2022-05-05 13:14:35
---


> 封面 《花の野に咲くうたかたの》

# 前言
目前的数据集内基本是检测小目标，但是因为小物体检测比较困难，需要想办法提升小目标的检测结果。最近读了一篇《Augmentation for small object detection》的论文，里面讲了一些数据增强的方法来提高小目标的检测效果。

mmdetection是一个基于pytorch的目标检测工具箱，简单易用。本篇博客的主要目的基于mmdetection实现一个数据增强方法。

# SmallObjectAugmentation
[Augmentation for small object detection](https://arxiv.org/abs/1902.07296)的论文里面讲述几种小目标增强方法

## 过采样
> In the first set of experiments, we investigate the effect of oversampling images containing small objects. We vary the oversampling ratio between two, three and four. Instead of actual stochastic oversampling, we create multiple copies of images with small objects offline for efficiency

这是一个花费精力比较少且简单的方法，简单来说就是如果图片中有小目标，就在训练集中将这个图片多复制几次。

## 增强
> In the second set of experiments, we investigate the effects of using augmentation on small object detection and segmentation. We copy and paste all small objects in each image once. We also oversample images with small objects to study the interaction between the oversampling and augmentation strategies.

另一种方法就是在每张图片中，将图片的包含小目标复制粘贴多次。在文中一共提出了三种复制粘贴策略

1. 选择一张图中的一个小目标，在随机位置中复制粘贴多次
2. 选择许多小物体，复制粘贴在随机地方
3. 选择每张图片的全部小物体，复制粘贴一次在随机地方

后文还提到复制粘贴时需要注意复制粘贴的时候不能和之前的标签重叠

# 实现
arXiv上的论文并没有给出官方实现，只有社区实现。因此这里直接参考社区的实现方法。

mmdetection的[文档](https://mmdetection.readthedocs.io/en/v2.21.0/)中给出了自定义pipelines数据增强的方法，我们只需要实现自己的`__init__`函数和`__call__`函数，然后通过`@PIPELINES.register_module()`注册即可。`__call__`函数的输入参数和输出参数都是`results`，这是一个包含了图像、边界框和标签等信息的字典。

官方提供的pipelines如下图所示
![pipeline figure](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/data_pipeline.png)

通过阅读源码和观看这张图我们可以得知模型中最后使用的是`results['img']`、`results['gt_bboxes']`、`results['gt_labels']`等，其中`gt_bboxes`的格式是`(list[Tensor])`其中每个bbox的格式是`[tl_x, tl_y, br_x, br_y]`即左上角的点坐标和右下角的点坐标。

知道格式后实现起来就比较简单，源码就放在文末。

在`mmdet/datasets/pipelines`文件夹内新建`SmallObjectAugmentation.py`,并写入文末的源码。

导入模块时`mmdetection`有两种方法

## 方法一 重新编译
[参考](https://mmdetection.readthedocs.io/en/v2.21.0/get_started.html#install-mmdetection)

`mmdet/datasets/pipelines`里的`__init__.py`文件中添加`from .SmallObjectAugmentation import SmallObjectAugmentation`,`__all__`添加`'SmallObjectAugmentation'`，完整修改见下
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/custom_init.png)

然后执行下面的命令
```python
pip install -r requirements/build.txt
pip install -v -e .  # or "python setup.py develop"
```

这样就完成了，实际上执行速度很快。这样就可以直接在你的config文件中使用

## 方法二 修改config
[参考](https://mmdetection.readthedocs.io/en/v2.21.0/tutorials/data_pipeline.html#extend-and-use-custom-pipelines)

这种方法我没有成功，读者可以自己尝试一下

修改config文件，在里面加一条，保证路径是训练脚本的相似路径
```python
custom_imports = dict(imports=['path.to.my_pipeline'], allow_failed_imports=False)
```

# 查看数据增强效果
mmdetection有提供工具让我们看数据增强的效果。
首先先准备一份config文件，我这里直接继承`yolox_tiny_8x8_300e_coco.py`修改其中的`train_pipeline`，去除其他的数据增强，只留下我们自己的增强方法。
```python
train_pipeline = [
    dict(type='SmallObjectAugmentation',all_objects=True,thresh=400*400,prob=0.7),
    dict(type='DefaultFormatBundle'),
    dict(type='Collect', keys=['img', 'gt_bboxes', 'gt_labels'])
]
```
然后我们可以使用mmdetection提供的工具来查看我们的效果
```bash
# 运行下面这句话 需要把config的路径改成你的config路径
python .\tools\misc\browse_dataset.py your_config_path
```

## 效果
为了展示效果，我这里把参数都调的夸张了点

![sample1](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/augmentation1.png)

![sample2](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/augmentation2.png)

![sample3](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/augmentation3.png)

# 训练效果
使用了数据增强前后的对比如下图所示，可以看到实际的训练效果有提高1%，可见效果还是可以的

![增强前](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/old.png)

![增强后](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.3/new.png)

# 增强源码
```python
from ..builder import PIPELINES
import numpy as np
import random


@PIPELINES.register_module('SmallObjectAugmentation')
class SmallObjectAugmentation:

    def __init__(self, thresh=64*64, prob=0.5, copy_times=3, epochs=30, all_objects=False, one_object=False):
        '''
        SmallObjectAugmentation: https://arxiv.org/abs/1902.07296
        https://github.com/zzl-pointcloud/Data_Augmentation_Zoo_for_Object_Detection/blob/master/augmentation_zoo/SmallObjectAugmentation.py
        args:
            thresh: small object thresh
            prob: the probability of whether to augmentation
            copy_times: how many times to copy anno
            epochs: how many times try to create anno
            all_object: copy all object once
            one_object: copy one object
        '''
        self.thresh = thresh
        self.prob = prob
        self.copy_times = copy_times
        self.epochs = epochs
        self.all_objects = all_objects
        self.one_object = one_object
        if self.all_objects or self.one_object:
            self.copy_times = 1

    def _is_small_object(self, height, width):
        '''
        判断是否为小目标
        '''
        if height*width <= self.thresh:
            return True
        else:
            return False

    def _compute_overlap(self, bbox_a, bbox_b):
        '''
        计算重叠
        '''
        if bbox_a is None:
            return False
        left_max = max(bbox_a[0], bbox_b[0])
        top_max = max(bbox_a[1], bbox_b[1])
        right_min = min(bbox_a[2], bbox_b[2])
        bottom_min = min(bbox_a[3], bbox_b[3])
        inter = max(0, (right_min-left_max)) * max(0, (bottom_min-top_max))
        if inter != 0:
            return True
        else:
            return False

    def _donot_overlap(self, new_bbox, bboxes):
        '''
        是否有重叠
        '''
        for bbox in bboxes:
            if self._compute_overlap(new_bbox, bbox):
                return False
        return True

    def _create_copy_annot(self, height, width, bbox, bboxes):
        '''
        创建新的标签
        '''
        bbox_h, bbox_w = bbox[3] - bbox[1], bbox[2] - bbox[0]
        for epoch in range(self.epochs):
            random_x, random_y = np.random.randint(int(bbox_w / 2), int(width - bbox_w / 2)), \
                np.random.randint(int(bbox_h / 2), int(height - bbox_h / 2))
            tl_x, tl_y = random_x - bbox_w/2, random_y-bbox_h/2
            br_x, br_y = tl_x + bbox_w, tl_y + bbox_h
            if tl_x < 0 or br_x > width or tl_y < 0 or tl_y > height:
                continue
            new_bbox = np.array([tl_x, tl_y, br_x, br_y], dtype=np.int32)

            if not self._donot_overlap(new_bbox, bboxes):
                continue

            return new_bbox
        return None

    def _add_patch_in_img(self, new_bbox, copy_bbox, image):
        '''
        复制图像区域
        '''
        copy_bbox = copy_bbox.astype(np.int32)
        image[new_bbox[1]:new_bbox[3], new_bbox[0]:new_bbox[2],
              :] = image[copy_bbox[1]:copy_bbox[3], copy_bbox[0]:copy_bbox[2], :]
        return image

    def __call__(self, results):
        if self.all_objects and self.one_object:
            return results
        if np.random.rand() > self.prob:
            return results

        img = results['img']
        bboxes = results['gt_bboxes']
        labels = results['gt_labels']

        height, width = img.shape[0], img.shape[1]

        small_object_list = []
        for idx in range(len(bboxes)):
            bbox = bboxes[idx]
            bbox_h, bbox_w = bbox[3] - bbox[1], bbox[2] - bbox[0]
            if self._is_small_object(bbox_h, bbox_w):
                small_object_list.append(idx)

        length = len(small_object_list)
        # 无小物体
        if 0 == length:
            return results

        # 随机选择不同的物体复制
        copy_object_num = np.random.randint(0, length)
        if self.all_objects:
            # 复制全部物体
            copy_object_num = length
        if self.one_object:
            # 只选择一个物体复制
            copy_object_num = 1

        random_list = random.sample(range(length), copy_object_num)
        idx_of_small_objects = [small_object_list[idx] for idx in random_list]
        select_bboxes = bboxes[idx_of_small_objects, :]
        select_labels = labels[idx_of_small_objects]

        bboxes = bboxes.tolist()
        labels = labels.tolist()
        for idx in range(copy_object_num):
            bbox = select_bboxes[idx]
            label = select_labels[idx]

            bbox_h, bbox_w = bbox[3] - bbox[1], bbox[2] - bbox[0]
            if not self._is_small_object(bbox_h, bbox_w):
                continue

            for i in range(self.copy_times):
                new_bbox = self._create_copy_annot(height, width, bbox, bboxes)
                if new_bbox is not None:
                    img = self._add_patch_in_img(new_bbox, bbox, img)
                    bboxes.append(new_bbox)
                    labels.append(label)
                
        
        results['img'] = img
        results['gt_bboxes'] = np.array(bboxes)
        results['gt_labels'] = np.array(labels)
        return results
```
# 后记
最后感谢[InfiniteZh](https://infinite-zh.com/)帮我跑了一下训练。换了电脑还是跑不动大模型5555。

# 参考文献

[Augmentation for small object detection](https://arxiv.org/abs/1902.07296)

[Data_Augmentation_Zoo_for_Object_Detection](https://github.com/zzl-pointcloud/Data_Augmentation_Zoo_for_Object_Detection)

[mmdetection doc](https://mmdetection.readthedocs.io/en/v2.21.0/)