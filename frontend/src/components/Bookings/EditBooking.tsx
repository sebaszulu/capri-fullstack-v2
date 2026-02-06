import {
  Button,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiEdit } from "react-icons/fi"

import {
  type ApiError,
  type BookingCreate,
  type BookingRead,
  BookingsService,
} from "../../client"
import { Field } from "../ui/field"
import { toaster } from "../ui/toaster"

interface EditBookingProps {
  booking: BookingRead
}

function EditBooking({ booking }: EditBookingProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BookingCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      check_in: booking.check_in,
      check_out: booking.check_out,
      user_id: booking.user_id,
      room_id: booking.room_id,
      is_active: booking.is_active,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: BookingCreate) =>
      BookingsService.updateBooking({
        bookingId: booking.id!,
        requestBody: data,
      }),
    onSuccess: () => {
      toaster.create({
        description: "Reserva actualizada exitosamente.",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      toaster.create({
        description: errDetail || "Algo salió mal.",
        type: "error",
      })
    },
  })

  const onSubmit: SubmitHandler<BookingCreate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
  }

  return (
    <DialogRoot size="md" placement="center">
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FiEdit /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>Editar Reserva</DialogHeader>
        <DialogBody display="flex" flexDir="column" gap={4}>
          <Field
            label="Fecha de Entrada"
            invalid={!!errors.check_in}
            errorText={errors.check_in?.message}
          >
            <input
              type="date"
              {...register("check_in", {
                required: "La fecha de entrada es requerida",
              })}
              className="chakra-input"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #E2E8F0",
              }}
            />
          </Field>

          <Field
            label="Fecha de Salida"
            invalid={!!errors.check_out}
            errorText={errors.check_out?.message}
          >
            <input
              type="date"
              {...register("check_out", {
                required: "La fecha de salida es requerida",
              })}
              className="chakra-input"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #E2E8F0",
              }}
            />
          </Field>
        </DialogBody>
        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Guardar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditBooking
