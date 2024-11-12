'use client'

import { Table, Button, Modal, Notification, Image } from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/es/Table'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const runtime = 'edge'

export default function List() {
  const [products, setProducts] = useState<any[]>([]) // Specify type for products
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json<any>()
        if (data.message === 'ok') {
          setProducts(data.data)
        }
      } catch (error) {
        Notification.error({ content: 'Failed to fetch products' }) // Use notification from arco-design
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleDelete = async (id: number) => {
    // Specify type for id
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this product?',
      onOk: async () => {
        try {
          const response = await fetch(`/api/product`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
          })
          if (response.ok) {
            setProducts(products.filter((product) => product.id !== id))
            Notification.success({ content: 'Product deleted successfully' }) // Use notification from arco-design
          } else {
            Notification.error({ content: 'Failed to delete product' }) // Use notification from arco-design
          }
        } catch (error) {
          Notification.error({ content: 'An error occurred while deleting the product' }) // Use notification from arco-design
        }
      },
      okText: 'Yes', // Change button text to English
      cancelText: 'No', // Change button text to English
    })
  }

  const columns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Price', dataIndex: 'price' },
    { title: 'Magnification', dataIndex: 'magnification' },
    {
      title: 'Images',
      render: (text: string, record: any) => {
        return record.images && record.images.length > 0 ? (
          <Image
            src={record.images[0]}
            alt="Product"
            style={{ width: '50px', objectFit: 'cover', cursor: 'pointer' }}
            preview // Enable image preview
          />
        ) : null
      },
    },
    {
      title: 'Action',
      render: (
        text: string,
        record: any, // Specify types for text and record
      ) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="primary" onClick={() => router.push(`/admin/product/edit/${record.id}`)}>
            Edit
          </Button>
          <Button type="outline" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ] satisfies ColumnProps<any>[]

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.push('/admin/product/create')}>
          Add Product
        </Button>
      </div>
      <Table columns={columns} data={products} loading={loading} scroll={{ x: true }} style={{ width: '100%' }} />
    </div>
  )
}
