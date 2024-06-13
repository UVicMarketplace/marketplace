import { Box, Container, Stack } from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../components/searchBar";

const test_items = ["hi", "abc", "auidh"];

const Messages = () => {
  const s = useStyles();

  const fetchMore = () => {
    console.log("fetch more messages");
  };

  return (
    <>
      <SearchBar />
      <Stack direction="row" sx={s.messagesBox}>
        <Box sx={s.messagesSidebar}>sidebar</Box>
        <Box sx={s.messagesMain}>
          <InfiniteScroll
            dataLength={test_items.length}
            next={fetchMore}
            hasMore={true}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {test_items}
          </InfiniteScroll>
        </Box>
      </Stack>
    </>
  );
};

export default Messages;
