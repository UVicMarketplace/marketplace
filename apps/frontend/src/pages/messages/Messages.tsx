import {
  Box,
  Button,
  CircularProgress,
  Stack,
  useMediaQuery,
} from "@mui/material";
import SearchBar from "../../components/searchBar";
import { useStyles, vars } from "../../styles/pageStyles";
import { useEffect, useRef, useState } from "react";
import { InfiniteScroll } from "../../components/InfiniteScroll";
import { MessageSendBox } from "./MessageSendBox";
import { MessageType, ThreadType } from "../../types";
import { ConversationsSidebar } from "./ConversationsSidebar";
import _axios_instance from "../../_axios_instance.tsx";
import { usePaginatedArrayReducer } from "../../hooks/usePaginatedArrayReducer";

const user_id = "5"; // TODO: for testing lolz

type MessageProps = {
  message: MessageType;
};
const Message = ({ message }: MessageProps) => {
  const s = useStyles();
  return (
    <Box
      sx={message.sender_id == user_id ? s.messageFromUser : s.messageFromOther}
    >
      {message.message_body + " (id: " + message.message_id + ")"}
    </Box>
  );
};

const getMessagesNum = 10;

const Messages = () => {
  const s = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadType[]>([]);
  const messagesReducer = usePaginatedArrayReducer<MessageType>(
    "message_id",
    [],
    (a, b) =>
      a.created_at < b.created_at || a.message_id < b.message_id ? 1 : -1,
  );
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);

  // Workaround for not having a fixed-height header (unfortunately, this is
  // necessary for the infinite scroll)
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, [headerRef.current]);

  const [currentThread, setCurrentThread] = useState<ThreadType | null>(null);
  const isMobileSize = useMediaQuery("(max-width:740px)");

  const shouldShowMessages = !isMobileSize || (isMobileSize && currentThread);

  useEffect(() => {
    setLoading(true);
    // fetch all conversations + messages for the first conversation
    _axios_instance
      .get("/messages/overview")
      .then((res) => {
        console.log("get messages overview response", res);
        setThreads(res.data as ThreadType[]);
        if (res.data.length == 0) return;

        const firstThread = res.data[0] as ThreadType;
        setCurrentThread(firstThread);

        _axios_instance
          .get(
            `/messages/thread/${firstThread.listing_id}/${firstThread.other_participant.user_id}`,
          )
          .then((res) => {
            console.log("initial message load:", res);
            const { messages, totalCount } = res.data;
            messagesReducer.add(messages as MessageType[]);
            setHasMoreMessages(totalCount > messages.length);
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
    console.log("fetching more messages", {
      num_items: getMessagesNum,
      offset: messagesReducer.state.length,
    });
    if (!currentThread) return; // doesn't make sense to fetch more messages if no thread is selected
    if (loading) return; // don't fetch more messages if we're already loading
    if (!hasMoreMessages) return; // no more messages to fetch

    _axios_instance
      .get(
        `/messages/thread/${currentThread.listing_id}/${currentThread.other_participant.user_id}`,
        {
          params: {
            num_items: getMessagesNum,
            offset: messagesReducer.state.length,
          },
        },
      )
      .then((res) => {
        console.log("get messages thread response", res.data);
        const { messages, totalCount } = res.data;
        messagesReducer.add(messages as MessageType[]);
        setHasMoreMessages(totalCount > messagesReducer.state.length);
        setError(null);
      })
      .catch((err) => {
        console.error("get messages thread error", err);
        setError("Error getting messages");
      });
  };

  const onMessageSend = (text: string) => {
    if (!currentThread) {
      console.error("can't send: no current thread");
      return;
    }

    // Make the user's message appear immediately so it doesn't feel sloppy
    // setMessages((old) => [{ text: text, sender_id: user_id }].concat(old));

    console.log("sending message: ", text);
    _axios_instance
      .post(`/messages`, {
        content: text,
        listing_id: currentThread.listing_id,
        receiver_id: currentThread.other_participant.user_id,
      })
      .then((res) => {
        console.log("post message response", res);
        // setMessages((old) => old.concat(res.data as MessageType));
        messagesReducer.add([res.data] as MessageType[]);
      })
      .catch((err) => {
        console.error("post message error", err);
        setError("Error sending message");
      });
  };

  const hideThread = () => {
    setCurrentThread(null);
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Box ref={headerRef}>
        <SearchBar />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : threads.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>
            No threads yet! Find a listing you like and begin a conversation
            from there.
          </p>
        </Box>
      ) : (
        <Box
          sx={{
            position: "relative",
            height: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          {isMobileSize && currentThread !== null && (
            <Button sx={s.messagesHideThreadButton} onClick={hideThread}>
              Back
            </Button>
          )}
          <Stack direction="row">
            {(!isMobileSize || currentThread === null) && (
              <ConversationsSidebar
                threads={threads}
                selectThread={(thread) => setCurrentThread(thread)}
              />
            )}
            {shouldShowMessages && (
              <Box
                sx={{
                  // Contains both the messages and the send box
                  width: "100%",
                  height: `calc(100vh - ${vars.messagesSendBoxHeight} - ${headerHeight}px)`,
                }}
              >
                <Box sx={s.messagesMessagesBox} id="scrollable">
                  <InfiniteScroll
                    load={fetchMore}
                    hasMore={hasMoreMessages}
                    loader={
                      loading && (
                        <CircularProgress
                          size={"2rem"}
                          sx={{ marginHorizontal: "auto" }}
                        />
                      )
                    }
                    scrollContainerId={"scrollable"}
                  >
                    {messagesReducer.state.map((item, index) => (
                      <Message message={item} key={item.message_id} />
                    ))}
                  </InfiniteScroll>
                </Box>
                <MessageSendBox onMessageSend={onMessageSend} />
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Messages;
