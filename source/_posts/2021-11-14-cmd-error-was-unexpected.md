---
title: CMD错误 此时不应有&
tags:
  - Windows
  - cmd
categories: Windows
description: >-
  vscode运行java插件的时候莫名其妙的碰到了cmd的错误，只提示“此时不应有&”。已开始还以为是插件的问题，经过一番排查发现这是cmd的问题。不知道哪个软件改的注册表导致的。
cover: /images/cmd-error-was-unexpected/cover.png
date: 2021-11-14 22:39:27
---


> 封面《ノラと皇女と野良猫ハート》

# 问题描述
打开cmd的时候直接出错，提示“此时不应有&”，英文版应该是“& was unexpected at this time”。问题的实际情况见下图。

![](/images/cmd-error-was-unexpected/error.png)

# 问题解决
幸运的是在stack overflow上能够找到解决方案。首先经过测试`cmd.exe /d`能够正常运行。`cmd.exe /d`命令可以阻止注册表中的`AutoRun`运行。这一点可以在`cmd.exe /?`中查看有哪些注册表需要检查。

需要查阅的注册表一共有两处
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Command Processor
```
使用`Win+R`并输入`regedit`打开注册表。查询结果如下

![](/images/cmd-error-was-unexpected/regedit1.png)

![](/images/cmd-error-was-unexpected/regedit2.png)

可以看到`HKEY_CURRENT_USER\SOFTWARE\Microsoft\Command Processor`的`AutoRun`中有一个奇怪的值。这里直接删除即可，或者运行下面的指令。

```powershell
# 查询所有定义了AutoRun的位置
Get-ItemProperty -ea Ignore ('HKCU:', 'HKLM:' -replace '$', '\Software\Microsoft\Command Processor') AutoRun 
# 查看如果执行了命令会发生什么
Get-ItemProperty -ea Ignore ('HKCU:', 'HKLM:' -replace '$', '\Software\Microsoft\Command Processor') AutoRun | Remove-
ItemProperty -Name AutoRun -WhatIf
# 删除 -WhatIf即可执行命令
Get-ItemProperty -ea Ignore ('HKCU:', 'HKLM:' -replace '$', '\Software\Microsoft\Command Processor') AutoRun | Remove-
ItemProperty -Name AutoRun
```

![运行结果](/images/cmd-error-was-unexpected/solution.png)

![运行后的注册表](/images/cmd-error-was-unexpected/result1.png)

![运行后正常的CMD](/images/cmd-error-was-unexpected/result2.png)

# 后记
这个奇葩的小问题有点难受，不知道是哪个软件干的。所幸stack overflow上有问题的定位方法和解决过程。

# 参考资料
[cmd.exe throws error "& was unexpected at this time."](https://stackoverflow.com/questions/59480657/cmd-exe-throws-error-was-unexpected-at-this-time)
