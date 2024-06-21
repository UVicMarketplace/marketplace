import os
from enum import Enum
from typing import Dict, Any

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError
from fastapi import FastAPI, HTTPException, Header
from pydantic import ConfigDict, BaseModel, Field

DEFAULT_INDEX = "listings"
DISTANCE_TO_SEARCH_WITHIN = "5km"

app = FastAPI()

es_endpoint = os.getenv("ES_ENDPOINT")
es = Elasticsearch([es_endpoint], verify_certs=False)


class Status(str, Enum):
    AVAILABLE = "AVAILABLE"
    SOLD = "SOLD"


class SearchType(str, Enum):
    LISTINGS = "LISTINGS"
    USERS = "USERS"


class Sort(str, Enum):
    RELEVANCE = "RELEVANCE"
    PRICE_ASC = "PRICE_ASC"
    PRICE_DESC = "PRICE_DESC"
    LISTED_TIME_ASC = "LISTED_TIME_ASC"
    LISTED_TIME_DESC = "LISTED_TIME_DESC"
    DISTANCE_ASC = "DISTANCE_ASC"
    DISTANCE_DESC = "DISTANCE_DESC"


class ListingSummary(BaseModel):
    listingID: str = Field(...)
    sellerID: str = Field(...)
    sellerName: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)
    price: float = Field(...)
    dateCreated: str = Field(...)
    imageUrl: str = Field(...)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "listingID": "A23F29039B23",
                "sellerID": "A23F29039B23",
                "sellerName": "John Doe",
                "title": "Used Calculus Textbook",
                "description": "No wear and tear, drop-off available.",
                "price": 50,
                "dateCreated": "2024-05-23T15:30:00Z",
                "imageUrl": "image URL for first Image",
            }
        }
    )


class Location(BaseModel):
    lat: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    lon: float = Field(..., description="Longitude of the location", ge=-180, le=180)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "lat": 45.4215,
                "lon": -75.6972,
            }
        }
    )


class Listing(BaseModel):
    listingId: str = Field(...)
    sellerId: str = Field(...)
    sellerName: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)
    price: float = Field(...)
    location: Location = Field(...)
    status: Status = Field(...)
    dateCreated: str = Field(...)
    imageUrl: str = Field(...)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "listingId": "abc123",
                "sellerId": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450.00,
                "location": {"lat": 45.4215, "lon": -75.6972},
                "status": "AVAILABLE",
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        }
    )


def validate_search_params(
    latitude: float,
    longitude: float,
    page: int,
    limit: int,
    minPrice: float,
    maxPrice: float,
):
    if abs(latitude) > 90:
        raise HTTPException(
            status_code=422, detail="latitude must be between -90 and 90"
        )
    if abs(longitude) > 180:
        raise HTTPException(
            status_code=422, detail="longitude must be between -180 and 180"
        )
    if page <= 0:
        raise HTTPException(status_code=422, detail="page cannot be zero or negative")
    if limit <= 0:
        raise HTTPException(status_code=422, detail="limit cannot be zero or negative")
    if minPrice is not None and minPrice < 0:
        raise HTTPException(status_code=422, detail="minPrice cannot be negative")
    if maxPrice is not None and maxPrice < 0:
        raise HTTPException(status_code=422, detail="maxPrice cannot be negative")
    if minPrice is not None and maxPrice is not None and minPrice > maxPrice:
        raise HTTPException(
            status_code=422, detail="minPrice cannot be greater than maxPrice"
        )


def validate_listing(listing: Listing):
    # Validate the price
    if listing.price < 0:
        raise HTTPException(status_code=422, detail="price cannot be negative")

    # Validate the location
    if abs(listing.location.lat) > 90 or abs(listing.location.lon) > 180:
        raise HTTPException(status_code=422, detail="Invalid location coordinates")

    # Validate the status
    if listing.status not in Status.__members__.values():
        raise HTTPException(status_code=422, detail="Invalid status")


