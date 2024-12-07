/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPreSendListener, removeClickListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { MessageStore, UserStore } from "@webpack/common";

const MessageActions = findByPropsLazy("deleteMessage", "editMessage");

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
        description: "Guild IDs to enable auto delete. You have to separate the guild ID and the delay with a colon, and separate each pair with a comma. Example: '1234567890:10,0987654321:5,5432109876'. If you don't specify a delay, it will use the default delay.",
    },
    channelIds: {
        type: OptionType.STRING,
        description: "Channel IDs to enable auto delete. You have to separate the channel ID and the delay with a colon, and separate each pair with a comma. Example: '1234567890:10,0987654321:5,5432109876'. If you don't specify a delay, it will use the default delay.",
    },
});

export default definePlugin({
    name: "Auto Delete Messages",
    description: "Auto delete messages after a certain time with guild or channel filter. If the message is edited or deleted before the time, it won't be deleted.",
    authors: [{ name: "diezou", id: 1234567890n }],

    settings,

    start() {
        this.preSend = addPreSendListener(async (_, message, extra) => {
            // Get the delay from the settings
            const delaySettings = settings.store.secondsDelay ? settings.store.secondsDelay * 1000 : 10000;

            // Parse settings to get the guild or channel IDs and their respective delays
            const parseSettings = ids => ids?.split(",").map(pair => {
                const [id, delay] = pair.split(":").map(item => item.trim());
                return { id, delay: delay ? parseInt(delay) * 1000 : delaySettings };
            }) || [];

            // Get the guild and channel settings and parse them
            const guildSettings = parseSettings(settings.store.guildIds);
            const channelSettings = parseSettings(settings.store.channelIds);

            // Get the guild and channel IDs from the settings
            const guildIds = guildSettings.map(setting => setting.id);
            const channelIds = channelSettings.map(setting => setting.id);

            // Check if the message is from a guild or channel that is in the settings
            if (!extra.channel.guild_id && !channelIds.includes(extra.channel.id)) return;
            if (extra.channel.guild_id && !guildIds.includes(extra.channel.guild_id)) return;

            // Determine the delay for the message
            // If the message is from a channel in a guild, use the channel delay if it exists, otherwise use the guild delay if it exists, otherwise use the default delay
            // If the message is from a channel not in a guild, use the channel delay if it exists, otherwise use the default delay
            const delay = channelIds.includes(extra.channel.id) ? channelSettings.find(setting => setting.id === extra.channel.id)?.delay
                : guildIds.includes(extra.channel.guild_id) ? guildSettings.find(setting => setting.id === extra.channel.guild_id)?.delay
                    : delaySettings;

            // Delete the message after the delay
            setTimeout(async () => {
                // Because the event is called before the message is sent, we need to get the message again to have the id (a message not sent yet doesn't have an id)
                const meId = UserStore.getCurrentUser().id;
                const messages = await MessageStore.getMessages(extra.channel.id);
                const messageToDelete = messages._array.findLast(msg => msg.author.id === meId && msg.content === message.content);

                // If the message is not found, it means it was deleted before the delay or it was edited, so we don't need to delete it
                if (messageToDelete) {
                    MessageActions.deleteMessage(extra.channel.id, messageToDelete.id);
                }
            }, delay);
        });
    },
    stop() {
        console.log("Auto delete stopped");
        removeClickListener(this.preSend);
    }
});
