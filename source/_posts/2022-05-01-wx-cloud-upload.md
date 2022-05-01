---
title: 用python上传文件到微信小程序云存储
tags:
  - python
  - 微信小程序
description: 因为没有时间开发后台管理程序，因此临时写了一个python脚本上传图片
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.1/banner.png'
categories: python
date: 2022-05-01 16:13:46
---


> 封面 《時計仕掛けのレイライン -朝霧に散る花-》

# 前言
小程序上了云托管后不打算继续使用其他图床，而是使用云托管自带的图床。而由于时间紧迫只能在本地使用云托管提供的服务器调用对象存储api

云托管上传文件的文档在这里

[上传文件文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/upload.html)


{% note info simple %}
如果你上传带有中文名的文件，或者上传的路径有中文名时，需要修改一下requests库的源码，否则文件上传成功后无法活动下载链接
修改`requests/models.py`的`prepare_body`里的`complexjson.dumps`参数，加一个`ensure_ascii=False`
![修改内容](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.0.1/info.png)
{% endnote %}


# 流程
获取小程序总体流程可以简单分为下面几步
- 1、获取调用凭证access_token
- 2、获取文件上传消息
- 3、上传文件
- 4、获取下载文件的链接


# 准备config文件
因为access_token每天都有调用上限，且有2小时时限，最好是将access_token缓存下来，因此这里使用简单的json文件来存
```json
{
    "appid": null, // 小程序appid 必填
    "secret": null, // app secret 必填
    "env": null, // 云托管环境 env
    "create_time": null, // token创建时间 自动生成
    "expires_in": null, // token过期时间 自动生成
    "access_token": null // token 自动生成
}
```

然后是config的读取和保存

```python
def load_config(path="./config.json"):
    """
    获取配置，主要是读取缓存的access_token
    args: 读取路径
    return: config
    """
    with open(path, "r") as f:
        config = json.load(f)
    return config


def save_config(config, path="./config.json"):
    """
    保持配置
    args: 读取路径
    """
    with open(path, "w") as f:
        json.dump(config, f, indent=4)

```
# 获取接口调用凭证
接下来根据我们读取的config来获取access_token
```python
def get_access_token(appid: str, secret: str, config) -> str:
    """
    获取调用凭证
    https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/access-token/auth.getAccessToken.html
    args:
        apppid: 小程序appid
        secret: 小程序appSecret

    return: access_token
    """
    # 检查本地token
    token = config["access_token"]
    try:
        now = int(time.time())
        if None == token or (now - config["create_time"]) > config["expires_in"]:
            resp = requests.get(
                "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}".format(
                    appid, secret
                )
            )
            resp = resp.json()

            if None == resp["access_token"]:
                raise Exception(resp["errmsg"])
            # 缓存处理
            config["access_token"] = resp["access_token"]
            config["create_time"] = int(time.time())
            config["expires_in"] = resp["expires_in"]

        return config["access_token"]
    except Exception as e:
        print("获取access token失败")
        raise e
```

# 获取云存储上传文件消息
在正式上传前需要获取上传文件的信息，比如上传路径，签名等
```python
def get_upload_file_info(access_token: str, env: str, path: str):
    """
    上传文件信息
    https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/upload.html
    args:
        access_token: 
        env: 云托管的路径
        path: 存放位置
    return:
        json: {
            errcode,
            errmsg,
            url,
            token,
            authorization,
            file_id,
            cos_file_id
        }
    """
    try:
        url = "https://api.weixin.qq.com/tcb/uploadfile?access_token={0}".format(
            access_token
        )
        headers = {"Content-Type": "application/json;charset=UTF-8"}
        data = {"env": env, "path": path}
        resp = requests.post(url, json=data, headers=headers)
        # 转json
        resp = resp.json()
        if 0 != resp["errcode"]:
            print(resp["errmsg"])
            print(resp)
            raise Exception(resp["errmsg"])
        # 返回上传文件信息
        return resp
    except Exception as e:
        print("获取文件上传链接失败")
        raise e
```

