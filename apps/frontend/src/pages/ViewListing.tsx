import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import _axios_instance from "../_axios_instance.tsx";
import Carousel from "../extra_components/Carousel.tsx";
import { useStyles } from "../styles/pageStyles.tsx";
import { colors } from "../styles/colors.tsx";

const ViewListing = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const [listingObject, setListingObject] = useState({
    title: "Sample Title",
    description: "Sample Description",
    price: 0,
    seller_profile: { name: "John Smith" },
    dateCreated: "2024-05-23T15:30:00Z",
    distance: 4.2,
    images: [
      { url: "https://picsum.photos/1200/400" },
      { url: "https://picsum.photos/1200/600" },
      { url: "https://picsum.photos/1200/1200" },
      { url: "https://picsum.photos/600/1200" },
      { url: "https://picsum.photos/400/1200" },
    ],
  });

  // Load the listing from the api given an ID
  useEffect(() => {
    _axios_instance
      .get("/listing/" + id)
      .then((response) => {
        setListingObject(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  // Convert price to string
  const priceFormatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  });

  // Convert date to string
  const convertDate = (dateString: string) => {
    const dateTimeObject = new Date(dateString);
    return dateTimeObject.toDateString();
  };

  // TODO Make the routing with auth work properly
  const handleNavToMessages = () => {
    navigate("/messages");
  };

  return (
    <Container>
      <Card sx={{ height: "100%", width: "100%" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item sm={12} md={12} lg={6}>
              <Typography variant={"h2"}>
                {listingObject !== null
                  ? listingObject.title
                  : "Title not received"}
              </Typography>
              <Typography variant={"body1"}>
                {listingObject.description}
              </Typography>
              <hr
                style={{
                  border: "none",
                  height: "1px",
                  backgroundColor: colors.martletplaceGrey,
                }}
              />
              <Typography variant={"body1"}>
                Price:{" "}
                {listingObject.price !== 0
                  ? priceFormatter.format(listingObject.price)
                  : "Free"}
              </Typography>
              <Typography variant={"body1"}>
                Sold by: <Link>{listingObject.seller_profile.name}</Link>
              </Typography>
              <Typography variant={"body1"}>
                Distance:{" "}
                {listingObject.distance !== 0
                  ? listingObject.distance + "km"
                  : "Unknown"}
              </Typography>
              <Typography variant={"body1"}>
                Posted on: {convertDate(listingObject.dateCreated)}
              </Typography>
              <Button
                type="button"
                variant="contained"
                fullWidth
                sx={classes.button}
                onClick={handleNavToMessages}
                id={"message_button"}
              >
                Message Seller
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6}>
              <Carousel
                imageURLs={listingObject.images.map((image) => image.url)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ViewListing;
