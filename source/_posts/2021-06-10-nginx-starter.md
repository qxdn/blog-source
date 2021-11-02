---
title: nginx笔记
tags:
  - nginx
  - Windows
  - Linux
categories: web
top_img: /images/nginx/cover.png
cover: /images/nginx/cover.png
date: 2021-06-10 23:57:46
description: 早就听说了nginx的大名，同时最近的好多处问题都说最好用nginx反向代理解决，因此学习一下。
---



早就听说了nginx的大名，同时最近的好多处问题都说最好用nginx反向代理解决，因此学习一下。
封面图《見上げてごらん、夜空の星》
<!--more-->

# 引言
nginx（engine X）是一个高性能web服务器，也是一个反向代理服务器。对于用户来说只知道反向代理服务器，而不知道其背后的服务器集群，因此可以解决跨域问题。
![Reverse proxy](/images/nginx/Reverse_proxy.jpg)

# 常用命令
## 启动
```bash
#需要注意的是nginx对路径有要求，尽量使用绝对路径，Linux中注意要sudo
[nginx place] -c [nginx conf]
```
对于windows系统需要下面指令，另外windows系统需要
```bash
start nginx
```
## 查询进程
```bash
#windows
tasklist /fi "imagename eq nginx.exe"
#Linux
ps -ax | grep nginx
```
## 其他命令
```bash
#格式 nginx -s signal
nginx -s stop #快速关闭nginx
nginx -s quit #缓慢关闭nginx
nginx -s reload #重启nginx
nginx -s reopen #重新打开log
nginx -t #测试配置文件是否正确
nginx -T #与-t效果一致，但是输出到标准流
nginx -v #输出nginx版本
nginx -V #输出nginx版本、编译器和配置参数
```

# 配置文件解析
```nginx
#运行用户
#user  nobody;
#启动进程数
worker_processes  1;

#全局error log
#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#PID文件 nginx的pid
#pid        logs/nginx.pid;

#工作模式及连接数上限
events {
    worker_connections  1024;
}

#http服务器
http {
    #全局块
    #设定mime类型
    include       mime.types;
    default_type  application/octet-stream;

    #设置日志格式
    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    #sendfile 指令指定 Nginx 是否调用 sendfile 函数（zero copy 方式）来输出文件，对于普通应用，
    #必须设为 on，如果用来进行下载等应用磁盘 IO 重负载应用，可设置为 off，以平衡磁盘与网络 I/O 处理速度，降低系统的 uptime.
    sendfile        on;
    #tcp_nopush     on;

    #连接超时时间
    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip压缩
    #gzip  on;

    #http服务器
    server {
        #监听端口
        listen       80;
        #定义使用localhost访问
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        
        # / url下的
        location / {
            # 路径
            root   html;
            #默认首页
            index  index.html index.htm;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }


    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

}
```


# 实战
本次使用nginx来代理hexo服务器
首先启动hexo
```bash
hexo server --drafts
```
启动nginx，完整配置文件见后文
```bash
C:\Users\14642\nginx-1.20.1\nginx.exe  -c D:\LearnCode\qxdn.github.io\nginx.conf
```
此时打开浏览器访问localhost既可以发现80端口变成了博客，反向代理成功。
## nginx完整配置文件
注意里面的proxy
```nginx

#user  nobody;

worker_processes  auto;

#error_log  error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       C:/Users/14642/nginx-1.20.1/conf/mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       80;

        server_name  localhost;
        
        location / {
            # 代理
            proxy_pass   http://127.0.0.1:4000;
            # 转发
            proxy_set_header Host $host:$server_port;
        }
    }
}
```

# 总结
本次实验初步完成nginx代理博客，后续将进一步完成docker化，前后端分离和子域名利用。

# 参考文献
[1][nginx doc](http://nginx.org/en/docs/beginners_guide.html)
[2][一篇文章上手nginx](https://mp.weixin.qq.com/s?__biz=MzA5OTAyNzQ2OA==&mid=2649719878&idx=1&sn=78a5a3b37a5a9bfb2eda34e31a801174&scene=58&subscene=0)