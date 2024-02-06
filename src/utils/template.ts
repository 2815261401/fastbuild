import { existsSync, statSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { FileType, Uri, window, workspace } from 'vscode';
import each from 'xe-utils/each';
import entries from 'xe-utils/entries';
import filter from 'xe-utils/filter';
import isRegExp from 'xe-utils/isRegExp';
import map from 'xe-utils/map';
import merge from 'xe-utils/merge';
import omit from 'xe-utils/omit';
import some from 'xe-utils/some';
import { configuration, conversion, logs, placeholder, placeholderFn } from './config';
import { catchError, formatStr } from './tool';

interface templateConfig {
  name: string;
  folderTemplates: Record<string, string>;
  stringTemplates: Record<string, string>;
  placeholder: Record<string, placeholderFn>;
  conversion: Record<string, (content: string) => string>;
  exclude: (RegExp | string)[];
  overwrite: boolean;
  ignoreDefaultPlaceholder: boolean | string[];
  ignoreDefaultConversion: boolean | string[];
}

export class TemplateConfig {
  name: string = '默认模板';
  /** 工作区文件夹 */
  workspaceFolderUri!: Uri;
  /** 模板文件夹 */
  folderTemplates: Record<string, string> = {};
  /** 转化字符串模板 */
  stringTemplates: Record<string, string> = {};
  /** 占位符 */
  placeholder: Record<string, placeholderFn> = {};
  conversion: Record<string, (content: string) => string> = {};
  /** 忽略配置 */
  exclude: (RegExp | string)[] = [];
  /** 强制覆盖 */
  overwrite = false;
  constructor(workspaceFolderUri: Uri, config?: templateConfig) {
    this.workspaceFolderUri = workspaceFolderUri;
    if (config) {
      this.name = config.name;
      this.folderTemplates = config.folderTemplates;
      this.stringTemplates = config.stringTemplates;
      this.exclude = config.exclude;
      this.overwrite = config.overwrite;
      if (config.ignoreDefaultPlaceholder === true) {
        this.placeholder = config.placeholder;
      } else if (config.ignoreDefaultPlaceholder === false) {
        this.placeholder = merge(placeholder, config.placeholder);
      } else {
        this.placeholder = merge(omit(placeholder, config.ignoreDefaultPlaceholder), config.placeholder);
      }
      if (config.ignoreDefaultConversion === true) {
        this.conversion = config.conversion;
      } else if (config.ignoreDefaultConversion === false) {
        this.conversion = merge(conversion, config.conversion);
      } else {
        this.conversion = merge(omit(conversion, config.ignoreDefaultConversion), config.conversion);
      }
    }
  }
  /** 获取模板文件夹 */
  getTemplates(content: [string, FileType][], folderPath: string) {
    return map(
      /** 根据配置忽略 */
      filter(content, ([name]) => {
        if (this.exclude.length) {
          return some(this.exclude, (v) => {
            if (isRegExp(v)) {
              return !v.test(name);
            }
            return v !== name;
          });
        }
        return true;
      }),
      ([name, fileType]) => new TemplateItem(join(folderPath, name), fileType)
    );
  }
}
/** 读取配置文件 */
export const readTemplateConfig = async () => {
  try {
    /** 当前配置文件字符串内容,以达到实时更新 */
    const conent = await workspace.fs.readFile(configuration.configFileUri);
    /** 将字符串转换为变量 */
    const config: templateConfig | templateConfig[] = eval(conent.toString());
    if (Array.isArray(config)) {
      return map(config, (v) => new TemplateConfig(configuration.workspaceFolder.uri, v));
    }
    return [new TemplateConfig(configuration.workspaceFolder.uri, config)];
  } catch (error) {
    return catchError(error);
  }
};

export class TemplateItem {
  /** 别名 */
  alias!: string;
  /** 文件(夹)名 */
  name!: string;
  /** 文件类型 */
  fileType!: FileType;
  /** 路径 */
  path!: string;
  constructor(path: string, fileType: FileType, alias?: string) {
    this.name = parse(path).base;
    this.path = path;
    this.fileType = fileType;
    if (alias) {
      this.alias = alias;
    } else {
      this.alias = this.name;
    }
  }
}

/**
 * 选择模板
 * @param config 配置数据
 * @param layer 当前层级
 * @param templatesList 文件夹内模板
 * @param selectTemplateItem 每层文件夹选择的模板
 * @returns 选择的模板数据
 */
export const selectTemplate = async (
  config: TemplateConfig,
  layer: number = 0,
  templatesList: TemplateItem[][] = [],
  selectTemplateItem: TemplateItem[] = []
): Promise<TemplateItem | null> => {
  try {
    /** 如果是第一次 */
    if (!layer) {
      /** 读取配置获取数据 */
      templatesList.push(
        map(
          filter(entries(config.folderTemplates), ([path]) => existsSync(join(config.workspaceFolderUri.fsPath, path))),
          ([path, alias]) => {
            const fullPath = join(config.workspaceFolderUri.fsPath, path);
            const stat = statSync(fullPath);
            return new TemplateItem(
              path,
              stat.isFile() ? FileType.File : stat.isDirectory() ? FileType.Directory : FileType.Unknown,
              alias
            );
          }
        )
      );
    }
    /** 获取当前层级的数据 */
    const templateList = templatesList[layer];
    let select: TemplateItem;
    /** 如果只有一个可选项,自动选择第一个 */
    if (templateList.length === 1) {
      select = templateList[0];
    } else {
      /** 否则让用户选择 */
      const selectItem = await window.showQuickPick(
        map(templateList, (value) => {
          let type = '';
          if (value.fileType === 1) {
            type = '(文 件) - ';
          } else if (value.fileType === 2) {
            type = '(文件夹) - ';
          }
          return {
            label: value.alias,
            description: `${type}${
              configuration.showPath ? value.path.replace('\\', configuration.delimiter) : value.name
            }`,
            value,
          };
        })
      );
      if (selectItem) {
        select = selectItem.value;
      } else {
        if (configuration.ESCBack) {
          /** 配置了ESC返回上一级 */
          return selectTemplate(config, layer - 1, templatesList, selectTemplateItem);
        }
        return null;
      }
    }
    /** 如果是文件,直接返回 */
    if (select.fileType === FileType.File) {
      return select;
    } else if (select.fileType === FileType.Directory) {
      /** 如果是文件夹,读取文件夹内容 */
      const content = await workspace.fs.readDirectory(Uri.joinPath(config.workspaceFolderUri, select.path));
      /** 过滤并转换格式 */
      const nextTemplateList = config.getTemplates(content, select.path);
      /** 在下一层可以选择当前文件夹 */
      const defaultTemplateItem = [new TemplateItem('', FileType.Unknown, '当前文件夹')];
      /** 如果当前层级不只一个可选,允许下一层返回上一级 */
      if (templateList.length > 1) {
        defaultTemplateItem.unshift(new TemplateItem('', FileType.Unknown, '上一级'));
      }
      return selectTemplate(
        config,
        layer + 1,
        templatesList.concat([defaultTemplateItem.concat(nextTemplateList)]),
        selectTemplateItem.concat([select])
      );
    } else if (select.fileType === FileType.Unknown) {
      /** 如果是特殊类型 */
      if (select.alias === '上一级') {
        /** 选择的上一级则返回上一级 */
        return selectTemplate(config, layer - 1, templatesList, selectTemplateItem);
      } else if (select.alias === '当前文件夹') {
        /** 选择的当前文件夹则返回当前文件夹 */
        return selectTemplateItem[layer - 1];
      }
    }
    return null;
  } catch (error) {
    return catchError(error);
  }
};

export const createFromTemplate = async (
  config: TemplateConfig,
  templateItem: TemplateItem,
  folderTemplateItem: TemplateItem[] = []
) => {
  try {
    /** 获取模板位置 */
    const templateUri = Uri.joinPath(config.workspaceFolderUri, templateItem.path);
    /** 如果模板存在 */
    if (existsSync(templateUri.fsPath)) {
      /** 格式化模板名称 */
      templateItem.name = formatStr(templateItem.name, {
        placeholder: config.placeholder,
        contextCb() {
          /** 获取目标文件夹路径 */
          const targetPath = configuration.targetUri.fsPath;
          /** 获取文件路径 */
          const filePath = join(targetPath, ...map(folderTemplateItem, ({ name }) => name), templateItem.name);
          /** 获取文件元数据 */
          const file = parse(filePath);
          /** 获取文件的父级文件夹路径 */
          const folderPath = dirname(filePath);
          return {
            targetPath,
            targetName: parse(targetPath).name,
            filePath,
            fileName: file.name,
            fileBase: file.base,
            fileExt: file.ext,
            folderPath,
            folderName: parse(folderPath).name,
          };
        },
        conversion: config.conversion,
      });
      /** 获取完整层级数据 */
      const layerTemplateList = folderTemplateItem.concat([templateItem]);
      /** 转换为文件(夹)生成的路径 */
      const targetPath = map(layerTemplateList, ({ name }) => name).join('\\');
      /** 获取生成的目标位置 */
      const targetUri = Uri.joinPath(configuration.targetUri, targetPath);
      if (templateItem.fileType === FileType.File) {
        /** 如果文件已存在,并且不允许覆盖 */
        if (existsSync(targetUri.fsPath) && !config.overwrite) {
          /** 询问用户是否覆盖 */
          const value = await window.showWarningMessage(`文件${targetPath}已存在,是否覆盖!`, '是', '否');
          if (value === '否') {
            logs.appendLine(`取消覆盖文件${targetUri.fsPath}`);
            return;
          }
        }
        /** 读取文件内容 */
        const content = await workspace.fs.readFile(templateUri);
        /** 对内容格式化 */
        const formatContent = formatStr(content.toString(), {
          placeholder: config.placeholder,
          contextCb() {
            const targetPath = configuration.targetUri.fsPath;
            /** 获取文件路径 */
            const filePath = join(targetPath, templateItem.path);
            /** 获取文件元数据 */
            const file = parse(filePath);
            /** 获取文件的父级文件夹路径 */
            const folderPath = dirname(filePath);
            return {
              targetPath,
              targetName: parse(targetPath).name,
              filePath,
              fileName: file.name,
              fileBase: file.base,
              fileExt: file.ext,
              folderPath,
              folderName: parse(folderPath).name,
            };
          },
          stringTemplates: config.stringTemplates,
          conversion: config.conversion,
        });
        /** 在指定位置写入内容 */
        workspace.fs.writeFile(targetUri, Uint8Array.from(Buffer.from(formatContent, 'utf8')));
      } else if (templateItem.fileType === FileType.Directory) {
        /** 如果是文件夹,读取模板内容 */
        const content = await workspace.fs.readDirectory(templateUri);
        /** 如果文件夹存在内容,创建文件夹 */
        if (content.length) {
          workspace.fs.createDirectory(targetUri);
        } else {
          logs.appendLine(`文件夹(${templateItem.path})内不存在模板,将不会生成`);
        }
        each(config.getTemplates(content, templateItem.path), async (item) => {
          await createFromTemplate(config, item, layerTemplateList);
        });
      }
    } else {
      throw `模板${templateItem.path}不存在`;
    }
  } catch (error) {
    return catchError(error);
  }
};
