import {
  Box,
  Button,
  CircularProgress,
  Stack,
  useMediaQuery,
} from "@mui/material";
import SearchBar from "../../components/searchBar";
import { useStyles, vars } from "../../styles/pageStyles";
import { useCallback, useEffect, useRef, useState } from "react";
import { InfiniteScroll } from "../../components/InfiniteScroll";
import { MessageSendBox } from "./MessageSendBox";
import { MessageType, ThreadType } from "../../types";
import { ConversationsSidebar } from "./ConversationsSidebar";
import _axios_instance from "../../_axios_instance.tsx";
import { usePaginatedArrayReducer } from "../../hooks/usePaginatedArrayReducer";
import { Message } from "./Message.tsx";

const fetchThreads: () => Promise<ThreadType[]> = async () => {
  try {
    const threadsRes = await _axios_instance.get("/messages/overview");
    return threadsRes.data as ThreadType[];
  } catch (err) {
    console.error("get messages overview error", err);
    return [];
  }
};

const fetchMessages = async (
  forThread: ThreadType | null,
  numItems?: number,
  offset?: number,
): Promise<{ messages: MessageType[]; totalCount: number }> => {
  if (!forThread) {
    // No thread selected (implemented this way for the fetchMore callback)
    return { messages: [], totalCount: 0 };
  }

  try {
    const messagesRes = await _axios_instance.get(
      `/messages/thread/${forThread.listing_id}/${forThread.other_participant.user_id}`,
      { params: { num_items: numItems, offset: offset } },
    );

    const { messages, totalCount } = messagesRes.data as {
      messages: MessageType[];
      totalCount: number;
    };

    return { messages, totalCount };
  } catch (err) {
    console.error("get messages error", err);
    return { messages: [], totalCount: 0 };
  }
};

const postMessage = async (
  currentThread: ThreadType,
  text: string,
): Promise<MessageType | null> => {
  try {
    const messageRes = await _axios_instance.post(`/messages`, {
      content: text,
      listing_id: currentThread.listing_id,
      receiver_id: currentThread.other_participant.user_id,
    });
    return messageRes.data as MessageType;
  } catch (err) {
    console.error("post message error", err);
    return null;
  }
};

const Messages = () => {
  const s = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [threads, setThreads] = useState<ThreadType[]>([]);
  const messagesReducer = usePaginatedArrayReducer<MessageType>(
    "message_id",
    [],
    (a, b) =>
      a.created_at < b.created_at || a.message_id < b.message_id ? 1 : -1,
  );
  const [totalMessages, setTotalMessages] = useState<number>(0);

  // Workaround for not having a fixed-height header (unfortunately, this is
  // necessary for the infinite scroll)
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, [headerRef]);

  const [currentThread, setCurrentThread] = useState<ThreadType | null>(null);
  const isMobileSize = useMediaQuery("(max-width:740px)");

  const shouldShowMessages = !isMobileSize || (isMobileSize && currentThread);

  const fetchMoreMessages = useCallback(
    async (thread, currentNumMessages) => {
      const { messages, totalCount } = await fetchMessages(
        thread,
        undefined,
        currentNumMessages,
      );
      messagesReducer.add(messages);
      setTotalMessages(totalCount);
    },
    [messagesReducer.add],
  );

  // fetch all conversations + messages for the first conversation
  useEffect(() => {
    // IIFE because useEffect can't take an async callback
    (async () => {
      setLoading(true);
      const threads = await fetchThreads();
      // Don't continue setting an active thread or getting messages if there
      // are no threads
      setThreads(threads);
      if (threads.length == 0) {
        setLoading(false);
        return;
      }

      // By default, the first thread is selected.
      const currentThread = threads[0];
      setCurrentThread(currentThread);

      // Fetch messages for the first thread
      fetchMoreMessages(currentThread, 0);
      setLoading(false);
    })();
  }, [fetchMoreMessages]);

  const onMessageSend = async (text: string) => {
    if (!currentThread) {
      console.error("can't send: no current thread");
      return;
    }

    const message = await postMessage(currentThread, text);
    if (!message) return;
    messagesReducer.add([message] as MessageType[]);
    setTotalMessages((old) => old + 1);
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
                    load={() =>
                      fetchMoreMessages(
                        currentThread,
                        messagesReducer.state.length,
                      )
                    }
                    hasMore={totalMessages > messagesReducer.state.length}
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
                    {messagesReducer.state.map((item) => (
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
