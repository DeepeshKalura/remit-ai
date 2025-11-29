# Agent Guidelines for RemitAI

## Build/Lint/Test Commands

### Backend (Python/FastAPI)
- **Install dependencies**: `cd backend && uv sync`
- **Run tests**: `cd backend && uv run pytest`
- **Run single test**: `cd backend && uv run pytest tests/test_file.py::TestClass::test_method`
- **Lint**: `cd backend && uv run ruff check .`
- **Format**: `cd backend && uv run ruff format .`
- **Pre-commit**: `cd backend && pre-commit run --all-files`

### Frontend (Next.js/TypeScript)
- **Install dependencies**: `pnpm install`
- **Dev server**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Type check**: `npx tsc --noEmit`

## Code Style Guidelines

### Python
- Use `ruff` for formatting and linting (configured in pre-commit)
- Imports: Standard library first, then third-party, then local
- Type hints required for function parameters and return values
- Docstrings for classes and public methods
- Naming: snake_case for variables/functions, PascalCase for classes
- Error handling: Use specific exceptions, log errors appropriately

### TypeScript/React
- Strict TypeScript enabled (`"strict": true`)
- Use `@/` path alias for imports
- Component naming: PascalCase
- Props interface: Define inline or as separate interface
- Hooks: Use React hooks properly, avoid prop drilling
- Error handling: Try/catch in async functions, user-friendly error messages
- Icons: Use `lucide-react` for consistent iconography

### General
- No comments unless explaining complex business logic
- Follow TDD: Write integration tests first, then implement
- Keep functions small and focused
- Use meaningful variable names
- Handle edge cases and validation

## Testing Approach
- Focus on integration tests over unit tests
- Test API endpoints, component interactions, and data flow
- Use mocks for external services (Blockfrost, Masumi)
- Run tests before commits via pre-commit hooks