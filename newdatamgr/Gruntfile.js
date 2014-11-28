/*global module:false*/
module.exports = function(grunt) {
// Project configuration.
grunt.initConfig({
  // Metadata.
  uiname: 'datamgr',
  cssPath: 'css/',
  jsPath: 'js/',
  pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> */\n',
  // Task configuration.
  concat: {
    options: {
    banner: '<%= banner %>',
    stripBanners: true
    },
    dist: {
      src: ['js/*.js'],  // all children and subdir children
      dest: '<%= jsPath %><%= uiname %>.js'  
    }
  },

  uglify: {
    options: {
    banner: '<%= banner %>'
    },
    dist: {
      src: '<%= concat.dist.dest %>',
      dest: '<%= jsPath %><%= uiname %>.min.js'
    }
  },
  less: {
    compileCore: {
      options: {
      strictMath: false,
      sourceMap: false,
      outputSourceFiles: false,
      sourceMapURL: '<%= uiname %>.css.map',
      sourceMapFilename: '<%= cssPath %><%= uiname %>.css.map'
      },
      files: {
        '<%= cssPath %><%= uiname %>.css': 'less/main.less',
      }
    }
  },

  cssmin:{
    options: {
      banner: '<%= banner %>'
    },
    combine:{
      files:{
        '<%= cssPath %><%= uiname %>.min.css':'<%= cssPath %><%= uiname %>.css'
      }
    }
  },

  watch: {
    /*lib_js: {
      files: '<%= concat.dist.src %>',
      tasks: ['concat:dist', 'uglify:dist']
    },*/
    lib_css:{
      files: 'less/**/*.less',
      tasks: ['less:compileCore']
    }
  }
});

// These plugins provide necessary tasks.
require('load-grunt-tasks')(grunt);
// Default task.
grunt.registerTask('default', ['less']);
};
