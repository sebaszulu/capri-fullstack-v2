import { Box, Flex, Image, Input, Text, VStack } from "@chakra-ui/react"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import Logo from "/assets/images/capri-logo.png"
import HotelBg from "/assets/images/hotel-bg.jpg"
import { emailPattern, passwordRules } from "../utils"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      try {
        // Verificar rol del usuario para redirigir correctamente
        const user = await UsersService.readUserMe()
        if (user?.is_superuser) {
          throw redirect({ to: "/dashboard" })
        }
        throw redirect({ to: "/my-bookings" })
      } catch (e) {
        if (e instanceof Error && "status" in e && (e as any).status === 302) {
          throw e
        }
        // Si hay error (ej: token inválido), limpiar y permitir cargar el login
        localStorage.removeItem("access_token")
      }
    }
  },
})

function Login() {
  const { loginMutation } = useAuth()
  const { resolvedTheme } = useTheme()
  const logoFilter = resolvedTheme === "light" ? "invert(1)" : "invert(0)"
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    try {
      await loginMutation.mutateAsync(data)
    } catch {
      // error is handled by useAuth hook
    }
  }

  return (
    <Flex minH="100vh" w="100%">
      {/* Panel izquierdo - Imagen del hotel */}
      <Box
        display={{ base: "none", md: "block" }}
        position="relative"
        w="55%"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(${HotelBg})`}
          bgSize="cover"
          bgPosition="center"
          _after={{
            content: '""',
            position: "absolute",
            inset: 0,
            bg: "linear-gradient(135deg, rgba(26, 95, 74, 0.7) 0%, rgba(13, 61, 46, 0.85) 100%)",
          }}
        />
        {/* Contenido sobre la imagen */}
        <Flex
          position="relative"
          zIndex={1}
          h="100%"
          direction="column"
          justify="center"
          align="center"
          p={12}
          color="white"
        >
          <VStack
            gap={6}
            maxW="lg"
            textAlign="center"
            className="animate-fade-in-up"
          >
            <Image
              src={Logo}
              alt="Capri Doradal Logo"
              h="100px"
              filter="brightness(0) invert(1)"
            />
            <Text
              fontSize="4xl"
              fontFamily="heading"
              fontWeight="600"
              lineHeight="1.2"
            >
              Bienvenido a Capri Doradal
            </Text>
            <Text fontSize="lg" opacity={0.9} maxW="md">
              Tu refugio en el corazón del Magdalena Medio. Naturaleza, confort
              y experiencias inolvidables te esperan.
            </Text>
            <Flex gap={8} mt={4}>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" fontFamily="heading">
                  24
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Habitaciones
                </Text>
              </VStack>
              <Box w="1px" bg="whiteAlpha.400" />
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" fontFamily="heading">
                  5★
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Calificación
                </Text>
              </VStack>
              <Box w="1px" bg="whiteAlpha.400" />
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" fontFamily="heading">
                  ∞
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Naturaleza
                </Text>
              </VStack>
            </Flex>
          </VStack>
        </Flex>
      </Box>

      {/* Panel derecho - Formulario */}
      <Flex
        flex={1}
        direction="column"
        justify="center"
        align="center"
        bg={{ base: "bg.canvas", md: "white" }}
        p={{ base: 6, md: 12 }}
        position="relative"
      >
        {/* Patrón decorativo sutil */}
        <Box
          position="absolute"
          top={0}
          right={0}
          w="200px"
          h="200px"
          opacity={0.03}
          bgGradient="radial(brand.500, transparent)"
          borderRadius="full"
          transform="translate(50%, -50%)"
        />

        <VStack
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          gap={6}
          w="100%"
          maxW="400px"
          className="animate-fade-in-up"
        >
          {/* Logo para móvil */}
          <Image
            display={{ base: "block", md: "none" }}
            src={Logo}
            alt="Capri Doradal Logo"
            h="80px"
            mb={4}
            style={{ filter: logoFilter }}
          />

          <VStack gap={2} textAlign="center" mb={4}>
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontFamily="heading"
              fontWeight="600"
              color="fg.default"
            >
              Iniciar Sesión
            </Text>
            <Text color="fg.muted" fontSize="sm">
              Accede al panel de gestión del hotel
            </Text>
          </VStack>

          <Field
            invalid={!!errors.username}
            errorText={errors.username?.message}
          >
            <InputGroup
              w="100%"
              startElement={<FiMail color="var(--chakra-colors-brand-500)" />}
            >
              <Input
                {...register("username", {
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

          <PasswordInput
            type="password"
            startElement={<FiLock color="var(--chakra-colors-brand-500)" />}
            {...register("password", passwordRules())}
            placeholder="Contraseña"
            errors={errors}
            size="lg"
            bg="white"
            borderColor="border.default"
            _hover={{ borderColor: "brand.300" }}
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          />

          <Flex w="100%" justify="flex-end">
            <RouterLink to="/recover-password" className="main-link">
              <Text fontSize="sm">¿Olvidaste tu contraseña?</Text>
            </RouterLink>
          </Flex>

          <Button
            variant="solid"
            type="submit"
            loading={isSubmitting}
            size="lg"
            w="100%"
            mt={2}
          >
            Iniciar Sesión
          </Button>

          <Text color="fg.muted" fontSize="sm" textAlign="center">
            ¿No tienes una cuenta?{" "}
            <RouterLink to="/signup" className="main-link">
              Regístrate
            </RouterLink>
          </Text>
        </VStack>

        {/* Footer */}
        <Text position="absolute" bottom={6} fontSize="xs" color="fg.muted">
          © 2024 Hotel Capri Doradal. Todos los derechos reservados.
        </Text>
      </Flex>
    </Flex>
  )
}
