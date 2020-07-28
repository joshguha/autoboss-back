const cron = require("node-cron");
const User = require("../models/userModel");
const { tellJoke, reportTime, reportTask } = require("../autoboss/fns");

const login = async (user) => {
    if (!user.loggedIn) {
        user.loggedIn = Date.now();
        await user.save();
    }
};

const logout = async (user) => {
    if (user.loggedIn) {
        timeElapsed = Date.now() - user.loggedIn;
        user.timeLoggedInToday += timeElapsed;
        user.loggedIn = undefined;
        await user.save();
    }
};

createRandomTime = () => {
    let string = "";
    let seconds = Math.floor(Math.random() * 60);
    let minutes = Math.floor(Math.random() * 60);
    let hours = Math.floor(Math.random() * 24);

    const addZero = (time) =>
        time / 10 < 1 ? "0" + time.toString() : time.toString();

    return `${addZero(seconds)} ${addZero(minutes)} ${addZero(hours)} * * *`;
};

// Reset timeLoggedInToday to 0 and clear notifications at midnight for all users
cron.schedule("00 00 00 * * * ", async function () {
    await User.find({}, function (err, users) {
        users.forEach(async function (user) {
            user.timeLoggedInToday = 0;
            user.notification = "";
            if (user.loggedIn) user.loggedIn = Date.now();
            await user.save();
        });
    });
});

// Random dad jokes for 10% of users at random times throughout the day
for (let i = 0; i < 100; i++) {
    cron.schedule(createRandomTime(), async function () {
        console.log("joke notification");
        await User.find({}, function (err, users) {
            users.forEach(async function (user) {
                if (Math.random() < 0.5) user.notification = await tellJoke();
                await user.save();
            });
        });
    });
}

// Give notifications dependent on the amount of time worked
for (let i = 0; i < 100; i++) {
    cron.schedule(createRandomTime(), async function () {
        console.log("amount of time notification");
        await User.find({}, function (err, users) {
            users.forEach(async function (user) {
                if (Math.random() < 0.5)
                    user.notification = reportTime(user.timeLoggedInToday);
                await user.save();
            });
        });
    });
}

// Give notifications dependent on the tasks left
for (let i = 0; i < 100; i++) {
    cron.schedule(createRandomTime(), async function () {
        console.log("task notification");
        await User.find({}, function (err, users) {
            users.forEach(async function (user) {
                if (Math.random() < 0.5)
                    user.notification = await reportTask(user._id);
                await user.save();
            });
        });
    });
}

cron.schedule("35 40 13 * * *", async function () {
    console.log("task notification");
    await User.find({}, function (err, users) {
        users.forEach(async function (user) {
            if (Math.random() < 0.5)
                user.notification = await reportTask(user._id);
            await user.save();
        });
    });
});

module.exports = { login, logout };
