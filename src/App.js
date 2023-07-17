import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  LoadingIndicator,
  Thread,
  Window,
  MessageList
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";

//Connect as this user
const adminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNzg3NjNlYmItYjBhZC00ODYxLTg4YWUtMzEyY2UzYTNlYTkxIn0.U_tvVpe0mQ2Ad7-kX_iwfkf7OX2xavyaQvbJTm5Fjt0";
const adminId = "78763ebb-b0ad-4861-88ae-312ce3a3ea91";
const adminName = "Health Coach";

const primaryMemberId = "c14cdc5c-f2ec-49e1-b5ac-42550a69fdef";
const primaryMemberName = "sour fancy";

const secondaryMemberId = "79554247-3848-41c0-93d6-9a74a34f40ac";
const secondaryMemberName = "spicy fat";

const user = {
  id: adminId,
  name: adminName
};

const filters = { type: "messaging", members: { $in: [primaryMemberId] } };
const sort = { last_message_at: -1 };

export const useClient = ({ apiKey, userData, tokenOrProvider }) => {
  const [chatClient, setChatClient] = useState(null);

  useEffect(() => {
    const client = new StreamChat(apiKey);
    // prevents application from setting stale client (user changed, for example)
    let didUserConnectInterrupt = false;

    const connectionPromise = client
      .connectUser(userData, tokenOrProvider)
      .then(() => {
        if (!didUserConnectInterrupt) setChatClient(client);
      });

    return () => {
      didUserConnectInterrupt = true;
      setChatClient(null);
      // wait for connection to finish before initiating closing sequence
      connectionPromise
        .then(() => client.disconnectUser())
        .then(() => {
          console.log("connection closed");
        });
    };
  }, [apiKey, userData, tokenOrProvider]);

  return chatClient;
};

const App = () => {
  const chatClient = useClient({
    apiKey: "t6j6qcn98tdf",
    userData: user,
    tokenOrProvider: adminToken
  });

  const [channel, setchannel] = useState(undefined);

  if (!chatClient) {
    return <LoadingIndicator />;
  }

  //This click handler will create a channel between the Health Coach and a secondary Member
  //This channel should NOT show up in the channel list because the channel list has a filter on it to only show channels for the primary member
  const handleClick = async () => {
    try {
      const channel = chatClient.channel("messaging", {
        name: "Sample Channel",
        members: [adminId, secondaryMemberId]
      });
      const newChannel = await channel.create();
      setchannel(newChannel?.channel?.id);
      console.log("channel created:", newChannel?.channel?.id);
    } catch (e) {
      console.error("failed to create channel", e);
      alert("failed to create channel");
    }
  };

  const handleDeleteClick = async () => {
    try {
      console.log("attempting to delete channel:", channel);
      const response = await chatClient.deleteChannels([channel]);
      setchannel(undefined);
      console.log("channel deleted:", response);
    } catch (e) {
      console.error("failed to delete channel", e);
      alert("failed to delete channel");
    }
  };

  return (
    <div>
      <button
        style={{ "background-color": "blue", color: "white", height: "50px" }}
        onClick={handleClick}
      >{`Create Channel between Health Coach and secondary member ${secondaryMemberName}`}</button>
      <button
        style={{ "background-color": "red", color: "white", height: "50px" }}
        onClick={handleDeleteClick}
      >{`Delete Channel between Health Coach and secondary member ${secondaryMemberName}`}</button>
      <div
        style={{ "margin-top": "20px" }}
      >{`Only showing channels between 'Health Coach' and primary member: '${primaryMemberName}'`}</div>
      <Chat client={chatClient} theme="str-chat__theme-light">
        <ChannelList filters={filters} sort={sort} />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default App;
