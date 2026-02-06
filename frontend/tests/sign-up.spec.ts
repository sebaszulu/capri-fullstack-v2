import { expect, type Page, test } from "@playwright/test"

import { randomEmail, randomPassword } from "./utils/random"

test.use({ storageState: { cookies: [], origins: [] } })

type OptionsType = {
  exact?: boolean
}

const fillForm = async (
  page: Page,
  full_name: string,
  email: string,
  password: string,
  confirm_password: string,
) => {
  const documentNumber = `${Date.now()}`.slice(-10)
  const phoneNumber = `3${Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0")}`

  await page.getByPlaceholder("Tu nombre").fill(full_name)
  await page.getByPlaceholder("Tu apellido").fill("Prueba")
  await page.getByRole("combobox").first().selectOption("Cédula")
  await page.getByPlaceholder("Número").fill(documentNumber)
  await page.getByPlaceholder("3001234567").fill(phoneNumber)
  await page.locator('input[type="date"]').fill("1990-01-01")
  await page.getByPlaceholder("ejemplo@correo.com").fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('input[name="confirm_password"]').fill(confirm_password)
}

const verifyInput = async (
  page: Page,
  placeholder: string,
  options?: OptionsType,
) => {
  const input = page.getByPlaceholder(placeholder, options)
  await expect(input).toBeVisible()
  await expect(input).toHaveText("")
  await expect(input).toBeEditable()
}

test("Inputs are visible, empty and editable", async ({ page }) => {
  await page.goto("/signup")

  await verifyInput(page, "Tu nombre")
  await verifyInput(page, "Tu apellido")
  await verifyInput(page, "Número")
  await verifyInput(page, "3001234567")
  await verifyInput(page, "ejemplo@correo.com")
})

test("Sign Up button is visible", async ({ page }) => {
  await page.goto("/signup")

  await expect(
    page.getByRole("button", { name: "Completar Registro" }),
  ).toBeVisible()
})

test("Log In link is visible", async ({ page }) => {
  await page.goto("/signup")

  await expect(page.getByRole("link", { name: "Iniciar Sesión" })).toBeVisible()
})

test("Sign up with valid name, email, and password", async ({ page }) => {
  const full_name = "Test User"
  const email = randomEmail()
  const password = randomPassword()

  await page.goto("/signup")
  await fillForm(page, full_name, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()
})

test("Sign up with invalid email", async ({ page }) => {
  await page.goto("/signup")

  await fillForm(
    page,
    "Playwright Test",
    "invalid-email",
    "changethis",
    "changethis",
  )
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(page.getByText("Dirección de correo inválida")).toBeVisible()
})

test("Sign up with existing email", async ({ page }) => {
  const fullName = "Test User"
  const email = randomEmail()
  const password = randomPassword()

  // Sign up with an email
  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()
  await page.waitForURL("/login")

  // Sign up again with the same email
  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(page.getByText(/already exists in the system/i)).toBeVisible()
})

test("Sign up with weak password", async ({ page }) => {
  const fullName = "Test User"
  const email = randomEmail()
  const password = "weak"

  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(
    page.getByText("La contraseña debe tener al menos 8 caracteres").first(),
  ).toBeVisible()
})

test("Sign up with mismatched passwords", async ({ page }) => {
  const fullName = "Test User"
  const email = randomEmail()
  const password = randomPassword()
  const password2 = randomPassword()

  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password2)
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(
    page.getByText("Las contraseñas no coinciden").first(),
  ).toBeVisible()
})

test("Sign up with missing full name", async ({ page }) => {
  const fullName = ""
  const email = randomEmail()
  const password = randomPassword()

  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(page.getByText("El nombre es requerido")).toBeVisible()
})

test("Sign up with missing email", async ({ page }) => {
  const fullName = "Test User"
  const email = ""
  const password = randomPassword()

  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(page.getByText("El correo es requerido")).toBeVisible()
})

test("Sign up with missing password", async ({ page }) => {
  const fullName = ""
  const email = randomEmail()
  const password = ""

  await page.goto("/signup")

  await fillForm(page, fullName, email, password, password)
  await page.getByRole("button", { name: "Completar Registro" }).click()

  await expect(
    page.getByText("La contraseña es requerida").first(),
  ).toBeVisible()
})
