import _ from 'lodash'
import cx from 'classnames'
import { combineRules } from 'fela'
import React from 'react'
import { FelaTheme } from 'react-fela'

// import getClasses from './getClasses'
import getElementType from './getElementType'
import getUnhandledProps from './getUnhandledProps'
import callable from './callable'
import {
  ComponentStyleFunctionArg,
  ComponentVariables,
  ComponentVariablesObject,
  IComponentStyleClasses,
  IComponentStyles,
  IMergedThemes,
  ISiteVariables,
  ITheme,
} from '../../types/theme'
import { toCompactArray } from './index'

export interface IRenderResultConfig<P> {
  ElementType: React.ReactType<P>
  rest: { [key: string]: any }
  classes: { [key: string]: string }
}

export type RenderComponentCallback<P> = (config: IRenderResultConfig<P>) => any

export interface IRenderConfig {
  className?: string
  defaultProps?: { [key: string]: any }
  displayName?: string
  handledProps: string[]
  props: {
    variables?: ComponentVariables
    styles?: IComponentStyles
    [key: string]: any
  }
}

const resolveComponentVariables = (
  componentVariables: ComponentVariables[],
  siteVariables: ISiteVariables,
): ComponentVariablesObject => {
  return toCompactArray(componentVariables).reduce((acc, next) => {
    return { ...acc, ...callable(next)(siteVariables) }
  }, {})
}

const renderComponentStyles = (
  renderer, // TODO type this
  componentStyles: IComponentStyles[],
  styleArg: ComponentStyleFunctionArg,
): IComponentStyleClasses => {
  console.group('renderComponentStyles')

  const componentParts: string[] = componentStyles.reduce((acc, next) => {
    return next ? _.union(acc, _.keys(next)) : acc
  }, [])

  console.log('renderComponentStyles componentParts', componentParts)

  const classes = componentParts.reduce((classes, partName) => {
    console.log('renderComponentStyles partName', partName)
    const styleFunctionsForPart = componentStyles.reduce((stylesForPart, nextStyle) => {
      debugger
      if (nextStyle[partName]) stylesForPart.push(callable(nextStyle[partName]))

      return stylesForPart
    }, [])
    console.log('renderComponentStyles styleFunctionsForPart', styleFunctionsForPart)

    const combinedFunctions = combineRules(...styleFunctionsForPart)
    console.log('renderComponentStyles combinedFunctions', combinedFunctions)

    debugger
    // TODO Why is this not being called and rendering?!
    // TODO Why is this not being called and rendering?!
    // TODO Why is this not being called and rendering?!
    // TODO Why is this not being called and rendering?!
    // TODO Why is this not being called and rendering?!

    // TODO DOESNT WORK - this is never called and the reduce loop skips code after this point...
    console.log('renderComponentStyles renderRule(', { combinedFunctions, styleArg }, ')')
    const renderedFunction = renderer.renderRule(combinedFunctions, styleArg)
    // TODO WORKS - reduce loop continues if we hard code the class string...
    // const renderedFunction = 'foo'
    debugger

    console.log('renderComponentStyles renderedFunction', renderedFunction)

    classes[partName] = renderedFunction

    return classes
  }, {})

  console.log('renderComponentStyles classes =', classes)
  console.groupEnd()
  return classes
}

const renderComponent = <P extends {}>(
  config: IRenderConfig,
  render: RenderComponentCallback<P>,
): React.ReactNode => {
  const { className, defaultProps, displayName, handledProps, props } = config

  return (
    <FelaTheme
      render={theme => {
        console.group('renderComponent', displayName)

        console.group('theme from context')
        console.log('siteVariables      :', theme.siteVariables)
        console.log('componentVariables :', theme.componentVariables)
        console.log('componentStyles    :', theme.componentStyles)
        console.log('rtl                :', theme.rtl)
        console.groupEnd()

        const ElementType = getElementType({ defaultProps }, props)
        const rest = getUnhandledProps({ handledProps }, props)

        //
        // Resolve variables using final siteVariables, allow props to override
        //
        const variablesForComponent = toCompactArray(theme.componentVariables)
          .map(variables => variables[displayName])
          .concat(props.variables)
          .filter(Boolean)

        const variables: ComponentVariablesObject = resolveComponentVariables(
          variablesForComponent,
          theme.siteVariables,
        )
        console.log('merged variables   = ', variables)

        //
        // Resolve styles using resolved variables, merge results, allow props to override
        //
        const stylesForComponent = toCompactArray(theme.componentStyles)
          .map(styles => styles[displayName])
          .concat(props.styles)
          .filter(Boolean)

        const styleArg = {
          props: this.props,
          variables,
          siteVariables: theme.siteVariables,
          rtl: theme.rtl,
        }
        console.log('stylesForComponent  = ', stylesForComponent)
        console.log('styleArg            = ', styleArg)

        const classes: ComponentVariablesObject = renderComponentStyles(
          theme.renderer,
          stylesForComponent,
          styleArg,
        )
        classes.root = cx(className, classes.root, props.className)
        console.log('classes             = ', classes)

        console.groupEnd()

        const config: IRenderResultConfig<P> = { ElementType, rest, classes }

        return render(config)
      }}
    />
  )
}

export default renderComponent
