---
title: win10家庭版下安装docker
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.5/top.png
date: 2021-03-18 16:20:13
tags:
  - docker
  - Windows
categories: docker
description: docker的安装记录
---


因为装软件、装环境老是折腾，就开始思考各个生产环境之间隔离或者直接使用他人配好的环境。因而想到了人们常说的docker。因此打算安装来体验一下
<!--more-->

# 系统要求
根据官方文档，`Docker Desktop on Windows`需要win10专业版、企业版或者教育版(Build 17134 or later)。而我的电脑为win10家庭版，因此选择另一套方案。

win10家庭版的系统要求如下

- win10 v1903版本或者更高 
- 开启WSL2
    - 64位处理器且有SLAT指令
    - 4G内存
    - BIOS开启虚拟化
- 下载并升级[linux内核包](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10#step-4---download-the-linux-kernel-update-package)

# 安装
1. 下载[Docker Desktop Installer](https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe)并双击运行
2. 确保WSL2那个特性打开
    ![enable WSL2](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.5/dockerInstallerConfig.png)
3. 跟着安装帮助即可

## 错误
我就知道安装没有这么容易，果然碰到了问题。
![error](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.5/error.png)
通过`everything`我找到了`install-log.txt`。然而里面的关键信息就这么点。明明已经用管理员运行了，但是还是未授权。
```log
Exception type: System.Exception, Exception message: Component CommunityInstaller.AutoStartAction failed: 尝试执行未经授权的操作。, StackTrace:
   在 CommunityInstaller.InstallWorkflow.<DoHandleD4WPackageAsync>d__29.MoveNext()
--- 引发异常的上一位置中堆栈跟踪的末尾 ---
   在 System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()
   在 System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)
   在 CommunityInstaller.InstallWorkflow.<DoProcessAsync>d__23.MoveNext()
```
就在我一筹莫展的时候，我看到了一个服务器部署win10服务未授权解决的文章，说是360阻断了。于是我尝试将我的联想电脑管家关闭，果然安装成功了。
![docker](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.5/docker.png)

# 参考档案
[docker for win10 pro](https://docs.docker.com/docker-for-windows/install/)

[docker for win10 home](https://docs.docker.com/docker-for-windows/install-windows-home/)

[WSL2安装](https://qianxu.run/2020/10/24/upgradeWSL2/)

[灵感](https://blog.csdn.net/qq736150416/article/details/80137675)