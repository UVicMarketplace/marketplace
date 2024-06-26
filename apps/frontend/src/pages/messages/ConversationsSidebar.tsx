import { ThreadType } from "../../types";
import { Box, Stack } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";

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
              src={thread.other_participant.profile_pic_url}
              sx={s.messagesConvImg}
            />
          </button>
        ))}
      </Stack>
    </Box>
  );
};
