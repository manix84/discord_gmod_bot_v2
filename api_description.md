# Security considerations:

## During linking process:
A malicious server should not be able to abuse the token to link an arbitrary account. This only applies if Steam and Discord account are paired cross-server
Example:
 - A user requests an account sync token for a server
 - Token gets sent via Discord
 - They enter the token on the malicious TTT server
 - The malicious TTT server reports an incorrect Steam-id, creating an incorrect account  sync  

There's technically no harm in this, as the user could simply re-sync their accounts at any time. Tokens should be one-time-use. All this would do is to create an incorrect account connection, meaning that to the user the muting doesn't appear functional (unless the server *always* reports the same incorrect Steam ID, in which case it would just not work on other servers and they'd have to re-sync).  

Mitigation:
 - Account linking is per-server, unless done on an "official"/"known good" server (e.g. hosted by us).
 - Account linking is always per-server
 - Add an option to allow the user to turn on/off per-guild/global account linking

## Account correlation:
A malicious actor could find the Discord account or Steam account connected to the contrary.
Example:
 - A POST request to mute a user is sent
 - They observe which user gets muted by the bot  

Mitigation:
 - None?  

Implications:
 - A malicious actor could relate a Steam account and a Discord account to each other. This was already possible before.

# Database structure:
### Server object
  - UID
  - Authentication Token
  - Discord server ID
  - Discord channel ID

### User object
  - Discord ID
  - Steam ID
  - Token to sync accounts
  - Muted (list of):
    - ServerID
    - Timestamp until

Additional info not in database but relevant:
### User object:
  - Muted status (fetched from Discord when needed)

# API:
### GET /
  - 204
  - Can e.g. be used to check if the host is reachable and functioning
  
### GET /servers/
  - 200(debugging)/204(production), 403
  - List of all server IDs, only with debugging mode enabled. Returns no data in production.

### GET UNAUTHED /servers/$UID
  - 200: Server UID exists
  - 404: Server UID doesn't exist

### GET AUTHED /servers/$UID
  - 200: Miscellainous server statistics (e.g. amount of connected users, map, ... - Could be used for e.g. an embed or similar, just brainstorming here)
  - 403: Invalid Token
  - 404: Server UID doesn't exist

### Requests with authentication
All of the following will return a:
 - 400 if the request is malformed.
 - 401 if the authentication header is missing or malformed.
 - 403 if the authentication details are invalid, or the server requests data it is not authorized for.
 - 404 if the server ID is unknown.
Conflict with errors 403/404:
> An unknown server can never have valid credentials. A 404 therefor must always cause a 403. I recommend for the 404 to take precedence, to allow for this distinction to be made.
> If the 403 takes precedence, it would be impossible to encounter a 404, requiring a second request to the /servers/\$UID endpoint to distinguish the errors.

### GET /servers/$UID/ttt/
  - 200: Miscellanious statistics about the TTT server

### GET /servers/$UID/ttt/users
  - 200: List of user objects that are currently connected to the ttt server

### GET /servers/\$UID/ttt/users/\$Steam_ID
  - 200: A (partial) user object (Discord ID and muted status excluded unless the user is currently connected to the voicechat. See security considerations.)

### POST /servers/\$UID/ttt/users/\$Steam_ID
  - 200: If the user is not currently connected, the database will be updated accordingly and the mute status applied when the user joins VC. Returns the updated user object

Example payload:
```json
// Dedicated "action" tag, allows to potentially add more actions later on
{"action":"mute", "reason":"killed", "duration":-1}
{"action":"mute", "reason":"killed", "duration":120}
{"action":"unmute", "reason":"end of round"}
// Alternatively deducting the action from the duration, 0 meaning unmute:
{"reason":"killed", "duration":-1}
{"reason":"killed", "duration":120}
{"reason":"end of round", "duration":0}
```
*Alternative option for responses (I don't really like this though):*
### POST /servers/\$UID/ttt/users/\$Steam_ID

  - 200: If the user is currently connected to the voicechat. Returns the updated user object
  - 409/422/500/503 (?): If the user is not currently connected to the voicechat  
  Technically any of the status codes would work, we just gotta choose one:
    - 409: Conflict - The request was made with an assertion that is (no longer) true: TTT server assumes that the user is in VC, but the user is not connected.
    - 422: Unprocessable entity - The request made cannot be processed, but it was not malformed. I'd personally prefer the other status codes (especially as this is meant for WebDAV).
    - 500: Internal server error - Generic internal server error. Would rather use a dedicated code for this, than the generic 500
    - 503: Service unavailable - While the user is not connected to the voicechat, this is not available.  

Example payload:
```json
// Dedicated "action" tag, allows to potentially add more actions later on
{"action":"mute", "reason":"killed", "duration":-1}
{"action":"mute", "reason":"killed", "duration":120}
{"action":"unmute", "reason":"end of round"}
// Alternatively deducting the action from the duration, 0 meaning unmute:
{"reason":"killed", "duration":-1}
{"reason":"killed", "duration":120}
{"reason":"end of round", "duration":0}
```
*Generally I'd prefer the first approach here, as it is more robust, and also prevents a user from avoiding a mute by disconnecting from the voicechat before the mute getting applied.*

### GET /servers/\$UID/discord/
  - 200: Miscellanious statistics about the Discord voicechat

### GET /servers/\$UID/discord/users/
  - 200: List of (partial) user objects that are currently connected to the Discord voicechat. Steam_IDs are exluded unless the users have been seen on the server before (see next for security considerations).

### GET /servers/\$UID/discord/users/\$Discord_ID
  - 200: A (partial) user object (Steam ID excluded unless the user was previously connected to the TTT server before. See security considerations.)
  -> This would require to keep track of which servers a user has joined before, but I find this sensible to prevent harvesting Steam+Discord ID connections. A ratelimit should be imposed on registering users for a server (e.g. max 100 unique steam IDs per 72h period, and max 100 unique concurrent IDs by doing a rolling append). Possibly have to implement a user-API key to make circumventing this more difficult/impossible

### POST /servers/\$UID/discord/users/\$Discord_ID
  - 200: If the user is not currently connected, the database will be updated accordingly and the mute status applied when the user joins VC. Returns the updated user object

Example payload:
```json
// Dedicated "action" tag, allows to potentially add more actions later on
{"action":"mute", "reason":"killed", "duration":-1}
{"action":"mute", "reason":"killed", "duration":120}
{"action":"unmute", "reason":"end of round"}
// Alternatively deducting the action from the duration, 0 meaning unmute:
{"reason":"killed", "duration":-1}
{"reason":"killed", "duration":120}
{"reason":"end of round", "duration":0}
```
*Alternative option for responses (I don't really like this though):*
### POST /servers/\$UID/discord/users/\$Discord_ID

  - 200: If the user is currently connected to the voicechat. Returns the updated user object
  - 409/422/500/503 (?): If the user is not currently connected to the voicechat  
  Technically any of the status codes would work, we just gotta choose one:
    - 409: Conflict - The request was made with an assertion that is (no longer) true: TTT server assumes that the user is in VC, but the user is not connected.
    - 422: Unprocessable entity - The request made cannot be processed, but it was not malformed. I'd personally prefer the other status codes (especially as this is meant for WebDAV).
    - 500: Internal server error - Generic internal server error. Would rather use a dedicated code for this, than the generic 500
    - 503: Service unavailable - While the user is not connected to the voicechat, this is not available.  

Example payload:
```json
// Dedicated "action" tag, allows to potentially add more actions later on
{"action":"mute", "reason":"killed", "duration":-1}
{"action":"mute", "reason":"killed", "duration":120}
{"action":"unmute", "reason":"end of round"}
// Alternatively deducting the action from the duration, 0 meaning unmute:
{"reason":"killed", "duration":-1}
{"reason":"killed", "duration":120}
{"reason":"end of round", "duration":0}
```
*Generally I'd prefer the first approach here, as it is more robust, and also prevents a user from avoiding a mute by disconnecting from the voicechat before the mute getting applied.*

