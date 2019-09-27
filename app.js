const moment = require("moment");

const levelMap = {
    1: "nudge",
    2: "warning",
    3: "notice",
};

function sendReminders(data) {
    const today = moment(new Date());
    const potentials = [];
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
        let hasMessages = potentials.filter(item => item.type === "message");
        if (hasMessages.length) {
            const highest = findHighestLevel(hasMessages);
            hasMessages = hasMessages.filter(item => item.level === highest);
            const reminder = buildReminderObject(hasMessages);
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
        } else {
            const highest = findHighestLevel(potentials);
            const filteredByHighest = potentials.filter(item => item.level === highest);
            const reminder = buildReminderObject(filteredByHighest);
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
        }
    });
    return allReminders;
}

function findBatchTime(reminder) {
    const hour = moment(reminder.originallyReceived).hour();
    if (hour > 12 && hour - 12 >= 3) {
        return "evening";
    } else if ((hour > 12 && hour - 12 < 3) || hour === 12) {
        return "noon";
    } else if (hour < 12 && 12 - hour >= 3) {
        return "noon";
    } else if (hour < 12 && 12 - hour < 3) {
        return "morning";
    }
}

function findHighestLevel(potentials) {
    let highest = 0;
    for (let i = 0; i < potentials.length; i++) {
        const current = potentials[i];
        if (current.level > highest) {
            highest = current.level;
        }
    }
    return highest;
}

function findPotentials(candidate, pendingItem, today) {
    const diff = today.diff(moment(pendingItem.received), "days") + 1;
    if (diff > 0) {
        const hasReminder = candidate.pastReminders[pendingItem.schoolName];
        if (hasReminder) {
            if (hasReminder.level === "nudge") {
                const diff = today.diff(moment(hasReminder.originallyReceived), "days") + 1;
                if (diff > 3) {
                    return {
                        ...pendingItem,
                        level: 2,
                        candidateName: candidate.candidateName,
                    }
                }
            }
            if (hasReminder.level === "warning") {
                const diff = today.diff(moment(hasReminder.originallyReceived), "days") + 1;
                if (diff > 7) {
                    return {
                        ...pendingItem,
                        level: 3,
                        candidateName: candidate.candidateName,
                    }
                }
            }
        }
        if (diff < 3) {
            return {
                ...pendingItem,
                level: 1,
                candidateName: candidate.candidateName,
            }   
        }
        if (diff >= 3 && diff <= 7) {
            return {
                ...pendingItem,
                level: 2,
                candidateName: candidate.candidateName,
            }
        }
        if (diff > 7) {
            return {
                ...pendingItem,
                level: 3,
                candidateName: candidate.candidateName,
            }
        }
    }
}

function buildReminderObject(items) {
    return items.reduce((acc, current) => {
        if (acc.to) {
            acc.from.push(current.schoolName);
            if (moment(current.received).get("hour") > moment(acc.originallyReceived).get("hour")) {
                acc.originallyReceived = current.received;
            }
            return acc;
        } else {
            return {
                to: current.candidateName,
                from: [current.schoolName],
                type: current.type,
                level: levelMap[current.level],
                originallyReceived: current.received,
            }
        }
    }, {});
}

module.exports = {
    sendReminders,
}