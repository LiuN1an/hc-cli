---
description: 表单开发模式与最佳实践 - React Hook Form + Zod + shadcn/ui
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: true
---
# 表单开发模式与最佳实践

## 核心技术栈

```json
{
  "react-hook-form": "^7.x",     // 表单状态管理
  "zod": "^4.x",                 // Schema 验证与类型推断
  "@hookform/resolvers": "^5.x"  // React Hook Form 与 Zod 集成
}
```

### UI 组件系统
- **shadcn/ui Form 组件**：统一的表单组件封装
- **Radix UI**：底层无障碍访问原语

---

## 三种表单模式决策树

### 模式选择流程

```
表单需求
    ↓
字段数量 > 5 或需要实时验证？
    ↓               ↓
   是               否
    ↓               ↓
React Hook Form   字段数 > 2？
+ Zod Schema          ↓       ↓
                     是       否
                     ↓        ↓
              useState +   useState
              手动验证      + Toast
```

### 模式 1：React Hook Form + Zod（推荐）

**使用场景**
- 5+ 字段的复杂表单
- 需要实时验证反馈
- 需要类型安全和自动推断
- 需要与父组件双向同步状态

**示例：SKU 编辑表单**

```typescript
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

// ✅ Step 1: 定义 Zod Schema
const skuFormSchema = z.object({
  title: z.string()
    .min(1, "SKU标题不能为空")
    .max(100, "SKU标题不能超过100个字符"),
  price: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "请输入有效的价格（必须大于0）",
    }),
  originalPrice: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "请输入有效的原价（必须大于0）",
    }),
  stock: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "请输入有效的库存（必须大于等于0）",
    }),
});

// ✅ Step 2: 自动推断 TypeScript 类型
type SkuFormValues = z.infer<typeof skuFormSchema>;

// ✅ Step 3: 初始化表单（自定义 resolver）
export function SkuEditForm({ sku, onSave }: Props) {
  const form = useForm<SkuFormValues>({
    resolver: async (values) => {
      try {
        const validatedData = await skuFormSchema.parseAsync(values);
        return {
          values: validatedData,
          errors: {},
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, { type: string; message: string }> = {};
          error.issues.forEach((err: z.ZodIssue) => {
            const path = err.path.join(".");
            errors[path] = {
              type: "validation",
              message: err.message,
            };
          });
          return { values: {}, errors };
        }
        return {
          values: {},
          errors: {
            root: { type: "validation", message: "验证失败" },
          },
        };
      }
    },
    defaultValues: {
      title: sku.title,
      price: sku.price,
      originalPrice: sku.originalPrice,
      stock: sku.stock,
    },
  });

  // ✅ Step 4: 使用 shadcn/ui Form 组件
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU标题 *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="如：红色/S码" />
              </FormControl>
              <FormMessage /> {/* 自动显示验证错误 */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>售价 (¥) *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="99.99" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          保存
        </Button>
      </form>
    </Form>
  );
}
```

---

### 模式 2：useState + 手动验证

**使用场景**
- 2-4 字段的简单表单
- 验证逻辑简单直观
- 不需要复杂的类型推断

**示例：分类对话框**

```typescript
import { useState } from "react";

export function CategoryDialog({ category, onSubmit }: Props) {
  // ✅ Step 1: 定义表单状态
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    slug: category?.slug || "",
    displayOrder: category?.displayOrder || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Step 2: 自定义验证函数
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "分类名称不能为空";
    }

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "URL标识只能包含小写字母、数字和连字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Step 3: 提交时验证
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(formData);
  };

  // ✅ Step 4: 手动错误显示
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          分类名称 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <Button type="submit">保存</Button>
    </form>
  );
}
```

---

### 模式 3：useState + Toast 提示

**使用场景**
- 极简表单（提交时验证即可）
- 验证失败直接 Toast 提示用户
- 不需要行内错误显示

**示例：订单创建表单**

```typescript
import { useState } from "react";
import { toast } from "sonner";

export function CreateOrderForm({ cartItems, onSuccess }: Props) {
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
  });

  // ✅ 验证函数 + Toast 反馈
  const validateForm = (): boolean => {
    if (!shippingAddress.name.trim()) {
      toast.error("请填写收货人姓名");
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      toast.error("请填写手机号码");
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(shippingAddress.phone)) {
      toast.error("手机号码格式不正确");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createOrder({ items: cartItems, shippingAddress });
      toast.success("订单创建成功！");
      onSuccess?.();
    } catch (error) {
      toast.error("创建订单失败，请稍后重试");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={shippingAddress.name}
        onChange={(e) => setShippingAddress({ 
          ...shippingAddress, 
          name: e.target.value 
        })}
        placeholder="收货人姓名"
        required
      />
      {/* 更多字段... */}
      <Button type="submit">提交订单</Button>
    </form>
  );
}
```

---

## shadcn/ui Form 组件系统

### 组件架构

