---
title: matplotlib崩溃问题记录
tags:
  - python
  - bug
  - matplotlib
categories: python
description: 记录一下matplotlib的崩溃问题，因为这个东西忙了我一个多小时，最后发现原来是conda的问题。
date: 2021-11-04 23:28:44
---




# 前景提要
因为需要安装新的conda环境来进行新的项目，于是乎就新建了conda环境。装完seaborn后发现，图像没法显示。经过一系列的排查后发现问题出在了matplotlib上。

# 问题复现
## 测试代码
```python
import numpy as np 
from matplotlib import pyplot as plt 
import matplotlib

x = np.arange(1,11) 
y =  2  * x +  5 
plt.title("test") 
 
plt.xlabel("x ")
plt.ylabel("y ")
plt.plot(x,y) 

plt.show()
```
## 问题截图
可以看到运行结果一篇空白，然后程序崩溃。
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.9/screenshot.png)

# 解决
这个问题有点恶心的地方在于基本找不到错误信息，在尝试过降级、重启、重装后也没有解决。在我身边的人同样碰到这个问题的时候，我意识到这不是我个人的问题，于是乎在github的issue找到了解答。问题处在了matplotlib的依赖上。需要将`freestyle`包从`2.11.0`降到`2.10.4`。随后问题解决。
```bash
conda install freetype==2.10.4 --force-reinstall
```

# 后记
这个问题似乎是`conda-forge`的依赖配置不对，没试过`pip`能不能解决，希望后续能够修复。

# 参考资料
[[Bug]: Matplotlib crashes Python](https://github.com/matplotlib/matplotlib/issues/21511)

[After conda update, python kernel crashes when matplotlib is used](https://stackoverflow.com/questions/69786885/after-conda-update-python-kernel-crashes-when-matplotlib-is-used/69788527#69788527)