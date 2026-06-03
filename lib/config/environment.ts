export const environmentVariableDescriptions = {
  NEXT_PUBLIC_SUPABASE_URL:
    "Supabase project URL used by browser and server clients. This value is public.",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "Supabase anonymous key used by browser clients. This value is public and must rely on Row Level Security.",
  SUPABASE_SERVICE_ROLE_KEY:
    "Supabase service role key used only by trusted server code for privileged operations.",
  OPENAI_API_KEY: "OpenAI API key used only by trusted server code for AI processing."
} as const;

export type EnvironmentVariableName = keyof typeof environmentVariableDescriptions;

export interface EnvironmentConfig {
  readonly supabase: {
    readonly url: string;
    readonly anonKey: string;
    readonly serviceRoleKey: string;
  };
  readonly openai: {
    readonly apiKey: string;
  };
}

export interface EnvironmentValidationSuccess {
  readonly status: "valid";
  readonly missingVariables: readonly [];
  readonly message: string;
}

export interface EnvironmentValidationFailure {
  readonly status: "invalid";
  readonly missingVariables: readonly EnvironmentVariableName[];
  readonly message: string;
}

export type EnvironmentValidationResult =
  | EnvironmentValidationSuccess
  | EnvironmentValidationFailure;

export class EnvironmentConfigurationError extends Error {
  public readonly missingVariables: readonly EnvironmentVariableName[];

  public constructor(missingVariables: readonly EnvironmentVariableName[]) {
    super(
      `Missing required environment variables: ${missingVariables.join(
        ", "
      )}. Configure them from .env.example before using dependent services.`
    );
    this.name = "EnvironmentConfigurationError";
    this.missingVariables = [...missingVariables];
  }
}

const requiredEnvironmentVariables = Object.keys(
  environmentVariableDescriptions
) as EnvironmentVariableName[];

function readEnvironmentVariable(variableName: EnvironmentVariableName): string | undefined {
  const value = process.env[variableName]?.trim();

  return value && value.length > 0 ? value : undefined;
}

function getMissingEnvironmentVariables(
  variableNames: readonly EnvironmentVariableName[]
): EnvironmentVariableName[] {
  return variableNames.filter((variableName) => !readEnvironmentVariable(variableName));
}

export function validateEnvironment(
  variableNames: readonly EnvironmentVariableName[] = requiredEnvironmentVariables
): EnvironmentValidationResult {
  const missingVariables = getMissingEnvironmentVariables(variableNames);

  if (missingVariables.length > 0) {
    return {
      status: "invalid",
      missingVariables,
      message: `Missing required environment variables: ${missingVariables.join(", ")}.`
    };
  }

  return {
    status: "valid",
    missingVariables: [],
    message: "All required environment variables are configured."
  };
}

export function assertEnvironmentIsConfigured(
  variableNames: readonly EnvironmentVariableName[] = requiredEnvironmentVariables
): void {
  const validationResult = validateEnvironment(variableNames);

  if (validationResult.status === "invalid") {
    throw new EnvironmentConfigurationError(validationResult.missingVariables);
  }
}

export function getEnvironmentConfig(): EnvironmentConfig {
  assertEnvironmentIsConfigured();

  return {
    supabase: {
      url: readRequiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
      anonKey: readRequiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      serviceRoleKey: readRequiredEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY")
    },
    openai: {
      apiKey: readRequiredEnvironmentVariable("OPENAI_API_KEY")
    }
  };
}

function readRequiredEnvironmentVariable(variableName: EnvironmentVariableName): string {
  const value = readEnvironmentVariable(variableName);

  if (!value) {
    throw new EnvironmentConfigurationError([variableName]);
  }

  return value;
}
