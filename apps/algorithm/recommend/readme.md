# Recommendations Engine

The recommender is built using TensorFlow, with its API in FastAPI.

## Running Instructions

1. Clone the repository

2. Navigate into the repository

3. Run `docker-compose up --build`. This will start the Martletplace application,
   spinning up docker containers for all of the different parts. If there are any
   problems with this working, you may not have docker open, or there may be an
   application currently running on the ports necessary for this application to
   run.

4. Once the docker containers are all up, you may navigate around the recommender
   using the API endpoint (in your browser, Postman, or whatever you prefer):

   `GET http://localhost/api/recommendations?authorization=5`

   User 5 is the same user that will be used for the search endpoint, so it's
   important this user is in use (auth was not fully implemented in this spring). 

   If you would like to see the integration with frontend, you can navigate to
   the homepage at `http://localhost/`. Once you make an account, you can see
   the default recommendations. Perform a search using the search bar. Note that
   our dataset is limited, so you may want to stick with items we have (some
   good terms include chocolate, hat, perfume, etc). Then, navigate back to the
   homepage, and notice that some of your recommendations have changed. The term
   you searched may appear in the title of these items, or their descriptions.
   It's also possible that searches may be flaky, as Elasticsearch likes to fail
   for reasons currently unknown. If you're getting `502` errors while hitting
   the search endpoint, let us know and we can just demo it for you in lab.

   Note that the recommender works for item clicks as well, but we have no way
   for you to test this. We can demonstrate this to you during a lab if necessary.

## Testing Instructions

1. Do steps 1 to 3 in the "Running Instructions"

2. Run `docker compose exec recommend pytest`

3. View the output. The tests should succeed (they do on our machines and in the Actions workflow).
