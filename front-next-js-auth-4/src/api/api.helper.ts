export const getContentType = () => ({
  "Content-Type": "application/json",
});

export const errorCatch = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message;
    return typeof message === "object" && Array.isArray(message)
      ? message[0]
      : typeof message === "string"
        ? message
        : "Unknown error";
  }

  return error instanceof Error ? error.message : "Unknown error";
};
