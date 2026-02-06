import {
  Badge,
  Box,
  Container,
  createListCollection,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiHome,
  FiSearch,
  FiUser,
} from "react-icons/fi"
import { z } from "zod"

import { BookingsService, RoomsService, UsersService } from "@/client"
import AddBooking from "@/components/Bookings/AddBooking"
import BookingActionsMenu from "@/components/Bookings/BookingActionsMenu"
import PendingItems from "@/components/Pending/PendingItems"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const statusCollection = createListCollection({
  items: [
    { label: "Todas", value: "all" },
    { label: "Activas", value: "active" },
    { label: "Inactivas", value: "inactive" },
  ],
})

const bookingsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getBookingsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      BookingsService.readBookings({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["bookings", { page }],
  }
}

export const Route = createFileRoute("/_layout/bookings")({
  component: Bookings,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  validateSearch: (search) => bookingsSearchSchema.parse(search),
})

// Formatear fecha
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// Calcular estado de la reserva
function getBookingStatus(
  checkIn: string,
  checkOut: string,
  isActive: boolean,
) {
  if (!isActive) {
    return { label: "Cancelada", color: "gray", icon: FiClock }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (today < checkInDate) {
    return { label: "Próxima", color: "blue", icon: FiClock }
  }
  if (today >= checkInDate && today <= checkOutDate) {
    return { label: "En curso", color: "green", icon: FiCheckCircle }
  }
  return { label: "Completada", color: "gray", icon: FiCheckCircle }
}

// Componente de tarjeta de estadística
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <Box
      bg="white"
      p={5}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
    >
      <HStack gap={4}>
        <Box p={3} borderRadius="lg" bg={`${color}.50`}>
          <Icon as={icon} boxSize={6} color={`${color}.500`} />
        </Box>
        <VStack align="flex-start" gap={0}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {label}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

function BookingsTable() {
  const { user } = useAuth()
  const isSuperuser = user?.is_superuser
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getBookingsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  // Obtener habitaciones para mostrar nombres
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => RoomsService.readRooms({}),
  })

  // Obtener usuarios para mostrar nombres
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => UsersService.readUsers({}),
  })

  const roomsMap = new Map(rooms?.map((r) => [r.id, r]) || [])
  const usersMap = new Map(users?.data?.map((u) => [u.id, u]) || [])

  const setPage = (page: number) => {
    navigate({
      to: "/bookings",
      search: (prev) => ({ ...prev, page }),
    })
  }

  const bookings = data ?? []

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.user_id.toString().includes(searchQuery) ||
      b.room_id.toString().includes(searchQuery) ||
      b.check_in.includes(searchQuery) ||
      b.check_out.includes(searchQuery)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && b.is_active) ||
      (statusFilter === "inactive" && !b.is_active)
    return matchesSearch && matchesStatus
  })

  const count = bookings.length
  const activeCount = bookings.filter((b) => b.is_active).length
  const todayBookings = bookings.filter((b) => {
    const today = new Date().toISOString().split("T")[0]
    return b.check_in <= today && b.check_out >= today && b.is_active
  }).length

  if (isLoading) {
    return <PendingItems />
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard
          icon={FiCalendar}
          label="Total reservas"
          value={bookings.length}
          color="blue"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Activas"
          value={activeCount}
          color="green"
        />
        <StatCard
          icon={FiClock}
          label="En curso hoy"
          value={todayBookings}
          color="purple"
        />
      </SimpleGrid>

      {/* Filters */}
      <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
        <HStack gap={4} flexWrap="wrap">
          <Box position="relative" flex={1} maxW="md">
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
            >
              <Icon as={FiSearch} />
            </Box>
            <Input
              placeholder="Buscar por ID, habitación o fecha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pl={10}
              borderRadius="lg"
              bg="gray.50"
              border="none"
              _focus={{ bg: "white", boxShadow: "sm" }}
            />
          </Box>
          <HStack>
            <Icon as={FiFilter} color="gray.400" />
            <Select.Root
              w="150px"
              collection={statusCollection}
              value={[statusFilter]}
              onValueChange={(e) => setStatusFilter(e.value[0])}
            >
              <Select.Trigger borderRadius="lg">
                <Select.ValueText placeholder="Estado" />
              </Select.Trigger>
              <Select.Content>
                {statusCollection.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </HStack>
        </HStack>
      </Box>

      {/* Table */}
      <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Table.Root size="lg">
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader>Huésped</Table.ColumnHeader>
              <Table.ColumnHeader>Habitación</Table.ColumnHeader>
              <Table.ColumnHeader>Fechas</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader w="100px">Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredBookings?.map((booking) => {
              const room = roomsMap.get(booking.room_id)
              const guest = usersMap.get(booking.user_id)
              const status = getBookingStatus(
                booking.check_in,
                booking.check_out,
                booking.is_active !== false,
              )

              return (
                <Table.Row
                  key={booking.id}
                  opacity={isPlaceholderData ? 0.5 : 1}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.2s"
                >
                  <Table.Cell>
                    <HStack gap={3}>
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="full"
                        bg="brand.50"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiUser} color="brand.500" />
                      </Box>
                      <VStack align="flex-start" gap={0}>
                        <Text fontWeight="600" color="gray.800">
                          {guest
                            ? `${guest.name} ${guest.last_name}`
                            : `Usuario ${booking.user_id}`}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {guest?.email || `ID: ${booking.user_id}`}
                        </Text>
                      </VStack>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <Icon as={FiHome} color="gray.400" />
                      <Text fontWeight="500" color="gray.700">
                        Hab. {room?.room_number || booking.room_id}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="flex-start" gap={0}>
                      <HStack fontSize="sm">
                        <Text color="gray.500">Entrada:</Text>
                        <Text fontWeight="500">
                          {formatDate(booking.check_in)}
                        </Text>
                      </HStack>
                      <HStack fontSize="sm">
                        <Text color="gray.500">Salida:</Text>
                        <Text fontWeight="500">
                          {formatDate(booking.check_out)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={status.color}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      <HStack gap={1}>
                        <Icon as={status.icon} boxSize={3} />
                        <Text>{status.label}</Text>
                      </HStack>
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {isSuperuser && <BookingActionsMenu booking={booking} />}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>

        {filteredBookings.length === 0 && (
          <Box py={12} textAlign="center">
            <Icon as={FiCalendar} boxSize={10} color="gray.300" mb={4} />
            <Text color="gray.500">No se encontraron reservas</Text>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {count > PER_PAGE && (
        <Flex justifyContent="flex-end">
          <PaginationRoot
            count={count}
            pageSize={PER_PAGE}
            onPageChange={({ page }) => setPage(page)}
          >
            <HStack bg="white" p={2} borderRadius="lg" boxShadow="sm">
              <PaginationPrevTrigger />
              <PaginationItems />
              <PaginationNextTrigger />
            </HStack>
          </PaginationRoot>
        </Flex>
      )}
    </VStack>
  )
}

function Bookings() {
  const { user } = useAuth()
  const isSuperuser = user?.is_superuser

  return (
    <Box bg="gray.50" minH="calc(100vh - 70px)">
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={8}
        >
          <Box>
            <HStack mb={2}>
              <Box p={2} borderRadius="lg" bg="purple.50">
                <Icon as={FiCalendar} boxSize={6} color="purple.500" />
              </Box>
              <Heading size="xl" color="gray.800" fontFamily="heading">
                Reservas
              </Heading>
            </HStack>
            <Text color="gray.500">Gestiona todas las reservas del hotel</Text>
          </Box>
          {isSuperuser && <AddBooking />}
        </Flex>

        <BookingsTable />
      </Container>
    </Box>
  )
}
