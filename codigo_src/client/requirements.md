## Packages
use-debounce | For debouncing auto-saves on the character sheet
nanoid | For generating unique IDs for powers on the client

## Notes
The `isMaskActive` state toggles a `.mask-mode` class on the character sheet container, which switches CSS variables from gold to red and applies visual effects.
Buffs from Mask Mode are calculated purely on the frontend for display and are NOT saved to the backend database to preserve base stats.
