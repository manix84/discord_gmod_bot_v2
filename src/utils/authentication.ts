import { nanoid } from "nanoid";
import Database from "../middleware/Database";
import { error } from "./log";

const dbase = new Database();

export const generateAuthToken = (): string => {
  return nanoid(21);
};

export const sanitiseAuthToken = (authorisation: string): string | false => {
  const authParts = authorisation.match(/^BEARER ([A-Za-z0-9_-]{21})$/);
  return authParts && authParts[1] || false;
};

const authenticate = async (authToken?: string, serverID?: string): Promise<boolean> => {
  if (!authToken || !serverID) return false;

  const sanitisedAuthToken = sanitiseAuthToken(authToken);
  if (!sanitisedAuthToken) return false;

  const authedServerID = await dbase.getServerID(sanitisedAuthToken)
    .catch(error);

  if (authedServerID === serverID) return true;

  return false;
};

export default authenticate;
