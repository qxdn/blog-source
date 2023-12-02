---
title: Azure搭建AList管理网盘
tags:
  - Azure
  - AList
  - 网盘
  - 百度云
categories: Azure
description: 因为看到了别人搭建的Alist网盘可以统一管理好多网盘，于是就想自己搭建一个。顺便解决ipad刷新OneDrive慢的问题
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/cover.png
date: 2023-12-02 22:56:43
---


> 封面 《はつゆきさくら》

{% hideToggle 效果 %}

demo: https://pan.qianxu.run

![管理员效果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/alist-pan.png)

![游客效果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/guest.png)


{% endhideToggle %}


# 前言
因为在逛友链的时候看到别人搭建的alist网盘可以统一管理好多网盘，想到了自己也有好多网盘需要统一管理一下。同时由于我平时的参考文献都放在了OneDrive上，但是ipad上的OneDrive刷新速度实在是太慢了，甚至我主动刷新都没法获取我最新下载的论文，所以就想着把OneDrive也放到Alist上面去。同时我还想把我的网盘加上我自己的pan子域名，但是vercel无法挂Alist，我自己的阿里云又没有备案没法挂域名，render又被拿去挂监控了，想来想去还剩下一个azure的学生优惠可以用。于是就有了这篇文章。

# Azure准备
首先你需要一个azure的学生账号，这个可以去[这里](https://azure.microsoft.com/zh-cn/free/students/)申请，申请完之后你会得到一个azure的学生账号，这个账号有100美元的额度，可以用来搭建一些小型的服务。然后你需要一个域名，这个域名可以去[这里](https://www.freenom.com/zh/index.html?lang=zh)申请，在[这](https://www.microsoftazuresponsorships.com/Balance)可以看到你的优惠余额。选择一台虚拟机直接开一个ubuntu系统即可，怎么便宜怎么来，具体白嫖的方法可以看底下的参考链接。

![余额](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/balance.png)

# Alist安装
通过ssh登陆到我们的虚拟机，在azure的虚拟机控制面板里面可以看到我们的ip，也可以自己设定一下dns获得域名。

![ip](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/azure-ip.png)

由于我自己的azure已经安装好了alist，所以后面用阿里云来进行演示

在登上服务器之后，我们可以先进行一下更新依赖操作
```bash
sudo apt-get update
sudo apt-get upgrade
```

参考[AList文档](https://alist.nn.ci/)，因为我们使用的是Ubuntu系统，直接使用一键安装命令即可，
```bash
curl -fsSL "https://alist.nn.ci/v3.sh" | sudo bash -s install
```

![AList安装完成](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/alist-install.png)

随后我们按照提示进入alist的安装目录，设置管理员账号
```bash
cd /opt/alist
./alist admin set 123456 #123456改成你的密码
```

打开`http://your_ip:5244`网页，这里不管是azure和阿里云都需要打开安全组的5244端口。azure安全组的在网络设置中，顺便我们把后续要用到的80和443端口也打开一下。

![azure入站设置](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/azure-port.png)

![效果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/azure-web.png)

后面正常按照`AList`的文档操作就可以挂载各种云盘

# 反向代理
很显然我们通常都是使用http的80端口或者https的443端口，而AList用的是5244端口，当然我们可以使用修改端口来设置，但是常见的方案是使用nginx进行代理。安装nginx直接按照[文档](https://nginx.org/en/linux_packages.html#Ubuntu)就行，当然也最好先检查一下nginx有没有按照。

```bash
# 检查nginx是否安装
whereis nginx
# 安装nginx
sudo apt install nginx
# 看看效果
curl localhost
```

安装完成后修改nginx中的配置文件，我这里就直接简单一点执行`sudo vim /etc/nginx/sites-enabled/default`，在其中的`service`里面添加下面代码，并把原先的`try_files $uri $uri/ =404;`给注释了。
```nginx
location / {
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header Range $http_range;
	proxy_set_header If-Range $http_if_range;
  proxy_redirect off;
  proxy_pass http://127.0.0.1:5244;
  # the max size of file to upload
  client_max_body_size 20000m;
}
```
然后重启nginx，`sudo service nginx restart`，就可以在80端口打开访问

# 配置TLS/SSL
比较麻烦的是SSL证书，正规的只支持单域名的DV证书也要将近3000，多少有点不值得。所以在看了看各种方案，打算继续沿用cloudflare的方案，其可以为服务器免费提供SSL证书，但是只有cloudflare支持。

首先先去cloudflare的DNS里面添加一条域名A类解析`域名-DNS-记录`
![DNS解析](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/cloudflare-dns.png)

然后去申请SSL证书，申请路径如下，点击创建证书，有效期选择15年，然后选择自己的域名，然后将证书进行保存0
![SSL证书申请](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/server-ssl.png)
![SSL证书创建](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/server-ssl2.png)
![SSL证书保存](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/server-ssl3.png)

然后我们继续编辑上文中的nginx配置文件，在刚才的location中添加下面的代码
```nginx
listen 443 ssl default_server;
listen [::]:443 ssl default_server;
ssl_certificate your pem;
ssl_certificate_key your key;
```
继续重启nginx，`sudo service nginx restart`现在可以通过https访问了，效果如下

![效果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/alist-pan.png)

# 设置AList别名
我的百度盘中存放我的游戏等等私密信息，OneDrive主要是论文和个人信息，Google Drive主要是代码，其他盘放一些杂七杂八的，不可能让游客都看到。最简单的方法就是设置游客不登录不可见，但是我还有一些数据集和论文资料需要共享，因此就轮到AList的别名登场了。

挂在一个`/guest`盘的Alias，然后设置为游客可见只读，然后设置文件映射，具体的优化可以看文档
```
# alias路径:实际路径
参考文献:/onedrive/参考文献
开题参考:/onedrive/开题参考
百度云:/百度云/毕设数据集
```
如此一来，游客的浏览效果如下

![游客浏览](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.3/guest.png)

# 总结
通过AList各种网盘教程，将大部分网盘都统一管理，如此一来方便我随时管理和解决ipad上弊端。

# 参考文献

- [Alist](https://github.com/alist-org/alist)

- [AList 文档](https://alist.nn.ci/)

- [关于微软Azure学生白嫖指南](https://isedu.top/index.php/archives/52/)

- [nginx install](https://nginx.org/en/linux_packages.html#Ubuntu)

- [Install Nginx and configure it as a reverse proxy server](https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/aspnetcore/practice-troubleshoot-linux/2-2-install-nginx-configure-it-reverse-proxy)