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
   itemSelected: async function itemSelected(client, interaction) {
      let oldDescription = interaction.message.embeds[0]['description'];
      var newListOptions = [];
      var splitList = oldDescription.split('\n');
      splitList.pop();
      splitList.pop();
      var newEmbedList = [];
      var checkCount = 0;
      for (var s in splitList) {
         let listLabel = interaction.message.components[0]['components'][0]['data']['options'][s]['label'];
         let listValue = interaction.message.components[0]['components'][0]['data']['options'][s]['value'];
         var splitLine = splitList[s].split(' ');
         let listItem = splitList[s].replace(`${splitLine[0]} `, '');
         if (listItem != interaction.values[0].replace('✅ ','').replace('✖️ ','')) {
            newEmbedList.push(splitList[s]);
            if (splitList[s].includes('✅')) {
               checkCount++;
            }
            newListOptions.push({
               label: listLabel,
               value: listValue
            });
         } else {
            if (splitList[s].includes('✅')) {
               newEmbedList.push(splitList[s].replace('✅', '✖️'));
               newListOptions.push({
                  label: listLabel.replace('✅ ', ''),
                  value: listValue
               });
            } else {
               newEmbedList.push(splitList[s].replace('✖️', '✅'));
               newListOptions.push({
                  label: `✅ ${listLabel}`,
                  value: listValue
               });
               checkCount++;
            }
         }
      } //End of s loop
      let colors = colormap({
         colormap: 'hsv',
         nshades: 300,
         format: 'hex',
         alpha: 1
      });
      let finishedButton = new ButtonBuilder().setCustomId(`ChecklistBot~markFinished~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Finish').setStyle(ButtonStyle.Success);
      let editButton = new ButtonBuilder().setCustomId(`ChecklistBot~editChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Edit').setStyle(ButtonStyle.Primary);
      let cancelButton = new ButtonBuilder().setCustomId(`ChecklistBot~cancelChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Delete').setStyle(ButtonStyle.Danger);
      let buttonRow = new ActionRowBuilder().addComponents(finishedButton).addComponents(editButton).addComponents(cancelButton);
      var newEmbed = new EmbedBuilder().setTitle(interaction.message.embeds[0]['title']).setDescription(`${newEmbedList.join('\n')}\n\n*Checklist updated <t:${moment().format('X')}:R>*`);
      let componentList = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`ChecklistBot~select~${interaction.user.username}~${interaction.user.discriminator}`).setPlaceholder('Select Completed Items').addOptions(newListOptions));
      if (checkCount == splitList.length) {
         newEmbed.setColor('2DD900');
         newEmbed.setDescription(newEmbed.data.description.replace('Checklist updated', 'Checklist completed'));
         await interaction.update({
            embeds: [newEmbed],
            components: []
         }).catch(console.error);
      } else {
         let colorNum = Math.round(checkCount * (100 / splitList.length));
         newEmbed.setColor(colors[colorNum]);
         await interaction.update({
            embeds: [newEmbed],
            components: [componentList, buttonRow]
         }).catch(console.error);
      }
   }, //End of itemSelected()


   finishChecklist: async function finishChecklist(client, interaction) {
      let oldDescription = interaction.message.embeds[0]['description'];
      var splitList = oldDescription.split('\n');
      splitList.pop();
      splitList.pop();
      var newEmbedList = [];
      for (var s in splitList) {
         if (splitList[s].startsWith('✅')) {
            newEmbedList.push(splitList[s]);
         } else {
            newEmbedList.push(splitList[s].replace('✖️', '✅'));
         }
      } //End of s loop
      var newEmbed = new EmbedBuilder().setTitle(interaction.message.embeds[0]['title']).setColor('2DD900').setDescription(`${newEmbedList.join('\n')}\n\n*Checklist completed <t:${moment().format('X')}:R>*`);
      await interaction.update({
         embeds: [newEmbed],
         components: []
      }).catch(console.error);
   }, //End of finishChecklist()


   editChecklist: async function editChecklist(client, interaction) {
      let oldDescription = interaction.message.embeds[0]['description'];
      var splitList = oldDescription.split('\n');
      splitList.pop();
      splitList.pop();
      let checklistModal = new ModalBuilder()
         .setCustomId('ChecklistBot~modal~edit')
         .setTitle(`Edit ${interaction.message.embeds[0]['title']}`);
      let checklistName = new TextInputBuilder()
         .setCustomId('checklistName')
         .setLabel("Rename checklist")
         .setStyle(TextInputStyle.Short)
         .setRequired(true)
         .setValue(interaction.message.embeds[0]['title']);
      let checklistList = new TextInputBuilder()
         .setCustomId('checklistList')
         .setLabel("Edit checklist items")
         .setStyle(TextInputStyle.Paragraph)
         .setRequired(true)
         .setValue(splitList.join('\n').replaceAll('✖️ ', ''));
      const firstActionRow = new ActionRowBuilder().addComponents(checklistName);
      const secondActionRow = new ActionRowBuilder().addComponents(checklistList);
      checklistModal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(checklistModal).catch(console.error);
   }, //End of editChecklist()
}