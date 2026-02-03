import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  NativeSelectField,
  NativeSelectRoot,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"
import { RoomsService, RoomTypesService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { getErrorMessage } from "@/utils"
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

interface RoomForm {
  room_number: number
  room_type_id: number
  is_available: boolean
}

const AddRoom = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: roomTypes } = useQuery({
    queryKey: ["room-types"],
    queryFn: () => RoomTypesService.readRoomTypes({}),
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RoomForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      room_number: undefined,
      room_type_id: undefined,
      is_available: true,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RoomForm) =>
      RoomsService.createRoom({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Habitación creada exitosamente.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })

  const onSubmit: SubmitHandler<RoomForm> = (data) => {
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
        <Button value="add-room" my={4}>
          <FaPlus fontSize="16px" />
          Agregar Habitación
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Agregar Habitación</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.room_number}
                errorText={errors.room_number?.message}
                label="Número de Habitación"
              >
                <Input
                  {...register("room_number", {
                    required: "El número de habitación es requerido",
                    min: { value: 1, message: "El número debe ser positivo" },
                    valueAsNumber: true,
                  })}
                  placeholder="ej. 101, 202"
                  type="number"
                />
              </Field>

              <Field
                required
                invalid={!!errors.room_type_id}
                errorText={errors.room_type_id?.message}
                label="Tipo de Habitación"
              >
                <Controller
                  control={control}
                  name="room_type_id"
                  rules={{ required: "El tipo de habitación es requerido" }}
                  render={({ field }) => (
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      >
                        <option value="">Seleccionar tipo</option>
                        {roomTypes?.map((type) => (
                          <option key={type.id} value={String(type.id)}>
                            {type.name} - ${type.base_price}/noche
                          </option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                />
              </Field>

              <Controller
                control={control}
                name="is_available"
                render={({ field }) => (
                  <Field colorPalette="teal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={({ checked }) => field.onChange(checked)}
                    >
                      Disponible para reserva
                    </Checkbox>
                  </Field>
                )}
              />
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

export default AddRoom
