export function log(context: string, message: string, data?: any) {
  if (data !== undefined) {
    console.log(`[${context}] ${message}:`, data);
  } else {
    console.log(`[${context}] ${message}`);
  }
}

export function error(context: string, message?: string, err?: any) {
  if (!message) {
    message = "ERROR";
  }
  if (err !== undefined) {
    console.error(`[${context}] ${message}:`, err.message);
  } else {
    console.error(`[${context}] ${message}`);
  }
}
