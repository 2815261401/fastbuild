import { dirname, join, parse } from 'path';
import { FileType, Uri, window, workspace } from 'vscode';
import each from 'xe-utils/each';
import filter from 'xe-utils/filter';
import isRegExp from 'xe-utils/isRegExp';
import map from 'xe-utils/map';
import some from 'xe-utils/some';
import { TemplateConfig, configuration } from './config';
import { existsSync } from 'fs';
import findKey from 'xe-utils/findKey';
import keys from 'xe-utils/keys';

interface template {
  alias: string;
  name: string;
  all: boolean;
  fileType: FileType;
  path: string;
  templateRoot: Uri;
}
export class Template implements template {
  /** 别名 */
  alias!: string;
  /** 文件(文件夹)名 */
  name!: string;
  /** 是否当前文件夹 */
  all!: boolean;
  /** 文件类型 */
  fileType!: FileType;
  /** 相对templateRoot路径 */
  path!: string;
  /** 根目录 */
  templateRoot!: Uri;
  /** 路径是否存在 */
  get exist() {
    return existsSync(join(this.templateRoot.fsPath, this.path));
  }
  get templateUri() {
    return Uri.joinPath(this.templateRoot, this.path);
  }
  constructor(alias: string, name: string, all: boolean, fileType: FileType, path: string, templateRoot: Uri);
  constructor(template: template);
  constructor(
    alias: string | template,
    name?: string,
    all?: boolean,
    fileType?: FileType,
    path?: string,
    templateRoot?: Uri
  ) {
    if (typeof alias === 'string') {
      this.alias = alias;
    } else {
      this.alias = alias.alias;
      this.name = alias.name;
      this.all = alias.all;
      this.fileType = alias.fileType;
      this.path = alias.path;
      this.templateRoot = alias.templateRoot;
    }
    if (name !== void 0) {
      this.name = name;
    }
    if (all !== void 0) {
      this.all = all;
    }
    if (fileType !== void 0) {
      this.fileType = fileType;
    }
    if (path !== void 0) {
      this.path = path;
    }
    if (templateRoot !== void 0) {
      this.templateRoot = templateRoot;
    }
  }
}
/**
 * 读取用户选择模板
 * @param templates 每层文件夹的内容
 * @param config 用户的配置
 * @param layer 当前的层级
 * @param selectIndex 当前选择的文件(文件夹)
 * @returns
 */
