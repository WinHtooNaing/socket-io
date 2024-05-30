import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import io from "socket.io-client";

const Welcome = ({ username, setUsername, room, setRoom, setSocket }) => {
  const navigate = useNavigate();
  const joinRoom = (e) => {
    e.preventDefault();
    if (
      username.trim().length > 5 &&
      room !== "select-room" &&
      room.trim().length > 0
    ) {
      alert("Successfully joined the room! ");
      const socket = io.connect("http://localhost:8080");
      setSocket(socket);

      navigate("/chat", {
        replace: true,
      });
    } else {
      toast.error("Something went wrong!!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };
  return (
    <>
      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <ToastContainer />
      </div>
      <section className="w-full h-screen flex items-center justify-center">
        <div className="w-1/2 bg-gray-50 p-10 rounded-lg">
          <h2 className="text-5xl font-bold text-center mb-6 text-blue-500">
            Room.io
          </h2>
          <form onSubmit={joinRoom}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="username ..."
                className="border-2 border-blue-500 outline-none p-2.5 rounded-lg w-full text-base font-medium"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className="mb-3">
              <select
                name="room"
                id="room"
                className="border-2 border-blue-500 outline-none p-2.5 rounded-lg w-full text-base font-medium
              focus:ring-blue-500 text-center "
                onChange={(e) => {
                  setRoom(e.target.value);
                }}
              >
                <option value="select-room">-- Select Room --</option>
                <option value="react">React</option>
                <option value="node">Node</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full text-center text-base bg-blue-500 text-white py-3.5 rounded-lg font-medium"
            >
              Join Room
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Welcome;
