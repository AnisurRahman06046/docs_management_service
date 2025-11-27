/**
 * Convert a string to camelCase
 * Examples:
 *   "Academic Transcripts" -> "academicTranscripts"
 *   "English Test" -> "englishTest"
 *   "passport" -> "passport"
 *   "CV" -> "cv"
 */
export const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
};

/**
 * Build checklist object from document type names
 * @param documentTypeNames - Array of document type names
 * @returns Object with camelCase keys and true values
 */
export const buildChecklist = (documentTypeNames: string[]): Record<string, boolean> => {
  const checklist: Record<string, boolean> = {};

  for (const name of documentTypeNames) {
    const key = toCamelCase(name);
    checklist[key] = true;
  }

  return checklist;
};
