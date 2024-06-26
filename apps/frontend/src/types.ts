export type MessageType = {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  message_body: string;
  created_at: string;
};

// Uniquely identified by a listing id and two user ids
export type ThreadType = {
  listing_id: string;
  other_participant: {
    user_id: string;
    name: string;
    profile_pic_url: string;
  };
  last_message: {
    sender_id: string;
    receiver_id: string;
    listing_id: string;
    content: string;
    created_at: string;
  };
};
