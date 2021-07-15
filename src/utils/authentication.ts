import { nanoid } from "nanoid";
import Database from "../middleware/Database";
import { error, info, success } from "./log";

const dbase = new Database();

export const generateAuthToken = (): string => {
  return nanoid(21);
};

export const sanitiseAuthToken = (authorisation: string): string | false => {
  const authParts = authorisation.match(/^BEARER ([A-Za-z0-9_-]{21})$/);
  return authParts && authParts[1] || false;
};

const authenticate = async (authToken?: string, serverID?: string): Promise<boolean> => {
  if (!authToken || !serverID) {
    error("missing authToken or serverID");
    return false;
  }
  const sanitisedAuthToken = sanitiseAuthToken(authToken);
  if (!sanitisedAuthToken) {
    error("un-sanitary");
    return false;
  }

  const authedServerID = await dbase.getServerID(sanitisedAuthToken)
    .catch(() => {
      return false;
    });
  // const authedServerID = row.length > 0 && row[0].server_id;
  info("authedServerID", JSON.stringify(authedServerID));
  if (Number(authedServerID) === Number(serverID)) {
    success("authed!!");
    return true;
  }

  return false;
};

export default authenticate;
