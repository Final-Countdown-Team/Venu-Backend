import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// INSTANCE METHODS
// Comparing password when logging in
export const correctPasswordUtil = async function (candidatePW, doc) {
  return await bcrypt.compare(candidatePW, doc.password);
};
// Generate and hash reset token and save it to current document
export const createPasswordResetTokenUtil = function (doc) {
  const resetToken = crypto.randomBytes(32).toString('hex');

  doc.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  doc.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const changedPasswordAfterUtil = function (JWTTimestamp, doc) {
  if (doc.passwordChangedAt) {
    const changedTimestamp = parseInt(
      doc.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};
