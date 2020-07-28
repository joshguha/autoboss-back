const mongoose = require("mongoose");
const User = require("./userModel");

const messageSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        body: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: { currentTime: () => Date.now() },
    }
);

const chatroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    messages: [messageSchema],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

Chatroom = mongoose.model("Chatroom", chatroomSchema);

module.exports = Chatroom;
