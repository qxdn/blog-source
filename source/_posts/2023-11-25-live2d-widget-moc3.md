---
title: live2d-widget添加moc3模型支持
tags:
  - 前端
  - javascript
categories: javascript
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.1/cover.jpg
description: 因为之前一直想着加入moc3模型，这样就不用自己做直接用别人的了。最近开始慢慢空起来了可以开始做。
date: 2023-11-25 15:06:48
---

> 封面《FLIP * FLOP ~RAMBLING OVERRUN~》

# 前言
每次看到网站的live2d模型的时候都会想只有nep是喜欢的，想要添加模型发现这个库只支持moc2模型，不支持moc3模型，虽然可以加但是作者并没有加，只是给了一份pr，但是这个pr已经是两年前了，不如自己重新写一下。

# 做法
参考pr中的代码，其实很简单，就是采用了`pixi-live2d-display`这个库来加载模型，该库支持各个版本的live2d模型，因此只需要修改原来的加载模型代码`loadlive2`函数即可。

首先按照`pixi-live2d-display`这个库来安装，
```bash
npm install pixi-live2d-display
```
然后下载live2d-widget的源码，修改`src/model.js`文件，新增下面函数，将`loadlive2d`函数修改为该函数：
```js
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display";

// expose PIXI to window so that this plugin is able to
// reference window.PIXI.Ticker to automatically update Live2D models
window.PIXI = PIXI;

 async loadModelPixi(id, jsonpath) {
    const element = document.getElementById(id);
    const app = new PIXI.Application({
      view: element,
      transparent: true,
    });
    const model = await Live2DModel.from(jsonpath);

    app.stage.addChild(model);
    
    const parentWidth = element.width;
    const parentHeight = element.height;
    // Scale to fit the stage
    const ratio = Math.min(
      parentWidth / model.width,
      parentHeight / model.height
    );
    model.scale.set(ratio, ratio);
    // Align bottom and center horizontally
    
    model.x = (parentWidth - model.width) / 2;
    model.y =  parentHeight - model.height;
    
}
```

该函数显而易见，加载模型后设置缩放和位置，需要注意的是在代码里面我们可以看到` <canvas id="live2d" width="800" height="800"></canvas>`，而css里面可以看到
```css
#live2d {
	cursor: grab;
	height: 300px;
	position: relative;
	width: 300px;
}
```
这里其实是live2d先在800×800上面画，然后通过css缩放到300×300，这样子会看的高清一点，live2d看起来会很模糊

效果如下，其实比例上还是有点小问题需要调整一下
![result](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.1/result.png)

完整代码在[github](https://github.com/qxdn/live2d-widget)，也可以直接直接在网页中添加下面这行代码添加live2d到网站
```html
<script src="https://cdn.jsdelivr.net/gh/qxdn/live2d-widget@latest/autoload.js"></script>
``````

# 后记

该代码其实还是有点小缺陷，即模型对准buttom其实还是有点对不准，如果可以看到`loadlive2d`的实现可能效果会好一点。

# 参考文献

- [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)

- [pull request 82](https://github.com/stevenjoezhang/live2d-widget/pull/82)

- [guansss/pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)