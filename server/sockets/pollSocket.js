const initPollSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinPoll", (pollId) => {
      socket.join(pollId);
      console.log(`Socket ${socket.id} joined poll room: ${pollId}`);
    });

    socket.on("leavePoll", (pollId) => {
      socket.leave(pollId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initPollSocket;
