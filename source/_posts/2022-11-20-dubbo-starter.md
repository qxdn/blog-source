---
title: dubbo尝试
tags:
  - dubbo
  - rpc
  - java
categories: java
description: 因为面试可能会问到，尝试一下远程调用rpc
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.11/cover.jpg'
date: 2022-11-20 04:28:00
---


> 封面《golden marriage》

# dubbo
Dubbo是阿里开发的一个RPC服务框架，用于解决微服务架构下的服务治理与通信问题。后来捐献给了Apache，现在是Apache Dubbo。

# dubbo架构
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.11/architecture.png)

| 节点  | 说明 |
| ------------- | ------------- |
| `Provider`  | 暴露服务的服务提供方 |
| `Consumer`  | 调用远程服务的服务消费方 |
| `Registry`  | 服务注册与发现的注册中心 |
| `Monitor`  | 统计服务的调用次数和调用时间的监控中心 |
| `Container`  | 服务运行容器 |


0. 服务容器负责启动，加载，运行服务提供者。
1. 服务提供者在启动时，向注册中心注册自己提供的服务。
2. 服务消费者在启动时，向注册中心订阅自己所需的服务。
3. 注册中心返回服务提供者地址列表给消费者，如果有变更，注册中心将基于长连接推送变更数据给消费者。
4. 服务消费者，从提供者地址列表中，基于软负载均衡算法，选一台提供者进行调用，如果调用失败，再选另一台调用。
5. 服务消费者和提供者，在内存中累计调用次数和调用时间，定时每分钟发送一次统计数据到监控中心。

# demo结构
在这次demo的结构如下，通过`tree`命令输出如下。其中`dubbo-demo-api`是服务提供端和消费端公用的api，`dubbo-demo-consumer`和`dubbo-demo-provider`分别是服务的消费端和提供端
```
│  .gitignore
│  pom.xml
├─dubbo-demo-api
│  │  pom.xml
│  │
│  └─src
│      └─main
│          └─java
│              └─com
│                  └─qxdn
│                      └─demo
│                          └─dubbo
│                              └─api
│                                      HelloService.java
│
├─dubbo-demo-consumer
│  │  pom.xml
│  │
│  └─src
│      └─main
│          ├─java
│          │  └─com
│          │      └─qxdn
│          │          └─demo
│          │              └─dubbo
│          │                  └─consumer
│          │                          ConsumerApplication.java
│          │
│          └─resources
│                  application.yml
│                  log4j.properties
│
└─dubbo-demo-provider
    │  pom.xml
    │
    └─src
        └─main
            ├─java
            │  └─com
            │      └─qxdn
            │          └─demo
            │              └─dubbo
            │                  └─provider
            │                          EmbeddedZooKeeper.java
            │                          HelloServiceImpl.java
            │                          ProviderApplication.java
            │
            └─resources
                    application.yml
                    log4j.properties
```

# 父级POM
```xml
...
<groupId>com.qxdn.demo</groupId>
    <artifactId>dubbo-demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <spring.version>4.3.16.RELEASE</spring.version>
        <dubbo.version>3.0.7</dubbo.version>
        <slf4j-log4j12.version>1.7.25</slf4j-log4j12.version>
        <spring-boot.version>2.7.5</spring-boot.version>
    </properties>

    <modules>
        <module>dubbo-demo-api</module>
        <module>dubbo-demo-provider</module>
        <module>dubbo-demo-consumer</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-dependencies-zookeeper</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>${slf4j-log4j12.version}</version>
        </dependency>
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
            <scope>provided</scope>
        </dependency>
...
```

# 接口
## POM
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>com.qxdn.demo</groupId>
        <artifactId>dubbo-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>dubbo-demo-api</artifactId>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <skip_maven_deploy>true</skip_maven_deploy>
    </properties>

</project>
```

## 接口
```java
// HelloService.java
package com.qxdn.demo.dubbo.api;

import java.util.concurrent.CompletableFuture;

public interface HelloService {

    String sayHello(String name);

    default CompletableFuture<String> sayHelloAsync(String name) {
        return CompletableFuture.completedFuture(sayHello(name));
    }

}

