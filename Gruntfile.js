module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.initConfig({
		jshint: {
			all: [ 'lib/*.js' ]
		},
		nodeunit: {
			tests: ['test/*.js']
		}
	});

	grunt.registerTask('test', ['nodeunit']);
	grunt.registerTask('default', ['jshint', 'test']);
};