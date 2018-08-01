import PropTypes from 'prop-types'
import React, { Children, cloneElement, ReactNode } from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {
  childrenExist,
  createHTMLInput,
  customPropTypes,
  getUnhandledProps,
  partitionHTMLProps,
  UIComponent,
} from '../../lib'
import inputRules from './inputRules'
import inputVariables from './inputVariables'
import Icon from '../Icon'

/**
 * An Input
 * @accessibility This is example usage of the accessibility tag.
 */
class Input extends UIComponent<any, any> {
  static className = 'ui-input'

  static displayName = 'Input'

  static rules = inputRules
  static variables = inputVariables

  static propTypes = {
    /** An element type to render as (string or function). */
    as: customPropTypes.as,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** Optional Icon to display inside the Input. */
    icon: customPropTypes.itemShorthand,

    /** Shorthand for creating the HTML Input. */
    input: customPropTypes.itemShorthand,

    /**
     * Called on change.
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props and proposed value.
     */
    onChange: PropTypes.func,

    /**
     * Function called when the icon is clicked.
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props.
     */
    onIconClick: PropTypes.func,

    /** The HTML input type. */
    type: PropTypes.string,
  }

  static handledProps = [
    'as',
    'children',
    'className',
    'icon',
    'input',
    'onChange',
    'onIconClick',
    'type',
  ]

  static defaultProps = {
    as: 'div',
    type: 'text',
  }

  handleChange = e => {
    const value = _.get(e, 'target.value')

    _.invoke(this.props, 'onChange', e, { ...this.props, value })
  }

  handleChildOverrides = (child, defaultProps) => ({
    ...defaultProps,
    ...child.props,
  })

  handleIconOverrides = predefinedProps => ({
    onClick: e => {
      _.invoke(predefinedProps, 'onClick', e)
      _.invoke(this.props, 'onIconClick', e, this.props)
    },
  })

  partitionProps = () => {
    const { type } = this.props

    const unhandled = getUnhandledProps(Input, this.props)
    const [htmlInputProps, rest] = partitionHTMLProps(unhandled)

    return [
      {
        ...htmlInputProps,
        onChange: this.handleChange,
        type,
      },
      rest,
    ]
  }

  renderComponent({ ElementType, classes, rest }) {
    const { children, className, icon, input, type, onIconClick } = this.props
    const [htmlInputProps, restProps] = this.partitionProps()

    const inputClasses = cx(classes.input)

    const iconProps = {
      className: classes.icon,
      ...(icon &&
        typeof icon === 'string' && {
          name: icon,
          ...(onIconClick && { tabIndex: '0' }),
        }),
      ...(icon &&
        typeof icon === 'object' && {
          ...icon,
          ...(icon.onClick && { tabIndex: '0' }),
        }),
    }

    // Render with children
    // ----------------------------------------
    if (childrenExist(children)) {
      // add htmlInputProps to the `<input />` child
      const childElements = _.map(Children.toArray(children), child => {
        if (child.type !== 'input') return child
        return cloneElement(child, this.handleChildOverrides(child, htmlInputProps))
      })

      return (
        <ElementType {...rest} className={classes.root}>
          {childElements}
        </ElementType>
      )
    }

    if (!_.isNil(icon)) {
      return (
        <ElementType {...rest} className={classes.root} {...htmlInputProps}>
          {createHTMLInput(input || type, {
            defaultProps: htmlInputProps,
            overrideProps: { className: inputClasses },
          })}
          {Icon.create(
            {
              ...iconProps,
            },
            {
              generateKey: false,
              overrideProps: this.handleIconOverrides,
            },
          )}
        </ElementType>
      )
    }

    return (
      <ElementType {...rest} className={classes.root} {...htmlInputProps}>
        {createHTMLInput(input || type, {
          defaultProps: htmlInputProps,
          overrideProps: { className: inputClasses },
        })}
      </ElementType>
    )
  }
}

export default Input
