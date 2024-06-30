import {
  Grid,
  Button,
  Box,
  FormControl,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  SelectChangeEvent,
  Select,
  Typography,
  FormHelperText,
} from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import { useState, ChangeEvent, useEffect } from "react";
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

interface FiltersProps {
  filters: SearchObject;
  onFilterChange: (filters: Partial<SearchObject>) => void;
}

const Filters = ({ filters, onFilterChange }: FiltersProps) => {
  const classes = useStyles();

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("AVAILABLE");
  const [type, setType] = useState<string>("LISTINGS");
  const [latitude, setLatitude] = useState<number>(48.463302);
  const [longitude, setLongitude] = useState<number>(-123.3108);
  const [priceError, setPriceError] = useState<string>("");

  const handleMinPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const regex = /^\d+(\.\d{1,2})?$/;
    const newMinPrice = +event.target.value;
    if (event.target.value === "") {
      setPriceError("");
      setMinPrice(null);
    } else if (!regex.test(event.target.value)) {
      setPriceError(
        "This price is not valid, please make sure the value is positive and in the form xx.xx",
      );
    } else if (newMinPrice === null) {
      setPriceError("");
      setMinPrice(null);
    } else if (maxPrice !== null && newMinPrice > maxPrice) {
      setPriceError(
        "This price is not valid, please make sure the min price is less than the max price",
      );
    } else {
      setPriceError("");
      const priceValue: number = +event.target.value;
      setMinPrice(priceValue >= 0 ? priceValue : priceValue * -1);
    }
    setMinPrice(newMinPrice === null ? null : +newMinPrice);
    onFilterChange({
      minPrice: event.target.value === "" ? null : +event.target.value,
      maxPrice: maxPrice,
      status: status,
      searchType: type,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const handleMaxPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const regex = /^\d+(\.\d{1,2})?$/;
    const newMaxPrice = +event.target.value;
    if (event.target.value === "") {
      setPriceError("");
      setMaxPrice(null);
    } else if (!regex.test(event.target.value)) {
      setPriceError(
        "This price is not valid, please make sure the value is positive and in the form xx.xx",
      );
    } else if (newMaxPrice === null) {
      setPriceError("");
      setMaxPrice(null);
    } else if (minPrice !== null && newMaxPrice < minPrice) {
      setPriceError(
        "This price is not valid, please make sure the min price is less than the max price",
      );
    } else {
      setPriceError("");
      const priceValue: number = +event.target.value;
      setMaxPrice(priceValue >= 0 ? priceValue : priceValue * -1);
    }
    setMaxPrice(newMaxPrice === null ? null : +newMaxPrice);
    onFilterChange({
      minPrice: minPrice,
      maxPrice: event.target.value === "" ? null : +event.target.value,
      status: status,
      searchType: type,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value);
    onFilterChange({
      minPrice: minPrice,
      maxPrice: maxPrice,
      status: event.target.value,
      searchType: type,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setType(event.target.value);
    onFilterChange({
      minPrice: minPrice,
      maxPrice: maxPrice,
      status: status,
      searchType: event.target.value,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const handleApplyFilters = () => {
    onFilterChange({
      minPrice: minPrice,
      maxPrice: maxPrice,
      status: status,
      searchType: type,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const handleClearFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setStatus("AVAILABLE");
    setType("LISTINGS");
    onFilterChange({
      minPrice: null,
      maxPrice: null,
      status: "AVAILABLE",
      searchType: "LISTINGS",
      latitude: 48.463302,
      longitude: -123.3108,
    });
  };

  // Gets the user location, returns false on failure, defaults to uvic
  const getLocation = () => {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;
        if (currentLatitude !== 0 && currentLongitude !== 0) {
          setLatitude(currentLatitude);
          setLongitude(currentLongitude);
          handleApplyFilters();
          return true;
        }
      });
      return false;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setStatus(filters.status);
    setType(filters.searchType);
    setLatitude(filters.latitude);
    setLongitude(filters.longitude);
  }, [filters]);

  return (
    <Grid item container lg={6} xs={9}>
      <Typography variant="h6" component="h3" m={1}>
        Filters
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Min</FormHelperText>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            placeholder="Min"
            value={minPrice === null ? "" : minPrice}
            onChange={handleMinPriceChange}
            type="number"
            error={!!priceError}
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Max</FormHelperText>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            placeholder="Max"
            value={maxPrice === null ? "" : maxPrice}
            onChange={handleMaxPriceChange}
            type="number"
            error={!!priceError}
          />
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Status</FormHelperText>
          <Select
            value={status}
            onChange={handleStatusChange}
            displayEmpty
            id="status-select"
          >
            <MenuItem disabled value="">
              <em>Status</em>
            </MenuItem>
            <MenuItem value="AVAILABLE">Available</MenuItem>
            <MenuItem value="SOLD">Not Available</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Type</FormHelperText>
          <Select value={type} onChange={handleTypeChange} id="type-select">
            <MenuItem value="LISTINGS">Listings</MenuItem>
            <MenuItem value="USERS">Users</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          onClick={getLocation}
          sx={{
            m: 1,
            backgroundColor: colors.martletplaceNavyBlue,
            "&:hover": { backgroundColor: colors.martletplaceBlueHover },
            textTransform: "none",
            fontSize: "16px",
            padding: "13px 0",
            align: "center",
            marginTop: "30px",
            width: "100%",
          }}
        >
          Update Location
        </Button>
      </Box>

      <Box
        sx={{
          width: "60%",
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          type="submit"
          variant="contained"
          sx={classes.buttonOutline}
          onClick={handleClearFilters}
        >
          Clear Filter
        </Button>
      </Box>
      {priceError && <FormHelperText error>{priceError}</FormHelperText>}
    </Grid>
  );
};

export default Filters;
