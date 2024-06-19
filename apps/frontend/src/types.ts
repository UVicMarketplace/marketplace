export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  profileUrl: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}
export type MessageType = {
  text: string;
  sender_id: string;
};

// Uniquely identified by a listing id and two user ids
export type ConversationType = {
  listing_id: string;
  user1_id: string;
  user2_id: string;
  latest_message_text: string;
  img_url: string; // listing image
};
