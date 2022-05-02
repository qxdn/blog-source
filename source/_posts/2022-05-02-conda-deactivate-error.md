---
title: conda deactivate报错UnicodeEncodeError
tags:
  - python
  - conda
categories: python
description: 使用conda deactivate的时候报了个UnicodeEncodeError，因此简单记录一下解决过程
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.2/cover.png
date: 2022-05-02 23:52:13
---


> 封面: 《俺の恋天使がポンコツすぎてコワ～い》

# 描述
在运行conda deactivate的时候碰到了一个bug
```
UnicodeEncodeError: 'gbk' codec can't encode character '\u03a2' in position 945: illegal multibyte sequence
```

![error](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.2/error.png)


# 错误原因
这是很明显是编码问题，遇到了中文字符。而问题在于哪里出现了中文，因为我在安装编程相关软件时都不会使用中文路径，因此很奇怪这个中文在哪里。然后仔细查看整个记录找到了一处中文，然后发现这个东西在环境变量里面，根据位置查找是`微信web开发者工具`

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.2/find.png)

# 解决方法
因为我不怎么需要使用微信web开发助手，因此直接从环境遍历里面删除这个环境变量即可。

![问题解决](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.2/fix.png)

# 后记
现在除了安装路径要注意中文外，还得注意环境变量里有没有中文了555