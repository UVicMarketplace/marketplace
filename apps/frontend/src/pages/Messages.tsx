import { Box, Stack } from "@mui/material";
import { useStyles, vars } from "../styles/pageStyles";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../components/searchBar";
import { useState } from "react";

const items = Array.from({ length: 20 }).map((_, index) => ({
  text: `message ${index + 1}`,
  sender_id: index % 2 == 0 ? "1" : "2",
}));

const user_id = "2"; // TODO: for testing lolz

type MessageType = {
  text: string;
  sender_id: string;
};

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
    setMessages((old) =>
      old.concat({ text: "fetched message", sender_id: "1" })
    );
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{ height: vars.pageHeaderHeight, borderBottom: "2px solid grey" }}
      >
        <SearchBar />
      </Box>
      <Stack direction="row" sx={s.messagesBox}>
        <Box sx={s.messagesSidebar}>sidebar</Box>
        <Box sx={s.messagesMainBox}>
          <Box sx={s.messagesMessagesBox} id="scrollable">
            <InfiniteScroll
              // style={s.messagesMessagesBox}
              height="100%"
              inverse
              style={{ display: "flex", flexDirection: "column-reverse" }}
              // ref={scrollableRef}
              dataLength={messages.length}
              next={fetchMore}
              hasMore={true}
              loader={<h4>Loading...</h4>}
              endMessage={
                <p style={{ textAlign: "center" }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
              scrollableTarget="scrollable"
            >
              {messages.map((item, index) => (
                <Message message={item} key={index} />
              ))}
            </InfiniteScroll>
          </Box>
          <Box sx={s.messagesSendBox}>
            <Stack direction="row">
              <input type="text" />
              <button>Send</button>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Messages;
