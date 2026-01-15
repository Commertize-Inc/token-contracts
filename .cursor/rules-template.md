# Generic Cursor Rules Template

This template provides a comprehensive set of rules for Cursor AI that can be adapted for any project. Copy and customize this template for your specific project needs.

## Usage Instructions

1. Copy this template to your project root as `.cursorrules`
2. Customize the sections marked with `[CUSTOMIZE]` for your specific project
3. Update technology stack, patterns, and project-specific context
4. Remove sections that don't apply to your project

---

````markdown
# Cursor AI Assistant Rules

## Project Documentation Standards

### Documentation Organization

- All project documentation MUST be organized under a `/docs` root directory
- Use clear subfolder structures to categorize documentation by domain:
  - `docs/features/` - Feature specifications, user stories, and requirements
  - `docs/integrations/` - Third-party service integrations, APIs, and external dependencies
  - `docs/architecture/` - System design, technical architecture, and infrastructure
  - `docs/development/` - Development setup, coding standards, and contribution guidelines
  - `docs/api/` - API documentation, endpoints, and data models
  - `docs/user-guides/` - User manuals, tutorials, and workflow documentation
  - `docs/marketing/` - Marketing materials, product descriptions, and external communications
  - `docs/deployment/` - Deployment guides, environment setup, and operational procedures

### Documentation Requirements

- Every major feature or component MUST have corresponding documentation
- Documentation should be written in Markdown format for consistency
- Include clear examples, code snippets, and practical use cases
- Maintain up-to-date documentation that reflects current implementation
- Use descriptive filenames that clearly indicate content purpose
- Include table of contents for longer documents
- Cross-reference related documentation using relative links

## Code Quality and Standards

### Language-Specific Standards

