---
title: 米游社爬虫
tags:
  - python
  - 爬虫
categories: python
description: 我觉得米游社的COS图和同人图质量很高，我很喜欢。因此写了个小小的爬虫。
date: 2021-11-12 10:21:43
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.7/cover.png
---

> 封面《悠久のカンパネラ》

# 前言
因为个人比较喜欢米游社的COS图和同人图，同时觉得其质量满高的，因此打算爬取其图片。

完整附带简易cli的代码放在了[GitHub](https://github.com/qxdn/mihoyo-bbs-crawler)

# 关闭Debug模式
首先先分析原神的页面，打开原神的[COS页面](https://bbs.mihoyo.com/ys/home/49)，一如既往的打开调试页面。
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.7/f12.png)
可以看到米游社对分析源代码做了一些防范，分析时会始终卡在debug页面上。但是这也难不倒我们。直接点击下方的deactivate按钮，即可关闭debug模式。
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.7/deactivate.png)

# 分析请求
以原神COS的热门图片为例。在调试页面下打开原神COS页面的热门图片，分析其中的请求。从网页源代码中可以发现米游社是一个动态页面，所有的内容都是向服务器动态请求。因此在network界面中找到含有内容json的请求。找到的界面如下。

![request](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.7/get1.png)

![preview](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.7/get-perview.png)

由此分析请求参数，得到如下参数:
- api地址: https://bbs-api.mihoyo.com/post/wapi/getForumPostList
- fourm_id
- gids
- is_good
- is_hot
- page_size

