import { desc, eq } from 'drizzle-orm'

import { db } from '@/db/index'
import { carts } from '@/db/schema'

export const addCart = async (props: { user_id: string; product_id: string; number: number }) => {
  await db.insert(carts).values(props)
}

export const getCartByUser = async (user_id: string) => {
  return await db.query.carts.findMany({
    where: eq(carts.user_id, user_id),
    orderBy: desc(carts.created_at),
  })
}

export const updateProductFromCart = async (props: { id: string; number: number }) => {
  const { id, number } = props
  if (number === 0) {
    await db.delete(carts).where(eq(carts.id, id))
  } else {
    await db
      .update(carts)
      .set({
        number,
      })
      .where(eq(carts.id, id))
  }
}

export const emptyCartByUser = async (user_id: string) => {
  await db.delete(carts).where(eq(carts.user_id, user_id))
}

export const cartToOrder = async (items: { id: string }[]) => {
  const [] = await db.batch(items.map(({ id }) => db.select().from(carts).where(eq(carts.id, id))) as any)
}
