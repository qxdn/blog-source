---
title: 半次元爬虫
tags:
  - python
  - 爬虫
categories: python
top_img: /images/bcy-spider/cover.png
cover: /images/bcy-spider/cover.png
date: 2021-07-27 22:22:20
description: 看着半次元的图不错，因此写了个小爬虫
swiper_index: 6
---


看着半次元的图不错，打算爬一爬
封面《chaos;child》
<!--more-->


# 前言
因为偶然的机会得知了半次元的存在，后续又觉得半次元的COS图、JK图还有一些绘图不错，因此打算爬一些好看的图片。

# 分析网页
## 分析html
分析被爬的网页肯定是要打开控制台了，按下F12先观察html可以发现在第一个`<script>`标签中存在一个json文件。这个json包含了你的用户信息、圈子信息和图片信息等。因为整个json文件解析后行有点点多，因此这里就放出部分内容。
![F12分析html](/images/bcy-spider/F12-1.png)
![html中的json](/images/bcy-spider/html-json.png)
## 分析api
继续分析网络信息，可以发现在向下滚动后可以发现有一个api返回了包含图片信息的接口，其参数结构如下
`https://www.bcy.net/apiv3/common/circleFeed?circle_id=399&since=rec:2&sort_type=1&grid_type=10`
经过多次调用可以发现circle_id表示这个圈子的id，如JK、COS有各自的circle_id。而滚动时变化的只有since的参数，表示的是调用第几波。因此请求的时候只需要修改circle_id和since的内容即可
![F12分析api（过滤了无关内容）](/images/bcy-spider/F12-2.png)
![api返回的json](/images/bcy-spider/api-json.png)

## 图片格式
以上图的网址为例子，半次元的图片有多种请求格式，如下所示。此外看到json里面的`format`字段则是表示了图片的格式（有gif的）。
```
# 返回宽度为650的图
https://p3-bcy.byteimg.com/img/banciyuan/756021456bf744f2a04ac989a2e106a6~tplv-banciyuan-w650.image
# 中等大小的图
https://p3-bcy.byteimg.com/img/banciyuan/756021456bf744f2a04ac989a2e106a6~tplv-banciyuan-sq360.image
# 稍微大一点大图
https://p3-bcy.byteimg.com/img/banciyuan/756021456bf744f2a04ac989a2e106a6~tplv-banciyuan-tl640.image
# 小方图
https://p3-bcy.byteimg.com/img/banciyuan/756021456bf744f2a04ac989a2e106a6~tplv-banciyuan-2x2.image
# 似乎是原图
https://p3-bcy.byteimg.com/img/banciyuan/756021456bf744f2a04ac989a2e106a6~noop.image
```

# 爬取图片
由于`request`库不支持异步，下载图片会比较耗时，同时为了后续方便加入`nonebot`机器人框架中，因此使用`httpx`作为本次的请求库。`httpx`另一个好处是兼容`request`接口
另外需要注意的是需要使用`httpx.AsyncClient()`或是`request.session()`这种保存cookie，如果没有cookie，每次请求半次元api会返回一样的json文件
为了加快一定速度，本次加了圈名转圈id的缓存，如果在`nonebot`框架里面可以使用数据库更好。

