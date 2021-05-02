// function stringToHash(string) {
//   let hash = 0;

//   if (string.length == 0) return hash;

//   for (let i = 0; i < string.length; i++) {
//     let char = string.charCodeAt(i);
//     hash = (hash << 5) - hash + char;
//     hash = hash & hash;
//   }

//   return hash;
// }

let users = new Array();

class IO {
  constructor(io) {
    io.on("connection", (socket) => {
      const { room } = socket.handshake.query;

      socket.broadcast.emit("clientsCount", socket.server.engine.clientsCount);
      socket.emit("clientsCount", socket.server.engine.clientsCount);

      if (room) {
        socket.join(room);
      }

      const data = {
        name: `user_${socket.id.slice(0, 6)}`,
        id: socket.id,
        room,
        leader:
          users.filter((item) => item.room === room && item.leader).length === 0
            ? true
            : false,
        icon: socket.id.slice(0, 6),
      };

      users.push(data);

      socket.to(room).emit(
        "UserInfo",
        users.filter((item) => item.room === room)
      );
      socket.emit(
        "UserInfo",
        users.filter((item) => item.room === room)
      );

      socket.on("text", (msg) => {
        const user = users.find((item) => item.id === socket.id);
        if (user && user.leader) {
          socket.to(room).emit("text", { id: socket.id, msg });
        }
      });

      socket.on("disconnect", () => {
        const user = users.find((item) => item.id === socket.id);
        users = users.filter((item) => item.id !== socket.id);
        if (user.leader) {
          users = users.map((item, index) => {
            if (index === 0) {
              return { ...item, leader: true };
            }
            return item;
          });
        }
        socket.to(room).emit(
          "UserInfo",
          users.filter((item) => item.room === room)
        );
        socket.leave(room);
        socket.broadcast.emit(
          "clientsCount",
          socket.server.engine.clientsCount
        );
      });
    });
  }
}

export default IO;
