const {
	EmbedBuilder,
	SlashCommandBuilder
} = require('discord.js');
const fs = require('fs');
const config = require('../config/config.json');
const NewChecklist = require('../functions/newChecklist.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName((config.checklistCommand).toLowerCase().replaceAll(/[^a-z0-9]/gi, '_'))
		.setDescription(`Create new checklist`)
		.addSubcommand(subcommand =>
			subcommand
			.setName('custom')
			.setDescription('Create your own checklist'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('premade')
			.setDescription('Use premade checklist')),

	async execute(client, interaction) {
		let channel = await client.channels.fetch(interaction.channelId).catch(console.error);
		let guild = await client.guilds.fetch(interaction.guildId).catch(console.error);
		if (interaction.options.getSubcommand() === 'custom') {
			NewChecklist.modalChecklistNew(client, interaction);
		} else if (interaction.options.getSubcommand() === 'premade') {
			NewChecklist.selectPremadeChecklist(client, interaction);
		}
	}, //End of execute()
};