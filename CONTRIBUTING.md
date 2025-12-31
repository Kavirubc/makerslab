# Contribution Guidelines

This guide explains how to get started, make contributions, and collaborate effectively within our projects.

## 1. Commit Signing Policy

This repository requires verified commit signatures. If your commits are not signed, merge operations will be blocked.

### Configure Signing

You can sign commits using GPG (standard) or SSH (easier if you already use SSH for Git).

#### Option A: GPG Signing (Recommended)

1. **Install GPG:**

   - macOS: `brew install gnupg`

   - Windows: Download [Gpg4win](https://www.gpg4win.org/)

   - Linux: `sudo apt install gnupg`

2. **Generate Key:**

   ```bash

   gpg --full-generate-key

   # Select RSA and RSA, 4096 bits. Use your GitHub email.

   ```

3. **Configure Git:**

   ```bash

   # List keys to find your Key ID (e.g., 3AA5C34371567BD2)

   gpg --list-secret-keys --keyid-format LONG



   # Tell Git to use it

   git config --global user.signingkey <YOUR_KEY_ID>

   git config --global commit.gpgsign true

   ```

4. **Upload Public Key:**

   - Run `gpg --armor --export <YOUR_KEY_ID>`

   - Copy the output and add it to your GitHub Settings \> SSH and GPG Keys \> New GPG Key.

5. **Configure Pinentry (Required for commit signing):**

   If you encounter `error: gpg failed to sign the data` or `Inappropriate ioctl for device`, you need to configure the pinentry program.

   **macOS:**

   ```bash
   # Install pinentry-mac for GUI password prompts
   brew install pinentry-mac

   # Configure GPG to use it
   mkdir -p ~/.gnupg
   echo "pinentry-program /opt/homebrew/bin/pinentry-mac" >> ~/.gnupg/gpg-agent.conf

   # Restart GPG agent
   gpgconf --kill gpg-agent
   ```

   **Windows:**

   Gpg4win includes pinentry programs by default. If you have issues:

   ```bash
   # Create or edit %APPDATA%\gnupg\gpg-agent.conf
   # Add this line (adjust path if Gpg4win is installed elsewhere):
   pinentry-program "C:/Program Files (x86)/Gpg4win/bin/pinentry.exe"

   # Restart GPG agent in PowerShell or Command Prompt
   gpgconf --kill gpg-agent
   gpg-connect-agent /bye
   ```

   **Linux:**

   ```bash
   # Install a pinentry program (choose based on your environment)
   # For terminal-only:
   sudo apt install pinentry-tty
   # For GUI (GNOME/GTK):
   sudo apt install pinentry-gtk-2
   # For GUI (Qt/KDE):
   sudo apt install pinentry-qt

   # Configure GPG to use it
   mkdir -p ~/.gnupg
   echo "pinentry-program /usr/bin/pinentry-tty" >> ~/.gnupg/gpg-agent.conf
   # or use /usr/bin/pinentry-gtk-2 or /usr/bin/pinentry-qt

   # Restart GPG agent
   gpgconf --kill gpg-agent
   ```

   **Alternative Solution (All Platforms):**

   Add the following to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):

   ```bash
   export GPG_TTY=$(tty)
   ```

   Then reload your shell: `source ~/.bashrc` (or restart your terminal).

#### Option B: SSH Signing (Alternative)

If you already use an SSH key to push code, you can use it for signing (Git 2.34+ required).

```bash

git config --global gpg.format ssh

git config --global user.signingkey ~/.ssh/id_ed25519.pub

git config --global commit.gpgsign true

```

_Go to GitHub Settings \> SSH and GPG Keys \> Add SSH Key \> Select "Signing Key" as the type._

### Fixing Blocked Commits

If you have pushed unsigned commits to a PR, you must sign them retroactively:

1.  Checkout your branch locally.

2.  Run the rebase command: `git rebase --exec 'git commit --amend --no-edit -n -S' -i origin/development-main`

3.  Force push the changes: `git push --force-with-lease`

---

## 2. Branching Strategy

We follow a strict branching workflow to ensure stability.

- **main**: Production-ready code. Do not push directly to main.

- **preview**: Integration branch for testing. All PRs must target this branch.

- **Feature/Fix Branches**: Where you do your work.

**Workflow Rule:**

1.  Create your branch off `preview`.

2.  Submit your Pull Request targeting `preview` (not `main`).

---

## 3. Branch Naming

Use the following naming conventions for your branches:

- `feature/<short-description>`

- `bugfix/<short-description>`

Examples:

- `feature/user-authentication`

- `bugfix/header-alignment`

---

## 4. Commit Messages

We follow a structured commit message format to generate clean change logs.

**Format:**

`<type>(<scope>): <short summary>`

**Types:**

- `feat`: Feature - Use when adding a new feature or functionality.

- `fix`: Bug Fix - Use when fixing a bug or error in the codebase.

- `refactor`: Code Restructure - Use when rewriting or cleaning code without changing behavior.

- `test`: Testing - Use when adding or modifying unit tests or integration tests.

- `chore`: Housekeeping - Use for maintenance tasks that do not affect features or functionality.

- `build`: Build System - Use for changes that affect the build process or dependencies.

- `ci`: Continuous Integration - Use for changes to CI/CD configuration files or scripts.

- `perf`: Performance - Use when improving application performance (not just fixing a bug).

- `docs`: Documentation - Use for changes that only affect documentation.

**Scope:**

The module or component affected (e.g., `api`, `ui`, `database`).

**Examples:**

- `feat(api): add endpoint for user registration`

- `fix(ui): correct alignment of header icons`

- `docs(readme): update setup instructions`

**Guidelines:**

- Each commit should represent one focused change.

- Avoid mixing unrelated updates.

- Write commit messages that explain the purpose of the change.

---

## 5. Pull Requests

Every PR must give clear context so the reviewer understands the "why" and "what" without checking the code first. Ensure your PR targets `preview` (not `main`).

**PR Template:**

```markdown
### Purpose

Clearly explain what this PR does and why it is needed.

Mention the issue, feature, or problem it addresses.

### Summary of Changes

List key updates or additions. Focus on what was changed, added, or removed.

### Implementation Notes (optional)

Add any context that reviewers should know:

- Note 1

- Note 2

### Checklist

- [ ] Code builds successfully

- [ ] Tests have been added/updated

- [ ] Documentation has been updated

### Related Issues

Link relevant GitHub issues (e.g., Fixes #123)

### Additional Context (optional)

Add screenshots, logs, or references that help reviewers understand the change.
```

---

## 6. Issues

Before opening a new issue, check existing ones to avoid duplicates.

**Issue Template:**

```markdown
### Summary

Briefly describe the issue or feature request.

### Steps to Reproduce (for bugs)

List key steps to reproduce:

1. Step 1

2. Step 2

3. Step 3

(Add code snippets or commands if relevant)

### Expected Behavior

Explain what you expected to happen.

### Actual Behavior

Explain what actually happened, including any error messages.

### Possible Solution (optional)

If you have ideas for how to fix or improve it, describe them briefly.

### Impact or Priority (optional)

- How critical is this issue? (low / medium / high)

- Is it blocking other work?

### Technical Details

List relevant APIs, logs, or dependencies that may help debug.

### Evidence

Logs, screenshots, or references if available.

### Related Issues

Link any other issues or PRs connected to this problem.

### Labels

[ ] bug

[ ] feature

[ ] enhancement

[ ] documentation
```
