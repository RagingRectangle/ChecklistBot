const {
   Client,
   GatewayIntentBits,
   Partials,
   Collection,
   Permissions,
   ActionRowBuilder,
   SelectMenuBuilder,
   MessageButton,
   ModalBuilder,
   EmbedBuilder,
   ButtonBuilder,
   ButtonStyle,
   InteractionType,
   TextInputStyle,
   TextInputBuilder,
   ChannelType
} = require('discord.js');

const colormap = require('colormap');
const fs = require('fs');
const moment = require('moment');
const config = require('../config/config.json');
const premades = require('../config/checklists.json');

module.exports = {
   createCustomChecklist: async function createCustomChecklist(client, interaction, type) {
      let checklistName = interaction.fields.getTextInputValue('checklistName');
      let modalListText = interaction.fields.getTextInputValue('checklistList');
      var userList = modalListText.split('\n');
      var selectListOptions = [];
      var embedList = [];
      for (var u in userList) {
         if (userList[u] == '') {
            continue;
         }
         selectListOptions.push({
            label: userList[u],
            value: userList[u]
         });
         if (userList[u].startsWith('✅')) {
            embedList.push(`${userList[u]}`);
         } else {
            embedList.push(`✖️ ${userList[u]}`);
         }
      } //End of u loop
      var customEmbed = new EmbedBuilder().setTitle(checklistName);
      let componentList = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`ChecklistBot~select~${interaction.user.username}~${interaction.user.discriminator}`).setPlaceholder('Select Completed Items').addOptions(selectListOptions));
      let finishedButton = new ButtonBuilder().setCustomId(`ChecklistBot~markFinished~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Finish').setStyle(ButtonStyle.Success);
      let editButton = new ButtonBuilder().setCustomId(`ChecklistBot~editChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Edit').setStyle(ButtonStyle.Primary);
      let cancelButton = new ButtonBuilder().setCustomId(`ChecklistBot~cancelChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Delete').setStyle(ButtonStyle.Danger);
      let buttonRow = new ActionRowBuilder().addComponents(finishedButton).addComponents(editButton).addComponents(cancelButton);
      if (type == 'new') {
         customEmbed.setColor('B30000').setDescription(`${embedList.join('\n')}\n\n*Checklist started <t:${moment().format('X')}:R>*`)
         await interaction.reply({
            embeds: [customEmbed],
            components: [componentList, buttonRow]
         }).catch(console.error);
      } else if (type == 'premade') {
         customEmbed.setColor('B30000').setDescription(`${embedList.join('\n')}\n\n*Checklist started <t:${moment().format('X')}:R>*`)
         await interaction.update({
            embeds: [customEmbed],
            components: [componentList, buttonRow]
         }).catch(console.error);
      } else if (type == 'edit') {
         customEmbed.setDescription(`${embedList.join('\n')}\n\n*Checklist updated <t:${moment().format('X')}:R>*`).setColor(interaction.message.embeds[0]['color']);
         await interaction.update({
            embeds: [customEmbed],
            components: [componentList, buttonRow]
         }).catch(console.error);
      }
   }, //End of createCustomChecklist


   modalChecklistNew: async function modalChecklistNew(client, interaction) {
      //await interaction.deferReply();
      let checklistModal = new ModalBuilder()
         .setCustomId('ChecklistBot~modal~new')
         .setTitle('Create Custom Checklist');
      let checklistName = new TextInputBuilder()
         .setCustomId('checklistName')
         .setLabel("What's the name of your checklist?")
         .setStyle(TextInputStyle.Short)
         .setRequired(true)
         .setPlaceholder(`My Custom Checklist`);
      let checklistList = new TextInputBuilder()
         .setCustomId('checklistList')
         .setLabel("Enter checklist items")
         .setStyle(TextInputStyle.Paragraph)
         .setRequired(true)
         .setPlaceholder('Enter one checklist\nitem per line')
      const firstActionRow = new ActionRowBuilder().addComponents(checklistName);
      const secondActionRow = new ActionRowBuilder().addComponents(checklistList);
      checklistModal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(checklistModal).catch(console.error);
   }, //End of modalChecklistNew()


   selectPremadeChecklist: async function selectPremadeChecklist(client, interaction) {
      var listOptions = [];
      for (var p in premades) {
         if (premades[p]['name'] != '' && premades[p]['items'].length > 1) {
            listOptions.push({
               label: premades[p]['name'],
               value: premades[p]['name']
            });
         }
      } //End of p loop
      if (listOptions.length > 0){
         interaction.reply({
            components: [new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`ChecklistBot~premadeSelected~${interaction.user.username}~${interaction.user.discriminator}`).setPlaceholder('Select checklist').addOptions(listOptions))]
         }).catch(console.error);
      }
      else {
         interaction.reply({
            embeds: [new EmbedBuilder().setTitle(`No Premade Checklists!`).setDescription(`- Create premade checklists in \`./config/checklists.json\``)]
         }).catch(console.error);
      }
   }, //End of selectPremadeChecklist()


   modalChecklistPremade: async function modalChecklistPremade(client, interaction) {
      for (var p in premades) {
         if (premades[p]['name'] != interaction.values[0]) {
            continue;
         }
         let checklistModal = new ModalBuilder()
            .setCustomId('ChecklistBot~modal~premade')
            .setTitle(`Use premade checklist`);
         let checklistName = new TextInputBuilder()
            .setCustomId('checklistName')
            .setLabel("What's the name of your checklist?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(premades[p]['name']);
         let checklistList = new TextInputBuilder()
            .setCustomId('checklistList')
            .setLabel("Enter checklist items")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setValue(premades[p]['items'].join('\n'));
         const firstActionRow = new ActionRowBuilder().addComponents(checklistName);
         const secondActionRow = new ActionRowBuilder().addComponents(checklistList);
         checklistModal.addComponents(firstActionRow, secondActionRow);
         await interaction.showModal(checklistModal).catch(console.error);
      } //End of p loop
   }, //End of modalChecklistPremade()
}