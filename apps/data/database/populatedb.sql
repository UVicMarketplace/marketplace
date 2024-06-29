INSERT INTO users (username, email, password, name, bio, profile_pic_url, verified) VALUES
('deleted_user', 'deleted@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'Deleted User', '', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper', TRUE),
('unverified', 'unverified@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'Unverified User', 'Hi! Im an unverified user!', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Kiki', FALSE),
('user3', 'user3@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'User Three', 'Bio for user three', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Lucy', TRUE),
('user4', 'user4@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'User Four', 'Bio for user four', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Angel', TRUE),
('user5', 'user5@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'User Five', 'Bio for user five', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Casper', TRUE);
-- ALL PASSWORDS: Letmeinfortesting1!

INSERT INTO listings (seller_id, buyer_id, title, description, price, location, status, image_urls) VALUES
(1, NULL, 'Listing One', 'Description for listing one', 100, ROW(40.7128, -74.0060), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Jasper', 'https://api.dicebear.com/8.x/bottts/svg?seed=Bella', 'https://api.dicebear.com/8.x/bottts/svg?seed=Bella']),
(2, 3, 'Listing Two', 'Description for listing two', 200, ROW(34.0522, -118.2437), 'SOLD', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Lucy']),
(3, 4, 'Listing Three', 'Description for listing three', 300, ROW(41.8781, -87.6298), 'REMOVED', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Angel']),
(4, NULL, 'Listing Four', 'Description for listing four', 400, ROW(29.7604, -95.3698), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Casper']),
(5, NULL, 'Listing Five', 'Description for listing five', 500, ROW(51.5074, -0.1278), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Kiki']);

COPY listings(seller_id, buyer_id, title, description, price, location, status, image_urls)
FROM '/docker-entrypoint-initdb.d/recommender/trainingData.csv'
DELIMITER ','
CSV HEADER;

INSERT INTO messages (sender_id, receiver_id, listing_id, message_body) VALUES
(2, 1, 1, 'You still offering this???'),
(1, 2, 1, 'Yep'),
(1, 2, 1, 'You gonna cough up though?'),
(5, 1, 5, 'message 1/5'),
(1, 5, 5, 'message 2/5'),
(5, 1, 5, 'message 3/5'),
(1, 5, 5, 'message 4/5'),
(5, 1, 5, 'message 5/5'),
(5, 2, 2, 'from 5 to 2 on listing 2'),
(5, 2, 5, 'from 5 to 2 on listing 5'),
(2, 5, 2, 'from 2 to 5 on listing 2'),
(2, 5, 5, 'from 2 to 5 on listing 5'),
(3, 1, 1, 'Single message'),
(4, 1, 1, 'You still gonna sell this?');

INSERT INTO reviews (listing_id, user_id, review, rating_value) VALUES
(1, 1, 'Terrible product, really', 5),
(1, 2, 'It worked fine', 4),
(2, 2, 'oooh, me likey', 4),
(3, 3, 'Meh, it worked', 3),
(4, 4, 'Are you fing kidding me???', 2),
(5, 5, 'Hahahahaha, no way', 1);

INSERT INTO user_preferences (user_id, listing_id, weight) VALUES
(1, 1, 0.5),
(2, 2, 0.6),
(3, 3, 0.7),
(4, 4, 0.8),
(5, 5, 0.9);

INSERT INTO user_searches (user_id, search_term) VALUES
(1, 'laptop'),
(2, 'funky hat'),
(3, 'textbook'),
(4, 'FUNNY THING'),
(5, 'Unverified User');
