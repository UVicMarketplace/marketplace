import os

import pytest
from elasticsearch import Elasticsearch
from fastapi.testclient import TestClient

from server import app

TEST_INDEX = "test-index"

client = TestClient(app)

es_endpoint = os.getenv("ES_ENDPOINT")
es = Elasticsearch([es_endpoint], verify_certs=False)


@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_index(monkeypatch):
    monkeypatch.setenv("ES_INDEX", TEST_INDEX)

    es.options(ignore_status=[404]).indices.delete(index=TEST_INDEX)
    es.options(ignore_status=[400]).indices.create(
        index=TEST_INDEX,
        body={
            "mappings": {
                "properties": {
                    "location": {"type": "geo_point"},
                }
            }
        },
    )

    es.indices.refresh(index=TEST_INDEX)

    yield

    es.options(ignore_status=[404]).indices.delete(index=TEST_INDEX)


def test_search_no_listings():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "test",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}


def test_search_for_existing_listing():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        ],
        "totalItems": 1,
    }


def test_search_for_multiple_listings():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "def456",
                "sellerID": "seller789",
                "sellerName": "janedoe",
                "title": "Used Laptop",
                "description": "Lightly used laptop for sale.",
                "price": 200,
                "dateCreated": "2024-06-01T12:00:00Z",
                "imageUrl": "https://example.com/image2.jpg",
            },
            {
                "listingID": "abc123",
                "sellerID": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            },
        ],
        "totalItems": 2,
    }


def test_search_empty_query():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}


def test_search_with_special_characters_in_query():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop!@#$%^&*()_+",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}


def test_search_with_price_range():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 100.00,
            "maxPrice": 500.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        ],
        "totalItems": 1,
    }


def test_search_with_too_low_price_range_fail():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 100.00,
            "maxPrice": 400.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}


def test_search_with_too_high_price_range_fail():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 500.00,
            "maxPrice": 1000.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}


def test_search_with_negative_min_price_fail():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": -500.00,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "minPrice cannot be negative"}


def test_search_with_negative_max_price_fail():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "maxPrice": -500.00,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "maxPrice cannot be negative"}


def test_search_min_price_higher_than_max_price_fail():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 500.00,
            "maxPrice": 100.00,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "minPrice cannot be greater than maxPrice"}


def test_search_with_status():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 40.7128, "lon": -74.0060},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "AVAILABLE",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        ],
        "totalItems": 1,
    }


def test_search_with_status_sold():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "SOLD",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "def456",
                "sellerID": "seller789",
                "sellerName": "janedoe",
                "title": "Used Laptop",
                "description": "Lightly used laptop for sale.",
                "price": 200,
                "dateCreated": "2024-06-01T12:00:00Z",
                "imageUrl": "https://example.com/image2.jpg",
            }
        ],
        "totalItems": 1,
    }


def test_search_with_invalid_status():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "SPAGHETTI",
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "enum",
                "loc": ["query", "status"],
                "msg": "Input should be 'AVAILABLE' or 'SOLD'",
                "input": "SPAGHETTI",
                "ctx": {"expected": "'AVAILABLE' or 'SOLD'"},
            }
        ]
    }


def test_search_with_user_search():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 40.7128, "lon": -74.0060},
            "status": "SOLD",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "billybobjoe",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "USERS",
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        ],
        "totalItems": 1,
    }


def test_search_with_user_search_negative():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "USERS",
        },
    )
    assert response.status_code == 200
    assert response.json() == {"items": [], "totalItems": 0}


def test_search_with_invalid_search_type():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "INVALID",
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "enum",
                "loc": ["query", "searchType"],
                "msg": "Input should be 'LISTINGS' or 'USERS'",
                "input": "INVALID",
                "ctx": {"expected": "'LISTINGS' or 'USERS'"},
            }
        ]
    }


def test_only_return_results_within_5km_of_location():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 40.7128, "lon": -74.0060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "listingID": "abc123",
                "sellerID": "seller456",
                "sellerName": "billybobjoe",
                "title": "High-Performance Laptop",
                "description": "A powerful laptop suitable for gaming and professional use.",
                "price": 450,
                "dateCreated": "2024-05-22T10:30:00Z",
                "imageUrl": "https://example.com/image1.jpg",
            }
        ],
        "totalItems": 1,
    }


def test_search_with_missing_latitude():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "missing",
                "loc": ["query", "latitude"],
                "msg": "Field required",
                "input": None,
            }
        ]
    }


def test_search_with_missing_longitude():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "missing",
                "loc": ["query", "longitude"],
                "msg": "Field required",
                "input": None,
            }
        ]
    }


def test_search_with_out_of_bounds_latitude():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 95.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "latitude must be between -90 and 90"}


def test_search_with_out_of_bounds_longitude():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -195.6972,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "longitude must be between -180 and 180"}


