
# Object structure:
### Server object
  - Discord server ID
  - Authentication Token
  - Voicechats (list of voicechat objects)

### Voicechat object
  - Discord server ID
  - List of connected users

### User object
  - Discord ID
  - Steam ID
  - ? Discord discriminated username
  - ? Steam user name
  - ? Authentication token
  - States (map):
    - Server id -> Modifiers (list)

### Modifier object
  - Type: muted / deafened
  - Until: Timestamp in ms, -1 for indefinitely
