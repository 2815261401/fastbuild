module.exports = {

  // 模板列表,用于选择
  templates: [
    {
      name: "template",
      path: "template"
    }
  ],
  // 占位符
  /* env = {
    current: 当前选择的文件目录
    folder: path.parse(current)
    workspaceFolder: 所在的工作区目录
    configFile: 配置文件目录
    templateFolder: 模板目录
    templateName: 模板名称
    module: 模块名称
  }
  */
  placeholder: [
    [
      "%(\\s*)author(\\s*)%", (env) => { return "作者" }  // [正则表达式, 返回函数]
    ]
  ],
  // 模板忽略配置
  exclude: [

  ],
  // 是否强制覆盖(默认为false)
  overwrite: true,
}
