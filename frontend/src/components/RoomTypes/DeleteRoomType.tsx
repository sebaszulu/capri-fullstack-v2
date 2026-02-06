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

import { type ApiError, RoomTypesService } from "../../client"
import { toaster } from "../ui/toaster"

interface DeleteRoomTypeProps {
  id: number
}

function DeleteRoomType({ id }: DeleteRoomTypeProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => RoomTypesService.deleteRoomType({ roomTypeId: id }),
    onSuccess: () => {
      toaster.create({
        description: "Tipo de habitación eliminado exitosamente.",
        type: "success",
      })
      queryClient.invalidateQueries({ queryKey: ["room-types"] })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      toaster.create({
        description: errDetail || "Algo salió mal.",
        type: "error",
      })
    },
  })

  const onDelete = async () => {
    mutation.mutate()
  }

  return (
    <DialogRoot size="md" placement="center" role="alertdialog">
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" colorPalette="red">
          <FiTrash2 /> Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Eliminar Tipo de Habitación</DialogHeader>
        <DialogBody>
          <Text mb={4}>
            ¿Estás seguro de que quieres eliminar este tipo de habitación? Todas
            las habitaciones asociadas también se verán afectadas. Esta acción
            no se puede deshacer.
          </Text>
        </DialogBody>
        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogActionTrigger>
          <Button
            colorPalette="red"
            loading={mutation.isPending}
            onClick={onDelete}
          >
            Eliminar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteRoomType
