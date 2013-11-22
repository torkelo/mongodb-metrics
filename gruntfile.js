
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        mochaTest: {
            options: {
                reporter: 'spec'
            },
            src: ['tests/**/*.js']
        },

        watch: {
            scripts: {
                files: ['**/*.js', '**/*.json'],
                tasks: ['default'],
                options: {
                    spawn: true,
                },
            },
        },

        jshint: {
            nodecode: {
                src: ['app.js', 'lib/*.js', 'tests/**/*.js', 'gruntfile.js', '*.json'],
                options: { jshintrc: 'jshint-rules-nodejs.jshintrc' }
            }
        },
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'mochaTest']);

};