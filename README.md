# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Simple Frontend Login

The admin tool now includes a simple frontend login gate.

- Session is stored in `sessionStorage` (browser tab session only).
- Default credentials are `admin/admin`.
- You can override them using Vite environment variables:

```bash
VITE_ADMIN_TOOL_USER=your_user
VITE_ADMIN_TOOL_PASSWORD=your_password
```

Create a `.env` file at project root (`ld_admintool_frontend/.env`) with these values for local development.

Important: this is a convenience login at UI level. For real protection in production, add server-side auth (for example reverse-proxy basic auth or backend authentication).
