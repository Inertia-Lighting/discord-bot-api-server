//------------------------------------------------------------//
//    Copyright (c) Inertia Lighting, Some Rights Reserved    //
//------------------------------------------------------------//

import * as Discord from 'discord.js';

import { CustomEmbed } from '@root/common/message';

import { CustomInteraction, CustomInteractionAccessLevel, CustomInteractionRunContext } from '@root/common/managers/custom_interactions_manager';
import { generateVerificationCode } from '../../common/handlers';

//------------------------------------------------------------//

const db_database_name = `${process.env.MONGO_DATABASE_NAME ?? ''}`;
if (db_database_name.length < 1) throw new Error('Environment variable: MONGO_DATABASE_NAME; is not set correctly.');

const db_users_collection_name = `${process.env.MONGO_USERS_COLLECTION_NAME ?? ''}`;
if (db_users_collection_name.length < 1) throw new Error('Environment variable: MONGO_USERS_COLLECTION_NAME; is not set correctly.');

const bot_customer_service_role_id = `${process.env.BOT_CUSTOMER_SERVICE_ROLE_ID ?? ''}`;
if (bot_customer_service_role_id.length < 1) throw new Error('Environment variable: BOT_CUSTOMER_SERVICE_ROLE_ID; is not set correctly.');

//------------------------------------------------------------//

export default new CustomInteraction({
    identifier: 'generate_verification_code',
    type: Discord.InteractionType.ApplicationCommand,
    data: {
        type: Discord.ApplicationCommandType.ChatInput,
        description: 'Generate a code to verify someone!',
        options: [
            {
                name: 'member',
                type: Discord.ApplicationCommandOptionType.User,
                description: 'The member who you want to generate a code for.',
                required: true,
            },
        ],
    },
    metadata: {
        required_run_context: CustomInteractionRunContext.Guild,
        required_access_level: CustomInteractionAccessLevel.CustomerService,
    },
    handler: async (discord_client, interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (!interaction.inCachedGuild()) return;
        if (!interaction.channel) return;

        await interaction.deferReply({ ephemeral: false });
        const staff_member = interaction.member;
        const staff_member_is_permitted = staff_member.roles.cache.has(bot_customer_service_role_id);
        if (!staff_member_is_permitted) {
            await interaction.editReply({
                embeds: [
                    CustomEmbed.from({
                        color: CustomEmbed.Color.Violet,
                        title: 'Inertia Lighting | Identity Manager',
                        description: 'You aren\'t allowed to use this command!',
                    }),
                ],
            });

            return;
        }
        generateVerificationCode(interaction.user.id, interaction);
    },
});
