import {
  Grid,
  Button,
  TextField,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import message from "../images/message.png";
import filter from "../images/filter.png";
import { useStyles } from "../styles/pageStyles";
import { useState, ChangeEvent, useEffect } from "react";
import Filters from "./filters";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import React from "react";
import useUser from "../hooks/useUser";
import { colors } from "../styles/colors";

interface SearchObject {
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  status: string;
  searchType: string;
  latitude: number;
  longitude: number;
  sort: string;
  page: number;
  limit: number;
}

const SearchBar = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleMessageRoute = () => {
    // TODO Fix
    window.location.href = `mailto:example@example.com?subject=MessagingMock`;

    //navigate("/messages");
  };

  const handleAccountRoute = () => {
    navigate("/user/profile");
  };

  const handleReload = () => {
    navigate("/");
    window.location.reload();
  };

  const handleListingRoute = () => {
    navigate("/user/listings");
  };

  const handleLogout = () => {
    logout();
    navigate("/user/login");
  };

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<SearchObject>({
    query: "",
    minPrice: null,
    maxPrice: null,
    status: "AVAILABLE",
    searchType: "LISTINGS",
    latitude: 48.463302,
    longitude: -123.3108,
    sort: "RELEVANCE",
    page: 1,
    limit: 6,
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleFilterChange = (newFilters: Partial<SearchObject>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handleSearch = () => {
    const searchObject: SearchObject = {
      ...filters,
      query: searchInput,
    };
    //Put search object in the URL
    const params = new URLSearchParams({
      query: searchObject.query,
      minPrice: searchObject.minPrice?.toString() ?? "",
      maxPrice: searchObject.maxPrice?.toString() ?? "",
      status: searchObject.status,
      searchType: searchObject.searchType,
      latitude: searchObject.latitude.toString(),
      longitude: searchObject.longitude.toString(),
      sort: searchObject.sort,
      page: searchObject.page.toString(),
      limit: searchObject.limit.toString(),
    });

    navigate(`/query?${params.toString()}`);
  };

  const { query } = useParams();
  const location = useLocation();

  useEffect(() => {
    const searchObject: SearchObject = {
      query: "",
      minPrice: null,
      maxPrice: null,
      status: "AVAILABLE",
      searchType: "LISTINGS",
      latitude: 48.463302,
      longitude: -123.3108,
      sort: "RELEVANCE",
      page: 1,
      limit: 6,
    };
    if (location.pathname === "/query") {
      //Something was searched
      const regex = /([^&=]+)=([^&]*)/g;
      const searchString = location.search.slice(1);
      let match;
      while ((match = regex.exec(searchString)) !== null) {
        const key = decodeURIComponent(match[1]); // Decode key
        const value = decodeURIComponent(match[2]); // Decode value
        switch (key) {
          case "query":
            searchObject.query = value;
            break;
          case "minPrice":
            searchObject.minPrice = isNaN(+value) ? null : +value;
            break;
          case "maxPrice":
            searchObject.maxPrice = isNaN(+value) ? null : +value;
            break;
          case "status":
            searchObject.status = value;
            break;
          case "searchType":
            searchObject.searchType = value;
            break;
          case "latitude":
            searchObject.latitude = parseFloat(value);
            break;
          case "longitude":
            searchObject.longitude = parseFloat(value);
            break;
          case "sort":
            searchObject.sort = value;
            break;
          case "page":
            searchObject.page = parseInt(value);
            break;
          case "limit":
            searchObject.limit = parseInt(value);
            break;
          default:
            break;
        }
      }
    }
    setSearchInput(searchObject.query);
    setFilters(searchObject);
  }, [location, query]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDesktop = useMediaQuery("(min-width:1240px)");
  const isSmallPage = useMediaQuery("(min-width:740px)");

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 6px #808080",
        paddingBottom: "10px",
        marginBottom: "10px",
        position: "sticky",
        top: -1,
        zIndex: 10,
      }}
    >
      <Grid item>
        {isSmallPage && (
          <Button
            variant="contained"
            sx={classes.homepageButton}
            onClick={handleReload}
          >
            <img
              src={martletPlaceLogo}
              alt="MartletPlace Logo"
              style={{ width: "60px", marginBottom: "9px" }}
            />
            MartletPlace
          </Button>
        )}
      </Grid>
      <Grid item xs={6}>
        <TextField
          id="outlined-basic"
          placeholder="Search"
          variant="outlined"
          fullWidth
          sx={classes.searchBar}
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleKeyDown}
        />
      </Grid>
      <Grid item>
        <Button
          type="submit"
          variant="contained"
          sx={{
            ...classes.button,
            ...classes.whiteButton,
            backgroundColor: showFilters ? "#808080" : "white",
          }}
          onClick={toggleFilters}
        >
          <img src={filter} alt="Filter Icon" style={{ width: "45%" }} />
        </Button>
      </Grid>
      {isDesktop ? (
        <>
          <Grid item xs={1}>
            <Button
              type="submit"
              variant="contained"
              sx={{ ...classes.button, ...classes.yellowButton }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={0.3} />
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              sx={classes.button}
              onClick={handleMessageRoute}
            >
              <img src={message} alt="Message Icon" style={{ width: "45%" }} />
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button
              type="submit"
              variant="contained"
              sx={classes.button}
              onClick={handleAccountRoute}
            >
              Account
            </Button>
          </Grid>
        </>
      ) : (
        <>
          {/* Hamburger button */}
          <Grid item xs={1}>
            <Button
              onClick={handleClick}
              size="medium"
              sx={{
                ...classes.button,
                fontSize: "40px",
                maxHeight: "50px",
                marginTop: "8px",
                color: "white",
              }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              =
            </Button>
          </Grid>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleAccountRoute}>My Profile</MenuItem>
            <MenuItem onClick={handleListingRoute}>My Listings</MenuItem>
            <MenuItem onClick={handleMessageRoute}>Messaging</MenuItem>
            <MenuItem onClick={() => navigate("/listing/new")}>
              Create Listing
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              style={{ color: colors.martletplaceRed }}
            >
              Logout
            </MenuItem>
          </Menu>
        </>
      )}

      {showFilters && (
        <Filters filters={filters} onFilterChange={handleFilterChange} />
      )}
    </Grid>
  );
};

export default SearchBar;
