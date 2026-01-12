// Form validation utilities

export function validateWordCount(count) {
  const num = parseInt(count, 10);
  if (isNaN(num) || num < 1) {
    return { valid: false, error: 'Word count must be a positive number' };
  }
  if (num > 8000) {
    return { valid: false, error: 'Word count cannot exceed 8000' };
  }
  return { valid: true };
}

export function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length > 100) {
    return { valid: false, error: 'Title cannot exceed 100 characters' };
  }
  return { valid: true };
}

export function validateUrl(url) {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}

