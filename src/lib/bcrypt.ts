import * as bcrypt from 'bcrypt';

const saltRounds = 10; // You can adjust the number of rounds as needed

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
