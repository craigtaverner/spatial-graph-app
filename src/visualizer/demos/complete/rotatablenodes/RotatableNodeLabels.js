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

define(['yfiles/view-component', 'RotatableNodes.js'], (yfiles, RotatableNodes) => {
  /**
   * A {@link yfiles.graph.ILabelModel} decorator for node labels that wraps another label model and considers the
   * {@link RotatableNodes.RotatableNodeStyleDecorator#angle rotation angle} of the label owner when a
   * {@link RotatableNodes.RotatableNodeStyleDecorator} is used.
   * This will make the node labels rotate with the node's rotation.
   */
  class RotatableNodeLabelModelDecorator extends yfiles.lang.Class(
    yfiles.graph.ILabelModel,
    yfiles.graphml.IMarkupExtensionConverter
  ) {
    /**
     * Returns whether or not the rotation of the label owner should be considered.
     * @return {boolean}
     */
    get useNodeRotation() {
      return this.$useNodeRotation
    }

    /**
     * Specifies whether or not the rotation of the label owner should be considered.
     * @param {boolean} useNodeRotation
     */
    set useNodeRotation(useNodeRotation) {
      this.$useNodeRotation = useNodeRotation
    }

    /**
     * Returns the wrapped label model.
     * @return {yfiles.graph.ILabelModel}
     */
    get wrapped() {
      return this.$wrapped
    }

    /**
     * Specifies the wrapped label model.
     * @param {yfiles.graph.ILabelModel} wrapped
     */
    set wrapped(wrapped) {
      this.$wrapped = wrapped
    }

    /**
     * Creates a new instance of {@link RotatableNodeLabelModelDecorator}.
     * @param {yfiles.graph.ILabelModel} wrapped
     */
    constructor(wrapped) {
      super()
      this.$wrapped = wrapped || yfiles.graph.FreeNodeLabelModel.INSTANCE
      this.$useNodeRotation = true
    }

    /**
     * Provides custom implementations of {@link yfiles.graph.ILabelModelParameterProvider} and
     * {@link yfiles.graph.ILabelModelParameterFinder} that consider the nodes rotation.
     * @param {yfiles.lang.Class} type
     * @return {yfiles.graph.ILabelModelParameterProvider|yfiles.graph.ILabelModelParameterFinder|null}
     */
    lookup(type) {
      if (type === yfiles.graph.ILabelModelParameterProvider.$class) {
        const provider = this.wrapped.lookup(yfiles.graph.ILabelModelParameterProvider.$class)
        if (provider) {
          return new RotatedNodeLabelModelParameterProvider(provider)
        }
      }
      if (type === yfiles.graph.ILabelModelParameterFinder.$class) {
        const finder = this.wrapped.lookup(yfiles.graph.ILabelModelParameterFinder.$class)
        if (finder) {
          return new RotatedNodeLabelModelParameterFinder(finder)
        }
      }
      return null
    }

    /**
     * Returns the current geometry of the given label.
     * @param {yfiles.graph.ILabel} label
     * @param {yfiles.graph.ILabelModelParameter} parameter
     * @return {yfiles.geometry.IOrientedRectangle}
     */
    getGeometry(label, parameter) {
      const styleWrapper = this.getNodeStyleWrapper(label)
      const wrappedParameter = this.getWrappedParameter(parameter)
      const orientedRectangle = wrappedParameter.model.getGeometry(label, wrappedParameter)
      if (
        !this.useNodeRotation ||
        !yfiles.graph.INode.isInstance(label.owner) ||
        styleWrapper === null ||
        styleWrapper.angle === 0
      ) {
        return orientedRectangle
      }

      const rotatedCenter = styleWrapper.getRotatedPoint(
        orientedRectangle.orientedRectangleCenter,
        label.owner,
        true
      )
      const rotatedLayout = styleWrapper.getRotatedLayout(label.owner)

      const rectangle = new yfiles.geometry.OrientedRectangle(orientedRectangle)
      rectangle.angle += rotatedLayout.getRadians()
      rectangle.setCenter(rotatedCenter)
      return rectangle
    }

    /**
     * Creates a wrapped instance of the wrapped label model's default parameter.
     * @return {RotatableNodeLabelModelDecoratorParameter}
     */
    createDefaultParameter() {
      return new RotatableNodeLabelModelDecoratorParameter(
        this.wrapped.createDefaultParameter(),
        this
      )
    }

    /**
     * Creates a wrapped parameter containing the given parameter.
     * @param {yfiles.graph.ILabelModelParameter} wrapped
     * @return {RotatableNodeLabelModelDecoratorParameter}
     */
    createWrappingParameter(wrapped) {
      return new RotatableNodeLabelModelDecoratorParameter(wrapped, this)
    }

    /**
     * Provides a lookup context for the given combination of label and parameter.
     * @param {yfiles.graph.ILabel} label
     * @param {yfiles.graph.ILabelModelParameter} parameter
     * @return {yfiles.graph.ILookup}
     */
    getContext(label, parameter) {
      const wrappedParameter = this.getWrappedParameter(parameter)
      return wrappedParameter.model.getContext(label, wrappedParameter)
    }

    /**
     * Returns the wrapped label model parameter
     * @param {yfiles.graph.ILabelModelParameter} parameter
     * @return {yfiles.graph.ILabelModelParameter}
     */
    getWrappedParameter(parameter) {
      return parameter.wrapped
    }

    /**
     * Returns the wrapping style for nodes when {@link RotatableNodes.RotatableNodeStyleDecorator} is used, null
     * otherwise.
     * @param {yfiles.graph.ILabel} label
     * @return {RotatableNodes.RotatableNodeStyleDecorator|null}
     */
    getNodeStyleWrapper(label) {
      const node = label.owner
      if (yfiles.graph.INode.isInstance(node)) {
        return node.style instanceof RotatableNodes.RotatableNodeStyleDecorator ? node.style : null
      }
      return null
    }

    /**
     * Returns that this label model can be converted.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {boolean}
     */
    canConvert(context, value) {
      return true
    }

    /**
     * Converts this label model using {@link RotatableNodeLabelModelDecoratorExtension}.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {RotatableNodeLabelModelDecoratorParameterExtension}
     */
    convert(context, value) {
      const extension = new RotatableNodeLabelModelDecoratorExtension()
      extension.wrapped = this.wrapped
      extension.useNodeRotation = this.useNodeRotation
      return extension
    }
  }

  /**
   * A {@link yfiles.graph.ILabelModelParameter} decorator for node labels using
   * {@link RotatableNodeLabelModelDecorator} to adjust the label rotation to the node rotation.
   */
  class RotatableNodeLabelModelDecoratorParameter extends yfiles.lang.Class(
    yfiles.graph.ILabelModelParameter,
    yfiles.graphml.IMarkupExtensionConverter
  ) {
    /**
     * Creates a new instance wrapping the given parameter.
     * @param {yfiles.graph.ILabelModelParameter} wrapped
     * @param {yfiles.graph.ILabelModel} model
     */
    constructor(wrapped, model) {
      super()
      this.$wrapped = wrapped
      this.$model = model
    }

    /**
     * Returns a copy of this label model parameter.
     * @return {RotatableNodeLabelModelDecoratorParameter}
     */
    clone() {
      return new RotatableNodeLabelModelDecoratorParameter(this.wrapped, this.model)
    }

    /**
     * Returns the label model.
     * @return {yfiles.graph.ILabelModel}
     */
    get model() {
      return this.$model
    }

    /**
     * Specifies the label model.
     * @param {yfiles.graph.ILabelModel} model
     */
    set model(model) {
      this.$model = model
    }

    /**
     * Returns the wrapped label model parameter.
     * @return {yfiles.graph.ILabelModelParameter}
     */
    get wrapped() {
      return this.$wrapped
    }

    /**
     * Specifies the wrapped label model parameter.
     * @param {yfiles.graph.ILabelModelParameter} wrapped
     */
    set wrapped(wrapped) {
      this.$wrapped = wrapped
    }

    /**
     * Accepts node labels that are supported by the wrapped label model parameter.
     * @param {yfiles.graph.ILabel} label
     * @return {boolean}
     */
    supports(label) {
      return yfiles.graph.INode.isInstance(label.owner) && this.wrapped.supports(label)
    }

    /**
     * Returns that this label model parameter can be converted.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {boolean}
     */
    canConvert(context, value) {
      return true
    }

    /**
     * Converts this label model parameter using {@link RotatableNodeLabelModelDecoratorParameterExtension}.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {RotatableNodeLabelModelDecoratorParameterExtension}
     */
    convert(context, value) {
      const extension = new RotatableNodeLabelModelDecoratorParameterExtension()
      extension.model = this.model
      extension.wrapped = this.wrapped
      return extension
    }
  }

  /**
   * Provides candidate parameters for rotated label models.
   */
  class RotatedNodeLabelModelParameterProvider extends yfiles.lang.Class(
    yfiles.graph.ILabelModelParameterProvider
  ) {
    /**
     * Returns a new instance using the given parameter provider.
     * @param {yfiles.graph.ILabelModelParameterProvider} wrapped
     */
    constructor(wrapped) {
      super()
      this.wrappedProvider = wrapped
    }

    /**
     * Returns a set of possible wrapped {@link yfiles.graph.ILabelModelParameter} instances.
     * @param {yfiles.graph.ILabel} label
     * @param {yfiles.graph.ILabelModel} model
     * @return {yfiles.collections.IEnumerable}
     */
    getParameters(label, model) {
      const wrapperModel = model
      const parameters = this.wrappedProvider.getParameters(label, wrapperModel.wrapped)
      const result = new yfiles.collections.List()
      parameters.forEach(parameter => {
        result.add(wrapperModel.createWrappingParameter(parameter))
      })
      return result
    }
  }

  /**
   * Finds the best {@link yfiles.graph.ILabelModelParameter} to approximate a specific rotated layout.
   */
  class RotatedNodeLabelModelParameterFinder extends yfiles.lang.Class(
    yfiles.graph.ILabelModelParameterFinder
  ) {
    /**
     * Creates a new instance using the given parameter finder.
     * @param {yfiles.graph.ILabelModelParameterFinder} wrapped
     */
    constructor(wrapped) {
      super()
      this.wrappedFinder = wrapped
    }

    /**
     * Finds the label model parameter that describes the given label layout best. Sometimes the layout cannot be met
     * exactly, then the nearest location is used.
     * @param {yfiles.graph.ILabel} label
     * @param {yfiles.graph.ILabelModel} model
     * @param {yfiles.geometry.IOrientedRectangle} labelLayout
     * @return {RotatableNodeLabelModelDecoratorParameter|yfiles.graph.IPortLocationModelParameter}
     */
    findBestParameter(label, model, labelLayout) {
      const wrapperModel = model
      const styleWrapper = wrapperModel.getNodeStyleWrapper(label)
      if (!wrapperModel.useNodeRotation || styleWrapper === null || styleWrapper.angle === 0) {
        return wrapperModel.createWrappingParameter(
          this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, labelLayout)
        )
      }

      /** @type {yfiles.graph.INode} */
      const node = label.owner
      const rotatedCenter = styleWrapper.getRotatedPoint(
        labelLayout.orientedRectangleCenter,
        node,
        false
      )
      const rotatedLayout = styleWrapper.getRotatedLayout(node)

      const rectangle = new yfiles.geometry.OrientedRectangle(labelLayout)
      rectangle.angle -= rotatedLayout.getRadians()
      rectangle.setCenter(rotatedCenter)

      return wrapperModel.createWrappingParameter(
        this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, rectangle)
      )
    }
  }

  /**
   * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecorator).
   */
  const RotatableNodeLabelModelDecoratorExtension = yfiles.lang.Class(
    'RotatableNodeLabelModelDecoratorExtension',
    {
      $extends: yfiles.graphml.MarkupExtension,

      $wrapped: null,
      /**
       * @type {yfiles.graph.ILabelModel}
       */
      wrapped: {
        get() {
          return this.$wrapped
        },
        set(value) {
          this.$wrapped = value
        }
      },

      $useNodeRotation: true,
      /**
       * @type {boolean}
       */
      useNodeRotation: {
        $meta() {
          return [
            yfiles.graphml.GraphMLAttribute().init({ defaultValue: true }),
            yfiles.lang.TypeAttribute(yfiles.lang.Boolean.$class)
          ]
        },
        get() {
          return this.$useNodeRotation
        },
        set(value) {
          this.$useNodeRotation = value
        }
      },

      /**
       * @param {yfiles.graph.ILookup} serviceProvider
       * @return {object}
       */
      provideValue(serviceProvider) {
        const labelModel = new RotatableNodeLabelModelDecorator(this.wrapped)
        labelModel.useNodeRotation = this.useNodeRotation
        return labelModel
      }
    }
  )

  /**
   * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecoratorParameter).
   */
  const RotatableNodeLabelModelDecoratorParameterExtension = yfiles.lang.Class(
    'RotatableNodeLabelModelDecoratorParameterExtension',
    {
      $extends: yfiles.graphml.MarkupExtension,

      $model: null,
      /**
       * @type {yfiles.graph.ILabelModel}
       */
      model: {
        get() {
          return this.$model
        },
        set(value) {
          this.$model = value
        }
      },

      $wrapped: null,
      /**
       * @type {yfiles.graph.ILabelModelParameter}
       */
      wrapped: {
        get() {
          return this.$wrapped
        },
        set(value) {
          this.$wrapped = value
        }
      },

      /**
       * @param {yfiles.graph.ILookup} serviceProvider
       * @return {object}
       */
      provideValue(serviceProvider) {
        const rotatableModel = this.model
        if (rotatableModel instanceof RotatableNodeLabelModelDecorator) {
          return rotatableModel.createWrappingParameter(this.wrapped)
        }
        return this.wrapped
      }
    }
  )

  return {
    RotatableNodeLabelModelDecorator,
    RotatableNodeLabelModelDecoratorParameter,
    RotatableNodeLabelModelDecoratorExtension,
    RotatableNodeLabelModelDecoratorParameterExtension
  }
})
