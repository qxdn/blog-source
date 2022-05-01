---
title: tmux vs screen
tags:
  - Linux
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/top-img.png
categories: Linux
date: 2021-03-28 21:10:26
description: 本文将对tmux与screen命令的使用进行比较，并简单的进行对比
swiper_index: 8
---


本文将对tmux与screen命令的使用进行比较，并简单的进行对比。

封面图片来源《妄想破绽》
<!--more-->

# 前言
你是否有过在SSH连接远程终端的时候，需要同时后台运行多个程序，抑或是需要开启多个终端进行观察。那么你需要一个终端复用程序，比如`tmux`或者`screen`。`tmux`和`screen`命令差不多，都是终端复用程序，你还可以在SSH断开后重新连接端口继续执行命令。

# 安装
如果你的Ubuntu没有`tmux`或者`screen`，那么你可以使用如下命令进行安装

`tmux`:
```bash
sudo apt install tmux
```

`screen`:
```bash
sudo apt install screen
```

# 使用
## tmux
### 简单创建
```bash
tmux
```
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/simple-tmux.png)

[0]0:zsh* : 意味着现在是session name为0，session number为0，环境为zsh，*意味着当前窗口

"DESKTOP-7A4A8RD" : hostname

18:59 28-Mar-21 : 当前时间

### 创建一个有名字的session
```bash
tmux new -s <session-name>
```
此时可以看到原本[0]里面的0变成了设置的session-name

### 竖直分离窗口
在`tmux`窗口中按下`ctrl+b`然后再按下`%`
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/tmux-vertically.png)

### 水平分离窗口
在`tmux`窗口中按下`ctrl+b`然后再按下`"`
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/tmux-horizontally.png)

### 展示会话编号
在`tmux`窗口中按下`ctrl+b`然后再按下`q`
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/tmux-number.png)

### 切换窗口
在`tmux`窗口中按下`ctrl+b`然后再按下`o`

### 关闭窗口
在`tmux`窗口中按下`ctrl+b`然后再按下`x`或者`ctrl+d`

### 列出已有tmux
在`tmux`窗口中按下`ctrl+b`然后再按下`s`
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/tmux-list.png)

### 分离会话
在`tmux`窗口中按下`ctrl+b`然后再按下`d`或者
```bash
tmux detach
```

### 重连会话
```bash
tmux attach -t <session-name>
```

### 杀死会话
```bash
tmux kill-session -t <session-name>
```

## screen
```bash
screen [-AmRvx -ls -wipe][-d <作业名称>][-h <行数>][-r <作业名称>][-s <shell>][-S <作业名称>]
```
wsl中使用`screen`提示权限不足可以参考本文末尾的[wsl中提示screen需要root权限解决](#wsl中提示screen需要root权限解决)

### 创建简单窗口
在`screen`窗口中按下`ctrl+a`然后再按下`c`
```bash
screen
```
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/simple-screen.png)

### 创建终端并运行命令
```bash
screen vi main.c
```
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/screen-simple-command.png)

### 离开screen终端
在`screen`窗口中按下`ctrl+a`然后再按下`d`

### 显示已经创建的screen
在`screen`窗口中按下`ctrl+a`然后再按下`"`
```bash
screen -ls
```
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/screen-list.png)
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/screen-list2.png)

### 重新连接会话
```bash
screen -r <id>
```

### 水平分割
在`screen`窗口中按下`ctrl+a`然后再按下`|`，只会分割而不会创建新的session。使用`ctrl+a`然后按下`tab`切换窗口，`ctrl+a`然后按下`c`新建session。下同
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/screen-horizontally.png)

### screen竖直分割
在`screen`窗口中按下`ctrl+a`然后再按下`S`。注意大写
![效果图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.3.2/screen-vertically.png)

### 分割中切换窗口
使用`ctrl+a`然后按下`tab`切换窗口

### 杀死session
使用`ctrl+d`

# 对比
`screen`和`tmux`都是终端复用，大体的功能上都差不多，`tmux`是BSD协议，`screen`是GNU协议。从个人感觉上`tmux`对个人更友好，在分割窗口 时候自动创建新会话，同时有状态条显示，还可以自动命名窗口，这是`screen`没有的。`screen`可以和其他用户分享会话，而`tmux`不行。

# wsl中提示screen需要root权限解决
参考[superuser](https://superuser.com/questions/1195962/cannot-make-directory-var-run-screen-permission-denied)
```bash
mkdir ~/.screen && chmod 700 ~/.screen
```
可以把下面这一句放进`~/.bashrc`
```bash
export SCREENDIR=$HOME/.screen
```

# 参考
[Tmux vs. Screen tool comparison](https://linuxhint.com/tmux_vs_screen/)
[How to Use tmux on Linux (and Why It’s Better Than Screen)](https://www.howtogeek.com/671422/how-to-use-tmux-on-linux-and-why-its-better-than-screen/)
[使用tmux分屏（既可以左右分屏，也可以上下分屏）](https://blog.csdn.net/yuanxinfei920/article/details/78712990)
[Tmux 使用教程](http://www.ruanyifeng.com/blog/2019/10/tmux.html)
[Linux screen命令](https://www.runoob.com/linux/linux-comm-screen.html)
[Cannot make directory '/var/run/screen': Permission denied](https://superuser.com/questions/1195962/cannot-make-directory-var-run-screen-permission-denied)