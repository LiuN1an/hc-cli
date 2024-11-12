import { and, asc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { productStars, reviews } from '@/db/schema'
import { CheckTypes } from '@/types/server'

export const addReviewToProduct = async (props: {
  product_id: string
  user_id?: string
  simulate?: {
    name: string
    avatar: string
  }
  content: Record<string, any>
}) => {
  const { product_id, user_id, content, simulate } = props
  const anonymous = user_id === undefined
  await db.insert(reviews).values({
    product_id,
    content,
    status: 'pending',
    ...(anonymous
      ? {
          anonymous: true,
          user_name: simulate?.name,
          user_avatar: simulate?.avatar,
        }
      : {
          anonymous: false,
          user_id,
        }),
  })
}

export const getAcceptReviews = async (props: { product_id: string; limit: number; offset: number }) => {
  const { product_id, limit, offset } = props
  return await db.query.reviews.findMany({
    where: and(eq(reviews.product_id, product_id), eq(reviews.status, 'accept')),
    orderBy: asc(reviews.created_at),
    limit,
    offset,
  })
}

export const getPendingReviews = async (props: { product_id: string; limit: number; offset: number }) => {
  const { product_id, limit, offset } = props
  return await db.query.reviews.findMany({
    where: and(eq(reviews.product_id, product_id), eq(reviews.status, 'pending')),
    orderBy: asc(reviews.created_at),
    limit,
    offset,
  })
}

export const getRejectReviews = async (props: { product_id: string; limit: number; offset: number }) => {
  const { product_id, limit, offset } = props
  return await db.query.reviews.findMany({
    where: and(eq(reviews.product_id, product_id), eq(reviews.status, 'reject')),
    orderBy: asc(reviews.created_at),
    limit,
    offset,
  })
}

export const changetReviewStatus = async (id: string, status: CheckTypes) => {
  await db
    .update(reviews)
    .set({
      status,
    })
    .where(eq(reviews.id, id))
}

export const getProductStars = async (product_id: string) => {
  return await db.query.productStars.findFirst({
    where: eq(productStars.product_id, product_id),
    columns: {
      stars: true,
    },
  })
}

export const getHotReviewsWithAnonymous = async () => {
  return await db.query.reviews.findMany({
    orderBy: asc(reviews.created_at),
    where: and(eq(reviews.anonymous, true), eq(reviews.status, 'accept')),
    columns: {
      id: false,
      user_id: false,
      created_at: false,
      updated_at: false,
      anonymous: false,
    },
  })
}

export const getHotReviewsWithUser = async () => {
  return await db.query.reviews.findMany({
    orderBy: asc(reviews.created_at),
    where: and(eq(reviews.anonymous, false), eq(reviews.status, 'accept')),
    columns: {
      id: false,
      created_at: false,
      updated_at: false,
      anonymous: false,
    },
  })
}
