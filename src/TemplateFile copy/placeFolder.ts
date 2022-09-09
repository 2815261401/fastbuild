import path = require('path');
const weeks = ['日', '一', '二', '三', '四', '五', '六'];
const placeFolder: [string | RegExp, Function][] = [];

placeFolder.push([
	'%(\\s*)folder(\\s*)%',
	(context: { folder: string }) => {
		return path.parse(context.folder).name.toLowerCase();
	}
]);

placeFolder.push([
	'%(\\s*)Folder(\\s*)%',
	(context: { folder: string }) => {
		return path.parse(context.folder).name;
	}
]);

placeFolder.push([
	'%(\\s*)FOLDER(\\s*)%',
	(context: { folder: string }) => {
		return path.parse(context.folder).name.toUpperCase();
	}
]);

placeFolder.push([
	'%(\\s*)module(\\s*)%',
	(context: { module: string }) => {
		return context.module.toLowerCase();
	}
]);

placeFolder.push([
	'%(\\s*)Module(\\s*)%',
	(context: { module: any }) => {
		return context.module;
	}
]);

placeFolder.push([
	'%(\\s*)MODULE(\\s*)%',
	(context: { module: any }) => {
		return context.module;
	}
]);
/////////////////////////////////////////////////
placeFolder.push([
	'%(\\s*)timestamp(\\s*)%',
	() => {
		return Date.now();
	}
]);

placeFolder.push([
	'%(\\s*)year(\\s*)%',
	() => {
		return new Date().getFullYear();
	}
]);

placeFolder.push([
	'%(\\s*)day(\\s*)%',
	() => {
		const val = new Date().getDay();
		return weeks[val];
	}
]);

placeFolder.push([
	'%(\\s*)month(\\s*)%',
	() => {
		const val = new Date().getMonth() + 1;
		return val < 10 ? `0${val}` : val;
	}
]);

placeFolder.push([
	'%(\\s*)date(\\s*)%',
	() => {
		const val = new Date().getDate();
		return val < 10 ? `0${val}` : val;
	}
]);

placeFolder.push([
	'%(\\s*)hour(\\s*)%',
	() => {
		const val = new Date().getHours();
		return val < 10 ? `0${val}` : val;
	}
]);
placeFolder.push([
	'%(\\s*)minute(\\s*)%',
	() => {
		const val = new Date().getMinutes();
		return val < 10 ? `0${val}` : val;
	}
]);
placeFolder.push([
	'%(\\s*)second(\\s*)%',
	() => {
		const val = new Date().getSeconds();
		return val < 10 ? `0${val}` : val;
	}
]);

module.exports = placeFolder;
