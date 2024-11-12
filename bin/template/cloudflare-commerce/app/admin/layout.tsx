'use client'

import { Menu, Spin } from '@arco-design/web-react'
import '@arco-design/web-react/dist/css/arco.css'
import { useRouter, usePathname } from 'next/navigation'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'

import { ROOT } from '@/lib/common/const'

const MenuItem = Menu.Item
const SubMenu = Menu.SubMenu

export default function AdminLayout({ children }: PropsWithChildren) {
  const router = useRouter()
  const path = usePathname()
  const [loading, setLoading] = useState(true)
  const [isRoot, setRoot] = useState(false)

  const selectedKey = useMemo(() => {
    const params = path.split('/')
    return params[params.length - 2] + '_' + params[params.length - 1]
  }, [path])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const res = await fetch('/api/auth/session', {
        method: 'GET',
      })
      const { user } = await res.json<any>()
      if (user.role === ROOT) {
        setRoot(true)
      } else {
        setRoot(false)
      }
      setLoading(false)
    }
    init()
  }, [])

  return (
    <div className="flex h-screen select-text overflow-hidden">
      <Menu style={{ width: 200, height: '100%' }} hasCollapseButton theme="dark" selectedKeys={[selectedKey]} autoOpen>
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spin />
          </div>
        ) : (
          <>
            <SubMenu key="Order" title="Order">
              <MenuItem
                key="order_list"
                onClick={() => {
                  router.push('/admin/order/list')
                }}
              >
                List
              </MenuItem>
            </SubMenu>
            <SubMenu key="CashRequest" title="CashRequest">
              <MenuItem
                key="cash_request"
                onClick={() => {
                  router.push('/admin/catchRequest/list')
                }}
              >
                List
              </MenuItem>
            </SubMenu>
            {isRoot && (
              <>
                <SubMenu key="blog" title="Blog">
                  <MenuItem
                    key="blog"
                    onClick={() => {
                      router.push('/admin/blog/list')
                    }}
                  >
                    List
                  </MenuItem>
                </SubMenu>
                <SubMenu key="product" title="Products">
                  <MenuItem
                    key="product_create"
                    onClick={() => {
                      router.push('/admin/product/create')
                    }}
                  >
                    Create
                  </MenuItem>
                  <MenuItem
                    key="product_list"
                    onClick={() => {
                      router.push('/admin/product/list')
                    }}
                  >
                    List
                  </MenuItem>
                </SubMenu>
                <SubMenu key="levelSetting" title="levelSetting">
                  <MenuItem
                    key="level_setting"
                    onClick={() => {
                      router.push('/admin/levelSetting/list')
                    }}
                  >
                    List
                  </MenuItem>
                </SubMenu>
                <SubMenu key="userLevel" title="UserLevel">
                  <MenuItem
                    key="user_level"
                    onClick={() => {
                      router.push('/admin/userLevel/list')
                    }}
                  >
                    List
                  </MenuItem>
                </SubMenu>
              </>
            )}
          </>
        )}
      </Menu>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
