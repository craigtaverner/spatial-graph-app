var fs = require('fs')
var path = require('path')
var esprima = require('esprima')
var estraverse = require('estraverse')
var Syntax = esprima.Syntax

function AbstractHeaderGenerator() {}

/**
 * @typedef {Object} ModuleInfo
 * @property {Object} ast - The current ast
 * @property {string} globalParamName - Name of the global object paramter in the outermost function of the yFiles modules
 * @property {Array.<string>} params - The parameter names of the define callback
 * @property {boolean} isImpl
 * @property {string[]} dependencies
 * @property {{root: string, exports: Object}} exports
 */

/**
 * Removes the current UMD header
 * @param {ModuleInfo} moduleInfo - The ast with header
 */
AbstractHeaderGenerator.prototype.removeCurrentHeader = function(moduleInfo) {
  var body = findFactoryFunctionBody(moduleInfo)

  moduleInfo.ast = {
    type: Syntax.Program,
    body: body
  }
}

/**
 * Wraps the AST with the respective header.
 * @param {ModuleInfo} moduleInfo
 */
AbstractHeaderGenerator.prototype.wrapWithHeader = function(moduleInfo) {
  throw 'Not implemented'
}
/**
 * Generates a module file that simply imports all modules passed.
 * @param {string[]} modules
 * @returns {Object} the generated AST
 */
AbstractHeaderGenerator.prototype.generateModulesBundle = function(modules) {
  throw 'Not implemented'
}

/**
 * Processes the lang.js AST to work with the respective header type.
 * @param {Object} ast
 * @returns {Object}
 */
AbstractHeaderGenerator.prototype.processLangModule = function(moduleInfo) {}

function defaultGenerateModulesBundle(modules) {
  var body = []

  var ast = {
    type: 'Program',
    body: body
  }

  var yfilesDefined = false
  Array.prototype.unshift.apply(
    ast.body,
    modules.map(function(dep, index) {
      if (!yfilesDefined && dep.indexOf('lang') == -1) {
        yfilesDefined = true
        // var yfiles = require("./foo");
        return {
          type: Syntax.VariableDeclaration,
          declarations: [
            {
              type: Syntax.VariableDeclarator,
              id: {
                type: Syntax.Identifier,
                name: 'yfiles'
              },
              init: {
                type: Syntax.CallExpression,
                callee: {
                  type: Syntax.Identifier,
                  name: 'require'
                },
                arguments: [
                  {
                    type: Syntax.Literal,
                    value: dep
                  }
                ]
              }
            }
          ],
          kind: 'var'
        }
      } else {
        //  require("./foo");
        return {
          type: Syntax.ExpressionStatement,
          expression: {
            type: Syntax.CallExpression,
            callee: {
              type: Syntax.Identifier,
              name: 'require'
            },
            arguments: [
              {
                type: Syntax.Literal,
                value: dep
              }
            ]
          }
        }
      }
    })
  )

  ast.body.push({
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'Identifier',
          name: 'module'
        },
        property: {
          type: 'Identifier',
          name: 'exports'
        }
      },
      right: {
        type: 'Identifier',
        name: 'yfiles'
      }
    }
  })

  return ast
}

/**
 * Generator for UMD modules.
 * @constructor
 * @extends AbstractHeaderGenerator
 */
