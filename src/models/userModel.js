const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error(
                    '"password" cannot be included in the password'
                );
            }
        },
    },
    chatrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chatroom" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pendingConnections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    avatar: {
        type: Buffer,
    },
    loggedIn: {
        type: Number,
    },
    timeLoggedInToday: {
        type: Number,
        default: 0,
    },
    notification: {
        type: String,
        default:
            "Welcome! I am your new boss, AutoBoss. I am here to monitor your progress ... every second of every minute of every hour of the day. You better get to work.",
    },
});

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});

userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user.id });
    next();
});

User = mongoose.model("User", userSchema);

module.exports = User;
