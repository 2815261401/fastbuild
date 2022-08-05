import path = require('path');
import fs = require('fs');

export function getAll(folderPath: string): Promise<string[]>;
export function getAll(folderPath: string, format: string): Promise<string[]>;
export function getAll(
	folderPath: string,
	format: string,
	complex: boolean
): Promise<{ name: string; }[]>;
export async function getAll(
	folderPath: string,
	format: string = '/',
	complex: boolean = false
): Promise<any> {
	const fileDisplay = (
		filePath: string,
		folderPath: string = ''
	): Promise<string[]> => {
		if (!folderPath) {
			folderPath = filePath;
		}
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
					if (isFile) {
						if (complex) {
							resolve([{
								name:filedir.replace(`${folderPath}\\`, '').replace(/\\/g, format)
							}]);
						} else {
							resolve([
								filedir.replace(`${folderPath}\\`, '').replace(/\\/g, format)
							]);
						}
					}
					// 如果是文件夹
					if (isDir) {
						const flies = await fileDisplay(filedir, folderPath);
						resolve(flies);
					}
				});
			});
		};
		return new Promise((resolve) => {
			if (!fs.existsSync(filePath)) {
				resolve([]);
			} else {
				fs.readdir(filePath, (err, files) => {
					if (err) {
						throw new Error(err.message);
					}
					const fileList: string[] = [];
					if (files.length <= 0) {
						resolve(fileList);
					}
					const max = files.length - 1;
					files.forEach(async (filename, i) => {
						const flie = await Judgment(filename);
						fileList.push(...flie);
						if (i === max) {
							resolve(fileList);
						}
					});
				});
			}
		});
	};
	const data = await fileDisplay(folderPath);
	return data;
}
