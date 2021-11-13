import create from "zustand";

const [useStore, useApi] = create((setState, getState) => ({
  users: {
    id: "",
    name: "",
    profile: "",
    message: [],
    socketId:""
  },
  Allusers: [],
  room: {
    roomId: "",
    members: [],
    message: [],
    lastmessage: "",
  },
  Allrooms: {},
  message: [],
  setusers: (users) =>
    setState({
      users: {...getState().users,...users},
    }),
  setAllUsers: (allusers) =>
    setState({
      Allusers: allusers,
    }),
  setRoom: (room) =>
    setState({
      room: room,
    }),
  setAllRooms: (room) =>
    setState({
      Allrooms: { room, ...getState().Allrooms },
    }),
  setMessage: (message) =>
    setState({
      message: [...getState().message, message],
    })
}));

export { useStore, useApi };