```

# 服务提供者
## POM
这里使用zookeeper作为注册中心
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>com.qxdn.demo</groupId>
        <artifactId>dubbo-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>dubbo-demo-provider</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.qxdn.demo</groupId>
            <artifactId>dubbo-demo-api</artifactId>
            <version>${project.parent.version}</version>
        </dependency>
        <!-- dubbo -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-zookeeper</artifactId>
            <type>pom</type>
        </dependency>
        <!-- dubbo starter -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <!-- spring starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>ch.qos.logback</groupId>
                    <artifactId>logback-classic</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
```

## 配置
### application.yml
服务注册中心选择自己的zookeeper的地址
```yaml
dubbo:
  application:
    name: dubbo-demo-provider
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
  config-center:
    address: zookeeper://127.0.0.1:2181
  metadata-report:
    address: zookeeper://127.0.0.1:2181
```
### log4j.properties
```properties
###set log levels###
log4j.rootLogger=info, stdout
###output to the console###
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target=System.out
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=[%d{dd/MM/yy HH:mm:ss:SSS z}] %t %5p %c{2}: %m%n
```
## Provider
### Impl
这里完成RPC服务的实现
```java
//HelloServiceImpl.java
package com.qxdn.demo.dubbo.provider;

import com.qxdn.demo.dubbo.api.HelloService;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboService;
import org.apache.dubbo.rpc.RpcContext;

@Slf4j
@DubboService
public class HelloServiceImpl implements HelloService {

    @Override
    public String sayHello(String name) {
        log.info("Hello " + name + ", request from consumer: " + RpcContext.getServiceContext().getRemoteAddressString());
        return "Hello " + name + "from: "  + RpcContext.getServiceContext().getLocalAddressString();
    }
}
```
### zookeeper
zookeeper可以到apache的官网[下载](https://zookeeper.apache.org/releases.html)

这里我们使用别人的embedzookeeper,源码在[github](https://github.com/spring-attic/spring-xd/blob/v1.3.1.RELEASE/spring-xd-dirt/src/main/java/org/springframework/xd/dirt/zookeeper/ZooKeeperUtils.java)

### Application
```java
package com.qxdn.demo.dubbo.provider;

import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@Slf4j
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) throws Exception {
        new EmbeddedZooKeeper(2181, false).start();

        SpringApplication.run(ProviderApplication.class, args);
        log.info("dubbo service started");
    }
}
```

# 服务消费者
## POM
这里使用zookeeper作为注册中心
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>com.qxdn.demo</groupId>
        <artifactId>dubbo-demo</artifactId>
        <version>0.0.1-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <artifactId>dubbo-demo-consumer</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.qxdn.demo</groupId>
            <artifactId>dubbo-demo-api</artifactId>
            <version>${project.parent.version}</version>
        </dependency>
        <!-- dubbo -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-zookeeper</artifactId>
            <type>pom</type>
        </dependency>
        <!-- dubbo starter -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <!-- spring starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>ch.qos.logback</groupId>
                    <artifactId>logback-classic</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```
## 配置
### application.yml
服务注册中心选择自己的zookeeper的地址
```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-consumer
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
  config-center:
    address: zookeeper://127.0.0.1:2181
  metadata-report:
    address: zookeeper://127.0.0.1:2181
```
### log4j.properties
```properties
###set log levels###
log4j.rootLogger=info, stdout
###output to the console###
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target=System.out
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=[%d{dd/MM/yy HH:mm:ss:SSS z}] %t %5p %c{2}: %m%n
```
## Consumer
`@DubboReference`中的`loadbalance`是负载均很的方案，这里选择随机，此外注解也可以使用`version`进行服务的过滤
```java
package com.qxdn.demo.dubbo.consumer;

import com.qxdn.demo.dubbo.api.HelloService;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.common.constants.LoadbalanceRules;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Service;

@SpringBootApplication
@Service
@EnableDubbo
@Slf4j
public class ConsumerApplication {

    @DubboReference(loadbalance = LoadbalanceRules.RANDOM)
    private HelloService helloService;

    public static void main(String[] args) {

        ConfigurableApplicationContext context = SpringApplication.run(ConsumerApplication.class, args);
        ConsumerApplication application = context.getBean(ConsumerApplication.class);
        String result = application.doSayHello("java");
        log.info("result: " + result);
    }

    public String doSayHello(String name) {
        return helloService.sayHello(name);
    }
}

```

# 效果
## 服务提供者的输出
```log
...
[20/11/22 03:22:54:208 CST] NIOServerCxn.Factory:0.0.0.0/0.0.0.0:2181  INFO server.NIOServerCnxnFactory: Accepted socket connection from /127.0.0.1:51634
[20/11/22 03:22:54:208 CST] NIOServerCxn.Factory:0.0.0.0/0.0.0.0:2181  INFO server.ZooKeeperServer: Client attempting to establish new session at /127.0.0.1:51634
[20/11/22 03:22:54:209 CST] SyncThread:0  INFO server.ZooKeeperServer: Established session 0x1000cab1b92000a with negotiated timeout 60000 for client /127.0.0.1:51634
[20/11/22 03:22:54:352 CST] NettyServerWorker-3-9  INFO netty4.NettyServerHandler:  [DUBBO] The connection of /192.168.31.35:51635 -> /192.168.31.35:20880 is established., dubbo version: 3.0.7, current host: 192.168.31.35
[20/11/22 03:22:54:455 CST] NettyServerWorker-3-9  INFO netty4.NettyServerHandler:  [DUBBO] The connection of /192.168.31.35:51635 -> /192.168.31.35:20880 is disconnected., dubbo version: 3.0.7, current host: 192.168.31.35
[20/11/22 03:22:54:493 CST] ProcessThread(sid:0 cport:2181):  INFO server.PrepRequestProcessor: Got user-level KeeperException when processing sessionid:0x1000cab1b92000a type:create cxid:0x3 zxid:0x4e txntype:-1 reqpath:n/a Error Path:/services/dubbo-demo-provider Error:KeeperErrorCode = NodeExists for /services/dubbo-demo-provider
[20/11/22 03:22:55:081 CST] DubboServerHandler-192.168.31.35:20880-thread-25  INFO provider.HelloServiceImpl: Hello java, request from consumer: 192.168.31.35:51631
[20/11/22 03:37:05:560 CST] Dubbo-framework-cache-refreshing-scheduler-thread-1  INFO metadata.AbstractCacheManager$CacheRefreshTask:  [DUBBO] Dumping mapping caches, latest entries 0, dubbo version: 3.0.7, current host: 192.168.31.35
```
## 服务消费者的输出
```
...
2 03:22:54:588 CST] main  INFO metadata.MetadataInfo:  [DUBBO] metadata revision changed: null -> 0ef9521ed22939bb2e1da2ea8012f84d, app: dubbo-springboot-demo-consumer, services: 1, dubbo version: 3.0.7, current host: 192.168.31.35
[20/11/22 03:22:55:063 CST] main  INFO deploy.DefaultApplicationDeployer:  [DUBBO] Dubbo Application[1.1](dubbo-springboot-demo-consumer) is ready., dubbo version: 3.0.7, current host: 192.168.31.35
[20/11/22 03:22:55:068 CST] main  INFO consumer.ConsumerApplication: Started ConsumerApplication in 3.234 seconds (JVM running for 4.244)
[20/11/22 03:22:55:071 CST] pool-1-thread-1  INFO event.AwaitingNonWebApplicationListener:  [Dubbo] Current Spring Boot Application is await...
[20/11/22 03:22:55:084 CST] main  INFO consumer.ConsumerApplication: result: Hello javafrom: 192.168.31.35:20880
[20/11/22 03:32:53:388 CST] Dubbo-framework-cache-refreshing-scheduler-thread-1  INFO metadata.AbstractCacheManager$CacheRefreshTask:  [DUBBO] Dumping mapping caches, latest entries 1, dubbo version: 3.0.7, current host: 192.168.31.35
[20/11/22 03:32:54:201 CST] Dubbo-framework-cache-refreshing-scheduler-thread-1  INFO metadata.AbstractCacheManager$CacheRefreshTask:  [DUBBO] Dumping meta caches, latest entries 1, dubbo version: 3.0.7, current host: 192.168.31.35
```

可以看到两边都有调用结果的输出

# 可能的问题
## <dependencyManagement/>
启动程序时候出现问题如下
```
Exception in thread "main" java.lang.NoClassDefFoundError: org/springframework/core/metrics/ApplicationStartup
	at org.springframework.boot.SpringApplication.<init>(SpringApplication.java:251)
	at org.springframework.boot.SpringApplication.<init>(SpringApplication.java:264)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1311)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1300)
	at com.example.simple.dubbo_demo_provider.ProviderApplication.main(ProviderApplication.java:10)
