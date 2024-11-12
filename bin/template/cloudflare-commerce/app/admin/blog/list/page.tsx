'use client'

import { Button, Modal, Table, Notification, Form, Tabs, Upload } from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/es/Table'
import { IconDelete, IconEdit, IconEye, IconPlus } from '@arco-design/web-react/icon'
import Input from 'antd-mobile/es/components/input'
import Space from 'antd-mobile/es/components/space'
import TextArea from 'antd-mobile/es/components/text-area'
import { useEffect, useState } from 'react'

import { UploadImage } from '@/lib/client/components'
import { useArcoUploadImages } from '@/lib/client/hook'
import { randomFileName, uploadSignedFile } from '@/lib/client/utils'

interface BlogType {
  id: string
  title: string
  content: string
  status: 'draft' | 'publish'
  coverImage?: string
  createdAt: string
  updatedAt: string
}

interface BlogFormProps {
  mode: 'create' | 'edit' | 'view'
  blog?: BlogType
  onSubmit: (values: Partial<BlogType>) => void
  onCancel: () => void
}

const BlogForm = ({ mode, blog, onSubmit, onCancel }: BlogFormProps) => {
  const [form] = Form.useForm()
  const [img, setImgs] = useArcoUploadImages(blog?.coverImage ? [blog.coverImage] : [])

  useEffect(() => {
    if (blog) {
      form.setFieldsValue(blog)
    }
  }, [blog, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      onSubmit(values)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Form form={form} layout="vertical" disabled={mode === 'view'}>
      <Form.Item label="Title" field="title" rules={[{ required: true }]}>
        <Input placeholder="Enter blog title" />
      </Form.Item>

      <Form.Item label="Content" field="content" rules={[{ required: true }]}>
        <TextArea
          placeholder="Enter blog content"
          autoSize
          style={{
            border: '1px solid #666',
            padding: '12px',
          }}
        />
      </Form.Item>

      <Form.Item label="Cover Image" field="coverImage">
        <UploadImage onChange={(v) => setImgs(v)} defaultFileList={img} />
      </Form.Item>

      {mode !== 'view' && (
        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  )
}

const TabPane = Tabs.TabPane

export const runtime = 'edge'

type BlogStatus = 'draft' | 'publish'

const fetchBlogList = async (params: {
  pageSize: number
  current: number
  status: BlogStatus
}): Promise<{ data: BlogType[]; total: number }> => {
  const response = await fetch(
    `/api/admin/blog?limit=${params.pageSize}&offset=${(params.current - 1) * params.pageSize}&status=${params.status}`,
  )
  const result = await response.json<any>()
  if (result.message === 'ok') {
    return {
      data: result.data,
      total: result.total,
    }
  }
  throw new Error('Failed to fetch blog list')
}

const Page = () => {
  const [data, setData] = useState<BlogType[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<BlogStatus>('publish')
  const [currentBlog, setCurrentBlog] = useState<BlogType | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await fetchBlogList({
        pageSize: pagination.pageSize,
        current: pagination.current,
        status: currentStatus,
      })
      setData(result.data)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      Notification.error({
        content: 'Failed to fetch blog list',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, currentStatus])

  const handleSuccess = () => {
    setModalVisible(false)
    setCurrentBlog(null)
    fetchData()
  }

  const handleStatusChange = async (id: string, status: BlogStatus) => {
    try {
      const response = await fetch('/api/admin/blog/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (response.ok) {
        Notification.success({ content: 'Status updated successfully' })
        fetchData()
      }
    } catch (error) {
      Notification.error({ content: 'Failed to update status' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        Notification.success({ content: 'Blog deleted successfully' })
        fetchData()
      }
    } catch (error) {
      Notification.error({ content: 'Failed to delete blog' })
    }
  }

  const columns: ColumnProps<BlogType>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
    },
    {
      title: 'Head Image',
      dataIndex: 'headImage',
      render: (url) => url && <img src={url} alt="head" className="h-20 w-20 object-cover" />,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      render: (content) => content.substring(0, 100) + '...',
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            type="text"
            icon={<IconEye />}
            onClick={() => {
              setCurrentBlog(record)
              setModalMode('view')
              setModalVisible(true)
            }}
          />
          <Button
            type="text"
            icon={<IconEdit />}
            onClick={() => {
              setCurrentBlog(record)
              setModalMode('edit')
              setModalVisible(true)
            }}
          />
          {currentStatus === 'draft' ? (
            <>
              <Button type="text" status="success" onClick={() => handleStatusChange(record.id, 'publish')}>
                Publish
              </Button>
              <Button type="text" status="danger" icon={<IconDelete />} onClick={() => handleDelete(record.id)} />
            </>
          ) : (
            <Button type="text" onClick={() => handleStatusChange(record.id, 'draft')}>
              To Draft
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between">
        <Tabs activeTab={currentStatus} onChange={(key) => setCurrentStatus(key as BlogStatus)}>
          <TabPane key="publish" title="Published" />
          <TabPane key="draft" title="Drafts" />
        </Tabs>

        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => {
            setModalMode('create')
            setCurrentBlog(null)
            setModalVisible(true)
          }}
        >
          Create Blog
        </Button>
      </div>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (current, pageSize) => setPagination((prev) => ({ ...prev, current, pageSize })),
        }}
      />

      <Modal
        title={modalMode === 'create' ? 'Create Blog' : modalMode === 'edit' ? 'Edit Blog' : 'View Blog'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        style={{ width: '80%', maxWidth: '1000px' }}
      >
        <BlogForm
          mode={modalMode}
          blog={currentBlog || undefined}
          onSubmit={handleSuccess}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  )
}

export default Page
