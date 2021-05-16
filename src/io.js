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
const Crypt = require("g-crypt");
const passphrase =
  "f5d9973e189088c4add2faa9a47fd004b76a344f2f98764c97ce11e395128666";
const crypter = Crypt(passphrase);

let users = new Array();

class IO {
  constructor(io) {
    io.on("connection", (socket) => {
      const { room } = socket.handshake.query;

      socket.broadcast.emit(
        "clientsCount",
        crypter.encrypt(socket.server.engine.clientsCount)
      );
      socket.emit(
        "clientsCount",
        crypter.encrypt(socket.server.engine.clientsCount)
      );

      if (room) {
        socket.join(room);
      }

      const data = {
        name: `user_${socket.id.replace(/[_-]/g, "").slice(0, 6)}`,
        id: socket.id,
        room,
        leader:
          users.filter((item) => item.room === room && item.leader).length === 0
            ? true
            : false,
        icon: socket.id.slice(0, 6),
      };

      users.push(data);

      socket
        .to(room)
        .emit(
          "UserInfo",
          crypter.encrypt(users.filter((item) => item.room === room))
        );
      socket.emit(
        "UserInfo",
        crypter.encrypt(users.filter((item) => item.room === room))
      );

      socket.on("text", (msg) => {
        const user = users.find((item) => item.id === socket.id);
        if (user && user.leader) {
          socket
            .to(room)
            .emit(
              "text",
              crypter.encrypt({ id: socket.id, msg: crypter.decrypt(msg) })
            );
        }
      });

      socket.on("message", (text) => {
        const message = crypter.decrypt(text);
        if (!message) {
          return;
        }
        socket
          .to(room)
          .emit("message", crypter.encrypt({ id: socket.id, text: message }));
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
        socket.to(room).emit("userDisconnect", crypter.encrypt(socket.id));
        socket.leave(room);
        socket.broadcast.emit(
          "clientsCount",
          crypter.encrypt(socket.server.engine.clientsCount)
        );
      });
    });
  }
}

export default IO;
