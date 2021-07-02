import Database from "../middleware/Database";

const dbase = new Database();

export const sanitiseAuthToken = (authorisation: string): string | false => {
  const authParts = authorisation.match(/^BASIC ([A-Za-z0-9_-]{21})$/);
  return authParts && authParts[1] || false;
};

const authenticate = (authToken?: string, serverID?: string): boolean => {
  if (!authToken || !serverID) {
    return false;
  }
  const sanitisedAuthToken = sanitiseAuthToken(authToken);
  if (!sanitisedAuthToken) {
    return false;
  }

  const authedServerID = dbase.getServerID(sanitisedAuthToken);
  if (Number(authedServerID) === Number(serverID)) {
    return true;
  }

  return false;
};

export default authenticate;
