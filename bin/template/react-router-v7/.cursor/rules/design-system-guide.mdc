# UI Design System Guide

Complete design system based on project brand visuals, ensuring interface consistency and tech-forward aesthetics.

## Core Design Principles

### Visual Hierarchy
- **Dark-first approach**: Use `neutral-950` as primary background for tech-forward feel
- **High contrast**: Ensure sufficient contrast between text and backgrounds for readability
- **Brand gradient**: Key elements use teal→amber→purple brand gradient
- **Clean & modern**: Avoid over-decoration, maintain clean interfaces

### Spacing System
- **Consistency**: Use Tailwind's spacing system (4px baseline)
- **Breathing room**: Important content areas maintain sufficient padding (p-6 or more)
- **Clear grouping**: Related elements use space-y-4, different groups use space-y-8

## Color Usage Guidelines

### Primary Color Scale Usage
```css
/* Primary (Teal) - Main actions and brand elements */
primary-500: #1DD3D0    /* Primary buttons, links, brand color */
primary-600: #0891B2    /* Button hover states */
primary-400: #2DD4BF    /* Lighter accent color */

/* Secondary (Amber) - Secondary emphasis and warnings */
secondary-500: #F59E0B  /* Secondary buttons, warning info */
secondary-600: #D97706  /* Secondary button hover states */

/* Accent (Purple) - Special emphasis and decorative */
accent-500: #A855F7     /* Special buttons, tags, badges */
accent-600: #9333EA     /* Special button hover states */
```

### Neutral Color Scale Usage
```css
/* Background Layers */
neutral-950: #0A0A0A    /* Page background */
neutral-900: #171717    /* Card background, modal background */
neutral-800: #262626    /* Input background, secondary surfaces */

/* Borders and Dividers */
neutral-700: #404040    /* Primary borders */
neutral-600: #525252    /* Secondary borders */

/* Text Hierarchy */
neutral-50: #FAFAFA     /* Primary text */
neutral-200: #E5E5E5    /* Secondary text */
neutral-400: #A3A3A3    /* Placeholder, disabled text */
```

## Component Design Standards

### Button Design
```html
<!-- Primary action -->
<button class="btn-primary">
  Submit
</button>

<!-- Secondary action -->
<button class="btn-secondary">
  Save Draft
</button>

<!-- Special action -->
<button class="btn-accent">
  Buy Now
</button>

<!-- Outline button -->
<button class="btn-outline">
  Learn More
</button>

<!-- Text button -->
<button class="text-primary-500 hover:text-primary-400 font-medium">
  Cancel
</button>
```

### Form Design
```html
<div class="form-group">
  <label class="form-label">
    Email Address
  </label>
  <input 
    type="email" 
    class="form-input" 
    placeholder="Enter your email address"
  />
  <p class="text-sm text-neutral-400">
    We will not share your email address
  </p>
</div>
```

### Card Design
```html
<!-- Basic card -->
<div class="card">
  <h3 class="text-lg font-semibold text-neutral-50 mb-4">
    Card Title
  </h3>
  <p class="text-neutral-200">
    Card content description
  </p>
</div>

<!-- Special card with gradient title -->
<div class="card">
  <h2 class="text-brand-gradient text-2xl font-bold mb-4">
    Featured Content
  </h2>
  <p class="text-neutral-200">
    Important content using brand gradient highlight
  </p>
</div>
```

### Navigation Design
```html
<!-- Top navigation -->
<nav class="bg-neutral-900 border-b border-neutral-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <span class="text-brand-gradient text-xl font-bold">
          Brand
        </span>
      </div>
      
      <!-- Navigation links -->
      <div class="flex items-center space-x-8">
        <a href="#" class="text-neutral-200 hover:text-primary-400">
          Products
        </a>
        <a href="#" class="text-neutral-200 hover:text-primary-400">
          Solutions
        </a>
        <button class="btn-primary">
          Get Started
        </button>
      </div>
    </div>
  </div>
</nav>
```

## Layout Patterns

### Page Structure
```html
<!-- Standard page layout -->
<div class="min-h-screen bg-neutral-950">
  <!-- Navigation -->
  <header class="bg-neutral-900 border-b border-neutral-800">
    <!-- Navigation content -->
  </header>
  
  <!-- Main content area -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page content -->
  </main>
  
  <!-- Footer -->
  <footer class="bg-neutral-900 border-t border-neutral-800">
    <!-- Footer content -->
  </footer>
</div>
```

