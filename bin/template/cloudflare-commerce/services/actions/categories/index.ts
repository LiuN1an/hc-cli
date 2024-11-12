import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { categories } from '@/db/schema'

export const addCategory = async (props: { category: string }) => {
  const { category } = props
  const findCategory = await db.query.categories.findFirst({
    where: eq(categories.title, category),
  })
  if (findCategory) {
    return findCategory.id
  } else {
    const insertCategory = await db
      .insert(categories)
      .values({
        title: category,
      })
      .returning()
      .get()
    return insertCategory.id
  }
}

export const getCategoryById = async (id: string) => {
  return await db.query.categories.findFirst({
    where: eq(categories.id, id),
    columns: {
      id: true,
      title: true,
    },
  })
}

export const getCategoryByName = async (name: string) => {
  return await db.query.categories.findFirst({
    where: eq(categories.title, name),
    columns: {
      id: true,
      title: true,
    },
  })
}
