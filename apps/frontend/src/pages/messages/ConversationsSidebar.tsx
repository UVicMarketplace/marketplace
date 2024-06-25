import { ThreadType } from "../../types";
import { Box, Stack } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";

const testConvs = Array.from({ length: 5 }).map((_, index) => ({
  listing_id: index.toString(),
  user1_id: "1",
  user2_id: "2",
  latest_message_text: `message ${index + 1}`,
  img_url: "https://via.placeholder.com/150",
}));

type ConversationsSidebarProps = {
  threads: ThreadType[];
  selectThread: (thread: ThreadType) => void;
};
export const ConversationsSidebar = ({
  threads,
  selectThread,
}: ConversationsSidebarProps) => {
  const s = useStyles();

  return (
    <Box sx={s.messagesConvSidebar}>
      <Stack direction="row">
        <p>Conversations</p>
      </Stack>
      <Stack direction="column">
        {threads.map((thread) => (
          <button
            key={thread.listing_id}
            style={s.messagesConvBox}
            onClick={() => selectThread(thread)}
          >
            <div style={s.messagesConvPreviewText}>
              {thread.last_message.content}
            </div>
            <Box
              component="img"
              src={thread.other_participant.profilePicture}
              alt="listing"
              sx={s.messagesConvImg}
            />
          </button>
        ))}
      </Stack>
    </Box>
  );
};
