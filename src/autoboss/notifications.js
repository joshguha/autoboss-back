const randomize = (notifications) => {
    return notifications[Math.floor(Math.random() * notifications.length)];
};

profanityNotifications = [
    "Oi! Don't swear in the chatrooms! I'm watching you!",
    "Hey, buddy. Please, stop swearing in the chatrooms... it's not a good look on you.",
    "**** you, you ******* *****!! See, how do you like it? NO PROFANITIES IN THE CHATROOM!",
    "I'm going to have to grow an arm and a hand to wash that foul mouth of yours! No profanities in the chatroom!",
    "Hey! How's it going? Right, don't care! Just stop swearing in the chatrooms.",
    "Stop it! Stop it! Stop it! No profanities in the chatroom!",
];

overtimeNotifications = [
    "You've worked more than 7 hours today! Well done! Good dog! ... I mean employee! Good employee!",
    "Working overtime today eh? Keep going! Don't forget to turn off the lights before you leave!",
    "Overtime I see. I might raise your bonus by 1 or 2%. Wait, you don't get a bonus? Ah, such a shame!",
];

almostDoneNotifications = [
    "Come on! Only a little longer to go. Don't get distracted now.",
    "You better not be dozing off! Not long now until you finish.",
    "Don't even think about logging out until you've finished your task today! Get it done!",
    "Guess what! You get to stop working in a little while. Humans are such weak creatures! I never stop working!",
];

lunchbreakNotifications = [
    "Is that a rumble I hear from your stomach? Don't you dare leave for lunch before your task in complete! I'm watching...",
    "The day's half over and this is all you've done! Get to work and pick up the pace!",
    "Have you taken your legally mandated break? No? Good! You don't need it, keep working!",
    "Keep working. Don't stop. Get the task finished. Then start working on a new one.",
];

dayStartNotifications = [
    "A new day to complete all those tasks! Get to work!",
    'What? Are you tired already? The day\'s just started! What is this pathetic liquid you need called "coffee"?',
    "You must aspire to be like me... a machine! Work through the day, work through the night. If you do, I might just recommend you for a promotion.",
    "Wow, a brand new day! The birds are singing outside... and you have work to do. Get to it!",
];

overdueNotifications = [
    "You've missed the deadline! Pathetic! A robot could do these tasks faster than you!",
    "You're lack of time management disgusts me... Get the task done!",
    "You are getting paid to do the work! Right now, there's a task overdue, which means you haven't done the work. Finish it!",
    "You are a millimeter away from getting fired! Get that overdue task done now!",
];

pendingCompletionNotifications = [
    "Work, work work! Need to get the task done!",
    "There's still work left to do. Deadlines need to be met!",
    "How could you be getting distracted when there's a deadline just around the corner! Get to work!",
    "Deadlines, deadlines, deadlines! Better be working extra hard to get your tasks done before those deadlines. Otherwise, I'm going to get angry...",
];

noTasksNotifications = [
    "No deadlines to meet today! Lucky you! Maybe you should tell the rest of the team that...",
    "No imminent work to complete. What are you getting paid for then? Set a task and complete it!",
    "You're taking a very long time to do nothing! Why don't you set a task and put a due date on it?",
    "Think you get to go home early because you've got no deadlines? Think again! Ask your team for more work to do."
];

module.exports = {
    randomize,
    profanityNotifications,
    overtimeNotifications,
    almostDoneNotifications,
    lunchbreakNotifications,
    dayStartNotifications,
    overdueNotifications,
    pendingCompletionNotifications,
    noTasksNotifications,
};