@app.get("/api/search")
async def search(
    query: str,
    latitude: float,
    longitude: float,
    page: int = 1,
    limit: int = 20,
    minPrice: float = None,
    maxPrice: float = None,
    status: Status = "AVAILABLE",
    searchType: SearchType = "LISTINGS",
    sort: Sort = "RELEVANCE",
    authorization: str = Header(None),
):
    validate_search_params(latitude, longitude, page, limit, minPrice, maxPrice)

    INDEX = os.getenv("ES_INDEX", DEFAULT_INDEX)

    if searchType == "LISTINGS":
        must_conditions = [
            {"multi_match": {"query": query, "fields": ["title", "description"]}},
            {"match": {"status": status}},
        ]
    elif searchType == "USERS":
        must_conditions = [
            {"match": {"sellerName": query}},
            {"match": {"status": status}},
        ]
    else:
        raise HTTPException(status_code=422, detail="Invalid searchType")

    search_body: Dict[str, Any] = {
        "from": (page - 1) * limit,
        "size": limit,
        "query": {"bool": {"must": must_conditions, "filter": []}},
        "sort": [],
    }

    if minPrice is not None or maxPrice is not None:
        price_range = {}
        if minPrice is not None:
            price_range["gte"] = minPrice
        if maxPrice is not None:
            price_range["lte"] = maxPrice
        search_body["query"]["bool"]["filter"].append({"range": {"price": price_range}})

    search_body["query"]["bool"]["filter"].append(
        {
            "geo_distance": {
                "distance": DISTANCE_TO_SEARCH_WITHIN,
                "location": {"lat": latitude, "lon": longitude},
            }
        }
    )

    if "DISTANCE" in sort:
        search_body["sort"].append(
            {
                "_geo_distance": {
                    "location": {"lat": latitude, "lon": longitude},
                    "order": "asc" if sort == "DISTANCE_ASC" else "desc",
                    "unit": "km",
                }
            }
        )
    else:
        sort_options = {
            "RELEVANCE": "_score",
            "PRICE_ASC": "price",
            "PRICE_DESC": "price",
            "LISTED_TIME_ASC": "dateCreated",
            "LISTED_TIME_DESC": "dateCreated",
            "DISTANCE_ASC": "_geo_distance",
            "DISTANCE_DESC": "_geo_distance",
        }
        search_body["sort"].append(
            {sort_options[sort]: {"order": "asc" if "ASC" in sort else "desc"}}
        )

    try:
        response = es.search(index=INDEX, body=search_body)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")

    total_items = response["hits"]["total"]["value"]
    results = [
        {
            "listingID": hit["_source"]["listingId"],
            "sellerID": hit["_source"]["sellerId"],
            "sellerName": hit["_source"]["sellerName"],
            "title": hit["_source"]["title"],
            "description": hit["_source"]["description"],
            "price": hit["_source"]["price"],
            "dateCreated": hit["_source"]["dateCreated"],
            "imageUrl": hit["_source"]["imageUrl"],
        }
        for hit in response["hits"]["hits"]
    ]

    return {"items": results, "totalItems": total_items}


@app.post("/api/search/reindex/listing-created")
async def reindex_listing_created(listing: Listing, authorization: str = Header(None)):
    validate_listing(listing)

    INDEX = os.getenv("ES_INDEX", DEFAULT_INDEX)

    es.index(index=INDEX, id=listing.listingId, body=listing.dict())
    es.indices.refresh(index=INDEX)

    return {"message": "Listing added successfully."}


@app.patch("/api/search/reindex/listing-edited")
async def reindex_listing_edited(listing: Listing, authorization: str = Header(None)):
    validate_listing(listing)

    INDEX = os.getenv("ES_INDEX", DEFAULT_INDEX)

    es.index(index=INDEX, id=listing.listingId, body=listing.dict())
    es.indices.refresh(index=INDEX)

    return {"message": "Listing edited successfully."}


@app.delete("/api/search/reindex/listing-deleted")
async def reindex_listing_deleted(listingId: str, authorization: str = Header(None)):
    INDEX = os.getenv("ES_INDEX", DEFAULT_INDEX)

    try:
        es.get(index=INDEX, id=listingId)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Listing not found")

    es.delete(index=INDEX, id=listingId)
    es.indices.refresh(index=INDEX)

    return {"message": "Listing deleted successfully."}
