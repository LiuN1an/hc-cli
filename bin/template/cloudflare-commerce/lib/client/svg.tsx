import type { FC, HTMLAttributes } from 'react'

type SVGFCProps<T = {}> = FC<HTMLAttributes<SVGSVGElement> & T>

type SVGFCSizeProps = SVGFCProps<{ size?: string }>