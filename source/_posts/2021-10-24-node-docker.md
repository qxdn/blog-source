---
title: docker中运行nodejs项目
tags:
  - javascript
  - docker
categories: javascript
top_img: /images/node-docker/cover.png
cover: /images/node-docker/cover.png
date: 2021-10-24 00:39:14
---


被实验室前端项目整裂开的我想起来还有docker这一方法
封面《PARQUET》
<!--more-->

# 前言
运行实验室项目的时候发现有个`node-sass`模块，安装的时候说需要python2环境。网上有解决方法是删除`node-modules`，然后安装`windows-build-tools`在重新装依赖。结果我试完发现不行，于是有说法说装最新版的`node-sass`，装完后运行后报错说版本不兼容，直接把我气死。最后我忽然想起来还有`docker`可以使用，因此写下此文，记录将node项目docker化。

# docker化
## Dockerfile
在项目里新建`Dockerfile`文件，写下以下内容。项目中`node-sass`的版本为`4.12.0`，查询[node-sass](https://github.com/sass/node-sass)推荐的版本为node 12。此外还可以看到先拷贝`package.json`文件而非全部文件，这是利用`docker`的缓存，减少每次重建镜像的时间，解释[见此](http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/)
```docker
FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "yarn", "start" ]
```
### 运行
运行只需要执行如下命令
```bash
docker build . -t <your tag username>
docker run -p 3000:3000 -d <your tag username>
```
## .dockerignore
有些文件并不需要被加入docker镜像中，比如`node_modules`。`node_modules`较大且会覆盖镜像中的依赖，因此需要忽略掉。完整`.dockerignore`文件见下。
```docker
node_modules
.idea
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## docker-compose.yml
有些时候我们需要将镜像进行服务化，因此需要编写`docker-compoes.yml`文件，在项目目录中新建`docker-compose.yml`文件，编写如下。
```docker
version: "3.9"
services:
  web:
    build: .
    ports:
      - "3000:3000"
```
有时候需要多个`docker compose`之间通信，此时可以先通过执行`docker network ls`命令来查找网络
```bash
# 运行结果
> docker network ls
NETWORK ID     NAME                 DRIVER    SCOPE
dfe18b9ff74e   alsprj_lnmp          bridge    local
764431292ca3   bridge               bridge    local
99ba555f79f4   host                 host      local
0fe0af6d1a07   live2d_api_default   bridge    local
2eaa1467e191   none                 null      local
```
如果我想要当前项目与`alsprj_lnmp`处于同一网络环境，就只需在我要连接的`docker-compose.yml`中添加如下代码
```docker
networks:
  default:
    external:
     name: alsprj_lnmp
```
### 运行
运行只需要执行如下命令
```bash
docker compose up -d
```

# 结果
通过`docker`，实验室前端项目总算跑起来了。
![](/images/node-docker/terminal.png)
![](/images/node-docker/success.png)

# 参考资料
[把一个 Node.js web 应用程序给 Docker 化](https://nodejs.org/zh-cn/docs/guides/nodejs-docker-webapp/)

[Building Efficient Dockerfiles - Node.js](http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/)

[多个docker-compose之间的网络通信](https://www.jianshu.com/p/1099815985dd)