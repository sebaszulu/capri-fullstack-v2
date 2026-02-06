import {
  Badge,
  Button,
  DialogActionTrigger,
  DialogTitle,
  Flex,
  Input,
  NativeSelectField,
  NativeSelectRoot,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus, FaSearch } from "react-icons/fa"
import {
  BookingsService,
  RoomsService,
  type UserPublic,
  UsersService,
} from "@/client"
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

interface BookingForm {
  user_id: number
  room_id: number
  check_in: string
  check_out: string
}

const AddBooking = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [docSearch, setDocSearch] = useState("")
  const [foundUser, setFoundUser] = useState<UserPublic | null>(null)

  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => RoomsService.readRooms({}),
  })

  const { refetch: searchUser } = useQuery({
    queryKey: ["userSearch", docSearch],
    queryFn: () =>
      UsersService.searchUserByDocument({ documentNumber: docSearch }),
    enabled: false,
    retry: false,
  })

  const handleSearch = async () => {
    if (!docSearch) return
    const { data } = await searchUser()
    if (data) {
      setFoundUser(data)
      setValue("user_id", data.id, { shouldValidate: true })
      showSuccessToast(`Usuario encontrado: ${data.name} ${data.last_name}`)
    } else {
      setFoundUser(null)
      setValue("user_id", undefined as any)
      showErrorToast("Usuario no encontrado con ese documento.")
    }
  }

  const availableRooms = rooms?.filter((room) => room.is_available) || []

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<BookingForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      user_id: undefined,
      room_id: undefined,
      check_in: "",
      check_out: "",
    },
  })

  const checkInDate = watch("check_in")
  const userId = watch("user_id")

  const mutation = useMutation({
    mutationFn: (data: BookingForm) =>
      BookingsService.createBooking({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Reserva creada exitosamente.")
      reset()
      setFoundUser(null)
      setDocSearch("")
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      showErrorToast(getErrorMessage(err))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })

  const onSubmit: SubmitHandler<BookingForm> = (data) => {
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
        <Button value="add-booking" my={4}>
          <FaPlus fontSize="16px" />
          Agregar Reserva
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Agregar Reserva</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Field
                required
                invalid={!!errors.user_id}
                errorText={errors.user_id?.message}
                label="Buscar Huésped (Cédula/Documento)"
              >
                <Flex gap={2}>
                  <Input
                    placeholder="Número de documento..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleSearch())
                    }
                  />
                  <Button onClick={handleSearch} variant="subtle">
                    <FaSearch />
                  </Button>
                </Flex>
                {foundUser && (
                  <Flex
                    mt={2}
                    p={2}
                    bg="teal/10"
                    borderRadius="md"
                    align="center"
                    gap={2}
                  >
                    <Text fontSize="sm" fontWeight="bold">
                      {foundUser.name} {foundUser.last_name}
                    </Text>
                    <Badge colorPalette="teal">ID: {foundUser.id}</Badge>
                  </Flex>
                )}
                <input
                  type="hidden"
                  {...register("user_id", {
                    required: "Debes buscar y seleccionar un huésped",
                  })}
                />
              </Field>

              <Field
                required
                invalid={!!errors.room_id}
                errorText={errors.room_id?.message}
                label="Habitación"
              >
                <Controller
                  control={control}
                  name="room_id"
                  rules={{ required: "La habitación es requerida" }}
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
                        <option value="">Seleccionar habitación</option>
                        {availableRooms.map((room) => (
                          <option key={room.id} value={String(room.id)}>
                            Habitación {room.room_number}
                          </option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                />
              </Field>

              <Field
                required
                invalid={!!errors.check_in}
                errorText={errors.check_in?.message}
                label="Fecha de Entrada"
              >
                <Input
                  {...register("check_in", {
                    required: "La fecha de entrada es requerida",
                  })}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </Field>

              <Field
                required
                invalid={!!errors.check_out}
                errorText={errors.check_out?.message}
                label="Fecha de Salida"
              >
                <Input
                  {...register("check_out", {
                    required: "La fecha de salida es requerida",
                    validate: (value) =>
                      !checkInDate ||
                      value > checkInDate ||
                      "La salida debe ser después de la entrada",
                  })}
                  type="date"
                  min={checkInDate || new Date().toISOString().split("T")[0]}
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
              disabled={!isValid || !userId}
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

export default AddBooking
