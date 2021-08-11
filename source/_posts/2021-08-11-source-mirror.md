---
layout: drafts
title: 常用软件镜像源
date: 2021-08-11 21:27:23
tags:
    - python
    - java
    - Linux
    - javascript
    - 树莓派
categories: 杂项
top_img: /images/source-mirror/cover.png
cover: /images/source-mirror/cover.png
---

为了制作魔镜，重装了树莓派系统。因为要将各种软件源设置镜像源，因此写这样一条博客方便自己查询。
封面《9-nine-NewEpisode》
<!--more-->

# 前言
其实各个镜像源站都写有各自的设置的方式，本文基本上只是搬运和整合，附上自己的一点点感受。此处列出我常用的镜像站
- [阿里云镜像站](https://developer.aliyun.com/mirror/):个人觉得最好用的镜像站，速度快且稳定，之前维护时间很长我还以为阿里不搞了，最近恢复了
- [清华镜像站](https://mirrors.tuna.tsinghua.edu.cn/):印象里anaconda之前因为版权问题，镜像源全部下架。后来好像清华源经过交涉重新构建了镜像源。因此现在conda镜像用清华，不过有时候下载还是不好用
- [浙大镜像站](http://mirrors.zju.edu.cn/):这个没用过，感觉不是很好，之后在浙大校园内再试一试

# 树莓派镜像
打开`/etc/apt/sources.list`，修改为以下内容。需要注意不同版本有所不同
```
deb https://mirrors.aliyun.com/raspbian/raspbian/ buster main non-free contrib
deb-src https://mirrors.aliyun.com/raspbian/raspbian/ buster main non-free contrib
```

# Ubuntu镜像
同样是打开`/etc/apt/sources.list`，将`https://archive.ubuntu.com/`替换为`mirrors.aliyun.com`，由于要改的地方较多，建议先备份一下。
以ubuntu20.04为例子大致如下
```
deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse
```

# github镜像
github在国内的访问时好时坏，用VPN的时候会好一点，但是没VPN的时候就很难受。有修改DNS的方法，以前觉得还行，不过好像最近使用的时候不太好用

## 镜像站
此处推荐一个本人觉得不错的镜像站
[https://github.com.cnpmjs.org/](https://github.com.cnpmjs.org/):下载时只需要将`github.com`替换为`github.com.cnpmjs.org`即可。
例子如下
```bash
# 原本
git clone https://github.com/qxdn/live2d-widget.git
# 镜像源
git clone https://github.com.cnpmjs.org/qxdn/live2d-widget.git
```
## cdn
此处推荐一个本人常用的cdn。
[jsdelivr](https://www.jsdelivr.com/):除了github以外还可以加速npm。用法也很简单，在官网有说。
简单例子如下
```bash
# 原本
https://raw.githubusercontent.com/qxdn/live2d-widget/master/autoload.js
# 镜像源
https://cdn.jsdelivr.net/gh/qxdn/live2d-widget@latest/autoload.js
```

# java
java中举一下`maven`的例子，因为本人基本上都用的是`maven`，没怎么使用`gradle`就不提`gradle`。

一般来说`maven`的配置文件在`conf/settings.xml`里面，找到`<mirrors></mirrors>`添加如下代码
```xml
<mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

# python

## pip
### 单次使用
以安装`httpx`为例子
```bash
# 原本安装
pip install httpx
# 镜像源
pip install -i https://mirrors.aliyun.com/pypi/simple/ httpx
```
### 长期使用
Linux下找到`~/.pip/pip.conf`,Windows下新建`C:\Users\{Your User Name}\pip\pip.ini`文件。修改内容如下
```ini
[global]
index-url = https://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host=mirrors.aliyun.com
```

## conda
修改用户目录下的`.condarc`文件，对于windows用户可能要先执行一遍`conda config --set show_channel_urls yes`才行。修改完后可能还需要执行`conda clean -i`来清理缓存。
```yaml
channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  msys2: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  bioconda: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  menpo: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  simpleitk: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
```

# javascript
npm镜像一般都是使用的淘宝镜像，此外还有一个cnpm工具专门用于代理淘宝的npm
[淘宝npm镜像](http://npm.taobao.org/):本文撰写期间在维护升级，还不清楚能不能正常使用。不过之前阿里云镜像维护期间也能正常使用，应该只是web页面升级不影响使用。
[cnpm](https://cnpmjs.org/):用于代理淘宝镜像的npm工具，国内很好用
## 临时使用
```
npm --registry https://registry.npm.taobao.org install hexo
```
## 长期使用
```bash
npm config set registry https://registry.npm.taobao.org
# 验证是否成功方法
npm config ls
```

## 使用cnpm
```bash
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install hexo
```

# 总结
本文为常用软件镜像源的归档，方便本人在后续使用时翻阅，如果遇到了问题还请去镜像站看下使用方法。



