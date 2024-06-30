import { Box } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";
import { MessageType } from "../../types";

const user_id = "5"; //TODO: get from auth (in a Context or something)

export type MessageProps = {
  message: MessageType;
};
export const Message = ({ message }: MessageProps) => {
  const s = useStyles();
  return (
    <Box
      sx={message.sender_id == user_id ? s.messageFromUser : s.messageFromOther}
    >
      {message.message_body + " (id: " + message.message_id + ")"}
    </Box>
  );
};