接下来逐个分析各个参数。
<!--TOC-->
[完整的参数含义](#完整参数意义)
<!--TOC-->

## api地址
观察`最新回复`、`最新发帖`、`热门`、`精华`、`日榜`、`周榜`、`月榜`。可以得到各个内容对应的api地址。
- baseurl: https://bbs-api.mihoyo.com/post/wapi
- api
    - /getForumPostList: 
        - `最新回复`
        - `最新发帖`
        - `热门`
        - `日榜`
        - `周榜`
        - `月榜`
    - /forumGoodPostFullList:
        - `精华`    

## forum_id
forum_id为社区的id，不同社区的id不同。各大社区对应id如下。
- 原神 
    - COS: 49
    - 同人图: 29
- 崩3
    - 同人图: 4
- 大别墅
    - COS: 47
    - 同人图: 39
- 星穹铁道
    - 同人图: 56
- 崩2
    - 同人图: 40
- 未定
    - 同人图: 38

## gids
gids在json中可以看到是指game_id，各大游戏的game_id对应如下
- 崩3: 1
- 原神: 2
- 崩2: 3
- 未定: 4
- 大别墅: 5
- 星穹铁道: 6

## is_good
该参数为一个bool值，表示是否为精华。实际上基本用不到，精华查询不用这个。

## is_hot
该参数为一个bool值，表示是否为热门。

## sort_type
在观察最新发帖和最新回复页面请求时发现该参数。该参数为一个int变量，可选值为1或者2。对应内容如下
- 最新回复: 1
- 最新发帖: 2

## type
在观察榜单的请求时发泄该参数。该参数为一个int变量，可选值为1、2、3，对应内容如下
- 日榜: 1
- 周榜: 2
- 月榜: 3

# 完整参数意义
- api:
    - /forumGoodPostFullList: 用于查询精华
    - /getForumPostList: 用于热门、最新回复、最新发帖、榜单
- fourm_id: 社区id
- gids: 游戏id
- is_good: 是否为精华
- is_hot: 是否为热门
- page_size: 返回post的数量
- sort_type: 用于查询和区别最新回复和最新发帖
- type: 用于榜单查询，区分日榜、周榜和月榜

# json分析
米游社返回的json基本相同，但是精华返回的与其他略有不同。主要为其中一个key不同，精华是`posts`、其余是`list`
## 精华
```json
{
    "retcode": 0,
    "message": "OK",
    "data": {
        "posts": [
            {
                "post": {
                    "game_id": 2,
                    "post_id": "10544616",
                    "f_forum_id": 29,
                    "uid": "179065436",
                    "subject": "【观测枢】灶王爷锅巴-②",
                    "content": "逐月节里惹人疼爱的锅巴头像二期来啦~\n一共4张，按照图的顺序分别是：\n①锅锅害羞（这表情就出现过两个瞬间，太少了）\n②锅锅委屈（魈猫猫不理锅！）\n③锅吃窝头（初遇香菱情景）\n④锅锅神像（灶神像）",
                    "cover": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/0f0dc49e5b4f3f579119e81c2d98a1c1_61295632854955864.jpg",
                    "view_type": 2,
                    "created_at": 1633624612,
                    "images": [
                        "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/c8e8c7e273b31f7e16ce65d5220c18c0_1642884008313599219.jpg",
                        "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/2897e34888a2ef7ccafa099202432971_149407973314057590.jpg",
                        "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/0f0dc49e5b4f3f579119e81c2d98a1c1_61295632854955864.jpg",
                        "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/36eb746e02be4563e086c15571f3f8e3_3412574759048499179.jpg",
                        "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/affa15e44b7eb4c2359e3464c5549715_874705953357861664.png"
                    ],
                    "post_status": {
                        "is_top": false,
                        "is_good": true,
                        "is_official": false
                    },
                    "topic_ids": [
                        53,
                        105,
                        439,
                        559,
                        761
                    ],
                    "view_status": 1,
                    "max_floor": 16,
                    "is_original": 1,
                    "republish_authorization": 2,
                    "reply_time": "2021-10-22 08:03:01",
                    "is_deleted": 0,
                    "is_interactive": false,
                    "structured_content": "",
                    "structured_content_rows": [],
                    "review_id": 0,
                    "is_profit": false,
                    "is_in_profit": false
                },
                "forum": {
                    "id": 29,
                    "name": "同人图",
                    "icon": "https://upload-bbs.mihoyo.com/upload/2020/04/05/f8b71f0c5b81976d7e36c8ae014f9e5b.png",
                    "game_id": 2
                },
                "topics": [
                    {
                        "id": 53,
                        "name": "同人图",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2021/09/09/61f2fe15f5fd3d976690855337ba5ba9_7313218117241578974.png",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 2
                    },
                    {
                        "id": 105,
                        "name": "表情包",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2019/06/27/178fc0552cf615c5c40fd8bb9a1556ab.png",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 2
                    },
                    {
                        "id": 439,
                        "name": "香菱",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2020/11/25/8a4309c40e68e3e42fb64931e8fad6fc.jpeg",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 1
                    },
                    {
                        "id": 559,
                        "name": "头像",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2021/04/01/d76532e1f634d57646dcbc1852eba6a8_2131217136772532601.png",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 2
                    },
                    {
                        "id": 761,
                        "name": "来点稿头",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2021/09/06/e58af9f46cdf0e920386f44dbc089617_4917005110024976346.jpg",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 3
                    }
                ],
                "user": {
                    "uid": "179065436",
                    "nickname": "子旖",
                    "introduce": "懒癌晚期患者+重度杂食性选手，我只会画大头",
                    "avatar": "30015",
                    "gender": 0,
                    "certification": {
                        "type": 2,
                        "label": "观测者、画师"
                    },
                    "level_exp": {
                        "level": 8,
                        "exp": 7493
                    },
                    "is_following": false,
                    "is_followed": false,
                    "avatar_url": "https://img-static.mihoyo.com/avatar/avatar30015.png",
                    "pendant": ""
                },
                "self_operation": {
                    "attitude": 0,
                    "is_collected": false
                },
                "stat": {
                    "view_num": 4353,
                    "reply_num": 26,
                    "like_num": 490,
                    "bookmark_num": 47,
                    "forward_num": 2
                },
                "help_sys": {
                    "top_up": null,
                    "top_n": [],
                    "answer_num": 0
                },
                "cover": {
                    "url": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/0f0dc49e5b4f3f579119e81c2d98a1c1_61295632854955864.jpg",
                    "height": 2000,
                    "width": 2000,
                    "format": "jpg",
                    "size": "810604",
                    "crop": null,
                    "is_user_set_cover": true,
                    "image_id": "27423117",
                    "entity_type": "IMG_ENTITY_POST",
                    "entity_id": "10544616"
                },
                "image_list": [
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/c8e8c7e273b31f7e16ce65d5220c18c0_1642884008313599219.jpg",
                        "height": 2000,
                        "width": 2000,
                        "format": "jpg",
                        "size": "785773",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "27423068",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "10544616"
                    },
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/2897e34888a2ef7ccafa099202432971_149407973314057590.jpg",
                        "height": 2000,
                        "width": 2000,
                        "format": "jpg",
                        "size": "818320",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "27423098",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "10544616"
                    },
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/0f0dc49e5b4f3f579119e81c2d98a1c1_61295632854955864.jpg",
                        "height": 2000,
                        "width": 2000,
                        "format": "jpg",
                        "size": "810604",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "27423117",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "10544616"
                    },
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/36eb746e02be4563e086c15571f3f8e3_3412574759048499179.jpg",
                        "height": 2000,
                        "width": 2000,
                        "format": "jpg",
                        "size": "889738",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "27423123",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "10544616"
                    },
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/10/08/179065436/affa15e44b7eb4c2359e3464c5549715_874705953357861664.png",
                        "height": 270,
                        "width": 1080,
                        "format": "png",
                        "size": "140855",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "27423168",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "10544616"
                    }
                ],
                "is_official_master": false,
                "is_user_master": false,
                "hot_reply_exist": false,
                "vote_count": 0,
                "last_modify_time": 0,
                "recommend_type": "",
                "collection": null,
                "vod_list": [],
                "is_block_on": false,
                "forum_rank_info": null
            }
        ],
        "last_id": "1",
        "is_last": false,
        "next_offset": "0"
    }
}
```
## 其余返回
```json
{
    "retcode": 0,
    "message": "OK",
    "data": {
        "list": [
            {
                "post": {
                    "game_id": 2,
                    "post_id": "11794784",
                    "f_forum_id": 49,
                    "uid": "283837710",
                    "subject": "【cos】往生堂第七十七代堂主就是胡桃我啦！",
                    "content": "可以说这是我cos过最不像的一个角色了，做胡桃的传说任务觉得她表面活泼可爱 实际上心理又很成熟豁达，还有点小腹黑，这样的反差好难表达，我一点也不可爱，再也不会出了。。。",
                    "cover": "https://upload-bbs.mihoyo.com/upload/2021/11/09/283837710/eaf9376a42d40973d43a90a113828e93_1442388115152832304.jpg",
                    "view_type": 2,
                    "created_at": 1636438339,
                    "images": [
                        "https://upload-bbs.mihoyo.com/upload/2021/11/09/283837710/96b35bf328a9884fb15021c5377372ec_53917698238889953.jpg",
                        "https://upload-bbs.mihoyo.com/upload/2021/11/09/283837710/eaf9376a42d40973d43a90a113828e93_1442388115152832304.jpg"
                    ],
                    "post_status": {
                        "is_top": false,
                        "is_good": false,
                        "is_official": false
                    },
                    "topic_ids": [
                        525,
                        547
                    ],
                    "view_status": 1,
                    "max_floor": 2495,
                    "is_original": 1,
                    "republish_authorization": 2,
                    "reply_time": "2021-11-12 10:00:12",
                    "is_deleted": 0,
                    "is_interactive": false,
                    "structured_content": "",
                    "structured_content_rows": [],
                    "review_id": 0,
                    "is_profit": false,
                    "is_in_profit": false
                },
                "forum": {
                    "id": 49,
                    "name": "COS",
                    "icon": "https://upload-bbs.mihoyo.com/upload/2021/04/29/0cd5fbc21feccc3dbccf7ddd3a14cded.png",
                    "game_id": 2
                },
                "topics": [
                    {
                        "id": 525,
                        "name": "胡桃",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2021/02/27/5f567ecb567640f0a9e26775f6aa4942.png",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 1
                    },
                    {
                        "id": 547,
                        "name": "Cosplay",
                        "cover": "https://upload-bbs.mihoyo.com/upload/2021/09/09/9a3b4ee5699c95707df85fb77bce39f2_1763133664448316116.png",
                        "is_top": false,
                        "is_good": false,
                        "is_interactive": false,
                        "game_id": 0,
                        "content_type": 2
                    }
                ],
                "user": {
                    "uid": "283837710",
                    "nickname": "小白Nanno",
                    "introduce": "全网都叫小白Nanno，视频在抖音快手b站               ",
                    "avatar": "100061",
                    "gender": 0,
                    "certification": {
                        "type": 2,
                        "label": "Coser"
                    },
                    "level_exp": {
                        "level": 9,
                        "exp": 10211
                    },
                    "is_following": false,
                    "is_followed": false,
                    "avatar_url": "https://img-static.mihoyo.com/communityweb/upload/a57113d5e6173a05f7980c978c5a2bd6.png",
                    "pendant": ""
                },
                "self_operation": {
                    "attitude": 0,
                    "is_collected": false
                },
                "stat": {
                    "view_num": 529292,
                    "reply_num": 3664,
                    "like_num": 113866,
                    "bookmark_num": 4978,
                    "forward_num": 543
                },
                "help_sys": {
                    "top_up": null,
                    "top_n": [],
                    "answer_num": 0
                },
                "cover": {
                    "url": "https://upload-bbs.mihoyo.com/upload/2021/11/09/283837710/eaf9376a42d40973d43a90a113828e93_1442388115152832304.jpg",
                    "height": 4032,
                    "width": 2268,
                    "format": "jpg",
                    "size": "4346689",
                    "crop": null,
                    "is_user_set_cover": true,
                    "image_id": "30556208",
                    "entity_type": "IMG_ENTITY_POST",
                    "entity_id": "11794784"
                },
                "image_list": [
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/11/09/283837710/96b35bf328a9884fb15021c5377372ec_53917698238889953.jpg",
                        "height": 3865,
                        "width": 2174,
                        "format": "jpg",
                        "size": "4443075",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "30556207",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "11794784"
                    },
                    {
                        "url": "https://upload-bbs.mihoyo.com/upload/2021/11/09/283837710/eaf9376a42d40973d43a90a113828e93_1442388115152832304.jpg",
                        "height": 4032,
                        "width": 2268,
                        "format": "jpg",
                        "size": "4346689",
                        "crop": null,
                        "is_user_set_cover": false,
                        "image_id": "30556208",
                        "entity_type": "IMG_ENTITY_POST",
                        "entity_id": "11794784"
                    }
                ],
                "is_official_master": false,
                "is_user_master": false,
                "hot_reply_exist": false,
                "vote_count": 0,
                "last_modify_time": 0,
                "recommend_type": "",
                "collection": null,
                "vod_list": [],
                "is_block_on": false,
                "forum_rank_info": null
            }
        ],
        "last_id": "2",
        "is_last": false,
        "is_origin": false
    }
}
```

# 完整代码
```python
from enum import Enum, unique
from typing import Dict, List
import httpx
from urllib import parse


class BasicSpider():

    def __init__(self) -> None:
        self.base_url = "https://bbs-api.mihoyo.com/post/wapi/"
        # api 地址
        self.api = None
        # 社区 id
        self.forum_id = None
        # 含义未知 似乎是game_id
        self.gids = None
        # 精品
        self.is_good = False
        # 热门
        self.is_hot = False
        # 游戏名
        self.game_name = None
        # 请求头
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
            "Referer": "https://bbs.mihoyo.com/",
            "Origin": "https://bbs.mihoyo.com/"
        }

    def get_params(self, page_size: int) -> Dict:
        '''
        获取请求参数
        '''
        return None

    def sync_get_urls(self, page_size: int = 20) -> List:
        '''
        以同步的方式获取图片地址 默认20张，就算不传page_size也是20
        '''
        return []

    def sync_get(self, params: dict = None, is_good: bool = False) -> List:
        '''
        以同步的方式获取response
        params: 请求参数
        is_good: 是否为精华
        '''
        r = httpx.get(self.api, params=params, headers=self.headers)
        return self.handle_response(r, is_good=is_good)

    async def async_get_urls(self, page_size: int = 20) -> List:
        '''
        以异步的方式获取图片地址 默认20张，就算不传page_size也是20
        TODO 测试
        '''
        return []

    async def async_get(self, params: dict = None, is_good: bool = False) -> List:
        '''
        以异步的方式获取response
        params: 请求参数
        is_good: 是否为精华
        '''
        async with httpx.AsyncClient() as client:
            r = await client.get(self.api, params=params, headers=self.headers)

        return self.handle_response(r, is_good=is_good)

    def handle_response(self, response, is_good: bool = False) -> List:
        '''
        处理返回的请求
        '''
        urls = []
        if is_good:
            posts = response.json()["data"]["posts"]
        else:
            posts = response.json()["data"]["list"]
        for post in posts:
            images = post["post"]["images"]
            for image in images:
                urls.append(image)
        return urls

    def get_game_name(self) -> str:
        return self.game_name


@unique
class RankType(Enum):
    '''
    排行榜类型
    '''
    # 日榜
    Daily = 1
    # 周榜
    Weekly = 2
    # 月榜
    Monthly = 3


@unique
class LatestType(Enum):
    '''
    最新回复或者是最新发帖
    '''
    # 最新回复
    LatestComment = 1
    # 最新发帖
    LatestPost = 2


@unique
class GameType(Enum):
    '''
    游戏类型
    '''
    # 原神
    Genshin = 2
    # 崩3
    Honkai3rd = 1
    # 大别墅 话说大别墅为啥是DBY
    DBY = 5
    # 星穹铁道
    StarRail = 6
    # 崩2
    Honkai2 = 3
    # 未定 这名字真奇怪
    TearsOfThemis = 4


@unique
class ForumType(Enum):
    '''
    社区类型 要与游戏类型一致
    '''
    # 原神 cos
    GenshinCos = 49
    # 原神 同人图
    GenshinPic = 29
    # 崩3 同人图
    Honkai3rdPic = 4
    # 大别墅 COS
    DBYCOS = 47
    # 大别墅 同人图
    DBYPIC = 39
    # 星穹铁道 同人图
    StarRailPic = 56
    # 崩2 同人图
    Honkai2Pic = 40
    # 未定 同人图
    TearsOfThemisPic = 38


def get_gids(forum: str) -> GameType:
    forum2gid = {
        "GenshinCos": GameType.Genshin,
        "GenshinPic": GameType.Genshin,
        "Honkai3rdPic": GameType.Honkai3rd,
        "DBYCOS": GameType.DBY,
        "DBYPIC": GameType.DBY,
        "StarRailPic": GameType.StarRail,
        "Honkai2Pic": GameType.Honkai2,
        "TearsOfThemisPic": GameType.TearsOfThemis
    }
    return forum2gid[forum]


class Rank(BasicSpider):
    '''
    榜单
    url: https://bbs.mihoyo.com/ys/imgRanking/49
    '''

    def __init__(self, forum_id: ForumType, type: RankType) -> None:
        super().__init__()
        self.api = parse.urljoin(self.base_url, "getImagePostList")
        self.forum_id = forum_id.value
        gametype = get_gids(forum_id.name)
        self.gids = gametype.value
        # 日榜
        self.type = type.value
        self.game_name = gametype.name

    def get_params(self, page_size: int) -> Dict:
        params = {
            "forum_id": self.forum_id,
            "gids": self.gids,
            "page_size": page_size,
            "type": self.type
        }
        return params

    def sync_get_urls(self, page_size: int = 21) -> List:
        return self.sync_get(self.get_params(page_size))

    async def async_get_urls(self, page_size: int = 20) -> List:
        return await self.async_get(self.get_params(page_size))


class Hot(BasicSpider):
    '''
    热门
    url: https://bbs.mihoyo.com/ys/home/49?type=hot
    '''

    def __init__(self, forum_id: ForumType) -> None:
        super().__init__()
        self.api = parse.urljoin(self.base_url, "getForumPostList")
        self.forum_id = forum_id.value
        gametype = get_gids(forum_id.name)
        self.gids = gametype.value
        self.is_hot = True
        self.game_name = gametype.name

    def get_params(self, page_size: int) -> Dict:
        params = {
            "forum_id": self.forum_id,
            "gids": self.gids,
            "is_good": self.is_good,
            "is_hot": self.is_hot,
            "page_size": page_size
        }
        return params

    def sync_get_urls(self, page_size: int = 20) -> List:
        return self.sync_get(self.get_params(page_size))

    async def async_get_urls(self, page_size: int = 20) -> List:
        return await self.async_get(self.get_params(page_size))


class Good(BasicSpider):
    '''
    精华
    url: https://bbs.mihoyo.com/ys/home/49?type=good
    原神COS精华目录目前为空
    '''

    def __init__(self, forum_id: ForumType) -> None:
        super().__init__()
        self.api = parse.urljoin(self.base_url, "forumGoodPostFullList")
        self.forum_id = forum_id.value
        gametype = get_gids(forum_id.name)
        self.gids = gametype.value
        self.game_name = gametype.name

    def get_params(self, page_size: int) -> Dict:
        params = {
            "forum_id": self.forum_id,
            "gids": self.gids,
            "page_size": page_size
        }
        return params

    def sync_get_urls(self, page_size: int = 20) -> List:
        return self.sync_get(self.get_params(page_size), is_good=True)

    async def async_get_urls(self, page_size: int = 20) -> List:
        return await self.async_get(self.get_params(page_size), is_good=True)


class Latest(BasicSpider):
    '''
    最新回复和发帖
    url: https://bbs.mihoyo.com/ys/home/49?type=1
    '''

    def __init__(self, forum_id: ForumType, sort_type: LatestType) -> None:
        super().__init__()
        self.api = parse.urljoin(self.base_url, "getForumPostList")
        self.forum_id = forum_id.value
        gametype = get_gids(forum_id.name)
        self.gids = gametype.value
        # 排序类型
        self.sort_type = sort_type.value
        self.game_name = gametype.name

    def get_params(self, page_size: int) -> Dict:
        params = {
            "forum_id": self.forum_id,
            "gids": self.gids,
            "page_size": page_size,
            "is_good": self.is_good,
            "is_hot": self.is_hot,
            "sort_type": self.sort_type
        }
        return params

    def sync_get_urls(self, page_size: int = 20) -> List:
        return self.sync_get(self.get_params(page_size))

    async def async_get_urls(self, page_size: int = 20) -> List:
        return await self.async_get(self.get_params(page_size))


if __name__ == '__main__':
    gh = Good(ForumType.Honkai2Pic)
    urls = gh.sync_get_urls()
    print(urls)
```

# 后记
本次完成了带有简单cli的米游社爬虫，并实现了一套简单的同步和异步api。下一步计划进行定时启动任务。