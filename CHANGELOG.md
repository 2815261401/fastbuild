# 变更记录

## [0.0.9]

- 修复读取模板配置文件的错误。
- 新增创建gitCommit的配置文件。
- 修复取消提交仍继续执行的bug。
- 从命令模板移除部分命令。

## [0.0.8]

- 修复读取文件,根目录错误的问题。

## [0.0.7]

- 新增cz-customizable的提交模板,实现方式借鉴了<a href="https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-commitizen">Visual Studio Code Commitizen Support</a>。

## [0.0.6]

- 采用了webpack打包,减少插件大小,重新整理实现逻辑,方便后续增加新功能。

## [0.0.5]

- 更换了逻辑,现在在问完用户后再读取,实现减少内存占用,生成文件时,会依次生成,减少路径错误带来的问题。由于git不会监听空文件夹,取消空文件夹的生成,减少杂乱。

## [0.0.4]

- config.template 更换为 .config.template,并支持语法高亮,语法规则与JavaScript相同,修复自定义字段无法使用的问题,通过模板新建文件时,会自动添加模板文件。如果不存在.config.template,在首次添加时,会将`.config.template`,`fileTemplate`添加到.gitignore文件

## [0.0.3]

- 实现方法全面重建,.ftemplate.js更换为config.template,防止与其他插件冲突,现在选择框不会轻易消失,减少卡顿和错误的概率

## [0.0.2]

- 重写了创建模板的运行方法，现在支持选择模板类型，可以单独选择模板文件或选择整个文件夹作为模板。

## [0.0.1]

- 首次发布
