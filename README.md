# Auto Delete Messages

This plugin for Vencord automatically deletes messages after a certain delay. You can configure specific delays for particular servers (guilds) or channels. If a message is modified or deleted before the delay expires, it will not be automatically deleted.

## Parameters

-   **secondsDelay**: Default delay in seconds before automatically deleting messages.
-   **guildIds**: IDs of servers with specific delays, formatted as follows: `id:delay`.
-   **channelIds**: IDs of channels with specific delays, formatted as follows: `id:delay`.

## Note

If you resend a message with the same content, only one message will be deleted.

## Author

-   **diezou** (ID: 1234567890)
