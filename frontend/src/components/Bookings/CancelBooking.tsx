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
  Text,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FiTrash2 } from "react-icons/fi"

import { type ApiError, BookingsService } from "../../client"
import { toaster } from "../ui/toaster"

interface CancelBookingProps {
  id: string
}

function CancelBooking({ id }: CancelBookingProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => BookingsService.deleteBooking({ bookingId: id }),
    onSuccess: () => {
      toaster.create({
        description: "Reserva cancelada exitosamente.",
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

  const onCancelBooking = async () => {
    mutation.mutate()
  }

  return (
    <DialogRoot size="md" placement="center" role="alertdialog">
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 /> Cancelar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Cancelar Reserva</DialogHeader>
        <DialogBody>
          <Text mb={4}>
            ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no
            se puede deshacer.
          </Text>
        </DialogBody>
        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button variant="outline">No, Mantener</Button>
          </DialogActionTrigger>
          <Button
            colorPalette="red"
            loading={mutation.isPending}
            onClick={onCancelBooking}
          >
            Sí, Cancelar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default CancelBooking
