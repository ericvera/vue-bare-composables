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

- Vue 3.5 or higher
- Node.js 20 or higher

## Usage

### Form Handling

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

### Visual Viewport Fixed Positioning

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

## License

[MIT](./LICENSE)
