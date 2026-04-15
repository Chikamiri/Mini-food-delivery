export function isRequired(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0
}

export function isEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(String(value || '').trim())
}

export function isPhoneVN(value) {
  const phonePattern = /^(0|\+84)(3|5|7|8|9)\d{8}$/
  return phonePattern.test(String(value || '').trim())
}

export function minLength(value, min) {
  return String(value || '').trim().length >= min
}