var UmdHeaderGenerator = (function() {
  /**
   * @param {ModuleInfo} moduleInfo
   */
  function createHeaderTemplate(moduleInfo) {
    var globalParamName = moduleInfo.globalParamName
    var langParamName = moduleInfo.params[0]
    var yfilesParamName = moduleInfo.params[1]

    return (
      '(function (' +
      globalParamName +
      ") {\
     (function (f) {\
       if ('function' == typeof define && define.amd) {\
         define([], f)\
       } else if ('object' == typeof exports && 'undefined' != typeof module && 'object' == typeof module.exports) {\
         module.exports = f()\
       } else {\
         f(" +
      globalParamName +
      '.yfiles.lang, ' +
      globalParamName +
      '.yfiles)\
       }\
     }(function (' +
      moduleInfo.params[0] +
      (moduleInfo.params.length > 1 ? ', ' + moduleInfo.params[1] : '') +
      ") {}))\
   }('undefined' != typeof window ? window : 'undefined' != typeof global ? global : 'undefined' != typeof self ? self : this));"
    )
  }

  function UmdHeaderGenerator() {}

  UmdHeaderGenerator.prototype = Object.create(AbstractHeaderGenerator.prototype)

  UmdHeaderGenerator.prototype.wrapWithHeader = function(moduleInfo) {
    var dependencies = moduleInfo.dependencies
    var exports = moduleInfo.exports

    var ast = moduleInfo.ast

    var headerAst = esprima.parse(createHeaderTemplate(moduleInfo), {})

    var callExpression = headerAst.body[0].expression.callee.body.body[0].expression

    var ifStatement = callExpression.callee.body.body[0]
    var amdDependencies =
      ifStatement.consequent.body[0] /*if body*/.expression /*define call*/.arguments[0].elements
    var cjsDependencies =
      ifStatement.alternate /*else*/.consequent /*if*/.body[0].expression /* = */.right.arguments

    var innerBody = callExpression.arguments[0].body

    Array.prototype.push.apply(amdDependencies, dependencies.map(createLiteralAst))

    Array.prototype.push.apply(
      cjsDependencies,
      dependencies.map(function(dep) {
        return {
          type: Syntax.CallExpression,
          callee: {
            type: Syntax.Identifier,
            name: 'require'
          },
          arguments: [createLiteralAst(dep)]
        }
      })
    )

    innerBody.body = ast.body
    moduleInfo.ast = headerAst
  }

  UmdHeaderGenerator.prototype.processLangModule = function(moduleInfo) {
    var langHeader =
      '(function (' +
      moduleInfo.globalParamName +
      ") {\
      (function (f) {\
        if (typeof define === 'function' && define.amd) {\
          define([], function () {\
            return f(define && define.amd && define.amd.useGlobals);\
          });\
        } else if (typeof exports === 'object' && typeof module !== 'undefined' && typeof module.exports === 'object') {\
          module.exports = f(false);\
        } else {\
          f(true);\
        }\
      }(function (" +
      moduleInfo.params[0] +
      ") {}))\
   }('undefined' != typeof window ? window : 'undefined' != typeof global ? global : 'undefined' != typeof self ? self : this));"

    var headerAst = esprima.parse(langHeader)

    var callExpression = headerAst.body[0].expression.callee.body.body[0].expression

    var innerBody = callExpression.arguments[0].body
    innerBody.body = moduleInfo.ast.body

    moduleInfo.ast = headerAst
  }

  UmdHeaderGenerator.prototype.generateModulesBundle = defaultGenerateModulesBundle

  return UmdHeaderGenerator
})()

/**
 * Generator for CommonJS (NodeJS) modules.
 *
 * var lang = require('./lang');
 * var yfiles = require('./core-lib');
 * var a = global;
 * ...
 * module.exports = f(lang, yfiles);
 *
 * @constructor
 * @extends AbstractHeaderGenerator
 */
