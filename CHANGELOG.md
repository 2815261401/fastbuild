# 变更记录

## [0.0.4]

- config.template 更换为 .config.template,并支持语法高亮,语法规则与JavaScript相同,修复自定义字段无法使用的问题,通过模板新建文件时,会自动添加模板文件。如果不存在.config.template,在首次添加时,会将`.config.template`,`fileTemplate`添加到.gitignore文件

## [0.0.3]

- 实现方法全面重建,.ftemplate.js更换为config.template,防止与其他插件冲突,现在选择框不会轻易消失,减少卡顿和错误的概率

## [0.0.2]

- 重写了创建模板的运行方法，现在支持选择模板类型，可以单独选择模板文件或选择整个文件夹作为模板。

## [0.0.1]

- 首次发布