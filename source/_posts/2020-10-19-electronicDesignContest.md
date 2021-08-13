---
layout: post
title: "电赛"
subtitle: "正式电赛 模拟电磁曲射炮"
date: 2020-10-19 14:00:00
author: "qxdn"
top_img: /images/electronicDesignContest/bg.jpg
cover: /images/electronicDesignContest/bg.jpg
tags: 
    - 电赛
    - C
    - C++
    - 软件
    - 硬件
categories: C
---


## 电赛选题
我作为组长和[李志豪](https://github.com/while0l1)、[任睿](https://github.com/renruiwhut)一起参加了2019年的电赛。说到组长的选择其实也是很随意，就是投骰子比小，最小的做组长。2019年的题目可以见[这里](https://www.nuedc-training.com.cn/index/news/details/new_id/154.html)，我们当时主要在F题和H题里面纠结，我主张F题，而李志豪强烈反对，因为我们缺少传感器，而且一时没有解决方法，因此我们选择了H题。

<!--more-->

## 题目要求
题目的具体要求和测试结果见[这](https://www.nuedc-training.com.cn/index/news/details/new_id/153)

![参考图片](/images/electronicDesignContest/problem.png)

### 基本要求
  1. 电磁炮能够将弹丸射出炮口。
  2. 环形靶放置在靶心距离定标点200~300cm间，且在中心轴线上的位置处，键盘输入距离d值，电磁炮将弹丸发射至该位置，距离偏差的绝对值不大于50cm。
  3. 用键盘给电磁炮输入环形靶中心与定标点的距离d 及与中心轴线的偏离角度a，一键启动后，电磁炮自动瞄准射击，按击中环形靶环数计分；若脱靶则不计分。

### 发挥部分
  1. 在指定范围内任意位置放置环形靶（有引导标识，参见说明2），一键启动后，电磁炮自动搜寻目标并炮击环形靶，按击中环形靶环数计分，完成时间≤30s。
  2. 环形靶与引导标识一同放置在距离定标点d=250cm 的弧线上（以靶心定位），引导标识处于最远位置。电磁炮放置在定标点，炮管水平方向与中轴线夹角a =-30°、仰角0°。一键启动电磁炮，炮管在水平方向与中轴线夹角a从-30°至30°、再返回-30°做往复转动，在转动过程中（中途不得停顿）电磁炮自动搜寻目标并炮击环形靶，按击中环形靶环数计分，启动至击发完成时间≤10s。
  3. 其他。


## 制作电磁炮
使用漆包线包裹发射管，我们制作了电磁炮的炮管。使用Boost电路制作升压，电容来存储能量。关于控制电磁炮发射距离使用的是固定发射电压、调整发射角度的方法，使用的方法是使用MATLAB进行数据拟合。测量距离使用openmv中距离和像素的大小成反比的关系。系统结构图、DC-DC电路如下图所示。
![系统结构图](/images/electronicDesignContest/structure.png)
![DC-DC](/images/electronicDesignContest/DC-DC.png)

## 实物
![railgun](/images/electronicDesignContest/railgun.jpg)

## 报告
[报告](/others/railgunReport.docx)

## 代码
我们组的电赛代码在[这](https://github.com/qxdn/BIg-Ivan)，取名大伊万（笑）。这里面还包含一些训练时期的项目，都在git分支里面。

## 结果
在省赛和国赛的时候都打了全十环（不得不说运气真好），然后公费去上海同济玩了几天。最终结果就是获得了一个H题的国一了，不算国家奖学金的话，这是我获得的第一个竞赛国奖。
![同济现场](/images/electronicDesignContest/edc.jpg)