def test_search_with_sorting_by_relevance():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
            "listingId": "abc123",
            "sellerId": "wally",
            "sellerName": "wally monga",
            "title": "Used Textbook",
            "description": "Lightly used laptop textbook for sale.",
            "price": 300.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image3.jpg",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller456",
            "sellerName": "billybobjoe",
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable laptop for laptop gaming laptop and professional laptop use.",
            "price": 450.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-05-22T10:30:00Z",
            "imageUrl": "https://example.com/image1.jpg",
        },
    )
    es.index(
        index=TEST_INDEX,
        id="ghi789",
        body={
            "listingId": "ghi789",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Textbook ",
            "description": "Lightly used laptop laptop laptop textbook for sale.",
            "price": 30.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "RELEVANCE",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert results["items"][0]["listingID"] == "def456"
    assert results["items"][1]["listingID"] == "ghi789"
    assert results["items"][2]["listingID"] == "abc123"
    assert results["totalItems"] == 3


def test_search_with_sorting_by_price_asc():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Textbook",
            "description": "Lightly used textbook for sale.",
            "price": 30.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "for",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["price"] == 30.00
    assert results["totalItems"] == 2


def test_search_with_sorting_by_price_desc():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Textbook",
            "description": "Lightly used textbook for sale.",
            "price": 30.00,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "for",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_DESC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["price"] == 450.00
    assert results["totalItems"] == 2


def test_search_with_sorting_by_listed_time_asc():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "LISTED_TIME_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "abc123"
    assert results["items"][1]["listingID"] == "def456"
    assert results["totalItems"] == 2


def test_search_with_sorting_by_listed_time_desc():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "LISTED_TIME_DESC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "def456"
    assert results["items"][1]["listingID"] == "abc123"
    assert results["totalItems"] == 2


def test_search_with_sorting_by_distance_asc():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "DISTANCE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "abc123"
    assert results["items"][1]["listingID"] == "def456"
    assert results["totalItems"] == 2


def test_search_with_sorting_by_distance_desc():
    es.index(
        index=TEST_INDEX,
        id="abc123",
        body={
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
        },
    )
    es.index(
        index=TEST_INDEX,
        id="def456",
        body={
            "listingId": "def456",
            "sellerId": "seller789",
            "sellerName": "janedoe",
            "title": "Used Laptop",
            "description": "Lightly used laptop for sale.",
            "price": 200.00,
            "location": {"lat": 45.4528, "lon": -75.7060},
            "status": "AVAILABLE",
            "dateCreated": "2024-06-01T12:00:00Z",
            "imageUrl": "https://example.com/image2.jpg",
        },
    )
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "DISTANCE_DESC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) > 0
    assert results["items"][0]["listingID"] == "def456"
    assert results["items"][1]["listingID"] == "abc123"
    assert results["totalItems"] == 2


def test_search_with_invalid_sorting_criteria():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "INVALID_SORT",
        },
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "enum",
                "loc": ["query", "sort"],
                "msg": "Input should be 'RELEVANCE', 'PRICE_ASC', 'PRICE_DESC', 'LISTED_TIME_ASC', "
                "'LISTED_TIME_DESC', 'DISTANCE_ASC' or 'DISTANCE_DESC'",
                "input": "INVALID_SORT",
                "ctx": {
                    "expected": "'RELEVANCE', 'PRICE_ASC', 'PRICE_DESC', 'LISTED_TIME_ASC', 'LISTED_TIME_DESC', "
                    "'DISTANCE_ASC' or 'DISTANCE_DESC'"
                },
            }
        ]
    }


def test_search_with_pagination():
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "imageUrl": f"https://example.com/image{i}.jpg",
        }
        for i in range(15)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["items"][0]["listingID"] == "listing0"
    assert results["items"][4]["listingID"] == "listing4"
    assert results["totalItems"] == 15

    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 2,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["items"][0]["listingID"] == "listing5"
    assert results["items"][4]["listingID"] == "listing9"
    assert results["totalItems"] == 15

    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 3,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["items"][0]["listingID"] == "listing10"
    assert results["items"][4]["listingID"] == "listing14"
    assert results["totalItems"] == 15


def test_search_with_missing_pagination_parameters():
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "imageUrl": f"https://example.com/image{i}.jpg",
        }
        for i in range(21)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 20
    assert results["items"][0]["listingID"] == "listing0"
    assert results["items"][19]["listingID"] == "listing19"
    assert results["totalItems"] == 21


def test_search_with_negative_page_number():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": -1,
            "limit": 5,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "page cannot be zero or negative"}


def test_search_with_zero_page_number():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 0,
            "limit": 5,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "page cannot be zero or negative"}


def test_search_with_negative_limit():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": -5,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "limit cannot be zero or negative"}


def test_search_with_zero_limit():
    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": 0,
        },
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "limit cannot be zero or negative"}


def test_total_items_count_with_multiple_listings():
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "imageUrl": f"https://example.com/image{i}.jpg",
        }
        for i in range(10)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "page": 1,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["totalItems"] == 10


def test_total_items_count_with_filter():
    listings = [
        {
            "listingId": f"listing{i}",
            "sellerId": f"seller{i}",
            "sellerName": f"seller_name{i}",
            "title": f"Item {i}",
            "description": f"Description of item {i}",
            "price": 100 + i,
            "location": {"lat": 45.4215, "lon": -75.6972},
            "status": "AVAILABLE" if i % 2 == 0 else "SOLD",
            "dateCreated": f"2024-06-{i + 1:02d}T12:00:00Z",
            "imageUrl": f"https://example.com/image{i}.jpg",
        }
        for i in range(20)
    ]

    for listing in listings:
        es.index(index=TEST_INDEX, id=listing["listingId"], body=listing)
    es.indices.refresh(index=TEST_INDEX)

    response = client.get(
        "/api/search",
        headers={"Authorization": "Bearer testtoken"},
        params={
            "query": "Item",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "status": "AVAILABLE",
            "page": 1,
            "limit": 5,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, dict)
    assert "items" in results
    assert "totalItems" in results
    assert len(results["items"]) == 5
    assert results["totalItems"] == 10
