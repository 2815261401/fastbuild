module.exports = {
	// 模板列表,用于选择
	templates: [
		{
			name: 'fileTemplate',
			path: 'fileTemplate'
		}
	],
	// 系统占位符
	/**
	 * * %custom%: 自定义名称
	 * * %folder%: 右击文件夹名(全小写)
	 * * %Folder%: 右击文件夹名
	 * * %FOLDER%: 右击文件夹名(全大写)
	 * * %module%: 模板文件名(全小写)
	 * * %Module%: 模板文件名
	 * * %MODULE%: 模板文件名(全大写)
	 * * %timestamp%: 时间戳
	 * * %year%: 年
	 * * %day%: 星期数
	 * * %month%: 月
	 * * %date%: 天
	 * * %hour%: 小时
	 * * %minute%: 分钟
	 * * %second%: 秒
	 */
	// 自定义占位符
	placeholder: [
		[
			'%name%',
			(context) => {
				return context.module === 'index'
					? context.folder.replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
					: context.module.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
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
};
