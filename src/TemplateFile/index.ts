import { existsSync } from 'fs';
import path = require('path');
import { TextDecoder } from 'util';
import { FileType, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { placeFolder } from './tools';

// 弹出报错信息
const error = (message: string) => {
	window.showErrorMessage(message);
	throw new Error(message);
};

/**
 * 模板文件数据
 */
class TemplateFileData {
	name: string; // 模板文件(文件夹)名称
	parent?: TemplateFileData; //模板文件(文件夹)所在文件夹
	type: number; // 1文件,2文件夹
	suffix?: string = ''; // 文件后缀,只有文件才有
	children?: TemplateFileData[]; // 文件夹内的文件和文件夹
	rootPath?: string; // 根路径,只有模板文件夹才有
	alias?: string; // 别名
	isStart?: boolean; //由此数据开始
	/**
	 * @param data [文件名称,文件类型<1文件,2文件夹>]
	 */
	constructor(data: [string, FileType]) {
		this.type = data[1];
		if (this.type === 1) {
			const lastIndex = data[0].lastIndexOf('.') || data[0].length;
			this.name = data[0].slice(0, lastIndex);
			this.suffix = data[0].slice(lastIndex);
		} else {
			this.name = data[0];
		}
	}
	/**
	 * 设置路径名称
	 * @param name 文件(文件夹)名称
	 */
	setName(name: string) {
		this.name = name;
	}
	/**
	 * 设置别名
	 * @param alias 名称
	 */
	setAlias(alias?: string) {
		if (alias) {
			this.alias = alias;
		}
	}
	/**
	 * 设置根目录
	 * @param data 文件路径
	 */
	setRootPath(path: string) {
		this.rootPath = path;
	}
	/**
	 * 设置所在的文件夹
	 * @param data 模板文件数据
	 */
	setParent(data: TemplateFileData) {
		if (this.rootPath) {
			throw error('根目录没有父级!');
		}
		this.parent = data;
	}
	/**
	 * 设置文件夹内的数据
	 * @param data 模板文件数据数组
	 */
	setChildren(data: TemplateFileData[]) {
		this.children = data;
	}
	/**
	 * 设置由此开始
	 * @param bol 是/否
	 */
	setIsStart(bol: boolean) {
		this.isStart = bol;
	}
	/**
	 * 删除指定属性
	 * @param key 指定的key
	 */
	removeAttribute(key: 'parent' | 'children' | 'rootPath' | 'alias') {
		delete this[key];
	}
	/**
	 * 获取由根目录开始的文件(目录)名称
	 * @param path 是否是获取相对路径
	 * @returns 根据fastBuild.delimiter拼接的名称字符串
	 */
	getAllname(path = false): string {
		// 获取设置中的字符串
		const delimiter = workspace.getConfiguration().get('fastBuild.delimiter');
		// 如果存在父级,获取父级的目录名称
		if (this.parent) {
			// 如果是获取路径,则不能使用别名
			return `${this.parent.getAllname(path)}${path ? '\\' : delimiter}${
				path ? this.fullName : this.alias || this.name
			}`;
		} else {
			return path ? this.fullName : this.alias || this.name;
		}
	}
	/**
	 * 获取修改名称后的路径
	 * @returns 由isStart开始的文件路径
	 */
	getEditPath(): string {
		if (!this.isStart && this.parent) {
			return `${this.parent.getEditPath()}\\${this.alias}${this.suffix}`;
		} else {
			return `${this.alias}${this.suffix}`;
		}
	}
	/**
	 * 完整文件(目录)名
	 */
	get fullName() {
		return `${this.name}${this.suffix || ''}`;
	}
	/**
	 * 全部路径
	 */
	get allPath(): string {
		// 如果拥有父级,则父级的全部路径拼接文件名就是全部路径
		if (this.parent) {
			return `${this.parent.allPath}\\${this.fullName}`;
		}
		// 如果没有父级,说明是根节点
		else {
			return `${this.rootPath}\\${this.fullName}`;
		}
	}
	/**
	 * 所有子级
	 */
	get allChildren(): TemplateFileData[] | null {
		// 所有子级包括子级的子级
		if (this.children) {
			return this.children.concat(
				// 获取子级的所有子级
				this.children.reduce((total: TemplateFileData[], item) => {
					if (item.allChildren) {
						return total.concat(item.allChildren);
					} else {
						return total;
					}
				}, [])
			);
		}
		// 如果没有子级,也不存在所有子级
		else {
			return null;
		}
	}
	/**
	 * 根模板数据
	 */
	get rootParent(): TemplateFileData {
		// 存在父级,返回父级的根模板
		if (this.parent) {
			return this.parent.rootParent;
		}
		// 没有父级,说明是根模板
		else {
			return this;
		}
	}
}

/**
 * 获取文件夹内所有模板文件数据的合集
 * @param rootPath 要获取的项目路径
 * @param fsPath 要获取的文件夹名称
 * @returns
 */
export const getAllFiles = async (
	rootPath: string,
	templates: {
		path: string;
		name?: string;
		filter?: (v: string) => Boolean;
	},
	exclude: (string | RegExp)[]
) => {
	/**
	 * 获取当前文件夹内容
	 * @param parentPath 父级文件夹名称合集
	 * @param filePath 文件(文件夹)名称
	 * @param parentTemplateFile 父级文件模板数据
	 * @param fileList 接受的合集
	 * @returns
	 */
	const getFiles = async (
		parentPath: string[],
		filePath: string,
		parentTemplateFile?: TemplateFileData,
		fileList: TemplateFileData[] = []
	) => {
		// 读取文件夹的内容
		let directory = await workspace.fs.readDirectory(
			Uri.file(path.resolve(rootPath, ...parentPath, filePath))
		);
		// 根据自定义筛选排除
		directory = directory.filter(
			([name]) =>
				(templates.filter || (() => true))(name) &&
				// 根据全局筛选排除
				exclude.every((regExp) => !new RegExp(regExp).test(name))
		);
		// 设置当前文件夹内容默认为空
		const Children: TemplateFileData[] = [];
		// 循环文件夹内读取的内容
		for (let i = 0; i < directory.length; i++) {
			// 初始化模板文件数据
			const templateFileData = new TemplateFileData(directory[i]);
			// 如果存在父级
			if (parentTemplateFile) {
				// 关联父级数据
				templateFileData.setParent(parentTemplateFile);
			}
			// 加到文件列表中
			fileList.push(templateFileData);
			// 加就当前文件夹内容中
			Children.push(templateFileData);
			if (directory[i][1] === 1) {
				// 如果是文件
			} else if (directory[i][1] === 2) {
				// 如果是文件夹
				// 获取文件夹内所有数据
				const templateFileChildren = await getFiles(
					[...parentPath, filePath],
					directory[i][0],
					templateFileData
				);
				// 将获取到的数据拼接到文件数据合集
				fileList = fileList.concat(templateFileChildren);
			}
		}
		// 如果存在父级,关联当前文件夹内容到子级
		parentTemplateFile?.setChildren(Children);
		return fileList;
	};
	// 初始化模板数据列表
	const templateList: TemplateFileData[] = [];
	// 创建根目录实例
	const rootTemplant = new TemplateFileData([templates.path, 2]);
	// 设置根路径
	rootTemplant.setRootPath(rootPath);
	// 设置别名
	rootTemplant.setAlias(templates.name);
	// 获取根目录下的所有文件数据
	const files = await getFiles([''], templates.path, rootTemplant);
	// 将实例添加到模板数据列表
	templateList.push(rootTemplant);
	// 模板数据列表拼接文件数据
	return templateList.concat(files);
};

/**
 * 配置数据
 */
class TemplatesConfig {
	// 模板文件夹列表
	templates: {
		path: string;
		name?: string;
		filter?: (v: string) => Boolean;
	}[] = [
		{
			name: 'fileTemplate',
			path: 'fileTemplate'
		}
	];
	// 占位符配置列表
	placeholder: [string | RegExp, (v: any) => string][] = [
		[
			'%name%',
			(context) => {
				return context.module === 'index'
					? (
							context.template.parent.alias || context.template.parent.name
					  ).replace(/( |^)[a-z]/g, (L: string) => L.toUpperCase())
					: context.module.replace(/( |^)[a-z]/g, (L: string) =>
							L.toUpperCase()
					  );
			} // [正则表达式, 返回函数]
		]
	];
	// 排除配置列表
	exclude: Array<string | RegExp> = [];
	// 是否强制覆盖
	overwrite: boolean = false;
	// 是否忽略系统占位符
	ignoreDefaultPlaceholder: boolean = false;
	constructor(config: TemplatesConfig);
	constructor(
		templates?:
			| {
					path: string;
					name?: string;
					filter?: (v: string) => Boolean;
			  }
			| {
					path: string;
					name?: string;
					filter?: (v: string) => Boolean;
			  }[],
		placeholder?: [string, (v: any) => string][],
		exclude?: (string | RegExp)[],
		overwrite?: boolean,
		ignoreDefaultPlaceholder?: boolean
	);
	constructor(
		templates?: any,
		placeholder?: [string, (v: any) => string][],
		exclude?: (string | RegExp)[],
		overwrite?: boolean,
		ignoreDefaultPlaceholder?: boolean
	) {
		if (
			typeof templates === 'object' &&
			!Array.isArray(templates) &&
			templates.templates
		) {
			this.setTemplates(templates.templates);
			this.setPlaceholder(templates.placeholder);
			this.setExclude(templates.exclude);
			this.setOverwrite(templates.overwrite);
			this.setIgnoreDefaultPlaceholder(templates.ignoreDefaultPlaceholder);
		} else if (void 0 !== templates) {
			this.setTemplates(templates);
		}
		if (void 0 !== placeholder) {
			this.setPlaceholder(placeholder);
		}
		if (void 0 !== exclude) {
			this.setExclude(exclude);
		}
		if (void 0 !== overwrite) {
			this.setOverwrite(overwrite);
		}
		if (void 0 !== ignoreDefaultPlaceholder) {
			this.setIgnoreDefaultPlaceholder(ignoreDefaultPlaceholder);
		}
	}
	/**
	 * 设置模板配置
	 * @param templates 模板数据,支持对象,数组
	 */
	setTemplates(templates: any) {
		if (typeof templates !== 'object') {
			throw error('模板文件: templates格式错误!');
		}
		if (Array.isArray(templates)) {
			this.templates = templates;
		} else {
			this.templates = [templates];
		}
	}
	/**
	 * 获取模板文件列表
	 * @param workspaceFolder 项目文件夹
	 * @returns 当前项目文件夹所有模板文件数据
	 */
	async getTemplateFiles(workspaceFolder: WorkspaceFolder) {
		// 初始化默认值
		const arr: TemplateFileData[][] = [];
		// 循环获取多个模板文件夹
		for (let i = 0; i < this.templates.length; i++) {
			// 对应模板文件夹的数据放到对应下标
			arr[i] = await getAllFiles(
				workspaceFolder.uri.fsPath,
				this.templates[i],
				this.exclude
			);
		}
		return arr;
	}
	/**
	 * 设置占位符配置
	 * @param placeholder 占位符列表,数组
	 */
	setPlaceholder(placeholder: [string | RegExp, (v: any) => string][]) {
		if (Array.isArray(placeholder)) {
			this.placeholder = placeholder;
		} else {
			throw error('模板文件: placeholder格式错误!');
		}
	}
	/**
	 * 设置忽略配置
	 * @param exclude 忽略的数据,数组,支持字符串,正则
	 */
	setExclude(exclude: (string | RegExp)[]) {
		if (Array.isArray(exclude)) {
			this.exclude = exclude;
		} else {
			throw error('模板文件: exclude格式错误!');
		}
	}
	/**
	 * 设置是否强制覆盖
	 * @param overwrite
	 */
	setOverwrite(overwrite: boolean) {
		if (typeof overwrite === 'boolean') {
			this.overwrite = overwrite;
		} else {
			throw error('模板文件: overwrite只能是boolean!');
		}
	}
	/**
	 * 设置是否忽略系统占位符
	 * @param ignoreDefaultPlaceholder
	 */
	setIgnoreDefaultPlaceholder(ignoreDefaultPlaceholder: boolean) {
		if (typeof ignoreDefaultPlaceholder === 'boolean') {
			this.ignoreDefaultPlaceholder = ignoreDefaultPlaceholder;
		} else {
			throw error('模板文件: overwrite只能是boolean!');
		}
	}
	get placeholders(): [string | RegExp, Function][] {
		if (this.ignoreDefaultPlaceholder) {
			return this.placeholder;
		} else {
			return placeFolder.concat(this.placeholder);
		}
	}
}

/**
 * 模板文件
 */
export class TemplateFile {
	folder!: Uri;
	SystemTemplateConfig!: TemplatesConfig;
	ProjectTemplateConfig: { [x: string]: TemplatesConfig } = {};
	workspaceFolders: readonly WorkspaceFolder[];
	defaultSelect?: boolean;
	constructor(folder?: Uri) {
		if (folder) {
			this.folder = folder;
		}
		// 获取工作区
		this.workspaceFolders = workspace.workspaceFolders || [];
		// 获取esc是否返回上级目录
		this.defaultSelect = workspace.getConfiguration().get('fastBuild.ESCBack');
	}
	/**
	 * 获取系统配置数据
	 * @returns 系统配置数据
	 */
	getSystemFile(): TemplatesConfig {
		if (this.SystemTemplateConfig) {
			return this.SystemTemplateConfig;
		}
		// 获取默认配置文件路径
		const templatePath = path.normalize(
			path.resolve(
				__dirname,
				'../../public/TemplateFileConfig/.config.template'
			)
		);
		// 避免读取配置时,受require缓存影响
		delete require.cache[templatePath];
		// 读取配置文件
		const templateConfig = require(templatePath);
		// 将配置数据记录到系统配置
		this.SystemTemplateConfig = new TemplatesConfig(templateConfig);
		return this.SystemTemplateConfig;
	}
	/**
	 * 获取项目配置数据
	 * @param workspaceFolder 工作区
	 * @returns 如果只有一个工作区,则返回这个工作区的模板配置数据
	 */
	getProjectFile(workspaceFolder?: WorkspaceFolder) {
		try {
			if (workspaceFolder) {
				// 获取每个工作区的配置文件
				const templatePath = path.normalize(
					path.resolve(workspaceFolder.uri.fsPath, './.config.template')
				);
				// 如果工作区不存在配置文件
				if (!existsSync(templatePath)) {
					return void 0;
				}
				// 避免读取配置时,受require缓存影响
				delete require.cache[templatePath];
				// 读取配置文件
				const templateConfig = require(templatePath);
				// 返回配置数据
				return new TemplatesConfig(templateConfig);
			} else {
				// 用对象接,以便读取
				this.workspaceFolders.forEach((Folder) => {
					// 获取每个工作区的配置文件
					const templatePath = path.normalize(
						path.resolve(Folder.uri.fsPath, './.config.template')
					);
					// 如果工作区不存在配置文件
					if (!existsSync(templatePath)) {
						// 返回系统配置数据
						return this.getSystemFile();
					}
					// 避免读取配置时,受require缓存影响
					delete require.cache[templatePath];
					// 读取配置文件
					const templateConfig = require(templatePath);
					// 将配置数据记录下来
					this.ProjectTemplateConfig[Folder.uri.path] = new TemplatesConfig(
						templateConfig
					);
				});
			}
		} catch (err: any) {
			error(err.message);
		}
	}
	/**
	 * 创建配置文件
	 * @param fspath 要创建的文件夹路径
	 */
	createTemplate(fspath: string) {
		try {
			// 获取每个工作区的配置文件
			const templatePath = path.normalize(
				path.resolve(fspath, './.config.template')
			);
			// 获取旧版的配置文件
			const old_templatePath = path.normalize(
				path.resolve(fspath, './config.template')
			);
			if (existsSync(old_templatePath)) {
				workspace.fs.delete(Uri.file(old_templatePath));
			}
			// 如果工作区不存在配置文件
			if (!existsSync(templatePath)) {
				workspace.fs.copy(
					Uri.file(
						`${__dirname}/../../public/TemplateFileConfig/.config.template`
					),
					Uri.file(`${fspath}/.config.template`)
				);
			} else {
				window.showTextDocument(Uri.file(templatePath));
			}
		} catch (err: any) {
			error(err.message);
		}
	}
	/**
	 * 生成对应文件
	 * @param workspaceFolder 所在工作区
	 * @param config 所在工作区的配置
	 * @param template 要生成的模板数据
	 */
	async generateFiles(
		workspaceFolder: WorkspaceFolder,
		config: TemplatesConfig,
		template: TemplateFileData
	) {
		// 格式化内容
		const parse = async (
			content: string,
			isName: boolean = false
		): Promise<string> => {
			// 判断是否有自定义模板
			if (!config.ignoreDefaultPlaceholder && /\%custom\%/.test(content)) {
				// 获取自定义字段列表
				const customList = content.match(/\%custom\%/g) || [];
				// 循环替换自定义字段
				for (let i = 0; i < customList.length; i++) {
					// 取得当前自定义字段
					const custom = customList[i];
					// 根据用户输入的内容进行替换
					const module = await window.showInputBox({
						placeHolder: isName
							? `请输入 ${
									template.fullName
							  } 的自定义名称,位置: ${template.getAllname(true)}`
							: `请输入自定义数据,位置: ${template.getAllname(true)}(${i})`,
						prompt: isName
							? `请输入 ${
									template.fullName
							  } 的自定义名称,位置: ${template.getAllname(true)}`
							: `请输入自定义数据,位置: ${template.getAllname(true)}(${i})`,
						ignoreFocusOut: true,
						value: 'custom',
						validateInput(value: string) {
							if (isName && !value) {
								return `${template.type === 1 ? '文件' : '文件夹'}名不能为空`;
							} else if (
								isName &&
								/\/|\\|\:|\*|\?|\.|\"|\<|\>|\|/g.test(value)
							) {
								return `${
									template.type === 1 ? '文件' : '文件夹'
								}名不能包含: / \ : * ? . " < > |`;
							} else {
								return null;
							}
						}
					});
					if (!module) {
						window.showInformationMessage(
							`已停止生成${
								template.type === 1 ? '文件' : '文件夹及其子级'
							}:${template.getAllname(true)}`
						);
						return '';
					}
					content = content.replace(custom, module);
				}
			}
			// 循环格式化规则
			for (let i = 0; i < config.placeholders.length; i++) {
				// 获取该次循环的规则
				const arr = config.placeholders[i];
				// 将正则转化为全局替换
				const regexp = new RegExp(arr[0], 'g');
				// 根据规则替换为对应内容
				content = content.replace(
					regexp,
					arr[1]({
						folder: this.folder.fsPath.replace(/^.*\\/, ''), // 右击文件夹名称
						folderPath: this.folder.fsPath, // 右击文件夹路径
						workspaceFolder: workspaceFolder.name, // 当前工作区的文件夹名称
						templateFolder: template.rootParent.name, // 当前选中的模板文件夹名称
						module: template.name, // 当前文件(文件夹)名称
						template // 模板实体
					})
				);
			}
			return content;
		};
		// 获取格式化后的名字
		const name = await parse(template.name, true);
		if (!name) {
			return;
		}
		// 模板数据设置格式化后的名称
		template.setAlias(name);
		// 文件目标位置
		const target = path.resolve(this.folder.fsPath, template.getEditPath());
		// 判断文件(文件夹)是否已存在
		const exist = existsSync(target);
		// 如果是文件
		if (template.type === 1) {
			// 允许强制覆盖或者文件不存在,生成文件
			if (config.overwrite || !exist) {
				// 获取模板数据
				const data = await workspace.fs.readFile(Uri.file(template.allPath));
				// 将模板内容转化成字符串
				let content = new TextDecoder('utf-8').decode(data);
				// 将内容进行格式化
				if (content) {
					content = await parse(content);
					if (!content) {
						return;
					}
				}
				await workspace.fs.writeFile(Uri.file(target), Buffer.from(content));
				window.showTextDocument(Uri.file(target));
			}
		}
		// 如果是文件夹
		else {
			// 如果不存在文件夹
			if (!exist) {
				// 创建文件夹
				await workspace.fs.createDirectory(Uri.file(target));
			}
			// 获取文件夹内的文件数据
			const children = template.children || [];
			// 循环生成文件
			for (let i = 0; i < children.length; i++) {
				// 执行生成文件函数
				await this.generateFiles(workspaceFolder, config, children[i]);
			}
		}
	}
	/**
	 * 根据模板创建文件
	 * @param workspaceFolder 项目工作区
	 */
	async createFileFromTemplates(workspaceFolder: WorkspaceFolder) {
		try {
			// 获取对应工作区的配置
			let config = this.getProjectFile(workspaceFolder);
			if (!config) {
				this.createTemplate(workspaceFolder.uri.fsPath);
				config = new TemplatesConfig();
			}
			// 获取模板列表数据
			const data = await config.getTemplateFiles(workspaceFolder);
			// 执行选择,获取选择的数据
			const template = await this.selectFileFromTemplates(config, [
				data.map((arr) => arr[0])
			]);
			// 如果选择了模板
			if (template) {
				// 将模板数据设置为特殊开始模板
				template.setIsStart(true);
				// 执行生成文件
				this.generateFiles(workspaceFolder, config, template);
			}
		} catch (err: any) {
			error(err.message);
		}
	}

	/**
	 * 选择模板
	 * @param config 配置文件数据
	 * @param templatesList 模板列表的列表
	 * @param type 当前选择的类型
	 * @param selectTemplate 当前选中的模板数据
	 */
	async selectFileFromTemplates(
		config: TemplatesConfig,
		templatesList: TemplateFileData[][],
		type?: string,
		selectTemplate?: TemplateFileData
	): Promise<TemplateFileData | null> {
		try {
			// 默认的模板类型列表
			const typeList = ['文件', '文件夹', '混合', '全部文件'];
			// 如果存在模板类型则执行选择模板
			if (type) {
				// 获取模板合集的最后一个下标
				const lastIndex = templatesList.length - 1;
				// 根据配置设置Esc的默认值
				const defaultSelect = this.defaultSelect ? '返回' : '退出';
				// 选中的模板数据,默认为空
				let template = null;
				// 获取模板合集的最后一个模板列表
				let templates = templatesList[lastIndex];
				// 选择列表中优先加入返回
				let list: {
					label: string;
					description?: string;
					value: TemplateFileData | null;
				}[] = [
					{
						label: '返回',
						value: null
					}
				];
				// 如果用户选择了ESC返回上一级
				if (this.defaultSelect) {
					// 选择列表中加入退出
					list.push({
						label: '退出',
						value: null
					});
				}
				// 如果不是选择模板文件夹并且允许选择文件夹
				if (lastIndex >= 1 && ['文件夹', '混合'].includes(type)) {
					// 选择列表中加入选择文件夹
					list.push({
						label: '选择当前文件夹',
						value: null
					});
				}
				// 如果选择了'全部文件'模板类型
				if (type === '全部文件') {
					// '全部文件'模板类型,模板列表获取模板文件夹所有为文件子级的合集
					templates = templatesList[lastIndex]
						.reduce(
							(total: TemplateFileData[], item) =>
								total.concat(item.allChildren || []),
							[]
						)
						.filter(({ type }) => type === 1);
					// 选择列表中加入模板由模板文件夹开始的路径
					list = list.concat(
						templates.map((item) => ({
							label: item.fullName,
							description: item.getAllname(),
							value: item
						}))
					);
				} else {
					// 如果不是'全部文件'模板类型,选择列表中加入模板的别名或名称
					list = list.concat(
						templates.map((item) => ({
							label: `${item.alias || item.name}${item.suffix}`,
							description: item.getAllname(),
							value: item
						}))
					);
				}
				// 由用户选择
				let select: {
					label: string;
					description?: string | undefined;
					value: TemplateFileData | null;
				} = (await window.showQuickPick(list, {
					placeHolder: `请选择模板类型`,
					ignoreFocusOut: true,
					matchOnDescription: true,
					matchOnDetail: true
				})) || {
					label: defaultSelect,
					value: null
				};
				// 如果用户选择了退出,不在继续执行
				if (select.label === '退出') {
					return null;
				}
				// 如果用户选择了返回,返回上一级
				else if (select.label === '返回') {
					// 返回参数默认加入配置数据,当前的模板合集
					const parmes: [
						TemplatesConfig,
						TemplateFileData[][],
						string?,
						TemplateFileData?
					] = [config, templatesList];
					// 如果不是选择模板文件夹的返回
					if (lastIndex >= 1) {
						// 模板合集回退为上一级
						parmes[1] = templatesList.slice(0, lastIndex);
						// 加入选择模板类型
						parmes[2] = type;
						// 将上一级文件夹也带进去
						if (selectTemplate && selectTemplate.parent) {
							parmes[3] = selectTemplate.parent;
						}
					}
					// 返回上一级的函数,实际上是个递归
					return this.selectFileFromTemplates(...parmes);
				}
				// 如果用户选择了文件夹
				else if (select.label === '选择当前文件夹') {
					// 将当前的文件夹数据返回出去
					return selectTemplate || null;
				}
				// 用户正常的选择
				else if (select.value) {
					// 如果用户选择的是文件
					if (select.value.type === 1) {
						// 将选中的文件数据返回出去
						return select.value;
					}
					// 否则是文件夹
					else {
						// 执行下一级选择,实际上是个递归
						return this.selectFileFromTemplates(
							config, // 配置数据
							templatesList.concat([select.value.children || []]), // 将当前的文件夹内容加入模板合集
							type, // 选择的模板类型
							select.value // 当前选中的文件夹
						);
					}
				} else {
					return null;
				}
			}
			// 如果不存在模板类型,执行选择模板类型
			else {
				let select = await window.showQuickPick(typeList, {
					placeHolder: `请选择模板类型`,
					ignoreFocusOut: true,
					matchOnDescription: true,
					matchOnDetail: true
				});
				// 如果用户进行了选择
				if (select) {
					// 进行模板选择,实际上是个递归
					return this.selectFileFromTemplates(config, templatesList, select);
				}
				return null;
			}
		} catch (err: any) {
			error(err.message);
			return null;
		}
	}
}
