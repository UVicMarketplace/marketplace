import { Avatar, Box, Typography } from "@mui/material";
import _axios_instance from "../_axios_instance";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/searchBar";

interface profileObject {
  userID: string;
  username: string;
  name: string;
  bio: string;
  profileUrl: string;
}

const ViewProfile = () => {
  const [profile, setProfile] = useState<profileObject>({
    userID: "",
    username: "",
    name: "",
    bio: "",
    profileUrl: "",
  });

  const { id } = useParams<{ id: string }>();

  // Load the profile info for another user from the api given an ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await _axios_instance.get("/user/" + id);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [id]);

  return (
    <>
      <SearchBar />
      <Box
        sx={{
          display: "flex",
          position: "relative",
          zIndex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ marginTop: 2 }}>
          User Profile
        </Typography>
        <Avatar
          src={profile.profileUrl}
          alt="Profile Picture"
          sx={{ width: 150, height: 150, mt: 2, mb: 2 }}
          id="profile_picture"
        />
        <Box
          sx={{
            mt: 2,
            maxWidth: "300px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom id="username">
            <strong>Username:</strong> {profile.username}
          </Typography>
          <Typography variant="h6" gutterBottom id="name">
            <strong>Name:</strong> {profile.name}
          </Typography>
          <Box
            sx={{
              whiteSpace: "pre-line",
              textAlign: "left",
              mt: 1,
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fff",
            }}
          >
            {profile.bio}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ViewProfile;
