import { test as setup } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  await page.goto("/login")
  await page.getByPlaceholder("Correo electrónico").fill(firstSuperuser)
  await page.getByPlaceholder("Contraseña").fill(firstSuperuserPassword)
  await page.getByRole("button", { name: "Iniciar Sesión" }).click()
  await page.waitForURL("/")
  await page.context().storageState({ path: authFile })
})
