const sanitiseAuthToken = (authorisation: string): string | false => {
  const authParts = authorisation.match(/^BASIC ([A-Za-z0-9_-]{21})$/);
  return authParts && authParts[1] || false;
};

export default sanitiseAuthToken;
