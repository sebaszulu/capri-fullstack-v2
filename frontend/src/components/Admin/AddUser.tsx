import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Flex,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import { type UserCreate, UsersService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, getErrorMessage } from "@/utils"
import { Checkbox } from "../ui/checkbox"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface UserCreateForm extends UserCreate {
  confirm_password: string
}

const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UserCreateForm>({
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
      is_superuser: false,
      is_active: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUser({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Usuario creado exitosamente.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit: SubmitHandler<UserCreateForm> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-user" my={4}>
          <FaPlus fontSize="16px" />
          Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Agregar Usuario</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Completa el formulario para agregar un nuevo usuario al sistema.
            </Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.email}
                errorText={errors.email?.message}
                label="Correo"
              >
                <Input
                  {...register("email", {
                    required: "El correo es requerido",
                    pattern: emailPattern,
                  })}
                  placeholder="Correo electrónico"
                  type="email"
                />
              </Field>

              <Flex gap={4} w="full">
                <Field
                  required
                  invalid={!!errors.name}
                  errorText={errors.name?.message}
                  label="Nombre"
                >
                  <Input
                    {...register("name", { required: "Requerido" })}
                    placeholder="Nombre"
                    type="text"
                  />
                </Field>
                <Field
                  required
                  invalid={!!errors.last_name}
                  errorText={errors.last_name?.message}
                  label="Apellido"
                >
                  <Input
                    {...register("last_name", { required: "Requerido" })}
                    placeholder="Apellido"
                    type="text"
                  />
                </Field>
              </Flex>

              <Flex gap={4} w="full">
                <Field required label="Tipo Documento">
                  <select
                    {...register("document_type", { required: "Requerido" })}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--chakra-colors-border)",
                      background: "transparent",
                    }}
                  >
                    <option value="Cédula">Cédula</option>
                    <option value="Tarjeta de identidad">
                      Tarjeta de identidad
                    </option>
                    <option value="Cédula de extranjería">
                      Cédula de extranjería
                    </option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </Field>
                <Field
                  required
                  invalid={!!errors.document_number}
                  errorText={errors.document_number?.message}
                  label="Número Documento"
                >
                  <Input
                    {...register("document_number", { required: "Requerido" })}
                    placeholder="Número"
                    type="text"
                  />
                </Field>
              </Flex>

              <Field
                required
                invalid={!!errors.phone_number}
                errorText={errors.phone_number?.message}
                label="Teléfono"
              >
                <Input
                  {...register("phone_number", {
                    required: "El teléfono es requerido",
                    minLength: { value: 10, message: "Mínimo 10 dígitos" },
                    maxLength: { value: 10, message: "Máximo 10 dígitos" },
                  })}
                  placeholder="Teléfono (10 dígitos)"
                  type="tel"
                />
              </Field>

              <Field
                required
                invalid={!!errors.password}
                errorText={errors.password?.message}
                label="Contraseña"
              >
                <Input
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres",
                    },
                  })}
                  placeholder="Contraseña"
                  type="password"
                />
              </Field>

              <Field
                required
                invalid={!!errors.confirm_password}
                errorText={errors.confirm_password?.message}
                label="Confirmar Contraseña"
              >
                <Input
                  {...register("confirm_password", {
                    required: "Por favor confirma tu contraseña",
                    validate: (value) =>
                      value === getValues().password ||
                      "Las contraseñas no coinciden",
                  })}
                  placeholder="Contraseña"
                  type="password"
                />
              </Field>
            </VStack>

            <Flex mt={4} direction="column" gap={4}>
              <Controller
                control={control}
                name="is_superuser"
                render={({ field }) => (
                  <Field disabled={field.disabled} colorPalette="teal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      ¿Es superusuario?
                    </Checkbox>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Field disabled={field.disabled} colorPalette="teal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      ¿Está activo?
                    </Checkbox>
                  </Field>
                )}
              />
            </Flex>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Guardar
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddUser
