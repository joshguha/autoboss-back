const Chatroom = require("../models/chatroomModel");
const { registerProfanity } = require("../autoboss/fns");
const Filter = require("bad-words"),
    filter = new Filter();

const authChatroom = async (userID, roomID) => {
    try {
        const chatroom = await Chatroom.findById(roomID);
        if (!chatroom || !chatroom.users.includes(userID)) {
            return false;
        }
        return chatroom;
    } catch (e) {
        return false;
    }
};

const populateChatroom = async (chatroom) => {
    await chatroom
        .populate("users", ["_id", "firstName", "lastName"])
        .populate("messages.author", ["_id", "firstName", "lastName"])
        .execPopulate();

    return chatroom;
};

const useIOMethods = (io) => {
    io.on("connect", (socket) => {
        socket.on("join", ({ userID, pathname }, callback) => {
            const roomID = pathname.split("/")[2];
            authChatroom(userID, roomID).then((chatroom) => {
                if (!chatroom) return callback(false);
                socket.join(chatroom._id);
                populateChatroom(chatroom).then((chatroom) => {
                    callback(chatroom);
                });
            });
        });

        socket.on("sendMessage", ({ message, roomID, userID }, callback) => {
            authChatroom(userID, roomID).then((chatroom) => {
                if (!chatroom) return callback(false);
                chatroom.messages.push({
                    author: userID,
                    body: filter.clean(message),
                });
                if (filter.isProfane(message)) {
                    registerProfanity(userID);
                }
                chatroom.save().then((chatroom) => {
                    populateChatroom(chatroom).then(() => {
                        const messageAdded =
                            chatroom.messages[chatroom.messages.length - 1];
                        io.to(roomID).emit("message", messageAdded);
                        callback();
                    });
                });
            });
        });
    });
};

module.exports = useIOMethods;
