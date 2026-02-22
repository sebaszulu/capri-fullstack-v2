import type { ApiError } from "./client"

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Dirección de correo inválida",
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Nombre inválido",
}

export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: "La contraseña debe tener al menos 8 caracteres",
    },
  }

  if (isRequired) {
    rules.required = "La contraseña es requerida"
  }

  return rules
}

export const confirmPasswordRules = (
  getValues: () => any,
  isRequired = true,
) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : "Las contraseñas no coinciden"
    },
  }

  if (isRequired) {
    rules.required = "La confirmación de contraseña es requerida"
  }

  return rules
}

/**
 * Extrae el mensaje de error de una ApiError
 * Esta función NO usa hooks, por lo que puede ser llamada desde cualquier lugar
 */
export const getErrorMessage = (err: ApiError): string => {
  const errDetail = (err.body as any)?.detail
  let errorMessage = errDetail || err.message || "Algo salió mal."
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  return errorMessage
}

/**
 * Función de manejo de errores que recibe la función de toast como parámetro
 * Esto evita violar las reglas de hooks de React
 */
export const handleError = (
  err: ApiError,
  showErrorToast: (message: string) => void,
) => {
  const errorMessage = getErrorMessage(err)
  showErrorToast(errorMessage)
}
