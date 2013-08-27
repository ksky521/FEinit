var JSArr = [
    'intro',
    'vars',
    'loadJS',
    'getVersion',
    'openByIframe',
    'getVersion',
    'getUpdateInfo',
    'core',
    'outro'
].map(function(v) {
    return 'src/' + v+'.js';
});

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                jshintrc: '.jshintrc'
            },
            globals: {
                console: true
            },
            files: ['src/*.js']
        },

        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: JSArr,
                dest: 'build/<%= pkg.name %>.all.js'
            }
        },
        uglify: {
            options: {},
            dist: {
                src: 'build/<%= pkg.name %>.all.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        watch: {
            files: JSArr,
            tasks: ['concat']
        },
        compress: {
            main: {
                options: {
                    archive: 'project.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**'],
                    filter: 'isFile'
                }]
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('build', ['jshint', 'concat', 'uglify']);

};