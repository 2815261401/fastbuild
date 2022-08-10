# 通过模板配置快速创建文件

这是一个 VSCode 插件,用来快速构建文件

## 使用方法

创建模板目录内容,在没有配置文件(.ftemplate.js)的情况下,默认使用 fileTemplate 目录作为模板目录.

- 创建模板目录(fileTemplate)

  fileTemplate 目录应当位于根目录下.

- 创建模板文件

  (文件名,文件夹,文件内容)可以设定占位符,占位符的内容在创建的时候会被替代.

- 新建文件

  右键文件夹 - (通过模板) 新建文件

> 空目录是无效的

## 系统提供的占位符

名称

- %Folder% : 文件夹的名字
- %folder% : 文件夹的名字(全部小写)
- %Module% : 模块的名字
- %module% : 模块的名字(全部小写)

时间

- %timestamp%: 时间戳
- %day% : 星期数
- %year% : 年
- %month% : 月
- %date% : 日
- %hour% : 小时
- %minute% : 分
- %second% : 秒

## 配置文件.ftemplate.js

可以通过命令( 创建模板文件 )快速创建配置文件.

支持以下高级功能

- 支持多模板
- 支持自定义占位符
- 支持忽略配置
- 是否强制覆盖

详细的配置详情如下

```
module.exports = {
  // 模板列表,用于选择,只有一个时自动选择
  templates: [
    {
      name: 'template', //模板名称
      path: 'template', //模板相对于工作区目录路径， 支持绝对路径
      exclude: 'txt$', // 排除模板文件中的内容，正则表达式
    },
  ],
  // 占位符
  /* context = {
    folder: 当前选择的文件目录
    workspaceFolder: 所在的工作区目录
    template: 所选择模块信息
    module: 模块名称
  }
  */
  placeholder: [
    [
      'EXT',
      (context) => {
        return context.module + '.temp';
      }, // [正则表达式, 返回函数]
    ],
  ],
  // 是否强制覆盖(默认为false)
  overwrite: false,
  // 是否忽略系统占位符
  ignoreDefaultPlaceholder: false,
};

```

模板配置列表支持对象配置，path 的子目录将自动解析为模板列表。实现快速设置。

```
  templates: {
    path: "templates",
    // 过滤指定模板
    filter: (dirname) => {
      return true;
    },
    exclude: 'txt$', // 排除模板文件中的内容，正则表达式
  },
```

## 注意事项

- 模板文件解析的时候使用的是 utf-8 编码，所以请保证编码一致。
- 占位符可以迭代嵌套,占位符生成的新的占位符可以被后面的占位符进行替代
- `%folder%`和 `%module%` , 以及 `%Folder%`和 `%Module%` 在不输入模块名称的情况下是等价的,所以会造成创建文件的时候冲突, 所以请尽量避免此类情况(虽然我们已经做过处理).

## 最后

如果觉得插件好用，希望给个五星好评。