Caused by: java.lang.ClassNotFoundException: org.springframework.core.metrics.ApplicationStartup
	at java.net.URLClassLoader.findClass(URLClassLoader.java:382)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:349)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
	... 5 more
```
经过查找[资料](https://msdemt.github.io/posts/java/%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB/maven_dependencymanagement%E5%A4%9A%E6%A8%A1%E5%9D%97%E8%A6%86%E7%9B%96%E9%97%AE%E9%A2%98/)发现是因为父POM的`parent`里是`spring-boot-parent`而且还自定义了`<dependencyManagement/>`使得子模块里找不到对应的依赖module。

解决方法就是在原先的父POM`<dependencyManagement/>`里面加上
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-dependencies<artifactId>
    <version>${spring-boot.version}</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

## SLF4J: Class path contains multiple SLF4J bindings
SLF4J绑定多个实现
```
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/C:/Users/qianx/.m2/repository/ch/qos/logback/logback-classic/1.2.11/logback-classic-1.2.11.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/C:/Users/qianx/.m2/repository/org/slf4j/slf4j-log4j12/1.7.25/slf4j-log4j12-1.7.25.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [ch.qos.logback.classic.util.ContextSelectorStaticBinder]
```
这是因为项目中SLF4J有多种实现，可以通过下面的命令或者IDE的依赖分析来找到，
```bash
mvn dependency:tree
```
结果如下
```
# result
[INFO] --- maven-dependency-plugin:2.8:tree (default-cli) @ dubbo-demo-provider ---
[INFO] com.qxdn.demo:dubbo-demo-provider:jar:0.0.1-SNAPSHOT
[INFO] +- com.qxdn.demo:dubbo-demo-api:jar:0.0.1-SNAPSHOT:compile
[INFO] +- org.apache.dubbo:dubbo:jar:3.0.7:compile
[INFO] |  +- org.springframework:spring-context:jar:5.3.23:compile
[INFO] |  |  +- org.springframework:spring-aop:jar:5.3.23:compile
[INFO] |  |  +- org.springframework:spring-beans:jar:5.3.23:compile
[INFO] |  |  \- org.springframework:spring-expression:jar:5.3.23:compile
[INFO] |  +- com.alibaba.spring:spring-context-support:jar:1.0.8:compile
[INFO] |  +- org.javassist:javassist:jar:3.28.0-GA:compile
[INFO] |  +- io.netty:netty-all:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-buffer:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-dns:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-haproxy:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-http:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-http2:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-memcache:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-mqtt:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-redis:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-smtp:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-socks:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-stomp:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-codec-xml:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-common:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-handler:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-native-unix-common:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-handler-proxy:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-resolver:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-resolver-dns:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-rxtx:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-sctp:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-udt:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-classes-epoll:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-classes-kqueue:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-resolver-dns-classes-macos:jar:4.1.84.Final:compile
[INFO] |  |  +- io.netty:netty-transport-native-epoll:jar:linux-x86_64:4.1.84.Final:runtime
[INFO] |  |  +- io.netty:netty-transport-native-epoll:jar:linux-aarch_64:4.1.84.Final:runtime
[INFO] |  |  +- io.netty:netty-transport-native-kqueue:jar:osx-x86_64:4.1.84.Final:runtime
[INFO] |  |  +- io.netty:netty-transport-native-kqueue:jar:osx-aarch_64:4.1.84.Final:runtime
[INFO] |  |  +- io.netty:netty-resolver-dns-native-macos:jar:osx-x86_64:4.1.84.Final:runtime
[INFO] |  |  \- io.netty:netty-resolver-dns-native-macos:jar:osx-aarch_64:4.1.84.Final:runtime
[INFO] |  +- com.google.code.gson:gson:jar:2.9.1:compile
[INFO] |  +- org.yaml:snakeyaml:jar:1.30:compile
[INFO] |  \- com.alibaba:fastjson:jar:1.2.70:compile
[INFO] +- org.apache.dubbo:dubbo-dependencies-zookeeper:pom:3.0.7:compile
[INFO] |  +- org.apache.curator:curator-x-discovery:jar:4.2.0:compile
[INFO] |  |  +- org.apache.curator:curator-recipes:jar:4.2.0:compile
[INFO] |  |  |  \- org.apache.curator:curator-framework:jar:4.2.0:compile
[INFO] |  |  |     \- org.apache.curator:curator-client:jar:4.2.0:compile
[INFO] |  |  |        \- com.google.guava:guava:jar:27.0.1-jre:compile
[INFO] |  |  |           +- com.google.guava:failureaccess:jar:1.0.1:compile
[INFO] |  |  |           +- com.google.guava:listenablefuture:jar:9999.0-empty-to-avoid-conflict-with-guava:compile
[INFO] |  |  |           +- org.checkerframework:checker-qual:jar:2.5.2:compile
[INFO] |  |  |           +- com.google.errorprone:error_prone_annotations:jar:2.2.0:compile
[INFO] |  |  |           +- com.google.j2objc:j2objc-annotations:jar:1.1:compile
[INFO] |  |  |           \- org.codehaus.mojo:animal-sniffer-annotations:jar:1.17:compile
[INFO] |  |  \- com.fasterxml.jackson.core:jackson-databind:jar:2.13.4.2:compile
[INFO] |  |     +- com.fasterxml.jackson.core:jackson-annotations:jar:2.13.4:compile
[INFO] |  |     \- com.fasterxml.jackson.core:jackson-core:jar:2.13.4:compile
[INFO] |  \- org.apache.zookeeper:zookeeper:jar:3.4.14:compile
[INFO] |     +- com.github.spotbugs:spotbugs-annotations:jar:3.1.9:compile
[INFO] |     |  \- com.google.code.findbugs:jsr305:jar:3.0.2:compile
[INFO] |     +- jline:jline:jar:0.9.94:compile
[INFO] |     \- org.apache.yetus:audience-annotations:jar:0.5.0:compile
[INFO] +- org.apache.dubbo:dubbo-spring-boot-starter:jar:3.0.7:compile
[INFO] |  \- org.apache.dubbo:dubbo-spring-boot-autoconfigure:jar:3.0.7:compile
[INFO] |     \- org.apache.dubbo:dubbo-spring-boot-autoconfigure-compatible:jar:3.0.7:compile
[INFO] +- org.springframework.boot:spring-boot-starter:jar:2.7.5:compile
[INFO] |  +- org.springframework.boot:spring-boot:jar:2.7.5:compile
[INFO] |  +- org.springframework.boot:spring-boot-starter-logging:jar:2.7.5:compile
[INFO] |  |  +- ch.qos.logback:logback-classic:jar:1.2.11:compile
[INFO] |  |  |  \- ch.qos.logback:logback-core:jar:1.2.11:compile
[INFO] |  |  +- org.apache.logging.log4j:log4j-to-slf4j:jar:2.17.2:compile
[INFO] |  |  |  \- org.apache.logging.log4j:log4j-api:jar:2.17.2:compile
[INFO] |  |  \- org.slf4j:jul-to-slf4j:jar:1.7.36:compile
[INFO] |  +- jakarta.annotation:jakarta.annotation-api:jar:1.3.5:compile
[INFO] |  \- org.springframework:spring-core:jar:5.3.23:compile
[INFO] |     \- org.springframework:spring-jcl:jar:5.3.23:compile
[INFO] +- org.springframework.boot:spring-boot-autoconfigure:jar:2.7.5:compile
[INFO] +- org.slf4j:slf4j-api:jar:1.7.36:compile
[INFO] +- org.slf4j:slf4j-log4j12:jar:1.7.25:compile
[INFO] +- log4j:log4j:jar:1.2.17:compile
[INFO] \- org.projectlombok:lombok:jar:1.18.24:provided
[INFO]

```

找到依赖后修改
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

##  Failed to execute goal on project xxx
执行`mvn dependency:tree`的时候错误如下
```
 Failed to execute goal on project dubbo-demo-provider: Could not resolve dependencies for project com.qxdn.demo:dubbo-demo-provider:jar:0.0.1-SNAPSHOT: Could not find artifact com.qxdn.demo:dubbo-demo-api:jar:0.0.1-SNAPSHOT
```
运行
```
mvn clean install
```

# 完整代码
完整代码地址在[github](https://github.com/qxdn/dubbo-demo)

# 参考文献

[dubbo文档](https://dubbo.apache.org/zh/)

[Maven_dependencyManagement多模块覆盖问题](https://msdemt.github.io/posts/java/%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB/maven_dependencymanagement%E5%A4%9A%E6%A8%A1%E5%9D%97%E8%A6%86%E7%9B%96%E9%97%AE%E9%A2%98/)

[Introduction to the Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)

[quick start fails](https://github.com/apache/dubbo/issues/6316)

[Spring Boot: multiple SLF4J bindings](https://stackoverflow.com/questions/33071002/spring-boot-multiple-slf4j-bindings)