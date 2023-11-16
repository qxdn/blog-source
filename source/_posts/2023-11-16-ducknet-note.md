---
title: DUCK-Net 论文笔记
tags:
  - 机器学习
categories:
  - 机器学习
description: 因为在paper with code上看到了医学分割的排行榜上的DUCK-Net的名字，因此来看一下这篇论文是如何做的。
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/cover.png'
date: 2023-11-16 18:34:34
---


> 封面 《FLIP＊FLOP 〜INNOCENCE OVERCLOCK〜》

# 前言
因为在[paper with code](https://paperswithcode.com/paper/using-duck-net-for-polyp-image-segmentation-1)上看到了医学分割的排行榜上的DUCK-Net(Deep Understanding Convolutional Kernel Net)的名字，因此来看一下这篇论文是如何做的。

# DUCK-Net贡献
- 定制DUCK卷积块，允许更深入的特征提取，让模型更好的定位边界信息
- 采用残差下采样，在编码器的每层分辨率中有原始图像的信息
- 不使用外部模块，且只在目标集上训练（无预训练）
- 方法无论实在数量、形状、大小还是质地上准确识别息肉

# DUCK-Net结构
DUCK-Net的结构如下图所示

![DUCK-Net结构](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/ducknet.png)

其中蓝色的下采样部分和灰色的加模块为DUCK-Net提出的残差下采样。

红色部分为DUCK-Net提出的Duck Block结构

## DUCK Block
![DUCK Block结构](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/duck-block.png)

DUCK Block由多份卷积并行使用，这样网络可以在每一步中使用其认为的最好的行为。其采用不同内核大小来模拟三种不同方式，这样网络网络可以卷积如何弥补一种模拟方法的缺点。同时加入了1-2-3三层残差模块，实验表明增加WideScope和MidScope和Sparable的数量对结果没有显著变化。

### Residual Block
残差模块如下图所示

![Residual Block](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/residual-block.png)

其是DUCK中的第一个组件，首次在ResUNet++中被引入，其目的是了解息肉小细节，
采用连接1、2、3个残差块来模拟5×5、9×9、13×13的卷积核

### MidScope Block
MidScope Block如下图所示，其采用膨胀卷积来减少较大卷积内核需要的参数，让网络理解更高级特征。该模块因为膨胀卷积副作用丢失信息，学习一点需要稍微注意的细节的突出特征。MidScope采用膨胀卷积模拟了7×7的卷积核

![MidScope Block](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/midscope-block.png)

### WideScope Block
WideScope Block如下图所示，其与MidScope Block类似，但是是模拟的15×15的卷积核
![WideScope Block](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/widescope-block.png)

### Separated Block
Separated Block如下图所示，其采用1×N和N×1，其行为类似于N×N的卷积，但是这样会导致一种“对角化”问题，在原本二维卷积上，因为其二维特征保留了对角线元素，捕捉垂直和水平方向包括了对角线方向的学习，然而分离之后，一次在一维上操作，阻碍有效编码对角特征，导致了“对角化损失”。这种对角线关系可以被证明对检测图像中特定的复杂图案或形状有用，因此其他块被设计为补偿

![Separated Block](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/separated-block.png)

# 代码
官方代码在github放出[链接](https://github.com/RazvanDu/DUCK-Net)
考虑到其是2D，我自己在monai上做了一个3D版本,不过我没训练因为Out of CUDA Memory
> /layers/duck.py
```python
from typing import Optional, Sequence, Tuple, Union

import torch
import torch.nn as nn

from monai.networks.blocks.convolutions import Convolution
from monai.networks.layers.utils import get_norm_layer, get_act_layer


class WideScope(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        act_name: Optional[Union[Tuple, str]] = "RELU",
        norm_name: Optional[Union[Tuple, str]] = "INSTANCE",
        adn_ordering: str = "ADN",
        spatial_dims: int = 3,
    ):
        super(WideScope, self).__init__()

        self.conv1 = Convolution(
            spatial_dims,
            in_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=1,
        )

        self.conv2 = Convolution(
            spatial_dims,
            out_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=2,
        )

        self.conv3 = Convolution(
            spatial_dims,
            out_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=3,
        )

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        return x


class MidScope(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        act_name: Optional[Union[Tuple, str]] = "RELU",
        norm_name: Optional[Union[Tuple, str]] = "INSTANCE",
        adn_ordering: str = "ADN",
        spatial_dims: int = 3,
    ):
        super(MidScope, self).__init__()

        self.conv1 = Convolution(
            spatial_dims,
            in_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=1,
        )

        self.conv2 = Convolution(
            spatial_dims,
            out_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=2,
        )

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        return x


class DuckResidualBlock(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        act_name: Optional[Union[Tuple, str]] = "RELU",
        norm_name: Optional[Union[Tuple, str]] = "INSTANCE",
        adn_ordering: str = "ADN",
        dilation: Union[Sequence[int], int] = 1,
        spatial_dims: int = 3,
    ) -> None:
        super(DuckResidualBlock, self).__init__()

        self.residual = Convolution(
            spatial_dims,
            in_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=dilation,
        )

        self.conv1 = Convolution(
            spatial_dims,
            in_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=dilation,
        )

        self.conv2 = Convolution(
            spatial_dims,
            out_channels,
            out_channels,
            kernel_size=3,
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
            dilation=dilation,
        )

        self.norm = get_norm_layer(
            name=norm_name, spatial_dims=spatial_dims, channels=out_channels
        )

    def forward(self, x):
        identity = x

        x = self.conv1(x)
        x = self.conv2(x)

        identity = self.residual(identity)

        x += identity

        x = self.norm(x)

        return x


class SeparatedConvBlock(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        size: int = 3,
        act_name: Optional[Union[Tuple, str]] = "RELU",
        norm_name: Optional[Union[Tuple, str]] = "INSTANCE",
        adn_ordering: str = "ADN",
        spatial_dims: int = 3,
    ) -> None:
        super(SeparatedConvBlock, self).__init__()

        self.conv1 = Convolution(
            spatial_dims,
            in_channels,
            out_channels,
            kernel_size=(size, 1, 1) if spatial_dims == 3 else (size, 1),
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
        )

        self.conv2 = Convolution(
            spatial_dims,
            out_channels,
            out_channels,
            kernel_size=(1, size, 1) if spatial_dims == 3 else (1, size),
            adn_ordering=adn_ordering,
            norm=norm_name,
            act=act_name,
        )

        if spatial_dims == 3:
            self.conv3 = Convolution(
                spatial_dims,
                out_channels,
                out_channels,
                kernel_size=(1, 1, size),
                adn_ordering=adn_ordering,
                norm=norm_name,
                act=act_name,
            )
        else:
            self.conv3 = nn.Identity()

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)

        return x


class DuckBlock(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        act_name: Optional[Union[Tuple, str]] = "RELU",
        norm_name: Optional[Union[Tuple, str]] = "INSTANCE",
        adn_ordering: str = "ADN",
        spatial_dims: int = 3,
    ):
        super(DuckBlock, self).__init__()

        self.norm1 = get_norm_layer(
            name=norm_name, spatial_dims=spatial_dims, channels=in_channels
        )

        self.ws = WideScope(
            in_channels=in_channels,
            out_channels=out_channels,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
            spatial_dims=spatial_dims,
        )

        self.ms = MidScope(
            in_channels=in_channels,
            out_channels=out_channels,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
            spatial_dims=spatial_dims,
        )

        self.res1 = DuckResidualBlock(
            in_channels=in_channels,
            out_channels=out_channels,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
            spatial_dims=spatial_dims,
        )

        self.res2 = nn.Sequential(
            *[
                DuckResidualBlock(
                    in_channels=in_channels if i == 0 else out_channels,
                    out_channels=out_channels,
                    act_name=act_name,
                    norm_name=norm_name,
                    adn_ordering=adn_ordering,
                    spatial_dims=spatial_dims,
                )
                for i in range(2)
            ]
        )

        self.res3 = nn.Sequential(
            *[
                DuckResidualBlock(
                    in_channels=in_channels if i == 0 else out_channels,
                    out_channels=out_channels,
                    act_name=act_name,
                    norm_name=norm_name,
                    adn_ordering=adn_ordering,
                    spatial_dims=spatial_dims,
                )
                for i in range(3)
            ]
        )

        self.sepconv = SeparatedConvBlock(
            in_channels=in_channels,
            out_channels=out_channels,
            size=5,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
            spatial_dims=spatial_dims,
        )

        self.norm2 = get_norm_layer(
            name=norm_name, spatial_dims=spatial_dims, channels=out_channels
        )

    def forward(self, x_in):
        x_in = self.norm1(x_in)

        ws = self.ws(x_in)
        ms = self.ms(x_in)
        res1 = self.res1(x_in)
        res2 = self.res2(x_in)
        res3 = self.res3(x_in)
        sepconv = self.sepconv(x_in)

        x_final = ws + ms + res1 + res2 + res3 + sepconv

        x_final = self.norm2(x_final)

        return x_final

```

> /nets/ducket.py
```python
from typing import Optional, Sequence, Tuple, Union

import torch
import torch.nn as nn

from monai.networks.blocks.upsample import UpSample
from monai.networks.blocks.convolutions import Convolution
from monai.utils import ensure_tuple_rep

from layers import DuckBlock, DuckResidualBlock


class DuckNet(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        start_channels: int = 17,
        act_name: Optional[Union[Tuple, str]] = "RELU",
        norm_name: Optional[Union[Tuple, str]] = "INSTANCE",
        adn_ordering: str = "ADN",
        interp_mode: str = "nearest",
        align_corners: Optional[bool] = None,
        spatial_dims: int = 3,
    ):
        super(DuckNet, self).__init__()

        upsamle_size = ensure_tuple_rep(2, spatial_dims)

        self.down1 = Convolution(
            spatial_dims,
            in_channels,
            start_channels * 2,
            kernel_size=2,
            strides=2,
            padding=0
        )

        self.down2 = Convolution(
            spatial_dims,
            start_channels * 2,
            start_channels * 4,
            kernel_size=2,
            strides=2,
            padding=0
        )

        self.down3 = Convolution(
            spatial_dims,
            start_channels * 4,
            start_channels * 8,
            kernel_size=2,
            strides=2,
            padding=0
        )

        self.down4 = Convolution(
            spatial_dims,
            start_channels * 8,
            start_channels * 16,
            kernel_size=2,
            strides=2,
            padding=0
        )

        self.down5 = Convolution(
            spatial_dims,
            start_channels * 16,
            start_channels * 32,
            kernel_size=2,
            strides=2,
            padding=0
        )

        self.duck1 = DuckBlock(
            in_channels,
            start_channels,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )
        self.sub_down1 = Convolution(
            spatial_dims,
            start_channels,
            start_channels * 2,
            kernel_size=2,
            strides=2,
            padding=0
        )

        self.duck2 = DuckBlock(
            start_channels * 2,
            start_channels * 2,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.sub_down2 = Convolution(
            spatial_dims,
            start_channels * 2,
            start_channels * 4,
            kernel_size=2,
            strides=2,
            padding=0
        )
        self.duck3 = DuckBlock(
            start_channels * 4,
            start_channels * 4,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.sub_down3 = Convolution(
            spatial_dims,
            start_channels * 4,
            start_channels * 8,
            kernel_size=2,
            strides=2,
            padding=0
        )
        self.duck4 = DuckBlock(
            start_channels * 8,
            start_channels * 8,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.sub_down4 = Convolution(
            spatial_dims,
            start_channels * 8,
            start_channels * 16,
            kernel_size=2,
            strides=2,
            padding=0
        )
        self.duck5 = DuckBlock(
            start_channels * 16,
            start_channels * 16,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.sub_down5 = Convolution(
            spatial_dims,
            start_channels * 16,
            start_channels * 32,
            kernel_size=2,
            strides=2,
            padding=0
        )
        self.res1 = nn.Sequential(
            DuckResidualBlock(
                start_channels * 32,
                start_channels * 32,
                act_name=act_name,
                norm_name=norm_name,
                adn_ordering=adn_ordering,
                spatial_dims=spatial_dims,
            ),
            DuckResidualBlock(
                start_channels * 32,
                start_channels * 32,
                act_name=act_name,
                norm_name=norm_name,
                adn_ordering=adn_ordering,
                spatial_dims=spatial_dims,
            ),
        )
        self.res2 = nn.Sequential(
            DuckResidualBlock(
                start_channels * 32,
                start_channels * 16,
                act_name=act_name,
                norm_name=norm_name,
                adn_ordering=adn_ordering,
                spatial_dims=spatial_dims,
            ),
            DuckResidualBlock(
                start_channels * 16,
                start_channels * 16,
                act_name=act_name,
                norm_name=norm_name,
                adn_ordering=adn_ordering,
                spatial_dims=spatial_dims,
            ),
        )

        self.up1 = UpSample(
            spatial_dims=3,
            scale_factor=upsamle_size,
            mode="nontrainable",
            interp_mode=interp_mode,
            align_corners=align_corners
        )
        self.duck6 = DuckBlock(
            start_channels * 16,
            start_channels * 8,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.up2 = UpSample(
            spatial_dims=3,
            scale_factor=upsamle_size,
            mode="nontrainable",
            interp_mode=interp_mode,
            align_corners=align_corners
        )
        self.duck7 = DuckBlock(
            start_channels * 8,
            start_channels * 4,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.up3 = UpSample(
            spatial_dims=3,
            scale_factor=upsamle_size,
            mode="nontrainable",
            interp_mode=interp_mode,
            align_corners=align_corners
        )
        self.duck8 = DuckBlock(
            start_channels * 4,
            start_channels * 2,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )
        
        self.up4 = UpSample(
            spatial_dims=3,
            scale_factor=upsamle_size,
            mode="nontrainable",
            interp_mode=interp_mode,
            align_corners=align_corners
        )
        self.duck9 = DuckBlock(
            start_channels * 2,
            start_channels,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.up5 = UpSample(
            spatial_dims=3,
            scale_factor=upsamle_size,
            mode="nontrainable",
            interp_mode=interp_mode,
            align_corners=align_corners
        )
        self.duck10 = DuckBlock(
            start_channels,
            start_channels,
            spatial_dims=spatial_dims,
            act_name=act_name,
            norm_name=norm_name,
            adn_ordering=adn_ordering,
        )

        self.final_conv = Convolution(
            spatial_dims,
            start_channels,
            out_channels,
            kernel_size=1,
            act=act_name,
            norm=norm_name,
        )

    def forward(self, x):
        p1 = self.down1(x)
        p2 = self.down2(p1)
        p3 = self.down3(p2)
        p4 = self.down4(p3)
        p5 = self.down5(p4)

        t0 = self.duck1(x)
        l1i = self.sub_down1(t0)
        s1 = p1 + l1i
        t1 = self.duck2(s1)

        l2i = self.sub_down2(t1)
        s2 = p2 + l2i
        t2 = self.duck3(s2)

        l3i = self.sub_down3(t2)
        s3 = p3 + l3i
        t3 = self.duck4(s3)

        l4i = self.sub_down4(t3)
        s4 = p4 + l4i
        t4 = self.duck5(s4)

        l5i = self.sub_down5(t4)
        s5 = p5 + l5i
        t51 = self.res1(s5)
        t53 = self.res2(t51)

        l5o = self.up1(t53)
        c4 = l5o + t4
        q4 = self.duck6(c4)

        l4o = self.up2(q4)
        c3 = l4o + t3
        q3 = self.duck7(c3)

        l3o = self.up3(q3)
        c2 = l3o + t2
        q2 = self.duck8(c2)

        l2o = self.up4(q2)
        c1 = l2o + t1
        q1 = self.duck9(c1)

        l1o = self.up5(q1)
        c0 = l1o + t0
        z1 = self.duck10(c0)

        y = self.final_conv(z1)
        return y

```

# 效果
因为我自己Out of CUDA Memory无法给出一个很好的效果，因此放一下paper上的效果
![效果1](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/result1.png)

![效果2](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.0/result2.png)

# 参考文献

[Using DUCK-Net for polyp image segmentation](https://www.nature.com/articles/s41598-023-36940-5)

[DUCK-Net](https://github.com/RazvanDu/DUCK-Net)