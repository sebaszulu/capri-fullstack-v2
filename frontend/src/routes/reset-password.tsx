import { Box, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiArrowLeft, FiLock } from "react-icons/fi"

import {
  type ApiError,
  LoginService,
  type NewPassword,
  UsersService,
} from "@/client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, getErrorMessage, passwordRules } from "@/utils"
import Logo from "/assets/images/capri-logo.png"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      const user = await UsersService.readUserMe()
      if (user?.is_superuser) {
        throw redirect({ to: "/dashboard" })
      }
      throw redirect({ to: "/my-bookings" })
    }
  },
})

function ResetPassword() {
  const { resolvedTheme } = useTheme()
  const logoFilter = resolvedTheme === "light" ? "invert(1)" : "invert(0)"
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  })
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      throw new Error(
        "El token de recuperación es requerido. Por favor solicita un nuevo enlace.",
      )
    }
    await LoginService.resetPassword({
      requestBody: { new_password: data.new_password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showSuccessToast("Tu contraseña ha sido restablecida exitosamente.")
      reset()
      navigate({ to: "/login" })
    },
    onError: (err: ApiError | Error) => {
      showErrorToast(getErrorMessage(err as ApiError))
    },
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg.canvas" p={6}>
      {/* Patrón decorativo */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="50%"
        h="50%"
        opacity={0.03}
        bgGradient="radial(brand.500, transparent)"
        borderRadius="full"
        transform="translate(30%, -30%)"
      />

      <VStack
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        gap={6}
        w="100%"
        maxW="400px"
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="xl"
        border="1px solid"
        borderColor="border.default"
        className="animate-fade-in-up"
      >
        <Image
          src={Logo}
          alt="Capri Doradal Logo"
          h="60px"
          style={{ filter: logoFilter }}
        />

        <VStack gap={2} textAlign="center">
          <Heading
            size="xl"
            fontFamily="heading"
            fontWeight="600"
            color="brand.700"
          >
            Nueva Contraseña
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </Text>
        </VStack>

        <PasswordInput
          startElement={<FiLock color="var(--chakra-colors-brand-500)" />}
          type="new_password"
          errors={errors}
          {...register("new_password", passwordRules())}
          placeholder="Nueva contraseña"
          size="lg"
          bg="white"
          borderColor="border.default"
          _hover={{ borderColor: "brand.300" }}
          _focus={{
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          }}
        />

        <PasswordInput
          startElement={<FiLock color="var(--chakra-colors-brand-500)" />}
          type="confirm_password"
          errors={errors}
          {...register("confirm_password", confirmPasswordRules(getValues))}
          placeholder="Confirmar contraseña"
          size="lg"
          bg="white"
          borderColor="border.default"
          _hover={{ borderColor: "brand.300" }}
          _focus={{
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          }}
        />

        <Button
          variant="solid"
          type="submit"
          loading={isSubmitting}
          size="lg"
          w="100%"
        >
          Guardar Contraseña
        </Button>

        <RouterLink to="/login">
          <Flex
            align="center"
            gap={2}
            color="brand.500"
            fontSize="sm"
            fontWeight="500"
            _hover={{ color: "brand.600" }}
          >
            <FiArrowLeft />
            <Text>Volver al inicio de sesión</Text>
          </Flex>
        </RouterLink>
      </VStack>
    </Flex>
  )
}
