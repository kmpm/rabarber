/*global module:false*/
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    browserify2: {
      dev: {
        entry: './src/main.js',
        //mount: "<%= pkg.name %>.js",
        //server: './server.js',
        compile: 'frontend/static/<%= pkg.name %>.js',
        beforeHook: function (bundle) {
          bundle.transform(require('simple-jadeify'));
        },
        debug: true
      }
    },
    /*concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['compile/<%= pkg.name %>.js'],
        dest: 'views/<%= pkg.name %>.js'
      }
    },*/
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= browserify2.dev.compile %>',
        dest: 'frontend/static/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        sub: true,
        indent: 2,
        //white: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true,
        laxcomma: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      frontend: {
        options: {
          browser: true
        },
        src: ['src/**/*.js']
      },
      backend: {
        src: ['lib/**/*.js', 'test/**/*.js', 'server.js', 'app.js']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'nodeunit']
      }
    },
    jade: {
      compile: {
        pretty: true,
        options: {
          data: {
            debug: true
          }
        },
        files: {
          "frontend/static/index.html": ["src/templates/index.jade"]
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-browserify2');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jade', 'browserify2:dev', 'uglify']);

};
