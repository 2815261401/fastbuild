import path = require('path');
import fs = require('fs');

// 模板类型规范
export class TemplateType {
	name!: string;
	path!: string;
	parPath!: string;
	parName!: string;
	allName!: string;
	type: number;
	children!: TemplateType[];
	rootPath!: string;
	rootName!: string;
	constructor(
		type: number,
		filePath?: string,
		parPath?: string,
		rootPath?: string,
		allName?: string
	) {
		this.type = type;
		if (filePath) {
			this.path = filePath;
			const filePathList = filePath.split('\\');
			this.name = filePathList[filePathList.length - 1];
		}
		if (parPath) {
			this.parPath = parPath;
			const parPathList = parPath.split('\\');
			this.parName = parPathList[parPathList.length - 1];
		}
		if (rootPath) {
			this.rootPath = rootPath;
			const rootPathList = rootPath.split('\\');
			this.rootName = rootPathList[rootPathList.length - 1];
		}
		if (allName) {
			this.allName = allName;
		}
	}
	setChildren(children: TemplateType[]) {
		this.children = children;
	}
	setName(name: string) {
		this.name = name;
	}
	setPath(path: string) {
		this.path = path;
	}
}

// 异步等待合并数组,仅异步时使用,可用于循环时强制等待,防止数据丢失
export const asyncConcatArray = async (
	array: any[],
	promise: (value: any, i: number) => Promise<TemplateType[]>
): Promise<TemplateType[]> => {
	return new Promise((resolve) => {
		// 自启实施合并数组
		(async function carryOut(i: number = 0, arr: TemplateType[] = []) {
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

// 重载函数,仅有一个参数时调用
export function getAll(folderPath: string): Promise<string[]>;
// 重载函数,有两个参数时调用
export function getAll(folderPath: string, format: string): Promise<string[]>;
// 重载函数,有三个参数时调用,返回值类型有所不同
export function getAll(
	folderPath: string,
	format: string,
	complex: boolean
): Promise<TemplateType[]>;
// 重载函数的函数体
export async function getAll(
	folderPath: string,
	format: string = '/',
	complex: boolean = false
): Promise<any> {
	// 内部声明用来查子级
	const fileDisplay = (
		filePath: string,
		folderPath: string = ''
	): Promise<any[]> => {
		// 如果没有公共路径初始化一个
		if (!folderPath) {
			folderPath = filePath;
		}
		// 用来判断是文件夹还是文件的
		const Judgment = (filename: string): Promise<any[]> => {
			return new Promise((resolve) => {
				//获取当前文件的绝对路径
				const filedir = path.join(filePath, filename);
				// fs.stat(path)执行后，会将stats类的实例返回给其回调函数。
				fs.stat(filedir, async (eror, stats) => {
					if (eror) {
						throw new Error(eror.message);
					}
					// 是否是文件
					const isFile = stats.isFile();
					// 是否是文件夹
					const isDir = stats.isDirectory();
					const folderPathList = folderPath.split('\\');
					const folderName = folderPathList[folderPathList.length - 1];
					if (isFile) {
						if (complex) {
							const parent = filePath.replace(`/`, '\\');
							// 如果启用了复杂性,则返回该类型
							const templateType = new TemplateType(
								2,
								filedir,
								parent,
								folderPath,
								`${folderName}${format}` +
									filedir.replace(`${folderPath}\\`, '').replace(/\\/g, format)
							);
							resolve([templateType]);
						} else {
							resolve([
								filedir.replace(`${folderPath}\\`, '').replace(/\\/g, format)
							]);
						}
					}
					// 如果是文件夹
					if (isDir) {
						const flies = await fileDisplay(filedir, folderPath);
						if (complex) {
							const parent = filePath.replace(`/`, '\\');
							// 如果启用了复杂性,则返回该类型
							const templateType = new TemplateType(
								1,
								filedir,
								parent,
								folderPath,
								`${folderName}${format}` +
									filedir.replace(`${folderPath}\\`, '').replace(/\\/g, format)
							);
							resolve([templateType, ...flies]);
						} else {
							resolve(flies);
						}
					}
				});
			});
		};
		return new Promise((resolve) => {
			// 判断该文件夹是否已创建
			if (!fs.existsSync(filePath)) {
				resolve([]);
			} else {
				// 读取文件夹
				fs.readdir(filePath, async (err, files) => {
					if (err) {
						throw new Error(err.message);
					}
					let fileList: string[] = [];
					// 如果不存在子级直接返回
					if (files.length <= 0) {
						resolve(fileList);
					}
					// 进行异步等待,防止得到数据时,函数还未执行完毕
					const data = await asyncConcatArray(
						files,
						(v) => Judgment(v) /* 循环判断内部的内容是文件还是文件夹 */
					);
					resolve(data);
				});
			}
		});
	};
	// 获取文件夹内部所有文件
	const data = await fileDisplay(folderPath);
	return data;
}
