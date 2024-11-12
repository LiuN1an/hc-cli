'use client'

import { ProductForm } from '@/components/Admin/Product/form'

export const runtime = 'edge'

export default function Create() {
  return (
    <div className="p-8">
      <ProductForm />
    </div>
  )
}
