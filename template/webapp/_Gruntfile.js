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
            files: ['src/js/*.js']
        },
        <% if (Sass=='y' || Sass=='Y') { %>
        compass: {
          dev: {
            options: {
              config: 'config.rb'
            }
          },
          build: {
            options: {
              config: 'config.rb',
              outputStyle: 'compressed',
              cssDir: 'src/css/'
            }
          }
        },
        <% } %>
        // concat: {
        //     options: {
        //         separator: grunt.util.linefeed,
        //         process: function(str, filepath) {

        //                 if (/(.css|.js)$/.test(filepath)) {
        //                     var arr = str.split(/\r\n|\n/g);
        //                     var count = 1;
        //                     var filename = filepath.split('/').reverse()[0];
        //                     arr = arr.map(function(line) {
        //                         line = '/* L ' + count + ' @' + filename + ' */' + line;
        //                         count++;
        //                         return line;
        //                     });
        //                     str = arr.join(grunt.util.linefeed);
        //                 }
        //                 return str;
        //             }
        //     },
        //     dist: {
        //         src: JSArr,
        //         dest: '.js'
        //     }
        // },
        uglify: {
            options: {},
            dist: {
                src: 'src/js/*.js',
                dest: 'src/js/all.min.js'
            }
        },
        // watch: {
        //     files: JSArr,
        //     tasks: ['concat']
        // },
        compress: {
            main: {
                options: {
                    archive: 'project.zip'
                },
                files: [{
                    expand: true,
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

    grunt.registerTask('build', ['jshint', 'uglify']);

};
