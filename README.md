# 破坏性更新

- 不再支持读取配置文件,新版本将根据`.vscode\template.config.json`的配置实现模板生成
- 根据配置依次进行文本替换,注意: 排后面的会替换在前边的结果
- 例如使用模板 `test/index.js`, 将`test=>index`,`index=>abc`, 实现结果为`abc/abc.js`

### 约定式提交

该功能是对[Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)的模仿,基于[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/),具体使用方式自己摸索

### 快速执行命令

- 目前仅有`快速删除`功能, 平常我用于删除`node_modules`文件夹
