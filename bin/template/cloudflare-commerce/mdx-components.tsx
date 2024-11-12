import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => {
      return <div className="select-text p-4">{children}</div>
    },
    h1: ({ children }) => {
      return <div className="text-2xl font-bold">{children}</div>
    },
    p: ({ children }) => {
      return <div className="mt-4 text-lg text-[#0e1b4dbf]">{children}</div>
    },
    ...components,
  }
}
