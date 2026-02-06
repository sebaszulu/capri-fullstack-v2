import { expect, test } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"
import { createUser } from "./utils/privateApi.ts"
import { randomEmail, randomPassword } from "./utils/random"
import { logInUser, logOutUser } from "./utils/user"

const tabs = ["Mi perfil", "Contraseña", "Apariencia"]

// User Information

test("My profile tab is active by default", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.getByRole("tab", { name: "Mi perfil" })).toHaveAttribute(
    "aria-selected",
    "true",
  )
})

test("All tabs are visible", async ({ page }) => {
  await page.goto("/settings")
  for (const tab of tabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible()
  }
})

test.describe("Edit user full name and email successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Edit user name with a valid name", async ({ page }) => {
    const email = randomEmail()
    const updatedName = "Test User 2"
    const password = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Mi perfil" }).click()
    await page.getByRole("button", { name: "Editar" }).click()
    await page.getByLabel("Nombre").fill(updatedName)
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(
      page.getByText("Usuario actualizado exitosamente."),
    ).toBeVisible()
    // Check if the new name is displayed on the page
    await expect(page.getByText(updatedName, { exact: true })).toBeVisible()
  })

  test("Edit user email with a valid email", async ({ page }) => {
    const email = randomEmail()
    const updatedEmail = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Mi perfil" }).click()
    await page.getByRole("button", { name: "Editar" }).click()
    await page.getByLabel("Correo electrónico").fill(updatedEmail)
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(
      page.getByText("Usuario actualizado exitosamente."),
    ).toBeVisible()
    await expect(page.getByText(updatedEmail, { exact: true })).toBeVisible()
  })
})

test.describe("Edit user with invalid data", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Edit user email with an invalid email", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const invalidEmail = ""

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Mi perfil" }).click()
    await page.getByRole("button", { name: "Editar" }).click()
    await page.getByLabel("Correo electrónico").fill(invalidEmail)
    await page.locator("body").click()
    await expect(page.getByText("El correo es requerido")).toBeVisible()
  })

  test("Cancel edit action restores original name", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const updatedName = "Test User"

    const user = await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Mi perfil" }).click()
    await page.getByRole("button", { name: "Editar" }).click()
    await page.getByLabel("Nombre").fill(updatedName)
    await page.getByRole("button", { name: "Cancelar" }).first().click()
    await expect(
      page.getByText(user.name as string, { exact: true }),
    ).toBeVisible()
  })

  test("Cancel edit action restores original email", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const updatedEmail = randomEmail()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Mi perfil" }).click()
    await page.getByRole("button", { name: "Editar" }).click()
    await page.getByLabel("Correo electrónico").fill(updatedEmail)
    await page.getByRole("button", { name: "Cancelar" }).first().click()
    await expect(page.getByText(email, { exact: true })).toBeVisible()
  })
})

// Change Password

test.describe("Change password successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Update password successfully", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const NewPassword = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Contraseña" }).click()
    await page.getByPlaceholder("Contraseña actual").fill(password)
    await page.getByPlaceholder("Nueva contraseña").fill(NewPassword)
    await page.getByPlaceholder("Confirmar contraseña").fill(NewPassword)
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(
      page.getByText("Contraseña actualizada exitosamente."),
    ).toBeVisible()

    await logOutUser(page)

    // Check if the user can log in with the new password
    await logInUser(page, email, NewPassword)
  })
})

test.describe("Change password with invalid data", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Update password with weak passwords", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const weakPassword = "weak"

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Contraseña" }).click()
    await page.getByPlaceholder("Contraseña actual").fill(password)
    await page.getByPlaceholder("Nueva contraseña").fill(weakPassword)
    await page.getByPlaceholder("Confirmar contraseña").fill(weakPassword)
    await expect(
      page.getByText("La contraseña debe tener al menos 8 caracteres"),
    ).toBeVisible()
  })

  test("New password and confirmation password do not match", async ({
    page,
  }) => {
    const email = randomEmail()
    const password = randomPassword()
    const newPassword = randomPassword()
    const confirmPassword = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Contraseña" }).click()
    await page.getByPlaceholder("Contraseña actual").fill(password)
    await page.getByPlaceholder("Nueva contraseña").fill(newPassword)
    await page.getByPlaceholder("Confirmar contraseña").fill(confirmPassword)
    await page.getByRole("heading", { name: "Cambiar Contraseña" }).click()
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible()
  })

  test("Current password and new password are the same", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Contraseña" }).click()
    await page.getByPlaceholder("Contraseña actual").fill(password)
    await page.getByPlaceholder("Nueva contraseña").fill(password)
    await page.getByPlaceholder("Confirmar contraseña").fill(password)
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(
      page.getByText("New password cannot be the same as the current one"),
    ).toBeVisible()
  })
})

// Appearance

test("Appearance tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Apariencia" }).click()
  await expect(page.getByRole("heading", { name: "Apariencia" })).toBeVisible()
})

test("User can switch from light mode to dark mode and vice versa", async ({
  page,
}) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Apariencia" }).click()

  // Ensure the initial state is light mode
  if (
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    )
  ) {
    await page
      .locator("label")
      .filter({ hasText: "Modo Claro" })
      .locator("span")
      .first()
      .click()
  }

  let isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("light"),
  )
  expect(isLightMode).toBe(true)

  await page
    .locator("label")
    .filter({ hasText: "Modo Oscuro" })
    .locator("span")
    .first()
    .click()
  const isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  )
  expect(isDarkMode).toBe(true)

  await page
    .locator("label")
    .filter({ hasText: "Modo Claro" })
    .locator("span")
    .first()
    .click()
  isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("light"),
  )
  expect(isLightMode).toBe(true)
})

test("Selected mode is preserved across sessions", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Apariencia" }).click()

  // Ensure the initial state is light mode
  if (
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    )
  ) {
    await page
      .locator("label")
      .filter({ hasText: "Modo Claro" })
      .locator("span")
      .first()
      .click()
  }

  const isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("light"),
  )
  expect(isLightMode).toBe(true)

  await page
    .locator("label")
    .filter({ hasText: "Modo Oscuro" })
    .locator("span")
    .first()
    .click()
  let isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  )
  expect(isDarkMode).toBe(true)

  await logOutUser(page)
  await logInUser(page, firstSuperuser, firstSuperuserPassword)

  isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  )
  expect(isDarkMode).toBe(true)
})
