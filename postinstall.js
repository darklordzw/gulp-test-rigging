var fs = require('fs');
var fileName = '../../package.json';
var file = require(fileName);

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
		]
    }
};

fs.writeFile(fileName, JSON.stringify(file, null, 2), function (err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(file));
    console.log('setting a few linter settings in ' + fileName);
});