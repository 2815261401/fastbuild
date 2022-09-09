import { existsSync } from 'fs';
import path = require('path');
import { Uri, window, workspace, WorkspaceFolder } from 'vscode';

/**
 * 模板文件数据
 */
class TemplateFileData {
	name: string; // 模板文件(文件夹)名称
	parent?: TemplateFileData; //模板文件(文件夹)所在文件夹
	type: number; // 1文件,2文件夹
	children?: TemplateFileData[]; // 文件夹内的文件和文件夹
	rootPath?: string;
	/**
	 * @param data [文件名称,文件类型<1文件,2文件夹>]
	 */
	constructor(data: [string, number]) {
		this.name = data[0];
		this.type = data[1];
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
			throw new Error('根目录没有父级!');
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
}

// 异步等待合并数组,仅异步时使用,可用于循环时强制等待,防止数据丢失
export const asyncConcatArray = async (
	array: any[],
	promise: (value: any, i: number) => Promise<any[]>
): Promise<any[]> => {
	return new Promise((resolve) => {
		// 自启实施合并数组
		(async function carryOut(i: number = 0, arr: any[] = []) {
			// 循环次数达到时返回数组
			if (i === array.length) {
				resolve(arr);
			} else {
				// 执行由外部传进的方法
				const data = await promise(array[i], i + 1);
				carryOut(i + 1, arr.concat(data));
			}
		})();
	});
};

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
		name?: string | undefined;
		filter?: ((v: string) => Boolean) | undefined;
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
		if (templates.filter!==void) {
			directory = directory.filter(([name]) => templates.filter(name));
		}
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
	placeholder: [string, (v: any) => string][] = [
		[
			'%name%',
			(context) => {
				return context.module === 'index'
					? context.folder.replace(/( |^)[a-z]/g, (L: string) =>
							L.toUpperCase()
					  )
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
			throw new Error('模板文件: templates格式错误!');
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
	setPlaceholder(placeholder: [string, (v: any) => string][]) {
		if (Array.isArray(placeholder)) {
			this.placeholder = placeholder;
		} else {
			throw new Error('模板文件: placeholder格式错误!');
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
			throw new Error('模板文件: exclude格式错误!');
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
			throw new Error('模板文件: overwrite只能是boolean!');
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
			throw new Error('模板文件: overwrite只能是boolean!');
		}
	}
}

/**
 * 模板文件
 */
export class TemplateFile {
	SystemTemplateConfig!: TemplatesConfig;
	ProjectTemplateConfig: { [x: string]: TemplatesConfig } = {};
	workspaceFolders: readonly WorkspaceFolder[];
	constructor() {
		// 获取工作区
		this.workspaceFolders = workspace.workspaceFolders || [];
	}
	/**
	 * 为模板文件设置语言支持
	 */
	async setFileLanguage() {
		// 获取setting.json中的后缀支持
		const data: { [x: string]: any } =
			(await workspace.getConfiguration().get('files.associations')) || {};
		// 修改config.template的语言为javascript
		data['config.template'] = 'javascript';
		//最后一个参数，为true时表示写入全局配置，为false或不传时则只写入工作区配置
		await workspace.getConfiguration().update('files.associations', data, true);
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
			path.resolve(__dirname, '../../public/TemplateFileConfig/config.template')
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
		if (workspaceFolder) {
			// 获取每个工作区的配置文件
			const templatePath = path.normalize(
				path.resolve(workspaceFolder.uri.fsPath, './config.template')
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
					path.resolve(Folder.uri.fsPath, './config.template')
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
	}
	/**
	 * 创建配置文件
	 * @param fspath 要创建的文件夹路径
	 */
	createTemplate(fspath: string) {
		// 获取每个工作区的配置文件
		const templatePath = path.normalize(
			path.resolve(fspath, './config.template')
		);
		// 如果工作区不存在配置文件
		if (!existsSync(templatePath)) {
			workspace.fs.copy(
				Uri.file(
					`${__dirname}/../../public/TemplateFileConfig/config.template`
				),
				Uri.file(`${fspath}/config.template`)
			);
		} else {
			window.showTextDocument(Uri.file(templatePath));
		}
	}
	/**
	 * 根据模板创建文件
	 * @param workspaceFolder 项目工作区
	 */
	async createFileFromTemplates(workspaceFolder: WorkspaceFolder) {
		const config = this.getProjectFile(workspaceFolder);
		if (config) {
			const data = await config.getTemplateFiles(workspaceFolder);
			console.log(data);
			this.selectFileFromTemplates(config, data);
		}
	}

	async selectFileFromTemplates(
		config: TemplatesConfig,
		templates: TemplateFileData[][],
		templateList: TemplateFileData[] = [],
		type?: number
	) {
		let selectList = [];
		let placeHolder = ``;
		let selectType: { [x: string]: any } = {};
		if (type) {
			selectList = ['返回', '取消'];
			placeHolder = `请选择模板`;
			selectList = selectList.concat(
				templateList
					.filter((item) => {
						console.log(config);

						return true;
					})
					.map(({ name }, i) => {
						selectType[name] = i;
						return name;
					})
			);
		} else {
			selectList = ['文件', '文件夹', '混合', '全部文件'];
			placeHolder = `请选择模板类型`;
			selectType = {
				文件: 1,
				文件夹: 2,
				混合: 3,
				全部文件: 4
			};
		}
		let select = await window.showQuickPick(selectList, { placeHolder });
		if (select) {
			if (type) {
			} else {
				this.selectFileFromTemplates(
					config,
					templates,
					templates.map((list) => list[0]),
					selectType[select]
				);
			}
		}
	}
}
