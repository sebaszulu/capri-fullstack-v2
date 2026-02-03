import {
  Box,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiArrowLeft, FiMail } from "react-icons/fi"

import { type ApiError, LoginService, UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, getErrorMessage } from "@/utils"
import Logo from "/assets/images/capri-logo.png"

interface FormData {
  email: string
}

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
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

function RecoverPassword() {
  const { resolvedTheme } = useTheme()
  const logoFilter = resolvedTheme === "light" ? "invert(1)" : "invert(0)"
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("Correo de recuperación enviado exitosamente.")
      reset()
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg.canvas" p={6}>
      {/* Patrón decorativo */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="50%"
        h="50%"
        opacity={0.03}
        bgGradient="radial(brand.500, transparent)"
        borderRadius="full"
        transform="translate(-30%, -30%)"
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
            color="fg.default"
          >
            Recuperar Contraseña
          </Heading>
          <Text color="fg.muted" fontSize="sm" maxW="300px">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para
            restablecer tu contraseña.
          </Text>
        </VStack>

        <Field
          invalid={!!errors.email}
          errorText={errors.email?.message}
          w="100%"
        >
          <InputGroup
            w="100%"
            startElement={<FiMail color="var(--chakra-colors-brand-500)" />}
          >
            <Input
              {...register("email", {
                required: "El correo es requerido",
                pattern: emailPattern,
              })}
              placeholder="Correo electrónico"
              type="email"
              size="lg"
              bg="white"
              borderColor="border.default"
              _hover={{ borderColor: "brand.300" }}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
            />
          </InputGroup>
        </Field>

        <Button
          variant="solid"
          type="submit"
          loading={isSubmitting}
          size="lg"
          w="100%"
        >
          Enviar Instrucciones
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
