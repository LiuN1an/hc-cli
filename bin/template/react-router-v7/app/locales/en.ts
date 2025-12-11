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
    protected: "Protected Page",
  },

  // Home Page
  home: {
    title: "React Router Fullstack Template",
    description:
      "A modern fullstack template built with React Router v7, Tailwind CSS v4, and more.",
    features: {
      title: "Features",
      reactRouter: "React Router v7 with SSR",
      tailwind: "Tailwind CSS v4",
      shadcn: "shadcn/ui Components",
      tanstackTable: "TanStack Table with Infinite Scroll",
      reactHookForm: "React Hook Form with Zod Validation",
      nuqs: "URL State Management with nuqs",
      i18n: "SSR i18n with remix-i18next",
      auth: "Middleware Authentication",
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
      "This demo shows TanStack Form with Zod validation, including async validation.",
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
      "This page requires authentication. Add x-auth-token header to access.",
    unauthorized: "Unauthorized",
    unauthorizedDescription:
      "You need to provide a valid auth token to access this page.",
  },

  // Language Switcher
  language: {
    label: "Language",
    en: "English",
    zh: "中文",
  },
};

