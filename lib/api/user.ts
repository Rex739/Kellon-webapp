import { ApiResponse, handleResponse } from "."
import { User } from "@/types/db"

export const updateProfile = async (data: {
  name: string
  tag: string
}): Promise<ApiResponse<User>> => {

  const res = await fetch("/api/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  })

  return handleResponse(res)
}
