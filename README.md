# 通过模板配置快速创建文件

这是一个 VSCode 插件,用来快速构建文件

## 使用方法

创建模板目录内容,在没有配置文件(`template.config.js`)的情况下,默认使用 `fileTemplate` 目录作为模板目录.

- 创建模板目录(`fileTemplate`)

  `fileTemplate` 目录应当位于根目录下.

- 创建构建工具模板文件

  (文件名,文件夹,文件内容)可以设定占位符,占位符的内容在创建的时候会被替代.

- 新建文件

  右键文件夹 - (通过模板) 新建文件

## 系统提供的占位符

名称

- `${target}`: 右击文件夹名(`src`)
- `${targetPath}`: 右击文件夹绝对路径(`C:\\workspace\\test\\src`)
- `${name}`: 文件名(`index`)
- `${path}`: 文件绝对路径(`C:\\workspace\\test\\src\\index.js`)
- `${base}`: 完整文件名(包含后缀,`index.js`)
- `${ext}`: 文件后缀(`.js`)

内置方法(这里按照vscode的代码块的方法使用,例如:`${target/(.*)/${1:/upcase}/g}`)

- `/upcase`: 全大写
- `/downcase`: 全小写
- `/capitalize`: 首字母大写
- `/camelcase`: 驼峰命名
- `/pascalcase`: 帕斯卡命名

## 配置文件`template.config.js`(可在设置中修改)

可以通过命令( `创建构建工具模板文件` )快速创建配置文件.

支持以下高级功能

- 支持多模板
- 支持自定义占位符
- 支持忽略配置
- 是否强制覆盖

详细的配置详情如下

```javascript
  {
    /** 标识,用于识别多个 */
    name: '默认模板',
    /** 模板位置,格式: 路径:别名  */
    folderTemplates: { fileTemplate: 'fileTemplate' },
    /** 模板字符串,列如: { index: '${name/(.*)/${1:/upcase}/g}' } */
    stringTemplates: {},
    /** 占位符方法 */
    placeholder: {
      name: (
        context = {
          targetPath: '右击文件夹路径',
          targetName: '右击文件夹名称',
          filePath: '生成的模板文件路径',
          fileName: '生成的模板文件名称',
          fileBase: '生成的模板文件完整名称',
          fileExt: '生成的模板文件后缀',
          folderPath: '生成的模板文件所在文件夹路径',
          folderName: '生成的模板文件所在文件夹名称',
        }
      ) => {
        return context.fileName;
      },
    },
    /** 模板忽略配置,仅支持字符串,正则表达式,列如
     * * /test/ RegExp类型
     * * 'test' string类型
     */
    exclude: [],
    // 如果已经存在,是否强制覆盖(默认为false)
    overwrite: false,
    // 是否忽略系统占位符
    ignoreDefaultPlaceholder: false,
  },
];

```

## 注意事项

- 模板文件解析的时候使用的是 utf-8 编码，所以请保证编码一致。
- 占位符可以迭代嵌套,占位符生成的新的占位符可以被后面的占位符进行替代
- 空文件夹不会生成

## 最后

老版本的插件已经不能满足我个人使用,所以有了新版本,如果遇到问题,可在<a href="https://marketplace.visualstudio.com/items?itemName=lichenghao.fast-build&amp;ssr=false#review-details">此处</a>留言