```typescript
// 核心组件层次结构
<Form {...form}>           {/* FormProvider - 提供表单上下文 */}
  <FormField              {/* Controller 包装器 - 连接字段与验证 */}
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>          {/* 字段容器 - 管理 ID 和间距 */}
        <FormLabel>       {/* 标签 - 自动关联 input ID */}
          字段名称
        </FormLabel>
        <FormControl>     {/* 输入控件包装 - 传递验证状态 */}
          <Input {...field} />
        </FormControl>
        <FormMessage />   {/* 错误信息显示 - 自动从 fieldState 获取 */}
      </FormItem>
    )}
  />
</Form>
```

### 关键组件说明

#### Form (FormProvider)
- 作用：提供表单上下文给所有子组件
- 用法：`<Form {...form}>`（展开 useForm 返回的所有方法）

#### FormField
- 作用：连接 react-hook-form 的 Controller 和字段
- 必需属性：`control`, `name`, `render`

#### FormItem
- 作用：为每个字段生成唯一 ID，管理布局
- 自动生成：`formItemId`, `formDescriptionId`, `formMessageId`

#### FormLabel
- 作用：自动关联到 input 的 `htmlFor` 属性
- 错误状态：自动添加 `text-destructive` 样式

#### FormControl
- 作用：使用 Radix Slot 传递验证状态给子元素
- 自动设置：`aria-invalid`, `aria-describedby`

#### FormMessage
- 作用：自动显示验证错误信息
- 智能隐藏：无错误时不渲染

---

## 实时状态同步模式

### 场景：表单数据需要与父组件双向同步

```typescript
// ✅ 完整的双向同步示例
export function SkuEditForm({ sku, onUpdate, onSave }: Props) {
  const form = useForm<SkuFormValues>({
    resolver: customResolver,
    defaultValues: {
      title: sku.title,
      price: sku.price,
    },
  });

  // ✅ 监听表单变化 → 同步到父组件
  useEffect(() => {
    const subscription = form.watch((values) => {
      onUpdate({
        ...sku,
        title: values.title || "",
        price: values.price || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form, sku, onUpdate]);

  // ✅ 父组件数据变化 → 更新表单
  useEffect(() => {
    form.reset({
      title: sku.title,
      price: sku.price,
    });
  }, [sku, form]);

  return <Form {...form}>...</Form>;
}
```

---

## Dialog 表单重置模式

### 场景：对话框打开/关闭时正确初始化表单

```typescript
export function ProductDialog({ open, mode, productId }: Props) {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
    },
  });

  // ✅ 根据模式和数据重置表单
  useEffect(() => {
    if (open) {
      if (mode === "edit" && product) {
        // 编辑模式：加载现有数据
        form.reset({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
        });
      } else {
        // 创建模式：重置为默认值
        form.reset({
          name: "",
          description: "",
          price: "",
        });
      }
    }
  }, [open, mode, product, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          {/* 表单内容 */}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Zod 验证模式库

### 常用字段验证

```typescript
// ✅ 必填文本字段
const nameSchema = z.string()
  .min(1, "名称不能为空")
  .max(100, "名称不能超过100个字符");

// ✅ 邮箱验证
const emailSchema = z.string()
  .min(1, "邮箱不能为空")
  .email("邮箱格式不正确");

// ✅ 手机号验证
const phoneSchema = z.string()
  .regex(/^1[3-9]\d{9}$/, "手机号码格式不正确");

// ✅ 数值字符串验证（Input type="number" 返回字符串）
const priceSchema = z.string()
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "请输入有效的价格（必须大于0）",
  });

// ✅ 可选字段
const descriptionSchema = z.string().optional();

// ✅ 枚举验证
const roleSchema = z.enum(["buyer", "vendor", "admin"], {
  errorMap: () => ({ message: "请选择有效的角色" }),
});

// ✅ 数组验证
const categoriesSchema = z.array(z.string())
  .min(1, "至少选择一个分类")
  .max(5, "最多选择5个分类");

// ✅ 日期验证
const dateSchema = z.string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "请输入有效的日期",
  });

// ✅ 自定义复杂验证
const passwordSchema = z.string()
  .min(8, "密码至少8位")
  .max(20, "密码不能超过20位")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字");
```

### 完整表单 Schema 示例

```typescript
const productFormSchema = z.object({
  name: z.string().min(1, "商品名称不能为空").max(200, "商品名称不能超过200个字符"),
  description: z.string().optional(),
  price: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "价格必须大于0",
    }),
  stock: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "库存不能为负数",
    }),
  categoryIds: z.array(z.string())
    .min(1, "至少选择一个分类")
    .max(5, "最多选择5个分类"),
  isOnline: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
