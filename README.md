# MakersLab (makerslab.lk)

A collaborative platform designed for university students to showcase their academic projects, fostering knowledge sharing and collaboration within the university community.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Kavirubc/makerslab)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Features

### For Students
- **Project Showcase**: Upload and share your academic projects with the community
- **Explore Projects**: Discover and learn from projects created by other students
- **User Profiles**: Create and customize your profile to showcase your work
- **Project Management**: Create, edit, and manage your project submissions
- **Interactive Dashboard**: Track your projects and engagement

### For Administrators
- **Analytics Dashboard**: Monitor platform usage and engagement metrics
- **User Management**: Manage user accounts and permissions
- **Project Moderation**: Review and moderate project submissions
- **University Management**: Add and manage university listings
- **Report System**: Handle user reports and feedback

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Frontend**: [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com)
- **Database**: [MongoDB](https://www.mongodb.com) (local or Atlas)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Storage**: [Firebase Storage](https://firebase.google.com/products/storage)
- **Package Manager**: [pnpm](https://pnpm.io)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (install via `npm install -g pnpm`)
- MongoDB (local installation or MongoDB Atlas account)
- Firebase project (for storage)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Kavirubc/makerslab.git
   cd makerslab
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Copy the sample environment file and configure it:

   ```bash
   cp .env.sample .env.local
   ```

   Edit `.env.local` with your configuration:
   - MongoDB connection string
   - NextAuth secret
   - Firebase credentials (both Admin SDK and Client SDK)

4. **Seed universities (optional):**

   ```bash
   pnpm seed:universities
   ```

5. **Run the development server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Setup

To promote a user to admin:

```bash
pnpm promote:admin
```

Follow the prompts to enter the user's email address.

## Project Structure

```
makerslab/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── explore/           # Project exploration
│   ├── profile/           # User profiles
│   ├── projects/          # Project pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
├── scripts/              # Database scripts
└── types/                # TypeScript type definitions
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm seed:universities` - Seed university data
- `pnpm promote:admin` - Promote user to admin

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Quick Guidelines

- All commits must be signed (GPG or SSH)
- Follow the [conventional commits](https://www.conventionalcommits.org/) format
- Create feature branches from `main`
- Submit pull requests targeting `main`

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Commit signing setup (GPG/SSH)
- Branching strategy
- Commit message format
- Pull request templates
- Issue reporting

## Contributors

See the [Contributors Page](app/contributors/page.tsx) for a list of people who have contributed to this project.

## License

This project is private and proprietary. All rights reserved.

## Support

For questions or support:
- Open an issue on [GitHub](https://github.com/Kavirubc/makerslab/issues)
- Contact the maintainers

---

Built by koders for coders
