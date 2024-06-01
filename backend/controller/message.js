const Message = require("../models/Message");
const opendRooms = ["react", "node"];

exports.getOldMessage = (req, res, next) => {
  const { roomName } = req.params;
  if (opendRooms.includes(roomName)) {
    Message.find({ room: roomName })
      .select("username message sent_at")
      .then((message) => {
        res.status(200).json(message);
      });
  } else {
    res.status(403).json("Room is not opened.");
  }
};
