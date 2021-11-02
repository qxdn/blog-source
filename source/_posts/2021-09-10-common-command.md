---
title: 常用命令--grep sed awk
tags:
  - Linux
categories: Linux
top_img: /images/common-command/cover.png
cover: /images/common-command/cover.png
date: 2021-09-10 00:54:41
description: 讲一下grep、sed和awk命令
---


在使用Linux的过程中，经常会看到一些命令使用grep、sed和awk，现在来简单的介绍一下这三个常用的命令。
封面《ハミダシクリエイティブ》
<!--more-->

# 前言
在以前查询各种和Linux有关系的任务资料的时候经常可以看到`grep`、`sed`、`awk`等命令，但是对于他们的作用我没有深入了解过，因此本文将对这几条命令做简单介绍

# 管道命令
如果需要将bash命令输出进行多重处理的时候就需要用到管道命令，管道命令使用`|`界定符。与连续命令不同的是，连续命令只是顺序执行，各个命令不存在相关性，而管道命令会将上一个命令的正确输出作为下一个命令的输入。管道命令需要注意的有以下几点
- 管道命令仅会处理标准输出，忽略标准错误(可以通过数据流重定向来解决，即`2>&1`)
- 管道命令必须要能够接受来自前一个命令的数据作为标准输入处理
## 例子
寻找当前目录下含有bash的文件
```bash
ls -a | grep bash
```

# grep
`grep`(globally search a regular expression and print)是管道命令的一种。`grep`是分析一行信息，若其中有我们需要的信息，就将该行拿出来
```bash
# 语法
grep [-acinv] [--color=auto] '查找字符' filename
# 选项
-a:将 binary 文件以 text 文件方式查找数据
-c:计算‘查找字符串’次数
-i:忽略大小写
-n:输出行号
-v:反向选择
--color=auto: 关键字部分添加颜色
```
## 例子
以我之前常用的寻找java进程为例，使用`ps`命令找到所有进程，在使用`grep`进行过滤，这样就能找到java web的进程了。
```bash
ps -ef | grep java
```
![](/images/common-command/grep.png)
`grep`除了普通的字符串以外还支持正则表达式，是一个很强大的命令

# sed
`sed`也是一个管道命令，可以分析标准输入，可以将数据进行替换、删除、新增、选取特定行
```bash
# 语法
sed [-nefr] [操作]
# 选项
-n: 安静模式，只会将特殊处理的那一行列出来
-e: 直接在命令行模式上进行sed操作编辑
-f: 直接将sed的操作写到一个输出里
-r: sed的操作使用的是拓展型正则语法（默认基础型正则）
-i: 直接修改读取的文件内容，而不是屏幕输出
# 操作说明 [n1[,n2]] function
a: 新增，在目前的下一行新增字符
c: 替换，后面可以借字符，这些字符替换n1,n2之间的行
d: 删除
i: 插入,插入目前的上一行
p: 打印，将选择的数据打印出来
s: 替换，可以直接替换的工作，s/old/new/g
```
## 例子
新建`test.txt`写入如下内容
```txt
line 1
line line 2
3
4
5
6
this is line 7
```
sed例子
```bash
# 删除2-5行
nl test.txt | sed '2,5d'
# 第三行的下一行（第四行）加上 this is new line
# 如果要加在前面则只需要将a换成i
nl test.txt | sed '3a this is new line'
# 2-5行替换为 new line
nl test.txt | sed '2,5c new line'
# s的使用
# 所有line换成new
nl test.txt | sed 's/line/new/g'
# 每行的第一个line换成new
nl test.txt | sed 's/line/new/1'
```
![](/images/common-command/sed.png)

# awk
相较于sed常常处理一行数据，awk倾向于以列来处理数据
```bash
awk '条件类型1{操作1}条件类型2{操作2}...' filename
```
## 例子
```bash
# 在test.txt写下如下内容
2 this is a test
3 Are you like awk
This's a test
10 There are orange,apple,mongo
```
```bash
# 每行按空格或TAB分割，输出文本中的1、4项
awk '{print $1,$4}' test.txt
# 用,分割
awk -F, '{print $1,$2}' test.txt
# 注意begin，否则第一行默认空格 tab
awk 'BEGIN{FS=","}{print $1,$2}' test.txt
# 统计数据
# NF 每行($0)拥有的字段总数，$0表示一整列数据
# NR 表示当前为第几行
awk '{print $1,"\t lines:" NR "\t columns:"NF}' test.txt
# 条件过滤
# 选出第一列大于2的
awk '$1>2' test.txt
# 选出第一列等于2，第二列为are
awk '$1>2 && $2=="Are" {print $1,$2,$3}' test.txt 
```
![](/images/common-command/awk.png)

# 参考文献
[管道命令](https://wiki.jikexueyuan.com/project/learn-linux-step-by-step/pipe-command.html)
[鸟哥的Linux私房菜]()
[Linux awk 命令](https://www.runoob.com/linux/linux-comm-awk.html)