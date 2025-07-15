# 更新日志

## [0.2.4](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-07-15)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 记忆步骤 默认值读取错误 ([65ea385](https://github.com/2815261401/fastbuild/commit/65ea3857a306d6a5d7cdbfe7587b01835283fad8))
* 🚑️修复不填充作用域导致的返回上一步 ([61b0643](https://github.com/2815261401/fastbuild/commit/61b06435f066a1037783d457044801922cd04dda))

### 🎫 Chores | 其他更新

* 👷更新版本控制脚本, 减少语义误导 ([70809a3](https://github.com/2815261401/fastbuild/commit/70809a3bf45abd77b82da7b194b0b68021646d3d))
* **release:** 🔖0.2.3 ([7bc639a](https://github.com/2815261401/fastbuild/commit/7bc639ab7f024f3a39ce0072f08679ff141a30ee))
## [0.2.2](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-07-15)

### 🐛 Bug Fixes | Bug 修复

* 🐛禁止创建重复作用域 ([4db11b1](https://github.com/2815261401/fastbuild/commit/4db11b14519765495938d4a3a8abb01490e076de))
* 🐛修复提交步骤未记忆 ([4342fcc](https://github.com/2815261401/fastbuild/commit/4342fcc2fb2db45fba570db5ac93e5c287343ae7))
* 🐛修复新建作用域返回上一级定位错误 ([887641e](https://github.com/2815261401/fastbuild/commit/887641ec86601dbdb3e239c8eeccbf742bf07cc6))

### 🎫 Chores | 其他更新

* 🐛修复 .editorconfig 大小写错误 ([e7704bc](https://github.com/2815261401/fastbuild/commit/e7704bcdf9a04f9e67c02fc4e518e03bd824b475))
* **release:** 🔖0.2.2 ([c82ac88](https://github.com/2815261401/fastbuild/commit/c82ac88761b4e8b579eab0dfc5e37838d282679c))
## [0.2.1](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-07-14)

### ✨ Features | 新功能

* ✨添加是否更新 gitmoji 的选项 ([3b23a21](https://github.com/2815261401/fastbuild/commit/3b23a215daf750ceaa5f68705c2e9af0e158410d))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复tsconfig无法读取导致的错误 ([5934dce](https://github.com/2815261401/fastbuild/commit/5934dceccbb113ce44d94f8e2dda19a2ea9c5bf2))

### 🎫 Chores | 其他更新

* 🔥移除未使用的函数 ([60c4dbc](https://github.com/2815261401/fastbuild/commit/60c4dbce6eb5aedfcfb1be8896efa0f7168416ec))
* **release:** 🔖0.2.1 ([1f081cf](https://github.com/2815261401/fastbuild/commit/1f081cf6883d3ee2c827302fa9ff6b332227760c))
## [0.2.0](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-07-14)

### ⚠ BREAKING CHANGES

* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha

### ♻️ Code Refactoring | 代码重构

* ♻️完成 保存为模板, 使用模板 的重构 ([7195e7d](https://github.com/2815261401/fastbuild/commit/7195e7d248478116b7e139a25e8bfd70d461d016))
* ♻️完成 快速执行命令 的重构 ([eaa7909](https://github.com/2815261401/fastbuild/commit/eaa7909265e4164f7b7a88b06558286478ef03ab))
* ♻️完成 约定式提交 的功能重构 ([6605688](https://github.com/2815261401/fastbuild/commit/66056888b668f8622f64758b922db23bf74c459c))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([1e1bf12](https://github.com/2815261401/fastbuild/commit/1e1bf12a819c4188ba795f2abdb88f4c14f77022))
* **release:** 🔖0.2.0 ([f7b7e5c](https://github.com/2815261401/fastbuild/commit/f7b7e5cf5c89ebef46590c845687718a261a539f))
## [0.1.8](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-06-04)

### ✨ Features | 新功能

* ✨修复自定义参数未聚焦, 支持在编辑器上下文显示命令 ([4cf0666](https://github.com/2815261401/fastbuild/commit/4cf066627de16315653938aa1cae8139b38f3990))

### 💄 Styles | 风格

* 🎨调整代码格式 ([d216f9d](https://github.com/2815261401/fastbuild/commit/d216f9d21c23d13e015b1824d9a74505f17e7181))

### 👷‍ Build System | 构建

* ♻️将 xe-utils 替换为 radashi ([57c5ae9](https://github.com/2815261401/fastbuild/commit/57c5ae9a8cda5ffd1f22c455ab20929a22aef222))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([10e02b0](https://github.com/2815261401/fastbuild/commit/10e02b0feabedf186f563e0f5e0f32972f152247))
* 📝修改插件名称, 订正文档 ([9205f65](https://github.com/2815261401/fastbuild/commit/9205f65e873efcd1c458ba0b5164b01ed6c5567a))
* **release:** 🔖0.1.8 ([0346ab5](https://github.com/2815261401/fastbuild/commit/0346ab529972b7f0a4df2562fd436b845f3c490c))
## [0.1.7](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-05-26)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 => 不是必填项无法继续下一步 ([f46836a](https://github.com/2815261401/fastbuild/commit/f46836a253621ae33d15561c3979a077bac4be9a))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.7 ([fb0c68b](https://github.com/2815261401/fastbuild/commit/fb0c68b960a85edf037d272fb722f43794b56061))
## [0.1.6](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-05-16)

### ✨ Features | 新功能

* ✨约定式提交返回上一步保留默认值 ([a280123](https://github.com/2815261401/fastbuild/commit/a28012321362efbf292872f9fba0dd73ab68f6a2))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.6 ([b796510](https://github.com/2815261401/fastbuild/commit/b796510a4bbd46f0426a146d5fa58d4205d46509))
## [0.1.5](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2025-05-15)

### ⚠ BREAKING CHANGES

* 模板正则调整匹配规则

分支: master

### ✨ Features | 新功能

* 🐛修复commit格式错误 ([9f15898](https://github.com/2815261401/fastbuild/commit/9f15898391115f0e7d5e2e9be5dc2495f2f58476))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复更新版本导致的打包错误 ([539c6f5](https://github.com/2815261401/fastbuild/commit/539c6f5e02a5a683b4f40b26f90c35e6e0048f87))
* 🐛修复工作区快速命令启动文件夹位置,修复上次使用步骤警告问题,添加快速命令终端上限 ([e8254bc](https://github.com/2815261401/fastbuild/commit/e8254bc1d1e656e97c96ac1abefbe5ee967cfe85))

### ♻️ Code Refactoring | 代码重构

* 🚨调整eslint配置, 配置文件采用esm格式, 重构模板相关模块 ([b20883f](https://github.com/2815261401/fastbuild/commit/b20883f33e73b139201e6de572ac70bac87df2ec))

### 🎫 Chores | 其他更新

* ✨使用 release-it 进行版本控制 ([0a1626e](https://github.com/2815261401/fastbuild/commit/0a1626eadd1e47a54d4fdb2a7462db225460d699))
* ⬆️更新依赖 ([633f361](https://github.com/2815261401/fastbuild/commit/633f361b9bb75a42d72844e1ba283ac93ef572c9))
* **release:** 🔖0.1.5 ([45d7731](https://github.com/2815261401/fastbuild/commit/45d77315600c82f49499a8e34d9110b0a67d2aca))
## [0.1.3](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2024-08-09)

### ✨ Features | 新功能

* ✨重新调整命令 ([c291b0b](https://github.com/2815261401/fastbuild/commit/c291b0b690a72843e953a3beb419a20bc904c486))

### 👷‍ Build System | 构建

* ⬆️更新依赖 ([acd2c5e](https://github.com/2815261401/fastbuild/commit/acd2c5e6792e26cfdf818b3960efc6a57ef2c861))
* 🔧更新eslint,prettier的配置 ([507480e](https://github.com/2815261401/fastbuild/commit/507480eaaadb3bd4c542c0cd18830a41d921d3f7))

### 🎫 Chores | 其他更新

* 💄通过eslint调整代码格式 ([d0910fa](https://github.com/2815261401/fastbuild/commit/d0910faa8a6d9b3da3cee468688932a8c75dbecd))
* 📝更新CHANGELOG ([f5a9813](https://github.com/2815261401/fastbuild/commit/f5a98134f6892336c6129ff9de5357a058ab032d))
* 🔨新增生成CHANGELOG的命令 ([3d32ee3](https://github.com/2815261401/fastbuild/commit/3d32ee3c4fa8b44dadaee8717e341dece65c64a3))
## [0.1.2](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2024-06-13)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复配置覆盖问题,支持配置默认值 ([b408880](https://github.com/2815261401/fastbuild/commit/b40888065877d5ed402d86a11e64ff51f52dd2d8))
## [0.1.1](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2024-06-13)

### ✨ Features | 新功能

* ✨新增配置项,支持配置生成的文件位置,文件所在工作区,工作区的模板根据下标进行隔离 ([3993c58](https://github.com/2815261401/fastbuild/commit/3993c58eddfe6d859526ba2563c475694ede35e1))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复关于vscode.git的报错 ([ee39dfd](https://github.com/2815261401/fastbuild/commit/ee39dfd946ad8cca6ba314ded4ec00520eb00c8f))
## [0.1.0](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2024-06-12)

### ⚠ BREAKING CHANGES

* 更改了模版的实现方式,历史方法不在支持

分支: master

### ✨ Features | 新功能

* ✨重新实现模版功能 ([1bc15ec](https://github.com/2815261401/fastbuild/commit/1bc15ec59acbd9940e2e2d77b49438e9dbe730a0))
## [0.0.14](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2024-05-17)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复设置缓存 ([2450977](https://github.com/2815261401/fastbuild/commit/24509772833f3d441cdee909f440a37b5f53bc9f))
## [0.0.13](https://github.com/2815261401/fastbuild/compare/0.2.3...0.2.4) (2024-05-17)

### ✨ Features | 新功能

* ✨新增快速执行命令的命令 ([1fad214](https://github.com/2815261401/fastbuild/commit/1fad2145ded1b3e080d3a025cda191d9dae21523))
* 自动添加配置到暂存区 ([ddfc1ae](https://github.com/2815261401/fastbuild/commit/ddfc1ae0448e480a21ca8f97521a6ea2f1abfcba))
* **commit:** :sparkles: 更新commit方式 ([18f1351](https://github.com/2815261401/fastbuild/commit/18f13513c9ceb76d85b888ae68eaa712687097c4))

### 🐛 Bug Fixes | Bug 修复

* 🐛调整获取参数的方法,防止缓存数据 ([701590d](https://github.com/2815261401/fastbuild/commit/701590d876992ce5300da2eeac4a581bd57aeaca))
* 🐛修复表情数据重复请求 ([e8276a8](https://github.com/2815261401/fastbuild/commit/e8276a81e45e4a3a15732d7a8b253d373c2e549c))
* 🐛修复未输入footer不带注脚 ([c8ead3d](https://github.com/2815261401/fastbuild/commit/c8ead3d15279b2066552ff7f790a62830ffcb3fd))
* 🐛修复commitlint.config.cjs文件丢失 ([f3d5475](https://github.com/2815261401/fastbuild/commit/f3d5475d6b45425380e513bc2a1c629a5ba0d8f4))
* 🔥移除无效命令 ([59a732e](https://github.com/2815261401/fastbuild/commit/59a732e0f25b25661139bef226fce7f0f2039f1d))

### 📝 Documentation |文档

* **README:** 💬移除部分描述 ([b23dfec](https://github.com/2815261401/fastbuild/commit/b23dfeccbef0e8335e34f2daabd38e6789f57ebd))

## [0.2.3](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-07-15)

### 🐛 Bug Fixes | Bug 修复

* 🐛禁止创建重复作用域 ([4db11b1](https://github.com/2815261401/fastbuild/commit/4db11b14519765495938d4a3a8abb01490e076de))
* 🐛修复提交步骤未记忆 ([4342fcc](https://github.com/2815261401/fastbuild/commit/4342fcc2fb2db45fba570db5ac93e5c287343ae7))
* 🐛修复新建作用域返回上一级定位错误 ([887641e](https://github.com/2815261401/fastbuild/commit/887641ec86601dbdb3e239c8eeccbf742bf07cc6))
* 🚑️修复不填充作用域导致的返回上一步 ([61b0643](https://github.com/2815261401/fastbuild/commit/61b06435f066a1037783d457044801922cd04dda))

### 🎫 Chores | 其他更新

* 🐛修复 .editorconfig 大小写错误 ([e7704bc](https://github.com/2815261401/fastbuild/commit/e7704bcdf9a04f9e67c02fc4e518e03bd824b475))
* **release:** 🔖0.2.2 ([c82ac88](https://github.com/2815261401/fastbuild/commit/c82ac88761b4e8b579eab0dfc5e37838d282679c))
## [0.2.1](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-07-14)

### ✨ Features | 新功能

* ✨添加是否更新 gitmoji 的选项 ([3b23a21](https://github.com/2815261401/fastbuild/commit/3b23a215daf750ceaa5f68705c2e9af0e158410d))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复tsconfig无法读取导致的错误 ([5934dce](https://github.com/2815261401/fastbuild/commit/5934dceccbb113ce44d94f8e2dda19a2ea9c5bf2))

### 🎫 Chores | 其他更新

* 🔥移除未使用的函数 ([60c4dbc](https://github.com/2815261401/fastbuild/commit/60c4dbce6eb5aedfcfb1be8896efa0f7168416ec))
* **release:** 🔖0.2.1 ([1f081cf](https://github.com/2815261401/fastbuild/commit/1f081cf6883d3ee2c827302fa9ff6b332227760c))
## [0.2.0](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-07-14)

### ⚠ BREAKING CHANGES

* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha

### ♻️ Code Refactoring | 代码重构

* ♻️完成 保存为模板, 使用模板 的重构 ([7195e7d](https://github.com/2815261401/fastbuild/commit/7195e7d248478116b7e139a25e8bfd70d461d016))
* ♻️完成 快速执行命令 的重构 ([eaa7909](https://github.com/2815261401/fastbuild/commit/eaa7909265e4164f7b7a88b06558286478ef03ab))
* ♻️完成 约定式提交 的功能重构 ([6605688](https://github.com/2815261401/fastbuild/commit/66056888b668f8622f64758b922db23bf74c459c))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([1e1bf12](https://github.com/2815261401/fastbuild/commit/1e1bf12a819c4188ba795f2abdb88f4c14f77022))
* **release:** 🔖0.2.0 ([f7b7e5c](https://github.com/2815261401/fastbuild/commit/f7b7e5cf5c89ebef46590c845687718a261a539f))
## [0.1.8](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-06-04)

### ✨ Features | 新功能

* ✨修复自定义参数未聚焦, 支持在编辑器上下文显示命令 ([4cf0666](https://github.com/2815261401/fastbuild/commit/4cf066627de16315653938aa1cae8139b38f3990))

### 💄 Styles | 风格

* 🎨调整代码格式 ([d216f9d](https://github.com/2815261401/fastbuild/commit/d216f9d21c23d13e015b1824d9a74505f17e7181))

### 👷‍ Build System | 构建

* ♻️将 xe-utils 替换为 radashi ([57c5ae9](https://github.com/2815261401/fastbuild/commit/57c5ae9a8cda5ffd1f22c455ab20929a22aef222))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([10e02b0](https://github.com/2815261401/fastbuild/commit/10e02b0feabedf186f563e0f5e0f32972f152247))
* 📝修改插件名称, 订正文档 ([9205f65](https://github.com/2815261401/fastbuild/commit/9205f65e873efcd1c458ba0b5164b01ed6c5567a))
* **release:** 🔖0.1.8 ([0346ab5](https://github.com/2815261401/fastbuild/commit/0346ab529972b7f0a4df2562fd436b845f3c490c))
## [0.1.7](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-05-26)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 => 不是必填项无法继续下一步 ([f46836a](https://github.com/2815261401/fastbuild/commit/f46836a253621ae33d15561c3979a077bac4be9a))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.7 ([fb0c68b](https://github.com/2815261401/fastbuild/commit/fb0c68b960a85edf037d272fb722f43794b56061))
## [0.1.6](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-05-16)

### ✨ Features | 新功能

* ✨约定式提交返回上一步保留默认值 ([a280123](https://github.com/2815261401/fastbuild/commit/a28012321362efbf292872f9fba0dd73ab68f6a2))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.6 ([b796510](https://github.com/2815261401/fastbuild/commit/b796510a4bbd46f0426a146d5fa58d4205d46509))
## [0.1.5](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2025-05-15)

### ⚠ BREAKING CHANGES

* 模板正则调整匹配规则

分支: master

### ✨ Features | 新功能

* 🐛修复commit格式错误 ([9f15898](https://github.com/2815261401/fastbuild/commit/9f15898391115f0e7d5e2e9be5dc2495f2f58476))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复更新版本导致的打包错误 ([539c6f5](https://github.com/2815261401/fastbuild/commit/539c6f5e02a5a683b4f40b26f90c35e6e0048f87))
* 🐛修复工作区快速命令启动文件夹位置,修复上次使用步骤警告问题,添加快速命令终端上限 ([e8254bc](https://github.com/2815261401/fastbuild/commit/e8254bc1d1e656e97c96ac1abefbe5ee967cfe85))

### ♻️ Code Refactoring | 代码重构

* 🚨调整eslint配置, 配置文件采用esm格式, 重构模板相关模块 ([b20883f](https://github.com/2815261401/fastbuild/commit/b20883f33e73b139201e6de572ac70bac87df2ec))

### 🎫 Chores | 其他更新

* ✨使用 release-it 进行版本控制 ([0a1626e](https://github.com/2815261401/fastbuild/commit/0a1626eadd1e47a54d4fdb2a7462db225460d699))
* ⬆️更新依赖 ([633f361](https://github.com/2815261401/fastbuild/commit/633f361b9bb75a42d72844e1ba283ac93ef572c9))
* **release:** 🔖0.1.5 ([45d7731](https://github.com/2815261401/fastbuild/commit/45d77315600c82f49499a8e34d9110b0a67d2aca))
## [0.1.3](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2024-08-09)

### ✨ Features | 新功能

* ✨重新调整命令 ([c291b0b](https://github.com/2815261401/fastbuild/commit/c291b0b690a72843e953a3beb419a20bc904c486))

### 👷‍ Build System | 构建

* ⬆️更新依赖 ([acd2c5e](https://github.com/2815261401/fastbuild/commit/acd2c5e6792e26cfdf818b3960efc6a57ef2c861))
* 🔧更新eslint,prettier的配置 ([507480e](https://github.com/2815261401/fastbuild/commit/507480eaaadb3bd4c542c0cd18830a41d921d3f7))

### 🎫 Chores | 其他更新

* 💄通过eslint调整代码格式 ([d0910fa](https://github.com/2815261401/fastbuild/commit/d0910faa8a6d9b3da3cee468688932a8c75dbecd))
* 📝更新CHANGELOG ([f5a9813](https://github.com/2815261401/fastbuild/commit/f5a98134f6892336c6129ff9de5357a058ab032d))
* 🔨新增生成CHANGELOG的命令 ([3d32ee3](https://github.com/2815261401/fastbuild/commit/3d32ee3c4fa8b44dadaee8717e341dece65c64a3))
## [0.1.2](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2024-06-13)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复配置覆盖问题,支持配置默认值 ([b408880](https://github.com/2815261401/fastbuild/commit/b40888065877d5ed402d86a11e64ff51f52dd2d8))
## [0.1.1](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2024-06-13)

### ✨ Features | 新功能

* ✨新增配置项,支持配置生成的文件位置,文件所在工作区,工作区的模板根据下标进行隔离 ([3993c58](https://github.com/2815261401/fastbuild/commit/3993c58eddfe6d859526ba2563c475694ede35e1))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复关于vscode.git的报错 ([ee39dfd](https://github.com/2815261401/fastbuild/commit/ee39dfd946ad8cca6ba314ded4ec00520eb00c8f))
## [0.1.0](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2024-06-12)

### ⚠ BREAKING CHANGES

* 更改了模版的实现方式,历史方法不在支持

分支: master

### ✨ Features | 新功能

* ✨重新实现模版功能 ([1bc15ec](https://github.com/2815261401/fastbuild/commit/1bc15ec59acbd9940e2e2d77b49438e9dbe730a0))
## [0.0.14](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2024-05-17)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复设置缓存 ([2450977](https://github.com/2815261401/fastbuild/commit/24509772833f3d441cdee909f440a37b5f53bc9f))
## [0.0.13](https://github.com/2815261401/fastbuild/compare/0.2.2...0.2.3) (2024-05-17)

### ✨ Features | 新功能

* ✨新增快速执行命令的命令 ([1fad214](https://github.com/2815261401/fastbuild/commit/1fad2145ded1b3e080d3a025cda191d9dae21523))
* 自动添加配置到暂存区 ([ddfc1ae](https://github.com/2815261401/fastbuild/commit/ddfc1ae0448e480a21ca8f97521a6ea2f1abfcba))
* **commit:** :sparkles: 更新commit方式 ([18f1351](https://github.com/2815261401/fastbuild/commit/18f13513c9ceb76d85b888ae68eaa712687097c4))

### 🐛 Bug Fixes | Bug 修复

* 🐛调整获取参数的方法,防止缓存数据 ([701590d](https://github.com/2815261401/fastbuild/commit/701590d876992ce5300da2eeac4a581bd57aeaca))
* 🐛修复表情数据重复请求 ([e8276a8](https://github.com/2815261401/fastbuild/commit/e8276a81e45e4a3a15732d7a8b253d373c2e549c))
* 🐛修复未输入footer不带注脚 ([c8ead3d](https://github.com/2815261401/fastbuild/commit/c8ead3d15279b2066552ff7f790a62830ffcb3fd))
* 🐛修复commitlint.config.cjs文件丢失 ([f3d5475](https://github.com/2815261401/fastbuild/commit/f3d5475d6b45425380e513bc2a1c629a5ba0d8f4))
* 🔥移除无效命令 ([59a732e](https://github.com/2815261401/fastbuild/commit/59a732e0f25b25661139bef226fce7f0f2039f1d))

### 📝 Documentation |文档

* **README:** 💬移除部分描述 ([b23dfec](https://github.com/2815261401/fastbuild/commit/b23dfeccbef0e8335e34f2daabd38e6789f57ebd))

## [0.2.2](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-07-15)

### 🐛 Bug Fixes | Bug 修复

* 🐛禁止创建重复作用域 ([4db11b1](https://github.com/2815261401/fastbuild/commit/4db11b14519765495938d4a3a8abb01490e076de))
* 🐛修复提交步骤未记忆 ([4342fcc](https://github.com/2815261401/fastbuild/commit/4342fcc2fb2db45fba570db5ac93e5c287343ae7))
* 🐛修复新建作用域返回上一级定位错误 ([887641e](https://github.com/2815261401/fastbuild/commit/887641ec86601dbdb3e239c8eeccbf742bf07cc6))

### 🎫 Chores | 其他更新

* 🐛修复 .editorconfig 大小写错误 ([e7704bc](https://github.com/2815261401/fastbuild/commit/e7704bcdf9a04f9e67c02fc4e518e03bd824b475))
## [0.2.1](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-07-14)

### ✨ Features | 新功能

* ✨添加是否更新 gitmoji 的选项 ([3b23a21](https://github.com/2815261401/fastbuild/commit/3b23a215daf750ceaa5f68705c2e9af0e158410d))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复tsconfig无法读取导致的错误 ([5934dce](https://github.com/2815261401/fastbuild/commit/5934dceccbb113ce44d94f8e2dda19a2ea9c5bf2))

### 🎫 Chores | 其他更新

* 🔥移除未使用的函数 ([60c4dbc](https://github.com/2815261401/fastbuild/commit/60c4dbce6eb5aedfcfb1be8896efa0f7168416ec))
* **release:** 🔖0.2.1 ([1f081cf](https://github.com/2815261401/fastbuild/commit/1f081cf6883d3ee2c827302fa9ff6b332227760c))
## [0.2.0](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-07-14)

### ⚠ BREAKING CHANGES

* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha

### ♻️ Code Refactoring | 代码重构

* ♻️完成 保存为模板, 使用模板 的重构 ([7195e7d](https://github.com/2815261401/fastbuild/commit/7195e7d248478116b7e139a25e8bfd70d461d016))
* ♻️完成 快速执行命令 的重构 ([eaa7909](https://github.com/2815261401/fastbuild/commit/eaa7909265e4164f7b7a88b06558286478ef03ab))
* ♻️完成 约定式提交 的功能重构 ([6605688](https://github.com/2815261401/fastbuild/commit/66056888b668f8622f64758b922db23bf74c459c))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([1e1bf12](https://github.com/2815261401/fastbuild/commit/1e1bf12a819c4188ba795f2abdb88f4c14f77022))
* **release:** 🔖0.2.0 ([f7b7e5c](https://github.com/2815261401/fastbuild/commit/f7b7e5cf5c89ebef46590c845687718a261a539f))
## [0.1.8](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-06-04)

### ✨ Features | 新功能

* ✨修复自定义参数未聚焦, 支持在编辑器上下文显示命令 ([4cf0666](https://github.com/2815261401/fastbuild/commit/4cf066627de16315653938aa1cae8139b38f3990))

### 💄 Styles | 风格

* 🎨调整代码格式 ([d216f9d](https://github.com/2815261401/fastbuild/commit/d216f9d21c23d13e015b1824d9a74505f17e7181))

### 👷‍ Build System | 构建

* ♻️将 xe-utils 替换为 radashi ([57c5ae9](https://github.com/2815261401/fastbuild/commit/57c5ae9a8cda5ffd1f22c455ab20929a22aef222))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([10e02b0](https://github.com/2815261401/fastbuild/commit/10e02b0feabedf186f563e0f5e0f32972f152247))
* 📝修改插件名称, 订正文档 ([9205f65](https://github.com/2815261401/fastbuild/commit/9205f65e873efcd1c458ba0b5164b01ed6c5567a))
* **release:** 🔖0.1.8 ([0346ab5](https://github.com/2815261401/fastbuild/commit/0346ab529972b7f0a4df2562fd436b845f3c490c))
## [0.1.7](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-05-26)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 => 不是必填项无法继续下一步 ([f46836a](https://github.com/2815261401/fastbuild/commit/f46836a253621ae33d15561c3979a077bac4be9a))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.7 ([fb0c68b](https://github.com/2815261401/fastbuild/commit/fb0c68b960a85edf037d272fb722f43794b56061))
## [0.1.6](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-05-16)

### ✨ Features | 新功能

* ✨约定式提交返回上一步保留默认值 ([a280123](https://github.com/2815261401/fastbuild/commit/a28012321362efbf292872f9fba0dd73ab68f6a2))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.6 ([b796510](https://github.com/2815261401/fastbuild/commit/b796510a4bbd46f0426a146d5fa58d4205d46509))
## [0.1.5](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2025-05-15)

### ⚠ BREAKING CHANGES

* 模板正则调整匹配规则

分支: master

### ✨ Features | 新功能

* 🐛修复commit格式错误 ([9f15898](https://github.com/2815261401/fastbuild/commit/9f15898391115f0e7d5e2e9be5dc2495f2f58476))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复更新版本导致的打包错误 ([539c6f5](https://github.com/2815261401/fastbuild/commit/539c6f5e02a5a683b4f40b26f90c35e6e0048f87))
* 🐛修复工作区快速命令启动文件夹位置,修复上次使用步骤警告问题,添加快速命令终端上限 ([e8254bc](https://github.com/2815261401/fastbuild/commit/e8254bc1d1e656e97c96ac1abefbe5ee967cfe85))

### ♻️ Code Refactoring | 代码重构

* 🚨调整eslint配置, 配置文件采用esm格式, 重构模板相关模块 ([b20883f](https://github.com/2815261401/fastbuild/commit/b20883f33e73b139201e6de572ac70bac87df2ec))

### 🎫 Chores | 其他更新

* ✨使用 release-it 进行版本控制 ([0a1626e](https://github.com/2815261401/fastbuild/commit/0a1626eadd1e47a54d4fdb2a7462db225460d699))
* ⬆️更新依赖 ([633f361](https://github.com/2815261401/fastbuild/commit/633f361b9bb75a42d72844e1ba283ac93ef572c9))
* **release:** 🔖0.1.5 ([45d7731](https://github.com/2815261401/fastbuild/commit/45d77315600c82f49499a8e34d9110b0a67d2aca))
## [0.1.3](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2024-08-09)

### ✨ Features | 新功能

* ✨重新调整命令 ([c291b0b](https://github.com/2815261401/fastbuild/commit/c291b0b690a72843e953a3beb419a20bc904c486))

### 👷‍ Build System | 构建

* ⬆️更新依赖 ([acd2c5e](https://github.com/2815261401/fastbuild/commit/acd2c5e6792e26cfdf818b3960efc6a57ef2c861))
* 🔧更新eslint,prettier的配置 ([507480e](https://github.com/2815261401/fastbuild/commit/507480eaaadb3bd4c542c0cd18830a41d921d3f7))

### 🎫 Chores | 其他更新

* 💄通过eslint调整代码格式 ([d0910fa](https://github.com/2815261401/fastbuild/commit/d0910faa8a6d9b3da3cee468688932a8c75dbecd))
* 📝更新CHANGELOG ([f5a9813](https://github.com/2815261401/fastbuild/commit/f5a98134f6892336c6129ff9de5357a058ab032d))
* 🔨新增生成CHANGELOG的命令 ([3d32ee3](https://github.com/2815261401/fastbuild/commit/3d32ee3c4fa8b44dadaee8717e341dece65c64a3))
## [0.1.2](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2024-06-13)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复配置覆盖问题,支持配置默认值 ([b408880](https://github.com/2815261401/fastbuild/commit/b40888065877d5ed402d86a11e64ff51f52dd2d8))
## [0.1.1](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2024-06-13)

### ✨ Features | 新功能

* ✨新增配置项,支持配置生成的文件位置,文件所在工作区,工作区的模板根据下标进行隔离 ([3993c58](https://github.com/2815261401/fastbuild/commit/3993c58eddfe6d859526ba2563c475694ede35e1))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复关于vscode.git的报错 ([ee39dfd](https://github.com/2815261401/fastbuild/commit/ee39dfd946ad8cca6ba314ded4ec00520eb00c8f))
## [0.1.0](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2024-06-12)

### ⚠ BREAKING CHANGES

* 更改了模版的实现方式,历史方法不在支持

分支: master

### ✨ Features | 新功能

* ✨重新实现模版功能 ([1bc15ec](https://github.com/2815261401/fastbuild/commit/1bc15ec59acbd9940e2e2d77b49438e9dbe730a0))
## [0.0.14](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2024-05-17)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复设置缓存 ([2450977](https://github.com/2815261401/fastbuild/commit/24509772833f3d441cdee909f440a37b5f53bc9f))
## [0.0.13](https://github.com/2815261401/fastbuild/compare/0.2.1...0.2.2) (2024-05-17)

### ✨ Features | 新功能

* ✨新增快速执行命令的命令 ([1fad214](https://github.com/2815261401/fastbuild/commit/1fad2145ded1b3e080d3a025cda191d9dae21523))
* 自动添加配置到暂存区 ([ddfc1ae](https://github.com/2815261401/fastbuild/commit/ddfc1ae0448e480a21ca8f97521a6ea2f1abfcba))
* **commit:** :sparkles: 更新commit方式 ([18f1351](https://github.com/2815261401/fastbuild/commit/18f13513c9ceb76d85b888ae68eaa712687097c4))

### 🐛 Bug Fixes | Bug 修复

* 🐛调整获取参数的方法,防止缓存数据 ([701590d](https://github.com/2815261401/fastbuild/commit/701590d876992ce5300da2eeac4a581bd57aeaca))
* 🐛修复表情数据重复请求 ([e8276a8](https://github.com/2815261401/fastbuild/commit/e8276a81e45e4a3a15732d7a8b253d373c2e549c))
* 🐛修复未输入footer不带注脚 ([c8ead3d](https://github.com/2815261401/fastbuild/commit/c8ead3d15279b2066552ff7f790a62830ffcb3fd))
* 🐛修复commitlint.config.cjs文件丢失 ([f3d5475](https://github.com/2815261401/fastbuild/commit/f3d5475d6b45425380e513bc2a1c629a5ba0d8f4))
* 🔥移除无效命令 ([59a732e](https://github.com/2815261401/fastbuild/commit/59a732e0f25b25661139bef226fce7f0f2039f1d))

### 📝 Documentation |文档

* **README:** 💬移除部分描述 ([b23dfec](https://github.com/2815261401/fastbuild/commit/b23dfeccbef0e8335e34f2daabd38e6789f57ebd))

## [0.2.1](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2025-07-14)

### ⚠ BREAKING CHANGES

* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha

### ✨ Features | 新功能

* ✨添加是否更新 gitmoji 的选项 ([3b23a21](https://github.com/2815261401/fastbuild/commit/3b23a215daf750ceaa5f68705c2e9af0e158410d))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复tsconfig无法读取导致的错误 ([5934dce](https://github.com/2815261401/fastbuild/commit/5934dceccbb113ce44d94f8e2dda19a2ea9c5bf2))

### ♻️ Code Refactoring | 代码重构

* ♻️完成 保存为模板, 使用模板 的重构 ([7195e7d](https://github.com/2815261401/fastbuild/commit/7195e7d248478116b7e139a25e8bfd70d461d016))
* ♻️完成 快速执行命令 的重构 ([eaa7909](https://github.com/2815261401/fastbuild/commit/eaa7909265e4164f7b7a88b06558286478ef03ab))
* ♻️完成 约定式提交 的功能重构 ([6605688](https://github.com/2815261401/fastbuild/commit/66056888b668f8622f64758b922db23bf74c459c))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([1e1bf12](https://github.com/2815261401/fastbuild/commit/1e1bf12a819c4188ba795f2abdb88f4c14f77022))
* 🔥移除未使用的函数 ([60c4dbc](https://github.com/2815261401/fastbuild/commit/60c4dbce6eb5aedfcfb1be8896efa0f7168416ec))
* **release:** 🔖0.2.0 ([f7b7e5c](https://github.com/2815261401/fastbuild/commit/f7b7e5cf5c89ebef46590c845687718a261a539f))
## [0.1.8](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2025-06-04)

### ✨ Features | 新功能

* ✨修复自定义参数未聚焦, 支持在编辑器上下文显示命令 ([4cf0666](https://github.com/2815261401/fastbuild/commit/4cf066627de16315653938aa1cae8139b38f3990))

### 💄 Styles | 风格

* 🎨调整代码格式 ([d216f9d](https://github.com/2815261401/fastbuild/commit/d216f9d21c23d13e015b1824d9a74505f17e7181))

### 👷‍ Build System | 构建

* ♻️将 xe-utils 替换为 radashi ([57c5ae9](https://github.com/2815261401/fastbuild/commit/57c5ae9a8cda5ffd1f22c455ab20929a22aef222))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([10e02b0](https://github.com/2815261401/fastbuild/commit/10e02b0feabedf186f563e0f5e0f32972f152247))
* 📝修改插件名称, 订正文档 ([9205f65](https://github.com/2815261401/fastbuild/commit/9205f65e873efcd1c458ba0b5164b01ed6c5567a))
* **release:** 🔖0.1.8 ([0346ab5](https://github.com/2815261401/fastbuild/commit/0346ab529972b7f0a4df2562fd436b845f3c490c))
## [0.1.7](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2025-05-26)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 => 不是必填项无法继续下一步 ([f46836a](https://github.com/2815261401/fastbuild/commit/f46836a253621ae33d15561c3979a077bac4be9a))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.7 ([fb0c68b](https://github.com/2815261401/fastbuild/commit/fb0c68b960a85edf037d272fb722f43794b56061))
## [0.1.6](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2025-05-16)

### ✨ Features | 新功能

* ✨约定式提交返回上一步保留默认值 ([a280123](https://github.com/2815261401/fastbuild/commit/a28012321362efbf292872f9fba0dd73ab68f6a2))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.6 ([b796510](https://github.com/2815261401/fastbuild/commit/b796510a4bbd46f0426a146d5fa58d4205d46509))
## [0.1.5](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2025-05-15)

### ⚠ BREAKING CHANGES

* 模板正则调整匹配规则

分支: master

### ✨ Features | 新功能

* 🐛修复commit格式错误 ([9f15898](https://github.com/2815261401/fastbuild/commit/9f15898391115f0e7d5e2e9be5dc2495f2f58476))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复更新版本导致的打包错误 ([539c6f5](https://github.com/2815261401/fastbuild/commit/539c6f5e02a5a683b4f40b26f90c35e6e0048f87))
* 🐛修复工作区快速命令启动文件夹位置,修复上次使用步骤警告问题,添加快速命令终端上限 ([e8254bc](https://github.com/2815261401/fastbuild/commit/e8254bc1d1e656e97c96ac1abefbe5ee967cfe85))

### ♻️ Code Refactoring | 代码重构

* 🚨调整eslint配置, 配置文件采用esm格式, 重构模板相关模块 ([b20883f](https://github.com/2815261401/fastbuild/commit/b20883f33e73b139201e6de572ac70bac87df2ec))

### 🎫 Chores | 其他更新

* ✨使用 release-it 进行版本控制 ([0a1626e](https://github.com/2815261401/fastbuild/commit/0a1626eadd1e47a54d4fdb2a7462db225460d699))
* ⬆️更新依赖 ([633f361](https://github.com/2815261401/fastbuild/commit/633f361b9bb75a42d72844e1ba283ac93ef572c9))
* **release:** 🔖0.1.5 ([45d7731](https://github.com/2815261401/fastbuild/commit/45d77315600c82f49499a8e34d9110b0a67d2aca))
## [0.1.3](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2024-08-09)

### ✨ Features | 新功能

* ✨重新调整命令 ([c291b0b](https://github.com/2815261401/fastbuild/commit/c291b0b690a72843e953a3beb419a20bc904c486))

### 👷‍ Build System | 构建

* ⬆️更新依赖 ([acd2c5e](https://github.com/2815261401/fastbuild/commit/acd2c5e6792e26cfdf818b3960efc6a57ef2c861))
* 🔧更新eslint,prettier的配置 ([507480e](https://github.com/2815261401/fastbuild/commit/507480eaaadb3bd4c542c0cd18830a41d921d3f7))

### 🎫 Chores | 其他更新

* 💄通过eslint调整代码格式 ([d0910fa](https://github.com/2815261401/fastbuild/commit/d0910faa8a6d9b3da3cee468688932a8c75dbecd))
* 📝更新CHANGELOG ([f5a9813](https://github.com/2815261401/fastbuild/commit/f5a98134f6892336c6129ff9de5357a058ab032d))
* 🔨新增生成CHANGELOG的命令 ([3d32ee3](https://github.com/2815261401/fastbuild/commit/3d32ee3c4fa8b44dadaee8717e341dece65c64a3))
## [0.1.2](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2024-06-13)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复配置覆盖问题,支持配置默认值 ([b408880](https://github.com/2815261401/fastbuild/commit/b40888065877d5ed402d86a11e64ff51f52dd2d8))
## [0.1.1](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2024-06-13)

### ✨ Features | 新功能

* ✨新增配置项,支持配置生成的文件位置,文件所在工作区,工作区的模板根据下标进行隔离 ([3993c58](https://github.com/2815261401/fastbuild/commit/3993c58eddfe6d859526ba2563c475694ede35e1))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复关于vscode.git的报错 ([ee39dfd](https://github.com/2815261401/fastbuild/commit/ee39dfd946ad8cca6ba314ded4ec00520eb00c8f))
## [0.1.0](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2024-06-12)

### ⚠ BREAKING CHANGES

* 更改了模版的实现方式,历史方法不在支持

分支: master

### ✨ Features | 新功能

* ✨重新实现模版功能 ([1bc15ec](https://github.com/2815261401/fastbuild/commit/1bc15ec59acbd9940e2e2d77b49438e9dbe730a0))
## [0.0.14](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2024-05-17)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复设置缓存 ([2450977](https://github.com/2815261401/fastbuild/commit/24509772833f3d441cdee909f440a37b5f53bc9f))
## [0.0.13](https://github.com/2815261401/fastbuild/compare/0.2.0...0.2.1) (2024-05-17)

### ✨ Features | 新功能

* ✨新增快速执行命令的命令 ([1fad214](https://github.com/2815261401/fastbuild/commit/1fad2145ded1b3e080d3a025cda191d9dae21523))
* 自动添加配置到暂存区 ([ddfc1ae](https://github.com/2815261401/fastbuild/commit/ddfc1ae0448e480a21ca8f97521a6ea2f1abfcba))
* **commit:** :sparkles: 更新commit方式 ([18f1351](https://github.com/2815261401/fastbuild/commit/18f13513c9ceb76d85b888ae68eaa712687097c4))

### 🐛 Bug Fixes | Bug 修复

* 🐛调整获取参数的方法,防止缓存数据 ([701590d](https://github.com/2815261401/fastbuild/commit/701590d876992ce5300da2eeac4a581bd57aeaca))
* 🐛修复表情数据重复请求 ([e8276a8](https://github.com/2815261401/fastbuild/commit/e8276a81e45e4a3a15732d7a8b253d373c2e549c))
* 🐛修复未输入footer不带注脚 ([c8ead3d](https://github.com/2815261401/fastbuild/commit/c8ead3d15279b2066552ff7f790a62830ffcb3fd))
* 🐛修复commitlint.config.cjs文件丢失 ([f3d5475](https://github.com/2815261401/fastbuild/commit/f3d5475d6b45425380e513bc2a1c629a5ba0d8f4))
* 🔥移除无效命令 ([59a732e](https://github.com/2815261401/fastbuild/commit/59a732e0f25b25661139bef226fce7f0f2039f1d))

### 📝 Documentation |文档

* **README:** 💬移除部分描述 ([b23dfec](https://github.com/2815261401/fastbuild/commit/b23dfeccbef0e8335e34f2daabd38e6789f57ebd))

## [0.2.0](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2025-07-14)

### ⚠ BREAKING CHANGES

* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha
* 改变了配置的名称, 之前的配置失效

分支: alpha

### ♻️ Code Refactoring | 代码重构

* ♻️完成 保存为模板, 使用模板 的重构 ([7195e7d](https://github.com/2815261401/fastbuild/commit/7195e7d248478116b7e139a25e8bfd70d461d016))
* ♻️完成 快速执行命令 的重构 ([eaa7909](https://github.com/2815261401/fastbuild/commit/eaa7909265e4164f7b7a88b06558286478ef03ab))
* ♻️完成 约定式提交 的功能重构 ([6605688](https://github.com/2815261401/fastbuild/commit/66056888b668f8622f64758b922db23bf74c459c))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([1e1bf12](https://github.com/2815261401/fastbuild/commit/1e1bf12a819c4188ba795f2abdb88f4c14f77022))
## [0.1.8](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2025-06-04)

### ✨ Features | 新功能

* ✨修复自定义参数未聚焦, 支持在编辑器上下文显示命令 ([4cf0666](https://github.com/2815261401/fastbuild/commit/4cf066627de16315653938aa1cae8139b38f3990))

### 💄 Styles | 风格

* 🎨调整代码格式 ([d216f9d](https://github.com/2815261401/fastbuild/commit/d216f9d21c23d13e015b1824d9a74505f17e7181))

### 👷‍ Build System | 构建

* ♻️将 xe-utils 替换为 radashi ([57c5ae9](https://github.com/2815261401/fastbuild/commit/57c5ae9a8cda5ffd1f22c455ab20929a22aef222))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([10e02b0](https://github.com/2815261401/fastbuild/commit/10e02b0feabedf186f563e0f5e0f32972f152247))
* 📝修改插件名称, 订正文档 ([9205f65](https://github.com/2815261401/fastbuild/commit/9205f65e873efcd1c458ba0b5164b01ed6c5567a))
* **release:** 🔖0.1.8 ([0346ab5](https://github.com/2815261401/fastbuild/commit/0346ab529972b7f0a4df2562fd436b845f3c490c))
## [0.1.7](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2025-05-26)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 => 不是必填项无法继续下一步 ([f46836a](https://github.com/2815261401/fastbuild/commit/f46836a253621ae33d15561c3979a077bac4be9a))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.7 ([fb0c68b](https://github.com/2815261401/fastbuild/commit/fb0c68b960a85edf037d272fb722f43794b56061))
## [0.1.6](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2025-05-16)

### ✨ Features | 新功能

* ✨约定式提交返回上一步保留默认值 ([a280123](https://github.com/2815261401/fastbuild/commit/a28012321362efbf292872f9fba0dd73ab68f6a2))

### 🎫 Chores | 其他更新

* **release:** 🔖0.1.6 ([b796510](https://github.com/2815261401/fastbuild/commit/b796510a4bbd46f0426a146d5fa58d4205d46509))
## [0.1.5](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2025-05-15)

### ⚠ BREAKING CHANGES

* 模板正则调整匹配规则

分支: master

### ✨ Features | 新功能

* 🐛修复commit格式错误 ([9f15898](https://github.com/2815261401/fastbuild/commit/9f15898391115f0e7d5e2e9be5dc2495f2f58476))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复更新版本导致的打包错误 ([539c6f5](https://github.com/2815261401/fastbuild/commit/539c6f5e02a5a683b4f40b26f90c35e6e0048f87))
* 🐛修复工作区快速命令启动文件夹位置,修复上次使用步骤警告问题,添加快速命令终端上限 ([e8254bc](https://github.com/2815261401/fastbuild/commit/e8254bc1d1e656e97c96ac1abefbe5ee967cfe85))

### ♻️ Code Refactoring | 代码重构

* 🚨调整eslint配置, 配置文件采用esm格式, 重构模板相关模块 ([b20883f](https://github.com/2815261401/fastbuild/commit/b20883f33e73b139201e6de572ac70bac87df2ec))

### 🎫 Chores | 其他更新

* ✨使用 release-it 进行版本控制 ([0a1626e](https://github.com/2815261401/fastbuild/commit/0a1626eadd1e47a54d4fdb2a7462db225460d699))
* ⬆️更新依赖 ([633f361](https://github.com/2815261401/fastbuild/commit/633f361b9bb75a42d72844e1ba283ac93ef572c9))
* **release:** 🔖0.1.5 ([45d7731](https://github.com/2815261401/fastbuild/commit/45d77315600c82f49499a8e34d9110b0a67d2aca))
## [0.1.3](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2024-08-09)

### ✨ Features | 新功能

* ✨重新调整命令 ([c291b0b](https://github.com/2815261401/fastbuild/commit/c291b0b690a72843e953a3beb419a20bc904c486))

### 👷‍ Build System | 构建

* ⬆️更新依赖 ([acd2c5e](https://github.com/2815261401/fastbuild/commit/acd2c5e6792e26cfdf818b3960efc6a57ef2c861))
* 🔧更新eslint,prettier的配置 ([507480e](https://github.com/2815261401/fastbuild/commit/507480eaaadb3bd4c542c0cd18830a41d921d3f7))

### 🎫 Chores | 其他更新

* 💄通过eslint调整代码格式 ([d0910fa](https://github.com/2815261401/fastbuild/commit/d0910faa8a6d9b3da3cee468688932a8c75dbecd))
* 📝更新CHANGELOG ([f5a9813](https://github.com/2815261401/fastbuild/commit/f5a98134f6892336c6129ff9de5357a058ab032d))
* 🔨新增生成CHANGELOG的命令 ([3d32ee3](https://github.com/2815261401/fastbuild/commit/3d32ee3c4fa8b44dadaee8717e341dece65c64a3))
## [0.1.2](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2024-06-13)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复配置覆盖问题,支持配置默认值 ([b408880](https://github.com/2815261401/fastbuild/commit/b40888065877d5ed402d86a11e64ff51f52dd2d8))
## [0.1.1](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2024-06-13)

### ✨ Features | 新功能

* ✨新增配置项,支持配置生成的文件位置,文件所在工作区,工作区的模板根据下标进行隔离 ([3993c58](https://github.com/2815261401/fastbuild/commit/3993c58eddfe6d859526ba2563c475694ede35e1))

### 🐛 Bug Fixes | Bug 修复

* 🐛修复关于vscode.git的报错 ([ee39dfd](https://github.com/2815261401/fastbuild/commit/ee39dfd946ad8cca6ba314ded4ec00520eb00c8f))
## [0.1.0](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2024-06-12)

### ⚠ BREAKING CHANGES

* 更改了模版的实现方式,历史方法不在支持

分支: master

### ✨ Features | 新功能

* ✨重新实现模版功能 ([1bc15ec](https://github.com/2815261401/fastbuild/commit/1bc15ec59acbd9940e2e2d77b49438e9dbe730a0))
## [0.0.14](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2024-05-17)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复设置缓存 ([2450977](https://github.com/2815261401/fastbuild/commit/24509772833f3d441cdee909f440a37b5f53bc9f))
## [0.0.13](https://github.com/2815261401/fastbuild/compare/v0.1.8...0.2.0) (2024-05-17)

### ✨ Features | 新功能

* ✨新增快速执行命令的命令 ([1fad214](https://github.com/2815261401/fastbuild/commit/1fad2145ded1b3e080d3a025cda191d9dae21523))
* 自动添加配置到暂存区 ([ddfc1ae](https://github.com/2815261401/fastbuild/commit/ddfc1ae0448e480a21ca8f97521a6ea2f1abfcba))
* **commit:** :sparkles: 更新commit方式 ([18f1351](https://github.com/2815261401/fastbuild/commit/18f13513c9ceb76d85b888ae68eaa712687097c4))

### 🐛 Bug Fixes | Bug 修复

* 🐛调整获取参数的方法,防止缓存数据 ([701590d](https://github.com/2815261401/fastbuild/commit/701590d876992ce5300da2eeac4a581bd57aeaca))
* 🐛修复表情数据重复请求 ([e8276a8](https://github.com/2815261401/fastbuild/commit/e8276a81e45e4a3a15732d7a8b253d373c2e549c))
* 🐛修复未输入footer不带注脚 ([c8ead3d](https://github.com/2815261401/fastbuild/commit/c8ead3d15279b2066552ff7f790a62830ffcb3fd))
* 🐛修复commitlint.config.cjs文件丢失 ([f3d5475](https://github.com/2815261401/fastbuild/commit/f3d5475d6b45425380e513bc2a1c629a5ba0d8f4))
* 🔥移除无效命令 ([59a732e](https://github.com/2815261401/fastbuild/commit/59a732e0f25b25661139bef226fce7f0f2039f1d))

### 📝 Documentation |文档

* **README:** 💬移除部分描述 ([b23dfec](https://github.com/2815261401/fastbuild/commit/b23dfeccbef0e8335e34f2daabd38e6789f57ebd))

## [0.1.8](https://github.com/2815261401/fastbuild/compare/v0.1.7...v0.1.8) (2025-06-04)

### ✨ Features | 新功能

* ✨修复自定义参数未聚焦, 支持在编辑器上下文显示命令 ([4cf0666](https://github.com/2815261401/fastbuild/commit/4cf066627de16315653938aa1cae8139b38f3990))

### 🎫 Chores | 其他更新

* ⬆️更新依赖 ([10e02b0](https://github.com/2815261401/fastbuild/commit/10e02b0feabedf186f563e0f5e0f32972f152247))
* 📝修改插件名称, 订正文档 ([9205f65](https://github.com/2815261401/fastbuild/commit/9205f65e873efcd1c458ba0b5164b01ed6c5567a))

### 💄 Styles | 风格

* 🎨调整代码格式 ([d216f9d](https://github.com/2815261401/fastbuild/commit/d216f9d21c23d13e015b1824d9a74505f17e7181))

### 👷‍ Build System | 构建

* ♻️将 xe-utils 替换为 radashi ([57c5ae9](https://github.com/2815261401/fastbuild/commit/57c5ae9a8cda5ffd1f22c455ab20929a22aef222))

## [0.1.7](https://github.com/2815261401/fastbuild/compare/v0.1.6...v0.1.7) (2025-05-26)

### 🐛 Bug Fixes | Bug 修复

* 🐛修复 => 不是必填项无法继续下一步 ([f46836a](https://github.com/2815261401/fastbuild/commit/f46836a253621ae33d15561c3979a077bac4be9a))

## [0.1.6](https://github.com/2815261401/fastbuild/compare/v0.1.5...v0.1.6) (2025-05-16)

### ✨ Features | 新功能

* ✨约定式提交返回上一步保留默认值 ([a280123](https://github.com/2815261401/fastbuild/commit/a28012321362efbf292872f9fba0dd73ab68f6a2))

## [0.1.5](https://github.com/2815261401/fastbuild/compare/v0.1.4...v0.1.5) (2025-05-15)

### ⚠ BREAKING CHANGES

* 模板正则调整匹配规则

分支: master

### 🎫 Chores | 其他更新

* ✨使用 release-it 进行版本控制 ([0a1626e](https://github.com/2815261401/fastbuild/commit/0a1626eadd1e47a54d4fdb2a7462db225460d699))

### ♻️ Code Refactoring | 代码重构

* 🚨调整eslint配置, 配置文件采用esm格式, 重构模板相关模块 ([b20883f](https://github.com/2815261401/fastbuild/commit/b20883f33e73b139201e6de572ac70bac87df2ec))

## <small>0.1.4 (2024-09-12)</small>

- feat: 🐛修复commit格式错误 ([9f15898](https://github.com/2815261401/fastbuild/commit/9f15898))
- fix: 🐛修复更新版本导致的打包错误 ([539c6f5](https://github.com/2815261401/fastbuild/commit/539c6f5))
- fix: 🐛修复工作区快速命令启动文件夹位置,修复上次使用步骤警告问题,添加快速命令终端上限 ([e8254bc](https://github.com/2815261401/fastbuild/commit/e8254bc))

## <small>0.1.3 (2024-08-09)</small>

- feat: ✨重新调整命令 ([c291b0b](https://github.com/2815261401/fastbuild/commit/c291b0b))

## <small>0.1.2 (2024-06-13)</small>

- 0.1.2 ([733a1c9](https://github.com/2815261401/fastbuild/commit/733a1c9))
- fix: 🐛修复配置覆盖问题,支持配置默认值 ([b408880](https://github.com/2815261401/fastbuild/commit/b408880))

## <small>0.1.1 (2024-06-13)</small>

- 0.1.1 ([93c8a78](https://github.com/2815261401/fastbuild/commit/93c8a78))
- feat: ✨新增配置项,支持配置生成的文件位置,文件所在工作区,工作区的模板根据下标进行隔离 ([3993c58](https://github.com/2815261401/fastbuild/commit/3993c58))
- fix: 🐛修复关于vscode.git的报错 ([ee39dfd](https://github.com/2815261401/fastbuild/commit/ee39dfd))

## 0.1.0 (2024-06-12)

- 0.1.0 ([ece0afe](https://github.com/2815261401/fastbuild/commit/ece0afe))
- feat: ✨重新实现模版功能 ([1bc15ec](https://github.com/2815261401/fastbuild/commit/1bc15ec))

### BREAKING CHANGE

- 更改了模版的实现方式,历史方法不在支持

分支: master

## <small>0.0.14 (2024-05-17)</small>

- 0.0.14 ([9fcf356](https://github.com/2815261401/fastbuild/commit/9fcf356))
- fix: 🐛修复设置缓存 ([2450977](https://github.com/2815261401/fastbuild/commit/2450977))

## <small>0.0.13 (2024-05-17)</small>

- :lipstick: style: 移除无用的类型引入 ([2fe922e](https://github.com/2815261401/fastbuild/commit/2fe922e))
- :sparkles: feat: 调整cz-config的配置数据,新增格式配置方法 ([51fcf2e](https://github.com/2815261401/fastbuild/commit/51fcf2e))
- ♻️ refactor: 逻辑优化,减少重复代码量 ([183a8fc](https://github.com/2815261401/fastbuild/commit/183a8fc))
- ✨ feat: 新增cz-customizable提交功能 ([da80ada](https://github.com/2815261401/fastbuild/commit/da80ada))
- ✨ feat: 修复读取模板配置文件的错误。 新增创建gitCommit的配置文件。 修复取消提交仍继续执行的bug。 从命令模板移除部分命令。 ([0c59115](https://github.com/2815261401/fastbuild/commit/0c59115))
- ✨ feat: 原有功能保持,大部分更改 ([ec70e0c](https://github.com/2815261401/fastbuild/commit/ec70e0c))
- 🎉 begin(init): 通过yo创建项目,支持webpack打包,包管理器为pnpm ([b85e7ad](https://github.com/2815261401/fastbuild/commit/b85e7ad))
- 🐛 fix: 修复读取配置报错的bug ([bff3116](https://github.com/2815261401/fastbuild/commit/bff3116))
- 🐛 fix: 修复读取配置文件出现的路径错误 ([ba6bea0](https://github.com/2815261401/fastbuild/commit/ba6bea0))
- 🐛 fix: 修复读取配置文件出现的路径错误 ([b75f853](https://github.com/2815261401/fastbuild/commit/b75f853))
- 0.0.13 ([8f82af6](https://github.com/2815261401/fastbuild/commit/8f82af6))
- 1 ([2bc89c7](https://github.com/2815261401/fastbuild/commit/2bc89c7))
- 1 ([f611e07](https://github.com/2815261401/fastbuild/commit/f611e07))
- 1 ([7f14f6a](https://github.com/2815261401/fastbuild/commit/7f14f6a))
- 备份 ([8c1bad6](https://github.com/2815261401/fastbuild/commit/8c1bad6))
- 变更记录更新 ([3477862](https://github.com/2815261401/fastbuild/commit/3477862))
- 初始化项目 ([de5344b](https://github.com/2815261401/fastbuild/commit/de5344b))
- 创建模板文件开发完成 ([fa63644](https://github.com/2815261401/fastbuild/commit/fa63644))
- 创建文件 ([b1e2081](https://github.com/2815261401/fastbuild/commit/b1e2081))
- 大量修改 ([89f71c9](https://github.com/2815261401/fastbuild/commit/89f71c9))
- 代码大修 ([02875d1](https://github.com/2815261401/fastbuild/commit/02875d1))
- 代码更新 ([202f158](https://github.com/2815261401/fastbuild/commit/202f158))
- 代码重写,优化性能 ([a17f698](https://github.com/2815261401/fastbuild/commit/a17f698))
- 改变代码格式规则 ([b604960](https://github.com/2815261401/fastbuild/commit/b604960))
- 更新 ([1591aaa](https://github.com/2815261401/fastbuild/commit/1591aaa))
- 更新信息 ([60fce2c](https://github.com/2815261401/fastbuild/commit/60fce2c))
- 更新至0.0.2 ([31ff6a5](https://github.com/2815261401/fastbuild/commit/31ff6a5))
- 忽略安装包 ([8e3cba0](https://github.com/2815261401/fastbuild/commit/8e3cba0))
- 精简读写.gitignore的代码,新增getAll支持多类型返回值 ([ea0f932](https://github.com/2815261401/fastbuild/commit/ea0f932))
- 模板名称自定义 ([b4ebc6a](https://github.com/2815261401/fastbuild/commit/b4ebc6a))
- 模板文件修改 ([37bcd47](https://github.com/2815261401/fastbuild/commit/37bcd47))
- 判断允许修改文件 ([84c214e](https://github.com/2815261401/fastbuild/commit/84c214e))
- 生成文件后,自动打开 ([d685928](https://github.com/2815261401/fastbuild/commit/d685928))
- 首次创建配置文件,.config.template`fileTemplate添加.gitignore ([3c36773](https://github.com/2815261401/fastbuild/commit/3c36773))
- 提交,修改 ([121261b](https://github.com/2815261401/fastbuild/commit/121261b))
- 完成自定义名称 ([e05bed8](https://github.com/2815261401/fastbuild/commit/e05bed8))
- 新增.prettierrc ([056533d](https://github.com/2815261401/fastbuild/commit/056533d))
- 新增创建模板功能 ([3b4b65f](https://github.com/2815261401/fastbuild/commit/3b4b65f))
- 新增模板实体template到自定义占位符中使用 ([bea4984](https://github.com/2815261401/fastbuild/commit/bea4984))
- 新增设置 ([5f45ae3](https://github.com/2815261401/fastbuild/commit/5f45ae3))
- 新增文档 ([5293c1e](https://github.com/2815261401/fastbuild/commit/5293c1e))
- 新增prettier ([c208cf8](https://github.com/2815261401/fastbuild/commit/c208cf8))
- 修复生成文件模板报错 ([0cd4df3](https://github.com/2815261401/fastbuild/commit/0cd4df3))
- 修复无法创建文件夹的问题 ([c5fa127](https://github.com/2815261401/fastbuild/commit/c5fa127))
- 修改版本号 ([552ef8c](https://github.com/2815261401/fastbuild/commit/552ef8c))
- 修改更新日志和README ([5cbb9c6](https://github.com/2815261401/fastbuild/commit/5cbb9c6))
- 修改描述 ([e07a8c2](https://github.com/2815261401/fastbuild/commit/e07a8c2))
- 修改默认配置文件 ([0350abc](https://github.com/2815261401/fastbuild/commit/0350abc))
- 修改README ([0916193](https://github.com/2815261401/fastbuild/commit/0916193))
- 语法高亮支持,语法片段 ([36aae82](https://github.com/2815261401/fastbuild/commit/36aae82))
- 支持.config.template语法高亮 ([10c9775](https://github.com/2815261401/fastbuild/commit/10c9775))
- Bump ip from 2.0.0 to 2.0.1 ([0d18238](https://github.com/2815261401/fastbuild/commit/0d18238))
- config.template 更名为 .config.template ([38aaab5](https://github.com/2815261401/fastbuild/commit/38aaab5))
- eslint,prettierrc,规则合并 ([528f142](https://github.com/2815261401/fastbuild/commit/528f142))
- fix: 🐛调整获取参数的方法,防止缓存数据 ([701590d](https://github.com/2815261401/fastbuild/commit/701590d))
- fix: 🐛修复表情数据重复请求 ([e8276a8](https://github.com/2815261401/fastbuild/commit/e8276a8))
- fix: 🐛修复未输入footer不带注脚 ([c8ead3d](https://github.com/2815261401/fastbuild/commit/c8ead3d))
- fix: 🐛修复commitlint.config.cjs文件丢失 ([f3d5475](https://github.com/2815261401/fastbuild/commit/f3d5475))
- fix: 🔥移除无效命令 ([59a732e](https://github.com/2815261401/fastbuild/commit/59a732e))
- feat: ✨新增快速执行命令的命令 ([1fad214](https://github.com/2815261401/fastbuild/commit/1fad214))
- feat: 自动添加配置到暂存区 ([ddfc1ae](https://github.com/2815261401/fastbuild/commit/ddfc1ae))
- feat(commit): :sparkles: 更新commit方式 ([18f1351](https://github.com/2815261401/fastbuild/commit/18f1351))
- docs(README): 💬移除部分描述 ([b23dfec](https://github.com/2815261401/fastbuild/commit/b23dfec))

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
