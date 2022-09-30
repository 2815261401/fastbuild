import path = require('path');

const weeks = ['日', '一', '二', '三', '四', '五', '六'];
export const placeFolder: [string | RegExp, Function][] = [
	[
		'%(\\s*)folder(\\s*)%',
		(context: { folder: string }) => {
			return path.parse(context.folder).name.toLowerCase();
		}
	],
	[
		'%(\\s*)Folder(\\s*)%',
		(context: { folder: string }) => {
			return path.parse(context.folder).name;
		}
	],
	[
		'%(\\s*)FOLDER(\\s*)%',
		(context: { folder: string }) => {
			return path.parse(context.folder).name.toUpperCase();
		}
	],
	[
		'%(\\s*)module(\\s*)%',
		(context: { module: string }) => {
			return context.module.toLowerCase();
		}
	],
	[
		'%(\\s*)Module(\\s*)%',
		(context: { module: any }) => {
			return context.module;
		}
	],
	[
		'%(\\s*)MODULE(\\s*)%',
		(context: { module: any }) => {
			return context.module.toUpperCase();
		}
	],
	[
		'%(\\s*)timestamp(\\s*)%',
		() => {
			return Date.now();
		}
	],
	[
		'%(\\s*)year(\\s*)%',
		() => {
			return new Date().getFullYear();
		}
	],
	[
		'%(\\s*)day(\\s*)%',
		() => {
			const val = new Date().getDay();
			return weeks[val];
		}
	],
	[
		'%(\\s*)month(\\s*)%',
		() => {
			const val = new Date().getMonth() + 1;
			return val < 10 ? `0${val}` : val;
		}
	],
	[
		'%(\\s*)date(\\s*)%',
		() => {
			const val = new Date().getDate();
			return val < 10 ? `0${val}` : val;
		}
	],
	[
		'%(\\s*)hour(\\s*)%',
		() => {
			const val = new Date().getHours();
			return val < 10 ? `0${val}` : val;
		}
	],
	[
		'%(\\s*)minute(\\s*)%',
		() => {
			const val = new Date().getMinutes();
			return val < 10 ? `0${val}` : val;
		}
	],
	[
		'%(\\s*)second(\\s*)%',
		() => {
			const val = new Date().getSeconds();
			return val < 10 ? `0${val}` : val;
		}
	]
];

// 异步等待合并数组,仅异步时使用,可用于循环时强制等待,防止数据丢失
const asyncConcatArray = async (
	array: any[],
	promise: (value: any, i: number) => Promise<any[]>
): Promise<any[]> => {
	return new Promise((resolve) => {
		try {
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
		} catch (err: any) {
			throw new Error(err);
		}
	});
};
