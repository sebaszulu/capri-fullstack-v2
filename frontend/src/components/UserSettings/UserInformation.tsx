import {
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import {
  FiCheck,
  FiCreditCard,
  FiEdit3,
  FiMail,
  FiPhone,
  FiUser,
  FiX,
} from "react-icons/fi"

import { type ApiError, UsersService, type UserUpdateMe } from "@/client"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, getErrorMessage } from "@/utils"
import { Field } from "../ui/field"

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserUpdateMe>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: currentUser?.name,
      last_name: currentUser?.last_name,
      email: currentUser?.email,
      phone_number: currentUser?.phone_number,
      birth_date: currentUser?.birth_date,
    },
  })

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Perfil actualizado exitosamente.")
      setEditMode(false)
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<UserUpdateMe> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    toggleEditMode()
  }

  // Componente de campo de información
  const InfoField = ({
    icon,
    label,
    value,
    editComponent,
  }: {
    icon: React.ElementType
    label: string
    value: string
    editComponent?: React.ReactNode
  }) => (
    <Box>
      <HStack color="gray.400" fontSize="xs" fontWeight="600" mb={1} gap={1}>
        <Icon as={icon} boxSize={3} />
        <Text textTransform="uppercase">{label}</Text>
      </HStack>
      {editMode && editComponent ? (
        editComponent
      ) : (
        <Text fontSize="md" fontWeight="500" color="gray.800">
          {value || "No especificado"}
        </Text>
      )}
    </Box>
  )

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="md" color="gray.800">
            Información Personal
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Gestiona tu información de contacto y datos personales
          </Text>
        </Box>
        {!editMode && (
          <Button
            variant="outline"
            colorPalette="brand"
            onClick={toggleEditMode}
            borderRadius="lg"
          >
            <Icon as={FiEdit3} mr={2} />
            Editar
          </Button>
        )}
      </Flex>

      {/* Form */}
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" gap={6}>
          {/* Personal Info Card */}
          <Box
            bg="gray.50"
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              mb={4}
            >
              Datos Personales
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              <InfoField
                icon={FiUser}
                label="Nombre"
                value={currentUser?.name || ""}
                editComponent={
                  <Field
                    invalid={!!errors.name}
                    errorText={errors.name?.message}
                  >
                    <Input
                      {...register("name", {
                        required: "El nombre es requerido",
                      })}
                      type="text"
                      bg="white"
                      borderRadius="lg"
                      size="md"
                    />
                  </Field>
                }
              />

              <InfoField
                icon={FiUser}
                label="Apellido"
                value={currentUser?.last_name || ""}
                editComponent={
                  <Field
                    invalid={!!errors.last_name}
                    errorText={errors.last_name?.message}
                  >
                    <Input
                      {...register("last_name", {
                        required: "El apellido es requerido",
                      })}
                      type="text"
                      bg="white"
                      borderRadius="lg"
                      size="md"
                    />
                  </Field>
                }
              />
            </Grid>
          </Box>

          {/* Document Card - Read Only */}
          <Box
            bg="gray.50"
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              mb={4}
            >
              Documento de Identidad
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              <InfoField
                icon={FiCreditCard}
                label="Tipo de Documento"
                value={currentUser?.document_type || ""}
              />

              <InfoField
                icon={FiCreditCard}
                label="Número de Documento"
                value={currentUser?.document_number || ""}
              />
            </Grid>

            {editMode && (
              <Text fontSize="xs" color="gray.400" mt={3}>
                * El documento de identidad no puede ser modificado. Contacta al
                administrador si necesitas actualizarlo.
              </Text>
            )}
          </Box>

          {/* Contact Info Card */}
          <Box
            bg="gray.50"
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              mb={4}
            >
              Información de Contacto
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              <InfoField
                icon={FiMail}
                label="Correo Electrónico"
                value={currentUser?.email || ""}
                editComponent={
                  <Field
                    invalid={!!errors.email}
                    errorText={errors.email?.message}
                  >
                    <Input
                      {...register("email", {
                        required: "El correo es requerido",
                        pattern: emailPattern,
                      })}
                      type="email"
                      bg="white"
                      borderRadius="lg"
                      size="md"
                    />
                  </Field>
                }
              />

              <InfoField
                icon={FiPhone}
                label="Teléfono"
                value={currentUser?.phone_number || ""}
                editComponent={
                  <Field>
                    <Input
                      {...register("phone_number")}
                      type="tel"
                      placeholder="+57 300 123 4567"
                      bg="white"
                      borderRadius="lg"
                      size="md"
                    />
                  </Field>
                }
              />
            </Grid>
          </Box>

          {/* Action Buttons */}
          {editMode && (
            <Flex gap={3} justify="flex-end" pt={2}>
              <Button
                variant="ghost"
                colorPalette="gray"
                onClick={onCancel}
                disabled={isSubmitting}
                borderRadius="lg"
              >
                <Icon as={FiX} mr={2} />
                Cancelar
              </Button>
              <Button
                type="submit"
                colorPalette="brand"
                loading={isSubmitting}
                disabled={!isDirty}
                borderRadius="lg"
              >
                <Icon as={FiCheck} mr={2} />
                Guardar Cambios
              </Button>
            </Flex>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}

export default UserInformation
