# Vue Bare Composables

**Vue composables for a frustration-free development experience**

[![github license](https://img.shields.io/github/license/ericvera/vue-bare-composables.svg?style=flat-square)](https://github.com/ericvera/vue-bare-composables/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/vue-bare-composables.svg?style=flat-square)](https://npmjs.org/package/vue-bare-composables)

## Features

- 🎯 **Type-safe**: Built with TypeScript using the strictest configuration
- 🪶 **Lightweight**: Zero dependencies besides Vue
- 🧩 **Modular**: Use only what you need
- 📦 **Tree-shakeable**: Unused code is removed in production builds
- 🔍 **Form validation**: Built-in support for field and form-level validation

## Installation

```bash
# npm
npm install vue-bare-composables

# yarn
yarn add vue-bare-composables

# pnpm
pnpm add vue-bare-composables
```

## Requirements

- Vue 3.x or higher
- Node.js 22 or higher

## Usage

Available composables:

- [useForm (Form Handling)](#useform-form-handling)
- [useFixToVisualViewport (Visual Viewport Fixed Positioning)](#usefixtovisualviewport-visual-viewport-fixed-positioning)
- [useIsWindowFocused (Window Focus Detection)](#useiswindowfocused-window-focus-detection)
- [useSnackbarStore (Toast/Snackbar Notifications)](#usesnackbarstore-toastsnackbar-notifications)

### useForm (Form Handling)

```ts
import { useForm } from 'vue-bare-composables'

// In your Vue component
const { state, getProps, getListeners, handleSubmit } = useForm(
  {
    email: '',
    password: '',
  },
  {
    validate: {
      email: (value) => {
        if (!value) {
          return 'Email is required'
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) {
          return 'Invalid email format'
        }
      },
      password: (value) => {
        if (!value) {
          return 'Password is required'
        }

        if ((value as string).length < 8) {
          return 'Password must be at least 8 characters'
        }
      },
    },
    globalValidate: async (values, { setError, setGlobalError }) => {
      // Example of form-level validation
      if (values.password === '12345678') {
        setError('password', 'Password is too common')
      }
    },
    // Automatically trim string values before validation and submission
    trimStrings: true,
  },
)

// Use in template
const onSubmit = handleSubmit(async (data) => {
  // Handle form submission
  console.log(data)
})
```

In your template:

```vue
<template>
  <form @submit.prevent="onSubmit">
    <input
      id="email"
      type="email"
      v-bind="getProps('email')"
      v-on="getListeners('email')"
    />
    <span v-if="state.errors.email.value">
      {{ state.errors.email.value }}
    </span>

    <input
      id="password"
      type="password"
      v-bind="getProps('password')"
      v-on="getListeners('password')"
    />
    <span v-if="state.errors.password.value">
      {{ state.errors.password.value }}
    </span>

    <button type="submit" :disabled="state.submitting.value">Submit</button>
  </form>
</template>
```

The `useForm` composable provides the following features:

- **Type-safe form handling**: Full TypeScript support with strict type checking
- **Field-level validation**: Validate individual fields with custom validation functions
- **Form-level validation**: Validate multiple fields together or perform cross-field validation
- **Automatic error handling**: Display validation errors and manage error states
- **Form submission handling**: Handle form submissions with loading states
- **String trimming**: Optionally trim string values before validation and submission
- **Form reset**: Reset form to initial values
- **Reactive state**: All form state is reactive and can be watched for changes

### Options

The `useForm` composable accepts the following options:

- `validate`: Object containing field-level validation functions
- `globalValidate`: Function for form-level validation
- `trimStrings`: Boolean to enable automatic trimming of string values before validation and submission (defaults to false)

### Example with String Trimming

```ts
const { state, handleSubmit } = useForm(
  {
    name: '',
    email: '',
  },
  {
    trimStrings: true, // Enable automatic string trimming
    validate: {
      name: (value) => {
        // Value will be automatically trimmed before validation
        if (!value) {
          return 'Name is required'
        }

        if (value.length < 3) {
          return 'Name must be at least 3 characters'
        }
      },
    },
  },
)

// When submitting, string values will be automatically trimmed
const onSubmit = handleSubmit(async (data) => {
  // data.name and data.email will be trimmed
  console.log(data)
})
```

### useFixToVisualViewport (Visual Viewport Fixed Positioning)

```ts
import { useFixToVisualViewport } from 'vue-bare-composables'

// In your Vue component
const element = ref<HTMLElement | null>(null)
const onError = (error: unknown) => console.error(error)

// For bottom positioning
useFixToVisualViewport(element, onError, {
  layoutViewportId: 'viewport',
  location: 'bottom',
})

// For top positioning
useFixToVisualViewport(element, onError, {
  layoutViewportId: 'viewport',
  location: 'top',
})

// For positioning above another element
useFixToVisualViewport(element, onError, {
  layoutViewportId: 'viewport',
  location: 'above',
  relativeElement: anotherElement,
  distance: 10,
})
```

In your template:

```vue
<template>
  <!-- Your content -->
  <div ref="element">
    This element will maintain its position relative to the visual viewport
  </div>

  <!-- This should be in the main page body -->
  <div id="viewport" />
</template>
```

### useIsWindowFocused (Window Focus Detection)

```ts
import { useIsWindowFocused } from 'vue-bare-composables'

// In your Vue component
const isFocused = useIsWindowFocused()
```

In your template:

```vue
<template>
  <div>
    Window is currently {{ isFocused.value ? 'focused' : 'not focused' }}
  </div>
</template>
```

### useSnackbarStore (Toast/Snackbar Notifications)

A Pinia store for managing toast/snackbar notifications with support for:

- Message queueing
- Route-specific messages
- Custom actions
- Auto-dismissal
- Manual dismissal

```ts
import { useSnackbarStore } from 'vue-bare-composables'

// In your Vue component
const snackbar = useSnackbarStore()

// If used within Nuxt, you need to pass the Pinia store instance
// const pinia = usePinia()
// const snackbarStore = useSnackbarStore(pinia as Pinia)

// Simple message
snackbar.enqueueMessage({ message: 'Operation successful!' })

// Message with custom actions
snackbar.enqueueMessage({
  message: 'Item deleted',
  actions: [
    {
      text: 'Undo',
      callback: () => {
        // Handle undo action
      },
    },
  ],
})

// Route-specific message (only shows on specified route)
snackbar.enqueueMessage({
  message: 'Welcome to the dashboard',
  route: '/dashboard',
})

// Set the current route whenever the route changes
snackbar.setRouteFullPath('/dashboard')
```

In your template:

```vue
<template>
  <div v-if="snackbar.message" class="snackbar">
    {{ snackbar.message }}

    <div v-if="snackbar.actions" class="actions">
      <button
        v-for="action in snackbar.actions"
        :key="action.text"
        @click="action.callback"
      >
        {{ action.text }}
      </button>
    </div>
  </div>
</template>
```

Key features:

- Messages are queued and shown in order
- Messages auto-dismiss after 6 seconds
- Messages can be manually dismissed
- Route-specific messages only show on matching routes
- Custom actions with callbacks
- Messages older than 30 seconds are automatically cleaned up
- Reactive state management with Pinia

## License

[MIT](./LICENSE)
