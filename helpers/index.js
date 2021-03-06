const moment = require("moment");

const levelMap = {
    1: "nudge",
    2: "warning",
    3: "notice",
};


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
    findBatchTime,
    findHighestLevel,
    findPotentials,
    buildReminderObject,
}