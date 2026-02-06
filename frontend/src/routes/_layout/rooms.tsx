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
  FiCheckCircle,
  FiFilter,
  FiHash,
  FiHome,
  FiSearch,
  FiXCircle,
} from "react-icons/fi"
import { z } from "zod"

import { RoomsService, RoomTypesService } from "@/client"
import PendingItems from "@/components/Pending/PendingItems"
import AddRoom from "@/components/Rooms/AddRoom"
import { RoomActionsMenu } from "@/components/Rooms/RoomActionsMenu"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const availabilityCollection = createListCollection({
  items: [
    { label: "Todas", value: "all" },
    { label: "Disponibles", value: "available" },
    { label: "Ocupadas", value: "occupied" },
  ],
})

const roomsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getRoomsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      RoomsService.readRooms({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["rooms", { page }],
  }
}

export const Route = createFileRoute("/_layout/rooms")({
  component: Rooms,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  validateSearch: (search) => roomsSearchSchema.parse(search),
})

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

function RoomsTable() {
  const { user } = useAuth()
  const isSuperuser = user?.is_superuser
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()
  const [searchQuery, setSearchQuery] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getRoomsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  // Obtener tipos de habitación para mostrar nombres
  const { data: roomTypes } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: () => RoomTypesService.readRoomTypes({}),
  })

  const roomTypesMap = new Map(roomTypes?.map((rt) => [rt.id, rt]) || [])

  const setPage = (page: number) => {
    navigate({
      to: "/rooms",
      search: (prev) => ({ ...prev, page }),
    })
  }

  const rooms = data ?? []

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.room_number.toString().includes(searchQuery)
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && r.is_available) ||
      (availabilityFilter === "occupied" && !r.is_available)
    return matchesSearch && matchesAvailability
  })

  const count = rooms.length
  const availableCount = rooms.filter((r) => r.is_available).length
  const occupiedCount = rooms.filter((r) => !r.is_available).length

  if (isLoading) {
    return <PendingItems />
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard
          icon={FiHome}
          label="Total habitaciones"
          value={rooms.length}
          color="blue"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Disponibles"
          value={availableCount}
          color="green"
        />
        <StatCard
          icon={FiXCircle}
          label="Ocupadas"
          value={occupiedCount}
          color="red"
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
              placeholder="Buscar número de habitación..."
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
              w="180px"
              collection={availabilityCollection}
              value={[availabilityFilter]}
              onValueChange={(e) => setAvailabilityFilter(e.value[0])}
            >
              <Select.Trigger borderRadius="lg">
                <Select.ValueText placeholder="Disponibilidad" />
              </Select.Trigger>
              <Select.Content>
                {availabilityCollection.items.map((item) => (
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
              <Table.ColumnHeader>Habitación</Table.ColumnHeader>
              <Table.ColumnHeader>Tipo</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader w="100px">Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredRooms?.map((room) => {
              const roomType = roomTypesMap.get(room.room_type_id)
              return (
                <Table.Row
                  key={room.id}
                  opacity={isPlaceholderData ? 0.5 : 1}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.2s"
                >
                  <Table.Cell>
                    <HStack gap={3}>
                      <Box
                        w="50px"
                        h="50px"
                        borderRadius="xl"
                        bg={room.is_available ? "green.50" : "red.50"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon
                          as={FiHash}
                          boxSize={5}
                          color={room.is_available ? "green.500" : "red.500"}
                        />
                      </Box>
                      <VStack align="flex-start" gap={0}>
                        <Text fontWeight="bold" fontSize="lg" color="gray.800">
                          Hab. {room.room_number}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          ID: {room.id}
                        </Text>
                      </VStack>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="flex-start" gap={0}>
                      <Text fontWeight="500" color="gray.700">
                        {roomType?.name || `Tipo ${room.room_type_id}`}
                      </Text>
                      {roomType && (
                        <Text fontSize="xs" color="gray.400">
                          {roomType.capacity} personas
                        </Text>
                      )}
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={room.is_available ? "green" : "red"}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      <HStack gap={1}>
                        <Icon
                          as={room.is_available ? FiCheckCircle : FiXCircle}
                          boxSize={3}
                        />
                        <Text>
                          {room.is_available ? "Disponible" : "Ocupada"}
                        </Text>
                      </HStack>
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {isSuperuser && <RoomActionsMenu room={room} />}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>

        {filteredRooms.length === 0 && (
          <Box py={12} textAlign="center">
            <Icon as={FiHome} boxSize={10} color="gray.300" mb={4} />
            <Text color="gray.500">No se encontraron habitaciones</Text>
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

function Rooms() {
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
              <Box p={2} borderRadius="lg" bg="green.50">
                <Icon as={FiHome} boxSize={6} color="green.500" />
              </Box>
              <Heading size="xl" color="gray.800" fontFamily="heading">
                Habitaciones
              </Heading>
            </HStack>
            <Text color="gray.500">
              Gestiona las habitaciones del hotel y su disponibilidad
            </Text>
          </Box>
          {isSuperuser && <AddRoom />}
        </Flex>

        <RoomsTable />
      </Container>
    </Box>
  )
}