```

---

## 决策矩阵

| 场景 | 推荐方案 | 核心原因 |
|------|---------|---------|
| **复杂表单**（5+ 字段） | React Hook Form + Zod | 类型安全、自动验证、状态管理 |
| **简单表单**（2-4 字段） | useState + 手动验证 | 代码简单、可读性高 |
| **极简表单**（提交验证） | useState + Toast | 用户体验直观、代码最少 |
| **需要类型推断** | 必须使用 Zod | `z.infer<typeof schema>` |
| **需要实时同步** | React Hook Form | `form.watch()` 监听变化 |
| **需要行内错误提示** | React Hook Form | shadcn/ui FormMessage 自动显示 |
| **Dialog 表单** | 任意 + useEffect 重置 | 根据 open 状态初始化 |

---

## 最佳实践清单

### ✅ DO（应该做的）

1. **使用 shadcn/ui Form 组件系统**统一样式和交互
2. **验证错误消息用中文**，提升用户体验
3. **利用 `z.infer` 自动推断类型**，减少重复定义
4. **Dialog 表单必须在 useEffect 中重置**，避免脏数据
5. **复杂表单用 `form.watch()` 实现实时同步**
6. **Input type="number" 返回字符串，用 `z.string().refine()` 验证**
7. **提交按钮禁用状态绑定 `form.formState.isSubmitting`**
8. **必填字段在 Label 中显示 `*` 标记**

### ❌ DON'T（不应该做的）

1. **不要在简单表单中过度使用 React Hook Form**（2-3 字段用 useState 即可）
2. **不要忘记 unsubscribe `form.watch()` 订阅**（防止内存泄漏）
3. **不要在 Dialog 关闭后保留表单状态**（必须重置）
4. **不要混用多种验证方式**（一个表单统一用一种）
5. **不要忽略 FormMessage 的自动显示功能**（不要手动写错误提示）
6. **不要在非必填字段上标记 `*`**（误导用户）

---

## 常见错误处理

### 错误 1：Dialog 关闭后再打开显示旧数据

```typescript
// ❌ 错误：没有重置表单
export function MyDialog({ open }: Props) {
  const form = useForm({ defaultValues: { name: "" } });
  return <Dialog open={open}>...</Dialog>;
}

// ✅ 正确：根据 open 状态重置
export function MyDialog({ open, data }: Props) {
  const form = useForm({ defaultValues: { name: "" } });
  
  useEffect(() => {
    if (open) {
      form.reset(data ? { name: data.name } : { name: "" });
    }
  }, [open, data, form]);
  
  return <Dialog open={open}>...</Dialog>;
}
```

### 错误 2：form.watch() 导致内存泄漏

```typescript
// ❌ 错误：没有清理订阅
useEffect(() => {
  form.watch((values) => console.log(values));
}, [form]);

// ✅ 正确：返回清理函数
useEffect(() => {
  const subscription = form.watch((values) => console.log(values));
  return () => subscription.unsubscribe();
}, [form]);
```

### 错误 3：Input type="number" 验证失败

```typescript
// ❌ 错误：期望数值类型
const schema = z.object({
  price: z.number().min(0), // 但 Input 返回字符串！
});

// ✅ 正确：验证字符串并转换
const schema = z.object({
  price: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "价格必须大于0",
    }),
});

// 提交时转换
const handleSubmit = form.handleSubmit((values) => {
  const data = {
    ...values,
    price: parseFloat(values.price),
  };
  // 提交 data
});
```

---

## 完整示例：商品编辑表单

```typescript
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

// ✅ Step 1: 定义 Schema
const productSchema = z.object({
  name: z.string()
    .min(1, "商品名称不能为空")
    .max(200, "商品名称不能超过200个字符"),
  description: z.string().optional(),
  price: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "价格必须大于0",
    }),
  stock: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "库存不能为负数",
    }),
  isOnline: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  mode: "create" | "edit";
  product?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
}

export function ProductDialog({ open, mode, product, onSubmit }: ProductDialogProps) {
  // ✅ Step 2: 初始化表单
  const form = useForm<ProductFormValues>({
    resolver: async (values) => {
      try {
        const validated = await productSchema.parseAsync(values);
        return { values: validated, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, { type: string; message: string }> = {};
          error.issues.forEach((err) => {
            errors[err.path.join(".")] = {
              type: "validation",
              message: err.message,
            };
          });
          return { values: {}, errors };
        }
        return {
          values: {},
          errors: { root: { type: "validation", message: "验证失败" } },
        };
      }
    },
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      isOnline: false,
    },
  });

  // ✅ Step 3: Dialog 打开时重置表单
  useEffect(() => {
    if (open) {
      if (mode === "edit" && product) {
        form.reset({
          name: product.name,
          description: product.description || "",
          price: product.price.toString(),
          stock: product.stock.toString(),
          isOnline: product.isOnline,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: "",
          stock: "",
          isOnline: false,
        });
      }
    }
  }, [open, mode, product, form]);

  // ✅ Step 4: 提交处理
  const handleSubmit = form.handleSubmit(async (values) => {
    const data = {
      ...values,
      price: parseFloat(values.price),
      stock: parseInt(values.stock),
    };
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品名称 *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="输入商品名称" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品描述</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="输入商品描述（可选）" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>价格 (¥) *</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>库存 *</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isOnline"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">立即上架</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## 总结

表单开发核心原则：**根据复杂度选择合适的方案**

- **复杂表单**：React Hook Form + Zod + shadcn/ui Form
- **简单表单**：useState + 手动验证
- **极简表单**：useState + Toast

记住：**简单比完美更重要**。不要在两个字段的表单中引入 React Hook Form，也不要在复杂表单中手写状态管理。让工具为场景服务，而非被工具绑架。
