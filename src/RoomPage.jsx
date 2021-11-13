import { Fragment, useEffect, useState, useRef } from "react";
import * as toxicity from "@tensorflow-models/toxicity";
import { Input, Button, Alert } from "antd";
import { SendOutlined } from "@ant-design/icons";
import "./App.css";
import "antd/dist/antd.css";
import { useApi } from "./AppStore";

import { v1 as uuid } from "uuid";

const threshold = 0.9;

export default function RoomPage(props) {
  const { room, userId, MessageSend } = props;
  const getRoom = useApi.getState().room;
  const [text, setText] = useState("");
  const [abusedId, setAbusedId] = useState(false);
  const InputFooter = useRef(null);
  const message = getRoom.message;

  useEffect(() => {
    InputFooter.current.focus();
    console.log("getRoom", getRoom);
  }, []);

  function sendData() {
    if (text !== "") {
      const uuId = uuid();
      let messageId = "Msg_" + uuId.split("-")[0];
      console.log("datadata", room, messageId);
      let data = {
        messageTo: room.socketId,
        message: {
          myId: userId,
          messageId: messageId,
          senderName: room.name,
          content: text,
        },
      };
      setText("");
      console.log("messages", text);
      message.push(data.message);
      toxicity.load(threshold).then((model) => {
        const sentences = [text.toLowerCase()];
        model
          .classify(sentences)
          .then((predictions) => {
            let matchResults = predictions.filter(
              (item) => item["results"][0]["match"] === true
            );
            if (matchResults.length > 0) {
              setAbusedId(data.message.messageId);
              console.log(message, "messageId abs aa", messageId);
              setTimeout(() => {
                let index = message.findIndex(
                  (msg) => msg.messageId === data.message.messageId
                );
                message.splice(index, 1);
                console.log(message, "messageId abs", index);
                setAbusedId(false)
              }, [100000]);
            } else {
              useApi.getState().setRoom(getRoom);
              getRoom.message = message;
              getRoom.lastmessage = data.message;
              let allusers = useApi
                .getState()
                .Allusers.filter((users) => users.id !== getRoom.id);
              allusers.unshift(getRoom);
              useApi.getState().setAllUsers(allusers);
              MessageSend(data);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  }

  return (
    <Fragment>
      <div className="ChatHeader">
        <div className={"ChatIcon"}>{room.profile}</div>
        <div className={"ChatUserName"}>{room.name}</div>
      </div>
      <div className="ChatContainer">
        {message.map((message, ind) => {
          return (
            <div key={ind} className="ChatMessage">
              <div
              className={`${
                message.myId === userId ? "SenderSide" : "ReceiverSide"
                }`}
              >
                <div className={`${
                  message.myId === userId ? "SenderMessage" : "ReceiverMessage"
                }`}>{message.content}</div>
                {abusedId === message.messageId && (
                <Alert
                  message="Abused Content"
                  description="This message couldn’t be send."
                  type="warning"
                  showIcon
                />
              )}
              </div>
              
            </div>
          );
        })}
      </div>
      <div className="ChatFooter">
        <Input
          placeholder="Write a Message"
          className={"InputFooter"}
          onChange={(e) => setText(e.target.value)}
          value={text}
          suffix={
            <Button
              type="primary"
              style={{ marginRight: "4px", borderRadius: "28px" }}
              onClick={sendData}
            >
              <SendOutlined /> Send
            </Button>
          }
          ref={InputFooter}
        />
      </div>
    </Fragment>
  );
}
