export default {
  // Common
  common: {
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    reset: "Reset",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
  },

  // Navigation
  nav: {
    home: "Home",
    table: "Table Demo",
    form: "Form Demo",
    protected: "Protected",
    admin: "Admin",
    signin: "Sign In",
    signup: "Sign Up",
  },

  // Home Page
  home: {
    title: "Alchemy Fullstack Template",
    description:
      "A production-ready starter built with React Router v7, Alchemy runtime, Drizzle ORM, and session auth.",
    welcome: "Welcome back, {{name}}!",
    adminCta: "Open Admin",
    usersApiCta: "View Users API",
    signinCta: "Sign In",
    signupCta: "Sign Up",
    featureNote: "Business-ready libraries and patterns out of the box.",
    features: {
      title: "Features",
      reactRouter: "React Router v7 with SSR",
      drizzle: "Drizzle ORM with SQLite",
      sessionAuth: "Session + Token Auth",
      tanstackTable: "TanStack Table with Infinite Scroll",
      reactHookForm: "React Hook Form with Zod Validation",
      nuqs: "URL State Management with nuqs",
      i18n: "i18n with react-i18next",
      reactQuery: "React Query Data Layer",
    },
  },

  // Table Page
  table: {
    title: "Infinite Scroll Table Demo",
    description:
      "This demo shows TanStack Table with virtual scrolling for handling large datasets.",
    columns: {
      id: "ID",
      name: "Name",
      email: "Email",
      status: "Status",
      createdAt: "Created At",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
    },
    searchPlaceholder: "Search by name...",
    loadMore: "Loading more...",
    noResults: "No results found.",
  },

  // Form Page
  form: {
    title: "Form Demo",
    description:
      "This demo shows React Hook Form + Zod validation, including async validation.",
    fields: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      age: "Age",
      bio: "Bio",
    },
    placeholders: {
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      email: "Enter your email",
      age: "Enter your age",
      bio: "Tell us about yourself...",
    },
    validation: {
      firstNameRequired: "First name is required",
      firstNameMin: "First name must be at least 2 characters",
      lastNameRequired: "Last name is required",
      lastNameMin: "Last name must be at least 2 characters",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email",
      emailTaken: "This email is already taken",
      ageRequired: "Age is required",
      ageMin: "You must be at least 18 years old",
      ageMax: "Age must be less than 120",
    },
    submitSuccess: "Form submitted successfully!",
    submitError: "Failed to submit form. Please try again.",
  },

  // Protected Page
  protected: {
    title: "Protected Page",
    description:
      "This page requires a valid session. You'll be redirected to sign in if needed.",
    success: "Session verified. You now have access to this page.",
    unauthorized: "Unauthorized",
    unauthorizedDescription:
      "You need to sign in to access this page.",
  },

  // Language Switcher
  language: {
    label: "Language",
    en: "English",
    zh: "中文",
  },
};
