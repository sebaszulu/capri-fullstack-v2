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
  type RoomTypeCreate,
  type RoomTypeRead,
  RoomTypesService,
} from "../../client"
import { Field } from "../ui/field"
import { toaster } from "../ui/toaster"

interface EditRoomTypeProps {
  roomType: RoomTypeRead
}

function EditRoomType({ roomType }: EditRoomTypeProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RoomTypeCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: roomType,
  })

  const mutation = useMutation({
    mutationFn: (data: RoomTypeCreate) =>
      RoomTypesService.updateRoomType({
        roomTypeId: roomType.id,
        requestBody: data,
      }),
    onSuccess: () => {
      toaster.create({
        description: "Tipo de habitación actualizado exitosamente.",
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

  const onSubmit: SubmitHandler<RoomTypeCreate> = async (data) => {
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
        <DialogHeader>Editar Tipo de Habitación</DialogHeader>
        <DialogBody display="flex" flexDir="column" gap={4}>
          <Field
            label="Nombre"
            invalid={!!errors.name}
            errorText={errors.name?.message}
          >
            <input
              {...register("name", { required: "El nombre es requerido" })}
              placeholder="Nombre"
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
            label="Descripción"
            invalid={!!errors.description}
            errorText={errors.description?.message}
          >
            <textarea
              {...register("description", {
                required: "La descripción es requerida",
              })}
              placeholder="Descripción"
              className="chakra-textarea"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #E2E8F0",
                minHeight: "100px",
              }}
            />
          </Field>

          <Field
            label="Capacidad"
            invalid={!!errors.capacity}
            errorText={errors.capacity?.message}
          >
            <input
              type="number"
              {...register("capacity", {
                required: "La capacidad es requerida",
                valueAsNumber: true,
              })}
              placeholder="Capacidad"
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
            label="Precio Base"
            invalid={!!errors.base_price}
            errorText={errors.base_price?.message}
          >
            <input
              type="number"
              step="0.01"
              {...register("base_price", {
                required: "El precio base es requerido",
                valueAsNumber: true,
              })}
              placeholder="Precio Base"
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

export default EditRoomType
