'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			target: [
				'*.js',
				'src/*.js'
			]
		},
		nsp: {
			package: grunt.file.readJSON('package.json')
		}
	});

	// Tasks
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-nsp');

	// Aliases
	grunt.registerTask('test', ['eslint', 'nsp']);
	grunt.registerTask('default', ['test']);
};
