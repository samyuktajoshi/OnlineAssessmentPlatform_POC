import { jwtDecode } from "jwt-decode";

export const getUserFromToken = (token) => {
  const decoded = jwtDecode(token);

  return {
    token,
    role:
      decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    username:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ],
    userId:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ], // ✅ IMPORTANT
  };
};