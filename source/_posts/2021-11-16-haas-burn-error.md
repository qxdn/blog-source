---
title: haas100烧录失败问题解决
tags:
  - c
  - haas
categories: c
description: 物联网课发的haas100板子碰到了无法烧录问题，且该版本的haas1000_write_flash_main无法使用
cover: /images/haas-burn-error/cover.png
date: 2021-11-16 22:41:09
---


> 封面《Eスクールライフ》

# 问题描述
haas100无法进行烧录，报错`Please connect the serial port of th board to the PC,then reset the board.`。

![烧录错误](/images/haas-burn-error/error-in-burn.png)

# 问题解决方案
`Please connect the serial port of th board to the PC,then reset the board.`这个问题找不到啥解决资料，官方群里问了也没有没人回应。只能自己翻阅一下haas百事通查查有没有类似资源。找到了其中一条信息如下：

> 【情形5】: 提示“Please reboot board now”
解决办法：目前发现部分HaaS100/ EDU K1 由于出厂固件中没有二级boot，现象就是一直提名用户please reboot board now；遇到该问题的同学请先参考这个文档请用下面链接中的“Windows GUI”工具烧录即可解决。之后再用vscode + haas studio烧录也不会出现问题。

由此我们初步猜测可能是二级boot出了问题，导致haas studio无法对haas100进行软重启。因此我们打开`{Your Project}\hardware\chip\haas1000\release\write_flash_gui`运行其中的`haas1000_write_flash_main.exe`。结果发现闪退。无法发现明显原因，那么我们从命令行打开，很明显的就能看到错误原因。比较明显是阿里的人员在编译烧录工具出了问题。

![gui错误](/images/haas-burn-error/error-in-gui.png)

考虑到之前有人使用该工具烧录成功过，且该工具是使用git clone下来的。那么可以去github找找看有哪个版本的是烧录的。

```bash
git clone https://github.com/alibaba/AliOS-Things.git -b dev_3.1.0_haas
```

执行上面的git命令，打开`{your path}/AliOS-Things/platform/mcu/haas1000/release/write_flash_gui`目录中的`haas1000_write_flash_main.exe`。这次可以看到gui工具打开成功了。

![](/images/haas-burn-error/gui.png)

后续的工作就和官方的操作一样了，官方教程链接放在了底下的参考资料中，但是需要注意的是我们不是只升级二级boot，而是全部重新烧写。

![成功全部烧写](/images/haas-burn-error/gui-burn.png)

最后测试能否烧写我们的工程，烧写结果如下所示。我的代码成功的烧录进了板子中。

![烧录结果](/images/haas-burn-error/burn-success.png)

![运行结果](/images/haas-burn-error/result.png)

# 外谈
运行`aos make clean`发现出错，错误原因见下
```
/usr/bin/bash: -c: line 1: syntax error: unexpected end of file
```
![](/images/haas-burn-error/clean-error.png)

这个问题倒是比较常见，因为Windows的EOL(End of Line)是由回车CR和换行LF组成，这也是为什么我们需要在串口输出中加上\r\n才能换行。而Linux中的EOL是LF。因此在Linux中运行Windows中写的文件会有这个问题。
从错误开头的`/usr/bin/bash`可以发现是Linux的bash，个人推测这个应该是因为我的电脑里面装有wsl2。从makefile看一下需要删除的文件。
```makefile
ifeq ($(OS), Windows_NT)
	$(CPRE) if exist aos_sdk rmdir /s /q aos_sdk
	$(CPRE) if exist binary rmdir /s /q binary
	$(CPRE) if exist out rmdir /s /q out
	$(CPRE) if exist aos.elf del /f /q aos.elf
	$(CPRE) if exist aos.map del /f /q aos.map
```

观察发现aos_sdk文件夹为*.a应该是到时候要链接的类库，EOL是LF。out文件夹里面是*.d，*.o还有bin文件，基本上为编译中间产物和最终文件，EOL为CRLF，aos.elf和aos.map的ROL都是CRLF，同时发现执行`aos make clean`后就删除了aos_sdk中的内容。

明白了原因就很容易解决该问题了。看makefile中的命令，应该是用cmd运行。因此只需要在makefile的第一行加上一句`SHELL := C:\Windows\System32\cmd.exe`。指定运行的shell为cmd即可。修改后的运行结果如下。
![](/images/haas-burn-error/clean-success.png)


# 后记
在成功烧写后，我玩了一下haas100这块板子，感觉板子还是不错，做的还行。但是这个开发工具实在不行，问题有点多。希望阿里能够完善一下，不然这个工具就会劝退好多人了。

# 参考资料
[如何升级HaaS100 / HaaS EDU K1的二级boot](https://blog.csdn.net/HaaSTech/article/details/119028477)

[烧录固件](https://help.aliyun.com/document_detail/302383.html)