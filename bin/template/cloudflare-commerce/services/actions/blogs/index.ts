import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { blogOnCategories, blogs } from '@/db/schema'

export const addBlog = async (props: { content: Record<string, any>; head_image: string; title: string }) => {
  const { content, title, head_image } = props
  return await db
    .insert(blogs)
    .values({
      content,
      title,
      head_image,
    })
    .returning()
    .get()
}

export const updateBlog = async (props: {
  id: string
  content: Record<string, any>
  head_image: string
  title: string
}) => {
  const { id, content, title, head_image } = props
  const blog = await db.query.blogs.findFirst({
    where: eq(blogs.id, id),
  })
  if (blog) {
    await db.update(blogs).set({ content, title, head_image }).where(eq(blogs.id, id))
  }
}

export const addCategoryToBlog = async (props: { blog_id: string; category_id: string }) => {
  const { blog_id, category_id } = props
  const boc = await db.query.blogOnCategories.findFirst({
    where: and(eq(blogOnCategories.category_id, category_id), eq(blogOnCategories.blog_id, blog_id)),
  })
  if (!boc) {
    await db.insert(blogOnCategories).values({
      category_id,
      blog_id,
    })
  }
}
