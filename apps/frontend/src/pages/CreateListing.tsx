import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import _axios_instance from "../_axios_instance.tsx";
import { colors } from "../styles/colors.tsx";
import MultiFileUpload from "../extra_components/MultiFileUpload.tsx";
import Carousel from "../extra_components/Carousel.tsx";

interface URLObject {
  url: string;
}
interface LocationObject {
  latitude: number,
  longitude: number,
}

interface ListingObject {
  title: string;
  description: string;
  price: number;
  location: LocationObject;
  images: URLObject[];
}

interface NewListingObject {
  listing: ListingObject;
}

const CreateListing = () => {
  const [images, setImages] = useState<string[]>([]);

  // This newListingObject bundles all the listing data for upload to the server
  const [newListingObject, setNewListingObject] = useState<NewListingObject>({
    listing: {
      title: "",
      description: "",
      price: 0,
      location: {
        latitude: 0.0,
        longitude: 0.0,
      },
      images: [],
    },
  });

  // Gets the user location, and adds it to the listing object
  const getUserLocation = useCallback(async () => {
    try {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            newListingObject.listing.location.longitude = position.coords.longitude;
            newListingObject.listing.location.latitude = position.coords.latitude;
            resolve(true);
          },
          (error) => {
            console.error('Error getting location:', error);
            reject(false);
          }
        );
      });
    } catch (error) {
      console.error('Error in getUserLocation:', error);
      return false;
    }
  }, [newListingObject.listing.location]);

  // Updates and sends the newListingObject, to the server via post under /api/listing
  const sendPostToCreateListing = async () => {
    // In order to make sure that the images are retrieved before submitting
    const successImages = await uploadImages();
    let successLocation: boolean = true;
    if (newListingObject.listing.location.latitude !== 0){
      successLocation = false;
      getUserLocation().then(() => {successLocation = true})
    }
    //console.log("Image Successful", imageUploadSuccessful)
    console.log("New Listing Object", newListingObject)
    if (successImages && successLocation) {
      _axios_instance
      .post("/listing", newListingObject)
      .then((response) => {
        alert("Listing Created!");
        console.log("Response to upload", response);
      })
      .catch((error) => {
        console.log("Response to error", error);
        alert("Listing Creation Failed");
      });
    } else if (!successImages) {
      alert("Images failed to upload, please try again later")
    }else {
      // Currently this is added to catch if the location is not set, we could default this to the location of the university instead
      alert("Error occurred when creating a listing, you may need to enable location permissions for this site")
    }
  };

  // This function makes sure that the passed in url is a base64 data string
  const isImageValid = (url: string) => {
    try {
      return url.startsWith("data");
    } catch (error) {
      return error === TypeError && url === undefined;
    }
  };

  // Request the user's location on load
  useEffect(() => {
    getUserLocation().then(r => console.log(r));
  }, [getUserLocation]);

  // Uploads the images to the s3 server, this is handled seperately
  // This may need to be modified to use File objects instead of the file strings
  const uploadImages = async () => {
    try {
      await Promise.all(
        images.map(async (image) => {
          try {
            const response = await _axios_instance.post(
              "/images",
              { image: image },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            newListingObject.listing.images.push({url: response.data.url});
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        })
      );
      return true;
    } catch (error) {
      console.error("Error uploading images:", error);
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
    <Container>
      <Card>
        <CardContent>
          <Typography variant={"h2"}>Create Listing</Typography>
          <Grid container spacing={1}>
            <Grid item md={6} sm={12} xs={12}>
              <Box>
                <form noValidate autoComplete="off">
                  <FormControl sx={{ width: "100%", padding: "10px" }}>
                    <TextField
                      id="field-title"
                      label="Title"
                      sx={{ m: "10px" }}
                      onChange={(event) =>
                        setNewListingObject((prevState) => ({
                          ...prevState,
                          listing: {
                            ...prevState.listing,
                            title: event.target.value,
                          },
                        }))
                      }
                    />
                    <TextField
                      id="field-description"
                      label="Description"
                      type={"text"}
                      sx={{ m: "10px", display: "flex" }}
                      rows={10}
                      multiline
                      onChange={(event) =>
                        setNewListingObject((prevState) => ({
                          ...prevState,
                          listing: {
                            ...prevState.listing,
                            description: event.target.value,
                          },
                        }))
                      }
                    />
                    <TextField
                      id="field-price"
                      label="Price(CAD)"
                      type="number"
                      sx={{ m: "10px" }}
                      onChange={(event) =>
                        setNewListingObject((prevState) => ({
                          ...prevState,
                          listing: {
                            ...prevState.listing,
                            price: parseFloat(event.target.value),
                          },
                        }))
                      }
                    />
                  </FormControl>
                </form>
              </Box>
              <Grid container sx={{ padding: "10px" }}>
                <Grid item sm={12}>
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
                      onClick={sendPostToCreateListing}
                      id={"submit-button"}
                    >
                      Create Listing
                    </Button>
                    <MultiFileUpload
                      passedImages={images}
                      setPassedImages={setImages}
                      multipleUpload={true}
                      htmlForButton={buttonHTML}
                    />
                  </Box>
                </Grid>
                <Grid item sm={4}></Grid>
              </Grid>
            </Grid>
            <Grid item lg={6} xs={12}>
              <Box>
                <Typography variant={"h5"} sx={{ paddingLeft: "20px" }}>
                  Image Preview
                </Typography>
                <Box sx={{ padding: "10px" }}>
                  {!isImageValid(images[0]) ? (
                    <Typography sx={{ paddingLeft: "10px" }} variant={"body2"}>
                      No images uploaded yet
                    </Typography>
                  ) : (
                    <Carousel imageURLs={images} />
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateListing;
