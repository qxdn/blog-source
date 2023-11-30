new ChucklePostAI({
  // 文章内容所在的元素属性的选择器，也是AI挂载的容器，AI将会挂载到该容器的最前面
  el: "#post>#article-container",
  // 驱动AI所必须的key，即是tianliGPT后端服务所必须的key
  key: "e3c69d80334be20b48d6",
  // 文章推荐方式，all：匹配数据库内所有文章进行推荐，web：仅当前站内的文章，默认all
  rec_method: "web",
});
