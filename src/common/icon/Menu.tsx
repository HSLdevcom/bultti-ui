import React from 'react'
import { svgSize } from '../../util/svg'

type IconProps = {
  fill?: string
  height?: string | number
  width?: string | number
} & {
  [propName: string]: string | number
}

export function Menu({ fill, height, width, ...rest }: IconProps) {
  return (
    <svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 40 24"
      preserveAspectRatio="xMidYMid meet">
      <g fill={fill}>
        <path
          d="M37.999,4 L2,4 C0.896,4 0,3.105 0,2 C0,0.895 0.896,0 2,0 L37.999,0 C39.104,0 40,0.895 40,2 C40,3.105 39.104,4 37.999,4 Z"
          id="menu-top"
        />
        <path
          d="M37.999,14 L2,14 C0.896,14 0,13.105 0,12 C0,10.895 0.896,10 2,10 L37.999,10 C39.104,10 40,10.895 40,12 C40,13.105 39.104,14 37.999,14 Z"
          id="menu-middle-1"
        />
        <path
          d="M37.999,14 L2,14 C0.896,14 0,13.105 0,12 C0,10.895 0.896,10 2,10 L37.999,10 C39.104,10 40,10.895 40,12 C40,13.105 39.104,14 37.999,14 Z"
          id="menu-middle-2"
        />
        <path
          d="M2,20 L37.999,20 C39.104,20 40,20.895 40,22 C40,23.105 39.104,24 37.999,24 L2,24 C0.896,24 0,23.105 0,22 C0,20.895 0.896,20 2,20 Z"
          id="menu-bot"
        />
      </g>
    </svg>
  )
}
