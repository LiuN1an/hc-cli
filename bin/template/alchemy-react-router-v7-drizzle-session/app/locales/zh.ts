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
    table: "表格示例",
    form: "表单示例",
    protected: "受保护页面",
    admin: "管理后台",
    signin: "登录",
    signup: "注册",
  },

  // Home Page
  home: {
    title: "Alchemy 全栈模板",
    description:
      "基于 React Router v7、Alchemy Runtime、Drizzle ORM 与 Session 认证的生产级起步模板。",
    welcome: "欢迎回来，{{name}}!",
    adminCta: "进入管理后台",
    usersApiCta: "查看用户 API",
    signinCta: "登录",
    signupCta: "注册",
    featureNote: "业务常用库与最佳实践已内置。",
    features: {
      title: "功能特性",
      reactRouter: "React Router v7 + SSR",
      drizzle: "Drizzle ORM + SQLite",
      sessionAuth: "Session + Token 双重认证",
      tanstackTable: "TanStack Table 无限滚动",
      reactHookForm: "React Hook Form + Zod 校验",
      nuqs: "nuqs URL 状态管理",
      i18n: "react-i18next 国际化",
      reactQuery: "React Query 数据层",
    },
  },

  // Table Page
  table: {
    title: "无限滚动表格示例",
    description:
      "此示例展示 TanStack Table + 虚拟滚动的高性能大数据列表。",
    columns: {
      id: "编号",
      name: "姓名",
      email: "邮箱",
      status: "状态",
      createdAt: "创建时间",
    },
    status: {
      active: "活跃",
      inactive: "停用",
      pending: "待处理",
    },
    searchPlaceholder: "按名称搜索...",
    loadMore: "加载更多...",
    noResults: "暂无数据。",
  },

  // Form Page
  form: {
    title: "表单示例",
    description:
      "此示例展示 React Hook Form + Zod 校验，以及异步校验。",
    fields: {
      firstName: "名",
      lastName: "姓",
      email: "邮箱",
      age: "年龄",
      bio: "简介",
    },
    placeholders: {
      firstName: "请输入名字",
      lastName: "请输入姓氏",
      email: "请输入邮箱",
      age: "请输入年龄",
      bio: "简单介绍一下...",
    },
    validation: {
      firstNameRequired: "名字不能为空",
      firstNameMin: "名字至少 2 个字符",
      lastNameRequired: "姓氏不能为空",
      lastNameMin: "姓氏至少 2 个字符",
      emailRequired: "邮箱不能为空",
      emailInvalid: "请输入有效的邮箱",
      emailTaken: "该邮箱已被占用",
      ageRequired: "年龄不能为空",
      ageMin: "年龄需大于 18 岁",
      ageMax: "年龄需小于 120 岁",
    },
    submitSuccess: "提交成功！",
    submitError: "提交失败，请重试。",
  },

  // Protected Page
  protected: {
    title: "受保护页面",
    description: "该页面需要有效 Session，未登录将跳转至登录页。",
    success: "已通过 Session 认证并成功访问该页面。",
    unauthorized: "未授权",
    unauthorizedDescription: "请先登录后再访问该页面。",
  },

  // Language Switcher
  language: {
    label: "语言",
    en: "English",
    zh: "中文",
  },
};
