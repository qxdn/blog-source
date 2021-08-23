---
title: 为powershell添加sudo
tags:
  - powershell
  - Windows
categories: Windows
top_img: /images/powershell-sudo/cover.png
cover: /images/powershell-sudo/cover.png
date: 2021-08-23 15:39:08
---



win10本生没有sudo，每次需要管理员操作的时候都需要在开始处右键点击使用管理员模式运行，因此想为win10增加一个unix-like的sudo。
封面《Riddle Joker》
<!--more-->

# 前言
`sudo`是unix-like的一种提权操作，使得普通用户可以以root用户的权限做一些操作。放在windows里面就是以管理员权限运行。但是win10里面没有这种命令，需要打开powershell的时候就以管理员模式打开，这样往往会很麻烦，而且重新打开后会没有之前的记录。如果有个sudo命令会减少很多操作。

# 方法一 powershell函数（不推荐）
参考stack overflow的方法，提示使用[Start-Process](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/start-process?view=powershell-7.1)函数
```powershell
notepad $PROFILE
```
编辑`$PROFILE`文件，如果不存在则会提示创建。往里面新增一下语句
```powershell
function sudo {
    Start-Process @args -verb runas
}
```

## 缺点
用此方法存在以下缺点
- 每次都需要进行UAC验证，没有像Linux的缓存只需要输第一遍密码，用此方法每次都需要验证
- 每次都会新建窗口，每次都会新建一个窗口来执行命令，不利于DEBUG。（可以试一试`npm install`，我手速慢没截到）
- 只支持powershell不支持cmd

# 方法二 使用gsudo（推荐）
在搜索方法的时候，我发现许多人推荐[gsudo](https://github.com/gerardog/gsudo)，使用后发现`gsudo`比较符合我的要求。
在此我使用`winget`安装，当然也可以去[release](https://github.com/gerardog/gsudo/releases)下载安装文件
```powershell
winget install gsudo
```
![](/images/powershell-sudo/install.png)
使用`gsudo`无需新建窗口，同时可以通过配置来实现权限缓存。
```powershell
gsudo config CacheMode auto
```
![](/images/powershell-sudo/test1.png)
![](/images/powershell-sudo/test2.png)

# 参考文献
[How to sudo on powershell on Windows](https://stackoverflow.com/questions/55314557/how-to-sudo-on-powershell-on-windows)

[Start-Process](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/start-process?view=powershell-7.1)

[gsudo](https://github.com/gerardog/gsudo)