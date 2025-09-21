import type { Route } from "./+types/admin.product";
import { Form, useActionData, useLoaderData } from "react-router";
import { EnvContext, UserContext } from "~/context";
import { adminAuthMiddleware } from "~/middleware/admin-auth";
import { AdminLayout } from "~/components/AdminLayout";
import { products, hierarchicalCategories } from "@/schema";
import type { PublicUser, Product, HierarchicalCategory } from "@/types";
import { eq, and } from "drizzle-orm";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  PackageIcon,
  SearchIcon,
  FilterIcon,
  ToggleLeftIcon,
  ToggleRightIcon
} from "lucide-react";
import { Separator } from "~/components/ui/separator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "商品管理 - 管理后台" },
    { name: "description", content: "管理平台商品信息" },
  ];
}

export const middleware: Route.MiddlewareFunction[] = [
  adminAuthMiddleware as Route.MiddlewareFunction,
];

// 从数据库查询推断商品列表类型（匹配 select 的字段）
type ProductQueryResult = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number;
  stock: number;
  displayOrder: number;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}[];

// 从数据库查询推断分类列表类型（匹配 select 的字段）
type CategoryQueryResult = {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
}[];

// 定义Loader返回类型（匹配实际查询结果）
type ProductLoaderData = {
  currentUser: PublicUser;
  products: ProductQueryResult;
  categories: CategoryQueryResult;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search: string;
    status: string;
  };
};

export async function loader({ context, request }: Route.LoaderArgs): Promise<ProductLoaderData> {
  // middleware已经确保用户已认证且为管理员
  const user = context.get(UserContext)!; // 非空断言，因为middleware保证用户存在
  const { db } = context.get(EnvContext);
  
  // 获取URL参数进行搜索和筛选
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "all";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // 构建查询条件
  let whereConditions = [eq(products.isDeleted, false)];
  
  if (search) {
    // 这里简化处理，实际应该使用全文搜索
    whereConditions.push(
      // SQLite doesn't have LIKE operator in Drizzle, we'll use a workaround
      // 在实际项目中，可能需要使用 sql 模板字符串
    );
  }

  if (status === "online") {
    whereConditions.push(eq(products.isOnline, true));
  } else if (status === "offline") {
    whereConditions.push(eq(products.isOnline, false));
  }

  // 获取商品列表
  const productsList = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      stock: products.stock,
      displayOrder: products.displayOrder,
      isOnline: products.isOnline,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(...whereConditions))
    .orderBy(products.displayOrder, products.createdAt)
    .limit(limit)
    .offset(offset);

  // 获取分类列表（用于创建/编辑商品时选择）
  const categoriesList = await db
    .select({
      id: hierarchicalCategories.id,
      name: hierarchicalCategories.name,
      level: hierarchicalCategories.level,
      parentId: hierarchicalCategories.parentId,
    })
    .from(hierarchicalCategories)
    .where(eq(hierarchicalCategories.isActive, true))
    .orderBy(hierarchicalCategories.level, hierarchicalCategories.displayOrder);

  return {
    currentUser: user,
    products: productsList,
    categories: categoriesList,
    pagination: {
      page,
      limit,
      total: productsList.length, // 实际项目中应该单独查询总数
    },
    filters: {
      search,
      status,
    }
  } as const;
}

// 定义Action返回类型
type ActionResponse = 
  | { success: true; message: string; data?: Product }
  | { success: false; error: string };

