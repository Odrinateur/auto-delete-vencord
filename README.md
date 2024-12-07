# Auto Delete Messages

A Vencord plugin that automatically deletes your messages in specified servers and channels after a delay. The plugin will only work in servers and channels that you explicitly configure.

## Settings

-   **Default Delay**: The time in seconds to wait before deleting messages (applies when no specific delay is set)
-   **Guild Settings**: Configure delays for specific servers using the format `serverID:seconds`
-   **Channel Settings**: Configure delays for specific channels using the format `channelID:seconds`

## Configuration Example

Set multiple IDs with their delays by separating them with commas. Each entry should follow this format:

-   For servers: `serverID:seconds`
-   For channels: `channelID:seconds`

Example: `1234567890:10,0987654321:5,5432109876` and default delay set to 15 seconds
In this example:

-   Messages in server/channel 1234567890 will be deleted after 10 seconds
-   Messages in server/channel 0987654321 will be deleted after 5 seconds
-   Messages in server/channel 5432109876 will be deleted after 15 seconds (default delay)

## Important Note

The plugin will only delete messages in the servers and channels you have configured. Messages in other locations will not be affected.

## Author

-   **diezou** (ID: 481850711072571393)
