const router = require("express").Router();
const Chatroom = require("../models/chatroomModel");
const User = require("../models/userModel");
const auth = require("../middleware/auth");

// Create chatroom
router.post("/", auth, async (req, res) => {
    try {
        chatroom = new Chatroom({
            name: req.body.roomName,
            messages: [],
            users: [req.user, ...req.body.connectionsAdded],
        });
        const { _id, name, users } = await chatroom.save();
        users.forEach(async (userID) => {
            const user = await User.findById(userID);
            user.chatrooms.push(_id);
            await user.save();
        });
        res.status(201).send({ _id, name });
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

// Delete chatroom
router.delete("/", auth, async (req, res) => {
    try {
        const chatroom = await Chatroom.findById(req.body._id);
        if (!chatroom.users.includes(req.user)) res.status(400).send();
        chatroom.users.forEach(async (userID) => {
            const user = await User.findById(userID);
            user.chatrooms = user.chatrooms.filter((chatroomID) => {
                return chatroomID.toString() !== chatroom._id.toString();
            });
            await user.save();
        });

        await Chatroom.findByIdAndDelete(req.body._id);
        res.send(chatroom);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
});

module.exports = router;