### Content Grid
```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<!-- Two-column layout -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2">
    <!-- Main content -->
  </div>
  <div class="lg:col-span-1">
    <!-- Sidebar -->
  </div>
</div>
```

## Interaction Effects

### Hover Effects
```css
/* Button hover */
.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}

/* Card hover */
.card-hover {
  @apply transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/10;
}

/* Link hover */
.link-hover {
  @apply transition-colors duration-200 hover:text-primary-400;
}
```

### State Indicators
```html
<!-- Loading state -->
<button class="btn-primary" disabled>
  <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
    <!-- Loading icon -->
  </svg>
  Processing...
</button>

<!-- Success state -->
<div class="flex items-center text-success-500">
  <svg class="h-5 w-5 mr-2" fill="currentColor">
    <!-- Success icon -->
  </svg>
  Operation successful
</div>

<!-- Error state -->
<div class="flex items-center text-error-500">
  <svg class="h-5 w-5 mr-2" fill="currentColor">
    <!-- Error icon -->
  </svg>
  Operation failed
</div>
```

## Responsive Design

### Breakpoint Strategy
- **Mobile First**: Design for mobile first, then adapt for desktop
- **Key breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Content priority**: Ensure core content is clear on all devices

### Mobile Optimization
```html
<!-- Mobile navigation -->
<div class="md:hidden">
  <button class="text-neutral-200 hover:text-primary-400">
    <svg class="h-6 w-6" fill="none" stroke="currentColor">
      <!-- Hamburger menu icon -->
    </svg>
  </button>
</div>

<!-- Responsive spacing -->
<div class="px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>

<!-- Responsive text size -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Title
</h1>
```

## Accessibility Requirements

### Color Contrast
- **Text contrast**: Ensure at least 4.5:1 contrast ratio
- **Non-text elements**: Ensure at least 3:1 contrast ratio
- **Focus indicators**: Clear focus ring using `focus:ring-primary-500`

### Keyboard Navigation
```html
<!-- Accessible button -->
<button 
  class="btn-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
  aria-label="Submit form"
>
  Submit
</button>

<!-- Accessible form -->
<div class="form-group">
  <label for="email" class="form-label">
    Email Address
  </label>
  <input 
    id="email"
    type="email" 
    class="form-input"
    placeholder="Enter your email address"
    aria-describedby="email-help"
  />
  <p id="email-help" class="text-sm text-neutral-400">
    We will not share your email address
  </p>
</div>
```

## Performance Optimization

### CSS Optimization
- **Avoid deep nesting**: Keep CSS selectors simple
- **Use Tailwind native classes**: Prefer Tailwind classes over custom CSS
- **Load only needed**: Only load CSS that is actually used

### Image Optimization
- **Responsive images**: Use `srcset` and `sizes` attributes
- **Lazy loading**: Use `loading="lazy"` for non-critical images
- **Optimized formats**: Prefer WebP or AVIF formats

## Component Library Checklist

### Basic Components
- [ ] Button (btn-primary, btn-secondary, btn-accent, btn-outline)
- [ ] Input (form-input, form-label, form-group)
- [ ] Card (card, card-hover)
- [ ] Badge (using accent colors)
- [ ] Modal (using neutral-900 background)

### Complex Components
- [ ] Navigation (top nav, sidebar nav)
- [ ] Form (login, register, contact forms)
- [ ] Table (data tables)
- [ ] Pagination (pagination component)
- [ ] Toast (notification component)

### Layout Components
- [ ] Container (max-w-7xl mx-auto)
- [ ] Grid (responsive grid)
- [ ] Sidebar (sidebar layout)
- [ ] Hero (homepage banner)

## Development Best Practices

### Class Organization
```html
<!-- Recommended class order -->
<div class="
  flex items-center justify-between
  w-full max-w-md mx-auto
  px-4 py-3
  bg-neutral-900 border border-neutral-700 rounded-lg
  text-neutral-100
  hover:bg-neutral-800 focus:ring-2 focus:ring-primary-500
  transition-colors duration-200
">
  Content
</div>
```

### Component Naming
- **Semantic naming**: Use class names that describe functionality
- **Stay consistent**: Unified naming conventions
- **Avoid style coupling**: Component names should not include specific styling info

### Documentation Requirements
- **Component docs**: Every component should have usage examples
- **Design tokens**: Document colors, spacing, fonts and other design tokens
- **Change log**: Record design system version changes