---
layout: post
title: "升级到WSL2"
subtitle: "将WSL1升级到WSL2的踩坑记录"
date:  2020-10-24
author: "qxdn"
top_img: /images/post-upgradeWSL/bg.png
cover: /images/post-upgradeWSL/bg.png
tags:
    - Windows
    - Linux
    - WSL
categories: Linux
---


## 前言
因为一些个人原因，需要将原先的WSL1升级到WSL2，参考[微软文档](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10)，记录踩坑

## 一、检查版本
对于x64系统目前的要求是`1903`或者更高,`Build 18362`或者更高。使用`win+R`输入`winver`来检查自己的版本
![version](/images/post-upgradeWSL/version.png)

## 二、启动虚拟机功能
管理员模式启动powershell输入
```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
![启动虚拟机功能](/images/post-upgradeWSL/enableVMFeature.png)
**然后重启电脑**

## 三、下载Linux内核升级包

下载最新[升级包](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)
![package](/images/post-upgradeWSL/package.png)

## 四、设置WSL2作为默认版本
管理员powershell中运行
```powershell
wsl --set-default-version 2
```

## 五、转换WSL
使用该指令查看wsl状态
```powershell
wsl -l -v
```
我的输出
```powershell
  NAME      STATE           VERSION
* Ubuntu    Stopped         1
```
转换WSL
```powershell
wsl --set-version Ubuntu 2
```
输出
```powershell
正在进行转换，这可能需要几分钟时间...
有关与 WSL 2 的主要区别的信息，请访问 https://aka.ms/wsl2
请启用虚拟机平台 Windows 功能并确保在 BIOS 中启用虚拟化。
有关信息，请访问 https://aka.ms/wsl2-install
```
这里在我搜索了[issue](https://github.com/microsoft/WSL/issues/5363)后发现主要还是Hyper-V、虚拟平台等问题，可以试一试管理员模式运行以下指令
```powershell
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
bcdedit /set hypervisorlaunchtype auto
```
最主要的应该是
```powershell
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
bcdedit /set hypervisorlaunchtype auto
```

重新转换
![转换完成](/images/post-upgradeWSL/converted.png)

## 后记
VMware老版本与Hyper-V冲突，得找个时间去更新到最新版本兼容

