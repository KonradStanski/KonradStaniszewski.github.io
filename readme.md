# Konrad's Website

- **View**: [demo site](https://nextjs-mdx-blog-theme.vercel.app/)
- **Framework**: [Next.js](https://nextjs.org/)
- **Deployment**: [Vercel](https://vercel.com)
- **Content**: [MDX](https://github.com/mdx-js/mdx)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Styling

To organize Tailwind CSS light and dark styles on elements, we make use of `cx` utility as an array. The first string contains the base styles, the second string is for light mode styles, and lastly the third string is for dark mode styling.

```jsx
import { cx } from '@/lib/utils'

<div
  className={cx(
    'p-4', // base styles
    'text-gray-900', // light mode styles
    'dark:text-gray-50'. // dark mode styles
  )}
/>
```
