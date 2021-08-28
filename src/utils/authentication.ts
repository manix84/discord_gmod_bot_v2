import { nanoid } from "nanoid";
import Database from "../middleware/Database";
import { error, log } from "./log";

const dbase = new Database();

export const generateAuthToken = (): string => {
  return nanoid(21);
};

export const sanitiseAuthToken = (authorisation: string): string | false => {
  const authParts = authorisation.match(/^BEARER ([A-Za-z0-9_-]{21})$/);
  return authParts && authParts[1] || false;
};

const authenticate = async (authToken?: string, serverID?: string): Promise<boolean> => {
  log("authToken", authToken); // TODO: Remove
  log("serverID", serverID); // TODO: Remove
  if (!authToken || !serverID) return false;

  const sanitisedAuthToken = sanitiseAuthToken(authToken);
  log("sanitisedAuthToken", sanitisedAuthToken); // TODO: Remove
  if (!sanitisedAuthToken) return false;

  const authedServerID = await dbase.getServerID(sanitisedAuthToken)
    .catch(error);
  log("authedServerID", authedServerID); // TODO: Remove

  if (authedServerID === serverID) return true;

  return false;
};

export default authenticate;
