type ErrorWithResponseMessage = {
  response?: {
    data?: {
      errors?: Record<string, unknown[]>;
      message?: unknown;
    };
  };
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const data = (error as ErrorWithResponseMessage).response?.data;

    // Try to get the first field-level validation error (e.g. proof_image, email, etc.)
    if (data?.errors && typeof data.errors === "object") {
      for (const fieldErrors of Object.values(data.errors)) {
        if (Array.isArray(fieldErrors) && typeof fieldErrors[0] === "string" && fieldErrors[0].length > 0) {
          return fieldErrors[0];
        }
      }
    }

    const message = data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
