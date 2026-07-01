export interface SignupRequestBody {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export interface AdminLoginRequestBody {
  username?: string;
  password?: string;
}