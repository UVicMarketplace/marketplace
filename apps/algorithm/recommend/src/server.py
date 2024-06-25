from typing import List
from fastapi import FastAPI, HTTPException, Depends
import pandas as pd
from sqlalchemy import insert
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.sql_models import User_Preferences, Users, User_Clicks, User_Searches
from src.api_models import ListingSummary
from src.db import get_session
from src.recommender import Recommender

app = FastAPI()
recommender = Recommender()


@app.get("/api/recommendations", response_model=List[ListingSummary])
async def get_recommendations(
    authorization: str,
    page: int = 1,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
):
    user_id = int(authorization) if authorization.isdigit() else None
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    user = users.first()
    if user is None:
        raise HTTPException(
            status_code=404, detail="User not found: " + str(authorization)
        )

    items_clicked = await session.exec(
        select(User_Clicks).where(User_Clicks.user_id == user_id)
    )
    items_clicked = [item.listing_id for item in items_clicked]

    terms_searched = await session.exec(
        select(User_Searches).where(User_Searches.user_id == user_id)
    )
    terms_searched = [term.search_term for term in terms_searched]

    recommended_listings = recommender.recommend(
        items_clicked, terms_searched, page, limit
    )
    if recommended_listings.size == 0:
        return []
    # remove rows with NaN values
    recommended_listings.dropna(inplace=True)
    columns = [
        "sellerID",
        "dateCreated",
        "Category",
        "title",
        "description",
        "Price",
        "listingID",
        "imageUrl",
        "price",
        "sellerName",
        "combined_features",
    ]

    recommended_listings = pd.DataFrame(recommended_listings, columns=columns)

    listing_summaries = [
        ListingSummary(
            listingID=row["listingID"],
            sellerID=row["sellerID"],
            sellerName=row["sellerName"],
            title=row["title"],
            description=row["description"],
            price=row["Price"],
            dateCreated=row["dateCreated"],
            imageUrl=row["imageUrl"],
        )
        for _, row in recommended_listings.iterrows()
    ]
    return listing_summaries


@app.post("/api/recommendations/stop/{id}")
async def stop_suggesting_item(
    authorization: str, id: str, session: AsyncSession = Depends(get_session)
):
    user_id = int(authorization) if authorization.isdigit() else None
    users = await session.exec(select(Users).where(Users.user_id == user_id))
    user = users.first()
    if user is None:
        raise HTTPException(
            status_code=404, detail="User not found: " + str(authorization)
        )

    await session.exec(
        insert(
            User_Preferences,
            values={"user_id": user_id, "listing_id": id, "weight": 1.0},
        )
    )

    return {"message": "Preference updated successfully."}


# @app.put("/api/user-preferences/item-click")
# async def item_click(authorization: str, id: str):
#     # actual logic will go here

#     return {"message": "Item click recorded successfully."}


# @app.put("/api/user-preferences/item-buy")
# async def item_buy(authorization: str, id: str):
#     # actual logic will go here

#     return {"message": "Item purchase recorded successfully."}


# @app.put("/api/user-preferences/search-term")
# async def search_term(authorization: str, search_term: str):
#     # actual logic will go here

#     return {"message": "Search term recorded successfully."}


# @app.put("/api/user-preferences/review-add")
# async def review_add(authorization: str, review: Review):
#     # actual logic will go here

#     return {"message": "Review recorded successfully."}
