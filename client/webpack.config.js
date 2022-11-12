const path = require('path');
module.exports = {
	mode: 'none',
	target: 'node',
	context: path.join(__dirname),
	entry: {
		extension: './src/extension.ts'
	},
	output: {
		filename: 'extension.js',
		path: path.join(__dirname, 'out')
	},
	node: {
		__dirname: false
	},
	resolve: {
		mainFields: ['module', 'main'],
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							compilerOptions: {
								sourceMap: true
							}
						}
					}
				]
			}
		]
	},
	externals: {
		vscode: 'commonjs vscode'
	},
	output: {
		filename: '[name].js',
		path: path.join(path.join(__dirname), 'out'),
		libraryTarget: 'commonjs'
	},
	devtool: 'source-map'
};
