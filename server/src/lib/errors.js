export function validationError(zodError) {
  const fields = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] ?? '_root';
    if (!(key in fields)) fields[key] = issue.message;
  }
  const err = new Error('validation');
  err.status = 400;
  err.publicError = 'validation';
  err.fields = fields;
  return err;
}

export function apiError(status, publicError) {
  const err = new Error(publicError);
  err.status = status;
  err.publicError = publicError;
  return err;
}
