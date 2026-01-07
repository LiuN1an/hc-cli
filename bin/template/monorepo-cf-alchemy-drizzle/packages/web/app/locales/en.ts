export default {
  common: {
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    yes: 'Yes',
    no: 'No',
    error: 'Error',
    success: 'Success'
  },
  nav: {
    home: 'Home',
    table: 'Table Demo',
    form: 'Form Demo',
    signin: 'Sign In',
    signup: 'Sign Up',
    signout: 'Sign Out',
    admin: 'Admin'
  },
  home: {
    title: 'Welcome',
    description: 'A fullstack monorepo template with React Router, Alchemy, and Cloudflare Workers',
    features: {
      auth: 'Authentication',
      authDesc: 'Session-based authentication with KV storage',
      form: 'Form Validation',
      formDesc: 'React Hook Form with Zod schemas',
      table: 'Table Pagination',
      tableDesc: 'Virtual scrolling with TanStack Table',
      i18n: 'Internationalization',
      i18nDesc: 'Multi-language support with i18next'
    }
  },
  auth: {
    signin: 'Sign In',
    signup: 'Sign Up',
    signout: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    invalidCredentials: 'Invalid email or password',
    emailExists: 'Email already registered',
    signInSuccess: 'Signed in successfully',
    signUpSuccess: 'Account created successfully',
    signOutSuccess: 'Signed out successfully'
  },
  form: {
    title: 'Form Demo',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    age: 'Age',
    bio: 'Bio',
    submit: 'Submit',
    reset: 'Reset',
    submitting: 'Submitting...',
    submitSuccess: 'Form submitted successfully',
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email',
      minLength: 'Must be at least {{count}} characters',
      maxLength: 'Must be at most {{count}} characters',
      min: 'Must be at least {{count}}',
      max: 'Must be at most {{count}}'
    }
  },
  table: {
    title: 'Table Demo',
    search: 'Search...',
    noResults: 'No results found',
    columns: {
      id: 'ID',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      createdAt: 'Created At',
      actions: 'Actions'
    }
  },
  pagination: {
    showing: 'Showing {{start}}-{{end}} of {{total}}',
    perPage: 'Per page',
    page: 'Page',
    of: 'of',
    first: 'First',
    last: 'Last',
    previous: 'Previous',
    next: 'Next'
  },
  review: {
    title: 'Review',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    notes: 'Notes'
  },
  admin: {
    dashboard: 'Dashboard',
    users: 'Users',
    reviews: 'Reviews',
    configs: 'Configurations'
  }
};
