module.exports = function(grunt) {
  var esprima = require('esprima'),
    escodegen = require('escodegen'),
    estraverse = require('estraverse'),
    esmangle = require('esmangle'),
    es6 = require('es6-shim'),
    path = require('path'),
    headerGenerators = require('./lib/headerGenerators')

  var Syntax = esprima.Syntax

  /**
   * @class Map
   * @property {number} size
   * @property {function} get
   * @property {function} set
   * @property {function} has
   * @property {function} forEach
   */
  var Map = es6.Map
  /**
   * @class Set
   * @property {number} size
   * @property {function} add
   * @property {function} has
   * @property {function} forEach
   */
  var Set = es6.Set

  /**
   * @typedef {Object} ModuleInfo
   * @property {string} path
   * @property {boolean} isImplModule
   * @property {Object} [ast]
   * @property {Array.<string>} [dependencies]
   **/

  var /** @type Array.<string> */ canvasRenderingContext2DMembers = require('./excludes/canvas2D.json')
  var /** @type Array.<string> */ attributedMemberExcludes = require('./excludes/attributedMembers.json')
  var /** @type Array.<string> */ jsExcludes = require('./excludes/js.json')

  var hardBlacklist = new Set(
    canvasRenderingContext2DMembers.concat(attributedMemberExcludes).concat(jsExcludes)
  )

  var encodingOptions = { encoding: 'utf-8' }
  var parserOptions = {}
  var rangeParserOptions = { comment: true, range: true, tokens: true }

  /**
   * Returns an option object for escodegen
   * @param {boolean} beautify - Whether the generator options should produce beautiful code
   * @param {boolean} writeComments - Whether to write comments. Comments should only be written if really necessary,
   * because there's an escodegen bug that breaks return statements with comments: https://github.com/estools/escodegen/issues/258
   * @returns {object} An option object for escodegen
   */
  function getGeneratorOptions(beautify, writeComments) {
    writeComments = writeComments === void 0 ? true : writeComments
    if (beautify === undefined || beautify == false) {
      return {
        format: {
          compact: true,
          parentheses: false,
          semicolons: false,
          safeConcatenation: true
        },
        comment: writeComments
      }
    } else {
      return {
        format: {
          indent: {
            style: '  ',
            base: 0,
            adjustMultilineComment: true
          }
        },
        comment: writeComments
      }
    }
  }

  /**
   *
   */
  grunt.registerMultiTask('package', 'Package yFiles for HTML.', function() {
    var options = this.options()
    var libSrc = options.libSrc || '../lib'
    var modules = (options.modules || ['yfiles/complete']).map(getWithJsExtension)

    grunt.config.merge({
      collectModules: {
        build: {
          files: [{ cwd: libSrc, src: modules, expand: true }]
        }
      }
    })
    grunt.task.run('collectModules:build')

    grunt.config.merge({
      collectMappings: {
        build: {}
      }
    })
    grunt.task.run('collectMappings:build')

    grunt.config.merge({
      collect: {
        build: {
          files: options.files
        }
      }
    })
    grunt.task.run('collect:build')

    grunt.config.merge({
      packageCore: {
        build: {
          files: options.files
        }
      }
    })
    grunt.task.run('packageCore:build')
  })

  /**
   * Obfuscation Scope Info class.
   *
   * @param {number} obfuscationMode Whether this section may be obfuscated
   * @param {number[]} [range] The range this info applies to
   * @constructor
   */
  function ObfuscationScopeInfo(obfuscationMode, range) {
    this.obfuscationMode = obfuscationMode
    this.blacklist = new Set()
    this.globalBlackList = new Set()
    this.range = range || [0, Number.MAX_VALUE]
    this.parent = null
    this.children = []

    /**
     * Returns whether the given range is contained in the range of this scope.
     * @returns {boolean}
     */
    this.isInRange = function(range) {
      return this.range[0] <= range[0] && this.range[1] >= range[1]
    }

    /**
     * Adds an element to the local blacklist
     * @param {string} item The item to add to the black list
     */
    this.addBlackListItem = function(item) {
      return this.blacklist.add(item)
    }

    /**
     * Adds an element to the local blacklist
     * @param {string} item The item to add to the black list
     */
    this.addGlobalBlackListItem = function(item) {
      return this.parent !== null
        ? this.parent.addGlobalBlackListItem(item)
        : this.globalBlackList.add(item)
    }

    /**
     * Main method that recursively checks the blacklist status up to the root of the obfuscation scope.
     * @param {string} name
     * @returns {boolean}
     */
    this.isBlacklisted = function(name) {
      return (
        this.obfuscationMode === ObfuscationScopeInfo.MODE_BLACKLIST ||
        isBlacklistedCore.call(this, name)
      )
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    function isBlacklistedCore(name) {
      return (
        this.blacklist.has(name) ||
        (this.parent !== null && isBlacklistedCore.call(this.parent, name))
      )
    }

    /**
     * Creates a new child scope of this scope.
     * @param {number} obfuscationMode The mode constant
     * @param {number[]} range
     * @returns {module.ObfuscationScopeInfo}
     */
    this.addChildInfo = function(obfuscationMode, range) {
      var child = new ObfuscationScopeInfo(obfuscationMode, range)
      child.parent = this
      this.children.push(child)
      return child
    }
  }

  /**
   * Finds the corresponding ObfuscationScopeInfo for the given range (of an AST node).
   *
   * @param {number[]} range The range in question.
   * @param {ObfuscationScopeInfo} parentScopeInfo The root info that contains information about the tree the ast resides in.
   * @return {ObfuscationScopeInfo} The info to apply.
   */
  function getObfuscationScopeInfo(range, parentScopeInfo) {
    if (!range || !parentScopeInfo || !parentScopeInfo.isInRange(range)) {
      return ObfuscationScopeInfo.DEFAULT
    }
    for (var i = 0; i < parentScopeInfo.children.length; i++) {
      var child = parentScopeInfo.children[i]
      if (child.isInRange(range)) {
        return getObfuscationScopeInfo(astNode, child)
      }
    }
    return parentScopeInfo
  }

  ObfuscationScopeInfo.MODE_OBFUSCATE = 1 // rename everything
  ObfuscationScopeInfo.MODE_BLACKLIST = 2 // blacklist everything
  ObfuscationScopeInfo.MODE_KEEP = 3 // don't rename, but don't blacklist either

  ObfuscationScopeInfo.DEFAULT = new ObfuscationScopeInfo(ObfuscationScopeInfo.MODE_BLACKLIST)

  /**
   * AST visitor that annotates the AST nodes with ObfuscationScopeInfo instances and then invokes the given visitor.
   *
   * @param {object} ast The AST.
   * @param {ObfuscationScopeInfo} rootObfuscationInfo The root ObfuscationScopeInfo.
   * @param {function} visitor
   */
  function parseWithScope(ast, rootObfuscationInfo, visitor) {
    rootObfuscationInfo = rootObfuscationInfo || ObfuscationScopeInfo.DEFAULT
    var bodyObfuscationInfo

    estraverse.traverse(ast, {
      enter: function(node, parent) {
        var parentObfuscationInfo =
          (parent && parent.obfuscationInfo) ||
          getObfuscationScopeInfo(node.range, rootObfuscationInfo)
        node.obfuscationInfo = createScopeObfuscationInfo(node, parentObfuscationInfo)
        if (parent === null) {
          bodyObfuscationInfo = node.obfuscationInfo
        }
        visitor(node, parent)
      },
      leave: function(node, parent) {
        if (node.obfuscationInfo) {
          delete node.obfuscationInfo
        }
      }
    })

    return bodyObfuscationInfo

    /**
     * Returns a ScopeObfuscationInfo for the current node. If the current node has no scope annotations, this is the
     * parent scope. Otherwise, a new scope object is created.
     */
    function createScopeObfuscationInfo(node, parentScopeInfo) {
      var comments = node.leadingComments
      if (!comments || comments.length < 0) {
        return parentScopeInfo
      }

      var currentScope = parentScopeInfo

      for (var i = 0; i < comments.length; i++) {
        var comment = comments[i].value
        var newScope
        if ((newScope = checkForKeepAnnotation(comment))) {
          currentScope = newScope
        }
        if ((newScope = checkForBlacklistAnnotation(comment))) {
          currentScope = newScope
        }
        if (/@yjs:\s*(unsafe|exclude)/g.exec(comment)) {
          return parentScopeInfo.addChildInfo(ObfuscationScopeInfo.MODE_BLACKLIST, node.range)
        }
        var results
        if ((results = /@yjs:\s*obfuscate\s+exclude\s*=\s*(.+)/g.exec(comment))) {
          addElements(results[1], function(el) {
            parentScopeInfo.addGlobalBlackListItem(el)
          })
        }
      }

      return currentScope

      function checkForKeepAnnotation(comment) {
        var matchResults
        if (!(matchResults = /@yjs:\s*keep(\s*=\s*(.+))?/g.exec(comment))) {
          return null
        }
        if (matchResults.length < 3 || !matchResults[2]) {
          // keep without list of names > keep all elements inside this scope
          return parentScopeInfo.addChildInfo(ObfuscationScopeInfo.MODE_KEEP, node.range)
        }
        // list of elements to keep inside this scope
        var scope = parentScopeInfo.addChildInfo(ObfuscationScopeInfo.MODE_OBFUSCATE, node.range)
        addElements(matchResults[2], function(el) {
          scope.addBlackListItem(el)
        })
        return scope
      }

      function checkForBlacklistAnnotation(comment) {
        var matchResults
        if (!(matchResults = /@yjs:\s*blacklist(\s*=\s*(.+))?/g.exec(comment))) {
          return null
        }
        if (matchResults.length < 3 || !matchResults[2]) {
          // add all elements from this scope to the global blacklist -> this is done in the Usage Visitor
          return parentScopeInfo.addChildInfo(ObfuscationScopeInfo.MODE_BLACKLIST, node.range)
        }
        // list of elements to add to the global blacklist
        addElements(matchResults[2], function(el) {
          parentScopeInfo.addGlobalBlackListItem(el)
        })
        return null
      }

      function addElements(list, f) {
        if (list) {
          var elements = list.split(/\s*,\s*/)
          elements &&
            elements.forEach(function(el) {
              if (el && el.length > 0) {
                f(el)
              }
            })
        }
      }
    }
  }

  /**
   * The main mapping logic. Stores lists, mappings, and generates new names...
   *
   * @param {Map} suggestedMapping Suggests a short name for a given public name.
   * @param {es6.Set} blacklist A set of blacklisted names.
   * @param {es6.Set} obfuscationNames A set of names that we *could* obfuscate.
   * @param {es6.Set} usedNames
   * @constructor
   */
  function Mapper(suggestedMapping, blacklist, obfuscationNames, usedNames) {
    // the resulting mapping
    var mapping = new Map()
    this.es6NameMap = new Map()
    var generatedNamesCounter = 0
    // constant for name generation
    var firstChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // initialize suggested mapping if not given
    suggestedMapping = suggestedMapping || new Map()
    blacklist = blacklist || new Set()
    usedNames = usedNames || new Set()

    /**
     * Returns the mapped name for the given original name.
     * @param {string} name
     * @returns {string}
     */
    this.getObfuscatedName = function(name) {
      if (isBlacklisted.call(this, name)) {
        // keep it
        return name
      } else {
        var mapped = mapping.get(name)
        if (!mapped) {
          // not yet mapped
          var newName = suggestedMapping.get(name)
          if (newName) {
            mapped = newName
          }
          if (!mapped) {
            mapped = generateObfuscatedName.call(this)
          }
        }
        mapping.set(name, mapped)
        return mapped
      }
    }

    this.isUsed = function(name) {
      return (
        usedNames.has(name) ||
        (this.es6NameMap.has(name) && usedNames.has(this.es6NameMap.get(name)))
      )
    }

    this.shouldObfuscate = function(name) {
      return obfuscationNames.has(name) && !isBlacklisted.call(this, name)
    }

    function isBlacklisted(name) {
      return hardBlacklist.has(name) || blacklist.has(name)
    }

    function generateObfuscatedName() {
      return generateShortName('__', generatedNamesCounter++)
    }

    function generateShortName(prefix, index) {
      if (index < firstChars.length) {
        if (!prefix || !prefix.length) {
          return firstChars.charAt(index)
        } else {
          return prefix + firstChars.charAt(index)
        }
      } else {
        var result = prefix || ''
        var remainder = index
        while (remainder > 0) {
          result += firstChars.charAt(remainder % firstChars.length)
          remainder = (remainder / firstChars.length) | 0
        }
        return result
      }
    }
  }

  /**
   * Returns the very first expression of the type "define([], identifier|function)" in the given AST to detect the yFiles
   * define expression: define(["dependency"], factory).
   */
  function findDefine(ast) {
    var define = null
    estraverse.traverse(ast, {
      enter: function(node, parent) {
        if (
          node.type === Syntax.CallExpression &&
          node.callee.type === Syntax.Identifier &&
          node.callee.name === 'define' &&
          node.arguments.length === 2 &&
          node.arguments[0].type === Syntax.ArrayExpression &&
          (node.arguments[1].type === Syntax.Identifier ||
            node.arguments[1].type === Syntax.FunctionExpression)
        ) {
          define = node
          this.break()
        }
      }
    })
    return define
  }

  /**
   * Finds the AMD define call and extracts the dependency array, or collects all import declaration sources.
   * @returns {string[]} An array of the dependencies.
   */
  function getDependencies(ast, hasLangInPath) {
    var define = findDefine(ast)
    if (define) {
      var elements = []
      define.arguments[0].elements.forEach(function(e) {
        if (e.type === Syntax.Literal) {
          elements.push(e.value)
        }
      })
      return elements
    } else {
      var imports = []
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (node.type === Syntax.ImportDeclaration) {
            imports.push(node.source.value)
          }
        }
      })
      if (imports.length === 0 && !hasLangInPath) {
        grunt.log.writeln('Warning: Dependencies not found')
      }
      return imports
    }
  }

  /**
   * Processes the array of dependencies: duplicates and self-dependencies are eliminated
   * @param {string[]} deps
   * @param {string} modulePathAndName
   * @return {string[]}
   */
  function adjustDependencies(deps, modulePathAndName) {
    var newDeps = new Set(deps)

    if (newDeps.has(modulePathAndName)) {
      newDeps.delete(modulePathAndName)
      grunt.log.warn('Recursive dependency in ' + modulePathAndName)
    }

    return Array.from(newDeps)
  }

  /**
   * Finds the line "yfiles.lang.addMappings(version, map, override) in a module file and returns that element.
   */
  function findMappingAstElement(ast) {
    var mapAstElements = []
    processMap(ast, function(element) {
      mapAstElements.push(element)
    })
    return mapAstElements

    function processMap(ast, visitor) {
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (
            node.type === Syntax.CallExpression &&
            node.callee.type === Syntax.MemberExpression &&
            node.callee.property.name === 'addMappings' &&
            node.arguments.length >= 2
          ) {
            var owner = node.callee.object
            if (
              (owner.type === Syntax.Identifier && owner.name === 'lang') ||
              (owner.type === Syntax.MemberExpression &&
                owner.property.name === 'lang' &&
                node.arguments[0].type === Syntax.Literal &&
                node.arguments[1].type === Syntax.ObjectExpression)
            ) {
              visitor(node.arguments[1])
            }
          }
        }
      })
    }
  }

  /**
   *
   */
  grunt.registerMultiTask('packageCore', 'The core thing', function() {
    var suggestedMapping = grunt.config.getRaw('package.options.suggestedMapping') || new Map()
    var obfuscationNames = grunt.config.getRaw('package.options.obfuscationNames') || new Set()
    var dependentNames = grunt.config.getRaw('package.options.dependentNames') || new Map()
    var usedNames = grunt.config.getRaw('package.options.usedNames') || new Set()
    var options = grunt.config('package.options')
    var blacklistNames = new Set(options.blacklist || [])
    var shouldObfuscate = !!options.obfuscate
    var shouldCreateModulesBundle = !!options.createModulesBundle
    var shouldOptimize = typeof options.optimize == 'undefined' || !!options.optimize
    var shouldMangle = !!options.mangle
    var headerType = (options.moduleType || 'keep').toLowerCase()
    var definePrefix =
      (['umd', 'amd', 'keep'].indexOf(headerType) > -1 && options.definePrefix) || false

    var changed = true
    var count
    do {
      count = usedNames.size
      dependentNames.forEach(function(dependents, key) {
        var longName = key
        if (usedNames.has(longName)) {
          grunt.verbose.writeln(
            'Adding dependent names for ' + longName + ': ' + dependents.join(',')
          )
          dependents.forEach(function(dependentName) {
            usedNames.add(dependentName)
          })
        }
      })
    } while (usedNames.size > count)

    var mapper = new Mapper(
      suggestedMapping,
      blacklistNames,
      obfuscationNames,
      usedNames,
      dependentNames
    )

    // Package the modules into a single file
    var copyCount = 0,
      jsCount = 0
    var modules = this.options().modules || []
    modules.forEach(function(srcPath) {
      var modulePathAndName = srcPath.substr(0, srcPath.length - 3)
      var subPath = path.relative(options.libSrc, srcPath)
      var destPath = fixPathOnWindows(path.join(options.libDest, subPath))
      if (endsWith(srcPath, '.js')) {
        packageModule(modulePathAndName, destPath, mapper, definePrefix, headerType)
      } else {
        copyCount++
        grunt.file.copy(srcPath, file.dest)
      }
    })

    if (shouldCreateModulesBundle) {
      createModulesBundle(options.libDest, options.modules, headerType)
    }

    // Obfuscate/copy the user files
    this.files.forEach(function(file) {
      file.src.forEach(function(srcPath) {
        if (endsWith(srcPath, '.js')) {
          jsCount++
          packageFile(srcPath, file.dest, mapper, shouldObfuscate, definePrefix)
        } else {
          copyCount++
          grunt.file.copy(srcPath, file.dest)
        }
      })
    })

    grunt.log.ok('Processed ' + jsCount + ' JS files, and copied ' + copyCount + ' other files.')
    //grunt.verbose.ok(this.filesSrc.length  + ' ' + grunt.util.pluralize(this.filesSrc.length, 'path/paths') + ' cleaned.');

    /**
     * Package the set of files that make up a single yFiles module into a target module.
     *
     * @param {string} modulePathAndName
     * @param {string} destPath The path to the resulting file
     * @param {Mapper} mapper The mapper that stores the mapping
     * @param {string|boolean} definePrefix define prefix or false
     * @param {string} headerType
     * @return {boolean} Whether packaging was successful.
     */
    function packageModule(modulePathAndName, destPath, mapper, definePrefix, headerType) {
      grunt.verbose.writeln('Packaging module ' + modulePathAndName)

      var file = grunt.file.read(getWithJsExtension(modulePathAndName), encodingOptions)
      var ast = parseSource(file, parserOptions)

      var isLangModule = endsWith(modulePathAndName, 'impl/lang')
      var isYfilesModule = /yfiles\//.test(modulePathAndName)
      var isImplModule = /yfiles\/impl\//.test(modulePathAndName)

      if (!isLangModule) {
        var mappingAstElements = findMappingAstElement(ast)
      }

      if (!isLangModule && !isYfilesModule) {
        return packageFile(
          getWithJsExtension(modulePathAndName),
          destPath,
          mapper,
          false,
          definePrefix
        )
      }

      /** @type ModuleInfo */
      var moduleInfo = {
        path: modulePathAndName,
        isImplModule: isImplModule,
        ast: ast
      }

      var headerGenerator = headerGeneratorFromOption(headerType)

      headerGenerator.removeCurrentHeader(moduleInfo)

      if (isLangModule) {
        headerGenerator.processLangModule(moduleInfo)
      } else {
        // this needs to happen before applyMapping
        obfuscateES6Modules(moduleInfo, mapper)

        // do the obfuscation of the mappings list
        // if(moduleInfo.isImplModule) {
        applyMapping(mapper)(mappingAstElements)
        // }

        var deps = getDependencies(ast, /lang/.test(modulePathAndName))
        moduleInfo.dependencies = adjustDependencies(deps, modulePathAndName)

        headerGenerator.wrapWithHeader(moduleInfo)
      }

      ast = moduleInfo.ast

      if (definePrefix) {
        replaceDefine(ast, definePrefix, modulePathAndName)
      }

      var astWithComments = parseSource(file, { comment: true })
      attachCopyrightHeader(ast, astWithComments.comments)

      grunt.file.write(
        destPath,
        escodegen.generate(ast, getGeneratorOptions(false)),
        encodingOptions
      )
    }

    function attachCopyrightHeader(ast, comments) {
      if (!comments || !comments[0]) {
        if (!grunt.option('ignoreModuleCopyrightHeader')) {
          grunt.warn('Could not extract the library module copyright header')
        }
        return
      }
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (!parent) {
            node.leadingComments = [comments[0]]
          }
        }
      })
    }

    /**
     * @param {string} headerType
     * @returns {AbstractHeaderGenerator}
     */
    function headerGeneratorFromOption(headerType) {
      switch (headerType.toLowerCase()) {
        case 'keep':
          return new headerGenerators.VoidHeaderGenerator()
        case 'umd':
          return new headerGenerators.UmdHeaderGenerator()
        case 'amd':
          return new headerGenerators.AmdHeaderGenerator()
        case 'cjs':
          return new headerGenerators.CjsHeaderGenerator()
        default:
          throw new Error('Unknown module type: ' + headerType)
      }
    }

    function replaceDefine(ast, definePrefix, path) {
      var define = findDefine(ast)
      if (define) {
        var prefix = definePrefix + '.'
        // replace the define invocation
        define.callee.name = prefix + define.callee.name

        // replace the define check
        // if ("function" == typeof define && define.amd) {
        estraverse.traverse(ast, {
          enter: function(node, parent) {
            if (
              node.type === Syntax.UnaryExpression &&
              node.operator === 'typeof' &&
              node.argument &&
              node.argument.type === Syntax.Identifier &&
              node.argument.name === 'define'
            ) {
              node.argument.name = prefix + node.argument.name
            } else if (
              node.type == Syntax.MemberExpression &&
              node.object.type === Syntax.Identifier &&
              node.object.name === 'define' &&
              node.property.type === Syntax.Identifier &&
              node.property.name === 'amd'
            ) {
              node.object.name = prefix + node.object.name
            }
          }
        })
      } else {
        console.log('Replace define: no define found in ' + path)
      }
    }

    /***
     * Create a module that just lists all options.modules as dependencies.
     * This file can be used as an entry point for browserify in order to
     * create a single yfiles bundle containing only the required modules.
     * @param {string} destPath The output directory for the modules bundle
     * @param {string[]} modules The array of modules specified in the Gruntfile
     * @param {string} headerType
     */
    function createModulesBundle(destPath, modules, headerType) {
      var headerGenerator = headerGeneratorFromOption(headerType)
      var ast = headerGenerator.generateModulesBundle(modules)

      var dest = normalizePath(path.join(destPath, 'yfiles', 'modules-bundle.js'))

      grunt.file.write(dest, escodegen.generate(ast, getGeneratorOptions(true)), encodingOptions)
    }

    /**
     * Uses the mapper to adjust the mapping information in a mapping object from the AST.
     * Works in place.
     * @param mapper the mapper to obtain the new obfuscated names
     * @return {applyMapping} the closure to pass to processMap
     */
    function applyMapping(mapper) {
      function remap(elem, name) {
        if (mapper.shouldObfuscate(elem[name])) {
          elem[name] = mapper.getObfuscatedName(elem[name])
        }
      }

      function obfuscateDecoratorVisitor(node, parent) {
        if (
          node.type === Syntax.CallExpression &&
          node.callee.type === Syntax.MemberExpression &&
          node.callee.property.type === Syntax.Identifier
        ) {
          switch (node.callee.property.name) {
            case 'Arg':
              // Arg(type, name)
              if (
                node.arguments.length > 1 &&
                node.arguments[1].type === Syntax.Literal &&
                typeof node.arguments[1].value === 'string'
              ) {
                remap(node.arguments[1], 'value')

                // Arg(type, modifier, name)
              } else if (
                node.arguments.length > 2 &&
                node.arguments[2].type === Syntax.Literal &&
                typeof node.arguments[2].value === 'string' &&
                node.arguments[1].type === Syntax.Literal &&
                typeof node.arguments[1].value === 'number'
              ) {
                remap(node.arguments[2], 'value')
              }
              break
            case 'FactoryArg':
            case 'ResultFactoryArg':
              remap(node.arguments[1], 'value')
              remap(node.arguments[0], 'value')
              break
            case 'SetterArg':
              remap(node.arguments[0], 'value')
              break
            case 'CollectionAdderArg':
              remap(node.arguments[0], 'value')
              remap(node.arguments[1], 'value')
              remap(node.arguments[2], 'value')
              break
            case 'RestArgs':
              remap(node.arguments[1], 'value')
              break
          }
        }
      }

      function applyMapping(maps) {
        maps.forEach(function(map) {
          for (var i = 0; i < map.properties.length; i++) {
            var property = map.properties[i]

            var value = property.value

            if (property.kind === 'init' && value.type === Syntax.Literal) {
              // property without array
              value.value = mapper.getObfuscatedName(property.value.value)
            } else {
              var elementsParent
              if (property.kind === 'get' && property.value.type === Syntax.FunctionExpression) {
                // getter property
                elementsParent = property.value.body.body[0].argument
              } else if (
                property.kind === 'init' &&
                property.value.type === Syntax.ArrayExpression
              ) {
                // simple value property
                elementsParent = value
              }
              var elements = elementsParent.elements

              var hasDecorator = elements[elements.length - 1].type === Syntax.CallExpression
              var isOverloadDecorator = hasDecorator && elements.length === 2

              var clearName = isOverloadDecorator
                ? elements[1].arguments[0].value
                : elements[0].value
              var shortName = elements[elements.length - (hasDecorator ? 2 : 1)].value

              // YJS-4275
              var forceKeep = false
              if (hasDecorator) {
                var callee = elements[elements.length - 1].callee
                if (
                  callee.type === Syntax.MemberExpression &&
                  callee.property.type === Syntax.Identifier &&
                  callee.property.name === 'Es6Iterator'
                ) {
                  forceKeep = mapper.isUsed('iterator')
                }
              }

              if (!forceKeep && !mapper.isUsed(clearName) && mapper.shouldObfuscate(clearName)) {
                // we neither need a clearName nor a decorator
                property.value = { type: Syntax.Literal, value: shortName }
                property.kind = 'init'
              } else {
                var mapped = mapper.getObfuscatedName(clearName)
                var newName = mapped || clearName

                var same = newName === shortName
                var newEntry = { type: Syntax.Literal, value: newName }

                if (isOverloadDecorator) {
                  // replace overloadName
                  elements[1].arguments[0] = newEntry
                } else if (!same && elements.length === (hasDecorator ? 2 : 1)) {
                  // single name !== newName
                  elements.unshift(newEntry)
                  elementsParent.elements = elements
                } else if (same && !hasDecorator) {
                  property.value = newEntry
                } else if (same && hasDecorator && elements.length > 2) {
                  elementsParent.elements = elements.slice(1)
                } else {
                  elements[0] = newEntry
                }

                if (hasDecorator) {
                  // obfuscateVisitor(elements[elements.length-1],elements); // YJS-4243
                  estraverse.traverse(elements[elements.length - 1], {
                    enter: function(node, parent) {
                      obfuscateDecoratorVisitor(node, parent)
                    },
                    leave: function(node, parent) {}
                  })
                }
              }
            }
          }
        })
      }
      return applyMapping
    }

    /**
     * Obfuscate export statements
     * @param {ModuleInfo} moduleInfo
     * @param {Mapper} mapper
     */
    function obfuscateES6Modules(moduleInfo, mapper) {
      function remap(elem, name) {
        if (mapper.shouldObfuscate(elem[name])) {
          elem[name] = mapper.getObfuscatedName(elem[name])
        }
      }

      function remapMemberExpression(memberExpression) {
        if (memberExpression.object.type === Syntax.MemberExpression) {
          remapMemberExpression(memberExpression.object)
        } else if (memberExpression.object.type === Syntax.Identifier) {
          remap(memberExpression.object, 'name')
        }
        remap(memberExpression.property, 'name')
      }

      var body = moduleInfo.ast.body
      body.forEach(function(node) {
        if (node.type === Syntax.ExportNamedDeclaration) {
          node.declaration.declarations.forEach(function(variableDeclarator) {
            var exportName = variableDeclarator.id.name
            var originalName = variableDeclarator.init.property.name
            if (exportName !== originalName) {
              // this is an alternate es6 name for a duplicate identifier
              mapper.es6NameMap.set(originalName, exportName)
            }

            remap(variableDeclarator.id, 'name')
            remapMemberExpression(variableDeclarator.init)
          })
        }
      })
    }

    /**
     * Collect all types that are imported from yFiles modules,
     * so we know which left-hand sides of member expressions we should
     * obfuscate
     * @param {string} srcPath - path to a non-module file
     * @param ast - the ast of that file
     * @return {es6.Set.<string>} - All yFiles types that are imported
     */
    function collectYFilesImports(srcPath, ast) {
      var yfilesImports = new Set()

      var allModuleNames = modules.map(function(relativeModulePath) {
        return relativeModulePath.replace(options.libSrc, '').replace(/\.js$/, '')
      })

      var body = ast.body
      body.forEach(function(node) {
        if (node.type === Syntax.ImportDeclaration && node.specifiers) {
          var from = node.source.value
          var isYFilesImport = allModuleNames.some(function(moduleName) {
            return from.replace('\\', '/').indexOf(moduleName) !== -1
          })
          if (isYFilesImport) {
            node.specifiers.forEach(function(importSpecifier) {
              var renamedImport =
                importSpecifier.imported &&
                importSpecifier.local.name !== importSpecifier.imported.name
              if (importSpecifier.type === Syntax.ImportSpecifier && !renamedImport) {
                yfilesImports.add(importSpecifier.local.name)
              }
            })
          }
        }
      })

      return yfilesImports
    }

    /**
     * @param {string} srcPath
     * @param {string} destPath
     * @param {Mapper} mapper
     * @param {boolean} shouldObfuscate
     * @param {string|boolean} definePrefix
     */
    function packageFile(srcPath, destPath, mapper, shouldObfuscate, definePrefix) {
      if (!shouldObfuscate && !shouldOptimize && !definePrefix) {
        grunt.file.copy(srcPath, destPath)
        return
      }

      var fileContent = grunt.file.read(srcPath, encodingOptions)
      var ast = parseSource(fileContent, rangeParserOptions)
      ast = estraverse.attachComments(ast, ast.comments, ast.tokens)

      if (definePrefix) {
        replaceDefine(ast, definePrefix, srcPath)
      }

      var bodyObfuscationScope

      if (shouldObfuscate) {
        var yFilesImports = collectYFilesImports(srcPath, ast)
        bodyObfuscationScope = parseWithScope(
          ast,
          new ObfuscationScopeInfo(ObfuscationScopeInfo.MODE_OBFUSCATE),
          obfuscateVisitor
        )
      }

      var beautify = !shouldObfuscate && !shouldOptimize
      var code = escodegen.generate(ast, getGeneratorOptions(beautify, !shouldOptimize))

      // Check obfuscation annotations on the top level and skip mangle if requested
      var doMangle =
        shouldMangle &&
        (bodyObfuscationScope &&
          bodyObfuscationScope.obfuscationMode === ObfuscationScopeInfo.MODE_OBFUSCATE)
      if (doMangle) {
        var result = require('babel-core').transform(code, {
          plugins: ['minify-mangle-names']
        })
        code = result.code
      }

      // Use babel-minify to do other code optimizations
      if (shouldOptimize) {
        const optimizeOptions =
          typeof options.optimize === 'object'
            ? options.optimize
            : {
                deadcode: false
              }
        try {
          var minify = require('babel-minify')
          var result = minify(code, optimizeOptions)
          code = result.code
        } catch (e) {
          grunt.fail.warn('could not optimize ' + srcPath + ' : ' + e.message)
        }
      }

      grunt.file.write(destPath, code, encodingOptions)

      function obfuscateVisitor(node, parent) {
        var obfuscationInfo = node.obfuscationInfo
        if (
          !obfuscationInfo ||
          obfuscationInfo.obfuscationMode !== ObfuscationScopeInfo.MODE_OBFUSCATE
        ) {
          return
        }

        if (
          node.type === Syntax.Literal &&
          parent.type === Syntax.Property &&
          parent.key === node
        ) {
          if (!isBlacklisted(node, obfuscationInfo) && mapper.shouldObfuscate(node.value)) {
            node.value = mapper.getObfuscatedName(node.value)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.MethodDefinition &&
          parent.key === node
        ) {
          // es6 method definition
          if (!isBlacklisted(node, obfuscationInfo) && mapper.shouldObfuscate(node.name)) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (node.type === Syntax.Identifier && parent.superClass === node) {
          // es6 class extends
          if (!isBlacklisted(node, obfuscationInfo) && mapper.shouldObfuscate(node.name)) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.NewExpression &&
          parent.callee === node
        ) {
          // new Foo() (no namespace)
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.Property &&
          parent.key === node
        ) {
          if (!isBlacklisted(node, obfuscationInfo) && mapper.shouldObfuscate(node.name)) {
            if (parent.shorthand) {
              // shorthand property: we keep the existing name for the value, but obfuscate the key
              parent.value = {
                type: parent.value.type,
                name: node.name
              }
              parent.shorthand = false
            }
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.Property &&
          parent.value === node
        ) {
          // {
          //   $extends: NodeStyleBase
          // }
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.ArrayExpression &&
          parent.elements.indexOf(node) > -1
        ) {
          // {
          //   $with:[IArrow]
          // }
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.BinaryExpression &&
          parent.right === node
        ) {
          // foo instanceof IHandleProvider
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.MemberExpression &&
          !parent.computed &&
          parent.property === node
        ) {
          if (
            !isBlacklisted(node, obfuscationInfo) &&
            !isBlacklisted(parent.object, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.MemberExpression &&
          parent.object === node
        ) {
          // obfuscate left-hand side of member expression (ICommand.foo, ICommand[expression])
          // *if* that name appeared in an import statement
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.LogicalExpression &&
          (parent.left === node || parent.right === node)
        ) {
          //  CreateEdgeInputMode && foo
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.ExpressionStatement &&
          parent.expression === node
        ) {
          // Just an identifier on its own (ICommand;)
          // *if* that name appeared in an import statement
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        } else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.ImportSpecifier &&
          parent.imported === node
        ) {
          // import specifiers
          if (!isBlacklisted(node, obfuscationInfo) && mapper.shouldObfuscate(node.name)) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        }
        // Class(IHandleProvider)
        else if (
          node.type === Syntax.Identifier &&
          parent.type === Syntax.CallExpression &&
          parent.arguments &&
          parent.arguments.indexOf(node) > -1
        ) {
          if (
            yFilesImports.has(node.name) &&
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.name)
          ) {
            node.name = mapper.getObfuscatedName(node.name)
          }
        }
        // es5-ified bable _createClass
        //  _createClass(AdditionalSnapLineMoveInputMode, [{
        //    key: 'initialize',
        //
        // {
        //     "type": "Property",
        //     "key": {
        //         "type": "Identifier",
        //         "name": "key"
        //     },
        //     "computed": false,
        //     "value": {
        //         "type": "Literal",
        //         "value": "initialize",
        //         "raw": "'initialize'"
        //     },
        //     "kind": "init",
        //     "method": false,
        //     "shorthand": false
        // }
        else if (
          node.type === Syntax.Literal &&
          parent.type === Syntax.Property &&
          parent.value === node &&
          parent.key.type === Syntax.Identifier &&
          parent.key.name === 'key'
        ) {
          if (!isBlacklisted(node, obfuscationInfo) && mapper.shouldObfuscate(node.value)) {
            node.value = mapper.getObfuscatedName(node.value)
            node.raw = "'" + mapper.getObfuscatedName(node.value) + "'"
          }
        }

        // es5-ified babel super call
        else if (
          node.type === Syntax.CallExpression &&
          node.callee.type === Syntax.Identifier &&
          (node.callee.name === '_get' || node.callee.name === '_set') &&
          node.arguments.length === 3 &&
          node.arguments[1].type === Syntax.Literal &&
          (node.arguments[2].type === Syntax.ThisExpression ||
            (node.arguments[2].type === Syntax.Identifier && node.arguments[2].name === '_this'))
        ) {
          if (
            !isBlacklisted(node, obfuscationInfo) &&
            mapper.shouldObfuscate(node.arguments[1].value)
          ) {
            node.arguments[1].value = mapper.getObfuscatedName(node.arguments[1].value)
            node.arguments[1].raw = "'" + mapper.getObfuscatedName(node.arguments[1].value) + "'"
          }
        }
      }

      function isBlacklisted(node, obfuscationInfo) {
        obfuscationInfo = obfuscationInfo || node.obfuscationInfo
        if (!node || !obfuscationInfo) {
          return true
        }

        switch (node.type) {
          case Syntax.ThisExpression:
            return obfuscationInfo.isBlacklisted('this')
          case Syntax.Identifier:
            return obfuscationInfo.isBlacklisted(node.name)
          case Syntax.Literal:
            return obfuscationInfo.isBlacklisted(node.value)
          case Syntax.MemberExpression:
            return isBlacklisted(node.object, obfuscationInfo)
          case Syntax.CallExpression:
            return isBlacklisted(node.callee, obfuscationInfo)
          case Syntax.ConditionalExpression:
            return (
              isBlacklisted(node.consequent, obfuscationInfo) ||
              isBlacklisted(node.alternate, obfuscationInfo)
            )
          case Syntax.LogicalExpression:
          case Syntax.BinaryExpression:
            return (
              isBlacklisted(node.left, obfuscationInfo) ||
              isBlacklisted(node.right, obfuscationInfo)
            )
        }
        return false
      }
    }
  })

  /**
   *
   */
  grunt.registerMultiTask(
    'collect',
    'Collects names used in client code Javascript files.',
    function() {
      var shouldObfuscate = !!grunt.config.get('package.options.obfuscate')
      var blacklistNames = new Set(grunt.config.get('package.options.blacklist') || [])

      var usedNames = new Set()

      this.files.forEach(function(file) {
        file.src.forEach(function(filepath) {
          if (endsWith(filepath, '.js')) {
            collectUsages(filepath, blacklistNames, shouldObfuscate)
          }
        })
      })

      grunt.config.merge({ package: { options: { blacklist: toArray(blacklistNames) } } })
      grunt.config.merge({ package: { options: { usedNames: usedNames } } })

      /**
       * @param filePath {string}
       * @param blacklistSet {es6.Set}
       * @param shouldObfuscate {boolean}
       */
      function collectUsages(filePath, blacklistSet, shouldObfuscate) {
        grunt.verbose.writeln('Collect usages in ' + filePath)

        var fileContent = grunt.file.read(filePath, encodingOptions)
        var ast
        if (shouldObfuscate) {
          ast = parseSource(fileContent, rangeParserOptions)
          ast = estraverse.attachComments(ast, ast.comments, ast.tokens)
        } else {
          ast = parseSource(fileContent, parserOptions)
        }

        var rootScope = new ObfuscationScopeInfo(
          shouldObfuscate
            ? ObfuscationScopeInfo.MODE_OBFUSCATE
            : ObfuscationScopeInfo.MODE_BLACKLIST
        )
        rootScope.globalBlackList = blacklistSet
        parseWithScope(ast, rootScope, usageVisitor)

        function usageVisitor(node, parent) {
          var name
          if (node.type === Syntax.Identifier) {
            name = node.name
          } else if (node.type === Syntax.Literal) {
            var type = typeof node.value
            if (type !== 'number' && type !== 'boolean') {
              name = node.value
            }
          }
          if (name) {
            usedNames.add(name)
            if (node.obfuscationInfo.obfuscationMode == ObfuscationScopeInfo.MODE_BLACKLIST) {
              blacklistSet.add(name)
            }
          }
        }
      }
    }
  )

  /**
   *
   */
  grunt.registerMultiTask(
    'collectMappings',
    'Collects all mappings of the specified module dependencies',
    function() {
      // The elements that we may not rename
      var blacklistNames = new Set(grunt.config.get('package.options.blacklist') || [])

      var mapping = new Map()
      // package specified files / dirs.
      this.files.forEach(function(file) {
        file.src.forEach(function(filepath) {
          var modulePathAndName = filepath.substr(0, filepath.length - 3)
          parseMapping(getWithJsExtension(modulePathAndName), mapping)
        })
      })

      var dependentNamesMap = new Map()

      //
      // We could also take not of the extra arg names, to determine which dependent
      // names need to be marked as used - YJS-4691
      //
      mapping.forEach(function(values, key) {
        if (values.dependentNames) {
          var longName = values && values.length > 0 && values[0]
          var oldNames = dependentNamesMap.get(longName)
          if (oldNames) {
            dependentNamesMap.set(longName, oldNames.concat(values.dependentNames))
          } else {
            dependentNamesMap.set(longName, values.dependentNames)
          }
        }
      })

      // The map that contains the proposed names for the items that can be
      // renamed. This is populated by default with the names used internally by the library
      // they are guaranteed to not conflict with each other, so they make a good name
      var suggestedMapping = new Map()
      // the names that will possibly be renamed by this task
      var obfuscationNames = new Set()

      // generate the suggested mapping and collect blacklist items
      mapping.forEach(function(values, key) {
        var longName = values && values.length > 0 && values[0]
        var shortName = values && values.length > 1 && values[1]

        var hasDecorator = values.hasDecorator

        if (longName && suggestedMapping.has(longName)) {
          // we have stored a short name for this long name already
          // it is used elsewhere, so we cannot map it to the same value if it uses a different short name
          if (suggestedMapping.get(longName) !== shortName) {
            suggestedMapping.set(longName, null)
          }
        } else {
          if (shortName && !hasDecorator) {
            // suggest the short name for the resulting name, since this will create a smaller mapping file and leaner object
            // at runtime with less properties.
            // If there is a decorator we must NOT suggest a mapping, as we need two names for decorators to work.
            suggestedMapping.set(longName, shortName)
          }
        }
        // see if the key is marked with the special "no obfuscation allowed" prefix.
        // these names are used "reflectively" and may not be changed.
        if (key.indexOf('_$$_') == 0) {
          // add it to the global blacklist.
          blacklistNames.add(longName)

          // if the name is actually a namespace name, it can contain dots - add all name parts to the exclusion:
          if (longName.indexOf('.')) {
            longName.split('.').forEach(function(item) {
              blacklistNames.add(item)
            })
          }
        } else {
          // this is a name that may possibly be obfuscated later on
          obfuscationNames.add(longName)
        }
      })

      // for items on the blacklist, remove them from the possible obfuscation set
      blacklistNames.forEach(function(item) {
        obfuscationNames.delete(item)
      })

      // write back the results to the global configuration
      grunt.config.set('package.options.blacklist', toArray(blacklistNames))
      grunt.config.set('package.options.suggestedMapping', suggestedMapping)
      grunt.config.set('package.options.obfuscationNames', obfuscationNames)
      grunt.config.set('package.options.dependentNames', dependentNamesMap)

      grunt.verbose.ok('Found ' + mapping.size + ' mappings.')
      grunt.verbose.ok('Found ' + blacklistNames.size + ' blacklisted names.')

      /**
       *
       * @param {String} filePath
       * @param {Map} mapping
       */
      function parseMapping(filePath, mapping) {
        var mappingsAsts = findMappingAstElement(
          parseSource(grunt.file.read(filePath, encodingOptions), parserOptions)
        )
        if (!mappingsAsts) {
          return
        }

        var dependentNames = []

        function dependentMappingsDecoratorVisitor(node, parent) {
          if (
            node.type === Syntax.CallExpression &&
            node.callee.type === Syntax.MemberExpression &&
            node.callee.property.type === Syntax.Identifier
          ) {
            switch (node.callee.property.name) {
              case 'FactoryArg':
              case 'ResultFactoryArg':
                dependentNames.push(node.arguments[1].value)
                break
              // case "SetterArg":
              //   dependentNames.push(node.arguments[0].value);
              //   break;
              case 'CollectionAdderArg':
                dependentNames.push(node.arguments[1].value)
                dependentNames.push(node.arguments[2].value)
                break
            }
          }
        }

        mappingsAsts.forEach(function(mappingsAst) {
          for (var i = 0; i < mappingsAst.properties.length; i++) {
            var property = mappingsAst.properties[i]

            dependentNames.length = 0

            var names,
              hasDecorator = false
            if (property.value.type === Syntax.Literal) {
              names = [property.value]
            } else if (property.value.type === Syntax.ArrayExpression && property.kind === 'init') {
              names = property.value.elements
            } else if (
              property.value.type === Syntax.FunctionExpression &&
              property.kind === 'get'
            ) {
              var elements = property.value.body.body[0].argument.elements
              if (elements.length === 2) {
                // overload decorator -> extract clear name from first argument
                names = [elements[1].arguments[0], elements[0]]
              } else {
                names = elements.slice(0, -1) // remove decorator
              }
              hasDecorator = true
            }

            names = names.map(function(entry) {
              return entry.value
            })

            if (hasDecorator) {
              estraverse.traverse(property.value, {
                enter: function(node, parent) {
                  dependentMappingsDecoratorVisitor(node, parent)
                },
                leave: function(node, parent) {}
              })
              if (dependentNames.length > 0) {
                names.dependentNames = dependentNames.slice(0)
              }
            }

            names.hasDecorator = hasDecorator

            var key = property.key.type === Syntax.Literal ? property.key.value : property.key.name

            mapping.set(key, names)
          }
        })
      }
    }
  )

  grunt.registerMultiTask(
    'collectModules',
    'Lists all AMD module of the specified files.',
    function() {
      var modules = new Set()

      this.files.forEach(function(file) {
        file.src.forEach(function(filePath) {
          var normalized = normalizePath(filePath.substring(0, filePath.length - 3))
          findAllModulePaths(normalized, modules)
        })
      })

      var /**string[]*/ moduleList = toArray(modules).map(getWithJsExtension)
      grunt.config.merge({
        collectMappings: {
          build: {
            files: [{ src: moduleList }]
          }
        }
      })
      grunt.config.merge({
        packageCore: {
          build: {
            options: {
              modules: moduleList
            }
          }
        }
      })

      grunt.verbose.ok('Found ' + moduleList.length + ' module dependencies.')

      /**
       * Recursively finds all file dependencies of the given file and adds their paths to the specified depSet.
       * @param modulePath {string} The normalized path to the module (file path without extension).
       * @param modules {Set} The set to which the (normalized) paths of the dependencies are added (as properties).
       * result set. Even if this is false, the helper modules are parsed for dependencies. Only the module itself is not
       * added to the result set.
       */
      function findAllModulePaths(modulePath, modules) {
        if (!modules || modules.has(modulePath)) {
          return
        }

        modules.add(modulePath)

        // Parse the dependencies list
        //grunt.log.ok('collectModules: Checking for dependencies of ' + modulePath);
        var fileContent = grunt.file.read(getWithJsExtension(modulePath), encodingOptions)
        var dependenciesList = getDependencies(
          parseSource(fileContent, parserOptions),
          /lang/.test(modulePath)
        )

        // Get the directory of the current module to resolve relative module dependencies
        var fileDir = path.dirname(modulePath)

        // Recursively handle the module dependencies
        dependenciesList.forEach(function(dependency) {
          findAllModulePaths(fixPathOnWindows(normalizeDependency(dependency, fileDir)), modules)
        })
      }

      /**
       * Normalizes the given dependency: removes redundant parts and makes the path relative to the common working
       * directory.
       *
       * @param {string} dependency
       * @param {string} baseDir
       * @returns {string}
       */
      function normalizeDependency(dependency, baseDir) {
        return dependency.substr(0, 1) === '.'
          ? path.join(baseDir, dependency)
          : path.normalize(dependency)
      }
    }
  )

  /**
   * @param {string} filePath
   * @returns {string}
   */
  function fixPathOnWindows(filePath) {
    return filePath.replace(/\\/g, '/')
  }

  function getWithJsExtension(path) {
    return path.replace(/(\.js)?$/, '.js')
  }

  /**
   * Stupid workaround to get unix directory separators.
   *
   * @param {string} filepath
   * @return {string}
   */
  function normalizePath(filepath) {
    return path.normalize(filepath).replace(/\\/g, '/')
  }

  /**
   * The name says it all.
   * @param {string} string
   * @param {string} suffix
   * @returns {boolean}
   */
  function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1
  }

  function toArray(set) {
    var a = []
    set.forEach(function(item) {
      a.push(item)
    })
    return a
  }

  function parseSource(fileContent, options) {
    try {
      var parsed = esprima.parseScript(fileContent, options)
      return parsed
    } catch (e) {
      var parsed = esprima.parseModule(fileContent, options)
      return parsed
    }
  }
}
