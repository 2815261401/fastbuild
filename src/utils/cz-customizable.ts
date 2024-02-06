import execa from 'execa';
import { window } from 'vscode';
import { configuration } from './config';

export interface CzConfig {
  /** 类型 */
  type?: {
    /** 类型值 */
    [key: string]: {
      /** 描述 */
      description: string;
      /** 标题 */
      title: string;
      /** 表情代码 */
      code: string;
      /** 表情 */
      emoji: string;
    };
  };
  /** 类型列表 */
  types: {
    /** 类型名 */
    name: string;
    /** 类型值 */
    value: string;
  }[];
  /** 作用域 */
  scopes?:
    | {
        name: string;
        value?: string;
      }[]
    | string[];
  /** 消息 */
  messages: {
    type?: string;
    scope?: string;
    customScope?: string;
    subject?: string;
    body?: string;
    breaking?: string;
    footer?: string;
    confirmCommit?: string;
  };
  /** 是否允许自定义作用域 */
  allowCustomScopes: boolean;
  /** 允许重大的变更 */
  allowBreakingChanges: string[];
  /** 允许跳过的问题 */
  skipQuestions?: string[];
  /** 是否允许添加分支名到提交消息中 */
  appendBranchNameToCommitMessage?: boolean;
  /** 重大的变更前缀 */
  breakingPrefix?: string;
  /** issue前缀 */
  footerPrefix: string;
  /** 提交描述最多字符数 */
  subjectLimit?: number;
}

export class CzCustomizable {
  /** 配置 */
  czConfig!: CzConfig;
  /** 消息 */
  message: {
    main: string;
    type: string;
    scope?: string;
    subject: string;
    body?: string;
    breaking?: string;
    footer?: string;
  } = {
    main: '',
    type: '',
    subject: '',
  };
  constructor(czConfig: CzConfig) {
    this.czConfig = czConfig;
  }
  /** 类型列表 */
  get types() {
    /** 如果原始类型存在 */
    if (this.czConfig.type) {
      /** 转换为弹窗选项数组 */
      return Object.entries(this.czConfig.type).map(([k, v]) => ({
        label: `[${v.emoji}] ${v.title}`,
        description: `${v.description}`,
        value: `${v.emoji} ${k}`,
      }));
    }
    /** 转换为弹窗选项数组 */
    return this.czConfig.types.map(({ name, value }) => ({
      label: value,
      description: name,
      value,
    }));
  }
  /** 作用域列表 */
  get scopes() {
    const scopes = (this.czConfig.scopes ?? []).map((scope) => {
      if (typeof scope === 'string') {
        return {
          label: scope,
          description: scope,
          value: scope,
        };
      }
      return {
        label: scope.name,
        description: scope.value,
        value: scope.value,
      };
    });
    if (this.czConfig.allowCustomScopes) {
      scopes.unshift({
        label: '自定义',
        description: '自定义',
        value: 'custom',
      });
    }
    return scopes;
  }
  get subjectLimit() {
    return this.czConfig.subjectLimit ?? 50;
  }
  get question() {
    return {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      ...this.czConfig.messages,
    };
  }
  get skipQuestions() {
    return this.czConfig.skipQuestions ?? [];
  }
  async getMessages() {
    /** 类型 */
    const type = await window.showQuickPick(this.types, {
      placeHolder: this.question.type,
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true,
    });
    if (type) {
      this.message.type = type.value;
    } else if (type === void 0) {
      return;
    }
    /** 作用域 */
    if (!this.skipQuestions.includes('scope') && this.scopes.length) {
      const scope = await window.showQuickPick(this.scopes, {
        placeHolder: this.question.scope,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
      });
      if (scope?.value === 'custom') {
        const customScope = await window.showInputBox({
          placeHolder: this.question.customScope,
          ignoreFocusOut: true,
        });
        if (customScope === void 0) {
          return;
        }
        scope.value = customScope;
      }
      if (scope === void 0) {
        return;
      }
      this.message.scope = scope.value;
    }

    /** 提交描述 */
    const subject = await window.showInputBox({
      placeHolder: this.question.subject,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return '提交描述必须填写';
        } else if (value.length > this.subjectLimit) {
          return `提交描述不能超过${this.subjectLimit}个字符`;
        }
        return '';
      },
    });
    if (subject === void 0) {
      return;
    }
    this.message.subject = subject;

    /** 详细描述 */
    if (!this.skipQuestions.includes('body')) {
      const body = await window.showInputBox({
        placeHolder: this.question.body,
        ignoreFocusOut: true,
      });
      if (body === void 0) {
        return;
      }
      this.message.body = body;
    }
    /** 非兼容性变更 */
    if (
      !this.skipQuestions.includes('breaking') &&
      this.czConfig.allowBreakingChanges.some((type) => type === this.message.type)
    ) {
      const breaking = await window.showInputBox({
        placeHolder: this.question.breaking,
        ignoreFocusOut: true,
      });
      if (breaking === void 0) {
        return;
      }
      this.message.breaking = breaking;
    }
    /** 关联issue */
    if (!this.skipQuestions.includes('footer')) {
      const footer = await window.showInputBox({
        placeHolder: this.question.footer,
        ignoreFocusOut: true,
      });
      if (footer === void 0) {
        return void 0;
      }
      this.message.footer = footer;
    }
    /** 提交消息命令 */
    const message = [
      '-m',
      `${this.message.type}${this.message.scope ? `(${this.message.scope})` : ''}: ${this.message.subject}`,
    ];
    /** 如果详细描述存在 */
    if (this.message.body) {
      message.push('-m', this.message.body.replaceAll('|', '\n'));
    }
    const footer = [];
    /** 如果非兼容性变更存在 */
    if (this.message.breaking) {
      footer.push(`${this.czConfig.breakingPrefix ?? '重大更新'}: ${this.message.breaking}`);
    }
    /** 关联issue存在 */
    if (this.message.footer) {
      footer.push(`${this.czConfig.footerPrefix ?? '关闭'}: ${this.message.footer}`);
    }
    /** 将对应的footer加入message中 */
    message.push('-m', footer.join('\n').replaceAll('|', '\n'));
    /** 如果添加分支名到提交消息中 */
    if (this.czConfig.appendBranchNameToCommitMessage) {
      const branch = (
        await execa('git', ['branch', '--show-current'], {
          cwd: configuration.workspaceFolder.uri.fsPath,
        })
      ).stdout;
      message.push('-m', `分支: ${branch}`);
    }
    /** 是否签名提交 */
    if (configuration.signCommits) {
      message.push('-S');
    }
    return message;
  }
  /** 获取git cwd */
  getGitCwd(cwd: string) {
    let cwdForGit = cwd;
    if (cwdForGit && configuration.capitalizeWindowsDriveLetter) {
      cwdForGit = cwd.replace(/(\w+?):/, (rootElement) => {
        return rootElement.toUpperCase();
      });
    }
    return cwdForGit;
  }
}
