const Message = require("../models/Message");
const opendRooms = ["react", "node"];

exports.getOldMessage = (req, res, next) => {
  const { room } = req.params;
  if (opendRooms.includes(room)) {
    Message.find({ room: room })
      .select("username message sent_at")
      .then((message) => {
        res.status(200).json(message);
      });
  } else {
    res.status(403).json("Room is not opened.");
  }
};