export const readTemplate = (
  templates: Template[][],
  config: TemplateConfig,
  layer: number = 0,
  selectIndex: number[] = []
): Promise<Template | null> => {
  return catchError(async () => {
    /** 获取当前层级的数据 */
    const nowTemplates = templates[layer];
    /** 设置默认选择第一个 */
    let index = 0;
    /** 如果只有一个可选项,自动选择 */
    if (nowTemplates.length === 1) {
      index = 0;
    } else {
      /** 否则让用户选择 */
      const selectItem = await window.showQuickPick(
        nowTemplates.map((value, index) => {
          let type = '';
          if (value.fileType === 1) {
            type = '(文 件) - ';
          } else if (value.fileType === 2) {
            type = '(文件夹) - ';
          }
          return {
            label: value.alias,
            description: `${type}${
              configuration.showPath ? value.path.replace('/', configuration.delimiter) : value.name
            }`,
            index,
          };
        }),
        {
          placeHolder: '请选择模板文件夹',
          ignoreFocusOut: true,
          matchOnDescription: true,
          matchOnDetail: true,
        }
      );
      /** 如果用户取消选择 */
      if (!selectItem) {
        index = configuration.ESCBack
          ? findKey(nowTemplates, (v) => v.name === '' && v.alias === '上一级' && v.fileType === FileType.Unknown)
          : -1;
      } else {
        /** 否则赋值用户选择的下标 */
        index = selectItem.index;
      }
    }
    /** 获取选择的数据 */
    const select = nowTemplates[index];
    /** 如果选择的数据不存在,返回空值 */
    if (!select) {
      return null;
    }
    /** 如果all为true,说明选择的是当前文件夹 */
    if (select.all) {
      return select;
    } else if (select.name === '' && select.alias === '上一级' && select.fileType === FileType.Unknown) {
      /** 如果选择了上一级,执行上一级的方法 */
      return readTemplate(templates, config, layer - 1, selectIndex);
    }
    /** 获取文件(文件夹)的元数据 */
    const stat = await workspace.fs.stat(select.templateUri);
    /** 如果是文件,直接返回 */
    if (stat.type === 1) {
      return select;
    } else if (stat.type === 2) {
      /** 如果是文件夹,读取文件夹内容 */
      const content = await workspace.fs.readDirectory(select.templateUri);
      /** 在下一层可以选择当前文件夹 */
      const defaultTemplates = [new Template({ ...select, all: true, alias: '当前文件夹' })];
      /** 如果当前层级不只一个可选,允许返回上一级,否则自动选择当前文件夹 */
      if (nowTemplates.length > 1) {
        defaultTemplates.unshift(new Template('上一级', '', false, FileType.Unknown, '', select.templateRoot));
      }
      /** 执行文件夹内容选择的方法 */
      return readTemplate(
        templates.slice(0, layer + 1).concat([
          filter(
            defaultTemplates.concat(
              map(
                content,
                ([name, fileType]) =>
                  new Template(name, name, false, fileType, join(select.path, name), select.templateRoot)
              )
            ),
            ({ name }) => {
              if (config.exclude.length) {
                return some(config.exclude, (v) => {
                  if (isRegExp(v)) {
                    return !v.test(name);
                  }
                  return v !== name;
                });
              }
              return true;
            }
          ),
        ]),
        config,
        layer + 1,
        selectIndex.concat([index])
      );
    }
    return null;
  });
  // if (selectIndex[layer] !== void 0) {
  // }
};

/**
 * 生成模板文件(文件夹)
 * @param resource 在当前文件夹内生成
 * @param template 选择的模板
 * @param config 用户配置
 * @param fPath 父级目录
 */
export const writeTemplate = (resource: Uri, template: Template, config: TemplateConfig, folder = '') => {
  return catchError(async () => {
    /** 格式化文件(文件夹)的名称 */
    const targetPath = join(folder, format(template.name, config, join(folder, template.name), resource.fsPath));
    /** 获取生成的文件(文件夹)Uri */
    let targetUri = Uri.joinPath(resource, targetPath);
    /** 如果路径已经存在 */
    if (existsSync(targetUri.fsPath)) {
      /** 允许覆盖 */
      if (config.overwrite) {
        /** 删除原本的文件 */
        workspace.fs.delete(targetUri);
      } else {
        /** 生成的文件(文件夹)名后加.template */
        /** 重新获取生成的文件(文件夹)Uri */
        targetUri = Uri.joinPath(resource, `${targetPath}.template`);
      }
    }
    /** 如果是文件 */
    if (template.fileType === FileType.File) {
      /** 获取文件内容 */
      const content = await workspace.fs.readFile(template.templateUri);
      /** 将格式化后的内容写入目标路径 */
      workspace.fs.writeFile(targetUri, format(content, config, targetPath, resource.fsPath));
    } else if (template.fileType === FileType.Directory) {
      /** 如果是文件夹 */
      /** 读取模板内容 */
      const content = await workspace.fs.readDirectory(template.templateUri);
      /** 如果文件夹存在内容,创建文件夹 */
      if (content.length) {
        workspace.fs.createDirectory(targetUri);
      }
      each(
        map(
          /** 根据配置忽略 */
          filter(content, ([name]) => {
            if (config.exclude.length) {
              return some(config.exclude, (v) => {
                if (isRegExp(v)) {
                  return !v.test(name);
                }
                return v !== name;
              });
            }
            return true;
          }),
          ([name, fileType]) => {
            return new Template(name, name, false, fileType, join(template.path, name), template.templateRoot);
          }
        ),
        (v) => {
          writeTemplate(resource, v, config, targetPath);
        }
      );
    }
  });
};

