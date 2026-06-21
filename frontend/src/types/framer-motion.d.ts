declare module 'framer-motion' {
  import { ComponentType, ReactNode, HTMLAttributes, AnchorHTMLAttributes, FormHTMLAttributes } from 'react'

  export interface MotionProps {
    initial?: unknown
    animate?: unknown
    exit?: unknown
    variants?: unknown
    whileHover?: unknown
    whileTap?: unknown
    whileInView?: unknown
    whileFocus?: unknown
    whileDrag?: unknown
    viewport?: Record<string, unknown>
    transition?: unknown
    layout?: boolean
    className?: string
    style?: Record<string, unknown>
    ref?: unknown
    key?: string
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    children?: ReactNode
  }

  type Motion<T> = ComponentType<MotionProps & T>

  export interface motion {
    div: Motion<HTMLAttributes<HTMLDivElement>>
    span: Motion<HTMLAttributes<HTMLSpanElement>>
    button: Motion<HTMLAttributes<HTMLButtonElement>>
    a: Motion<AnchorHTMLAttributes<HTMLAnchorElement>>
    form: Motion<FormHTMLAttributes<HTMLFormElement>>
    h1: Motion<HTMLAttributes<HTMLHeadingElement>>
    h2: Motion<HTMLAttributes<HTMLHeadingElement>>
    h3: Motion<HTMLAttributes<HTMLHeadingElement>>
    h4: Motion<HTMLAttributes<HTMLHeadingElement>>
    h5: Motion<HTMLAttributes<HTMLHeadingElement>>
    h6: Motion<HTMLAttributes<HTMLHeadingElement>>
    p: Motion<HTMLAttributes<HTMLParagraphElement>>
    section: Motion<HTMLAttributes<HTMLElement>>
    li: Motion<HTMLLIElement>
    ul: Motion<HTMLAttributes<HTMLUListElement>>
    label: Motion<HTMLLabelElement>
    img: Motion<HTMLAttributes<HTMLImageElement>>
    svg: Motion<SVGSVGElement>
  }

  export const motion: motion

  export const AnimatePresence: ComponentType<{
    children?: ReactNode
    initial?: boolean
    mode?: 'wait' | 'sync' | 'popLayout'
  }>

  export { motion as default }
}
