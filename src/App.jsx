import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { Input, Button } from "antd";
import {
  SearchOutlined,
  MessageTwoTone,
  PoweroffOutlined,
} from "@ant-design/icons";
import "./App.css";
import "antd/dist/antd.css";

import { useStore, useApi } from "./AppStore";

import Roompage from "./RoomPage";
import { v4 as uuid } from "uuid";

const uuId = uuid();

const socket = io.connect("http://localhost:4000");
let username = window.localStorage.getItem("name");
const userId = username + uuId.split("-")[0];
const users = {
  id: userId,
  name: username,
  profile: username.split("")[0],
  message: [],
  socketId: "",
};

function App() {
  const [isSelected, setSelected] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [room, setRoom] = useState(null);
  const [Allusers, setAllUsers] = useStore((setState) => [
    setState.Allusers,
    setState.setAllUsers,
  ]);

  useEffect(() => {
    if (!username) {
      var person = prompt("Please enter your name");
      if (person != null) {
        window.localStorage.setItem("name", person);
        username = person;
      }
    }
  }, []);

  useEffect(() => {
    socket.emit("user join", users);
    console.log("user join client ", userId, username, users);
    socket.on("someone joined", (data) => {
      setAllUsers([...Allusers, data]);
      console.log("someone joined client", data);
    });

    socket.on("get users", (data) => {
      setAllUsers(data);
      console.log("get users data", data);
    });

    socket.on("remove users", (data) => {
      setAllUsers(data);
      console.log("remove users data", data);
    });
  }, []);

  useEffect(() => {
    socket.on("message", (data) => {
      console.log("messages client", data);
      let getRoom = useApi
      .getState()
      .Allusers.find((room) => room.id === data.message.myId);
      if (getRoom.roomId) {
        getRoom.roomId = getRoom.id + "_" + userId;
        getRoom.members = [
          { id: getRoom.id, name: getRoom.name },
          { id: userId, name: username },
        ];       
      }
      console.log(getRoom.message,"getRoom.message");
      getRoom.message = [...getRoom.message, data.message];
      getRoom.lastmessage = data.message;
      let allusers = useApi
        .getState()
        .Allusers.filter((users) => users.id !== getRoom.id);
      allusers.unshift(getRoom);
      useApi.getState().setAllUsers(allusers);
      console.log("messages client getRoom", getRoom);
    });
  }, []);

  const AllChats = useMemo(() => {
    if (filterValue)
      return Allusers.filter((i) =>
        i.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    console.log("Allusers chng", Allusers);
    return Allusers;
  }, [Allusers, filterValue]);

  function MessageSend(data) {
      socket.emit("chat", data);
  }

  function selectRoom(room) {
    console.log("AllChats AllChats", AllChats);
    if (!room.roomId) {
      useApi.getState().setRoom({
        roomId: room.id + "_" + userId,
        members: [
          { id: room.id, name: room.name },
          { id: userId, name: username },
        ],
        message: room.message,
        ...room,
      });
    } else {
      useApi.getState().setRoom(room);
    }
    setRoom(room);
  }

  function onSearch(e) {
    setFilterValue(e.target.value);
  }

  return (
    <div className={"MainContainer"}>
      <div className={"LeftContainer"}>
        <div>
          {username && (
            <div className={"UserInfo"}>
              <div>{username}</div>
              <Button
                type="primary"
                danger
                icon={<PoweroffOutlined />}
                style={{ borderRadius: "100%" }}
                onClick={() => {
                  window.localStorage.removeItem("name");
                  username = "";
                  setAllUsers(Allusers.filter((id) => id.id !== userId));
                }}
              />
            </div>
          )}
          <Input
            prefix={
              <SearchOutlined style={{ fontSize: 16, color: "#9e9e9e" }} />
            }
            placeholder="Search People"
            allowClear
            className={"Input"}
            onChange={onSearch}
          />
        </div>
        <div className="ChatListContainer">
          {AllChats.filter((user) => user.id !== userId).map((i, ind) => {
            return (
              <div
                key={ind}
                className={`ChatPersonContainer ${
                  isSelected === i.id ? "ChatPersonContainerActive" : ""
                }`}
                onClick={() => {
                  console.log("click on", i);
                  setSelected(i.id);
                  selectRoom(i);
                }}
              >
                <div className={"ChatPerson"}>{i.profile}</div>
                <div className={"ChatListPerson"}>
                  <div className={"ChatListName"}>{i.name}</div>
                  {!filterValue && i.lastmessage?.myId &&(
                    <div className="LastMessage">
                      <p>
                        <span>
                          {i.lastmessage.myId === userId
                            ? "You"
                            : i.lastmessage.senderName}{" "}
                          {" : "}
                        </span>
                        {i.lastmessage.content}
                      </p>
                    </div>
                  )}
                </div>
                {!filterValue && <div>{i.unread !== "0" ? i.unread : ""}</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`RightContainer ${!room && "EmptyState"}`}>
        {!!room ? (
          <Roompage room={room} userId={userId} MessageSend={MessageSend} />
        ) : (
          <div>
            <div className={"MessageEmpty"}>
              <MessageTwoTone />
            </div>
            <div>Select a chat to start a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
