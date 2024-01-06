---
title: 来做个ciallo吧
tags:
  - js
  - react
  - 前端
  - gal
categories:
  - 前端
description: >-
  因为看到了ciallo.cc的网站，看了眼源码比较简单，但是因为里面有几个deprecated的html标签，而且只有美咕噜的语音，所以我就自己写了一个，这里记录一下。
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.6.5/cover.jpg
date: 2024-01-06 15:03:53
---


> 封面《サノバウィッチ》

# 前言
因为看到了[ciallo.cc](https://ciallo.cc)的网站，看了眼源码比较简单，但是因为里面有几个deprecated的html标签，而且只有美咕噜的语音，所以我就自己写了一个，这里记录一下。

# 分析
简单来说ciallo.cc的网站实现就是简单的采用`marquee`标签来做一个滚动效果，采用`font`标签来做滚动内容。但是这两个标签在mdn上都是标记为deprecated的，虽然现在看所有浏览器都是支持，但是保不准哪天就哪个浏览器不支持了。所以采用css来重新实现一遍。

# 实现
## ciallo滚动弹幕
采用css实现一个，主要为做一个简单的滚动动画，设置为无限期运行
```css
.ciallo {
  margin: 0%;
  padding-left: 100%;
  white-space: nowrap;
  animation: ciallo-animate 15s linear infinite;
}
@keyframes ciallo-animate {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }
}

```

<iframe src="https://codesandbox.io/p/devbox/marquee-8tdg2w?embed=1&file=%2Findex.html"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="marquee"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## 字体跳跃动画
一个字体跳跃，参考stackoverflow的实现，不过那个一个个写nth-child，我这还是用react来做一个任意长度的。
```jsx
import React from 'react';
import './index.css';

const Jumper = ({ text = "Ciallo～(∠・ω< )⌒★", dur = 1.0 }) => {
    const n = text.length;

    return (
        <div className='box'>
            {[...text].map((item, index) => <span key={index} style={{ animationDelay: `${dur * index / n}s` }}>{item}</span>)}
        </div>
    )
}

export default Jumper;
```

```css
.box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.box span {
  z-index: 1;
  position: relative;
  top: 20px;
  font-size: 5rem;
  display: inline-block;
  animation: bounce 0.3s ease infinite alternate;
}

@keyframes bounce {
  0% {
    transform: translate3d(0, 0, 0);
    text-shadow: rgba(255, 255, 255, 0.4) 0 0 0.05em;
  }
  100% {
    transform: translate3d(0, -0.5em, 0);
    text-shadow: rgba(255, 255, 255, 0.4) 0 1em 0.35em;
  }
}
```

<iframe src="https://codesandbox.io/p/devbox/jumper-n6s744?embed=1&file=%2Fsrc%2Findex.js"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="jumper"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## 点击浮动弹幕
```jsx
const audioList = [meguru]
let audioIndex = 0;

const randomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return `rgb(${r},${g},${b})`
}

const cialloAppend = (event) => {
    const x = event.pageX;
    const y = event.pageY;
    const span = document.createElement('span')
    span.innerHTML = 'Ciallo～(∠・ω< )⌒★';
    span.style.cssText = `position: absolute; left: ${x}px; top: ${y - 20}px; color: ${randomColor()}; bold;`;
    document.body.appendChild(span);
    const animation = span.animate({
        "top": `${y - 180}px`,
        "opacity": 0
    }, {
        duration: 1500,
    });
    new Audio(audioList[audioIndex]).play();
    audioIndex = (audioIndex + 1) % audioList.length;
    animation.onfinish = () => {
        span.remove();
    }
}

useEffect(() => {
    document.body.addEventListener('click', cialloAppend)

    return () => {
        document.body.removeEventListener('click', cialloAppend)
    }
})
```

# 完整效果
网址在[https://ciallo.qianxu.run](https://ciallo.qianxu.run)

codesandbox如下
<iframe src="https://codesandbox.io/p/github/qxdn/ciallo/master?embed=1&file=%2Fpackage.json"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="qxdn/ciallo/master"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

完整代码见[https://github.com/qxdn/ciallo](https://github.com/qxdn/ciallo)

# 后记
整体来说实现很简单，花费不到半天时间。另外后续需要拆包找到更多ciallo语音集合。

# 参考文献
[marquee](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee)

[font](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/font)