const moment = require("moment");
const { findBatchTime, findHighestLevel, findPotentials, buildReminderObject } = require("./helpers");
 
function sendReminders(data) {
    const today = moment(new Date());
    let potentials = [];
    const allReminders = {
        morning: [],
        noon: [],
        evening: [],
    };
    data.forEach(candidate => {
        candidate.pendingItems.forEach(pendingItem => {
            const potentialItem = findPotentials(candidate, pendingItem, today);
            if (potentialItem) {
                potentials.push(potentialItem);
            }
        });
        let messages = potentials.filter(item => item.type === "message");
        let itemsToFilter = [];
        if (messages.length) {
            itemsToFilter = messages;
        } else {
            itemsToFilter = potentials;
        }
        const highest = findHighestLevel(itemsToFilter);
        const filteredItems = itemsToFilter.filter(item => item.level === highest);
        const reminder = buildReminderObject(filteredItems);
        if (candidate.lastReminderDate) {
            const diffSinceLastReminder = today.diff(moment(candidate.lastReminderDate), "days");
            if (diffSinceLastReminder > 1) {
                allReminders[findBatchTime(reminder)].push({
                    to: reminder.to,
                    from: reminder.from,
                    type: reminder.type,
                    level: reminder.level,
                });
            }
        } else {
            allReminders[findBatchTime(reminder)].push({
                to: reminder.to,
                from: reminder.from,
                type: reminder.type,
                level: reminder.level,
            });
        }
    });
    return allReminders;
}

module.exports = {
    sendReminders,
}