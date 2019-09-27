const { sendReminders } = require("../app");
const mockDate = require("mockdate");

describe("testing the reminders system", () => {
    it("should send John a nudge for message from school B on Thursday in evening batch", () => {
        mockDate.set("2019-9-26");
        const inputData = [
            {
                candidateName: "John",
                pendingItems: [
                    {
                        schoolName: "A",
                        received: new Date('September 23, 2019 08:30:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "C",
                        received: new Date('September 23, 2019 12:20:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "D",
                        received: new Date('September 24, 2019 15:50:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "E",
                        received: new Date("September 24, 2019 03:55:00"),
                        type: "invite",
                    },
                    {
                        schoolName: "B",
                        received: new Date('September 24, 2019 16:22:00'),
                        type: "message",
                    }
                ],
                pastReminders: {
                    A: {
                        level: "nudge",
                        type: "invite",
                        sent: new Date("September 24, 2019"),
                        originallyReceived: new Date("September 23, 2019 08:30:00"),
                    },
                    C: {
                        level: "nudge",
                        type: "invite",
                        sent: new Date("September 24, 2019"),
                        originallyReceived: new Date("September 23, 2019 12:20:00"),
                    }
                },
                lastReminderDate: new Date("September 24, 2019")
            }
        ];

        const expectedData = {
            morning: [],
            noon: [],
            evening: [
                {
                    to: "John",
                    from: ["B"],
                    type: "message",
                    level: "nudge",
                }
            ],
        }

        expect(sendReminders(inputData)).toEqual(expectedData);
        mockDate.reset();
    });

    it("should not send John any reminders since not enough time has passed since last reminder", () => {
        mockDate.set("2019-9-25");
        const inputData = [
            {
                candidateName: "John",
                pendingItems: [
                    {
                        schoolName: "A",
                        received: new Date('September 23, 2019 08:30:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "C",
                        received: new Date('September 23, 2019 12:20:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "D",
                        received: new Date('September 24, 2019 15:50:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "E",
                        received: new Date("September 24, 2019 03:55:00"),
                        type: "invite",
                    },
                    {
                        schoolName: "B",
                        received: new Date('September 24, 2019 16:22:00'),
                        type: "message",
                    }
                ],
                pastReminders: {
                    A: {
                        level: "nudge",
                        type: "invite",
                        sent: new Date("September 24, 2019"),
                        originallyReceived: new Date("September 23, 2019 08:30:00"),
                    },
                    C: {
                        level: "nudge",
                        type: "invite",
                        sent: new Date("September 24, 2019"),
                        originallyReceived: new Date("September 23, 2019 12:20:00"),
                    }
                },
                lastReminderDate: new Date("September 24, 2019")
            }
        ];
    
        const expectedData = {
            morning: [],
            noon: [],
            evening: [],
        }
    
        expect(sendReminders(inputData)).toEqual(expectedData);
        mockDate.reset();
    });

    it("should send John a nudge about schools A and C at noon", () => {
        mockDate.set("2019-9-24");
        const inputData = [
            {
                candidateName: "John",
                pendingItems: [
                    {
                        schoolName: "A",
                        received: new Date('September 23, 2019 08:30:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "C",
                        received: new Date('September 23, 2019 12:20:00'),
                        type: "invite",
                    },
                ],
                pastReminders: {},
                lastReminderDate: "",
            }
        ];
    
        const expectedData = {
            morning: [],
            noon: [
                {
                    to: "John",
                    from: ["A", "C"],
                    type: "invite",
                    level: "nudge",
                }
            ],
            evening: [],
        }
    
        expect(sendReminders(inputData)).toEqual(expectedData);
        mockDate.reset();
    });

    it("should send John a warning about schools E and G in the evening", () => {
        mockDate.set("2019-10-01");
        const inputData = [
            {
                candidateName: "John",
                pendingItems: [
                    {
                        schoolName: "G",
                        received: new Date('September 28, 2019 10:45:00'),
                        type: "invite",
                    },
                    {
                        schoolName: "H",
                        received: new Date("September 30, 2019 16:55:00"),
                        type: "invite",
                    },
                    {
                        schoolName: "E",
                        received: new Date("September 24, 2019 15:55:00"),
                        type: "invite",
                    }
                ],
                pastReminders: {
                    B: {
                        level: "nudge",
                        type: "message",
                        sent: new Date("September 26, 2019"),
                        originallyReceived: new Date("September 24, 2019 16:22:00"),
                    }
                },
                lastReminderDate: new Date("September 26, 2019")
            }
        ];
    
        const expectedData = {
            morning: [],
            noon: [],
            evening: [
                {
                    to: "John",
                    from: ["G", "E"],
                    type: "invite",
                    level: "warning",
                }
            ],
        }
        const received = sendReminders(inputData);
        expect(received).toEqual(expectedData);
        mockDate.reset();
    });
    
})