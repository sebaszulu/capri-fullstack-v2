import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPlus,
  FiUsers,
} from "react-icons/fi"

import { BookingsService, RoomsService, RoomTypesService } from "@/client"
import { Button } from "@/components/ui/button"
import { isLoggedIn } from "@/hooks/useAuth"

// Imagen por defecto de habitación
import RoomDefaultImg from "/assets/images/rooms/IMG_3726-compressed-scaled.jpg"

export const Route = createFileRoute("/_layout/my-bookings")({
  component: MyBookings,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
})

// Función para determinar el estado de la reserva
function getBookingStatus(checkIn: string, checkOut: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (today < checkInDate) {
    const daysUntil = Math.ceil(
      (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )
    return {
      status: "upcoming",
      label: daysUntil === 1 ? "Mañana" : `En ${daysUntil} días`,
      color: "blue",
      icon: FiClock,
    }
  }
  if (today >= checkInDate && today <= checkOutDate) {
    return {
      status: "active",
      label: "En curso",
      color: "green",
      icon: FiCheckCircle,
    }
  }
  return {
    status: "completed",
    label: "Completada",
    color: "gray",
    icon: FiCheckCircle,
  }
}

// Formatear fecha en español
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// Calcular noches
function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function MyBookings() {
  // Obtener reservas del usuario
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["myBookings"],
    queryFn: () => BookingsService.readBookings({}),
  })

  // Obtener habitaciones
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => RoomsService.readRooms({}),
  })

  // Obtener tipos de habitación
  const { data: roomTypes } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: () => RoomTypesService.readRoomTypes({}),
  })

  // Crear mapas para búsqueda rápida
  const roomsMap = new Map(rooms?.map((r) => [r.id, r]) || [])
  const roomTypesMap = new Map(roomTypes?.map((rt) => [rt.id, rt]) || [])

  // Obtener info de habitación
  const getRoomInfo = (roomId: number) => {
    const room = roomsMap.get(roomId)
    if (!room)
      return { name: `Habitación ${roomId}`, capacity: 2, roomNumber: roomId }

    const roomType = roomTypesMap.get(room.room_type_id)
    return {
      name: roomType?.name || `Habitación ${room.room_number}`,
      capacity: roomType?.capacity || 2,
      roomNumber: room.room_number,
      amenities: roomType?.amenities || [],
    }
  }

  // Ordenar reservas: próximas primero, luego activas, luego completadas
  const sortedBookings = [...(bookings || [])].sort((a, b) => {
    const statusA = getBookingStatus(a.check_in, a.check_out).status
    const statusB = getBookingStatus(b.check_in, b.check_out).status

    const order = { active: 0, upcoming: 1, completed: 2 }
    if (
      order[statusA as keyof typeof order] !==
      order[statusB as keyof typeof order]
    ) {
      return (
        order[statusA as keyof typeof order] -
        order[statusB as keyof typeof order]
      )
    }

    // Si mismo estado, ordenar por fecha de check-in
    return new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
  })

  return (
    <Container maxW="6xl" py={{ base: 6, md: 10 }}>
      <VStack gap={8} align="stretch">
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box>
            <Heading
              size={{ base: "xl", md: "2xl" }}
              color="brand.600"
              fontFamily="heading"
            >
              Mis Reservas
            </Heading>
            <Text color="gray.500" mt={1}>
              Gestiona tus estadías en Hotel Capri Doradal
            </Text>
          </Box>

          <Link to="/book">
            <Button colorPalette="brand" size="lg" borderRadius="xl">
              <Icon as={FiPlus} mr={2} />
              Nueva Reserva
            </Button>
          </Link>
        </Flex>

        {/* Content */}
        {loadingBookings ? (
          <Flex justify="center" py={20}>
            <VStack gap={4}>
              <Spinner size="xl" color="brand.500" />
              <Text color="gray.500">Cargando tus reservas...</Text>
            </VStack>
          </Flex>
        ) : sortedBookings.length === 0 ? (
          /* Empty State */
          <Box
            py={16}
            px={8}
            borderRadius="3xl"
            bg="linear-gradient(135deg, #f6f8fb 0%, #e9f0f7 100%)"
            textAlign="center"
          >
            <Box
              w="100px"
              h="100px"
              mx="auto"
              mb={6}
              borderRadius="full"
              bg="brand.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCalendar} boxSize={10} color="brand.400" />
            </Box>
            <Heading size="lg" color="gray.700" mb={3}>
              No tienes reservas aún
            </Heading>
            <Text color="gray.500" maxW="md" mx="auto" mb={8}>
              ¡Descubre la experiencia Capri Doradal! Reserva tu habitación y
              disfruta de la naturaleza, confort y la mejor ubicación del
              Magdalena Medio.
            </Text>
            <Link to="/book">
              <Button colorPalette="brand" size="xl" borderRadius="xl" px={10}>
                <Icon as={FiPlus} mr={2} />
                Hacer mi primera reserva
              </Button>
            </Link>
          </Box>
        ) : (
          /* Booking Cards */
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {sortedBookings.map((booking) => {
              const status = getBookingStatus(
                booking.check_in,
                booking.check_out,
              )
              const roomInfo = getRoomInfo(booking.room_id)
              const nights = calculateNights(
                booking.check_in,
                booking.check_out,
              )

              return (
                <Box
                  key={booking.id}
                  bg="white"
                  borderRadius="2xl"
                  overflow="hidden"
                  boxShadow="md"
                  border="1px solid"
                  borderColor={
                    status.status === "active" ? "green.200" : "gray.100"
                  }
                  transition="all 0.3s"
                  _hover={{
                    boxShadow: "xl",
                    transform: "translateY(-4px)",
                    borderColor: "brand.200",
                  }}
                >
                  <Flex direction={{ base: "column", sm: "row" }}>
                    {/* Room Image */}
                    <Box
                      w={{ base: "100%", sm: "180px" }}
                      h={{ base: "160px", sm: "auto" }}
                      minH={{ sm: "200px" }}
                      position="relative"
                      flexShrink={0}
                    >
                      <Image
                        src={RoomDefaultImg}
                        alt={roomInfo.name}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                      {/* Status Badge on Image */}
                      <Badge
                        position="absolute"
                        top={3}
                        left={3}
                        colorPalette={status.color}
                        variant="solid"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        <Icon as={status.icon} mr={1} />
                        {status.label}
                      </Badge>
                    </Box>

                    {/* Booking Info */}
                    <VStack
                      flex={1}
                      p={5}
                      align="flex-start"
                      justify="space-between"
                      gap={3}
                    >
                      {/* Room Name & Number */}
                      <Box w="100%">
                        <HStack justify="space-between" align="flex-start">
                          <Heading size="md" color="gray.800" lineClamp={1}>
                            {roomInfo.name}
                          </Heading>
                          <Badge
                            colorPalette="gray"
                            variant="subtle"
                            fontSize="xs"
                          >
                            #{roomInfo.roomNumber}
                          </Badge>
                        </HStack>

                        {/* Capacity */}
                        <HStack mt={1} color="gray.500" fontSize="sm">
                          <Icon as={FiUsers} />
                          <Text>{roomInfo.capacity} personas</Text>
                        </HStack>
                      </Box>

                      {/* Dates */}
                      <Box w="100%" bg="gray.50" p={3} borderRadius="xl">
                        <HStack justify="space-between" align="center">
                          <VStack align="flex-start" gap={0}>
                            <Text
                              fontSize="xs"
                              color="gray.400"
                              fontWeight="600"
                            >
                              ENTRADA
                            </Text>
                            <Text fontWeight="600" color="gray.700">
                              {formatDate(booking.check_in)}
                            </Text>
                          </VStack>

                          <Box px={3} py={1} bg="brand.50" borderRadius="full">
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="brand.600"
                            >
                              {nights} {nights === 1 ? "noche" : "noches"}
                            </Text>
                          </Box>

                          <VStack align="flex-end" gap={0}>
                            <Text
                              fontSize="xs"
                              color="gray.400"
                              fontWeight="600"
                            >
                              SALIDA
                            </Text>
                            <Text fontWeight="600" color="gray.700">
                              {formatDate(booking.check_out)}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>

                      {/* Booking ID */}
                      <HStack
                        w="100%"
                        justify="space-between"
                        pt={2}
                        borderTop="1px solid"
                        borderColor="gray.100"
                      >
                        <HStack color="gray.400" fontSize="xs">
                          <Icon as={FiMapPin} />
                          <Text>Doradal, Antioquia</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.400" fontFamily="mono">
                          ID: {booking.id.toString().slice(0, 8)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Flex>
                </Box>
              )
            })}
          </SimpleGrid>
        )}

        {/* Info Banner */}
        {sortedBookings.length > 0 && (
          <Box
            bg="brand.50"
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="brand.100"
          >
            <HStack gap={3}>
              <Icon as={FiAlertCircle} color="brand.500" boxSize={5} />
              <Text color="brand.700" fontSize="sm">
                <Text as="span" fontWeight="bold">
                  ¿Necesitas modificar tu reserva?
                </Text>{" "}
                Contáctanos por WhatsApp o llama al hotel para cualquier cambio.
              </Text>
            </HStack>
          </Box>
        )}
      </VStack>
    </Container>
  )
}
