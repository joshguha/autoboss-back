const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const useIOMethods = require("./src/sockets/useIOMethods");

// set up environment variables
require("dotenv").config();

// set up express
const app = express();
app.use(express.json());
app.use(cors());

// set up socket.io
const server = http.createServer(app);
const io = socketio(server);

// set up routers
app.use("/users", require("./src/routers/userRouter"));
app.use("/tasks", require("./src/routers/taskRouter"));
app.use("/chat", require("./src/routers/chatRouter"));

// Basic homepage
app.get("/", (req, res) => {
    res.send("Hello");
});

// set up mongoose
mongoose
    .connect(
        process.env.MONGODB_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        (err) => {
            if (err) throw err;
            console.log("MongoDB connection established");
        }
    )
    .then(() => console.log("connected to MongoDB"))
    .catch(() => console.log("connection to MongoDB failed!"));

// set up socket.io methods
useIOMethods(io);

// start up the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server listening on port ${port}.`));
