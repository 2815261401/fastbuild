module.exports = [
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
