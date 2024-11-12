import type { NextRequest } from 'next/server'

import type { validateRequest } from '@/auth.validate'
import type { Product, User, Order as DBOrder } from '@/db/schema'
import type { getHomeRecommandProducts, getProductByName } from '@/services/actions/products'

export type ProductRequest = {
  id?: string
  recommandToHome?: boolean
  images: string[]
  detail_images: string[]
} & Omit<Product, 'id'>

export type CheckTypes = 'accept' | 'pending' | 'reject'

export type UserRoleTypes = 'user' | 'admin'

export type NextAuthRequest = { user: User; request: NextRequest }

export type Order = DBOrder

export type ReturnOfFunction<T extends (...args: any) => any> = Awaited<ReturnType<T>>

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never

type HomeRecommandProductsType = ReturnOfFunction<typeof getHomeRecommandProducts>

export type HomeRecommandProductType = HomeRecommandProductsType extends (infer T)[] ? T : never

export type ProductDetailType = ReturnOfFunction<typeof getProductByName>

export type UserType = ReturnOfFunction<typeof validateRequest>


