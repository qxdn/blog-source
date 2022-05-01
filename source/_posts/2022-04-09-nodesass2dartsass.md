---
title: 用dart-sass替换node-sass
tags:
  - nodejs
  - javascript
  - sass
categories: javascript
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.2/cover.png
description: >-
  之前实验室流传下来的项目因为nodejs的版本不一致，导致node-sass这个模块一直装不上。之前一直用docker运行，但是现在需要大量改动，使用docker方便部署但是不方便开发。因此解决该问题很重要。
date: 2022-04-09 16:23:08
---


> 封面 《あにまる☆ぱにっく》

# 问题描述
使用`yarn install`命令的时候无法安装依赖，具体问题如下

![error](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.2/error.png)


```log
[4/4] Building fresh packages...
[1/4] ⠠ core-js
[2/4] ⠠ node-sass
[-/4] ⠠ waiting...
error D:\Code\zju_project\2021\temp\alsprj_fe\node_modules\node-sass: Command failed.
```

仔细查看描述可以看到，主要错误是node-sass引起的。查看node-sass的[READEME](https://github.com/sass/node-sass)可以看懂node-sass对node的版本有要求。我node16支持的是node-sass 7.0+而原本的是给4.14不支持

> NodeJS  | Supported node-sass version | Node Module
> --------|-----------------------------|------------
> Node 17 | 7.0+                        | 102
> Node 16 | 6.0+                        | 93
> Node 15 | 5.0+, <7.0                 | 88
> Node 14 | 4.14+                       | 83
> Node 13 | 4.13+, <5.0                 | 79
> Node 12 | 4.12+                       | 72
> Node 11 | 4.10+, <5.0                 | 67
> Node 10 | 4.9+, <6.0                  | 64
> Node 8  | 4.5.3+, <5.0                | 57
> Node <8 | <5.0                        | <57

# 解决方案

其中一个解决方法是更换node版本,在unix系统上有n这类工具,而windows没有。另一个解决方案就是本次提到的用dart-sass替换node-sass。直接替换还不行，需要改名，因此执行下面的命令即可。

```bash
yarn add node-sass@npm:dart-sass
```

![运行结果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.2/result.png)

安装完成，运行`yarn start`可以看到项目正常运行


# 参考文献
[使用dart-sass代替node-sass](https://zhuanlan.zhihu.com/p/168018388)