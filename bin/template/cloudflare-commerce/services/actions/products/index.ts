import { sql } from 'drizzle-orm'
import { and, asc, eq } from 'drizzle-orm/expressions'
import { cache } from 'react'

import { db } from '@/db'
import { productImages, products, RecommandProducts } from '@/db/schema'
import { addUnderLine } from '@/lib/common'
import { ProductRequest } from '@/types/server'

export const getHomeRecommandProducts = cache(async () => {
  const recommands = await db.query.RecommandProducts.findMany({
    where: eq(RecommandProducts.scene, 'home'),
    orderBy: asc(RecommandProducts.created_at),
    columns: {
      id: false,
      from_product_id: false,
      created_at: false,
      updated_at: false,
    },
    with: {
      product: {
        with: {
          images: true,
        },
      },
    },
  })
  return recommands.map((recommand) => {
    const { product } = recommand
    const { images: relationImages, ...rest } = product
    const { images } = relationImages || { images: [] }
    return { ...rest, images }
  })
})

export const getProducts = cache(async () => {
  const o_products = await db.query.products.findMany({
    orderBy: asc(products.created_at),
    with: {
      images: {
        columns: {
          id: false,
          product_id: false,
        },
      },
    },
  })
  return o_products.map((product) => {
    const { images: relationImages, ...rest } = product
    const { images, detail_images } = relationImages || { images: [], detail_images: [] }
    return { ...rest, images, detail_images }
  })
})

export const getCategoriesByProduct = async (product_id: string) => {}

export const getProduct = async (id: string) => {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    columns: {
      created_at: false,
      updated_at: false,
    },
    with: {
      images: {
        columns: {
          id: false,
          product_id: false,
        },
      },
    },
  })
  return product
}

export const getProductByName = async (name: string) => {
  const product = await db.query.products.findFirst({
    where: eq(products.index_title, name),
    columns: {
      created_at: false,
      updated_at: false,
    },
    with: {
      images: {
        columns: {
          id: false,
          product_id: false,
        },
      },
    },
  })

  if (!product) {
    return null
  }

  const { images: wrapper, ...rest } = product

  return { ...rest, ...(wrapper as { images: string[]; detail_images: string[] }) }
}

export const getRecommandByProduct = async (product_id: string) => {
  const recommand = await db.query.RecommandProducts.findMany({
    where: eq(RecommandProducts.target_product_id, product_id),
    columns: {
      from_product_id: true,
      scene: true,
      target_product_id: true,
    },
  })

  return recommand
}

// TODO: 这个接口需要禁用
export const deleteProduct = async (id: string) => {
  await db.batch([
    db.delete(RecommandProducts).where(eq(RecommandProducts.target_product_id, id)),
    db.delete(productImages).where(eq(productImages.product_id, id)),
  ])
  await db.delete(products).where(eq(products.id, id))
}

export const uploadProduct = async (product: ProductRequest) => {
  const { id } = product

  let new_product_id = null
  if (id) {
    const exist = await db.query.products.findFirst({
      where: eq(products.id, id),
    })
    if (!exist) throw new Error('Product Id is invalid')

    await db.batch([
      db
        .update(products)
        .set({
          title: product.title,
          index_title: addUnderLine(product.title),
          desc: product.desc,
          old_price: product.old_price,
          price: product.price,
          magnification: product.magnification,
          updated_at: sql`(unixepoch())`,
          currency: product.currency,
        })
        .where(eq(products.id, id)),
      db
        .update(productImages)
        .set({
          images: product.images,
          detail_images: product.detail_images,
        })
        .where(eq(productImages.product_id, id)),
    ])
  } else {
    const new_product = await db
      .insert(products)
      .values({
        title: product.title,
        index_title: addUnderLine(product.title),
        desc: product.desc,
        old_price: product.old_price,
        price: product.price,
        magnification: product.magnification,
        currency: product.currency,
      })
      .returning()
      .get()
    await db.insert(productImages).values({
      product_id: new_product.id,
      images: product.images,
      detail_images: product.detail_images,
    })
    new_product_id = new_product.id
  }
  const recommand_product = await db.query.RecommandProducts.findFirst({
    where: and(
      eq(RecommandProducts.target_product_id, id || (new_product_id as string)),
      eq(RecommandProducts.scene, 'home'),
    ),
  })

  if (product.recommandToHome) {
    if (!recommand_product) {
      await db.insert(RecommandProducts).values({
        scene: 'home',
        target_product_id: id || (new_product_id as string),
      })
    }
  } else {
    if (recommand_product) {
      await db.delete(RecommandProducts).where(eq(RecommandProducts.id, recommand_product.id))
    }
  }
}
