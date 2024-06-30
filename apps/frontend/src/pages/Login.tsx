import { useState, FormEvent } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";
import useUser from "../hooks/useUser";
import axios from "axios";
import { User } from "../types";

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const isFormIncomplete = !email || !password || !totpCode;
  const { setUser } = useUser();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (/^\d*$/.test(totpCode) && totpCode.length === 6) {
      setTotpCode(totpCode);
      setError("");
    } else {
      setError("TOTP must be 6 numbers.");
      return;
    }

    try {
      const response = await axios.post("/api/user/login", {
        email,
        password,
        totpCode,
      });

      setUser(response.data as User);

      navigate("/");
    } catch (error) {
      setError("Authentication failed.");
    }
  };

  return (
    <Box sx={classes.loginAndCreateBox}>
      <img
        src={martletPlaceLogo}
        alt="MartletPlace Logo"
        style={{ width: "100px", marginBottom: "16px" }}
      />
      <Typography variant="h4" component="h1" gutterBottom>
        MartletPlace
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={classes.form}>
        <TextField
          label="Email"
          variant="outlined"
          required
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
        />
        <TextField
          label="Password"
          variant="outlined"
          required
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
        />
        <TextField
          label="TOTP Code"
          variant="outlined"
          required
          type="text"
          fullWidth
          margin="normal"
          value={totpCode}
          onChange={(e) => {
            setTotpCode(e.target.value);
          }}
          id="totpCode"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={classes.button}
          disabled={isFormIncomplete}
        >
          Login
        </Button>
        <Link href="/user/resetpassword" underline="hover" sx={classes.link}>
          Forgot Password?
        </Link>
        <Link href="/user/signup" underline="hover" sx={classes.link}>
          New? Create an Account
        </Link>
      </Box>
    </Box>
  );
};

export default Login;
