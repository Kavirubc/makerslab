# UCSC Project Share (Showcase.lk)

This is a platform designed for university students to showcase their academic projects. It allows users to upload, share, and explore projects, fostering collaboration and learning within the university community.

This project is a [Next.js](https://nextjs.org) application bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contribution Guidelines

This guide explains how to get started, make contributions, and collaborate effectively within our projects.

### 1. Commit Messages

Format:
`<type>(<scope>): <short summary>`

Types:

- `feat` - Feature: Use when adding a new feature or functionality
- `fix` - Bug Fix: Use when fixing a bug or error in the codebase.
- `refactor` - Code Restructure: Use when rewriting or cleaning code without changing behavior
- `test` - Testing: Use when adding or modifying unit tests, integration tests
- `chore` - Housekeeping: Use for maintenance tasks that don’t affect the app’s features or functionality
- `build` - Build System: Use for changes that affect the build process or dependencies
- `ci` - Continuous Integration: Use for changes to CI/CD configuration files or scripts
- `perf` - Performance: Use when improving application performance (not just fixing a bug).
- `docs` - Documentation: Use for changes that only affect documentation
  Scope: `module/component`
  Example:
  `feat(api): add endpoint for user registration`
  `fix(ui): correct alignment of header icons`
  `docs(readme): update setup instructions`

Guidelines

- Each commit should represent one focused change.
- Avoid mixing unrelated updates.
- Write commit messages that explain the purpose of the change

### 2. Branch Naming

- `feature/<short-description>`
- `bugfix/<short-description>`

### 3. Pull Requests

Every PR must give clear context so the reviewer understands why and what without checking the code first.
Template:
`### Purpose`
`Clearly explain what this PR does and why it’s needed.`
`Mention the issue, feature, or problem it addresses.`

`### Summary of Changes`
`List key updates or additions.`
`Focus on what was changed, added, or removed.`

`### Implementation Notes (optional)`
`Add any context that reviewers should know:`
`-`
`-`

`### Checklist`
`-`
`-`

`### Related Issues`
`Link relevant GitHub issues`

`### Additional Context (optional)`
`Add screenshots, logs, or references that help reviewers understand the change.`

### 4. Issues

Before opening a new issue, check existing ones to avoid duplicates.
Template:
`### Summary`
`Briefly describe the issue or feature request.`

`### Steps to Reproduce (for bugs)`
`List key steps to reproduce.`
`1. Step 1`
`2. Step 2`
`3. Step 3`
`(Add code snippets or commands if relevant)`

`### Expected Behavior`
`Explain what you expected to happen.`

`### Actual Behavior`
`Explain what actually happened, including any error messages.`

`### Possible Solution (optional)`
`If you have ideas for how to fix or improve it, describe them briefly.`

`### Impact or Priority (optional)`
`How critical is this issue? (low / medium / high)`
`Is it blocking other work?`

`### Technical Details`
`List relevant APIs, logs, or dependencies that may help debug.`

`### Evidence`
`Logs, screenshots, or references if available.`

`### Related Issues`
`Link any other issues or PRs connected to this problem.`

`### Labels`
`bug`
`feature`
`enhancement`
`documentation`

And always PR should go from the branch you work to `development-main` -> `main`
