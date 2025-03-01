const os = require('node:os');
const process = require('node:process');
const verifyFile = require('./lib/verify-file.js');

const platform = process.env.npm_config_platform || os.platform();
const arch = process.env.npm_config_arch || os.arch();

const target = platform + '-' + arch;

const packageName = '@ffprobe-installer/' + target;

if (!require('./package.json').optionalDependencies[packageName]) {
	throw new Error('Unsupported platform/architecture: ' + target);
}

const binary = platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';

const ffprobePath = require.resolve(`${packageName}/${binary}`);
if (!verifyFile(ffprobePath)) {
	throw new Error(`Could not find ffprobe executable, tried "${ffprobePath}"`);
}

const packageJson = require(`${packageName}/package.json`);
const version = packageJson.ffprobe || packageJson.version;
const url = packageJson.homepage;

/**
* @type {{
* 	path: string;
* 	version: string;
* 	url: string;
* }}
*/
module.exports = {
	path: ffprobePath,
	version,
	url,
};
