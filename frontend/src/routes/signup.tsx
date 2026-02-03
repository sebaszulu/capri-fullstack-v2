import {
  Box,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { type SubmitHandler, useForm } from "react-hook-form"
import {
  FiCalendar,
  FiCreditCard,
  FiHash,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi"

import type { UserRegister } from "@/client"
import { UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { confirmPasswordRules, emailPattern, passwordRules } from "@/utils"
import Logo from "/assets/images/capri-logo.png"
import HotelBg from "/assets/images/hotel-bg.jpg"

export const Route = createFileRoute("/signup")({
  component: SignUp,
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

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const { signUpMutation } = useAuth()
  const { resolvedTheme } = useTheme()
  const logoFilter = resolvedTheme === "light" ? "invert(1)" : "invert(0)"
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      name: "",
      last_name: "",
      password: "",
      confirm_password: "",
      document_type: "Cédula",
      document_number: "",
      phone_number: "",
      birth_date: "",
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(data)
  }

  const inputStyles = {
    bg: "white",
    borderColor: "border.default",
    _hover: { borderColor: "brand.300" },
    _focus: {
      borderColor: "brand.500",
      boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
    },
  }

  return (
    <Flex minH="100vh" w="100%">
      {/* Panel izquierdo - Imagen del hotel */}
      <Box
        display={{ base: "none", xl: "block" }}
        position="relative"
        w="40%"
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
            maxW="md"
            textAlign="center"
            className="animate-fade-in-up"
          >
            <Image
              src={Logo}
              alt="Capri Doradal Logo"
              h="80px"
              filter="brightness(0) invert(1)"
            />
            <Text
              fontSize="3xl"
              fontFamily="heading"
              fontWeight="600"
              lineHeight="1.2"
            >
              Únete a la experiencia Capri
            </Text>
            <Text fontSize="md" opacity={0.9} maxW="sm">
              Crea tu cuenta y disfruta de la mejor experiencia hotelera en el
              corazón del Magdalena Medio.
            </Text>
          </VStack>
        </Flex>
      </Box>

      {/* Panel derecho - Formulario */}
      <Flex
        flex={1}
        direction="column"
        justify="center"
        align="center"
        bg={{ base: "bg.canvas", xl: "white" }}
        p={{ base: 6, md: 8 }}
        overflowY="auto"
      >
        <VStack
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          gap={5}
          w="100%"
          maxW="500px"
          className="animate-fade-in-up"
          py={8}
        >
          {/* Logo para móvil */}
          <Image
            display={{ base: "block", xl: "none" }}
            src={Logo}
            alt="Capri Doradal Logo"
            h="60px"
            mb={2}
            style={{ filter: logoFilter }}
          />

          <VStack gap={1} textAlign="center" mb={2}>
            <Heading
              size={{ base: "xl", md: "2xl" }}
              fontFamily="heading"
              fontWeight="600"
              color="fg.default"
            >
              Crear tu cuenta
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              Completa tus datos para registrarte
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="100%">
            <Field
              label="Nombre"
              invalid={!!errors.name}
              errorText={errors.name?.message}
            >
              <InputGroup
                w="100%"
                startElement={<FiUser color="var(--chakra-colors-brand-500)" />}
              >
                <Input
                  {...register("name", {
                    required: "El nombre es requerido",
                  })}
                  placeholder="Tu nombre"
                  {...inputStyles}
                />
              </InputGroup>
            </Field>

            <Field
              label="Apellido"
              invalid={!!errors.last_name}
              errorText={errors.last_name?.message}
            >
              <InputGroup
                w="100%"
                startElement={<FiUser color="var(--chakra-colors-brand-500)" />}
              >
                <Input
                  {...register("last_name", {
                    required: "El apellido es requerido",
                  })}
                  placeholder="Tu apellido"
                  {...inputStyles}
                />
              </InputGroup>
            </Field>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="100%">
            <Field
              label="Tipo de Documento"
              invalid={!!errors.document_type}
              errorText={errors.document_type?.message}
            >
              <InputGroup
                w="100%"
                startElement={
                  <FiCreditCard color="var(--chakra-colors-brand-500)" />
                }
              >
                <select
                  {...register("document_type", { required: "Requerido" })}
                  style={{
                    width: "100%",
                    padding: "8px 8px 8px 40px",
                    borderRadius: "8px",
                    border: "1px solid var(--chakra-colors-border-default)",
                    background: "white",
                    height: "40px",
                    fontSize: "14px",
                  }}
                >
                  <option value="Cédula">Cédula</option>
                  <option value="Tarjeta de identidad">T.I.</option>
                  <option value="Cédula de extranjería">C.E.</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </InputGroup>
            </Field>

            <Field
              label="Número de Documento"
              invalid={!!errors.document_number}
              errorText={errors.document_number?.message}
            >
              <InputGroup
                w="100%"
                startElement={<FiHash color="var(--chakra-colors-brand-500)" />}
              >
                <Input
                  {...register("document_number", {
                    required: "El número es requerido",
                  })}
                  placeholder="Número"
                  {...inputStyles}
                />
              </InputGroup>
            </Field>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="100%">
            <Field
              label="Teléfono"
              invalid={!!errors.phone_number}
              errorText={errors.phone_number?.message}
            >
              <InputGroup
                w="100%"
                startElement={
                  <FiPhone color="var(--chakra-colors-brand-500)" />
                }
              >
                <Input
                  {...register("phone_number", {
                    required: "El teléfono es requerido",
                    minLength: { value: 10, message: "Mínimo 10 dígitos" },
                    maxLength: { value: 10, message: "Máximo 10 dígitos" },
                  })}
                  placeholder="3001234567"
                  type="tel"
                  {...inputStyles}
                />
              </InputGroup>
            </Field>

            <Field
              label="Fecha de Nacimiento"
              invalid={!!errors.birth_date}
              errorText={errors.birth_date?.message}
            >
              <InputGroup
                w="100%"
                startElement={
                  <FiCalendar color="var(--chakra-colors-brand-500)" />
                }
              >
                <Input
                  {...register("birth_date", {
                    required: "Requerida",
                  })}
                  type="date"
                  {...inputStyles}
                />
              </InputGroup>
            </Field>
          </SimpleGrid>

          <Field
            label="Correo Electrónico"
            invalid={!!errors.email}
            errorText={errors.email?.message}
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
                placeholder="ejemplo@correo.com"
                type="email"
                {...inputStyles}
              />
            </InputGroup>
          </Field>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="100%">
            <Field
              label="Contraseña"
              invalid={!!errors.password}
              errorText={errors.password?.message}
            >
              <PasswordInput
                type="password"
                startElement={<FiLock color="var(--chakra-colors-brand-500)" />}
                {...register("password", passwordRules())}
                placeholder="********"
                errors={errors}
                bg="white"
                borderColor="border.default"
              />
            </Field>

            <Field
              label="Confirmar Contraseña"
              invalid={!!errors.confirm_password}
              errorText={errors.confirm_password?.message}
            >
              <PasswordInput
                type="confirm_password"
                startElement={<FiLock color="var(--chakra-colors-brand-500)" />}
                {...register(
                  "confirm_password",
                  confirmPasswordRules(getValues),
                )}
                placeholder="********"
                errors={errors}
                bg="white"
                borderColor="border.default"
              />
            </Field>
          </SimpleGrid>

          <Button
            variant="solid"
            type="submit"
            loading={isSubmitting}
            size="lg"
            w="100%"
            mt={4}
          >
            Completar Registro
          </Button>

          <Text color="fg.muted" fontSize="sm" textAlign="center">
            ¿Ya tienes una cuenta?{" "}
            <RouterLink to="/login" className="main-link">
              Iniciar Sesión
            </RouterLink>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  )
}

export default SignUp
