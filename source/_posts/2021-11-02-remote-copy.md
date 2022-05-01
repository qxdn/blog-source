---
title: 远程文件拷贝
tags:
  - Linux
categories: Linux
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/cover.jpg
date: 2021-11-02 18:45:48
description: 实验室分配了服务器，有必要了解以下远程数据的拷贝
---


实验室分配了服务器，有必要了解以下远程数据的拷贝
封面《月に寄りそう乙女の作法》
<!--more-->

# 前言
向实验室申请了一个服务器准备炼丹，第一步暂时打算先上传数据集。对服务器上文件的远程拷贝只用过VNC和vscode。vscode在打开服务器中含有较多文件的目录容易卡死，且拷贝文件的进度也不容易观察，只能通过当前的网速进行判断。VNC只拷贝过一些小型文件，但是个人猜测对大文件的传输也不太行。因此有必要了解一下linux自带的scp命令。

# scp
scp命令是secure copy的缩写，是一个远程文件拷贝命令。

## 语法
对于这种命令通过`man`命令可以查看其详细的文档。`man scp`

```bash
scp [-12346BCpqrv] [-c cipher] [-F ssh_config] [-i identity_file] [-l limit] [-o ssh_option] [-P port] 
[-S program] [[user@]host1:]file1 ... [[user@]host2:]file2
```

## 参数说明
- -1: 强制使用ssh1
- -2: 强制使用ssh2
- -3: 通过本地host传输两个远程服务器直接的拷贝。如果没有该选项，将会直接在两个远程服务器之间拷贝。
- -4: 强制scp只使用ipv4
- -6: 强制scp只是用ipv6
- -B: 选择批次模式（不使用密码或者密钥）
- -C: 开启压缩模式
- -c cipher: 以cipher将数据传输进行加密，这个选项将直接传递给ssh
- -F ssh_config: 指定一个替代的ssh配置文件，此参数直接传递给ssh
- -i identity_file: 从指定文件中读取传输时使用的密钥文件，此参数直接传递给ssh
- -l limit: 带宽限制，单位Kbit/s
- -o ssh_option: 传输可选项到ssh中，并没有scp flag
- -P: 指定远程服务器的端口，注意大写P，因为小写已经被使用了
- -p: 保留原始文件的修改时间，访问时间和访问权限
- -q: 安静模式，不显示进度条
- -r: 递归拷贝整个文件夹
- -S program: 指定加密传输时所使用的程序。此程序必须能够理解ssh(1)的选项
- -v: 详细模式


## 实例
废话说了一堆不如直接上手写测试

### 本地复制文件到远程
```bash
scp local_file remote_username@remote_ip:remote_folder 
# or 
scp local_file remote_username@remote_ip:remote_file 
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/copy_file_to_remote.png)

### 本地目录复制到远程
```bash
scp -r local_folder remote_username@remote_ip:remote_folder 
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/copy_folder_to_remote.png)

### 远程文件复制到本地
```bash
scp remote_username@remote_ip:remote_file local_file
# or 
scp remote_username@remote_ip:remote_file local_folder 
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/copy_file_from_remote.png)

### 远程目录复制到本地
```bash
scp -r remote_username@remote_ip:remote_folder local_folder 
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/copy_folder_from_remote.png)

# sftp
在看scp命令文档的适合发现了里面有写sftp(secure file transfer program)。出于好奇，便查询一下sftp的使用方法。
## 语法
```bash
sftp [-1246aCfpqrv] [-B buffer_size] [-b batchfile] [-c cipher] [-D sftp_server_path] [-F ssh_config]
          [-i identity_file] [-l limit] [-o ssh_option] [-P port] [-R num_requests] [-S program]
          [-s subsystem | sftp_server] host
sftp [user@]host[:file ...]
sftp [user@]host[:dir[/]]
sftp -b batchfile [user@]host
```

许多参数与scp类似这里不再多说

## 实例
### 连接
```bash
sftp -P port user@ip
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/sftp_connect.png)

### 获取远程文件
```bash
sftp> get remoteFile
sftp> get remoteFile localFile
sftp> get -r someDirectory
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/sftp_get.png)

### 上传本地文件
```bash
sftp> put localFile
sftp> get localFile remoteFile
sftp> put -r localDirectory
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.1.0/sftp_put.png)

# 参考资料
[Linux scp命令](https://www.runoob.com/linux/linux-comm-scp.html)
[How To Use SFTP to Securely Transfer Files with a Remote Server](https://www.digitalocean.com/community/tutorials/how-to-use-sftp-to-securely-transfer-files-with-a-remote-server)