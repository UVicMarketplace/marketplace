export interface User {
  user_id: number;
  username: string;
  email: string;
  password: string;
  totp_secret: string;
  name: string;
  bio: string;
  profile_pic_url: string;
  verified: boolean;
  created_at: Date;
  modified_at: Date;
}
