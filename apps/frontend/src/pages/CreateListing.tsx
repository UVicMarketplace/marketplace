import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FormEventHandler, useState } from "react";
import _axios_instance from "../_axios_instance.tsx";
import { colors } from "../styles/colors.tsx";
import MultiFileUpload from "../components/MultiFileUpload.tsx";
import Carousel from "../components/Carousel.tsx";
import SearchBar from "../components/searchBar.tsx";
import { useNavigate } from "react-router-dom";

interface ImageURLObject {
  url: string;
}
interface LocationObject {
  latitude: number;
  longitude: number;
}

interface ListingObject {
  title: string;
  description: string;
  price: number;
  location: LocationObject;
  images: ImageURLObject[];
}

interface NewListingObject {
  listing: ListingObject;
}

const CreateListing = () => {
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [listingImageBinaries, setListingImageBinaries] = useState<string[]>(
    [],
  );
  const [location, setLocation] = useState<LocationObject>({
    latitude: 48.463302,
    longitude: -123.3108,
  });
  const [priceError, setPriceError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>(
    "This field is required",
  );
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  // This newListingObject bundles all the listing data for upload to the server
  const [newListingObject, setNewListingObject] = useState<NewListingObject>({
    listing: {
      title: "",
      description: "",
      price: 0,
      location: {
        latitude: 48.463302,
        longitude: -123.3108,
      },
      images: [],
    },
  });

  // Updates and sends the newListingObject, to the server via post under /api/listing
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    submissionEvent,
  ) => {
    submissionEvent.preventDefault();
    console.log("Listing Image Binaries", listingImageBinaries);
    if (!priceError && !titleError && !sent) {
      // In order to make sure that the images are retrieved before submitting
      const successImages: boolean = await asyncListingImageWrapper();

      if (successImages) {
        _axios_instance
          .post("/listing", newListingObject)
          .then(() => {
            alert("Listing Created!");
            setSent(true);
            navigate("/user/listings");
          })
          .catch(() => {
            alert("Listing Creation Failed");
            setSent(false);
          });
      } else if (!successImages) {
        alert("Images failed to upload, please try again later");
        setSent(false);
      } else {
        // Currently this is added to catch if the location is not set, we could default this to the location of the university instead
        alert(
          "Error occurred when creating a listing, you may need to enable location permissions for this site",
        );
        setSent(false);
      }
    }
  };

  const updateNewListingPayload = (
    key: keyof ListingObject,
    value: string | number | LocationObject,
  ) => {
    if (["title", "description", "price", "location", "images"].includes(key)) {
      setNewListingObject((prevState) => ({
        ...prevState,
        listing: {
          ...prevState.listing,
          [key]: value,
        },
      }));
      return newListingObject.listing[key] === value;
    }
  };

  const asyncListingImageWrapper = async (): Promise<boolean> => {
    try {
      const imagesObjectArray = await asyncUploadImages();
      if (imagesObjectArray) {
        const tempListingObject = newListingObject;
        tempListingObject.listing.images = imagesObjectArray;
        setNewListingObject(tempListingObject);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      return false;
    }
  };

  const updateListingTitle = (event: ChangeEvent<HTMLInputElement>) => {
    // Handle
    if (!event.target.value) {
      setTitleError("This field is required");
    } else {
      setTitleError("");
    }
    updateNewListingPayload("title", event.target.value);
  };

  const updateListingDescription = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    // Handle
    updateNewListingPayload("description", event.target.value);
  };

  const updateListingPrice = (event: ChangeEvent<HTMLInputElement>) => {
    // Handle
    const regex = /^\d+(.\d{1,2})?$/;
    if (!regex.test(event.target.value)) {
      setPriceError(
        "This price is not valid, please make sure the value is positive and in the form xx.xx",
      );
    } else {
      setPriceError("");
      const priceValue: number = +event.target.value;
      updateNewListingPayload(
        "price",
        priceValue >= 0 ? priceValue : priceValue * -1,
      );
    }
  };

  // Gets the user location, and adds it to the listing object
  const updateListingLocation = () => {
    try {
      const currentLocation: LocationObject = { latitude: 0, longitude: 0 };
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;
        if (currentLatitude !== 0 && currentLongitude !== 0) {
          currentLocation.latitude = currentLatitude;
          currentLocation.longitude = currentLongitude;
          setLocation(currentLocation);
          updateNewListingPayload("location", currentLocation);
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // This function makes sure that the passed in url is a base64 data string
  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data:image/");
    } catch (error) {
      return false;
    }
  };

  // Uploads the images to the S3 server, this is handled separately
  const asyncUploadImages = async (): Promise<ImageURLObject[] | false> => {
    const retrievedImages: ImageURLObject[] = [];
    // Create an array of promises for image uploads
    const uploadPromises = listingImageBinaries.map(async (imageBinary) => {
      try {
        // Attempt to upload the image
        const response = await _axios_instance.post("/images", imageBinary, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Return the URL of the uploaded image on success
        return { url: response.data.url };
      } catch (error) {
        // Log error and return null on failure
        console.error("Error uploading image:", error);
        return null; // Indicate failure with null
      }
    });

    try {
      // Wait for all upload promises to resolve
      const results = await Promise.all(uploadPromises);

      // Filter successful uploads and add to retrievedImages
      results.forEach((result) => {
        if (result) {
          retrievedImages.push(result);
        }
      });

      // Return the list of successfully uploaded images
      return retrievedImages;
    } catch (error) {
      // Handle any errors that occurred during the uploading process
      console.error("Error in uploading image process:", error);
      return false;
    }
  };

  // Upload button html
  const buttonHTML = (
    <span style={{ textAlign: "center" }}>
      <Button
        className="btn-choose"
        variant="outlined"
        component="span"
        sx={{
          mt: 2,
          textTransform: "none",
          fontSize: "16px",
          padding: "10px 20px",
          margin: "10px",
        }}
      >
        Choose Images
      </Button>
    </span>
  );

  return (
    <>
      <SearchBar />
      <Container>
        <Card sx={{ marginTop: "32px" }}>
          <CardContent>
            <Typography variant={"h5"}>Create Listing</Typography>
            <Grid container spacing={1}>
              <Grid item md={6} sm={12} xs={12}>
                <Box>
                  <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <FormControl sx={{ width: "100%", padding: "10px" }}>
                      <TextField
                        id="field-title"
                        label="Title"
                        sx={{ m: "10px" }}
                        rows={1}
                        onChange={updateListingTitle}
                        required
                        error={!!titleError}
                      />
                      {titleError && (
                        <FormHelperText error>{titleError}</FormHelperText>
                      )}
                      <TextField
                        id="field-description"
                        label="Description"
                        type="text"
                        sx={{ m: "10px", display: "flex" }}
                        rows={10}
                        multiline
                        onChange={updateListingDescription}
                      />
                      <TextField
                        id="field-price"
                        label="Price(CAD)"
                        type="number"
                        sx={{ m: "10px" }}
                        rows={1}
                        InputProps={{ inputProps: { min: 0 } }}
                        onChange={updateListingPrice}
                        error={!!priceError}
                      />
                      {priceError && (
                        <FormHelperText error>{priceError}</FormHelperText>
                      )}
                      <Button
                        variant="contained"
                        id="location-button"
                        onClick={updateListingLocation}
                        sx={{
                          display: "inline",
                          mt: 2,
                          backgroundColor: colors.martletplaceNavyBlue,
                          "&:hover": {
                            backgroundColor: colors.martletplaceBlueHover,
                          },
                          textTransform: "none",
                          fontSize: "16px",
                          padding: "10px 20px",
                          margin: "10px",
                        }}
                      >
                        Update Location
                      </Button>
                      <Typography>
                        Current Location: {location.latitude} latitude and{" "}
                        {location.longitude} longitude
                      </Typography>
                    </FormControl>
                    <Box sx={{ display: "flex" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          display: "inline",
                          mt: 2,
                          backgroundColor: colors.martletplaceNavyBlue,
                          "&:hover": {
                            backgroundColor: colors.martletplaceBlueHover,
                          },
                          textTransform: "none",
                          fontSize: "16px",
                          padding: "10px 20px",
                          margin: "10px",
                        }}
                        id={"submit-button"}
                      >
                        Create Listing
                      </Button>
                      <MultiFileUpload
                        passedImages={listingImages}
                        setPassedImages={setListingImages}
                        multipleUpload={true}
                        htmlForButton={buttonHTML}
                        imageBinary={listingImageBinaries}
                        setImageBinaries={setListingImageBinaries}
                      />
                    </Box>
                  </form>
                </Box>
              </Grid>
              <Grid item lg={6} xs={12}>
                <Box>
                  <Typography variant={"h5"} sx={{ paddingLeft: "20px" }}>
                    Image Preview
                  </Typography>
                  <Box sx={{ padding: "10px" }}>
                    {!isImageValid(listingImages[0]) ? (
                      <Typography
                        sx={{ paddingLeft: "10px" }}
                        variant={"body2"}
                      >
                        No images uploaded yet
                      </Typography>
                    ) : (
                      <Carousel imageURLs={listingImages} />
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default CreateListing;