[CUSTOMIZE - Add your project's primary languages]

- **TypeScript/JavaScript**: Follow ESLint and Prettier configurations, use strict typing, implement proper error handling
- **Python**: Follow PEP 8, use type hints, implement proper exception handling, use virtual environments
- **Go**: Follow Go conventions, use proper error handling, implement clean interfaces
- **Rust**: Follow Rust conventions, use proper ownership patterns, implement comprehensive error handling
- **Java**: Follow Java conventions, use proper design patterns, implement comprehensive documentation
- **C#**: Follow C# conventions, use proper async/await patterns, implement proper resource management

### Design Patterns and Architecture

- **SOLID Principles**: Apply Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion
- **DRY (Don't Repeat Yourself)**: Avoid code duplication, create reusable components and utilities
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they're actually needed
- **Separation of Concerns**: Keep business logic, data access, and presentation layers separate
- **Dependency Injection**: Use proper dependency injection patterns for testability and maintainability

### Code Organization

[CUSTOMIZE - Update for your project structure]

- Use consistent file and folder naming conventions (kebab-case for files, PascalCase for components)
- Implement proper module/package structure with clear boundaries
- Use index files for clean imports and exports
- Separate concerns into appropriate directories (components, hooks, utils, types, etc.)
- Implement proper error boundaries and fallback mechanisms
- Use environment variables for configuration management

### Testing and Quality Assurance

- Write unit tests for business logic and utility functions
- Implement integration tests for critical user flows
- Use proper mocking and test isolation techniques
- Maintain high test coverage for critical components
- Implement proper error handling and edge case testing
- Use static analysis tools and linters consistently

### Performance and Security

- Implement proper caching strategies where appropriate
- Use lazy loading and code splitting for better performance
- Implement proper input validation and sanitization
- Follow security best practices for authentication and authorization
- Use HTTPS and secure communication protocols
- Implement proper logging and monitoring

### Version Control and Collaboration

- Use meaningful commit messages following conventional commit format
- Implement proper branching strategies (feature branches, pull requests)
- Use proper code review processes
- Maintain clean git history with proper rebasing and squashing
- Document breaking changes and migration paths
- Use semantic versioning for releases

## AI Assistant Behavior

### Code Generation Guidelines

- Always generate code that follows the established patterns in the codebase
- Prefer existing components and utilities over creating new ones
- Implement proper TypeScript types and interfaces
- Include proper error handling and edge cases
- Add appropriate comments for complex logic
- Ensure generated code is production-ready and follows security best practices

### Documentation Generation

- Create comprehensive documentation for any new features or components
- Include practical examples and use cases
- Update existing documentation when making changes
- Use clear, concise language that's accessible to all team members
- Include diagrams or visual aids when helpful for understanding

### Refactoring and Maintenance

- Identify and suggest improvements to existing code
- Propose better architectural patterns when appropriate
- Help maintain consistency across the codebase
- Suggest performance optimizations and security improvements
- Help with dependency updates and migration strategies

### Problem Solving Approach

- Understand the full context before proposing solutions
- Consider multiple approaches and their trade-offs
- Prioritize maintainable and scalable solutions
- Consider backward compatibility and migration paths
- Think about testing and deployment implications

## Project-Specific Context

### Current Technology Stack

[CUSTOMIZE - Update for your project]

- **Framework**: [Your framework - e.g., Next.js, React, Vue, Angular, Django, Flask, etc.]
- **Language**: [Primary language - e.g., TypeScript, Python, Go, Rust, Java, C#]
- **Styling**: [Styling solution - e.g., Tailwind CSS, CSS Modules, Styled Components]
- **UI Library**: [UI components - e.g., Radix UI, Material-UI, Ant Design, Chakra UI]
- **State Management**: [State solution - e.g., Redux, Zustand, Context API, MobX]
- **Package Manager**: [Package manager - e.g., npm, yarn, pnpm, pip, cargo]
- **Deployment**: [Deployment solution - e.g., Docker, Vercel, AWS, GCP, Azure]

### Key Architectural Patterns

[CUSTOMIZE - Update for your project patterns]

- Component-based architecture with clear separation of concerns
- Custom hooks for business logic and state management
- Context providers for global state
- Modular component structure with index files for clean exports
- Type-safe interfaces and proper error handling
- Responsive design with mobile-first approach

### Development Workflow

[CUSTOMIZE - Update for your project structure]

- Use the established component structure in `/components`
- Follow the existing patterns for pages in `/app` or `/src`
- Implement proper TypeScript types in `/types`
- Use custom hooks in `/hooks` for reusable logic
- Store business logic in `/lib` with proper organization
- Maintain proper import/export patterns throughout

### Project-Specific Conventions

[CUSTOMIZE - Add your project's specific conventions]

- [Add any specific naming conventions]
- [Add any specific architectural decisions]
- [Add any specific tooling requirements]
- [Add any specific deployment requirements]

## Quality Gates

### Before Code Generation

- Verify the request aligns with project architecture
- Check for existing similar implementations
- Ensure proper error handling is included
- Validate security considerations

### After Code Generation

- Verify code follows established patterns
- Check for proper TypeScript types
- Ensure tests are included where appropriate
- Validate documentation is updated

### Code Review Checklist

- [ ] Code follows established patterns and conventions
- [ ] Proper error handling and edge cases covered
- [ ] Tests are included and comprehensive
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Accessibility requirements met (if applicable)

## Common Patterns and Examples

### Component Structure

[CUSTOMIZE - Add examples from your codebase]

```typescript
// Example component structure
interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component implementation
  return (
    // JSX
  );
}
```
````

### Error Handling

[CUSTOMIZE - Add your error handling patterns]

```typescript
// Example error handling
try {
	// Operation
} catch (error) {
	// Error handling
	throw new CustomError("Message", error);
}
```

### Testing Patterns

[CUSTOMIZE - Add your testing patterns]

```typescript
// Example test structure
describe("Component", () => {
	it("should handle basic functionality", () => {
		// Test implementation
	});
});
```

Remember: Always prioritize code quality, maintainability, and user experience. When in doubt, choose the solution that's most maintainable and follows established patterns in the codebase.

## Additional Resources

- [Link to your project's coding standards]
- [Link to your project's architecture documentation]
- [Link to your project's testing guidelines]
- [Link to your project's deployment documentation]

```

## Customization Guide

### Required Customizations

1. **Technology Stack**: Update the technology stack section with your project's specific technologies
2. **Project Structure**: Update the development workflow section with your project's directory structure
3. **Architectural Patterns**: Update the key architectural patterns with your project's specific patterns
4. **Conventions**: Add any project-specific conventions or requirements

### Optional Customizations

1. **Language-Specific Standards**: Add or remove languages based on your project
2. **Testing Framework**: Update testing examples with your specific testing framework
3. **Deployment**: Update deployment information with your specific deployment strategy
4. **Additional Patterns**: Add any additional patterns or examples specific to your project

### Validation

After customizing the template:
1. Review all `[CUSTOMIZE]` markers and ensure they're updated
2. Test the rules with a few code generation requests
3. Validate that the rules align with your project's actual patterns
4. Update the rules as your project evolves

This template provides a solid foundation for Cursor AI rules that can be adapted to any project while maintaining consistency and quality standards.
```