var CjsHeaderGenerator = (function() {
  function CjsHeaderGenerator() {}

  CjsHeaderGenerator.prototype = Object.create(AbstractHeaderGenerator.prototype)

  CjsHeaderGenerator.prototype.wrapWithHeader = function(moduleInfo) {
    var dependencies = moduleInfo.dependencies
    var exports = moduleInfo.exports

    var ast = moduleInfo.ast

    var globalAssignment = {
      type: Syntax.VariableDeclaration,
      declarations: [
        {
          type: Syntax.VariableDeclarator,
          id: {
            type: Syntax.Identifier,
            name: moduleInfo.globalParamName
          },
          init: {
            type: Syntax.Identifier,
            name: 'global'
          }
        }
      ],
      kind: 'var'
    }

    Array.prototype.unshift.apply(
      ast.body,
      dependencies.map(function(dep, index) {
        if (moduleInfo.params[index]) {
          // var foo = require("./foo");
          return {
            type: Syntax.VariableDeclaration,
            declarations: [
              {
                type: Syntax.VariableDeclarator,
                id: {
                  type: Syntax.Identifier,
                  name: moduleInfo.params[index]
                },
                init: {
                  type: Syntax.CallExpression,
                  callee: {
                    type: Syntax.Identifier,
                    name: 'require'
                  },
                  arguments: [
                    {
                      type: Syntax.Literal,
                      value: dep
                    }
                  ]
                }
              }
            ],
            kind: 'var'
          }
        } else {
          //  require("./foo");
          return {
            type: Syntax.ExpressionStatement,
            expression: {
              type: Syntax.CallExpression,
              callee: {
                type: Syntax.Identifier,
                name: 'require'
              },
              arguments: [
                {
                  type: Syntax.Literal,
                  value: dep
                }
              ]
            }
          }
        }
      })
    )

    ast.body.unshift(globalAssignment)

    var returnStatement = ast.body[ast.body.length - 1]
    if (returnStatement.type == Syntax.ReturnStatement) {
      var exportValue = returnStatement.argument
      ast.body[ast.body.length - 1] = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            computed: false,
            object: {
              type: 'Identifier',
              name: 'module'
            },
            property: {
              type: 'Identifier',
              name: 'exports'
            }
          },
          right: exportValue
        }
      }
    } else {
      console.log('Module return statement not found!')
    }

    return ast
  }

  CjsHeaderGenerator.prototype.processLangModule = function(moduleInfo) {
    var ast = moduleInfo.ast

    var globalAssignment = {
      type: Syntax.VariableDeclaration,
      declarations: [
        {
          type: Syntax.VariableDeclarator,
          id: {
            type: Syntax.Identifier,
            name: moduleInfo.globalParamName
          },
          init: {
            type: Syntax.Identifier,
            name: 'global'
          }
        }
      ],
      kind: 'var'
    }
    ast.body.unshift(globalAssignment)

    var returnStatement = ast.body[ast.body.length - 1]
    if (returnStatement.type == Syntax.ReturnStatement) {
      var exportValue = returnStatement.argument
      ast.body[ast.body.length - 1] = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            computed: false,
            object: {
              type: 'Identifier',
              name: 'module'
            },
            property: {
              type: 'Identifier',
              name: 'exports'
            }
          },
          right: exportValue
        }
      }
    } else {
      console.log('Module return statement not found!')
    }
  }

  CjsHeaderGenerator.prototype.generateModulesBundle = defaultGenerateModulesBundle

  return CjsHeaderGenerator
})()

var AmdHeaderGenerator = (function() {
  function AmdHeaderGenerator() {}

  AmdHeaderGenerator.prototype = Object.create(AbstractHeaderGenerator.prototype)

  AmdHeaderGenerator.prototype.wrapWithHeader = function(moduleInfo) {
    var dependencies = moduleInfo.dependencies
    var exports = moduleInfo.exports

    var body = moduleInfo.ast.body
    var params = moduleInfo.params

    if (moduleInfo.isImplModule) {
      fixGlobalArgumentOfFactoryFunction(moduleInfo.ast)
    }

    var defineParams = [
      {
        type: Syntax.Identifier,
        name: params[0]
      }
    ]
    if (dependencies.length > 1) {
      defineParams.push({
        type: Syntax.Identifier,
        name: params[1]
      })
    }

    moduleInfo.ast = createDefineStatement(dependencies, defineParams, body)
  }

  AmdHeaderGenerator.prototype.processLangModule = function(moduleInfo) {
    var body = moduleInfo.ast.body

    // "var root = ..., useGlobals = define.amd && define.amd.useGlobals
    body.unshift({
      type: Syntax.VariableDeclaration,
      declarations: [
        {
          type: Syntax.VariableDeclarator,
          id: {
            type: Syntax.Identifier,
            name: moduleInfo.globalParamName
          },
          init: createGlobalObjectExtraction()
        },
        {
          type: Syntax.VariableDeclarator,
          id: {
            type: Syntax.Identifier,
            name: moduleInfo.params[0]
          },
          init: {
            type: Syntax.LogicalExpression,
            operator: '&&',
            left: {
              type: Syntax.MemberExpression,
              computed: false,
              object: {
                type: Syntax.Identifier,
                name: 'define'
              },
              property: {
                type: Syntax.Identifier,
                name: 'amd'
              }
            },
            right: {
              type: Syntax.MemberExpression,
              computed: false,
              object: {
                type: Syntax.MemberExpression,
                computed: false,
                object: {
                  type: Syntax.Identifier,
                  name: 'define'
                },
                property: {
                  type: Syntax.Identifier,
                  name: 'amd'
                }
              },
              property: {
                type: Syntax.Identifier,
                name: 'useGlobals'
              }
            }
          }
        }
      ],
      kind: 'var'
    })

    moduleInfo.ast = createDefineStatement([], [], body)
  }

  /**
   * @param {String[]} dependencies
   * @param {Object[]} params params AST
   * @param {Object[]} body
   * @return {Object}
   */
  function createDefineStatement(dependencies, params, body) {
    return {
      type: Syntax.Program,
      body: [
        {
          type: Syntax.ExpressionStatement,
          expression: {
            type: Syntax.CallExpression,
            callee: {
              type: Syntax.Identifier,
              name: 'define'
            },
            arguments: [
              {
                type: Syntax.ArrayExpression,
                elements: dependencies.map(createLiteralAst)
              },
              {
                type: Syntax.FunctionExpression,
                id: null,
                params: params,
                defaults: [],
                body: {
                  type: Syntax.BlockStatement,
                  body: body
                },
                generator: false
              }
            ]
          }
        }
      ]
    }
  }

  AmdHeaderGenerator.prototype.generateModulesBundle = defaultGenerateModulesBundle

  return AmdHeaderGenerator
})()

