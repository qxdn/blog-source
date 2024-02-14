---
title: 魔力赏市集搜索脚本
tags:
  - python
  - 爬虫
categories: python
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.6/cover.png
description: >-
  经常在魔力赏市集捡漏的我发现有人在闲鱼卖魔力赏脚本，b站魔力赏市集自身没有搜索功能，且自带的筛选不是很好用。这样一想，为何我不自己做一个简单的搜索脚本方便我自己后续捡漏
date: 2024-02-12 15:21:22
---



> 封面 《天使騒々 RE-BOOT!》

# 前言
经常在魔力赏市集捡漏的我发现有人在闲鱼卖魔力赏脚本，b站魔力赏市集自身没有搜索功能，且自带的筛选不是很好用。这样一想，为何我不自己做一个简单的搜索脚本方便我自己后续捡漏。

# 分析
先打开魔力赏市集的[网页版本](https://mall.bilibili.com/neul-next/index.html?page=magic-market_index)，也可以直接分析手机端的，但是我觉得网页端的更方便一些。打开控制台看，然后选择fetch/xhr。可以看到请求list接口的返回即我们需要的。

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.6/index-console.png)

请求链接为[https://mall.bilibili.com/mall-magic-c/internet/c2c/v2/list](https://mall.bilibili.com/mall-magic-c/internet/c2c/v2/list)，请求为
```json
{"categoryFilter":"","sortType":"PRICE_ASC","priceFilters":["2000-3000"],"discountFilters":["70-100"],"nextId":null}
```

其中`categoryFilter`为分类，`nextId`为下一页的id，`sortType`为排序方式，`priceFilters`为价格区间，`discountFilters`为折扣区间。我们可以通过修改这些参数来获取不同的数据。

## 请求参数
### categoryFilter
其中`categoryFilter`的值为
```
"" # 默认全部
2312 # 手办
2066 # 模型
2331 # 周边
2273 # 3C
fudai_cate_id # 福袋
```

### sortType
`sortType`的值为
```
TIME_DESC # 默认时间降序
PRICE_ASC # 价格升序
PRICE_DESC # 价格降序
```
### priceFilters
`priceFilters`为一个数组，可以传多个值
```
0-2000  # 0-20 
2000-3000  # 20-30
3000-5000 # 30-50
5000-10000 # 50-100
10000-20000 # 100-200
20000-0 # 200以上
```

### discountFilters
`discountFilters`为一个数组，可以传多个值
```
0-30  # 3折以下
30-50 # 3-5折
50-70 # 5-7折
70-100 # 7折以上
```

## 返回值
一个返回值的例子如下
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "data": [
            {
                "c2cItemsId": 26966238714,
                "type": 1,
                "c2cItemsName": "万代 巴尔坦星人 成品模型",
                "detailDtoList": [
                    {
                        "blindBoxId": 172121251,
                        "itemsId": 10247905,
                        "skuId": 1000540946,
                        "name": "万代 巴尔坦星人 成品模型",
                        "img": "//i0.hdslb.com/bfs/mall/mall/a6/74/a674a8508fdc3c2b200eb8a13c550105.png",
                        "marketPrice": 9900,
                        "type": 1,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 4600,
                "showPrice": "46",
                "showMarketPrice": "99",
                "uid": "12***4",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "L***",
                "uspaceJumpUrl": null,
                "uface": "https://i0.hdslb.com/bfs/face/8a27b672ced316648c6ceda73c56230fe4667979.jpg"
            },
            {
                "c2cItemsId": 26963873932,
                "type": 1,
                "c2cItemsName": "FuRyu 洛天依 海军水手服Ver. 景品手办 等2个商品",
                "detailDtoList": [
                    {
                        "blindBoxId": 173103346,
                        "itemsId": 10234013,
                        "skuId": 1000522471,
                        "name": "FuRyu 洛天依 海军水手服Ver. 景品手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/b6/ba/b6ba5295c1d2e64a9ad91b60bb6d9157.png",
                        "marketPrice": 11500,
                        "type": 1,
                        "isHidden": false
                    },
                    {
                        "blindBoxId": 173104487,
                        "itemsId": 10242365,
                        "skuId": 1000533220,
                        "name": "世嘉 初音未来 star voice 景品手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/5b/8e/5b8e18301e6d4aef29786a52e442e373.png",
                        "marketPrice": 10900,
                        "type": 1,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 2,
                "price": 12300,
                "showPrice": "123",
                "showMarketPrice": "224",
                "uid": "39***6",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "葬***",
                "uspaceJumpUrl": null,
                "uface": "https://i1.hdslb.com/bfs/face/02c18e656b7c46f20a1b6f5e07eadf0e91a5c054.jpg"
            },
            {
                "c2cItemsId": 26964787529,
                "type": 1,
                "c2cItemsName": "明日方舟 白日梦 两变毛绒玩偶",
                "detailDtoList": [
                    {
                        "blindBoxId": 172846368,
                        "itemsId": 10150614,
                        "skuId": 1000301217,
                        "name": "明日方舟 白日梦 两变毛绒玩偶",
                        "img": "//i0.hdslb.com/bfs/mall/mall/93/d2/93d29f3134ade41bb843a9a3c0c1f28c.png",
                        "marketPrice": 8800,
                        "type": 0,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 4300,
                "showPrice": "43",
                "showMarketPrice": "88",
                "uid": "17***5",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "b***",
                "uspaceJumpUrl": null,
                "uface": "https://i2.hdslb.com/bfs/face/5d786895471c9979995181f0428f436bdab205c2.jpg"
            },
            {
                "c2cItemsId": 26962899471,
                "type": 1,
                "c2cItemsName": "Hobby·sakura 原创 Lost：Order 涅瓦奥斯特罗 手办",
                "detailDtoList": [
                    {
                        "blindBoxId": 173147927,
                        "itemsId": 10218091,
                        "skuId": 1000497320,
                        "name": "Hobby·sakura 原创 Lost：Order 涅瓦奥斯特罗 手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/9a/06/9a06012ea90e29a2295f08a65ca7473c.png",
                        "marketPrice": 79900,
                        "type": 1,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 58000,
                "showPrice": "580",
                "showMarketPrice": "799",
                "uid": "35***4",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "阿***",
                "uspaceJumpUrl": null,
                "uface": "https://i1.hdslb.com/bfs/face/868653c20bf4fe5cf1a3b31f8d9bdf0e96a3f8db.jpg"
            },
            {
                "c2cItemsId": 26964786210,
                "type": 1,
                "c2cItemsName": "TAITO 伊蕾娜 猫耳女仆Ver. 景品手办",
                "detailDtoList": [
                    {
                        "blindBoxId": 173111518,
                        "itemsId": 10155134,
                        "skuId": 1000341326,
                        "name": "TAITO 伊蕾娜 猫耳女仆Ver. 景品手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/78/5a/785a552a3a59cff649459992f13da047.png",
                        "marketPrice": 12500,
                        "type": 0,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 12000,
                "showPrice": "120",
                "showMarketPrice": "125",
                "uid": "48***3",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "木***",
                "uspaceJumpUrl": null,
                "uface": "https://i1.hdslb.com/bfs/face/f9c3f7e60324197aa614934576da7ced55616d54.jpg"
            },
            {
                "c2cItemsId": 26963872474,
                "type": 1,
                "c2cItemsName": "GSC 宫园薰 手办 二次再版",
                "detailDtoList": [
                    {
                        "blindBoxId": 173146518,
                        "itemsId": 10229731,
                        "skuId": 1000515890,
                        "name": "GSC 宫园薰 手办 二次再版",
                        "img": "//i0.hdslb.com/bfs/mall/mall/3e/47/3e47b7b56a20d42f06f38804080307fa.png",
                        "marketPrice": 59900,
                        "type": 1,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 48500,
                "showPrice": "485",
                "showMarketPrice": "599",
                "uid": "12***4",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "L***",
                "uspaceJumpUrl": null,
                "uface": "https://i0.hdslb.com/bfs/face/8a27b672ced316648c6ceda73c56230fe4667979.jpg"
            },
            {
                "c2cItemsId": 26966237586,
                "type": 1,
                "c2cItemsName": "TAITO 娜娜奇 景品手办",
                "detailDtoList": [
                    {
                        "blindBoxId": 171832665,
                        "itemsId": 10183383,
                        "skuId": 1000414948,
                        "name": "TAITO 娜娜奇 景品手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/09/64/09648605662dcc5f33c95f1cf7956c91.png",
                        "marketPrice": 11200,
                        "type": 0,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 7900,
                "showPrice": "79",
                "showMarketPrice": "112",
                "uid": "10***7",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "b***",
                "uspaceJumpUrl": null,
                "uface": "https://i0.hdslb.com/bfs/face/24929ae94243e2bfe25ca8cb0193aabac7f74edf.jpg"
            },
            {
                "c2cItemsId": 26969072872,
                "type": 1,
                "c2cItemsName": "初音未来 World Is Mine 棕色相框 手办 进阶大礼包",
                "detailDtoList": [
                    {
                        "blindBoxId": 171884759,
                        "itemsId": 10214903,
                        "skuId": 1000493445,
                        "name": "初音未来 World Is Mine 棕色相框 手办 进阶大礼包",
                        "img": "//i0.hdslb.com/bfs/mall/mall/ef/82/ef82c0def3a4015f36f465a0c1b464b2.png",
                        "marketPrice": 92800,
                        "type": 0,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 39900,
                "showPrice": "399",
                "showMarketPrice": "928",
                "uid": "46***6",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "b***",
                "uspaceJumpUrl": null,
                "uface": "https://i1.hdslb.com/bfs/face/c46fe783ac7a5291dac4773744b3d35d7cebd77f.jpg"
            },
            {
                "c2cItemsId": 26960920976,
                "type": 1,
                "c2cItemsName": "TAITO 夜刀神十香 日式哥特 景品手办",
                "detailDtoList": [
                    {
                        "blindBoxId": 168284958,
                        "itemsId": 10198014,
                        "skuId": 1000456603,
                        "name": "TAITO 夜刀神十香 日式哥特 景品手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/d9/bc/d9bc20c221404f37dedba9419399eab0.png",
                        "marketPrice": 11200,
                        "type": 1,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 8900,
                "showPrice": "89",
                "showMarketPrice": "112",
                "uid": "15***0",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "尊***",
                "uspaceJumpUrl": null,
                "uface": "https://i0.hdslb.com/bfs/face/cafe0703ce463aaeea16b8d816729b4408191b17.jpg"
            },
            {
                "c2cItemsId": 26963871949,
                "type": 1,
                "c2cItemsName": "TAITO 时崎狂三 小悪魔ver.Renewal 景品手办",
                "detailDtoList": [
                    {
                        "blindBoxId": 171387771,
                        "itemsId": 10201598,
                        "skuId": 1000466851,
                        "name": "TAITO 时崎狂三 小悪魔ver.Renewal 景品手办",
                        "img": "//i0.hdslb.com/bfs/mall/mall/05/1a/051ab6eb0779dde0ff6790e16bbd1094.png",
                        "marketPrice": 11200,
                        "type": 1,
                        "isHidden": false
                    }
                ],
                "totalItemsCount": 1,
                "price": 7500,
                "showPrice": "75",
                "showMarketPrice": "112",
                "uid": "35***5",
                "paymentTime": 0,
                "isMyPublish": false,
                "uname": "b***",
                "uspaceJumpUrl": null,
                "uface": "https://i1.hdslb.com/bfs/face/4149c737ac0935e4555f19fee0f0dc10717c7fd5.jpg"
            }
        ],
        "nextId": "Tr3zzf1Z3R/kCk/ydclK/+ck7umNnK/LlWgF8fcba8I="
    },
    "errtag": 0
}
```
整个返回值的类型为经典的返回格式
```json
{
    "code": 0,
    "message": "success",
    "data": {
        ...
    },
    "errtag": 0
}
```

我们需要的值就在`data`中，且我们的`data`中含有`nextId`和`data`两个key，其中`nextId`来获取下一页的数据，`data`就是我们需要的手办数据。

### 细节key
- c2cItemsId 市集商品id，可跳转到详细页  `https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId={c2citemsId}&from=market_index`
- type 类型(什么类型暂且不明)
- c2cItemsName 市集展示商品名
- detailDtoList 商品细节，因为可能是多个商品捆绑，所以是list
    - blindBoxId 应该是盲盒id
    - itemsId 猜测是会员购的id
    - skuId 未知
    - name 商品名
    - img 商品图
    - marketPrice 原价，单位分
    - type 类型(什么类型暂且不明)
    - isHidden 是否隐藏，猜测和福袋相关
- totalItemsCount 总共商品数
- price 市集价格，单位分
- showPrice 展示价格，字符串，单位元
- showMarketPrice 展示原价，字符串，单位元
- uid 卖方uid
- paymentTime 未知
- isMyPublish 是否为本人发布
- uname 用户名
- uspaceJumpUrl 用户空间url
- uface 用户头像

## header
事实上，请求的时候还需要带上我们的cookie，这样才能获取到我们的数据。否则会返回未登录
```json
{
    "code": 83001002,
    "message": "尚未登录"
}
```

## 风控
在请求的时候需要注意b站的风控，不要频繁的请求。否则太快会直接返回412


# 简单实现
```python
import requests
from typing import List, Dict
import time
import click

MARKET_URL = "https://mall.bilibili.com/mall-magic-c/internet/c2c/v2/list"

HEADERS = {
    "Cookie": "", #TODO: 填写你的cookie
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
}

CATEGORY_MAP = {
    "全部": "",
    "手办": "2312",
    "模型": "2066",
    "周边": "2331",
    "3C": "2273",
    "福袋": "fudai_cate_id",
}

SORT_MAP = {
    "时间降序": "TIME_DESC",
    "价格升序": "PRICE_ASC",
    "价格降序": "PRICE_DESC",
}


def category2id(category: str):
    return CATEGORY_MAP.get(category, "")


def sort2type(sort: str):
    return SORT_MAP.get(sort, "TIME_DESC")


def process_url(c2citemsId):
    return f"https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId={c2citemsId}&from=market_index"


def get_market_data(
    category_filter: str = "",
    headers: Dict[str, str] = HEADERS,
    next_id: str = None,
    sort_type: str = "TIME_DESC",
    price_filter: List[str] = [],
    discount_filter: List[str] = [],
):
    response = requests.post(
        MARKET_URL,
        headers=headers,
        json={
            "categoryFilter": category_filter,
            "nextId": next_id,
            "sortType": sort_type,
            "priceFilter": price_filter,
            "discountFilter": discount_filter,
        },
    )
    # print(response.content)
    return response.json()


def filter_data(data: dict, keyword: str = None):
    if keyword is None:
        return
    for item in data:
        c2cItemsId = item.get("c2cItemsId", None)
        showPrice = item.get("showPrice", None)
        c2cItemsName = item.get("c2cItemsName", None)
        if keyword in c2cItemsName:
            print(f"{c2cItemsName} - {showPrice}元 - {process_url(c2cItemsId)}")
            continue
        for detail in item.get("detailDtoList", []):
            name = detail.get("name", "")
            if keyword in name:
                print(f"{c2cItemsName} - {showPrice}元 - {process_url(c2cItemsId)}")
                break


def search(keyword: str, category: str, sort: str):
    nextId = None
    count = 0
    while True:
        data = get_market_data(
            next_id=nextId,
            category_filter=category,
            discount_filter=[],
            price_filter=[],
            sort_type=sort,
        )

        data = data.get("data", {})
        nextId = data.get("nextId", None)
        if not nextId:
            break
        print(f"第{count}页")
        filter_data(data.get("data", []), keyword)
        count += 1
        if count % 30 == 0:
            print("避免风控，休息半分钟")
            time.sleep(30)


@click.command()
@click.option("--keyword", prompt="搜索关键词", help="搜索关键词")
@click.option(
    "--category",
    prompt="请选择分类",
    type=click.Choice(["全部", "手办", "模型", "周边", "3C", "福袋"]),
    default="全部",
)
@click.option(
    "--sort",
    prompt="请选择排序方式",
    type=click.Choice(["时间降序", "价格升序", "价格降序"]),
    default="时间降序",
)
def cli(keyword: str, category: str, sort: str):
    search(keyword, category2id(category), sort2type(sort))


cli()

```
# 效果
![效果](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.6/result.png)