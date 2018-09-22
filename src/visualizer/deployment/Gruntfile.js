/**
 * Exemplifies the deployment of a yFiles for HTML-based application with one of the demos that come with the yFiles
 * package.
 *
 * This script creates a 'flattened' directory structure in the destination directory 'dist':
 * - dist: The demo's source code file are placed at the top level
 * - dist/lib: The yFiles library
 * - dist/resources: The shared demo resources like demo-app, require, and other resource files
 * - dist/utils: The shared demo utility scripts for e.g. context menus, drag and drop panels, etc.
 */
module.exports = function(grunt) {
  var root = '../'
  var demoName = 'complete/orgchart/'
  var contentSrc = root + 'demos/'
  var appDest = root + 'dist/'
  var es5DemosDest = root + 'demos-es5/'
  var libSrc = root + 'lib/'
  var build = root + 'build/'

  // exclude these demos from the demos-es5 tasks
  var nonTranspileDemos =
    'loading/webpack/**,toolkit/angular/**,toolkit/typescript/**,toolkit/react/**,loading/es6modules/**'

  grunt.registerTask(
    'deploy-es5',
    'Converts the application to ES5, obfuscates and minifies both the application sources ' +
      'and the yFiles modules, and references the Babel polyfill',
    [
      'init-deploy',
      'clean:all',
      'babel:app',
      'copy:nonJsSource',
      'copy:modules',
      'copy:polyfill',
      'replace:removeTypeinfo',
      'replace:addPolyfill',
      'replace:correctURLs',
      'replace:replaceArrowFunctions',
      'package',
      'copy:dist'
    ]
  )

  grunt.registerTask(
    'deploy',
    "Same as 'deploy-es5', but skips the Babel step for ES5 conversion",
    [
      'init-deploy',
      'clean:all',
      'copy:nonJsSource',
      'copy:demoSource',
      'copy:modules',
      'replace:removeTypeinfo',
      'replace:correctURLs',
      'package',
      'copy:dist'
    ]
  )

  grunt.registerTask('demos-es5', 'Convert all demos and tutorials to ES5', [
    'init-demos',
    'clean:all',
    'babel:demos',
    'copy:polyfill',
    'copy:demoResources',
    'replace:addPolyfill',
    'replace:addPolyfillWebworker',
    'replace:replaceArrowFunctions',
    'copy:es5'
  ])

  grunt.registerTask('init-demos', function() {
    grunt.config.set('destDir', es5DemosDest)
  })

  grunt.registerTask('init-deploy', function() {
    grunt.config.set('destDir', appDest)
  })

  grunt.initConfig({
    // The main yFiles deployment task provided by grunt-yfiles-deployment.
    package: {
      options: {
        // The base path to the yFiles library files. This will be replaced with libDest when writing the output files.
        libSrc: build + 'lib/',
        // The base destination path of the yFiles library files.
        libDest: '<%= destDir %>lib/',
        // The list of yFiles modules that should be processed. Dependencies of the specified modules are collected
        // and processed as well.
        modules: [
          'yfiles/lang',
          'yfiles/view-graphml',
          'yfiles/view-layout-bridge',
          'yfiles/layout-tree',
          'yfiles/view-component'
        ],
        // The user files to process. This can be both JavaScript source code files and other resources like HTML,
        // images and CSS files. Depending on the settings below, source code might be obfuscated and/or optimized while
        // other files are simply copied to the destination.
        // Note that this file set must not contain the yFiles library files.
        // In this example, a separate copy task is used to make the coping of resource files more clear.
        files: [
          {
            // In this example, this specifies the JavaScript files in the specified demo directory.
            // The resulting files will be placed relative to top-level destination directory.
            // The sub-directory 'node_modules' that might be created by some demos is excluded.
            expand: true,
            cwd: build,
            src: ['**/*.js', '!lib/**'],
            dest: '<%= destDir %>'
          },
          {
            // In this example, the demo-util.js and require.js are needed as well.
            // The resulting files will be placed in the 'resources' directory in the destination.
            expand: true,
            cwd: build + 'resources',
            src: ['demo-util.js', 'demo-error.js', 'require.js'],
            dest: '<%= destDir %>resources'
          }
        ],
        // Optionally add some names to the blacklist that must not be renamed during obfuscation.
        // For example, names of third party libraries.
        // Some common names are always blacklisted by this task (e.g., most members of the standard HTML API).
        blacklist: [
          'resources' // almost every demo uses 'resources' in the requirejs configuration
        ],

        // Specifies whether the user source code files will be obfuscated. If set to 'false', all names used in these
        // files are added to the blacklist automatically, leaving the semantics of your files unchanged.
        // Obfuscation can be fine-tuned with the in-code annotations @yjs:keep and @yjs:blacklist.
        obfuscate: true,

        // Specifies whether the user source code files will be optimized/minimized.
        optimize: false,

        // keep|umd|amd|cjs
        // Only 'keep' is allowed when using ES6 modules
        moduleType: 'keep',

        // Whether the user code should be mangled
        mangle: true
      },
      build: {
        // This empty target is required for technical reasons. Don't remove it.
      }
    },

    babel: {
      app: {
        options: {
          presets: [require.resolve('babel-preset-es2015')],
          compact: false
        },
        files: [
          {
            expand: true,
            cwd: contentSrc + demoName,
            src: ['**/*.js', '!**/node_modules/**'],
            dest: build,
            ext: '.js'
          },
          {
            expand: true,
            cwd: contentSrc + 'resources',
            src: ['**/*.js', '!**/node_modules/**'],
            dest: build + '/resources',
            ext: '.js'
          },
          {
            expand: true,
            cwd: contentSrc + 'utils',
            src: ['**/*.js', '!**/node_modules/**'],
            dest: build + '/utils',
            ext: '.js'
          }
        ]
      },

      demos: {
        options: {
          presets: [require.resolve('babel-preset-es2015')],
          compact: false
        },
        files: [
          {
            expand: true,
            cwd: contentSrc,
            src: ['**/*.js', '!**/node_modules/**', '!{' + nonTranspileDemos + '}'],
            dest: build,
            ext: '.js'
          }
        ]
      }
    },

    clean: {
      // Without the 'force' option, this task cannot delete files outside this file's subtree
      options: { force: true },
      // Remove all created files in the destination directories.
      all: ['<%= destDir %>', build]
    },
    copy: {
      // Copies non-JavaScript source code files from the demos and lib directories to the destination.
      nonJsSource: {
        files: [
          {
            // In this example, this specifies the resource files in the specified demo directory.
            // The resulting files will be placed relative to the top-level destination directory.
            // The sub-directory 'node_modules' that might be created by some demos is excluded.
            expand: true,
            cwd: contentSrc + demoName,
            src: ['**', '!**/node_modules/**', '!**/*.js'],
            dest: build
          },
          {
            // In this example, this specifies the shared resource files of the demos.
            // The resulting files will be placed relative to the 'resources' directory in the destination.
            expand: true,
            cwd: contentSrc + 'resources',
            src: ['**', '!**/*.js'],
            dest: build + 'resources/'
          },
          {
            // In this example, this specifies the lib/yfiles.css file.
            src: libSrc + 'yfiles.css',
            dest: build + 'lib/yfiles.css'
          }
        ]
      },
      polyfill: {
        // Copy the babel polyfill
        src: './node_modules/babel-polyfill/dist/polyfill.min.js',
        dest: '<%= destDir %>resources/polyfill.js'
      },

      modules: {
        files: [
          {
            expand: true,
            cwd: libSrc + 'umd/',
            src: ['**/*.{js,mjs}'],
            dest: build + '/lib'
          }
        ]
      },

      // Copies JavaScript files from the demo folder to build/
      // Only needed if babel is not used
      demoSource: {
        files: [
          {
            expand: true,
            cwd: contentSrc + demoName,
            src: ['**/*.js', '!**/node_modules/**'],
            dest: build,
            ext: '.js'
          },
          {
            expand: true,
            cwd: contentSrc + 'resources',
            src: ['**/*.js', '!**/node_modules/**'],
            dest: build + '/resources'
          },
          {
            expand: true,
            cwd: contentSrc + 'utils',
            src: ['**/*.js', '!**/node_modules/**'],
            dest: build + '/utils'
          }
        ]
      },

      demoResources: {
        files: [
          {
            cwd: contentSrc,
            src: [
              '**/*.{html,css,svg,gif,png,graphml,xml,json,cur}',
              '!**/node_modules/**',
              '!{' + nonTranspileDemos + '}'
            ],
            dest: build,
            expand: true
          }
        ]
      },

      dist: {
        files: [
          {
            expand: true,
            cwd: build,
            src: ['**', '!**/*.{js,mjs}'],
            dest: '<%= destDir %>'
          }
        ]
      },

      es5: {
        files: [
          {
            expand: true,
            cwd: build,
            src: ['**/*.{js,html,css,svg,gif,png,graphml,xml,json,cur}'],
            dest: '<%= destDir %>'
          }
        ]
      }
    },
    replace: {
      // Removes the script tag that loads the file 'yfiles-typeinfo.js' from HTML files
      removeTypeinfo: {
        src: [build + '**/*.html'],
        overwrite: true,
        replacements: [
          {
            from: /(<script src=)(.*?\/yfiles-typeinfo\.js.)(><\/script>)/g,
            to: ''
          }
        ]
      },

      //
      // Add the Babel polyfill before the closing </head> tag
      //
      addPolyfill: {
        src: [build + '**/*.html'],
        overwrite: true,
        replacements: [
          {
            from: /(\s*?)(<\/head>)/,
            to: '\n$1  <script src="../../resources/polyfill.js"></script>\n$1$2'
          }
        ]
      },

      addPolyfillWebworker: {
        // Remove yfiles-typeinfo reference and add polyfill in WebWorker demo
        src: [build + 'loading/webworker/**/*.js'],
        overwrite: true,
        replacements: [
          {
            from: /importScripts\(['"]\.\.\/\.\.\/resources\/require\.js['"]\)/,
            to: "$&;importScripts('../../resources/polyfill.js')"
          }
        ]
      },

      // Adjusts the URLs to the 'flattened' destination directory structure in HTML files, especially references to the
      // yFiles library and the shared demo resources.
      correctURLs: {
        src: [build + '**/*.{html,js}'],
        overwrite: true,
        replacements: [
          {
            from: /..\/..\/..\/lib(\/umd|\/es6-modules)?(\/)?/g,
            to: './lib$2'
          },
          {
            from: /..\/..\/resources(\/)?/g,
            to: './resources$1'
          },
          {
            from: /..\/..\/utils(\/)?/g,
            to: './utils$1'
          }
        ]
      },
      //
      // Replace arrow functions from <script> blocks in html
      // files - these scripts are not converted by babel.
      //
      replaceArrowFunctions: {
        src: [build + '**/*.html'],
        overwrite: true,
        replacements: [
          //
          // Replace simple arrow functions
          //
          {
            from: /([\w\d]+)\s*=>\s*([\w\.]+\(\))/g,
            to: 'function ($1) {$2}'
          },

          //
          // Replace arrow functions that use block scope
          // (a,b) => {
          //
          {
            from: /\(([\w\d\s,]+)\)\s*=>\s*\{/g,
            to: 'function ($1) {'
          },

          //
          // Replace arrow functions that use block scope
          // and just a single param (no parens)
          // a => {
          //
          {
            from: /([\w\d]+)\s*=>\s*\{/g,
            to: 'function ($1) {'
          }
        ]
      }
    }
  })

  // Load all grunt tasks listed in package.json, including grunt-yfiles-deployment
  require('load-grunt-tasks')(grunt)
}
