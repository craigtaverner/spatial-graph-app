/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.0.4.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
'use strict'
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b
        }) ||
      function(d, b) {
        for (var p in b) {
          if (b.hasOwnProperty(p)) {
            d[p] = b[p]
          }
        }
      }
    return function(d, b) {
      extendStatics(d, b)

      function __() {
        this.constructor = d
      }

      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
Object.defineProperty(exports, '__esModule', { value: true })
var lang_1 = require('yfiles/lang')
var core_1 = require('yfiles/core')
/**
 * Class for representing one person. It implements {@link IPropertyObservable} so that {@link TemplateNodeStyle} can
 * listen to changes and update the node visualization accordingly.
 */
var Person = /** @class */ (function(_super) {
  __extends(Person, _super)

  function Person(_a) {
    var position = _a.position,
      name = _a.name,
      email = _a.email,
      phone = _a.phone,
      fax = _a.fax,
      businessUnit = _a.businessUnit,
      status = _a.status,
      icon = _a.icon
    var _this = _super.call(this) || this
    _this.listeners = []
    _this._position = position
    _this._name = name
    _this._email = email
    _this._phone = phone
    _this._fax = fax
    _this._businessUnit = businessUnit
    _this._status = status
    _this._icon = icon
    return _this
  }

  Object.defineProperty(Person.prototype, 'position', {
    get: function() {
      return this._position
    },
    set: function(value) {
      var _this = this
      this._position = value
      this.listeners.forEach(function(listener) {
        return listener(_this, new core_1.PropertyChangedEventArgs('position'))
      })
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'name', {
    get: function() {
      return this._name
    },
    set: function(value) {
      var _this = this
      this._name = value
      this.listeners.forEach(function(listener) {
        return listener(_this, new core_1.PropertyChangedEventArgs('name'))
      })
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'email', {
    get: function() {
      return this._email
    },
    set: function(value) {
      var _this = this
      this._email = value
      this.listeners.forEach(function(listener) {
        return listener(_this, new core_1.PropertyChangedEventArgs('email'))
      })
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'phone', {
    get: function() {
      return this._phone
    },
    set: function(value) {
      var _this = this
      this._phone = value
      this.listeners.forEach(function(listener) {
        return listener(_this, new core_1.PropertyChangedEventArgs('phone'))
      })
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'fax', {
    get: function() {
      return this._fax
    },
    set: function(value) {
      var _this = this
      this._fax = value
      this.listeners.forEach(function(listener) {
        return listener(_this, new core_1.PropertyChangedEventArgs('fax'))
      })
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'businessUnit', {
    get: function() {
      return this._businessUnit
    },
    set: function(value) {
      var _this = this
      this._businessUnit = value
      this.listeners.forEach(function(listener) {
        return listener(_this, new core_1.PropertyChangedEventArgs('businessUnit'))
      })
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'status', {
    get: function() {
      return this._status
    },
    enumerable: true,
    configurable: true
  })
  Object.defineProperty(Person.prototype, 'icon', {
    get: function() {
      return this._icon
    },
    enumerable: true,
    configurable: true
  })
  Person.prototype.addPropertyChangedListener = function(listener) {
    this.listeners.push(listener)
  }
  Person.prototype.removePropertyChangedListener = function(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1)
  }
  return Person
})(lang_1.BaseClass(core_1.IPropertyObservable))
exports.Person = Person
//# sourceMappingURL=person.js.map
