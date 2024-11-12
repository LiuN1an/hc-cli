export const toFixed = (num: number) => Number(num.toFixed(2))

export const addUnderLine = (text: string) => text.replace(/\s+/g, '_')

export const validEmail = (email: string) => {
  if (!email) throw new Error('Empty email is not allowed')
  // Split email into local and domain parts
  const parts = email.split('@')
  if (parts.length !== 2) throw new Error('Invalid email format')
  const [local, domain] = parts

  // Check local and domain are not empty and don't contain whitespace
  if (!local || !domain || local.includes(' ') || domain.includes(' ')) throw new Error('Invalid email format')

  // Check domain has at least one dot
  const domainParts = domain.split('.')
  if (domainParts.length < 2 || !domainParts[0] || !domainParts[1]) throw new Error('Invalid email format')

  return true
}

export const validPhone = (phone: string) => {
  if (!phone) throw new Error('Empty phone is not allowed')

  // Remove any spaces or special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

  // Check if phone number contains only digits
  if (!/^\d+$/.test(cleanPhone)) {
    throw new Error('Phone number can only contain digits')
  }

  // Check length is between 8-15 digits
  if (cleanPhone.length < 8 || cleanPhone.length > 15) {
    throw new Error('Phone number must be between 8-15 digits')
  }

  return true
}

export const validPassword = (password: string) => {
  if (!password || password.length < 8) throw new Error('At least 8 characters')

  // Check for at least one letter
  let hasLetter = false
  for (const char of password) {
    if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
      hasLetter = true
      break
    }
  }

  // Check for at least one number
  let hasNumber = false
  for (const char of password) {
    if (char >= '0' && char <= '9') {
      hasNumber = true
      break
    }
  }
  if (!hasNumber) {
    throw new Error('At least one number')
  }
  if (!hasLetter) {
    throw new Error('At least one letter')
  }

  return true
}
