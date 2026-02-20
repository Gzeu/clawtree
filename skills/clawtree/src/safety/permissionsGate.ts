/**
 * PermissionsGate — validates skill permissions before any action.
 *
 * Rules:
 *   - Skills requesting shell + filesystem + network simultaneously
 *     require explicit user confirmation.
 *   - Unknown permission strings are blocked by default.
 */

export type Permission = "shell" | "filesystem" | "network" | "clipboard" | "env";

const KNOWN_PERMISSIONS = new Set<Permission>(["shell", "filesystem", "network", "clipboard", "env"]);

export interface PermissionCheckResult {
  allowed:      boolean;
  requiresConfirmation: boolean;
  blockedReason?: string;
  warnings:     string[];
}

/** Check a permission list before installing or running a skill. */
export function checkPermissions(
  requested: string[],
  userConfirmed = false
): PermissionCheckResult {
  const warnings: string[] = [];

  // Block unknown permissions
  const unknown = requested.filter((p) => !KNOWN_PERMISSIONS.has(p as Permission));
  if (unknown.length) {
    return {
      allowed:              false,
      requiresConfirmation: false,
      blockedReason:        `Unknown permissions: ${unknown.join(", ")}. Refusing to proceed.`,
      warnings,
    };
  }

  const perms = new Set(requested as Permission[]);

  // High-risk combo: shell + filesystem + network
  const isHighRisk = perms.has("shell") && perms.has("filesystem") && perms.has("network");

  if (isHighRisk && !userConfirmed) {
    return {
      allowed:              false,
      requiresConfirmation: true,
      blockedReason:        "This skill requests shell + filesystem + network simultaneously. Explicit confirmation required.",
      warnings,
    };
  }

  if (perms.has("shell"))      warnings.push("shell: can execute arbitrary commands");
  if (perms.has("network"))    warnings.push("network: can make outbound connections");
  if (perms.has("filesystem")) warnings.push("filesystem: can read/write local files");

  return { allowed: true, requiresConfirmation: false, warnings };
}

/** Read and validate the permissions array in a skill.json. */
export function validateSkillPermissions(
  skillJson: Record<string, any>,
  userConfirmed = false
): PermissionCheckResult {
  const permissions: string[] = skillJson.permissions ?? [];
  return checkPermissions(permissions, userConfirmed);
}
