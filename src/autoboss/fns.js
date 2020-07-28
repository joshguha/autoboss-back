const User = require("../models/userModel");
const Axios = require("axios");
const {
    randomize,
    profanityNotifications,
    overtimeNotifications,
    almostDoneNotifications,
    lunchbreakNotifications,
    dayStartNotifications,
    overdueNotifications,
    pendingCompletionNotifications,
    noTasksNotifications
} = require("./notifications");

const registerProfanity = async (userID) => {
    const user = await User.findById(userID);
    user.notification = randomize(profanityNotifications);
    await user.save();
};

const tellJoke = async () => {
    const res = await Axios.get("https://icanhazdadjoke.com/", {
        headers: {
            Accept: "application/json",
        },
    });
    return res.data.joke;
};

const reportTime = (timeLoggedInToday) => {
    if (timeLoggedInToday > 25200000) return randomize(overtimeNotifications);
    else if (timeLoggedInToday > 18000000)
        return randomize(almostDoneNotifications);
    else if (timeLoggedInToday > 10800000)
        return randomize(lunchbreakNotifications);
    else return randomize(dayStartNotifications);
};

const reportTask = async (_id) => {
    let overdue = false;
    let pendingCompletion = false;
    const user = await User.findById(_id);
    await user.populate("tasks").execPopulate();
    user.tasks.forEach((task) => {
        if (!task.completed && task.due && task.due < Date.now())
            overdue = true;
        if (!task.completed && task.due) pendingCompletion = true;
    });
    if (overdue) return randomize(overdueNotifications);
    if (pendingCompletion) return randomize(pendingCompletionNotifications);
    return randomize(noTasksNotifications);
};

module.exports = { registerProfanity, tellJoke, reportTime, reportTask };
