"use client"

import type { HTMLChakraProps, RecipeProps } from "@chakra-ui/react"
import { createRecipeContext } from "@chakra-ui/react"

export interface LinkButtonProps
  extends HTMLChakraProps<"a", RecipeProps<"button">> {}

const { withContext } = createRecipeContext({ key: "button" })

// Reemplaza "a" con el componente de enlace de tu framework
export const LinkButton = withContext<HTMLAnchorElement, LinkButtonProps>("a")
