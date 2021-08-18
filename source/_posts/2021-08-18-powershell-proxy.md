---
title: powershell设置代理
tags:
  - powershell
  - Windows
  - Terminal
categories: 杂项
top_img: /images/powershell-proxy/cover.png
cover: /images/powershell-proxy/cover.png
date: 2021-08-18 13:11:57
---



本文主要是为powershell、cmd等windows终端设置代理
封面《LAMUNATION！》
<!--more-->

# 前言
在powershell中使用一些工具下载外网资源的时候经常会碰到一些网络问题。这些时候往往设置一下VPN的代理模式为全局代理即可。但往往有些时候设置全局代理也没用，亦或者一时没法切换代理模式（比如Chrome下载一些资源的时候），这些时候就需要设置powershell的代理了。

# powershell设置代理

## 查看代理
```powershell
netsh winhttp show proxy
```
![](/images/powershell-proxy/show-proxy.png)

可以虽然我设置了VPN（非全局模式），但是其依然显示直接连接

## 设置代理
```powershell
# 需要管理员权限
# 否则 Error writing proxy settings. (5) Access is denied.
netsh winhttp set proxy 127.0.0.1:41091
# or
netsh winhttp import proxy source=ie
```
![](/images/powershell-proxy/set-proxy.png)

下面这个不用管理员权限也可，不过无法直接查看。第一次遇见是在vcpkg中使用
```powershell
$env:HTTP_PROXY="http://127.0.0.1:41091"
$env:HTTPS_PROXY="https://127.0.0.1:41091"
```

## 取消代理
```powershell
netsh winhttp reset proxy
```
![](/images/powershell-proxy/reset-proxy.png)

# 参考文献
[Using PowerShell Behind a Proxy Server](http://woshub.com/using-powershell-behind-a-proxy/)

[Windows为cmd/powershell设置代理](https://www.jianshu.com/p/7d08b3c2be95)