export async function action({ request, context }: Route.ActionArgs): Promise<ActionResponse> {
  // middleware已经确保用户已认证且为管理员
  const { db } = context.get(EnvContext);

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    switch (intent) {
      case "create": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const originalPrice = parseFloat(formData.get("originalPrice") as string);
        const stock = parseInt(formData.get("stock") as string);
        const isOnline = formData.get("isOnline") === "true";

        if (!name || !price || !originalPrice || !stock) {
          return {
            success: false,
            error: "请填写所有必填字段",
          };
        }

        const newProduct = await db
          .insert(products)
          .values({
            name,
            description: description || "",
            price,
            originalPrice,
            stock,
            isOnline,
            displayOrder: 0,
          })
          .returning();

        return {
          success: true,
          message: "商品创建成功",
          data: newProduct[0],
        };
      }

      case "toggle-status": {
        const productId = formData.get("productId") as string;
        const currentStatus = formData.get("currentStatus") === "true";

        if (!productId) {
          return {
            success: false,
            error: "商品ID不能为空",
          };
        }

        await db
          .update(products)
          .set({ 
            isOnline: !currentStatus,
            updatedAt: new Date().toISOString()
          })
          .where(eq(products.id, productId));

        return {
          success: true,
          message: `商品已${!currentStatus ? "上线" : "下线"}`,
        };
      }

      case "delete": {
        const productId = formData.get("productId") as string;

        if (!productId) {
          return {
            success: false,
            error: "商品ID不能为空",
          };
        }

        // 软删除
        await db
          .update(products)
          .set({ 
            isDeleted: true,
            updatedAt: new Date().toISOString()
          })
          .where(eq(products.id, productId));

        return {
          success: true,
          message: "商品已删除",
        };
      }

      default:
        return {
          success: false,
          error: "无效的操作",
        };
    }
  } catch (error) {
    console.error("商品管理操作失败:", error);
    return {
      success: false,
      error: "操作失败，请稍后重试",
    };
  }
}

export default function AdminProducts({ loaderData }: { loaderData: ProductLoaderData }) {
  const { products: productsList, categories, filters } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 处理状态筛选变化
  const handleStatusChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newSearchParams.delete("status");
    } else {
      newSearchParams.set("status", value);
    }
    navigate(`?${newSearchParams.toString()}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">商品管理</h1>
            <p className="text-muted-foreground">
              管理平台所有商品信息，包括创建、编辑、上下线等操作
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                添加商品
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>添加新商品</DialogTitle>
                <DialogDescription>
                  填写商品信息，创建新的商品。点击保存完成创建。
                </DialogDescription>
              </DialogHeader>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="create" />
                
                <div className="space-y-2">
                  <Label htmlFor="name">商品名称</Label>
                  <Input id="name" name="name" placeholder="请输入商品名称" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">商品描述</Label>
                  <Input id="description" name="description" placeholder="请输入商品描述" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">售价</Label>
                    <Input 
                      id="price"
                      name="price" 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">原价</Label>
                    <Input 
                      id="originalPrice"
                      name="originalPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">库存数量</Label>
                  <Input 
                    id="stock"
                    name="stock" 
                    type="number" 
                    placeholder="0" 
                    required 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    name="isOnline" 
                    value="true"
                    id="isOnline"
                  />
                  <Label htmlFor="isOnline">立即上线</Label>
                </div>
                
                <DialogFooter>
                  <Button type="submit">创建商品</Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索商品名称..."
              defaultValue={filters.search}
              className="pl-9"
              name="search"
            />
          </div>
          
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="online">已上线</SelectItem>
              <SelectItem value="offline">已下线</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </div>

        {/* 操作结果提示 */}
        {actionData && (
          <div className={`p-4 rounded-lg ${
            actionData.success 
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800" 
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
          }`}>
            {actionData.success ? actionData.message : actionData.error}
          </div>
        )}

        {/* 商品列表 */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">商品列表</h3>
              <span className="text-sm text-muted-foreground">
                ({productsList.length} 件商品)
              </span>
            </div>
          </div>
          
          <Separator />
          
          <div className="divide-y">
            {productsList.length > 0 ? (
              productsList.map((product) => (
                <div key={product.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            product.isOnline
                              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {product.isOnline ? "已上线" : "已下线"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            库存: {product.stock}
                          </span>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium text-primary">
                          ¥{product.price}
                        </span>
                        {product.originalPrice !== product.price && (
                          <span className="text-muted-foreground line-through">
                            ¥{product.originalPrice}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          创建时间: {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="toggle-status" />
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="currentStatus" value={product.isOnline.toString()} />
                        <Button 
                          type="submit"
                          variant="outline" 
                          size="sm"
                          title={product.isOnline ? "下线商品" : "上线商品"}
                        >
                          {product.isOnline ? (
                            <ToggleRightIcon className="h-4 w-4" />
                          ) : (
                            <ToggleLeftIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </Form>
                      
                      <Button variant="outline" size="sm" title="编辑商品">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="productId" value={product.id} />
                        <Button 
                          type="submit"
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="删除商品"
                          onClick={(e) => {
                            if (!confirm("确定要删除这个商品吗？")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </Form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <PackageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无商品数据</p>
                <p className="text-sm mt-1">点击"添加商品"开始创建第一个商品</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
