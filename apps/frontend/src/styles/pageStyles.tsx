import { colors } from "./colors";

export const vars = Object.freeze({
  messagesSendBoxHeight: "4rem",
});

export const useStyles = () => ({
  // Login and Create Account page styles
  loginAndCreateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "30%",
  },
  HomePageBox: {
    flexDirection: "column",
    alignItems: "top",
    justifyContent: "top",
    margin: "0px",
    padding: "0px 10px",
  },
  form: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    mt: 1,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "100%",
  },
  buttonOutline: {
    mt: 1,
    outline: "1px solid #001647",
    backgroundColor: "white",
    color: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: "#808080" },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "100%",
  },
  yellowButton: {
    backgroundColor: colors.martletplaceYellow,
    "&:hover": { backgroundColor: "orange" },
  },
  whiteButton: {
    backgroundColor: "white",
    outline: "1px solid #808080",
    "&:hover": {
      backgroundColor: colors.martletplaceGrey,
      outline: "1px solid grey",
    },
  },
  homepageButton: {
    color: colors.martletplaceBlack,
    fontSize: "1.2em",
    backgroundColor: "transparent",
    boxShadow: "none",
    textTransform: "none",
    outline: "none",
    "&:hover": {
      boxShadow: "none",
      textTransform: "none",
      outline: "none",
      backgroundColor: "transparent",
    },
    "&:focus": {
      backgroundColor: "transparent",
      boxShadow: "none",
      outline: "none",
      transform: "none",
    },
    "&:active": {
      backgroundColor: "transparent",
      boxShadow: "none",
      outline: "none",
      transform: "none",
    },
    padding: "0",
  },
  link: {
    mt: 2,
    color: colors.martletplaceBlack,
    "&:hover": { color: colors.martletplaceBlueHover },
  },
  searchBar: {
    borderColor: colors.martletplaceGrey,
  },
  searchGrid: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "30%",
  },

  // Account page styles
  drawer: {
    width: "350px",
    flexShrink: 0,
    position: "relative",
    zIndex: 5,
    "& .MuiDrawer-paper": {
      width: "350px",
      boxSizing: "border-box",
      marginTop: "90px",
    },
  },
  listItemButton: {
    height: "80px",
    "&:hover": {
      backgroundColor: colors.martletplaceGreyClicked,
    },
  },
  listItemText: {
    backgroundColor: colors.martletplaceGreyClicked,
  },
  accountBox: {
    flexGrow: 1,
    bgcolor: "background.default",
    p: 3,
    marginLeft: "350px",
  },

  // Profile page styles
  uploadPfp: {
    mt: 2,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "200px",
    height: "50px",
    alignProperty: "center",
  },

  saveButton: {
    mt: 2,
    backgroundColor: colors.martletplaceNavyBlue,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "45%",
    marginRight: "10px",
    marginLeft: "15px",
    marginBottom: "30px",
  },

  cancelButton: {
    mt: 2,
    backgroundColor: colors.martletplaceRed,
    "&:hover": { backgroundColor: colors.martletplaceRedClicked },
    textTransform: "none",
    fontSize: "16px",
    padding: "10px 0",
    width: "45%",
    marginBottom: "30px",
  },
  CreateListingButton: {
    backgroundColor: colors.martletplaceYellow,
    color: colors.martletplaceWhite,
    "&:hover": { backgroundColor: colors.martletplaceYellowHover },
    fontSize: "16px",
    height: "80px",
  },
  logOutButton: {
    backgroundColor: colors.martletplaceNavyBlue,
    color: colors.martletplaceWhite,
    "&:hover": { backgroundColor: colors.martletplaceBlueHover },
    fontSize: "16px",
    height: "80px",
  },

  // Messages page styles
  messagesConvSidebar: {
    overflowY: "scroll",
    width: "20rem",
    height: "100%",
    borderRight: "2px solid",
    borderColor: colors.martletplaceGrey,
    "@media (max-width: 740px)": {
      width: "100%",
    },
  },
  messagesMessagesBox: {
    height: "100%",
    overflowY: "scroll",

    display: "flex",
    flexDirection: "column-reverse" as "column-reverse",
    alignItems: "center",
    gap: "1rem",

    "& :first-child": {
      marginBottom: "0.25rem",
    },
  },
  messagesSendBox: {
    height: vars.messagesSendBoxHeight,
    borderTop: "2px solid",
    borderColor: colors.martletplaceGrey,
    color: colors.martletplaceGrey,
  },
  messagesSendButton: {},
  messageFromUser: {
    alignSelf: "flex-end",
    backgroundColor: colors.martletplaceGrey,
    color: colors.martletplaceWhite,
    padding: "0.5rem",
    maxWidth: "80vw",
    borderRadius: "10px",
    textAlign: "right",
    borderBottomRightRadius: "2px",
    marginInline: "1rem",
  },
  messageFromOther: {
    alignSelf: "flex-start",
    backgroundColor: colors.martletplaceSkyBlue,
    color: colors.martletplaceWhite,
    padding: "0.5rem",
    maxWidth: "80vw",
    borderRadius: "10px",
    textAlign: "left",
    borderBottomLeftRadius: "2px",
    marginInline: "1rem",
  },
  messagesConvBox: {
    display: "flex",
    flexDirection: "row" as "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "0.5rem",
    borderBottom: "1px solid",
    borderColor: colors.martletplaceGrey,
  },
  messagesConvImg: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  messagesConvPreviewText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  messagesHideThreadButton: {
    position: "absolute",
    top: "0.5rem",
    left: "0.5rem",
    backgroundColor: colors.martletplaceNavyBlue,
    color: colors.martletplaceWhite,
    "&:hover": {
      backgroundColor: colors.martletplaceBlueHover,
    },
  },
});
