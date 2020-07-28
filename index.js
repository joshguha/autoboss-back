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

// set up mongoose
mongoose.connect(
    process.env.MONGODB_CONNECTION_STRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    },
    (err) => {
        if (err) throw err;
        console.log("MongoDB connection established");
    }
);

// set up socket.io methods
useIOMethods(io);

// start up the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server listening on port ${port}.`));
