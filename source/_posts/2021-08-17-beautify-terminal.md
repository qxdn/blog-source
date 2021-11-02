---
title: 美化终端
tags:
  - Windows
  - Terminal
categories: 杂项
top_img: /images/beautify-terminal/cover.png
cover: /images/beautify-terminal/cover.png
date: 2021-08-17 18:04:45
description: 不小心将oh-my-posh从V2升级到了V3，许多东西有了较大变化。此篇博客记录一下主题的修改记录。
swiper_index: 1
---


不小心将oh-my-posh从V2升级到了V3，许多东西有了较大变化。此篇博客记录一下主题的修改记录。
封面《月に寄りそう乙女の作法》
<!--more-->

# 前言
[oh-my-posh](https://github.com/JanDeDobbeleer/oh-my-posh)是一个可自定义的shell提示引擎。oh-my-posh v3相较于oh-my-posh v2，完全使用了GO编写，使其可以跨平台运行，同时对主题的修改更容易。

Oh-My-Posh V3的文档在[此](https://ohmyposh.dev/docs/)

# 安装
```powershell
# -Scope CurrentUser可以不需要，因为默认就是CurrentUser
# 可能需要VPN下载
Install-Module oh-my-posh -Scope CurrentUser

# 从V2升级到V3
# 似乎有点点问题，我是卸载重装了
Update-Module -Name oh-my-posh -Scope CurrentUser
```

# 主题配置
## 展示所有本地主题
```powershell
Get-PoshThemes
```
![展示主题](/images/beautify-terminal/list-themes.png)

## 设置主题
```powershell
# 此处以本人比较喜欢的paradox为例
# 设置主题
Set-PoshPrompt -Theme paradox
# 导出当前主题以便修改
Export-PoshTheme -FilePath ~/.oh-my-posh.omp.json
# 设置自定义的主题
Set-PoshPrompt -Theme  ~/.oh-my-posh.omp.json
```
需要注意的是现在设置的主题为暂时的，当你打开新的powershell以后就没了，因此还需要编辑`$PROFILE`来持久化
```powershell
# 笔记本编辑
notepad $PROFILE
# 或者代码编辑器编辑
code $PROFILE
```
添加下面一行
```powershell
Set-PoshPrompt -Theme  ~/.oh-my-posh.omp.json
```
如果遇到了数字签名问题，可以参考[这](https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_signing?view=powershell-7.1)里面的RemoteSigned的方法，打开profile文件属性设置为不阻拦。

## 字体下载
oh-my-posh V3设计使用[Nerd Fonts](https://www.nerdfonts.com/)，官方推荐[Meslo LGM NF](https://github.com/ryanoasis/nerd-fonts/releases/download/v2.1.0/Meslo.zip)。本文配置使用的是`MesloLGM NF`字体。需要下载完字体后设置终端的字体，否则一些特殊符号无法正常显示

# 主题定制
考虑到自带的主题无法完美的符合我的要求，因此需要对主题文件进行修改，主要调整conda的全局显示、git和时间的显示。也可以参考其他主题新增一点功能，所有官方主题文件在[此](https://github.com/JanDeDobbeleer/oh-my-posh/tree/main/themes)
## conda
oh-my-posh默认的python配置只有在含有python文件的目录下才会启动，因此无法看到conda的默认环境。修改起来也比较简单，采用环境变量的形式即可。通过`dir env:`找到`CONDA_DEFAULT_ENV`环境变量，设置oh-my-posh中的背景色为红色，设置python的图标，保持字体颜色一致。为了好看和方便，添加到`session`块之后`path`块之前。
```json
{
    "background": "#FF6E6E",
    "foreground": "#100e23",
    "powerline_symbol": "\uE0B0",
    "properties": {
        "prefix": "\uE235",
        "var_name": "CONDA_DEFAULT_ENV"
    },
    "style": "powerline",
    "type": "envvar"
}
```
## git
oh-my-posh在高版本中的git不显示详细信息，可以通过配置主题解决。配置如下，也可以使用`posh-git`直接配置。经过尝试`posh-git`无法达到我需要的效果。
```json
{
    "type": "git",
    "style": "powerline",
    "powerline_symbol": "\uE0B0",
    "foreground": "#193549",
    "background": "#95ffa4",
        "properties": {
        "display_status": true,
        "display_stash_count": true,
        "display_upstream_icon": true
    }
}
```

## time
参考其他主题，在每行的右边新增一个显示当前时间的图标。
```json
{
    "alignment": "right",
    "type": "prompt",
    "segments": [
        {
            "type": "time",
            "style": "plain",
            "foreground": "#ffffff",
            "properties": {
                "time_format": "[15:04:05]"
            }
        }
    ]
}
```
## 完整配置文件
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "blocks": [
    {
      "alignment": "left",
      "segments": [
        {
          "background": "#ffe9aa",
          "foreground": "#100e23",
          "powerline_symbol": "",
          "style": "powerline",
          "type": "root"
        },
        {
          "background": "#ffffff",
          "foreground": "#100e23",
          "powerline_symbol": "",
          "style": "powerline",
          "type": "session",
          "properties": {
            "display_host": false
          }
        },
        {
          "background": "#FF6E6E",
          "foreground": "#100e23",
          "powerline_symbol": "",
          "properties": {
            "prefix": "  ",
            "var_name": "CONDA_DEFAULT_ENV"
          },
          "style": "powerline",
          "type": "envvar"
        },
        {
          "background": "#91ddff",
          "foreground": "#100e23",
          "powerline_symbol": "",
          "properties": {
            "folder_icon": "",
            "folder_separator_icon": "  ",
            "style": "full"
          },
          "style": "powerline",
          "type": "path"
        },
        {
          "type": "git",
          "style": "powerline",
          "powerline_symbol": "\uE0B0",
          "foreground": "#193549",
          "background": "#95ffa4",
          "properties": {
            "display_status": true,
            "display_stash_count": true,
            "display_upstream_icon": true
          }
        },
        {
          "background": "#ff8080",
          "foreground": "#ffffff",
          "powerline_symbol": "",
          "properties": {
            "prefix": " "
          },
          "style": "powerline",
          "type": "exit"
        }
      ],
      "type": "prompt"
    },
    {
      "alignment": "right",
      "type": "prompt",
      "segments": [
        {
          "type": "time",
          "style": "plain",
          "foreground": "#ffffff",
          "properties": {
            "time_format": "[15:04:05]"
          }
        }
      ]
    },
    {
      "alignment": "left",
      "newline": true,
      "segments": [
        {
          "foreground": "#007ACC",
          "properties": {
            "prefix": "",
            "text": "❯"
          },
          "style": "plain",
          "type": "text"
        }
      ],
      "type": "prompt"
    }
  ],
  "final_space": false
}
```


## 效果图
![最终效果](/images/beautify-terminal/theme.png)


# 后记
总体来说oh-my-posh v3比v2更具有移植性，同配置起来更方便，默认主题也多，相对也更好看。个人主观感觉启动速度也快了不少。

# 参考文献
[oh-my-posh doc](https://ohmyposh.dev/docs/)
[数字签名](https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_signing?view=powershell-7.1)