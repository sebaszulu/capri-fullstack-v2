// Utilidad para crear usuarios en tests usando el endpoint público de signup
import { OpenAPI, UsersService } from "../../src/client"

OpenAPI.BASE = `${process.env.VITE_API_URL}`

export const createUser = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const documentNumber = `${Date.now()}`.slice(-10)
  const phoneNumber = `3${Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0")}`

  return await UsersService.registerUser({
    requestBody: {
      email,
      password,
      name: "Test",
      last_name: "User",
      document_type: "Cédula",
      document_number: documentNumber,
      phone_number: phoneNumber,
      birth_date: "1990-01-01",
    },
  })
}
