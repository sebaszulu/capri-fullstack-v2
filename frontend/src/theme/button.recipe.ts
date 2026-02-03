import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "600",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "lg",
    transition: "all 0.2s ease",
    _hover: {
      transform: "translateY(-1px)",
      boxShadow: "md",
    },
    _active: {
      transform: "translateY(0)",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "brand.500",
        color: "white",
        _hover: {
          bg: "brand.600",
        },
        _active: {
          bg: "brand.700",
        },
      },
      subtle: {
        bg: "brand.50",
        color: "brand.700",
        _hover: {
          bg: "brand.100",
        },
      },
      outline: {
        borderWidth: "2px",
        borderColor: "brand.500",
        color: "brand.500",
        bg: "transparent",
        _hover: {
          bg: "brand.50",
        },
      },
      ghost: {
        bg: "transparent",
        color: "brand.600",
        _hover: {
          bg: "brand.50",
        },
      },
      danger: {
        bg: "red.500",
        color: "white",
        _hover: {
          bg: "red.600",
        },
      },
    },
    size: {
      sm: {
        px: 3,
        py: 1.5,
        fontSize: "sm",
      },
      md: {
        px: 4,
        py: 2,
        fontSize: "md",
      },
      lg: {
        px: 6,
        py: 3,
        fontSize: "lg",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
})
