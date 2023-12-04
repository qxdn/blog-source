"use strict";
const { filter } = hexo.extend;

// 替换 CDN
filter.register(
  "before_generate",
  () => {
    const { asset } = hexo.theme.config;
    for (const name in asset) {
      asset[name] = asset[name]
        .replace("//cdn.jsdelivr.net/npm/", "//jsd.cdn.zzko.cn/npm/")
        .replace("//cdn.jsdelivr.net/gh/", "//jsd.cdn.zzko.cn/gh/");
    }
    hexo.config.githubcalendar.calendar_js =
      hexo.config.githubcalendar.calendar_js
        .replace("//cdn.jsdelivr.net/npm/", "//jsd.cdn.zzko.cn/npm/")
        .replace("//cdn.jsdelivr.net/gh/", "//jsd.cdn.zzko.cn/gh/");
  },
  11
);

// 替换内容
filter.register("before_post_render", (data) => {
  if (data.content) {
    data.content = data.content
      .replaceAll("//cdn.jsdelivr.net/npm/", "//jsd.cdn.zzko.cn/npm/")
      .replaceAll("//cdn.jsdelivr.net/gh/", "//jsd.cdn.zzko.cn/gh/");
  }
  return data;
});

// 替换头图
filter.register("after_post_render", (data) => {
  if (data.cover) {
    data.cover = data.cover
      .replaceAll("//cdn.jsdelivr.net/npm/", "//jsd.cdn.zzko.cn/npm/")
      .replaceAll("//cdn.jsdelivr.net/gh/", "//jsd.cdn.zzko.cn/gh/");
  }
  if (data.top_img) {
    data.top_img = data.top_img
      .replaceAll("//cdn.jsdelivr.net/npm/", "//jsd.cdn.zzko.cn/npm/")
      .replaceAll("//cdn.jsdelivr.net/gh/", "//jsd.cdn.zzko.cn/gh/");
  }
  return data;
});
