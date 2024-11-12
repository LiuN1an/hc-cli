'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ProductForm } from '@/components/Admin/Product/form'

export const runtime = 'edge'

export default function Page() {
  const [product, setProduct] = useState(null)
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(`/api/product?id=${id}`)
      const data = await response.json<any>()
      setProduct(data.data)
    }

    fetchProduct()
  }, [id])

  return <div className="p-8">{product && <ProductForm product={product} />}</div>
}
