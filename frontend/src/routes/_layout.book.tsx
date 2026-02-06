import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiHome,
  FiUsers,
} from "react-icons/fi"

import {
  type ApiError,
  type BookingCreate,
  BookingsService,
  RoomsService,
  RoomTypesService,
} from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"

// Imagen de habitación
import RoomImg from "/assets/images/rooms/IMG_3726-compressed-scaled.jpg"

export const Route = createFileRoute("/_layout/book")({
  component: BookingWizard,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
})

// Calcular noches entre dos fechas
function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  return diff > 0 ? diff : 0
}

// Formatear precio en COP
function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price)
}

// Formatear fecha en español
function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Obtener fecha mínima (hoy)
function getMinDate(): string {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

function BookingWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Estados
  const [step, setStep] = useState(1)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(
    null,
  )

  // Formulario de reserva
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingCreate>({
    defaultValues: {
      room_id: 0,
      user_id: user?.id || 0,
    },
  })

  const checkInDate = watch("check_in")
  const checkOutDate = watch("check_out")

  // Obtener datos
  const { data: roomTypes, isLoading: isLoadingRoomTypes } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: () => RoomTypesService.readRoomTypes({}),
  })

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => RoomsService.readRooms({}),
  })

  // Verificar disponibilidad cuando se seleccionan fechas y tipo de habitación
  const { data: availableRooms, isLoading: isCheckingAvailability } = useQuery({
    queryKey: ["availability", checkInDate, checkOutDate, selectedRoomTypeId],
    queryFn: () =>
      RoomsService.checkAvailability({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomTypeId: selectedRoomTypeId || undefined,
      }),
    enabled: !!(
      checkInDate &&
      checkOutDate &&
      selectedRoomTypeId &&
      nights > 0
    ),
  })

  const hasAvailability = availableRooms && availableRooms.length > 0

  // Mutación para crear reserva
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingCreate) =>
      BookingsService.createBooking({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(
        "¡Reserva confirmada! Te esperamos en Hotel Capri Doradal.",
      )
      navigate({ to: "/my-bookings" })
    },
    onError: (err: ApiError) => {
      console.error(err)
    },
  })

  const onSubmit: SubmitHandler<BookingCreate> = async (formData) => {
    if (!selectedRoomTypeId || !availableRooms || availableRooms.length === 0) {
      showErrorToast(
        "Lo sentimos, no hay disponibilidad para estas fechas en el tipo de habitación seleccionado.",
      )
      return
    }

    // Usar la primera habitación disponible de la verificación
    const room = availableRooms[0]

    try {
      await createBookingMutation.mutateAsync({
        ...formData,
        room_id: room.id,
        user_id: user?.id || 0,
      })
    } catch (_error) {
      showErrorToast(
        "Lo sentimos, ocurrió un error al crear la reserva. Por favor, intenta de nuevo.",
      )
    }
  }

  // Navegación entre pasos
  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  const selectedType = roomTypes?.find((rt) => rt.id === selectedRoomTypeId)
  const nights = calculateNights(checkInDate, checkOutDate)
  const totalPrice = selectedType ? selectedType.base_price * nights : 0

  // Componente indicador de pasos
  const StepIndicator = ({
    stepNum,
    icon,
    label,
    isActive,
    isCompleted,
  }: {
    stepNum: number
    icon: React.ElementType
    label: string
    isActive: boolean
    isCompleted: boolean
  }) => (
    <Flex direction="column" align="center" gap={2}>
      <Box
        w="50px"
        h="50px"
        borderRadius="full"
        bg={isCompleted ? "green.500" : isActive ? "brand.500" : "gray.200"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.3s"
        boxShadow={isActive ? "0 0 0 4px rgba(26, 75, 66, 0.2)" : "none"}
      >
        <Icon
          as={isCompleted ? FiCheck : icon}
          boxSize={6}
          color={isCompleted || isActive ? "white" : "gray.500"}
        />
      </Box>
      <Text
        fontSize="sm"
        fontWeight={isActive ? "bold" : "medium"}
        color={isActive ? "brand.600" : "gray.500"}
      >
        {label}
      </Text>
    </Flex>
  )

  return (
    <Box bg="gray.50" minH="calc(100vh - 70px)">
      <Container maxW="5xl" py={{ base: 6, md: 12 }}>
        {/* Progress Steps */}
        <Flex justify="center" mb={10}>
          <HStack gap={{ base: 4, md: 12 }}>
            <StepIndicator
              stepNum={1}
              icon={FiHome}
              label="Habitación"
              isActive={step === 1}
              isCompleted={step > 1}
            />
            <Box
              w={{ base: "40px", md: "80px" }}
              h="2px"
              bg={step > 1 ? "green.500" : "gray.300"}
            />
            <StepIndicator
              stepNum={2}
              icon={FiCalendar}
              label="Fechas"
              isActive={step === 2}
              isCompleted={step > 2}
            />
            <Box
              w={{ base: "40px", md: "80px" }}
              h="2px"
              bg={step > 2 ? "green.500" : "gray.300"}
            />
            <StepIndicator
              stepNum={3}
              icon={FiCheckCircle}
              label="Confirmar"
              isActive={step === 3}
              isCompleted={false}
            />
          </HStack>
        </Flex>

        {/* STEP 1: SELECT ROOM TYPE */}
        {step === 1 && (
          <VStack align="stretch" gap={8}>
            <Box textAlign="center">
              <Heading size="xl" color="brand.600" fontFamily="heading" mb={2}>
                Elige tu Habitación
              </Heading>
              <Text color="gray.500" fontSize="lg">
                Selecciona el tipo de habitación ideal para tu estancia
              </Text>
            </Box>

            {isLoadingRoomTypes ? (
              <Flex justify="center" py={20}>
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {roomTypes?.map((rt) => {
                  const isSelected = selectedRoomTypeId === rt.id
                  return (
                    <Box
                      key={rt.id}
                      bg="white"
                      borderRadius="2xl"
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => setSelectedRoomTypeId(rt.id)}
                      border="3px solid"
                      borderColor={isSelected ? "brand.500" : "transparent"}
                      boxShadow={isSelected ? "xl" : "md"}
                      transform={isSelected ? "scale(1.02)" : "scale(1)"}
                      transition="all 0.3s"
                      _hover={{
                        boxShadow: "xl",
                        transform: "translateY(-4px)",
                      }}
                      position="relative"
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <Badge
                          position="absolute"
                          top={4}
                          right={4}
                          colorPalette="green"
                          variant="solid"
                          px={3}
                          py={1}
                          borderRadius="full"
                          zIndex={10}
                        >
                          <Icon as={FiCheck} mr={1} /> Seleccionada
                        </Badge>
                      )}

                      {/* Room Image */}
                      <Box position="relative" h="200px" overflow="hidden">
                        <Image
                          src={RoomImg}
                          alt={rt.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          transition="transform 0.3s"
                          _groupHover={{ transform: "scale(1.05)" }}
                        />
                        <Box
                          position="absolute"
                          bottom={0}
                          left={0}
                          right={0}
                          h="60px"
                          bgGradient="linear(to-t, blackAlpha.600, transparent)"
                        />
                      </Box>

                      {/* Room Info */}
                      <VStack p={5} align="stretch" gap={3}>
                        <Heading size="md" color="gray.800">
                          {rt.name}
                        </Heading>

                        <HStack gap={4} color="gray.500" fontSize="sm">
                          <HStack>
                            <Icon as={FiUsers} />
                            <Text>{rt.capacity} personas</Text>
                          </HStack>
                        </HStack>

                        <Text color="gray.600" fontSize="sm" lineClamp={2}>
                          {rt.description}
                        </Text>

                        {/* Amenities */}
                        {rt.amenities && rt.amenities.length > 0 && (
                          <Flex gap={2} flexWrap="wrap">
                            {rt.amenities.slice(0, 3).map((amenity, idx) => (
                              <Badge
                                key={idx}
                                colorPalette="gray"
                                variant="subtle"
                                fontSize="xs"
                              >
                                {amenity}
                              </Badge>
                            ))}
                          </Flex>
                        )}

                        {/* Price */}
                        <Box
                          pt={3}
                          mt={2}
                          borderTop="1px solid"
                          borderColor="gray.100"
                        >
                          <Text
                            color="brand.600"
                            fontWeight="bold"
                            fontSize="xl"
                          >
                            {formatPrice(rt.base_price)}
                            <Text
                              as="span"
                              fontSize="sm"
                              fontWeight="normal"
                              color="gray.500"
                            >
                              {" "}
                              / noche
                            </Text>
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  )
                })}
              </SimpleGrid>
            )}

            <Flex justify="flex-end" pt={4}>
              <Button
                disabled={!selectedRoomTypeId}
                onClick={nextStep}
                colorPalette="brand"
                size="lg"
                borderRadius="xl"
                px={8}
              >
                Continuar
                <Icon as={FiChevronRight} ml={2} />
              </Button>
            </Flex>
          </VStack>
        )}

        {/* STEP 2: SELECT DATES */}
        {step === 2 && (
          <Box maxW="lg" mx="auto">
            <VStack
              gap={8}
              as="form"
              onSubmit={(e) => {
                e.preventDefault()
                if (nights > 0) nextStep()
              }}
            >
              <Box textAlign="center">
                <Heading
                  size="xl"
                  color="brand.600"
                  fontFamily="heading"
                  mb={2}
                >
                  ¿Cuándo nos visitas?
                </Heading>
                <Text color="gray.500" fontSize="lg">
                  Selecciona las fechas de tu estadía
                </Text>
              </Box>

              {/* Selected Room Summary */}
              <Box
                w="100%"
                bg="white"
                p={5}
                borderRadius="xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <HStack gap={4}>
                  <Image
                    src={RoomImg}
                    alt={selectedType?.name}
                    w="80px"
                    h="60px"
                    borderRadius="lg"
                    objectFit="cover"
                  />
                  <Box flex={1}>
                    <Text fontWeight="bold" color="gray.800">
                      {selectedType?.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatPrice(selectedType?.base_price || 0)} / noche
                    </Text>
                  </Box>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevStep}
                    color="brand.500"
                  >
                    Cambiar
                  </Button>
                </HStack>
              </Box>

              {/* Date Inputs */}
              <Box w="100%" bg="white" p={6} borderRadius="xl" boxShadow="md">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <Field
                    label={
                      <HStack color="gray.600">
                        <Icon as={FiCalendar} />
                        <Text>Fecha de Llegada</Text>
                      </HStack>
                    }
                    invalid={!!errors.check_in}
                    errorText={errors.check_in?.message}
                  >
                    <Box
                      as="input"
                      type="date"
                      {...register("check_in", {
                        required: "Selecciona fecha de llegada",
                      })}
                      min={getMinDate()}
                      w="100%"
                      p={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      fontSize="md"
                      _focus={{
                        borderColor: "brand.500",
                        outline: "none",
                      }}
                    />
                  </Field>

                  <Field
                    label={
                      <HStack color="gray.600">
                        <Icon as={FiCalendar} />
                        <Text>Fecha de Salida</Text>
                      </HStack>
                    }
                    invalid={!!errors.check_out}
                    errorText={errors.check_out?.message}
                  >
                    <Box
                      as="input"
                      type="date"
                      {...register("check_out", {
                        required: "Selecciona fecha de salida",
                      })}
                      min={checkInDate || getMinDate()}
                      w="100%"
                      p={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      fontSize="md"
                      _focus={{
                        borderColor: "brand.500",
                        outline: "none",
                      }}
                    />
                  </Field>
                </Grid>

                {/* Nights calculation */}
                {nights > 0 && (
                  <Box
                    mt={6}
                    p={4}
                    bg="brand.50"
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <HStack justify="center" gap={2}>
                      <Icon as={FiClock} color="brand.600" />
                      <Text color="brand.700" fontWeight="600">
                        {nights} {nights === 1 ? "noche" : "noches"} de estadía
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {formatDate(checkInDate)} → {formatDate(checkOutDate)}
                    </Text>
                  </Box>
                )}

                {/* Availability Indicator */}
                {nights > 0 && (
                  <Box
                    mt={4}
                    p={4}
                    borderRadius="lg"
                    bg={
                      isCheckingAvailability
                        ? "gray.50"
                        : hasAvailability
                          ? "green.50"
                          : "red.50"
                    }
                    border="1px solid"
                    borderColor={
                      isCheckingAvailability
                        ? "gray.200"
                        : hasAvailability
                          ? "green.200"
                          : "red.200"
                    }
                  >
                    {isCheckingAvailability ? (
                      <HStack justify="center" gap={2}>
                        <Spinner size="sm" color="gray.500" />
                        <Text color="gray.600" fontSize="sm">
                          Verificando disponibilidad...
                        </Text>
                      </HStack>
                    ) : hasAvailability ? (
                      <HStack justify="center" gap={2}>
                        <Icon as={FiCheckCircle} color="green.500" />
                        <Text color="green.700" fontWeight="600" fontSize="sm">
                          ¡Hay disponibilidad! {availableRooms?.length}{" "}
                          habitación(es) disponible(s)
                        </Text>
                      </HStack>
                    ) : (
                      <HStack justify="center" gap={2}>
                        <Icon as={FiAlertCircle} color="red.500" />
                        <Text color="red.700" fontWeight="600" fontSize="sm">
                          No hay disponibilidad para estas fechas
                        </Text>
                      </HStack>
                    )}
                  </Box>
                )}
              </Box>

              <HStack w="100%" justify="space-between" pt={4}>
                <Button
                  variant="outline"
                  onClick={prevStep}
                  size="lg"
                  borderRadius="xl"
                  px={6}
                >
                  <Icon as={FiChevronLeft} mr={2} />
                  Atrás
                </Button>
                <Button
                  type="submit"
                  colorPalette="brand"
                  size="lg"
                  borderRadius="xl"
                  px={8}
                  disabled={
                    nights <= 0 || !hasAvailability || isCheckingAvailability
                  }
                >
                  Continuar
                  <Icon as={FiChevronRight} ml={2} />
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 3 && (
          <Box maxW="lg" mx="auto">
            <VStack gap={8}>
              <Box textAlign="center">
                <Heading
                  size="xl"
                  color="brand.600"
                  fontFamily="heading"
                  mb={2}
                >
                  Confirma tu Reserva
                </Heading>
                <Text color="gray.500" fontSize="lg">
                  Revisa los detalles antes de confirmar
                </Text>
              </Box>

              {/* Booking Summary Card */}
              <Box
                w="100%"
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="xl"
              >
                {/* Room Image Header */}
                <Box position="relative" h="180px">
                  <Image
                    src={RoomImg}
                    alt={selectedType?.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-t, blackAlpha.700, transparent)"
                  />
                  <Box position="absolute" bottom={4} left={5} right={5}>
                    <Heading size="lg" color="white">
                      {selectedType?.name}
                    </Heading>
                    <HStack color="whiteAlpha.900" fontSize="sm" mt={1}>
                      <Icon as={FiUsers} />
                      <Text>{selectedType?.capacity} personas</Text>
                    </HStack>
                  </Box>
                </Box>

                {/* Details */}
                <VStack p={6} gap={4} align="stretch">
                  {/* Dates */}
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="600"
                        mb={1}
                      >
                        LLEGADA
                      </Text>
                      <Text fontWeight="bold" color="gray.800">
                        {formatDate(checkInDate)}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="600"
                        mb={1}
                      >
                        SALIDA
                      </Text>
                      <Text fontWeight="bold" color="gray.800">
                        {formatDate(checkOutDate)}
                      </Text>
                    </Box>
                  </Grid>

                  <Box h="1px" bg="gray.100" />

                  {/* Price Breakdown */}
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text color="gray.600">
                        {formatPrice(selectedType?.base_price || 0)} × {nights}{" "}
                        noches
                      </Text>
                      <Text color="gray.800">{formatPrice(totalPrice)}</Text>
                    </HStack>
                  </VStack>

                  <Box h="1px" bg="gray.100" />

                  {/* Total */}
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                      Total a pagar
                    </Text>
                    <Text fontWeight="bold" fontSize="2xl" color="brand.600">
                      {formatPrice(totalPrice)}
                    </Text>
                  </HStack>

                  {/* Guest Info */}
                  <Box bg="gray.50" p={4} borderRadius="lg" mt={2}>
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      fontWeight="600"
                      mb={2}
                    >
                      HUÉSPED PRINCIPAL
                    </Text>
                    <Text fontWeight="600" color="gray.800">
                      {user?.name} {user?.last_name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {user?.email}
                    </Text>
                  </Box>
                </VStack>

                {/* Actions */}
                <Box p={6} pt={0}>
                  <VStack gap={3}>
                    <Button
                      w="100%"
                      size="xl"
                      colorPalette="brand"
                      borderRadius="xl"
                      onClick={handleSubmit(onSubmit)}
                      loading={createBookingMutation.isPending}
                    >
                      <Icon as={FiCheckCircle} mr={2} />
                      Confirmar Reserva
                    </Button>
                    <Button
                      w="100%"
                      variant="ghost"
                      onClick={prevStep}
                      disabled={createBookingMutation.isPending}
                    >
                      <Icon as={FiChevronLeft} mr={2} />
                      Volver a editar
                    </Button>
                  </VStack>
                </Box>
              </Box>

              {/* Info Note */}
              <Box
                bg="blue.50"
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor="blue.100"
              >
                <Text fontSize="sm" color="blue.700">
                  <Text as="span" fontWeight="bold">
                    Nota:
                  </Text>{" "}
                  El pago se realiza directamente en el hotel al momento del
                  check-in. Si necesitas cancelar o modificar tu reserva,
                  contáctanos por WhatsApp.
                </Text>
              </Box>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  )
}