# 上传文件
获取文件上传信息后，需要根据改信息上传文件
```python
def upload_file(url, request_path, authorization, token, file_id, file):
    """
    上传文件
    https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/upload.html
    args:
        url: 上传图片路径 由get_upload获得的url
        request_path: 上传路径，和get_upload_file_info内部的一致
        authorization: info返回的token
        file_id: cos_file_id
        file: 文件的二进制数据
    return: None
    """
    try:
        form = {
            "key": request_path,
            "Signature": authorization,
            "x-cos-security-token": token,
            "x-cos-meta-fileid": file_id,
            "file": file,
        }
        resp = requests.post(url=url, files=form)
        return resp
    except Exception as e:
        print("上传文件失败")
        raise e
```

# 获取文件下载链接
上传文件后是没有返回信息的，需要我们根据文件上信息的file_id获取
```python
def get_download_link(access_token, env, file_id):
    """
    获取文件下载链接
    https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/download.html
    args:
        access_token: 调用token
        env: 云环境env
        file_id: file_id
    return: 文件下载链接
    """
    try:
        url = "https://api.weixin.qq.com/tcb/batchdownloadfile?access_token={0}".format(
            access_token
        )
        #headers = {"Content-Type": "application/json"}
        data = {
            "env": env,
            "file_list": [
                {
                    "fileid": file_id
                    # max_age
                }
            ],
        }
        resp = requests.post(url, json=data)
        resp = resp.json()
        if 0 != resp["errcode"]:
            print(resp["errmsg"])
            raise Exception(resp["errmsg"])
        return resp["file_list"][0]["download_url"]
    except Exception as e:
        print("获取下载链接失败")
        raise e
```

# 汇总
各个流程编写完成后简单汇总一下
```python
def wx_upload_file(config, filepath, uploadpath):
    """
    上传文件
    args:
        config: 配置
        filepath: 文件的路径
        uploadpath: 上传的路径，不能以/开头，以/结尾
    return: url
    """
    realpath = os.path.realpath(filepath)
    filename = os.path.basename(realpath)
    with open(realpath, "rb") as f:
        data = f.read()
    # 获取access_token
    token = get_access_token(config["appid"], config["secret"], config)
    # 获取上传文件链接
    info = get_upload_file_info(token, config["env"], uploadpath + filename)
    upload_file(
        info["url"],
        uploadpath + filename,
        info["authorization"],
        info["token"],
        info["cos_file_id"],
        data,
    )
    download_url = get_download_link(token, config["env"], info['file_id'])
    return (download_url, info['file_id'])
```

