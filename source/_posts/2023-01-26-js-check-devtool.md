---
title: js检测开发者工具是否打开
tags:
  - javascript
  - web
  - 爬虫
categories: javascript
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.2/cover.avif
description: 因为打开一些网页调试的时候总是会有各种阻挠，这里讲一些解决办法
date: 2023-01-26 20:16:07
---


> 封面 《Unless Terminalia》

# 前言
在使用浏览器对一些网站进行分析的时候经常会遇到打开开发者工具后跳出debugger或者说是跳转到了别的网页。下面我会讲一些网站是如何做到的和应对方法。


# debugger
一种常见的方法是使用`debugger`，比如米游社用的是这种，当打开开发者工具时会有debugger跳出效果如下，效果类似于程序中的断点，点继续调试的时候也是如此，让人忙于处理debugger
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.2/debugger.png)

实现起来为如下代码
```html
<!DOCTYPE html>
<body>
    <script>
        function check() {
            debugger;
            setTimeout(check, 1);
        }
        check();
    </script>
</body>
```
## 破解方法
对于这种方法，我们只需要禁用debugger就行，最简单的方法就是点击开发中工具中的deactivated breakpoints
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.2/debugger-hack.png)

# 禁用右键和F12
禁用F12和右键，使得无法打开开发者工具。这种方法有点掩耳盗铃
```html
<!DOCTYPE html>

<body>
    <script>
        // F12
        window.onkeydown = window.onkeyup = window.onkeypress = function (event) {
            // 判断是否按下F12，F12键码为123  
            if (event.keyCode = 123) {
                event.preventDefault(); // 阻止默认事件行为  
                window.event.returnValue = false;
            }
        }
        // 右键
        document.oncontextmenu = function () {
            event.returnValue = false;
        }
    </script>
</body>
```

## 破解方法
按下`ctrl+shift+I`或者点击chrome浏览器头像右侧的地方里面的`更多工具->开发者工具`

# 检测窗口大小变化
`window.outerHeight`和`window.outerWidth`返回整个浏览器窗口的高度，宽度，包括侧边栏（如果存在）。`window.innerHeight`和`window.innerWidth`返回浏览器视窗大小，如果有滚动条也包含滚动条。具体区分可见下图

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.2/height.png)

这里实现直接照搬别人的[github](https://github.com/sindresorhus/devtools-detect)，附带上该库的[例程](https://sindresorhus.com/devtools-detect/)
```html
<!DOCTYPE html>

<body>
    <script>
        const devtools = {
            isOpen: false,
            orientation: undefined,
        };
        
        // inner和outer之间大小的阈值
        const threshold = 170;
        // 定义监听开发者工具事件
        const emitEvent = (isOpen, orientation) => {
            globalThis.dispatchEvent(new globalThis.CustomEvent('devtoolschange', {
                detail: {
                    isOpen,
                    orientation,
                },
            }));
        };

        const main = ({ emitEvents = true } = {}) => {
            const widthThreshold = globalThis.outerWidth - globalThis.innerWidth > threshold;
            const heightThreshold = globalThis.outerHeight - globalThis.innerHeight > threshold;
            const orientation = widthThreshold ? 'vertical' : 'horizontal';

            if (
                !(heightThreshold && widthThreshold)
                && ((globalThis.Firebug && globalThis.Firebug.chrome && globalThis.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
            ) {
                // 有超过阈值 是打开的
                if ((!devtools.isOpen || devtools.orientation !== orientation) && emitEvents) {
                    emitEvent(true, orientation);
                }

                devtools.isOpen = true;
                devtools.orientation = orientation;
            } else {
                // 开发者工具未打开
                if (devtools.isOpen && emitEvents) {
                    emitEvent(false, undefined);
                }

                devtools.isOpen = false;
                devtools.orientation = undefined;
            }
        };

        main({ emitEvents: false });
        setInterval(main, 500);
        window.addEventListener('devtoolschange', event => {
            console.log(event.detail.isOpen)
        });
    </script>
</body>
```

## 破解方法
这种方法需要设置一个阈值，容易误触发。破解方法就是将开发者工具设置为独立窗口，这样就无法检测到窗口变化。
![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.2/resize-hack.png)


# 重写toString
{% note red 'fa-solid fa-triangle-exclamation' simple %}
在我的chrome 109.0.5414.119上没有复现成功
{% endnote %}
```javascript
//方法1
var x = document.createElement('div');
Object.defineProperty(x, 'id', {
    get:function(){
        // 开发者工具被打开
    }
});
console.log(x);
//方法2
var c = new RegExp("1");
c.toString = function(){
  // 开发者工具被打开
}
console.log(c);
```
## 破解方法
对于一些使用`console`判断的可以把`console`的输出失效。这里可以用[插件](https://github.com/546669204/fuck-debugger-extensions)完成

# 后记
以上就是一些常见的检测方法了，还有一些可能没有说到，可以看一看[devtools-detector](https://github.com/AEPKILL/devtools-detector)里面的实现。

因为前端是源码给到浏览器用户的，其实想要避免被扒还是有点困难，一些组织办法只是增加扒代码一方的麻烦，或者过滤掉一部分人。

# 参考文献
[前端 JS 攻防对抗](https://paper.seebug.org/1900/#_24)

[如何解决反调试困扰-chrome extension](https://segmentfault.com/a/1190000021510230)

[Window.outerHeight](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/outerHeight)

[devtools-detect](https://github.com/sindresorhus/devtools-detect)

[fuck-debugger-extensions](https://github.com/546669204/fuck-debugger-extensions)

[Find out whether Chrome console is open](https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open)

[devtools-detector](https://github.com/AEPKILL/devtools-detector)