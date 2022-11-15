import bcrypt from "bcryptjs";

export const hasingPassword = async (doc) => {
  doc.password = await bcrypt.hash(doc.password, 12);
  doc.passwordConfirm = undefined;
};
