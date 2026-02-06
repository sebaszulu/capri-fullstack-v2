import { expect, test } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"
import { randomEmail, randomPassword } from "./utils/random"
import { logInUser, signUpNewUser } from "./utils/user"

test.use({ storageState: { cookies: [], origins: [] } })

test("Password Recovery title is visible", async ({ page }) => {
  await page.goto("/recover-password")

  await expect(
    page.getByRole("heading", { name: "Recuperar Contraseña" }),
  ).toBeVisible()
})

test("Input is visible, empty and editable", async ({ page }) => {
  await page.goto("/recover-password")

  await expect(page.getByPlaceholder("Correo electrónico")).toBeVisible()
  await expect(page.getByPlaceholder("Correo electrónico")).toHaveText("")
  await expect(page.getByPlaceholder("Correo electrónico")).toBeEditable()
})

test("Continue button is visible", async ({ page }) => {
  await page.goto("/recover-password")

  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible()
})

const apiBaseUrl = process.env.VITE_API_URL || "http://localhost:8001"

const fetchResetToken = async (request: any, email: string) => {
  const loginResponse = await request.post(
    `${apiBaseUrl}/api/v1/login/access-token`,
    {
      form: {
        username: firstSuperuser,
        password: firstSuperuserPassword,
      },
    },
  )
  const loginData = await loginResponse.json()
  const htmlResponse = await request.post(
    `${apiBaseUrl}/api/v1/password-recovery-html-content/${email}`,
    {
      headers: {
        Authorization: `Bearer ${loginData.access_token}`,
      },
    },
  )
  const html = await htmlResponse.text()
  if (!htmlResponse.ok()) {
    throw new Error(`HTML recovery error: ${html}`)
  }
  const urlMatch = html.match(/href="([^"]*reset-password[^"]*)"/)
  if (!urlMatch) {
    throw new Error(
      `No se encontró link de restablecimiento en el HTML: ${html.slice(0, 200)}`,
    )
  }
  const resetUrl = urlMatch[1].replace(/&amp;/g, "&")
  const token = new URL(resetUrl, "http://localhost").searchParams.get("token")
  if (!token) {
    throw new Error(
      `No se encontró token de restablecimiento en el HTML: ${html.slice(0, 200)}`,
    )
  }
  return token
}

test("User can reset password successfully using the link", async ({
  page,
  request,
}) => {
  const fullName = "Test User"
  const email = randomEmail()
  const password = randomPassword()
  const newPassword = randomPassword()

  // Sign up a new user
  await signUpNewUser(page, fullName, email, password)

  const token = await fetchResetToken(request, email)
  await page.goto(`/reset-password?token=${token}`)

  const resetResponse = await request.post(
    `${apiBaseUrl}/api/v1/reset-password/`,
    {
      data: { token, new_password: newPassword },
    },
  )
  if (!resetResponse.ok()) {
    const errorBody = await resetResponse.text()
    throw new Error(`Reset failed: ${resetResponse.status()} ${errorBody}`)
  }

  // Check if the user is able to login with the new password
  await logInUser(page, email, newPassword)
})

test("Expired or invalid reset link", async ({ page }) => {
  const password = randomPassword()
  const invalidUrl = "/reset-password?token=invalidtoken"

  await page.goto(invalidUrl)

  await page.getByPlaceholder("Nueva contraseña").fill(password)
  await page.getByPlaceholder("Confirmar contraseña").fill(password)
  await page.getByRole("button", { name: "Restablecer Contraseña" }).click()

  await expect(page.getByText("Invalid token")).toBeVisible()
})

test("Weak new password validation", async ({ page, request }) => {
  const fullName = "Test User"
  const email = randomEmail()
  const password = randomPassword()
  const weakPassword = "123"

  // Sign up a new user
  await signUpNewUser(page, fullName, email, password)

  const token = await fetchResetToken(request, email)
  await page.goto(`/reset-password?token=${token}`)
  await page.getByPlaceholder("Nueva contraseña").fill(weakPassword)
  await page.getByPlaceholder("Confirmar contraseña").fill(weakPassword)
  await page.getByRole("button", { name: "Restablecer Contraseña" }).click()

  await expect(
    page.getByText("La contraseña debe tener al menos 8 caracteres"),
  ).toBeVisible()
})
