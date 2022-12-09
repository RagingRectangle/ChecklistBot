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
         let listNumber = s < 25 ? 0 : s < 50 ? 1 : s < 75 ? 2 : 3;
         let itemNumber = s < 25 ? s : s < 50 ? s - 25 : s < 75 ? s - 50 : s - 75;
         let listLabel = interaction.message.components[listNumber]['components'][0]['data']['options'][itemNumber]['label'];
         let listValue = interaction.message.components[listNumber]['components'][0]['data']['options'][itemNumber]['value'];
         var splitLine = splitList[s].split(' ');
         let listItem = splitList[s].replace(`${splitLine[0]} `, '');
         if (listItem != interaction.values[0].replace('✅ ', '').replace('✖️ ', '')) {
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
      var embedComponents = [];
      let dropdownsNeeded = Math.min(4, Math.ceil(newListOptions.length / 25));
      var optionCount = 0;
      for (var d = 0; d < dropdownsNeeded; d++) {
         var listOptions = [];
         for (var i = 0; i < 25 && optionCount < newListOptions.length; i++, optionCount++) {
            listOptions.push(newListOptions[optionCount]);
         } //End of i loop
         let dropdown = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`ChecklistBot~select~${interaction.user.username}~${interaction.user.discriminator}~${d}`).setPlaceholder('Select Completed Items').addOptions(listOptions));
         embedComponents.push(dropdown);
      } //End of d loop
      let finishedButton = new ButtonBuilder().setCustomId(`ChecklistBot~markFinished~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Finish').setStyle(ButtonStyle.Success);
      let restartButton = new ButtonBuilder().setCustomId(`ChecklistBot~restartChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Restart').setStyle(ButtonStyle.Success);
      let editButton = new ButtonBuilder().setCustomId(`ChecklistBot~editChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Edit').setStyle(ButtonStyle.Primary);
      let cancelButton = new ButtonBuilder().setCustomId(`ChecklistBot~cancelChecklistVerify~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Delete').setStyle(ButtonStyle.Danger);
      var newEmbed = new EmbedBuilder().setTitle(interaction.message.embeds[0]['title']).setDescription(`${newEmbedList.join('\n')}\n\n*Checklist updated <t:${moment().format('X')}:R>*`);
      //Checklist finished
      if (checkCount == splitList.length) {
         newEmbed.setColor('2DD900');
         newEmbed.setDescription(newEmbed.data.description.replace('Checklist updated', 'Checklist completed'));
         let finishedButtonRow = new ActionRowBuilder().addComponents(restartButton).addComponents(editButton).addComponents(cancelButton);
         embedComponents = [finishedButtonRow];
      }
      //Checklist not finished
      else {
         let colorNum = Math.round(checkCount * (100 / splitList.length));
         let notFinishedButtonRow = new ActionRowBuilder().addComponents(finishedButton).addComponents(editButton).addComponents(cancelButton);
         embedComponents.push(notFinishedButtonRow);
         newEmbed.setColor(colors[colorNum]);
      }
      await interaction.update({
         embeds: [newEmbed],
         components: embedComponents
      }).catch(console.error);
   }, //End of itemSelected()


   restartChecklist: async function restartChecklist(client, interaction) {
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
         .setValue(splitList.join('\n').replaceAll('✅ ', ''));
      const firstActionRow = new ActionRowBuilder().addComponents(checklistName);
      const secondActionRow = new ActionRowBuilder().addComponents(checklistList);
      checklistModal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(checklistModal).catch(console.error);
   }, //End of restartChecklist()


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
      let restartButton = new ButtonBuilder().setCustomId(`ChecklistBot~restartChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Restart').setStyle(ButtonStyle.Success);
      let editButton = new ButtonBuilder().setCustomId(`ChecklistBot~editChecklist~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Edit').setStyle(ButtonStyle.Primary);
      let cancelButton = new ButtonBuilder().setCustomId(`ChecklistBot~cancelChecklistVerify~${interaction.user.username}~${interaction.user.discriminator}`).setLabel('Delete').setStyle(ButtonStyle.Danger);
      let buttonRow = new ActionRowBuilder().addComponents(restartButton).addComponents(editButton).addComponents(cancelButton);
      await interaction.update({
         embeds: [newEmbed],
         components: [buttonRow]
      }).catch(console.error);
   }, //End of finishChecklist()


   cancelChecklist: async function cancelChecklist(client, interaction, type) {
      //Verify deleting checklist
      if (type == 'Verify') {
         var checklistModal = new ModalBuilder()
            .setCustomId(`ChecklistBot~modal~verifyDelete`)
            .setTitle(`Delete "${interaction.message.embeds[0]['title']}"?`);
         let verifyTitle = new TextInputBuilder()
            .setCustomId('verifyTitle')
            .setLabel("Enter checklist name to delete")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(``);
         let firstActionRow = new ActionRowBuilder().addComponents(verifyTitle);
         checklistModal.addComponents(firstActionRow);
         await interaction.showModal(checklistModal).catch(console.error);
      }
      //Check if title matches
      else if (type == 'verifyDelete') {
         try {
            let realTitle = interaction.message.embeds[0]['title'].toLowerCase();
            let userTitle = interaction.fields.getTextInputValue('verifyTitle').toLowerCase();
            //Titles match - delete
            if (realTitle == userTitle) {
               await interaction.deferReply();
               await interaction.deleteReply();
               await interaction.message.delete().catch(console.error);
            }
            //Titles don't match - ignore
            else {
               return;
            }
         } catch (err) {
            console.log("Delete checklist error:", err);
         }
      }
   }, //End of cancelChecklist()


   editChecklist: async function editChecklist(client, interaction) {
      let oldDescription = interaction.message.embeds[0]['description'];
      var splitList = oldDescription.split('\n');
      splitList.pop();
      splitList.pop();
      var checklistModal = new ModalBuilder()
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
      let firstActionRow = new ActionRowBuilder().addComponents(checklistName);
      let secondActionRow = new ActionRowBuilder().addComponents(checklistList);
      checklistModal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(checklistModal).catch(console.error);
   }, //End of editChecklist()
}