---
layout: post
title: "节能减排"
subtitle: "基于光伏天窗的精细化设计和多感知控制的节能屋顶"
date: 2020-10-19 23:00:00
author: "qxdn"
top_img: /images/energySavingContest/bg.jpg
cover: /images/energySavingContest/bg.jpg
tags: 
    - 节能减排
    - C
    - C++
    - java
    - Spring
    - 软件
    - 硬件
categories: web
---


## 前言
原先的校内初选中，我最先参加的与能动学院一起的节能减排做纵倾优化的船，但是没有通过初审。于是和汪博文、赵之清、胡群强、王瑞林、任睿、孙文滨一起参加节能减排大赛，制作光伏屋顶。


## 研制背景
传统光伏屋顶的发电效率比较低，因此我们考虑将一部分光伏板换成天窗使用。由于天窗会有灰尘雨水等，比较容易脏，需要人力清除成本。因此我们对天窗挡板做智能处理，能够根据天气光照自动控制开合角度，使得光照最大化同时减少人力清理成本。根据贾博文老师说，这个貌似是根据他在新加坡看到的直接更改的。

## 实物
我们主要制作了[智能设计平台](http://101.133.235.188/)(现在应该上不去了)、手机控制平台和光伏屋顶。三个之间的通信主要是使用MQTT协议。
![智能设计网页](/images/energySavingContest/design.png)
![智能控制平台](/images/energySavingContest/controller.png)
![光伏屋顶](/images/energySavingContest/roof.gif)

## 代码
[智能设计平台](https://github.com/qxdn/sunbest)、[天窗控制平台](https://github.com/qxdn/WindowController)和[实物与8266代码](https://github.com/qxdn/EnergySaveRoof)因为疫情原因而且组员也不是很会因此实物代码比较老、但是8266的代码是最新的。

## 结果
最后还是只得了一个国三，如果再做的好一点也许就能过了网申冲击国二、国一了。

