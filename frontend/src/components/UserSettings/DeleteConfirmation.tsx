import { Button, ButtonGroup, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { type ApiError, UsersService } from "@/client"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { getErrorMessage } from "@/utils"

const DeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast("Tu cuenta ha sido eliminada exitosamente")
      setIsOpen(false)
      logout()
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      role="alertdialog"
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="solid" colorPalette="red" mt={4}>
          Eliminar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Confirmación Requerida</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Todos los datos de tu cuenta serán{" "}
              <strong>eliminados permanentemente.</strong> Si estás seguro, por
              favor haz clic en <strong>"Confirmar"</strong> para continuar.
              Esta acción no se puede deshacer.
            </Text>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
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
                colorPalette="red"
                type="submit"
                loading={isSubmitting}
              >
                Confirmar
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteConfirmation
