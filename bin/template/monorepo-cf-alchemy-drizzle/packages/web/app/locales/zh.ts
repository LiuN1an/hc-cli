export default {
  common: {
    loading: '加载中...',
    submit: '提交',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    search: '搜索',
    filter: '筛选',
    reset: '重置',
    confirm: '确认',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    yes: '是',
    no: '否',
    error: '错误',
    success: '成功'
  },
  nav: {
    home: '首页',
    table: '表格示例',
    form: '表单示例',
    signin: '登录',
    signup: '注册',
    signout: '退出登录',
    admin: '管理后台'
  },
  home: {
    title: '欢迎',
    description: '基于 React Router、Alchemy 和 Cloudflare Workers 的全栈 Monorepo 模板',
    features: {
      auth: '用户认证',
      authDesc: '基于 KV 存储的会话认证',
      form: '表单验证',
      formDesc: 'React Hook Form 配合 Zod 验证',
      table: '表格分页',
      tableDesc: 'TanStack Table 虚拟滚动',
      i18n: '国际化',
      i18nDesc: '基于 i18next 的多语言支持'
    }
  },
  auth: {
    signin: '登录',
    signup: '注册',
    signout: '退出登录',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    name: '姓名',
    forgotPassword: '忘记密码？',
    noAccount: '还没有账号？',
    hasAccount: '已有账号？',
    invalidCredentials: '邮箱或密码错误',
    emailExists: '邮箱已被注册',
    signInSuccess: '登录成功',
    signUpSuccess: '注册成功',
    signOutSuccess: '退出成功'
  },
  form: {
    title: '表单示例',
    firstName: '名',
    lastName: '姓',
    email: '邮箱',
    age: '年龄',
    bio: '简介',
    submit: '提交',
    reset: '重置',
    submitting: '提交中...',
    submitSuccess: '表单提交成功',
    validation: {
      required: '此字段为必填项',
      email: '请输入有效的邮箱地址',
      minLength: '至少需要 {{count}} 个字符',
      maxLength: '最多 {{count}} 个字符',
      min: '最小值为 {{count}}',
      max: '最大值为 {{count}}'
    }
  },
  table: {
    title: '表格示例',
    search: '搜索...',
    noResults: '暂无数据',
    columns: {
      id: 'ID',
      name: '姓名',
      email: '邮箱',
      role: '角色',
      status: '状态',
      createdAt: '创建时间',
      actions: '操作'
    }
  },
  pagination: {
    showing: '显示 {{start}}-{{end}} 条，共 {{total}} 条',
    perPage: '每页',
    page: '第',
    of: '共',
    first: '首页',
    last: '末页',
    previous: '上一页',
    next: '下一页'
  },
  review: {
    title: '审核',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    approve: '通过',
    reject: '拒绝',
    notes: '备注'
  },
  admin: {
    dashboard: '仪表盘',
    users: '用户管理',
    reviews: '审核管理',
    configs: '系统配置'
  }
};
