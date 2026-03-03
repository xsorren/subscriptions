export async function signInWithOtp(email: string) {
  // Simular envío de OTP
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`[Mock] OTP requested for ${email}`);
}

export async function signOut() {
  // Simular cierre de sesión
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('[Mock] User signed out');
}
