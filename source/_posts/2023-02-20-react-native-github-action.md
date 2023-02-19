---
title: react native使用github action自动集成android
tags:
  - react
  - react native
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.4/cover.jpg
categories: 前端
description: 因为这段时间写了一个react-native的app，所以写一个github action来自动集成
date: 2023-02-20 00:43:07
---


> 封面 《さくらの雲＊スカアレットの恋》

# 前言

因为写了一个基于 react native 的 app，想要使用 github action 来进行自动继承和自动部署。因为我这里没有 ios 开发环境，因此就只写 android 方面的自动部署

# 准备

在进行脚本部署之前先看一下 react native 给的文档，我们需要对 android 生成的 apk 进行签名，在 windows 上执行以下脚本

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

把`my-upload-key.keystore`和`my-key-alias`换成你自己需要的名字。记住自己的alias和密码，并且保存好keystore文件，不要上传到版本库或泄露了。

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.4/generate-key.png)

# 整体流程
我们的action总体流程如下

```
拉取代码 -> 加载yarn和gradle缓存 -> 安装依赖 -> 编译代码 -> 对包进行签名 -> 发布到release
```

## 拉取代码
这里直接使用[action/checkout](https://github.com/actions/checkout)

## 加载缓存
这里使用[action/cache](https://github.com/actions/cache)，使用cache存yarn和gradle的缓存

这里不存`node_modules`是由于不同node版本可能不一样，同时对`npm ci`不起作用

gradle的缓存时要注意关闭gradle的守护进程，因为gradle有锁，可能导致缓存创建失败，用`gradle <task> --no-daemon`进行关闭

![cache](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.4/cache.png)
可以看到使用了缓存后总体速度快了很多，
### 缓存限制
一个仓库最多10G缓存，超过上限会将最早的缓存去除，另外上周的缓存也会去除。

## 安装依赖
这里直接`yarn`就行

## 编译代码
按照react native官方给的教程，记得加上`--no-daemon`。可以生成`aab`格式或者`apk`格式，`aab`格式无法直接安装，需要谷歌商店，所以我们生成`apk`格式。两者区别可以看[这](https://stackoverflow.com/questions/52059339/difference-between-apk-apk-and-app-bundle-aab)
```bash
cd android && ./gradlew assembleRelease --no-daemon
```
对于编译debug代码
```bash
gradlew assembleDebug
```
如果要生成`aab`格式
```
gradlew bundleRelease
```

## 签名
在react-native给出的例子里，我们需要修改`build.gradle`文件填写我们前面生成的keystore等信息，不过在GitHub Action里面我们可以以字符串的形式来存放需要保密的信息，而文件形式比较麻烦。

其中一种方法是加密成字符串后然后在github action里面解密
```bash
# 加密
gpg -c --armor release.keystore
```
```yaml
# 前后省略 解密
- name: checkout
    uses: actions/checkout@v3
    run: |
        echo "${{secrets.RELEASE_KEYSTORE}}" > release.keystore.asc
        gpg -d --passphrase "${{secrets.RELEASE_KEYSTORE_PASSWORD}}" --batch release.keystore.asc > andorid/app/release.keystore
```

我们在这里使用别人写好的[r0adkll/sign-android-release@v1](https://github.com/r0adkll/sign-android-release)

这个action用的是base64进行加密
```bash
openssl base64 < release.keystore | tr -d '\n' | tee release.keystore.base64.txt
```
配置如下
```yaml
steps:
  - uses: r0adkll/sign-android-release@v1
    name: Sign app APK
    # ID used to access action output
    id: sign_app
    with:
      releaseDirectory: app/build/outputs/apk/release
      signingKeyBase64: ${{ secrets.SIGNING_KEY }}
      alias: ${{ secrets.ALIAS }}
      keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
      keyPassword: ${{ secrets.KEY_PASSWORD }}
```
签名后的文件输出在`${{steps.sign_app.outputs.signedReleaseFile}}`

## 发布到release
这里使用[softprops/action-gh-release@v1](https://github.com/softprops/action-gh-release)。

在发布之前我们可能想改一下文件名，加上`package.json`里面的版本号，这里通过一条命令获取`package.json`的版本号
```bash
cat package.json | jq '.version' | tr -d '"'
```
如果要让下一个step获取之前的step输出，则要在要输出的step中加上id，要输出的step中执行。在其他的step中要用时使用`${{steps.step_id.outputs.name}}`，不要忘记里`outputs`
```bash
echo "{name}={value}" >> $GITHUB_OUTPUT
```

# 完整action文件
```yaml
# 工作流名称
name: Assemble Android Release

# 触发条件 有tags时或者push到master时触发
on:
  push:
    tags:
      - "v*"
    branches:
      - "master"


jobs:
  assemble:
    environment: release
    runs-on: ubuntu-latest
    steps:
      # 使用checkout 拉去代码库
      - name: checkout
        uses: actions/checkout@v3

      - name: Get yarn cache directory path
        id: yarn-cache-dir-path
        run: echo "dir=$(yarn cache dir)" >> $GITHUB_OUTPUT

      - uses: actions/cache@v3
        id: yarn-cache # use this to check for `cache-hit` (`steps.yarn-cache.outputs.cache-hit != 'true'`)
        with:
          path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-

      - name: Install Dependencies
        run: |
          yarn

      - name: cache gradle
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Make Gradlew Executable
        run: cd android && chmod +x ./gradlew

      - name: Generate App APK
        run: |
          cd android && ./gradlew assembleRelease --no-daemon

      - name: Sign app APK
        uses: r0adkll/sign-android-release@v1
        # ID used to access action output
        id: sign_app
        with:
          releaseDirectory: android/app/build/outputs/apk/release
          signingKeyBase64: ${{ secrets.SIGNING_KEY }}
          alias: ${{ secrets.KEY_ALIAS }}
          keyStorePassword: ${{ secrets.KEY_STORE_PASSWORD }}
          keyPassword: ${{ secrets.KEY_PASSWORD }}
      
      - name: get version
        id: rn_version
        run: |
          echo "version=$(cat package.json | jq '.version' | tr -d '"')" >> $GITHUB_OUTPUT

      - name: rename file with version
        id: rename
        run: |
          mv ${{steps.sign_app.outputs.signedReleaseFile}} android/app/build/outputs/apk/release/app-release-${{steps.rn_version.outputs.version}}.apk
          echo "releaseFile=android/app/build/outputs/apk/release/app-release-${{steps.rn_version.outputs.version}}.apk" >> $GITHUB_OUTPUT

      - name: Upload release assets
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            ${{steps.rename.outputs.releaseFile}}

```

# 执行action
现在可以执行action来看看运行结果，目前的触发方式有push、创建`v*`开头的tag，或者手动触发。我们这里创建一个`v1.0.0`的tag，可以看到release里面加上了编译后的apk。

![](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.4/release.png)

# 参考文献

[Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android)

[action/checkout](https://github.com/actions/checkout)

[action/cache](https://github.com/actions/cache)

[gradle daemon](https://docs.gradle.org/current/userguide/gradle_daemon.html)

[Difference between apk (.apk) and app bundle (.aab)](https://stackoverflow.com/questions/52059339/difference-between-apk-apk-and-app-bundle-aab)

[How to store a Android Keystore safely on GitHub Actions](https://stefma.medium.com/how-to-store-a-android-keystore-safely-on-github-actions-f0cef9413784)

[How do I get the output of a specific step in GitHub Actions?](https://stackoverflow.com/questions/59191913/how-do-i-get-the-output-of-a-specific-step-in-github-actions)

[react-native-ci-cd-github-action](https://www.obytes.com/blog/react-native-ci-cd-github-action)