const Chatroom = require("./models/chatroomModel");

chatroom = new Chatroom({
    name: "Test Chatroom 3",
    messages: [],
    users: [
        "5f105928b3cd6d6adc491d8d",
        "5f10927dffd22c6260538bfb",
        "5f13421c77e9ea45180c70a1",
    ],
});

chatroom
    .save()
    .then(() => {
        console.log("Success!");
    })
    .catch((e) => {
        console.log(e);
    });
