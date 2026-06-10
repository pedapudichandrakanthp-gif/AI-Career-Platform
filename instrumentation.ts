export async function register() {
  const { validateStartupEnvironment } = await import("@/lib/config/environment");
  validateStartupEnvironment();
}
