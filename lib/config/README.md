# lib/config

Environment configuration and validation live here.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase project URL used by browser and server clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase anonymous key used by browser clients with Row Level Security.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only Supabase service role key for privileged backend operations.
- `OPENAI_API_KEY`: Server-only OpenAI API key for AI resume analysis, job analysis, and matching services.

Rules:

- Store real values in local or deployment environment configuration, not in source control.
- Keep server-only variables out of client components and public responses.
- Use `validateEnvironment` for graceful status checks.
- Use `getEnvironmentConfig` inside trusted server code that must stop when required configuration is missing.
