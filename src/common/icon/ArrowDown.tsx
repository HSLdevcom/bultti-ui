import React, { CSSProperties } from 'react'
import { svgSize } from '../../util/svg'
import { merge } from 'lodash'

type IconProps = {
  fill?: string
  height?: string | number
  width?: string | number
  style?: CSSProperties
}

export function ArrowDown({ fill, height, width, style, ...rest }: IconProps) {
  let styleProp = style || {}

  return (
    <svg
      {...rest}
      {...merge({ style: {} }, { style: styleProp }, svgSize(height, width))}
      viewBox="0 0 32 20"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <path
        fill={fill}
        fillRule="nonzero"
        d="M16 13.639L3.509 1.148A2.055 2.055 0 1 0 .602 4.055L16 19.453h.001l2.906-2.907L31.398 4.055a2.055 2.055 0 1 0-2.907-2.907L16 13.639z"
      />
    </svg>
  )
}
