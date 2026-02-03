import { expect, type Page } from "@playwright/test"

export async function signUpNewUser(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await page.goto("/signup")

  const documentNumber = `${Date.now()}`.slice(-10)
  const phoneNumber = `3${Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0")}`

  await page.getByPlaceholder("Tu nombre").fill(name)
  await page.getByPlaceholder("Tu apellido").fill("Prueba")
  await page.getByRole("combobox").first().selectOption("Cédula")
  await page.getByPlaceholder("Número").fill(documentNumber)
  await page.getByPlaceholder("3001234567").fill(phoneNumber)
  await page.locator('input[type="date"]').fill("1990-01-01")
  await page.getByPlaceholder("ejemplo@correo.com").fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('input[name="confirm_password"]').fill(password)
  await page.getByRole("button", { name: "Completar Registro" }).click()
  await page.waitForURL("/login")
}

export async function logInUser(page: Page, email: string, password: string) {
  await page.goto("/login")

  await page.getByPlaceholder("Correo electrónico").fill(email)
  await page.getByPlaceholder("Contraseña").fill(password)
  await page.getByRole("button", { name: "Iniciar Sesión" }).click()
  await page.waitForURL("/")
  await expect(page.getByText("Bienvenido de nuevo")).toBeVisible()
}

export async function logOutUser(page: Page) {
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Cerrar Sesión" }).click()
  await page.goto("/login")
}
