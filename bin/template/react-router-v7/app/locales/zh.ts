export default {
  // Common
  common: {
    loading: "加载中...",
    submit: "提交",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    search: "搜索",
    reset: "重置",
    confirm: "确认",
    back: "返回",
    next: "下一步",
    previous: "上一步",
  },

  // Navigation
  nav: {
    home: "首页",
    table: "表格演示",
    form: "表单演示",
    protected: "受保护页面",
  },

  // Home Page
  home: {
    title: "React Router 全栈模板",
    description:
      "使用 React Router v7、Tailwind CSS v4 等技术构建的现代全栈模板。",
    features: {
      title: "功能特性",
      reactRouter: "React Router v7 支持 SSR",
      tailwind: "Tailwind CSS v4",
      shadcn: "shadcn/ui 组件库",
      tanstackTable: "TanStack Table 无限滚动",
      reactHookForm: "React Hook Form + Zod 验证",
      nuqs: "nuqs URL 状态管理",
      i18n: "remix-i18next SSR 国际化",
      auth: "中间件认证",
    },
  },

  // Table Page
  table: {
    title: "无限滚动表格演示",
    description: "此演示展示了使用 TanStack Table 虚拟滚动处理大数据集。",
    columns: {
      id: "ID",
      name: "姓名",
      email: "邮箱",
      status: "状态",
      createdAt: "创建时间",
    },
    status: {
      active: "活跃",
      inactive: "未激活",
      pending: "待处理",
    },
    searchPlaceholder: "按名称搜索...",
    loadMore: "加载更多...",
    noResults: "未找到结果。",
  },

  // Form Page
  form: {
    title: "表单演示",
    description: "此演示展示了 TanStack Form 配合 Zod 验证，包括异步验证。",
    fields: {
      firstName: "名",
      lastName: "姓",
      email: "邮箱",
      age: "年龄",
      bio: "简介",
    },
    placeholders: {
      firstName: "请输入您的名",
      lastName: "请输入您的姓",
      email: "请输入您的邮箱",
      age: "请输入您的年龄",
      bio: "介绍一下您自己...",
    },
    validation: {
      firstNameRequired: "名为必填项",
      firstNameMin: "名至少需要2个字符",
      lastNameRequired: "姓为必填项",
      lastNameMin: "姓至少需要2个字符",
      emailRequired: "邮箱为必填项",
      emailInvalid: "请输入有效的邮箱地址",
      emailTaken: "此邮箱已被使用",
      ageRequired: "年龄为必填项",
      ageMin: "您必须年满18岁",
      ageMax: "年龄必须小于120岁",
    },
    submitSuccess: "表单提交成功！",
    submitError: "表单提交失败，请重试。",
  },

  // Protected Page
  protected: {
    title: "受保护页面",
    description: "此页面需要认证。请添加 x-auth-token 请求头以访问。",
    unauthorized: "未授权",
    unauthorizedDescription: "您需要提供有效的认证令牌才能访问此页面。",
  },

  // Language Switcher
  language: {
    label: "语言",
    en: "English",
    zh: "中文",
  },
};

