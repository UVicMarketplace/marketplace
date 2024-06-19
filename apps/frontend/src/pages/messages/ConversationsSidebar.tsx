import { useState } from "react";
import { ConversationType } from "../../types";
import { Box, Stack } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";

const testConvs = Array.from({ length: 5 }).map((_, index) => ({
  listing_id: index.toString(),
  user1_id: "1",
  user2_id: "2",
  latest_message_text: `message ${index + 1}`,
  img_url: "https://via.placeholder.com/150",
}));

type ConversationsSidebarProps = {};
export const ConversationsSidebar = ({}: ConversationsSidebarProps) => {
  const s = useStyles();
  const [convs, setConvs] = useState<ConversationType[]>(testConvs);

  return (
    <Stack direction="column" sx={s.messagesConvSidebar}>
      {convs.map((conv) => (
        <Box key={conv.listing_id} sx={s.messagesConvBox}>
          <div>{conv.latest_message_text}</div>
          <Box
            component="img"
            src={conv.img_url}
            alt="listing"
            sx={s.messagesConvImg}
          />
        </Box>
      ))}
    </Stack>
  );
};
