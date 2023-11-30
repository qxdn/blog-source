new ChucklePostAI({
  // 文章内容所在的元素属性的选择器，也是AI挂载的容器，AI将会挂载到该容器的最前面
  el: "#post>#article-container",
  // 驱动AI所必须的key，即是tianliGPT后端服务所必须的key
  key: "e3c69d80334be20b48d6",
  // 文章推荐方式，all：匹配数据库内所有文章进行推荐，web：仅当前站内的文章，默认all
  rec_method: "web",
  hide_shuttle: true,
  summary_directly: true,
  pjax: true,
  summary_speech: true,
  interface: {
    name: "AI摘要", // AI名称
    introduce:
      "我是文章辅助AI: 点击下方的按钮，让我生成本文简介、推荐相关文章等。", // 自我介绍
  },
});
