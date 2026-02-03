import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import { RoomTypesService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { getErrorMessage } from "@/utils"
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

interface RoomTypeForm {
  name: string
  description: string
  capacity: number
  amenities?: string[]
  base_price: number
}

const AddRoomType = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RoomTypeForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      capacity: 1,
      amenities: [],
      base_price: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RoomTypeForm) =>
      RoomTypesService.createRoomType({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Tipo de habitación creado exitosamente.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] })
    },
  })

  const onSubmit: SubmitHandler<RoomTypeForm> = (data) => {
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
        <Button value="add-room-type" my={4}>
          <FaPlus fontSize="16px" />
          Agregar Tipo de Habitación
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Agregar Tipo de Habitación</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Completa el formulario para agregar un nuevo tipo de habitación.
            </Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Nombre"
              >
                <Input
                  {...register("name", {
                    required: "El nombre es requerido",
                  })}
                  placeholder="ej. Estándar, Deluxe, Suite"
                  type="text"
                />
              </Field>

              <Field
                required
                invalid={!!errors.description}
                errorText={errors.description?.message}
                label="Descripción"
              >
                <Textarea
                  {...register("description", {
                    required: "La descripción es requerida",
                  })}
                  placeholder="Describe las características del tipo de habitación"
                />
              </Field>

              <Field
                required
                invalid={!!errors.capacity}
                errorText={errors.capacity?.message}
                label="Capacidad"
              >
                <Input
                  {...register("capacity", {
                    required: "La capacidad es requerida",
                    min: {
                      value: 1,
                      message: "La capacidad debe ser al menos 1",
                    },
                    valueAsNumber: true,
                  })}
                  placeholder="Número de huéspedes"
                  type="number"
                />
              </Field>

              <Field
                required
                invalid={!!errors.base_price}
                errorText={errors.base_price?.message}
                label="Precio Base"
              >
                <Input
                  {...register("base_price", {
                    required: "El precio base es requerido",
                    min: {
                      value: 0,
                      message: "El precio no puede ser negativo",
                    },
                    valueAsNumber: true,
                  })}
                  placeholder="Precio por noche"
                  type="number"
                  step="0.01"
                />
              </Field>
            </VStack>
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

export default AddRoomType
