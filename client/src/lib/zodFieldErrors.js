export function zodFieldErrors(zodError) {
  const fields = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] ?? '_root';
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}
