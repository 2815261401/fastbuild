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
  /**
   * ? %custom%: 自定义名称
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
  /** 模板忽略配置,仅支持字符串,正则表达式,列如
   * * /test/ RegExp类型
   * * 'test' string类型
   */
  exclude: [],
	// 如果已经存在,是否强制覆盖(默认为false)
	overwrite: false,
	// 是否忽略系统占位符
	ignoreDefaultPlaceholder: false
}
