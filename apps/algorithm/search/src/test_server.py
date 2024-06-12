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

    es.indices.create(index=TEST_INDEX, ignore=400)
    es.indices.refresh(index=TEST_INDEX)

    yield

    es.indices.delete(index=TEST_INDEX, ignore=[400, 404])


def test_search_no_listings():
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "test",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == []


def test_search_listings():
    es.index(index=TEST_INDEX, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
        },
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "listingID": "abc123",
            "sellerID": "seller456",
            "sellerName": "billybobjoe",
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450,
            "dateCreated": "2024-05-22T10:30:00Z",
            "imageUrl": "https://example.com/image1.jpg"
        }
    ]


def test_search_with_price_range():
    es.index(index=TEST_INDEX, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 100.00,
            "maxPrice": 500.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "listingID": "abc123",
            "sellerID": "seller456",
            "sellerName": "billybobjoe",
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450,
            "dateCreated": "2024-05-22T10:30:00Z",
            "imageUrl": "https://example.com/image1.jpg"
        }
    ]


def test_search_with_too_low_price_range_fail():
    es.index(index=TEST_INDEX, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 100.00,
            "maxPrice": 400.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == []


def test_search_with_too_high_price_range_fail():
    es.index(index=TEST_INDEX, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "laptop",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "minPrice": 500.00,
            "maxPrice": 1000.00,
        },
    )
    assert response.status_code == 200
    assert response.json() == []


def test_search_with_invalid_search_type():
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
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
                "loc": [
                    "query",
                    "searchType"
                ],
                "msg": "Input should be 'LISTINGS' or 'USERS'",
                "input": "INVALID",
                "ctx": {
                    "expected": "'LISTINGS' or 'USERS'"
                }
            }
        ]
    }


def test_search_with_user_search():
    es.index(index=TEST_INDEX, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "billybobjoe",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "searchType": "USERS",
        },
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "listingID": "abc123",
            "sellerID": "seller456",
            "sellerName": "billybobjoe",
            "title": "High-Performance Laptop",
            "description": "A powerful laptop suitable for gaming and professional use.",
            "price": 450,
            "dateCreated": "2024-05-22T10:30:00Z",
            "imageUrl": "https://example.com/image1.jpg"
        }
    ]


def test_search_with_sorting():
    es.index(index=TEST_INDEX, id="abc123", body={
        "listingId": "abc123",
        "sellerId": "seller456",
        "sellerName": "billybobjoe",
        "title": "High-Performance Laptop",
        "description": "A powerful laptop suitable for gaming and professional use.",
        "price": 450.00,
        "location": {"latitude": 45.4215, "longitude": -75.6972},
        "status": "AVAILABLE",
        "dateCreated": "2024-05-22T10:30:00Z",
        "imageUrl": "https://example.com/image1.jpg"
    })
    es.index(index=TEST_INDEX, id="def456", body={
        "listingId": "def456",
        "sellerId": "seller789",
        "sellerName": "janedoe",
        "title": "Used Textbook",
        "description": "Lightly used textbook for sale.",
        "price": 30.00,
        "location": {"latitude": 40.7128, "longitude": -74.0060},
        "status": "AVAILABLE",
        "dateCreated": "2024-06-01T12:00:00Z",
        "imageUrl": "https://example.com/image2.jpg"
    })
    es.indices.refresh(index=TEST_INDEX)
    response = client.get(
        "/api/search",
        params={
            "authorization": "Bearer testtoken",
            "query": "for",
            "latitude": 45.4315,
            "longitude": -75.6972,
            "sort": "PRICE_ASC",
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    assert len(results) > 0
    assert results[0]["price"] == 30.00  # Assuming the sorting is correct
