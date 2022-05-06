export interface PolarResource {
  name: string;
  permissions?: string[];
  roles?: string[];
  rolePermissions?: Record<string, string[]>;
  roleInherits?: Record<string, string[]>;
  relations?: Record<string, {model: string; property: string}>;
}
