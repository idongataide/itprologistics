export interface iSignup {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
export interface iLogin {
  email?: string;
  user_name?: string;
  password: string;
}

export interface DecodedToken {
  user_uid: string;
}
