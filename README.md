# 🧱 Kellon Webapp

> A private NEXT js DeFi project built and maintained by the internal Kellon development team.

---

## 🚀 Getting Started

Clone the repository and install dependencies.

### Using **npm**

```bash
npm install
npm run dev
```

### Using **yarn**

```bash
yarn
yarn dev
```

---

## 🛠️ Scripts

| Command                          | Description                     |
| -------------------------------- | ------------------------------- |
| `npm run dev` / `yarn dev`       | Starts local development server |
| `npm run lint` / `yarn lint`     | Lints the codebase              |
| `npm run format` / `yarn format` | Formats the code using Prettier |

---

## 🧑‍💻 Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- TypeScript
- Tailwind CSS
- ESLint & Prettier

---

## 🤝 Internal Collaboration Guidelines

This is a **private project**, and collaboration is limited to the core development team. Please follow these rules to maintain consistency, quality, and efficiency across the codebase.

### 🧑‍💻 Team Roles

| Role               | Responsibility                                                                 |
| ------------------ | ------------------------------------------------------------------------------ |
| **Lead Developer** | Oversees implementation, reviews PRs, and ensures coding standards are met.    |
| **Contributor**    | Develops features, fixes bugs, and participates in code reviews.               |
| **Reviewer**       | Reviews code, tests changes, and ensures adherence to project structure/style. |

---

### 📁 Branching Strategy

We follow a strict branch naming and PR policy:

- **Base branch**: `main`
- **Feature branches**: `feature/your-feature-name`
- **Bugfix branches**: `fix/short-description`
- **Hotfixes**: `hotfix/critical-issue-name`

✅ **Never push directly to `main`**. Always work via a pull request (PR).

---

### ✅ Pull Request Workflow

1. Create a feature/fix branch from `main`.
2. Commit changes in small, logical chunks with clear messages.
3. Push your branch and open a PR to `main`.
4. Request review from at least **1 team member**.
5. PRs must be approved before merging.

#### PR Rules:

- Write a descriptive title and summary.
- Mention related task/issue in the PR.
- Test your changes before submitting.
- Don't merge without team review unless it's a critical hotfix.

---

### 💻 Local Development

You can use either **npm** or **yarn**.

#### Using **npm**

```bash
npm install        # install dependencies
npm run dev        # start local development server
npm run lint       # check for linting issues
npm run format     # auto-format code using Prettier
```

#### Using **yarn**

```bash
yarn               # install dependencies
yarn dev           # start local development server
yarn lint          # check for linting issues
yarn format        # auto-format code using Prettier
```

✅ Ensure all lint and format checks pass before pushing your branch.

---

### 🧪 Code Standards

- Follow **Next.js and React best practices**.
- Use proper folder structure and naming conventions.
- Keep components **reusable** and logic **modular**.
- Avoid large PRs — break down into smaller changes if needed.
- Use `eslint` and `prettier` — fix all lint errors before pushing.

---

### 💬 Team Communication

- Use [Whatsapp] for quick syncs.
- Notify the team when opening a PR.
- Be constructive in reviews — suggest improvements, not just fixes.
- Respect review timelines and keep PRs reviewable.

---

### 🐛 Bug Reporting / Task Updates

Use our team board or task manager (e.g., Trello, Linear, Notion, etc.):

- Add a clear title and steps to reproduce for bugs.
- Link the task ID in the PR (e.g., `TRELLO-123`).
- Move tasks to `In Review` or `Done` after merging.

---

### 🔐 Security & Confidentiality

This project is private. Do **not** share code, architecture, or credentials with anyone outside the team. Treat all data and code with confidentiality.

---

### ✅ Example Workflow

```bash
# Start from main
git checkout main
git pull

# Create a feature branch
git checkout -b feature/user-authentication

# Make changes, lint, and format
npm run lint      # or yarn lint
npm run format    # or yarn format

# Commit and push
git add .
git commit -m "Implement login and signup pages"
git push origin feature/user-authentication

# Then open a pull request to `main`
```

---

### 🙌 Final Notes

- Push regularly to avoid merge conflicts.
- Communicate progress and blockers early.
- Prioritize quality and consistency over speed.
- Ask for help when needed — we’re all on the same team.
