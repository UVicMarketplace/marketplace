import { Box, CircularProgress, Stack } from "@mui/material";
import SearchBar from "../../components/searchBar";
import { useStyles, vars } from "../../styles/pageStyles";
import { useEffect, useState } from "react";
import { InfiniteScroll } from "../../components/InfiniteScroll";
import { MessageSendBox } from "./MessageSendBox";
import { MessageType } from "../../types";
import { ConversationsSidebar } from "./ConversationsSidebar";
import _axios_instance from "../../_axios_instance.tsx";

const user_id = "1"; // TODO: for testing lolz

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

const getMessagesNum = 10;

const Messages = () => {
  const s = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [listingId, setListingId] = useState<string>("1");
  const [receiverId, setReceiverId] = useState<string>("2");
  // const scrollableRef: React.RefObject<any> = useRef(null);

  // useEffect(() => {
  //   const scrollable = scrollableRef.current;
  //   console.log("scrollable", scrollable);
  //   if (scrollable) {
  //     scrollable.scrollTop = scrollable.scrollHeight;
  //   }
  // }, [scrollableRef.current]);

  useEffect(() => {
    setLoading(true);
    // fetch all conversations + messages for the first conversation
    _axios_instance
      .get("/messages/overview")
      .then((res) => {
        console.log("get messages overview response", res);
        if (res.data.length == 0) return;

        const firstThread = res.data[0];
        setListingId(firstThread.listing_id);
        setReceiverId(firstThread.other_participant.user_id);
        _axios_instance
          .get(
            `/messages/thread/${firstThread.listing_id}/${firstThread.other_participant.user_id}`
          )
          .then((res) => {
            console.log("get messages thread response", res);
            setMessages(res.data);
            setLoading(false);
            setError(null);
          })
          .catch((err) => {
            console.error("get messages thread error", err);
            setError("Error getting messages");
          });
      })
      .catch((err) => {
        console.error("get messages overview error", err);
        setError("Error getting threads");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchMore = () => {
    console.log("fetch more messages");
    _axios_instance
      .get(`/messages/thread/${listingId}/${receiverId}`, {
        data: {
          num_items: getMessagesNum,
          offset: messages.length,
        },
      })
      .then((res) => {
        console.log("get messages thread response", res);
        setMessages((old) => old.concat(res.data));
        setError(null);
      })
      .catch((err) => {
        console.error("get messages thread error", err);
        setError("Error getting messages");
      });
  };

  const onMessageSend = (text: string) => {
    // Make the user's message appear immediately so it doesn't feel sloppy
    setMessages((old) => [{ text: text, sender_id: user_id }].concat(old));
    console.log("sending message: ", text);
    _axios_instance
      .post(`/messages`, {
        content: text,
        listing_id: listingId,
        receiver_id: receiverId,
      })
      .then((res) => {
        console.log("post message response", res);
      })
      .catch((err) => {
        console.error("post message error", err);
        setError("Error sending message");
      });
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{ height: vars.pageHeaderHeight, borderBottom: "2px solid grey" }}
      >
        <SearchBar />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack direction="row" sx={s.messagesBox}>
          <ConversationsSidebar />
          <Box sx={s.messagesMainBox}>
            <Box sx={s.messagesMessagesBox}>
              <InfiniteScroll
                load={fetchMore}
                hasMore={true}
                loader={
                  <CircularProgress
                    size={"2rem"}
                    sx={{ marginHorizontal: "auto" }}
                  />
                }
              >
                {messages.map((item, index) => (
                  <Message message={item} key={index} />
                ))}
              </InfiniteScroll>
            </Box>
            <MessageSendBox onMessageSend={onMessageSend} />
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default Messages;
