# Contributing to FlowCraft

First off, thank you for considering contributing to FlowCraft! It's people like you that make FlowCraft a great tool for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (Mermaid code, screenshots, etc.)
- **Describe the behavior you observed and what you expected**
- **Include your browser and OS information**

### Suggesting Features

Feature suggestions are welcome! Please:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed feature**
- **Explain why this feature would be useful**
- **Include mockups or examples if possible**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Test your changes**: `npm run build`
5. **Lint your code**: `npm run lint`
6. **Commit with a clear message**
7. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/flowcraft.git
cd flowcraft

# Install dependencies
npm install

# Start dev server
npm run dev

# Run build to check for errors
npm run build

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/              # Next.js pages and layouts
├── components/       # React components
│   ├── nodes/       # Custom flow node types
│   ├── edges/       # Custom edge types
│   └── ...          # Other components
├── store/           # Zustand state stores
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
└── data/            # Static data (templates, tools)
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces (avoid `any`)
- Export types that might be reused

### React

- Use functional components with hooks
- Keep components focused and small
- Use `'use client'` directive for client components

### Styling

- Use Tailwind CSS for styling
- Follow existing patterns for dark/light mode
- Use the theme store for theme-aware styling

### Naming Conventions

- **Components**: PascalCase (`FlowCanvas.tsx`)
- **Utilities**: camelCase (`parseMermaid.ts`)
- **Types**: PascalCase (`ProcessNode`)
- **Stores**: camelCase with `use` prefix (`useFlowStore`)

## Commit Messages

Use clear, descriptive commit messages:

```
Add: new feature description
Fix: bug description
Update: what was updated
Remove: what was removed
Refactor: what was refactored
Docs: documentation changes
```

## Areas Where We Need Help

- **Node Types**: More Mermaid shape support
- **Templates**: Industry-specific workflow templates
- **Accessibility**: Keyboard navigation, screen readers
- **Mobile**: Responsive design improvements
- **i18n**: Internationalization support
- **Tests**: Unit and integration tests
- **Documentation**: Tutorials, guides, examples

## Questions?

Feel free to open an issue with the "question" label or start a discussion.

---

Thank you for contributing! 🎉
