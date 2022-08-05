module.exports = {
  // 模板列表,用于选择
  templates: [
    {
      name: "fileTemplate",
      path: "fileTemplate",
      // 过滤指定模板
      filter: (dirname) => {
        return true
      },
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
			'%name%',
			(context) => {
				return context.module === 'index'
					? context.folder
							.split('\\')
							[context.folder.split('\\').length - 1].replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
					: context.module.replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
			} // [正则表达式, 返回函数]
		]
	],
  // 模板忽略配置
  exclude: [

  ],
	// 如果已经存在,是否强制覆盖(默认为false)
	overwrite: false,
	// 是否忽略系统占位符
	ignoreDefaultPlaceholder: false
}
