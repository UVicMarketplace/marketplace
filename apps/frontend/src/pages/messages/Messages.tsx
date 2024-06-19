import { Box, Button, Input, Stack } from "@mui/material";
import SearchBar from "../../components/searchBar";
import { useStyles, vars } from "../../styles/pageStyles";
import { useState } from "react";
import { InfiniteScroll } from "../../components/InfiniteScroll";
import { MessageSendBox } from "./MessageSendBox";
import { MessageType } from "../../types";
import { ConversationsSidebar } from "./ConversationsSidebar";

const items = Array.from({ length: 20 }).map((_, index) => ({
  text: `message ${index + 1}`,
  sender_id: index % 2 == 0 ? "1" : "2",
}));

const user_id = "2"; // TODO: for testing lolz

type MessageProps = {
  message: MessageType;
};
const Message = ({ message }: MessageProps) => {
  const s = useStyles();
  return (
    <Box
      sx={message.sender_id == user_id ? s.messageFromUser : s.messageFromOther}
    >
      {message.text}
    </Box>
  );
};

const Messages = () => {
  const s = useStyles();
  const [messages, setMessages] = useState<MessageType[]>(items);
  // const scrollableRef: React.RefObject<any> = useRef(null);

  // useEffect(() => {
  //   const scrollable = scrollableRef.current;
  //   console.log("scrollable", scrollable);
  //   if (scrollable) {
  //     scrollable.scrollTop = scrollable.scrollHeight;
  //   }
  // }, [scrollableRef.current]);

  const fetchMore = () => {
    console.log("fetch more messages");
    setMessages((old) => {
      const loadedMessages = Array.from({ length: 10 }).map((_) => ({
        text: "fetched message",
        sender_id: "1",
      }));
      return old.concat(loadedMessages);
    });
  };

  const onMessageSend = (text: string) => {
    setMessages((old) => [{ text: text, sender_id: user_id }].concat(old));
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{ height: vars.pageHeaderHeight, borderBottom: "2px solid grey" }}
      >
        <SearchBar />
      </Box>
      <Stack direction="row" sx={s.messagesBox}>
        <ConversationsSidebar />
        <Box sx={s.messagesMainBox}>
          <Box sx={s.messagesMessagesBox}>
            <InfiniteScroll
              load={fetchMore}
              hasMore={true}
              loader={<h4>Loading...</h4>}
            >
              {messages.map((item, index) => (
                <Message message={item} key={index} />
              ))}
            </InfiniteScroll>
          </Box>
          <MessageSendBox onMessageSend={onMessageSend} />
        </Box>
      </Stack>
    </Box>
  );
};

export default Messages;
