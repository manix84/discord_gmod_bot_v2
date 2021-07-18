import { customAlphabet } from "nanoid";

export const generateLinkToken = (): string =>
  customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6)();