const $format = {
  /** 全大写 */
  '/upcase': (content: string) => content.toLocaleUpperCase(),
  /** 全小写 */
  '/downcase': (content: string) => content.toLocaleLowerCase(),
  /** 首字母大写 */
  '/capitalize': (content: string) => content.replace(/^./, (v) => v.toLocaleUpperCase()),
  /** 驼峰命名 */
  '/camelcase': (content: string) =>
    content.replace(/[^a-zA-Z0-9]+[a-zA-Z0-9]/g, (v) => v.slice(-1).toLocaleUpperCase()),
  /** 帕斯卡命名 */
  '/pascalcase': (content: string) =>
    content.replace(/^[a-zA-Z0-9]|[^a-zA-Z0-9]+[a-zA-Z0-9]/g, (v) => v.slice(-1).toLocaleUpperCase()),
};
/**
 * 根据规则格式化字符串
 * @param content 要格式化的字符串
 * @param config 用户配置
 * @param template 当前模板
 * @param resource 目标文件夹
 * @returns 格式化后的字符串
 */
export const format = <T extends Uint8Array | string>(
  content: T,
  config: TemplateConfig,
  path: string,
  targetPath: string
): T => {
  return catchError(() => {
    /** 设置默认值 */
    let value = '';
    if (typeof content === 'string') {
      /** 如果格式化的内容是字符串,直接赋值 */
      value = content;
    } else {
      /** 不是字符串转换为字符串 */
      value = content.toString();
    }
    /** 将对应的字符串模板替换到内容 */
    each(config.stringTemplates, ({ from, to }) => {
      value = value.replace(RegExp(from, 'g'), to);
    });
    value;
    /** 通过特定方法格式化字符串 */
    value = value
      .replace(/(?<!\\)\$\{((?<!\}).)*(\/[gims]*)*\}/g, (v) => {
        /** 特定字符 匹配规则 替换模板 修饰符 */
        const [key, regex, format, options] = v
          .slice(2, -1)
          .split(/(?<!:)\//)
          .concat(['', '', '']);
        let replaceText = () => format;
        if (/^(?<!\\)\$((\{.*\})|([1-9][0-9]*))$/.test(format)) {
          const [num, fnKey] = format.slice(2, -1).split(/:(?=\/)/);
          if (fnKey) {
            if (keys($format).includes(fnKey)) {
              replaceText = (...arr) => $format[fnKey as keyof typeof $format](arr[Number(num)]);
            }
          } else {
            replaceText = (...arr) => arr[Number(num)];
          }
        }
        /** 获取文件路径 */
        const filePath = join(targetPath, path);
        /** 获取文件元数据 */
        const file = parse(filePath);
        /** 获取文件的父级文件夹路径 */
        const folderPath = dirname(filePath);
        return config.placeholder[key]({
          targetPath,
          targetName: parse(targetPath).name,
          filePath,
          fileName: file.name,
          fileBase: file.base,
          fileExt: file.ext,
          folderPath,
          folderName: parse(folderPath).name,
        }).replace(RegExp(regex, options), replaceText);
      })
      .replace('\\$', '$');
    if (content instanceof Uint8Array) {
      return Uint8Array.from(Buffer.from(value, 'utf8')) as T;
    }
    return value as T;
  });
};

/**
 * 捕获错误
 * @param fn 执行函数
 * @returns
 */
export const catchError = <T>(fn: () => T): T => {
  try {
    return fn();
  } catch (error) {
    let message = '';
    if (typeof error === 'string') {
      message = error;
    } else {
      message = (error as Error).message;
    }
    window.showErrorMessage(message);
    throw message;
  }
};
