import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  SimpleGrid,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import {
  FiDollarSign,
  FiHome,
  FiLayers,
  FiSearch,
  FiUsers,
} from "react-icons/fi"
import { z } from "zod"

import { RoomTypesService } from "@/client"
import PendingItems from "@/components/Pending/PendingItems"
import AddRoomType from "@/components/RoomTypes/AddRoomType"
import RoomTypeActionsMenu from "@/components/RoomTypes/RoomTypeActionsMenu"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

// Imagen por defecto
import RoomImg from "/assets/images/rooms/IMG_3726-compressed-scaled.jpg"

const roomTypesSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getRoomTypesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      RoomTypesService.readRoomTypes({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["room-types", { page }],
  }
}

export const Route = createFileRoute("/_layout/room-types")({
  component: RoomTypes,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  validateSearch: (search) => roomTypesSearchSchema.parse(search),
})

// Formatear precio
function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price)
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

function RoomTypesTable() {
  const { user } = useAuth()
  const isSuperuser = user?.is_superuser
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getRoomTypesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) => {
    navigate({
      to: "/room-types",
      search: (prev) => ({ ...prev, page }),
    })
  }

  const roomTypes = data ?? []

  const filteredRoomTypes = roomTypes.filter(
    (rt) =>
      rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rt.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const count = roomTypes.length

  // Estadísticas
  const totalCapacity = roomTypes.reduce((acc, rt) => acc + rt.capacity, 0)
  const avgPrice =
    roomTypes.length > 0
      ? roomTypes.reduce((acc, rt) => acc + rt.base_price, 0) / roomTypes.length
      : 0

  if (isLoading) {
    return <PendingItems />
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard
          icon={FiLayers}
          label="Tipos registrados"
          value={roomTypes.length}
          color="blue"
        />
        <StatCard
          icon={FiUsers}
          label="Capacidad total"
          value={`${totalCapacity} personas`}
          color="green"
        />
        <StatCard
          icon={FiDollarSign}
          label="Precio promedio"
          value={formatPrice(avgPrice)}
          color="purple"
        />
      </SimpleGrid>

      {/* Search */}
      <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
        <HStack>
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
              placeholder="Buscar tipos de habitación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pl={10}
              borderRadius="lg"
              bg="gray.50"
              border="none"
              _focus={{ bg: "white", boxShadow: "sm" }}
            />
          </Box>
        </HStack>
      </Box>

      {/* Table */}
      <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Table.Root size="lg">
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader>Tipo de Habitación</Table.ColumnHeader>
              <Table.ColumnHeader>Capacidad</Table.ColumnHeader>
              <Table.ColumnHeader>Precio Base</Table.ColumnHeader>
              <Table.ColumnHeader>Amenidades</Table.ColumnHeader>
              <Table.ColumnHeader w="100px">Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredRoomTypes?.map((roomType) => (
              <Table.Row
                key={roomType.id}
                opacity={isPlaceholderData ? 0.5 : 1}
                _hover={{ bg: "gray.50" }}
                transition="background 0.2s"
              >
                <Table.Cell>
                  <HStack gap={3}>
                    <Image
                      src={RoomImg}
                      alt={roomType.name}
                      w="60px"
                      h="45px"
                      borderRadius="lg"
                      objectFit="cover"
                    />
                    <VStack align="flex-start" gap={0}>
                      <Text fontWeight="600" color="gray.800">
                        {roomType.name}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        lineClamp={1}
                        maxW="200px"
                      >
                        {roomType.description}
                      </Text>
                    </VStack>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <HStack color="gray.600">
                    <Icon as={FiUsers} />
                    <Text>{roomType.capacity} personas</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="bold" color="brand.600">
                    {formatPrice(roomType.base_price)}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    por noche
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap={1} flexWrap="wrap">
                    {roomType.amenities?.slice(0, 2).map((amenity, idx) => (
                      <Badge
                        key={idx}
                        colorPalette="gray"
                        variant="subtle"
                        fontSize="xs"
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {(roomType.amenities?.length || 0) > 2 && (
                      <Badge colorPalette="gray" variant="subtle" fontSize="xs">
                        +{(roomType.amenities?.length || 0) - 2}
                      </Badge>
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  {isSuperuser && <RoomTypeActionsMenu roomType={roomType} />}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {filteredRoomTypes.length === 0 && (
          <Box py={12} textAlign="center">
            <Icon as={FiHome} boxSize={10} color="gray.300" mb={4} />
            <Text color="gray.500">No se encontraron tipos de habitación</Text>
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

function RoomTypes() {
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
              <Box p={2} borderRadius="lg" bg="brand.50">
                <Icon as={FiHome} boxSize={6} color="brand.500" />
              </Box>
              <Heading size="xl" color="gray.800" fontFamily="heading">
                Tipos de Habitación
              </Heading>
            </HStack>
            <Text color="gray.500">
              Gestiona los tipos de habitación, sus capacidades y precios
            </Text>
          </Box>
          {isSuperuser && <AddRoomType />}
        </Flex>

        <RoomTypesTable />
      </Container>
    </Box>
  )
}
