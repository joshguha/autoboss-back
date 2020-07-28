const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const User = require("../models/userModel");
const imageFilter = require("../middleware/imageFilter");
const { login, logout } = require("../misc/timeTracking");

// Register user
router.post("/register", async (req, res) => {
    try {
        let { email, password, passwordCheck, firstName, lastName } = req.body;

        firstName = firstName.trim();
        lastName = lastName.trim();

        // validate
        if (!email || !password || !passwordCheck || !firstName || !lastName) {
            return res
                .status(400)
                .json({ msg: "Not all fields have been entered" });
        }
        if (password.length < 7) {
            return res.status(400).json({
                msg: "Password needs to be at least 7 characters long.",
            });
        }
        if (password !== passwordCheck) {
            return res.status(400).json({ msg: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ msg: "Account with this email already exists" });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
        });

        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate
        if (!email || !password) {
            return res
                .status(400)
                .json({ msg: "Not all fields have been entered" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                msg: "No account with this email has been registered",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        await user
            .populate("chatrooms", ["_id", "name"])
            .populate("pendingConnections", [
                "_id",
                "firstName",
                "lastName",
                "email",
                "avatar",
            ])
            .populate("connections", [
                "_id",
                "firstName",
                "lastName",
                "email",
                "avatar",
            ])
            .execPopulate();

        const userObject = user.toObject();
        delete userObject.password;
        delete userObject.firstName;
        delete userObject.lastName;
        delete userObject.loggedIn;
        login(user);

        res.json({
            token,
            user: { ...userObject, name: `${user.firstName} ${user.lastName}` },
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Logout user
router.post("/logout", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        logout(user);
        res.json({ msg: "Logged out" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete user
router.delete("/delete", auth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user);
        res.json(deletedUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Verify Token

router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get user
router.get("/", auth, async (req, res) => {
    user = await User.findById(req.user);
    await user
        .populate("chatrooms", ["_id", "name"])
        .populate("pendingConnections", [
            "_id",
            "firstName",
            "lastName",
            "email",
            "avatar",
        ])
        .populate("connections", [
            "_id",
            "firstName",
            "lastName",
            "email",
            "avatar",
        ])
        .execPopulate();
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.firstName;
    delete userObject.lastName;
    delete userObject.loggedIn;
    login(user);
    res.json({ ...userObject, name: `${user.firstName} ${user.lastName}` });
});

// Search for user
router.post("/search", auth, async (req, res) => {
    user = await User.findOne({ email: req.body.email });
    if (user) {
        let alreadyConnected,
            connectionPending = false;
        if (user.connections.includes(req.user)) alreadyConnected = true;
        if (user.pendingConnections.includes(req.user)) {
            connectionPending = true;
        }

        return res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            alreadyConnected,
            connectionPending,
        });
    }
    res.json({ msg: "User not found" });
});

// Connect with user / decline connection request
router.post("/connect", auth, async (req, res) => {
    try {
        const otherUser = await User.findById(
            req.body.connectWith || req.body.decline
        );
        const { _id, firstName, lastName, email, avatar } = otherUser;

        if (!otherUser)
            return res.status(400).json({ msg: "User does not exist" });

        if (otherUser.connections.includes(req.user)) {
            return res.status(400).json({ msg: "Connection already exists" });
        }
        const user = await User.findById(req.user);

        if (req.body.connectWith) {
            if (user.pendingConnections.includes(otherUser._id)) {
                user.connections.push(otherUser._id);
                otherUser.connections.push(user._id);
                user.pendingConnections = user.pendingConnections.filter(
                    (_id) => _id === otherUser._id
                );
                await user.save();
                await otherUser.save();
                return res
                    .status(201)
                    .json({ _id, firstName, lastName, email, avatar });
            }

            otherUser.pendingConnections.push(req.user);
            await otherUser.save();
            return res.status(201).json({ msg: "Connection invitation sent" });
        } else {
            user.pendingConnections = user.pendingConnections.filter(
                (_id) => _id.toString() !== otherUser._id.toString()
            );
            await user.save();
            return res
                .status(201)
                .json({ _id, firstName, lastName, email, avatar });
        }
    } catch (e) {
        res.status(500);
    }
});

// Disconnect with user
router.delete("/connect", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const connection = await User.findById(req.body._id);
        if (!user.connections.includes(req.body._id)) res.status(400).send();

        user.connections = user.connections.filter(
            (id) => id.toString() !== req.body._id
        );
        connection.connections = connection.connections.filter(
            (id) => id.toString() !== req.user
        );
        await user.save();
        await connection.save();
        res.json({ msg: "Connection removed" });
    } catch (e) {
        res.status(500);
    }
});

// Configure AWS S3 bucket
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// Get signed URL for profile pic upload
router.get("/avatar/upload", auth, async (req, res) => {
    const key = `${req.user}/${uuidv4()}.png`;

    s3.getSignedUrl(
        "putObject",
        {
            Bucket: "autoboss-bucket",
            ContentType: "image/png",
            Key: key,
        },
        (err, url) => res.send({ key, url })
    );
});

// Upload profile picture
router.post("/avatar", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        user.avatar = req.body.avatar.split(",")[1];
        await user.save();
        res.send({ avatar: user.avatar });
    } catch (e) {
        res.status(500);
    }
});

// Delete profile picture
router.delete("/avatar", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        user.avatar = undefined;
        await user.save();
        res.json({ msg: "Profile picture successfully deleted" });
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
