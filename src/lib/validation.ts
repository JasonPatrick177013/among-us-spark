export type RegistrationValues = {
  name: string
  email: string
  username: string
  team: string
}

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/

/** Returns an object of error messages. An empty object means the form is valid. */
export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const username = values.username.trim()
  const team = values.team.trim()

  if (name.length < 2) errors.name = 'Enter your name (at least 2 characters).'
  else if (name.length > 60) errors.name = 'Keep your name under 60 characters.'

  if (!email) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'That email does not look right. Try name@example.com.'

  if (username.length < 3) errors.username = 'Pick a username with at least 3 characters.'
  else if (username.length > 20) errors.username = 'Keep your username under 20 characters.'
  else if (!USERNAME_PATTERN.test(username)) errors.username = 'Use only letters, numbers, dashes and underscores.'

  if (team.length > 30) errors.team = 'Keep the team name under 30 characters.'

  return errors
}