/**
 * Finds the very first expression of the following type and returns the
 * body of the function passed to the outer function
 *
 * (function(someParam) {}
 *  (function() {}));
 *
 *  or
 *
 * !function (someParam) {}
 *  (function () {})
 * @return ModuleInfo
 */
function findFactoryFunctionBody(moduleInfo) {
  var r = null
  var ast = moduleInfo.ast
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (node.type === Syntax.ExpressionStatement) {
        var rootExpr = null
        if (node.expression.type === Syntax.CallExpression) {
          rootExpr = node.expression
        } else if (node.expression.type === Syntax.UnaryExpression) {
          rootExpr = node.expression.argument
        }
        if (rootExpr != null) {
          var callee = rootExpr.callee

          if (
            callee &&
            callee.type === Syntax.FunctionExpression &&
            callee.params.length === 1 &&
            rootExpr.type === Syntax.CallExpression &&
            rootExpr.arguments.length === 1 &&
            rootExpr.arguments[0].type === Syntax.FunctionExpression
          ) {
            r = rootExpr.arguments[0]
            this.break()
          }
        }
      }
    }
  })

  if (!r) {
    console.log('No header found!')
    return null
  }

  //
  // Extract the parameter name of the global parameter in the outermost function
  // (same as above, but rootExpr.arguments[0].type is ConditionalExpression (the one that finds the global object)
  // !function (a) {
  //   !function (b) { }(function(b) {...}
  // }
  // => "a"
  var globalParamName = null
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (node.type === Syntax.ExpressionStatement) {
        var rootExpr = null
        if (node.expression.type === Syntax.CallExpression) {
          rootExpr = node.expression
        } else if (node.expression.type === Syntax.UnaryExpression) {
          rootExpr = node.expression.argument
        }
        if (rootExpr != null) {
          var callee = rootExpr.callee

          if (
            callee &&
            callee.type === Syntax.FunctionExpression &&
            callee.params.length === 1 &&
            rootExpr.type === Syntax.CallExpression &&
            rootExpr.arguments.length === 1 &&
            rootExpr.arguments[0].type === Syntax.ConditionalExpression
          ) {
            globalParamName = callee.params[0].name
            this.break()
          }
        }
      }
    }
  })

  var paramNames = r.params.map(function(identifier) {
    return identifier.name
  })

  moduleInfo.globalParamName = globalParamName
  moduleInfo.params = paramNames
  return r.body.body
}

/**
 * AST for a literal.
 * @param {string|number|boolean} value
 * @return {{type: string, value: *, raw: string}}
 */
function createLiteralAst(value) {
  return {
    type: Syntax.Literal,
    value: value,
    raw: '"' + value + '"'
  }
}

