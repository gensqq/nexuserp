type RuleType = "string" | "number" | "boolean" | "array" | "object";

interface FieldRules {
  required?: boolean;
  type?: RuleType;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: readonly string[];
}

type ValidationRules = Record<string, FieldRules>;

export function validate(
  data: Record<string, unknown>,
  rules: ValidationRules
): string[] {
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rule.type) {
      if (rule.type === "array" ? !Array.isArray(value) : typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`);
        continue;
      }
    }

    if (rule.type === "string" && typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
    }

    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }
    }

    if (rule.enum && !rule.enum.includes(value as string)) {
      errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
    }
  }

  return errors;
}
