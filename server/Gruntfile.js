module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // concat: {
    //   // options: {
    //   //   separator: ';'
    //   // },
    //   // dist: {
    //   //   src: ['app.js', 'phantomRender.js'],
    //   //   dest: 'dist/<%= pkg.name %>.js'
    //   // }
    // },
    // copy: {
    //   main: {
    //     files: [
    //       // includes files within path
    //       // {expand: false, src: ['bower_components/holderjs/holder.js'], dest: 'client/holder.js', filter: 'isFile'}
    //       // ,{expand: false, src: ['bower_components/socket.io-client/socket.io.js'], dest: 'client/socket.io.js', filter: 'isFile'}
    //       // ,{expand: false, src: ['bower_components/angular-socket-io/socket.js'], dest: 'client/socket.js', filter: 'isFile'}
    //     ]
    //   }
    // }, 
    concurrent: {
      dev: [ 'nodemon','watch'], //'nodemon',
      options: {
        logConcurrentOutput: true
      }
    },
    nodemon: {
        dev: {
            script: 'app.js',
            options: {
                /** Environment variables required by the NODE application **/
                env: {
                      "NODE_ENV": "development"
                    , "NODE_CONFIG": "dev"
                    , "PORT": "3001"
                },
                delay: 300,

                callback: function (nodemon) {
                    nodemon.on('log', function (event) {
                        console.log(event.colour);
                    });

                    /** Open the application in a new browser window and is optional **/
                    // nodemon.on('config:update', function () {
                    //     // Delay before server listens on port
                    //     setTimeout(function() {
                    //         require('open')('http://127.0.0.1:3000');
                    //     }, 1000);
                    // });

                    /** Update .rebooted to fire Live-Reload **/
                    nodemon.on('restart', function () {
                        // Delay before server listens on port
                        setTimeout(function() {
                            require('fs').writeFileSync('.rebooted', 'rebooted');
                        }, 1000);
                    });
                }
            }
        },
        debug: {
            script: 'app.js',
            options: {
                /** Environment variables required by the NODE application **/
                env: {
                      "NODE_ENV": "development"
                    , "NODE_CONFIG": "dev"
                    , "PORT": "3001"
                },
                delay: 300,
                nodeArgs: ['--debug'],

                callback: function (nodemon) {
                    nodemon.on('log', function (event) {
                        console.log(event.colour);
                    });

                    /** Open the application in a new browser window and is optional **/
                    // nodemon.on('config:update', function () {
                    //     // Delay before server listens on port
                    //     setTimeout(function() {
                    //         require('open')('http://127.0.0.1:3000');
                    //     }, 1000);
                    // });

                    /** Update .rebooted to fire Live-Reload **/
                    nodemon.on('restart', function () {
                        // Delay before server listens on port
                        setTimeout(function() {
                            require('fs').writeFileSync('.rebooted', 'rebooted');
                        }, 1000);
                    });
                }
            }
        }
    },
    watch: {
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      } 
    }
    // ,devserver: {
    //   server: {
    //       options: {
    //         port: 8000
    //         ,base: "client"
    //       }
    //   }
    // }
  });

  //grunt.loadNpmTasks('grunt-contrib-uglify');  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-nodemon");
  grunt.loadNpmTasks("grunt-concurrent")

  

  grunt.registerTask('default', ['concurrent:dev']);
  grunt.registerTask('debug', ['concurrent:debug']);
  //grunt.registerTask('default', ['concurrent:dev']);

};