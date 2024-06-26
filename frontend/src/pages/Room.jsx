import {
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
  Bars4Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatDistanceToNow } from "date-fns";

const Room = ({ username, room, socket }) => {
  const [nav, setNav] = useState(false);
  const navBarHandler = () => {
    setNav(!nav);
  };

  const navigate = useNavigate();
  const [roomUsers, setRoomUsers] = useState([]);
  const [receivedMessage, setReceiveMessage] = useState([]);
  const [message, setMessage] = useState("");

  const boxDivRef = useRef(null);
  const getOldMessage = async () => {
    const response = await fetch(`${import.meta.env.VITE_SERVER}/chat/${room}`);
    if (response.status === 403) {
      return navigate("/");
    }
    const data = await response.json();
    setReceiveMessage((prev) => [...prev, ...data]);
  };
  useEffect(() => {
    getOldMessage();
  }, []);

  useEffect(() => {
    // sent joined user info to server
    socket.emit("joined_room", { username, room });

    // get message form server
    socket.on("message", (data) => {
      setReceiveMessage((prev) => [...prev, data]);
    });

    // get room users from server
    socket.on("room_users", (data) => {
      let prevRoomUsers = [...roomUsers];
      data.forEach((user) => {
        const index = prevRoomUsers.findIndex(
          (prevUser) => prevUser.id === user.id
        );
        if (index !== -1) {
          prevRoomUsers[index] = { ...prevRoomUsers[index], ...data };
        } else {
          prevRoomUsers.push(user);
        }
        setRoomUsers(prevRoomUsers);
      });
    });

    return () => socket.disconnect();
  }, [socket]);

  const sendMessage = () => {
    if (message.trim().length > 0) {
      socket.emit("message_send", message);
      setMessage("");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  useEffect(() => {
    if (boxDivRef.current) {
      boxDivRef.current.scrollTop = boxDivRef.current.scrollHeight;
    }
  }, [receivedMessage]);
  return (
    <section className="flex gap-4 max-sm:flex max-sm:flex-col h-screen">
      {/* left side */}
      <div className="w-1/3 max-sm:w-full max-sm:flex max-sm:justify-between max-sm:px-5 bg-blue-500 text-white font-medium relative top-0 left-0">
        <p className="text-3xl font-bold text-center mt-5 max-sm:mb-5 ">
          Room.io
        </p>
        {nav === true ? (
          ""
        ) : (
          <Bars4Icon
            width={30}
            className="sm:hidden cursor-pointer "
            onClick={navBarHandler}
          />
        )}

        <div className={nav === true ? "block" : "hidden"}>
          <div className="relative w-[10rem] flex flex-col  right-0 bg-blue-500 h-screen">
            <XMarkIcon
              width={30}
              className="sm:hidden cursor-pointer absolute top-5 right-0"
              onClick={navBarHandler}
            />
            <div className="mt-20 ps-2 ">
              <p className="text-lg flex items-end gap-1">
                {" "}
                <ChatBubbleLeftRightIcon width={30} />
                Room Name
              </p>
              <p className="bg-white text-blue-500 ps-5 py-2 rounded-tl-full rounded-bl-full my-2">
                {room}
              </p>
            </div>
            <div className="mt-5 ps-2 ">
              <p className="flex items-end gap-1 text-lg mb-3">
                <UserGroupIcon width={30} />
                Users
              </p>
              {roomUsers.map((user, i) => (
                <p className="flex items-end gap-1 text-sm my-2" key={i}>
                  <UserIcon width={24} />
                  {user.username === username ? "You" : user.username}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="absolute bottom-0 p-2.5 flex items-center gap-1 w-full mx-2 mb-2 text-lg "
              onClick={leaveRoom}
            >
              <ArrowRightOnRectangleIcon width={30} />
              Leave Room
            </button>
          </div>
        </div>

        <div className="mt-10 ps-2 max-sm:hidden">
          <p className="text-lg flex items-end gap-1">
            {" "}
            <ChatBubbleLeftRightIcon width={30} />
            Room Name
          </p>
          <p className="bg-white text-blue-500 ps-5 py-2 rounded-tl-full rounded-bl-full my-2">
            {room}
          </p>
        </div>
        <div className="mt-5 ps-2 max-sm:hidden">
          <p className="flex items-end gap-1 text-lg mb-3">
            <UserGroupIcon width={30} />
            Users
          </p>
          {roomUsers.map((user, i) => (
            <p className="flex items-end gap-1 text-sm my-2" key={i}>
              <UserIcon width={24} />
              {user.username === username ? "You" : user.username}
            </p>
          ))}
        </div>
        <button
          type="button"
          className="absolute bottom-0 p-2.5 flex items-center gap-1 w-full mx-2 mb-2 text-lg max-sm:hidden"
          onClick={leaveRoom}
        >
          <ArrowRightOnRectangleIcon width={30} />
          Leave Room
        </button>
      </div>
      {/* right side */}
      <div className="w-full max-sm:h-full pt-5 relative ">
        <div
          className="h-[30rem] max-sm:h-[27rem] overflow-y-auto "
          ref={boxDivRef}
        >
          {receivedMessage.map((msg, i) => (
            <div
              key={i}
              className="text-white bg-blue-500 px-3 py-2 mb-3 w-3/4 rounded-br-3xl rounded-tl-3xl max-sm:ml-3"
            >
              <p className="text-sm font-medium font-mono">{msg.username}</p>
              <p className="text-lg font-medium">{msg.message}</p>
              <p className="text-sm font-mono font-medium text-right">
                {formatDistanceToNow(new Date(msg.sent_at))}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 my-2  py-2.5 flex items-end w-full px-2">
          <input
            type="text"
            placeholder="message ..."
            className="w-full lg:w-4/5 outline-none border-b-2 text-lg me-2 p-2 rounded-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="button" onClick={sendMessage}>
            <PaperAirplaneIcon
              width={30}
              className="hover:text-blue-500 hover:-rotate-45 duration-500"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Room;
