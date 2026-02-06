import {
  Button,
  DialogTitle,
  Input,
  NativeSelectField,
  NativeSelectRoot,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"
import { type RoomRead, RoomsService, RoomTypesService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { getErrorMessage } from "@/utils"
import { Checkbox } from "../ui/checkbox"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditRoomProps {
  room: RoomRead
}

interface RoomUpdateForm {
  room_number: number
  room_type_id: number
  is_available: boolean
}

const EditRoom = ({ room }: EditRoomProps) => {
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
    formState: { errors, isSubmitting },
  } = useForm<RoomUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      is_available: room.is_available,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RoomUpdateForm) =>
      RoomsService.updateRoom({ roomId: room.id!, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Habitación actualizada exitosamente.")
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

  const onSubmit: SubmitHandler<RoomUpdateForm> = async (data) => {
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
        <Button variant="ghost" size="sm">
          <FaExchangeAlt fontSize="16px" />
          Editar Habitación
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar Habitación</DialogTitle>
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
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
            <Button variant="solid" type="submit" loading={isSubmitting}>
              Guardar
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default EditRoom
