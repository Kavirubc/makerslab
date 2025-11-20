# Why You Cannot Merge Your Pull Request (Even as a Collaborator)

## Your Question
> "Can you tell why I cannot merge this pull req even I am a collaborator?"

## Answer: Common Reasons & Solutions

Being a **collaborator** gives you permission to merge PRs, but GitHub can still **block merges** if certain conditions aren't met. Here's what's likely blocking your PR #48:

### 1. ❌ **Failed Status Checks** (Most Likely Your Issue)

**What's happening:**
Your PR shows `mergeable_state: "blocked"` because the Vercel deployment check is failing with:
```
"Authorization required to deploy"
```

**Why:**
- Vercel requires authorization to deploy from forked repositories
- This is a security measure to prevent unauthorized deployments
- Even though you're a collaborator, the check must pass before merging

**How to fix:**
You have two options:

**Option A: Ask the repository owner to authorize Vercel deployments from forks**
1. The repository owner (Kavirubc) needs to log into Vercel
2. Go to the project settings
3. Enable "Deploy Previews" for pull requests from forks
4. Configure deployment authorization

**Option B: Have the owner push your changes to a non-fork branch**
1. The repository owner pulls your branch locally
2. Pushes it to a branch on the main repository (not your fork)
3. Vercel can then deploy it without additional authorization

### 2. 🔐 **Unsigned Commits**

**What's happening:**
This repository requires all commits to be signed (GPG or SSH signatures).

**Check your commits:**
```bash
git log --show-signature
```

**How to fix if commits aren't signed:**
```bash
# 1. Set up signing (if you haven't already)
# See CONTRIBUTING.md for detailed setup instructions

# 2. Sign existing commits retroactively
git checkout your-branch-name
git rebase --exec 'git commit --amend --no-edit -n -S' -i origin/main
git push --force-with-lease
```

### 3. 🔄 **Branch Behind Base**

**What's happening:**
Your branch may be out of sync with the main branch.

**How to fix:**
```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### 4. ✅ **Required Reviews**

**What's happening:**
Branch protection rules may require approval reviews before merging.

**How to fix:**
- Request reviews from maintainers
- Wait for approvals

## Quick Diagnosis

Run through this checklist:

- [ ] All status checks are green (no failed checks)
- [ ] All commits are signed (`git log --show-signature`)
- [ ] Branch is up to date with base branch
- [ ] No merge conflicts exist
- [ ] Required reviews have been approved

## For Your Specific Case (PR #48)

Looking at your PR, the main blocker is:

**The Vercel deployment check is failing due to authorization requirements.**

### Action Required:
1. **Immediate**: Ask repository owner (Kavirubc) to authorize Vercel deployments from forks
2. **Alternative**: Ask the owner to pull your changes and push them to a non-fork branch

## Resources

We've created comprehensive documentation to help:

- **[MERGE_TROUBLESHOOTING.md](MERGE_TROUBLESHOOTING.md)** - Complete troubleshooting guide
- **[CONTRIBUTING.md](CONTRIBUTING.md#5-pull-requests)** - Merge requirements and guidelines
- **GitHub Issue Template** - Report merge issues with `.github/ISSUE_TEMPLATE/merge_blocker.md`

## Automated Help

We've also added GitHub Actions workflows that will:
- Automatically check commit signatures and notify you if any are missing
- Detect merge blockers and post helpful guidance on your PR
- Update comments when issues are resolved

These workflows will help you and other contributors resolve merge blockers faster!

---

## Summary

**You have merge permissions as a collaborator**, but GitHub enforces additional requirements (status checks, signed commits, reviews, etc.) before allowing any PR to be merged. These requirements apply to everyone, including collaborators and even repository owners.

The most common reason collaborators can't merge is **failed status checks** - in your case, the Vercel authorization issue. This needs to be resolved by the repository owner in the Vercel dashboard settings.
