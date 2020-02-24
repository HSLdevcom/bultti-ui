import React from 'react'
import { svgSize } from '../../utils/svg'

type IconProps = {
  fill?: string
  height?: string | number
  width?: string | number
} & {
  [propName: string]: string | number
}

export function Checkmark2({ fill, height, width, ...rest }: IconProps) {
  return (
    <svg
      {...rest}
      {...svgSize(height, width)}
      viewBox="0 0 214 168"
      version="1.1"
      preserveAspectRatio="xMidYMid meet">
      <g strokeWidth="1">
        <g fill={fill} strokeWidth={0.01}>
          <path d="M182.3855,6.3325 L71.7325,116.9865 L31.0795,76.3335 C23.9695,69.2235 12.4425,69.2235 5.3325,76.3335 C-1.7775,83.4435 -1.7775,94.9705 5.3325,102.0805 L45.9855,142.7325 L71.7325,168.4795 L97.4785,142.7325 L208.1325,32.0795 C215.2415,24.9695 215.2415,13.4425 208.1325,6.3325 C201.0225,-0.7775 189.4955,-0.7775 182.3855,6.3325 Z" />
        </g>
      </g>
    </svg>
  )
}
