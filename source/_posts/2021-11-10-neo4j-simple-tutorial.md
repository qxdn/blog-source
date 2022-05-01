---
title: neo4j简单入门和前端可视化
tags:
  - nosql
  - neo4j
  - javascript
categories: javascript
description: 因为学长需要使用知识图谱，并在前端进行可视化。因此在此简单的介绍一下neo4j的操作和可视化
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/cover.png
swiper_index: 7
date: 2021-11-10 21:28:35
---


> 封面《D.C.4 Plus Harmony》

# neo4j和知识图谱简介
> Neo4j是由Neo4j,Inc开发的一个图数据库管理系统。其开发人员将其描述为一个具有本地图存储和处理的符合ACID事务的数据库，Neo4j在GPL3协议下开源社区版，还具有在商业闭源协议下的在线备份和高可用拓展。Neo还允许Neo4j在闭源商业中使用这些插件。
> Neo4j是由Java实现，同时可以被其他语言写的软件使用事务性HTTP端点或者二进制“Bolt”协议通过Cypher查询语言来进行访问。

以上翻译自Wikipedia。简单来说Neo4j是一个以图形式存储的一个NOSQL。

> 知识图谱（Knowledge Graph），在图书情报界称为知识域可视化或知识领域映射地图，是显示知识发展进程与结构关系的一系列各种不同的图形，用可视化技术描述知识资源及其载体，挖掘、分析、构建、绘制和显示知识及它们之间的相互联系。
> 知识图谱，是通过将应用数学、图形学、信息可视化技术、信息科学等学科的理论与方法与计量学引文分析、共现分析等方法结合，并利用可视化的图谱形象地展示学科的核心结构、发展历史、前沿领域以及整体知识架构达到多学科融合目的的现代理论。

对于这种知识图谱，最好是用neo4j这种图数据库存储。效果如下
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/introduce.png)

# neo4j安装
可以直接到[官网](https://neo4j.com/)进行不同版本的选择安装。我这里选择[desktop](https://neo4j.com/download/?ref=get-started-dropdown-cta)安装。

# 启动
启动比较简单，开箱即用。可以点击下图的start启动数据库是，然后进行open打开内置浏览器。也可以浏览器中打开`http://localhost:7474/browser/`进行访问。
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/start.png)

# Cypher query
新建一个project和database来开始我们的学习。
## 增
Cypher query增加节点非常简单
首先来增加一个人物节点
```CQL
CREATE (p:Person{name:"qxdn",age:21}) return p
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/create-node.png)
蓝色的就是创建的节点，其中`CREATE`就是创建一个节点或者关系。其中`p`表示的是变量名，后续引用这个节点的时候可以使用这个变量名。其中`{}`为该节点的属性，类似于json。`return`为返回输出（可选）。
Cypher中的节点表示如下
```CQL
()                  //匿名节点，无标签
(p:Person)          //使用变量p和标签Person
(:Technology)       //无变量，标签为Technology
(work:Company)      //使用变量work和标签Company
```
接下来创建更多的节点
```CQL
CREATE (p:Person{name:"a",age:21}) return p
CREATE (p:Person{name:"b",age:21}) return p
CREATE (p:Person{name:"c",age:21}) return p
```
创建关系
```CQL
MATCH (p1:Person {name: 'qxdn'})
MATCH (p2:Person {name: 'a'})
CREATE (p1)-[rel:IS_FRIENDS_WITH{from:2021}]->(p2)
// OR 使用MERGE可以避免重复定义
MATCH (p1:Person {name:'b'}), (p2:Person {name:"qxdn"}) 
MERGE (p1)<-[:IS_FRIENDS_WITH{from:2021}]-(p2)
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/rel1.png)
添加关系的方法还是非常简单的。使用`[]`即可表示关系，`:`区分变量名和标签，同样可以使用`{}`描述关系的属性。需要注意的是这里的关系是有方向的，需要用`-->`或`<--`表示。上图可以很明显的看出来。如果不知道方向可以使用`--`表示，这对与查询来说会更简单。
此外在创建节点的时候就可以指明关系
```CQL
CREATE (:Person{name:"d"}) -[:IS_FRIENDS_WITH{from:2020}]->(:Person{name:"e"})
```
## 删
删除命令也比较简单，但是需要注意的是，NEO4j中删除节点需要改节点没有关联的关系。
为了有更好的展示效果，先增条数据
```CQL
MATCH (p:Person{name:"qxdn"})
CREATE (p)-[:BORIN]->(:Country{name:"China"})
//
CREATE (:Person{name:"f"}) -[:IS_FRIENDS_WITH{from:2020}]->(:Person{name:"g"})
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/before-delete.png)
```CQL
// 删除关系
MATCH (:Person {name: 'f'})-[r:IS_FRIENDS_WITH]->(:Person {name: 'g'})
DELETE r
// 删除节点
MATCH (p:Person {name: 'c'})
DELETE p
// 删除节点和关系
MATCH (p1:Person {name: 'd'})-[r:IS_FRIENDS_WITH]->(p2:Person {name: 'e'})
DELETE p1,p2,r
// 断开一个节点的关系和其自身
MATCH (c:Country{name:"China"})
DETACH DELETE c
// 删除一个节点的属性
MATCH (n:Person {name: 'qxdn'})
REMOVE n.age
// OR
MATCH (n:Person {name: 'a'})
SET n.age = null
```
![删除之后](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/after-delete.png)

## 查
先执行一下语句增加节点
```CQL
//
CREATE (:Country{name:"China"})
// 
CREATE (:Country{name:"USA"})
//
MATCH (p:Person{name:"qxdn"}),(c:Country{name:"China"})
MERGE (p)-[:BORN_IN]->(c)
//
MATCH (p:Person{name:"a"}),(c:Country{name:"China"})
MERGE (p)-[:BORN_IN]->(c)
//
MATCH (p:Person{name:"b"}),(c:Country{name:"USA"})
MERGE (p)-[:BORN_IN]->(c)
//
MATCH (p:Person{name:"g"}),(c:Country{name:"USA"})
MERGE (p)-[:BORN_IN]->(c)
//
MATCH (p:Person{name:"f"}),(c:Country{name:"China"})
MERGE (p)-[:BORN_IN]->(c)
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/match1.png)

