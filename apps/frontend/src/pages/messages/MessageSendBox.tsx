import { Box, Button, Input, Stack } from "@mui/material";
import { useStyles } from "../../styles/pageStyles";
import { useState } from "react";

// Made this into a component because if it was all inline, every time the user
// types a message, the entire Messages component (page) would re-render
type MessageSendBoxProps = {
  onMessageSend: (text: string) => void;
};
export const MessageSendBox = ({ onMessageSend }: MessageSendBoxProps) => {
  const s = useStyles();
  const [text, setText] = useState<string>("");

  const onType = (e: React.ChangeEvent) => {
    // @ts-expect-error - doesn't matter
    setText(e.currentTarget.value);
  };

  const onClickSend = () => {
    if (text === "") {
      return;
    }
    onMessageSend(text);
    setText("");
  };

  return (
    <Box sx={s.messagesSendBox}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Stack direction="row">
          <Input onChange={onType} value={text} />
          <Button
            type="submit"
            size="small"
            onClick={onClickSend}
            sx={s.button}
          >
            Send
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
