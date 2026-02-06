import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  FiCalendar,
  FiCheckCircle,
  FiGrid,
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi"

import { BookingsService, RoomsService, RoomTypesService, UsersService, type UserPublic } from "@/client"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
  beforeLoad: async () => {
    // Verificar si el usuario es superuser
    if (isLoggedIn()) {
      try {
        const user = await UsersService.readUserMe()
        if (!user?.is_superuser) {
          throw redirect({ to: "/my-bookings" })
        }
      } catch (error) {
        throw error
      }
    }
  },
})

// Componente de tarjeta de estadística
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  colorScheme: string
  delay?: string
}

function StatCard({ title, value, subtitle, icon, colorScheme, delay = "0s" }: StatCardProps) {
  const colors: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
    green: { bg: "brand.50", iconBg: "brand.500", iconColor: "white" },
    blue: { bg: "blue.50", iconBg: "blue.500", iconColor: "white" },
    orange: { bg: "orange.50", iconBg: "orange.500", iconColor: "white" },
    purple: { bg: "purple.50", iconBg: "purple.500", iconColor: "white" },
  }

  const colorConfig = colors[colorScheme] || colors.green

  return (
    <Card.Root
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="border.default"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
        borderColor: "brand.200",
      }}
      opacity={0}
      className="animate-fade-in-up"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <Card.Body p={6}>
        <Flex justify="space-between" align="flex-start">
          <VStack align="flex-start" gap={1}>
            <Text fontSize="sm" color="fg.muted" fontWeight="500">
              {title}
            </Text>
            <Text
              fontSize="3xl"
              fontWeight="700"
              fontFamily="heading"
              color="fg.default"
            >
              {value}
            </Text>
            {subtitle && (
              <Text fontSize="xs" color="fg.muted">
                {subtitle}
              </Text>
            )}
          </VStack>
          <Flex
            w="48px"
            h="48px"
            borderRadius="xl"
            bg={colorConfig.iconBg}
            align="center"
            justify="center"
          >
            <Icon as={icon} boxSize={5} color={colorConfig.iconColor} />
          </Flex>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}

// Componente de reserva próxima
interface UpcomingBookingProps {
  checkIn: string
  roomId: number
  isActive: boolean
}

function UpcomingBooking({ checkIn, roomId, isActive }: UpcomingBookingProps) {
  const checkInDate = new Date(checkIn)
  const today = new Date()
  const isToday = checkInDate.toDateString() === today.toDateString()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = checkInDate.toDateString() === tomorrow.toDateString()

  const dateLabel = isToday
    ? "Hoy"
    : isTomorrow
      ? "Mañana"
      : checkInDate.toLocaleDateString("es-CO", { day: "numeric", month: "short" })

  return (
    <Flex
      p={4}
      bg="bg.subtle"
      borderRadius="lg"
      justify="space-between"
      align="center"
      transition="all 0.2s"
      _hover={{ bg: "brand.50" }}
    >
      <Flex align="center" gap={3}>
        <Flex
          w="40px"
          h="40px"
          borderRadius="lg"
          bg={isToday ? "brand.500" : "gray.200"}
          color={isToday ? "white" : "gray.600"}
          align="center"
          justify="center"
          fontWeight="bold"
          fontSize="sm"
        >
          {checkInDate.getDate()}
        </Flex>
        <VStack align="flex-start" gap={0}>
          <Text fontWeight="600" fontSize="sm">
            Habitación #{roomId}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Check-in: {dateLabel}
          </Text>
        </VStack>
      </Flex>
      <Badge colorPalette={isActive ? "green" : "gray"} size="sm">
        {isActive ? "Confirmada" : "Pendiente"}
      </Badge>
    </Flex>
  )
}

// Componente de acceso rápido
interface QuickAccessProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
}

function QuickAccess({ title, description, icon, href, color }: QuickAccessProps) {
  return (
    <Link to={href}>
      <Flex
        p={4}
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="border.default"
        align="center"
        gap={4}
        transition="all 0.2s"
        cursor="pointer"
        _hover={{
          borderColor: "brand.300",
          transform: "translateX(4px)",
          boxShadow: "sm",
        }}
      >
        <Flex
          w="44px"
          h="44px"
          borderRadius="lg"
          bg={`${color}.50`}
          align="center"
          justify="center"
        >
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
        </Flex>
        <VStack align="flex-start" gap={0} flex={1}>
          <Text fontWeight="600" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {description}
          </Text>
        </VStack>
        <Icon as={FiArrowRight} color="fg.muted" />
      </Flex>
    </Link>
  )
}