## 代码
```python
import json
import httpx
import os
import asyncio
import pickle
from bs4 import BeautifulSoup
import re


def load_cookies():
    '''
    cookie读取，域敏感因此之间转dict存不行
    '''
    if not os.path.isfile("cookies.pk"):
        return None
    cookies = httpx.Cookies()
    with open("cookies.pk", "rb") as f:
        jar_cookies = pickle.load(f)
    for domain, pc in jar_cookies.items():
        for path, c in pc.items():
            for k, v in c.items():
                cookies.set(k, v.value, domain=domain, path=path)
    return cookies


# 没有cookie会导致每次获得的json是一样的，如果是全天候定时执行可以去除cookie读取和保存
client = httpx.AsyncClient(cookies=load_cookies())


def get_header(image: bool = False) -> dict:
    '''
    获取request header部分
    image: 请求的是否为图片
    '''
    headers = {'referer': 'https://www.bcy.net/',
               'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
               }
    if image == True:
        headers['accept'] = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    return headers


async def id2name(id: int) -> str:
    '''
    将id转name
    '''
    url = "https://www.bcy.net/tag/{id}".format(id=id)
    r = await client.get(url, headers=get_header())
    soup = BeautifulSoup(r.text, features="html.parser")
    name = soup.find('meta', {'name': 'keywords'})['content'].split(" - ")[0]
    # print(name)
    return name
    # print(r.text)
    # with open('index.html','w',encoding='utf-8') as f:
    #    f.write(r.text)

async def load_name2id_cache():
    '''
    获取name2id的缓存
    '''
    if not os.path.isfile('cache.json'):
        return None
    with open('cache.json','r',encoding='utf-8') as f:
        return json.load(f)

async def save_name2id_cache(cache):
    '''
    保存缓存
    '''
    with open('cache.json','w',encoding='utf-8') as f:
        # 中文
        json.dump(cache,f,ensure_ascii=False)

async def name2id(name: str):
    '''
    将name转id
    '''
    # 读取name2id的缓存
    cache = await load_name2id_cache()
    if not cache == None and name in cache:
        return cache[name]
    if cache == None:
        cache = {}    
    # 缓存则爬取
    url = "https://www.bcy.net/search/home?k={name}".format(name=name)
    r = await client.get(url, headers=get_header())
    raw = re.findall('JSON.parse\(".*"\);', r.text)[0].replace('JSON.parse(', '').replace(');', '').replace('\\\\u002F', '/')
    data = json.loads(raw) #这里居然返回的是str
    data = json.loads(data)
    circles = data['all']['circle']['circle_list']
    cid = None
    for circle in circles:
        cache[circle['circle_name']] = circle['circle_id']
        if circle['circle_name'] == name:
            cid = circle['circle_id']
    #print(cid)
    await save_name2id_cache(cache)
    return cid
    #with open('index.html','w',encoding='utf-8') as f:
    #    f.write(r.text)

async def download_image(url: str, save_path: str = '', format: str = 'jpeg'):
    '''
    通过url下载图片
    '''
    filename = url.split('/')[-1]+'.'+format
    filename = os.path.join(save_path, filename)
    # 拼接实际地址
    url = url + "~noop.image"
    r = await client.get(url, headers=get_header())
    with open(filename, 'wb') as f:
        f.write(r.content)


async def get_more_from_tag(circle_id: int, since: int = 0):
    '''
    调用circleFeed接口，获取圈子内的图
    '''
    headers = get_header()
    url = "https://www.bcy.net/apiv3/common/circleFeed?circle_id={cid}&since=rec:{since}&sort_type=1&grid_type=10".format(
        cid=circle_id, since=since)
    # print(url)
    r = await client.get(url, headers=headers)
    # with open('{}.json'.format(since),'w',encoding='utf-8') as f:
    #   json.dump(r.json(),f,ensure_ascii=False)
    return r.json()


async def download_image_from_tag(circle_id: int, circle_name: str = None):
    '''
    通过圈子id下载图片
    '''
    # 建文件夹分类
    if circle_name == None or circle_name.strip() == '':
        circle_name = str(circle_id)
    save_path = circle_name
    if not os.path.exists(save_path):
        os.mkdir(save_path)
    content = await get_more_from_tag(circle_id, since=0)
    items = content['data']['items']
    for item in items:
        image_list = item['item_detail']['image_list']
        for image in image_list:
            await download_image(image['path'], save_path=save_path, format=image['format'])

async def download_image_from_name(circle_name:str):
    '''
    通过圈名下载图片
    '''
    cid = await name2id(circle_name)
    if cid != None:
        await download_image_from_tag(cid,circle_name)

async def close_client():
    '''
    关闭client，保存cookie
    '''
    with open("cookies.pk", "wb") as f:
        pickle.dump(client.cookies.jar._cookies, f)
    await client.aclose()

# asyncio.run(download_image(
#    "https://p3-bcy.byteimg.com/img/banciyuan/2eb5f6a5330f47ccaab29eff30a42a15"))

# asyncio.run(get_more_from_tag(492))
loop = asyncio.get_event_loop()
loop.run_until_complete(download_image_from_name("COS正片"))
#loop.run_until_complete(name2id("JK"))
loop.run_until_complete(close_client())
loop.close()
```

# 后续工作
后续工作在于使用`Aspscheduler`框架定时爬取。有空的话整合到`nonebot`里面，并使用数据库保存更多信息。
此外由于半次元更像是微博一样的个人圈子，圈内发布的内容中含有一定的杂图，因此爬取时会有杂图在内，后续需要加入热榜爬虫。