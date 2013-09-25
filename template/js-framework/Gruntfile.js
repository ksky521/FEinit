var concatArr = [
    'src/intro.js',
    'src/outro.js'
];

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // configure JSHint (documented at http://www.jshint.com/docs/)
            dist: {
                options: {
                    jshintrc: '.jshintrc'
                },
                globals: {
                    console: true
                },
                src: ['src/*.js']
            },
            build: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: '<%= concat.dist.dest %>'
            }
        },
        watch: {
            files: ['src/*.js'],
            tasks: 'dev'
        },
        concat: {
            dist: {
                options: {
                    separator: grunt.util.linefeed,
                    process: function(str, filepath) {

                        if (/(.css|.js)$/.test(filepath)) {
                            var lines = str.split(/\r\n|\n/g);
                            var count = 0;
                            var filename = filepath.split('/').reverse()[0];
                            var regStart = /^\s?(\*|\/\*)/,
                                regEnd = /\*\/\s?$/;
                            var tag;
                            lines = lines.map(function(l) {
                                count++;

                                var tagStart = regStart.test(l),
                                    tagEnd = regEnd.test(l);

                                if (tagStart) {
                                    tag = true;
                                }

                                if (!tag && !tagEnd) {
                                    l = '/* L ' + count + ' @' + filename + ' */' + l;
                                }
                                // switch back tag flag when endbuild
                                if (tag && tagEnd) {
                                    tag = false;
                                }
                                return l;
                            });
                            str = lines.join(grunt.util.linefeed);
                            return str;
                        }
                    }
                },
                src: concatArr,
                dest: 'build/<%= pkg.name %>.<%= pkg.version %>.js'
            },
            dev: {
                options: {
                    separator: grunt.util.linefeed,
                    process: function(str, filepath) {

                        if (/(.css|.js)$/.test(filepath)) {
                            var arr = str.split(/\r\n|\n/g);
                            var count = 1;
                            var filename = filepath.split('/').reverse()[0];
                            arr = arr.map(function(line) {
                                line = '/* L ' + count + ' @' + filename + ' */' + line;
                                count++;
                                return line;
                            });
                            str = arr.join(grunt.util.linefeed);
                        }
                        return str;
                    }
                },
                src: concatArr,
                dest: 'tmp/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                sourceMap: 'lib/<%= pkg.name %>.<%= pkg.version %>.map',
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> by <%= pkg.author %> */\n'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'lib/<%= pkg.name %>.<%= pkg.version %>.min.js'
            }
        },
        compress: {
            main: {
                options: {
                    archive: '<%= pkg.name %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['**'],
                    filter: 'isFile'
                }]
            }
        }
    });

    // grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('build', ['concat', 'jshint:build', 'uglify']);
    grunt.registerTask('dev', ['concat:dev', 'jshint']);

};