/**
 * fix "r" passed to "window" argument in the wrapping function (Root, yfiles, window, undefined) {
 *   ...
 * } (yfiles.module('yfiles._R'),yfiles,r)
 * @param {Object[]} body
 */
function fixGlobalArgumentOfFactoryFunction(body) {
  // find the first node that looks like this:
  // function(a,b,c,d){}(e,f,r)
  // and replace the r argument with the global object expression
  var f = null
  estraverse.traverse(body, {
    enter: function(node, parent) {
      if (
        node.type === Syntax.CallExpression &&
        node.callee.type === Syntax.FunctionExpression &&
        node.callee.params.length == 4 &&
        node.arguments.length === 3
      ) {
        f = node
        this.break()
      }
    }
  })

  if (f != null) {
    f.arguments[2] = createGlobalObjectExtraction()
  }
}

/**
 * @return {Object} The AST for
 * "'undefined' != typeof window ? window : 'undefined' != typeof global ? global : 'undefined' != typeof self ? self : this"
 */
function createGlobalObjectExtraction() {
  return {
    type: Syntax.ConditionalExpression,
    test: {
      type: Syntax.BinaryExpression,
      operator: '!=',
      left: {
        type: Syntax.Literal,
        value: 'undefined',
        raw: "'undefined'"
      },
      right: {
        type: Syntax.UnaryExpression,
        operator: 'typeof',
        argument: {
          type: Syntax.Identifier,
          name: 'window'
        },
        prefix: true
      }
    },
    consequent: {
      type: Syntax.Identifier,
      name: 'window'
    },
    alternate: {
      type: Syntax.ConditionalExpression,
      test: {
        type: Syntax.BinaryExpression,
        operator: '!=',
        left: {
          type: Syntax.Literal,
          value: 'undefined',
          raw: "'undefined'"
        },
        right: {
          type: Syntax.UnaryExpression,
          operator: 'typeof',
          argument: {
            type: Syntax.Identifier,
            name: 'global'
          },
          prefix: true
        }
      },
      consequent: {
        type: Syntax.Identifier,
        name: 'global'
      },
      alternate: {
        type: Syntax.ConditionalExpression,
        test: {
          type: Syntax.BinaryExpression,
          operator: '!=',
          left: {
            type: Syntax.Literal,
            value: 'undefined',
            raw: "'undefined'"
          },
          right: {
            type: Syntax.UnaryExpression,
            operator: 'typeof',
            argument: {
              type: Syntax.Identifier,
              name: 'self'
            },
            prefix: true
          }
        },
        consequent: {
          type: Syntax.Identifier,
          name: 'self'
        },
        alternate: {
          type: Syntax.ThisExpression
        }
      }
    }
  }
}

/**
 * "return <name>;"
 * @param {String} name
 * @return {Object}
 */
function createReturnStatement(name) {
  return {
    type: Syntax.ReturnStatement,
    argument: {
      type: Syntax.Identifier,
      name: name
    }
  }
}

function VoidHeaderGenerator() {}

VoidHeaderGenerator.prototype = Object.create(AbstractHeaderGenerator.prototype)

VoidHeaderGenerator.prototype.removeCurrentHeader = function(moduleInfo) {}

/**
 * Wraps the AST with the respective header.
 * @param {ModuleInfo} moduleInfo
 */
VoidHeaderGenerator.prototype.wrapWithHeader = function(moduleInfo) {}

/**
 * Processes the lang.js AST to work with the respective header type.
 * @param {Object} ast
 * @returns {Object}
 */
VoidHeaderGenerator.prototype.processLangModule = function(moduleInfo) {}

VoidHeaderGenerator.prototype.generateModulesBundle = defaultGenerateModulesBundle

module.exports = {
  util: {
    fixGlobalArgumentOfFactoryFunction: fixGlobalArgumentOfFactoryFunction,
    createLiteralAst: createLiteralAst,
    createGlobalObjectExtraction: createGlobalObjectExtraction
  },
  AbstractHeaderGenerator: AbstractHeaderGenerator,
  VoidHeaderGenerator: VoidHeaderGenerator,
  CjsHeaderGenerator: CjsHeaderGenerator,
  UmdHeaderGenerator: UmdHeaderGenerator,
  AmdHeaderGenerator: AmdHeaderGenerator
}
