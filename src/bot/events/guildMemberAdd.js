'use strict';

//---------------------------------------------------------------------------------------------------------------//

const { Timer } = require('../../utilities.js');
const { go_mongo_db } = require('../../mongo/mongo.js');
const { Discord, client } = require('../discord_client.js');

//---------------------------------------------------------------------------------------------------------------//

module.exports = {
    name: 'guildMemberAdd',
    async handler(member) {
        const [ db_user_data ] = await go_mongo_db.find(process.env.MONGO_DATABASE_NAME, process.env.MONGO_USERS_COLLECTION_NAME, {
            '_id': member.id,
        });

        if (!db_user_data) return; // don't continue if they aren't in the database

        /* fetch an up-to-date copy of the products and their info */
        const db_roblox_products = await go_mongo_db.find(process.env.MONGO_DATABASE_NAME, process.env.MONGO_PRODUCTS_COLLECTION_NAME, {});

        /* iterate over all products in the user (includes non-owned products) */
        for (const [ product_code, user_owns_product ] of Object.entries(db_user_data.products ?? {})) {
            console.log(`${member.displayName}`, { product_code, user_owns_product });

            /* find the product info from the recently fetched products */
            const product = db_roblox_products.find(product => product.code === product_code);

            /* give the user the role for the product if they own it */
            if (user_owns_product) {
                await member.roles.add(product.discord_role_id).catch(console.warn);
            }

            await Timer(1_000); // prevent api abuse
        }
    },
};