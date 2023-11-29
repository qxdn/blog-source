---
title: 用TTS模型做春风学姐的语音合成
tags:
  - 机器学习
categories:
  - 机器学习
description: 快到生日了，不如让喜欢的角色对自己说生日快乐，直接来一个9nine的春春春的语音合成吧
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/cover.png
date: 2023-11-29 10:23:27
---


> 封面 《9-nine-春色春恋春熙风》

> 省流版本
> **感觉 hugging face 的 cpu 跑的效果和我本地跑的效果完全不一样**
> demo: [demo](https://huggingface.co/spaces/qxdn/tts-9nine)
> 测试文本： 誕生日おめでとうございます
> 效果语音： <audio id="audio" controls src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/haruka_birthday.wav">
<source  src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/haruka_birthday.wav">
</audio>

> 测试视频： <iframe src="//player.bilibili.com/player.html?aid=964019251&bvid=BV1MH4y117Dh&cid=1347616172&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>


# 前言

临近生日想整个活，就做一个喜欢角色的TTS模型吧

# 调研

上次搞 TTS 还是去年（2022）的时候想用 vits 来做一个爱莉希雅的 TTS 模型，根据网上的拆包工具拆出来崩坏 3 的语音包，但是没找出文本，不想自己标注和用语音识别标注就搁置了，如今过了一年多技术上应该有进步所以来看看新的方法，而且相对于崩坏 3，galgame 更加好拆且相当于一个自带标注的数据集，用来训练再合适不过了。

最简单的是去看 tts 的[综述](https://arxiv.org/abs/2106.15561)，但是这篇是 21 年的，不含这几年的进展，后面在知乎上找到一个实时更新[文章](https://zhuanlan.zhihu.com/p/474601997)。

所以先试试 HierSpeech++，首先是最新，其次是 zero-shot 模型，这样的话就不需要怎么训练微调。其项目和演示如下地址

[demo](https://huggingface.co/spaces/LeeSangHoon/HierSpeech_TTS)
尝试输入音频作为 prompt,文本 prompt 用“失敗した”

> 输入音频 prompt
> <audio id="audio" controls src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/haruka1391.ogg">

<source  src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/haruka1391.ogg">
</audio>

调了调输出音频结果如下，效果有点难崩，可见在分词和预测时长上还是有点问题需要微调，不如换个方法。

> 输出结果
> <audio id="audio" controls src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/zo_output.wav">

<source  src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/zo_output.wav">
</audio>

> 推特吐槽了一下，被一作找上门了，原因是没有日语训练，底下用 phoneme 库转音标所以可以发送。和作者说了一下发了份[MoeGoe](https://github.com/CjangCjengh/MoeGoe)的cleaners代码
> 相关链接 [推特](https://twitter.com/Al_Fe2O3/status/1727633489061949897)

# 拆包

9nine 的拆包可以直接用现成的 GARbro 进行拆包，我觉得比 escu:de 那些好拆多了，那种拆包封包找不到啥现成程序，还得自己写，有空的话可以写一下怎么拆 escu:de 的游戏。春春春拆包如下，`voice.xp3`里面是语音包，`data.xp3`里面包含了文本包，在`scn`里面。

![garbro预览](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/garbro1.png)

![voice.xp3](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/voice_xp3.png)

![scn](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/scn.png)

关于 scn 我搜怎么解包的时候刚好看到有人也拆包春春春做 tts，那么直接参考他的方案用[freemote](https://github.com/UlyssesWu/FreeMote)

观察`freemote`解码出来的信息，可以看到里面有主要有两类 json，我们要的主要在`.json`里面，经过观察文本和对音的语音文件主要在`texts`和`voices`里面

![.text.json](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/text_json.png)
![.resx.json](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/resx_json.png)

# 提取

我只想要四位女主~~其他人是什么~~的声音文件，因此直接在别人的提取脚本上小改一下，代码如下

```python
from tqdm import tqdm
import os
import json

character = ["都", "天", "春風", "希亜"]


def load_json_files(base_path):
    file_lists = []
    files = os.listdir(base_path)
    for file in tqdm(files):
        if file.endswith(".txt.json"):
            file_lists.append(file)
    return file_lists


def load_voice_and_text_from_json(json_file: str, collapse_LF: bool = True):
    train_list = []

    with open(json_file, encoding="utf-8") as f:
        json_text = json.load(f)
        scenes = json_text["scenes"]
        for scene in scenes:
            if "texts" in scene.keys():
                texts = scene["texts"]
                for text_list in texts:
                    # 先确保是list
                    if isinstance(text_list, list):
                        if text_list[0] in character:
                            if text_list[3] is not None:
                                txt = text_list[2][1:-1]
                                voice = text_list[3][0]["voice"]

                                if collapse_LF:
                                    txt = txt.replace("\\n", "")

                                train_list.append(f"{text_list[0]  }|{txt}|{voice}.ogg\n")

    return train_list


if __name__ == "__main__":
    base_path = "./data/scn"
    file_lists = load_json_files(base_path)
    # print(file_lists)
    voices = []
    for file in tqdm(file_lists):
        voice = load_voice_and_text_from_json(os.path.join(base_path, file))

        voices.extend(voice)

    with open("./train.txt", "w", encoding="utf-8") as f:
        f.writelines(voices)

```

其实这样提取还是有一点点小问题，比如语音文本有一下一些问题，比如单纯的?，还有一些特殊符号，这些主要是游戏中一些特殊文本显示。对于前者采用[tacotron2-japanese](https://github.com/CjangCjengh/tacotron2-japanese)进行清理，不用 bert-vits2 的 cleaner 是因为有插入停止词不好处理，后者直接训练集里面去掉

```text
春風|？|hk0154.ogg
天|あぁ……うん、っぽい、けど、%D$vl1;え？　ラブレター？|sr0679_ep2.ogg
```

```diff
+ import torch
+ from text import text_to_sequence
-

def load_voice_and_text_from_json(json_file: str, collapse_LF: bool = True):
    train_list = []

    with open(json_file, encoding="utf-8") as f:
        json_text = json.load(f)
        scenes = json_text["scenes"]
        for scene in scenes:
            if "texts" in scene.keys():
                texts = scene["texts"]
                for text_list in texts:
                    # 先确保是list
                    if isinstance(text_list, list):
                        if text_list[0] in character:
-                            if text_list[3] is not None:
-                                txt = text_list[2][1:-1]
-                                voice = text_list[3][0]["voice"]
+                            txt:str = text_list[2][1:-1]
+                            if txt.find('%') != -1:
+                                continue
+                            if (
+                                len(
+                                    torch.IntTensor(
+                                        text_to_sequence(txt, ["japanese_cleaners"])
+                                    )
+                                )
+                                > 1
+                            ):
+                                if text_list[3] is not None:
+                                    voice = text_list[3][0]["voice"]

                                    if collapse_LF:
                                        txt = txt.replace("\\n", "")

                                    train_list.append(
                                        f"{text_list[0]  }|{txt}|{voice}.ogg\n"
                                    )

    return train_list
```

> **二次清理数据**
> 训练过程中发现存在一些单纯的`…`还有~~hs 时候的呻吟~~，这些对训练结果影响较大，因此需要去除一下

## 简单 eda

首先看一下数据分布

![语音数量](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/voice_count.png)

- 希亜: 370 条
- 天: 576 条
- 春風: 2031 条（不愧是学姐主场）
- 都: 190 条（不愧是女路人）

语音总时长： 3.92h

# 训练

我这里采用的是`Bert-Vits2`模型，这个项目将 bert 和 vits 结合起来，主题来说就是使用 Bert 预先对文本进行处理，后面再送入，此外他们还加了个 emotion 情绪编码器，可以使得语音带上情绪。`Bert-VITS2`项目的文档较少，主要都需要自己来读代码进行理解。另外该项目使用`.wav`文件作为输入，所以我们得事先转换一下

```python
def ogg2wav(ogg,out_base):
    filename,ext = os.path.splitext(ogg)
    filename = os.path.basename(filename)
    y,sr = librosa.load(ogg)
    sf.write(os.path.join(out_base,filename+".wav"),y,sr)
```

另外我们需要准备一份`file.list`文件，这个文件是用来指定训练集和验证集的，格式如下

```text
# wave_path 要是绝对路径
{wav_path}|{speaker_name}|{language}|{text}
例如
hk1447.wav|春風|JP|その……く、九條さんが、作ったことあるって、　聞いて……
```

修改`config.yml`，默认读取 config.yml，所以不用改代码，所以我们得做一下简单修改

```yml
# 全局配置
# 对于希望在同一时间使用多个配置文件的情况，例如两个GPU同时跑两个训练集：通过环境变量指定配置文件，不指定则默认为./config.yml

# 拟提供通用路径配置，统一存放数据，避免数据放得很乱
# 每个数据集与其对应的模型存放至统一路径下，后续所有的路径配置均为相对于datasetPath的路径
# 不填或者填空则路径为相对于项目根目录的路径
dataset_path: "Data/"

# 模型镜像源，默认huggingface，使用openi镜像源需指定openi_token
mirror: ""
openi_token: "" # openi token

# resample 音频重采样配置
# 注意， “:” 后需要加空格
resample:
  # 目标重采样率
  sampling_rate: 44100
  # 音频文件输入路径，重采样会将该路径下所有.wav音频文件重采样
  # 请填入相对于datasetPath的相对路径
  in_dir: "audios/raw" # 相对于根目录的路径为 /datasetPath/in_dir
  # 音频文件重采样后输出路径
  out_dir: "audios/wavs"

# preprocess_text 数据集预处理相关配置
# 注意， “:” 后需要加空格
preprocess_text:
  # 原始文本文件路径，文本格式应为{wav_path}|{speaker_name}|{language}|{text}。
  transcription_path: "filelists/haruka.list"
  # 数据清洗后文本路径，可以不填。不填则将在原始文本目录生成
  cleaned_path: ""
  # 训练集路径
  train_path: "filelists/train.list"
  # 验证集路径
  val_path: "filelists/val.list"
  # 配置文件路径
  config_path: "haruka.json"
  # 每个speaker的验证集条数
  val_per_spk: 40
  # 验证集最大条数，多于的会被截断并放到训练集中
  max_val_total: 200
  # 是否进行数据清洗
  clean: true

# bert_gen 相关配置
# 注意， “:” 后需要加空格
bert_gen:
  # 训练数据集配置文件路径
  config_path: "haruka.json"
  # 并行数
  num_processes: 2
  # 使用设备：可选项 "cuda" 显卡推理，"cpu" cpu推理
  # 该选项同时决定了get_bert_feature的默认设备
  device: "cuda"
  # 使用多卡推理
  use_multi_device: false

# emo_gen 相关配置
# 注意， “:” 后需要加空格
emo_gen:
  # 训练数据集配置文件路径
  config_path: "haruka.json"
  # 并行数
  num_processes: 2
  # 使用设备：可选项 "cuda" 显卡推理，"cpu" cpu推理
  device: "cuda"

# train 训练配置
# 注意， “:” 后需要加空格
train_ms:
  env:
    MASTER_ADDR: "localhost"
    MASTER_PORT: 10086
    WORLD_SIZE: 1
    LOCAL_RANK: 0
    RANK: 0
    # 可以填写任意名的环境变量
    # THE_ENV_VAR_YOU_NEED_TO_USE: "1234567"
  # 底模设置
  base:
    use_base_model: false
    repo_id: "Stardust_minus/Bert-VITS2"
    model_image: "Bert-VITS2_2.1-Emo底模" # openi网页的模型名
  # 训练模型存储目录：与旧版本的区别，原先数据集是存放在logs/model_name下的，现在改为统一存放在Data/你的数据集/models下
  model: "models"
  # 配置文件路径
  config_path: "haruka.json"
  # 训练使用的worker，不建议超过CPU核心数
  num_workers: 16
  # 关闭此项可以节约接近50%的磁盘空间，但是可能导致实际训练速度变慢和更高的CPU使用率。
  spec_cache: True
  # 保存的检查点数量，多于此数目的权重会被删除来节省空间。
  keep_ckpts: 8

# webui webui配置
# 注意， “:” 后需要加空格
webui:
  # 推理设备
  device: "cuda"
  # 模型路径
  model: "models/G_18000.pth"
  # 配置文件路径
  config_path: "configs/haruka.json"
  # 端口号
  port: 7860
  # 是否公开部署，对外网开放
  share: false
  # 是否开启debug模式
  debug: false
  # 语种识别库，可选langid, fastlid
  language_identification_library: "langid"

# server api配置
# 注意， “:” 后需要加空格
# 注意，本配置下的所有配置均为相对于根目录的路径
server:
  # 端口号
  port: 5000
  # 模型默认使用设备：但是当前并没有实现这个配置。
  device: "cuda"
  # 需要加载的所有模型的配置
  # 注意，所有模型都必须正确配置model与config的路径，空路径会导致加载错误。
  models:
    - # 模型的路径
      model: ""
      # 模型config.json的路径
      config: ""
      # 模型使用设备，若填写则会覆盖默认配置
      device: "cuda"
      # 模型默认使用的语言
      language: "ZH"
      # 模型人物默认参数
      # 不必填写所有人物，不填的使用默认值
      # 暂时不用填写，当前尚未实现按人区分配置
      speakers:
        - speaker: "科比"
          sdp_ratio: 0.2
          noise_scale: 0.6
          noise_scale_w: 0.8
          length_scale: 1
        - speaker: "五条悟"
          sdp_ratio: 0.3
          noise_scale: 0.7
          noise_scale_w: 0.8
          length_scale: 0.5
        - speaker: "安倍晋三"
          sdp_ratio: 0.2
          noise_scale: 0.6
          noise_scale_w: 0.8
          length_scale: 1.2
    - # 模型的路径
      model: ""
      # 模型config.json的路径
      config: ""
      # 模型使用设备，若填写则会覆盖默认配置
      device: "cpu"
      # 模型默认使用的语言
      language: "JP"
      # 模型人物默认参数
      # 不必填写所有人物，不填的使用默认值
      speakers: [] # 也可以不填

# 百度翻译开放平台 api配置
# api接入文档 https://api.fanyi.baidu.com/doc/21
# 请不要在github等网站公开分享你的app id 与 key
translate:
  # 你的APPID
  "app_key": ""
  # 你的密钥
  "secret_key": ""
```

## 文本预处理

需要注意一下我们要先去 hugging face 上把缺少的权重先下载下来

```bash
python preprocess_text.py
```

这里主要执行 text2sequence，且检查能否找到音频和是否有重复音频

## 重采样

```bash
python resample.py
```

## Bert 预处理

```bash
python bert_gen.py
```

## Emo 预处理

这里主要获取情感信息

```bash
python emo_gen.py
```

## 训练

需要注意我们修改一下`config.json`里面的内容

```bash
python train_ms.py
```

# 效果

下面为第 23000iter 的效果，天的声音依然有一些电音

<iframe src="//player.bilibili.com/player.html?aid=918952876&bvid=BV19u4y157p3&cid=1346290722&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

后续继续训练一下
输入文本 “誕生日おめでとうございます”，输出
<audio id="audio" controls src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/haruka_birthday.wav">

<source  src="https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.2/haruka_birthday.wav">
</audio>

放一个 hugging face 的 demo 链接，可以去体验一下
[demo](https://huggingface.co/spaces/qxdn/tts-9nine)
最终效果
<iframe src="//player.bilibili.com/player.html?aid=964019251&bvid=BV1MH4y117Dh&cid=1347616172&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>


# 后记
vits系列模型都需要大规模数据，虽然我已经加入了经过原神训练的预训练模型，但是还是可以看到天和喵都的数据量不太多容易电音，春风学姐的就好一点

~~虽然我喜欢春风学姐，但我其实是喵都厨~~

# 参考文献

[A Survey on Neural Speech Synthesis](https://arxiv.org/abs/2106.15561)

[举世无双语音合成系统 VITS 发展历程（2023.11.22 HierSpeech++）](https://zhuanlan.zhihu.com/p/474601997)

[HierSpeech++](https://github.com/sh-lee-prml/HierSpeechpp)

[HierSpeech++ demo](https://huggingface.co/spaces/LeeSangHoon/HierSpeech_TTS)

[基于 tacotron2 的 galgame 角色语音合成+galgame 解包 保姆级教程（千恋万花版）](https://www.bilibili.com/read/cv21397170/)

[freemote](https://github.com/UlyssesWu/FreeMote)

[tacotron2-japanese](https://github.com/CjangCjengh/tacotron2-japanese)

[Bert-VITS2](https://github.com/fishaudio/Bert-VITS2)
