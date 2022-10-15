# ChecklistBot

## About
Discord bot for creating checklists

Join the Discord server for any help and to keep up with updates: https://discord.gg/USxvyB9QTz
  
 
  
  
## Requirements
1: Node 16+ installed on server

2: Discord bot with:
  - Server Members Intent
  - Message Content Intent
  - Read/write perms in channels
  
 
  
  
## Install
```
git clone https://github.com/RagingRectangle/ChecklistBot.git
cd ChecklistBot
cp -r config.example config
npm install
```  
 
  
  

## Config Setup
- **token:** Discord bot token.
- **slashGuildIDs:** List of guild IDs where commands should be registered.
- **checklistCommand:** Name of slash command.
 
  

  
## Premade Checklist Setup
- Config file: */config/checklists.json*
- Fill out the name for the checklist and an array of the items to be included.
 
  
  

## Usage
- Start the bot in a console with `node checklist.js`
- Can (*should*) use PM2 to run instead with `pm2 start checklist.js`
- Begin by typing `/<checklistCommand>` and select `custom` or `premade`.
- Fill out or confirm that everything looks good on the popop response.
- Use the dropdown list to mark items as completed (or unmark them).
- The `Finish` button will complete the checklist.
- The `Edit` button allows you to rename the checklist and add/remove any items.
- The `Delete` button will delete the entire message.




## Screenshots
###### Create Custom Checklists:
![custom](https://i.imgur.com/e9uK4zj.png)
###### Mark Off Completed Items:
![Scripts](https://i.imgur.com/YrMzjEn.png)
###### Edit Checklists:
![Links](https://i.imgur.com/H6GbaLS.png)
###### Sample:
![Links](https://media.giphy.com/media/SM06qTChdII9IU7VT4/giphy.gif)