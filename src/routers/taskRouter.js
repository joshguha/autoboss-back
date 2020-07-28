const router = require("express").Router();
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const auth = require("../middleware/auth");

// Create a task
router.post("/", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user,
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        if (e.message) {
            res.status(400).json({ msg: e.message });
        } else {
            res.status(400).json({ msg: e });
        }
    }
});

// Retrieve all tasks
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        await user.populate("tasks").execPopulate();
        res.send(user.tasks);
    } catch (e) {
        res.status(500).json({ msg: e });
    }
});

// Update a task
router.patch("/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).json({ msg: "Invalid updates!" });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user,
        });

        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

// Delete a task
router.delete("/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user,
        });
        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.send(task);
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
});

module.exports = router;