# 完整代码
```python
import requests
import json
import time
import os


def get_access_token(appid: str, secret: str, config) -> str:
    """
    获取调用凭证
    https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/access-token/auth.getAccessToken.html
    args:
        apppid: 小程序appid
        secret: 小程序appSecret

    return: access_token
    """
    # 检查本地token
    token = config["access_token"]
    try:
        now = int(time.time())
        if None == token or (now - config["create_time"]) > config["expires_in"]:
            resp = requests.get(
                "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}".format(
                    appid, secret
                )
            )
            resp = resp.json()

            if None == resp["access_token"]:
                raise Exception(resp["errmsg"])
            # 缓存处理
            config["access_token"] = resp["access_token"]
            config["create_time"] = int(time.time())
            config["expires_in"] = resp["expires_in"]

        return config["access_token"]
    except Exception as e:
        print("获取access token失败")
        raise e


def get_upload_file_info(access_token: str, env: str, path: str):
    """
    上传文件信息
    https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/upload.html
    args:
        access_token: 
        env: 云托管的路径
        path: 存放位置
    return:
        json: {
            errcode,
            errmsg,
            url,
            token,
            authorization,
            file_id,
            cos_file_id
        }
    """
    try:
        url = "https://api.weixin.qq.com/tcb/uploadfile?access_token={0}".format(
            access_token
        )
        headers = {"Content-Type": "application/json;charset=UTF-8"}
        data = {"env": env, "path": path}
        resp = requests.post(url, json=data, headers=headers)
        # 转json
        resp = resp.json()
        if 0 != resp["errcode"]:
            print(resp["errmsg"])
            print(resp)
            raise Exception(resp["errmsg"])
        # 返回上传文件信息
        return resp
    except Exception as e:
        print("获取文件上传链接失败")
        raise e


def upload_file(url, request_path, authorization, token, file_id, file):
    """
    上传文件
    https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/upload.html
    args:
        url: 上传图片路径 由get_upload获得的url
        request_path: 上传路径，和get_upload_file_info内部的一致
        authorization: info返回的token
        file_id: cos_file_id
        file: 文件的二进制数据
    return: None
    """
    try:
        form = {
            "key": request_path,
            "Signature": authorization,
            "x-cos-security-token": token,
            "x-cos-meta-fileid": file_id,
            "file": file,
        }
        resp = requests.post(url=url, files=form)
        return resp
    except Exception as e:
        print("上传文件失败")
        raise e


def get_download_link(access_token, env, file_id):
    """
    获取文件下载链接
    https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/service/download.html
    args:
        access_token: 调用token
        env: 云环境env
        file_id: file_id
    return: 文件下载链接
    """
    try:
        url = "https://api.weixin.qq.com/tcb/batchdownloadfile?access_token={0}".format(
            access_token
        )
        #headers = {"Content-Type": "application/json"}
        data = {
            "env": env,
            "file_list": [
                {
                    "fileid": file_id
                    # max_age
                }
            ],
        }
        resp = requests.post(url, json=data)
        resp = resp.json()
        if 0 != resp["errcode"]:
            print(resp["errmsg"])
            raise Exception(resp["errmsg"])
        return resp["file_list"][0]["download_url"]
    except Exception as e:
        print("获取下载链接失败")
        raise e


def load_config(path="./config.json"):
    """
    获取配置，主要是读取缓存的access_token
    args: 读取路径
    return: config
    """
    with open(path, "r") as f:
        config = json.load(f)
    return config


def save_config(config, path="./config.json"):
    """
    保持配置
    args: 读取路径
    """
    with open(path, "w") as f:
        json.dump(config, f, indent=4)


def wx_upload_file(config, filepath, uploadpath):
    """
    上传文件
    args:
        config: 配置
        filepath: 文件的路径
        uploadpath: 上传的路径，不能以/开头，以/结尾
    return: url
    """
    realpath = os.path.realpath(filepath)
    filename = os.path.basename(realpath)
    with open(realpath, "rb") as f:
        data = f.read()
    # 获取access_token
    token = get_access_token(config["appid"], config["secret"], config)
    # 获取上传文件链接
    info = get_upload_file_info(token, config["env"], uploadpath + filename)
    upload_file(
        info["url"],
        uploadpath + filename,
        info["authorization"],
        info["token"],
        info["cos_file_id"],
        data,
    )
    download_url = get_download_link(token, config["env"], info['file_id'])
    return (download_url, info['file_id'])


if __name__ == "__main__":
    config = load_config("./config.json")
    #print(wx_upload_file(config, "121.jpg", "temp3/"))

    # 有url
    # print(wx_upload_file(config,'./temp.jpg','temp3/'))
    #
    # # 无url
    path = "./154190339_附件/"
    filenames = os.listdir(path)
    for filename in filenames:
        print(filename)
        image = os.path.join(path, filename)
        url = wx_upload_file(config, image, "temp3/")
        print(url)

    save_config(config, "./config.json")

```


# 后记
有一说一，腾讯提供的cdn还是比之前自己搭建的要快很多，很舒服，就是花钱很难受。