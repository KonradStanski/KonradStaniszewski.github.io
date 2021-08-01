# NextJS - Typescript - MDX - Tailwind CSS

My personal blog.
Built with:

-   [Typescript](https://www.typescriptlang.org/)
-   Write posts with [MDX](https://mdxjs.com/)
-   Style with [Tailwind CSS](https://tailwindcss.com/)
-   Linting with [ESLint](https://eslint.org/)
-   Formatting with [Prettier](https://prettier.io/)
-   Linting, typechecking and formatting on by default using [`husky`](https://github.com/typicode/husky) for commit hooks

This is **heavily** inspired by [Lee Robinson](https://github.com/leerob/leerob.io) and [Anson Lichtfuss](https://github.com/ansonlichtfuss/website).

## Notes:

-   When using useTheme() to get the theme for a component, if the rendering depends on the theme, watch out for [THIS!](https://github.com/pacocoursey/next-themes#usetheme)

```
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) {
        return null;
    }
```

-   I moved to keeping page specific components in the pages folder, look [here](https://github.com/vercel/next.js/issues/8454#issuecomment-560432659) to find out what settings im using. This means that all valid paths in the /pages folder need to have the .page.tsx or .api.ts extensions. Everything else is not a valid path.

## TODO:

-   [] Add utterances comments
-   [] improve hamburger menu pop out
-   [] improve semester component in gpaCalculator
-   [x] make projects page cards show more information about project and have links to code, demo, writeup ect with image and
        longer blurb about what the project is.
