const {
   Client,
   GatewayIntentBits,
   Partials,
   Collection,
   Permissions,
   ActionRowBuilder,
   SelectMenuBuilder,
   MessageButton,
   EmbedBuilder,
   ButtonBuilder,
   ButtonStyle,
   InteractionType,
   ChannelType,
} = require('discord.js');
const client = new Client({
   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.DirectMessages],
   partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const fs = require('fs');
const moment = require('moment');
const config = require('./config/config.json');
const SlashRegistry = require('./functions/slashRegistry.js');
const NewChecklist = require('./functions/newChecklist');
const EditChecklist = require('./functions/editChecklist');

client.on('ready', async () => {
   console.log("ChecklistBot Logged In");
   //Register Slash Commands
   if (config.slashGuildIDs.length > 0) {
      SlashRegistry.registerCommands(client);
   }
}); //End of ready()

//Slash commands
client.on('interactionCreate', async interaction => {
   if (interaction.type !== InteractionType.ApplicationCommand) {
      return;
   }
   let user = interaction.user;
   if (user.bot == true) {
      return;
   }
   const command = client.commands.get(interaction.commandName);
   if (!command) {
      return;
   }
   try {
      let slashReturn = await command.execute(client, interaction);
   } catch (error) {
      console.error(error);
      await interaction.reply({
         content: 'There was an error while executing this command!',
         ephemeral: true
      }).catch(console.error);
   }
}); //End of slash commands

//List commands
client.on('interactionCreate', async interaction => {
   if (interaction.type !== InteractionType.MessageComponent) {
      return;
   }
   if (!interaction.guildId) {
      return;
   }
   var interactionID = interaction.customId;
   //Verify interaction
   if (!interactionID.startsWith('ChecklistBot~')) {
      return;
   }
   if (interactionID.startsWith(`ChecklistBot~`)) {
      let interactionSplit = interactionID.split('~');
      //Verify user
      if (interaction.user.username == interactionSplit[2] && interaction.user.discriminator == interactionSplit[3]) {
         if (interactionSplit[1] == 'select') {
            EditChecklist.itemSelected(client, interaction);
         } else if (interactionSplit[1] == 'premadeSelected') {
            NewChecklist.modalChecklistPremade(client, interaction);
         } else if (interactionSplit[1] == 'markFinished') {
            EditChecklist.finishChecklist(client, interaction);
         } else if (interactionSplit[1] == 'editChecklist') {
            EditChecklist.editChecklist(client, interaction);
         } else if (interactionSplit[1] == 'cancelChecklist') {
            await interaction.message.delete().catch(console.error);
         }
      } //End of verified user
   } //End of ChecklistBot~
}); //End of interactionCreate()

//Modal Interactions
client.on('interactionCreate', async interaction => {
   if (!interaction.isModalSubmit()) return;
   if (!interaction.guildId) {
      return;
   }
   var interactionID = interaction.customId;
   if (!interactionID.startsWith('ChecklistBot~modal~')) {
      return;
   }
   interactionID = interactionID.replace('ChecklistBot~modal~', '');
   if (interactionID == 'new') {
      NewChecklist.createCustomChecklist(client, interaction, 'new');
   }
   else if (interactionID == 'edit') {
      NewChecklist.createCustomChecklist(client, interaction, 'edit');
   }
   else if (interactionID == 'premade') {
      NewChecklist.createCustomChecklist(client, interaction, 'premade');
   }
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.login(config.token);