/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { FluxDispatcher, UserStore } from "@webpack/common";

const MessageActions = findByPropsLazy("deleteMessage", "editMessage");
const MessageCreator = findByPropsLazy("createMessage", "sendMessage");

const settings = definePluginSettings({
    secondsDelay: {
        type: OptionType.SELECT,
        description: "Enable delete on click while holding backspace",
        options: [
            { value: 1, label: "1" },
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 20, label: "20" },
            { value: 25, label: "25" },
            { value: 30, label: "30" },
            { value: 35, label: "35" },
            { value: 40, label: "40" },
            { value: 45, label: "45" },
            { value: 50, label: "50" },
            { value: 55, label: "55" },
            { value: 60, label: "60" },
        ],
        default: 10,
    },
    guildIds: {
        type: OptionType.STRING,
        description:
            "Guild IDs to enable auto delete. You have to separate the guild ID and the delay with a colon, and separate each pair with a comma. Example: '1234567890:10,0987654321:5,5432109876'. If you don't specify a delay, it will use the default delay.",
    },
    channelIds: {
        type: OptionType.STRING,
        description:
            "Channel IDs to enable auto delete. You have to separate the channel ID and the delay with a colon, and separate each pair with a comma. Example: '1234567890:10,0987654321:5,5432109876'. If you don't specify a delay, it will use the default delay.",
    },
});

export default definePlugin({
    name: "AutoDeleteMessages",
    description:
        "Auto delete messages after a certain time with guild or channel filter. If the message is edited or deleted before the time, it won't be deleted.",
    authors: [{ name: "diezou", id: 481850711072571393n }],

    settings,

    start() {
        this.onMessage = (e) => {
            // Check if the message is from the current user, is optimistic, or is sending to get only the messages that are really sent by the current user and not just created
            if (
                !e.message ||
                !e.message.author ||
                e.message.author.id !== UserStore.getCurrentUser().id ||
                e.optimistic ||
                e.message.state === "SENDING"
            )
                return;

            // Get the delay from the settings
            const delaySettings = settings.store.secondsDelay
                ? settings.store.secondsDelay * 1000
                : 10000;
            // Parse settings to get the guild or channel IDs and their respective delays
            const parseSettings = (ids) =>
                ids?.split(",").map((pair) => {
                    const [id, delay] = pair
                        .split(":")
                        .map((item) => item.trim());
                    return {
                        id,
                        delay: delay ? parseInt(delay) * 1000 : delaySettings,
                    };
                }) || [];

            // Get the guild and channel settings and parse them
            const guildSettings = parseSettings(settings.store.guildIds);
            const channelSettings = parseSettings(settings.store.channelIds);

            // Get the guild and channel IDs from the settings
            const guildIds = guildSettings.map((setting) => setting.id);
            const channelIds = channelSettings.map((setting) => setting.id);

            // Check if the message is from a guild or channel that is in the settings
            if (
                !e.message.guild_id &&
                !channelIds.includes(e.message.channel_id)
            )
                return;
            if (e.message.guild_id && !guildIds.includes(e.message.guild_id))
                return;

            // Determine the delay for the message
            // If the message is from a channel in a guild, use the channel delay if it exists, otherwise use the guild delay if it exists, otherwise use the default delay
            // If the message is from a channel not in a guild, use the channel delay if it exists, otherwise use the default delay
            const delay = channelIds.includes(e.message.channel_id)
                ? channelSettings.find(
                      (setting) => setting.id === e.message.channel_id
                  )?.delay
                : guildIds.includes(e.message.guild_id)
                ? guildSettings.find(
                      (setting) => setting.id === e.message.guild_id
                  )?.delay
                : delaySettings;

            // Delete the message after the delay
            setTimeout(() => {
                MessageActions.deleteMessage(
                    e.message.channel_id,
                    e.message.id
                );
            }, delay);
        };

        // Subscribe to the message creation event
        FluxDispatcher.subscribe("MESSAGE_CREATE", this.onMessage);
    },

    stop() {
        // Unsubscribe from the message creation event
        FluxDispatcher.unsubscribe("MESSAGE_CREATE", this.onMessage);
    },
});
