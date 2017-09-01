const fs = require('fs'); // eslint-disable-line import/newline-after-import
const fileName = '../../package.json';
const file = require(fileName);

file.xo = {
	envs: [
		'node',
		'mocha'
	],
	rules: {
		'linebreak-style': 'off',
		'unicode-bom': 'off',
		'arrow-parens': [
			'error',
			'always'
		],
		'import/no-unresolved': 'off',
		'object-curly-spacing': [
			'error',
			'always'
		],
		'no-use-extend-native/no-use-extend-native': 'off'
	}
};

fs.writeFile(fileName, JSON.stringify(file, null, 2), (err) => {
	if (err) {
		return console.log(err);
	}
	console.log(JSON.stringify(file));
	console.log('setting a few linter settings in ' + fileName);
});
