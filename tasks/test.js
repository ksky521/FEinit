var path = require('path');
var findup = require('findup-sync');


module.exports = function(grunt){
    grunt.registerTask('test', 'fdsafd', function(arg){
        var exeRoute = findup('./');
        console.log(exeRoute);
        grunt.log.writeln(path.dirname('./lib'),arguments,this);
    });
}