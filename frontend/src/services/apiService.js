/**
 * Mock, client-side-only authentication for this prototype.
 *
 * No backend call is made here on purpose - this iteration is meant to
 * exercise the live Convai character without needing any other service
 * running. Swap the body of `login` for a real backend call (see
 * ../../../backend/routes/auth.py for the FastAPI version already built)
 * once real auth is wired in - callers only depend on the resolved shape.
 */

const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Rahul Sharma',
  email: 'demo@finlens.ai',
  password: '123456',
}

export async function login(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (email.trim().toLowerCase() !== DEMO_USER.email || password !== DEMO_USER.password) {
    throw new Error('Invalid email or password.')
  }

  return {
    success: true,
    user: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
  }
}
