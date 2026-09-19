export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(st\.)?tau\.edu\.ng$/;
  return emailRegex.test(email.toLowerCase().trim());
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|`~]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

export const validateMatricNo = (matricNo) => {
  if (!matricNo) return false;
  const patterns = [
    /^TAU\/[A-Z]{2,4}\/\d{2,4}\/\d{3,4}$/i,
    /^TAU\/[A-Z]{2,4}\/\d{2,4}\/[A-Z0-9]{3,4}$/i,
    /^[A-Z]{2,4}\/\d{2,4}\/\d{3,4}$/i,
    /^\d{2}\/\d{2}[A-Z]{2,4}\d{3,4}$/i
  ];
  const trimmed = matricNo.trim().toUpperCase();
  return patterns.some(pattern => pattern.test(trimmed));
};