function Dashboard() {
  const { user: currentUser } = useAuth()

  // Queries para obtener datos
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms-dashboard"],
    queryFn: () => RoomsService.readRooms({ limit: 100 }),
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings-dashboard"],
    queryFn: () => BookingsService.readBookings({ limit: 100 }),
  })

  const { data: roomTypes = [] } = useQuery({
    queryKey: ["room-types-dashboard"],
    queryFn: () => RoomTypesService.readRoomTypes({ limit: 100 }),
  })

  // Calcular estadísticas
  const totalRooms = rooms.length
  const availableRooms = rooms.filter((r) => r.is_available).length
  const occupiedRooms = totalRooms - availableRooms
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const activeBookings = bookings.filter((b) => b.is_active).length

  // Próximas reservas (check-in en los próximos 7 días)
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcomingBookings = bookings
    .filter((b) => {
      const checkIn = new Date(b.check_in)
      return checkIn >= today && checkIn <= nextWeek
    })
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
    .slice(0, 5)

  // Saludo según la hora
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"

  return (
    <Container maxW="full" py={6}>
      {/* Header */}
      <Box mb={8} className="animate-fade-in-up">
        <Text fontSize="sm" color="fg.muted" mb={1}>
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Heading
          size="2xl"
          fontFamily="heading"
          fontWeight="600"
          color="fg.default"
        >
          {greeting}, {currentUser?.full_name?.split(" ")[0] || "Usuario"} 👋
        </Heading>
        <Text color="fg.muted" mt={2}>
          Aquí tienes el resumen de actividad de Hotel Capri Doradal
        </Text>
      </Box>

      {/* Tarjetas de estadísticas */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          title="Total Habitaciones"
          value={totalRooms}
          subtitle={`${roomTypes.length} tipos disponibles`}
          icon={FiGrid}
          colorScheme="green"
          delay="0.1s"
        />
        <StatCard
          title="Disponibles"
          value={availableRooms}
          subtitle="Listas para reservar"
          icon={FiCheckCircle}
          colorScheme="blue"
          delay="0.2s"
        />
        <StatCard
          title="Reservas Activas"
          value={activeBookings}
          subtitle="En este momento"
          icon={FiCalendar}
          colorScheme="orange"
          delay="0.3s"
        />
        <StatCard
          title="Ocupación"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedRooms} de ${totalRooms} habitaciones`}
          icon={FiTrendingUp}
          colorScheme="purple"
          delay="0.4s"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Próximos Check-ins */}
        <Card.Root
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="border.default"
          opacity={0}
          className="animate-fade-in-up"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <Card.Header pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md" fontFamily="heading">
                Próximos Check-ins
              </Heading>
              <Link to="/bookings">
                <Text fontSize="sm" color="brand.500" fontWeight="500" _hover={{ textDecoration: "underline" }}>
                  Ver todas
                </Text>
              </Link>
            </Flex>
          </Card.Header>
          <Card.Body pt={2}>
            {upcomingBookings.length > 0 ? (
              <VStack gap={3}>
                {upcomingBookings.map((booking) => (
                  <UpcomingBooking
                    key={booking.id}
                    checkIn={booking.check_in}
                    roomId={booking.room_id}
                    isActive={booking.is_active}
                  />
                ))}
              </VStack>
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={8}
                color="fg.muted"
              >
                <Icon as={FiCalendar} boxSize={10} mb={3} opacity={0.5} />
                <Text>No hay check-ins próximos</Text>
                <Text fontSize="sm">Los próximos 7 días están libres</Text>
              </Flex>
            )}
          </Card.Body>
        </Card.Root>

        {/* Accesos Rápidos */}
        <Card.Root
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="border.default"
          opacity={0}
          className="animate-fade-in-up"
          style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
        >
          <Card.Header pb={2}>
            <Heading size="md" fontFamily="heading">
              Accesos Rápidos
            </Heading>
          </Card.Header>
          <Card.Body pt={2}>
            <VStack gap={3}>
              <QuickAccess
                title="Nueva Reserva"
                description="Crear una nueva reservación"
                icon={FiCalendar}
                href="/bookings"
                color="brand"
              />
              <QuickAccess
                title="Gestionar Habitaciones"
                description="Ver y editar habitaciones"
                icon={FiHome}
                href="/rooms"
                color="blue"
              />
              <QuickAccess
                title="Tipos de Habitación"
                description="Configurar categorías"
                icon={FiGrid}
                href="/room-types"
                color="orange"
              />
              {currentUser?.is_superuser && (
                <QuickAccess
                  title="Administración"
                  description="Gestionar usuarios del sistema"
                  icon={FiUsers}
                  href="/admin"
                  color="purple"
                />
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Resumen de disponibilidad */}
      <Card.Root
        mt={6}
        bg="white"
        borderRadius="xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="border.default"
        opacity={0}
        className="animate-fade-in-up"
        style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
      >
        <Card.Header>
          <Heading size="md" fontFamily="heading">
            Estado de Habitaciones por Tipo
          </Heading>
        </Card.Header>
        <Card.Body>
          {roomTypes.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
              {roomTypes.map((type) => {
                const typeRooms = rooms.filter((r) => r.room_type_id === type.id)
                const typeAvailable = typeRooms.filter((r) => r.is_available).length
                const typeTotal = typeRooms.length

                return (
                  <Flex
                    key={type.id}
                    p={4}
                    bg="bg.subtle"
                    borderRadius="lg"
                    direction="column"
                    gap={2}
                  >
                    <Text fontWeight="600" fontSize="sm" truncate>
                      {type.name}
                    </Text>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="fg.muted">
                        {typeAvailable} de {typeTotal} disponibles
                      </Text>
                      <Badge
                        colorPalette={typeAvailable > 0 ? "green" : "red"}
                        size="sm"
                      >
                        {typeAvailable > 0 ? "Disponible" : "Lleno"}
                      </Badge>
                    </Flex>
                    {/* Barra de progreso */}
                    <Box
                      w="100%"
                      h="4px"
                      bg="gray.200"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={`${typeTotal > 0 ? (typeAvailable / typeTotal) * 100 : 0}%`}
                        bg={typeAvailable > 0 ? "brand.500" : "red.500"}
                        borderRadius="full"
                        transition="width 0.3s ease"
                      />
                    </Box>
                  </Flex>
                )
              })}
            </SimpleGrid>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={8}
              color="fg.muted"
            >
              <Icon as={FiGrid} boxSize={10} mb={3} opacity={0.5} />
              <Text>No hay tipos de habitación configurados</Text>
              <Link to="/room-types">
                <Text fontSize="sm" color="brand.500" mt={2} _hover={{ textDecoration: "underline" }}>
                  Crear tipo de habitación
                </Text>
              </Link>
            </Flex>
          )}
        </Card.Body>
      </Card.Root>
    </Container>
  )
}
