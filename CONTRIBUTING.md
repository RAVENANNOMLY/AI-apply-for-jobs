# Contributing to AI CV Customization

Thank you for your interest in contributing to the AI CV Customization project! We welcome contributions from everyone. Please read this guide to understand how to contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please be respectful and inclusive in all interactions. We are committed to providing a welcoming and inspiring community for all contributors.

## Project Structure

```
AI_CV_Customization/
├── cv_editing_react_app/
│   ├── backend/              # Python Flask API
│   │   ├── api/              # API routes and endpoints
│   │   ├── config/           # Configuration files
│   │   ├── schema/           # Data validation schemas
│   │   ├── services/         # Business logic and services
│   │   ├── database/         # Database models and utilities
│   │   └── test/             # Backend tests
│   └── frontend/my-app/      # React frontend application
│       ├── src/              # React components and pages
│       ├── public/           # Static assets
│       └── package.json      # Node.js dependencies
├── job_listings/             # Job listings data
└── assets/                   # Project assets
```

## Getting Started

### Prerequisites

- **Backend**: Python 3.12+, uv, Virtual Environment
- **Frontend**: Node.js 22+, npm 10.9
- **Browser Automation**: Playwright (for backend services)

### Development Setup

#### Backend Setup

1. **Install UV** (if not already installed):

   ```bash
   pip install uv
   ```

2. **Install Project Dependencies**:

   ```bash
   uv sync
   ```

3. **Install Playwright Browser Binaries**:

   ```bash
   uv run playwright install
   ```

4. **Configure Authentication**:

   Create a `.env` file in the `backend/` directory with your LinkedIn credentials:

   ```ini
   username=your_email@example.com
   password=your_password
   ```

5. **Initialize the Database**:

   ```bash
   uv run python -m services.database.db
   ```

6. **Start the Backend Server**:

   ```bash
   uv run uvicorn api.server:app --reload --port 8000
   ```

   The API will be available at:
   - **Application**: http://localhost:8000
   - **Swagger UI**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd cv_editing_react_app/frontend/my-app
   ```

2. Install dependencies (reproducible setup):

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Making Changes

### Creating a Branch

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Use descriptive branch names:
   - `feature/add-cv-parser`
   - `fix/login-issue`
   - `docs/update-readme`

### Commit Messages

Write clear, concise commit messages:

- Use present tense ("Add feature" not "Added feature")
- Be specific about what changed
- Keep the first line under 50 characters
- Add a blank line and detailed description for complex changes

Example:

```
Add LinkedIn job details extraction

- Extract job title, company, and requirements from LinkedIn
- Implement parsing with Playwright automation
- Add error handling for network timeouts
```

## Submitting Changes

1. **Push your branch** to the repository:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**:
   - Provide a clear description of your changes
   - Reference any related issues (e.g., "Closes #123")
   - Include before/after examples if applicable

3. **Code Review**:
   - Address feedback from reviewers
   - Make requested changes and push updates
   - Keep the conversation respectful and constructive

4. **Merge**:
   - A maintainer will merge your PR once approved
   - Your changes will be included in the next release

## Coding Standards

### Backend (Python)

- Follow **PEP 8** style guide
- Use type hints for function parameters and returns
- Write docstrings for functions and classes
- Keep functions focused and small (single responsibility)
- Use meaningful variable names
- Add comments for complex logic

Example:

```python
def validate_cv_data(cv_data: dict) -> bool:
    """
    Validate CV data against the schema.

    Args:
        cv_data: Dictionary containing CV information

    Returns:
        True if valid, raises ValidationError otherwise
    """
    return CV_SCHEMA.validate(cv_data)
```

### Frontend (React)

- Use **ES6+** syntax
- Use functional components with hooks
- Follow the **Airbnb React style guide**
- Use meaningful component names (PascalCase)
- Use meaningful variable names (camelCase)
- Add comments for complex logic
- Keep components focused and reusable

Example:

```javascript
/**
 * CoverLetterEditor Component
 * Allows users to edit and customize cover letters
 */
export const CoverLetterEditor = ({ initialData }) => {
  const [content, setContent] = useState(initialData);

  return <div className="editor-container">{/* Editor content */}</div>;
};
```

### Testing

- Write tests for new features
- Maintain or improve code coverage
- Run tests before submitting a PR:
  - Backend: `pytest` (or your testing framework)
  - Frontend: `npm test`

## Reporting Issues

If you find a bug or have a feature request:

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear title describing the problem
   - Detailed description of the issue
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Screenshots if applicable
   - Your environment (OS, Python/Node version, etc.)

## Getting Help

- Check the [README.md](README.md) for project overview
- Review existing code and comments
- Ask questions in issues or discussions
- Reach out to the maintainers

## Thank You!

Your contributions make this project better. We appreciate your time and effort!