查询语句主要靠`MATCH`关键词，其功能类似于sql中的`SELECT`

查询所有节点，只输出25个避免过多节点。
```CQL
MATCH (n) 
RETURN n 
LIMIT 25
```
结果与上图一样
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/match1.png)

查询qxdn出生的国家
```CQL
MATCH (:Person {name: 'qxdn'})-[:BORN_IN]->(c:Country)
RETURN c
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/match2.png)

查询qxdn和a做朋友的起始年
```CQL
MATCH (:Person {name: 'qxdn'})-[r:IS_FRIENDS_WITH]->(:Person {name: 'a'})
RETURN r.from
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/match3.png)

查询所有中国出生的人
```CQL
MATCH (p:Person)-[:BORN_IN]->(c:Country{name:"China"})
RETURN p,c
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/match4.png)
## 改
改主要是使用`SET`关键词
修改a的出生国
```CQL
MATCH (p:Person{name:"a"})-[:BORN_IN]-(c:Country{name:"China"})
SET c.name = "USA"
RETURN p,c
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/set.png)

# 前端可视化
前端可视化可以使用`neovis.js`。这是使用vis.js对neo4j进行定制，可以在前端直接操作neo4j。由于实验室项目不需要管啥安全，因此也不管明文密码了。

这里我们先clone一下官网的repo。并修改其中的`simple-example.html`。修改其中的`config`变量
```javascript
var config = {
				container_id: "viz", //jquery的容器id
				server_url: "bolt://localhost:7687", //服务器url
				server_user: "qxdn",
				server_password: "123456",

				labels: {
					//"Character": "name",
					"Person": {
						"caption": "name", //节点显示的内容 
						"title_properties": [ //鼠标移到节点上显示的内容
							"name",
							"age"
						]
					},
					"Country": {
						"caption": "name"
					}
				},
				relationships: {
				},


				initial_cypher: "MATCH p=()-->() RETURN p"    // 初始化的cypher语句
			};
```
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.8/front.png)
## 完整代码
```html
<!doctype html>
<html>

<head>
	<title>Neovis.js Simple Example</title>
	<style type="text/css">
		html,
		body {
			font: 16pt arial;
		}

		#viz {
			width: 900px;
			height: 700px;
			border: 1px solid lightgray;
			font: 22pt arial;
		}
	</style>

	<!-- FIXME: load from dist -->
	<script type="text/javascript" src="../dist/neovis.js"></script>


	<script src="https://code.jquery.com/jquery-3.2.1.min.js"
		integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>

	<script type="text/javascript">
		// define config car
		// instantiate nodevis object
		// draw

		var viz;

		function draw() {
			var config = {
				container_id: "viz",
				server_url: "bolt://localhost:7687",
				server_user: "qxdn",
				server_password: "123456",

				labels: {
					//"Character": "name",
					"Person": {
						"caption": "name",
						"title_properties": [
							"name",
							"age"
						]
					},
					"Country": {
						"caption": "name"
					}
				},
				relationships: {
				},


				initial_cypher: "MATCH p=()-->() RETURN p"
			};

			viz = new NeoVis.default(config);
			viz.render();
			console.log(viz);

		}
	</script>
</head>

<body onload="draw()">
	<div id="viz"></div>


	Cypher query: <textarea rows="4" cols=50 id="cypher"></textarea><br>
	<input type="submit" value="Submit" id="reload">
	<input type="submit" value="Stabilize" id="stabilize">


</body>

<script>
	$("#reload").click(function () {

		var cypher = $("#cypher").val();

		if (cypher.length > 3) {
			viz.renderWithCypher(cypher);
		} else {
			console.log("reload");
			viz.reload();

		}

	});

	$("#stabilize").click(function () {
		viz.stabilize();
	})

</script>

</html>
```




# 后记
本文简单的介绍了一下neo4j以及其的Cypher Query语句，还有前端可视化的方案。关于Cypher更详细的用法和前端更多参数化的定制可以看官方的教程，链接放在了下方的参考资料里面。

# 参考资料
[Neo4j wikipedia](https://en.wikipedia.org/wiki/Neo4j)

[知识图谱](https://baike.baidu.com/item/%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1/8120012)

[Querying with Cypher](https://neo4j.com/developer/cypher/querying/)

[guide-cypher-basics](https://neo4j.com/developer/cypher/guide-cypher-basics/)

[neovis.js](https://github.com/neo4j-contrib/neovis.js)