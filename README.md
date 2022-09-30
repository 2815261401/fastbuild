# 通过模板配置快速创建文件

这是一个 VSCode 插件,用来快速构建文件

## 使用方法

创建模板目录内容,在没有配置文件(config.template)的情况下,默认使用 fileTemplate 目录作为模板目录.

- 创建模板目录(fileTemplate)

  fileTemplate 目录应当位于根目录下.

- 创建构建工具模板文件

  (文件名,文件夹,文件内容)可以设定占位符,占位符的内容在创建的时候会被替代.

- 新建文件

  右键文件夹 - (通过模板) 新建文件

## 系统提供的占位符

名称

- %custom%: 自定义名称
- %folder%: 右击文件夹名(全小写)
- %Folder%: 右击文件夹名
- %FOLDER%: 右击文件夹名(全大写)
- %module%: 模板文件名(全小写)
- %Module%: 模板文件名
- %MODULE%: 模板文件名(全大写)


时间

- %timestamp%: 时间戳
- %day% : 星期数
- %year% : 年
- %month% : 月
- %date% : 日
- %hour% : 小时
- %minute% : 分
- %second% : 秒

## 配置文件config.template

可以通过命令( 创建构建工具模板文件 )快速创建配置文件.

支持以下高级功能

- 支持多模板
- 支持自定义占位符
- 支持忽略配置
- 是否强制覆盖

详细的配置详情如下

```
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


```

## 注意!!!

## 不要讲 template 转化成字符串,template 理论上是无限的

placeholder的类型是```[string | RegExp, (context)=>string][]```,其中context的内容如下:
```
{
	folder: string; 右击文件夹名称
	folderPath: string; 右击文件夹路径
	workspaceFolder: string; 当前工作区的文件夹名称
	templateFolder: string; 当前选中的你创建的模板文件夹名称
	module: string; 当前文件(文件夹)名称
	template: TemplateFileData 模板对应的实体
	{
		name: string; 当前创建的文件(文件夹)模板的名称
		parent: TemplateFileData; 只要不是模板文件夹都会有,例如: fileTemplate 就没有
		type: number; 1 文件,2 文件夹
		suffix: string; 文件后缀,只有文件才有
		children: TemplateFileData[]; 文件夹内的文件和文件夹,只要文件夹才有
		alias: string; 格式化后的文件(文件夹)名,基本是你要生成的名称
		fullName: string; 完整文件(目录)名
	}
}
```

模板配置列表支持对象配置，path 的子目录将自动解析为模板列表。实现快速设置。

```
  templates: [
		{
			name: 'fileTemplate',
			path: 'fileTemplate'
		}
	],
```

## 注意事项

- 模板文件解析的时候使用的是 utf-8 编码，所以请保证编码一致。
- 占位符可以迭代嵌套,占位符生成的新的占位符可以被后面的占位符进行替代

## 最后
我写这个插件用于方便自己平常的开发,以及学习理解更高级的语法。

如果觉得插件好用，希望给个五星好评。
