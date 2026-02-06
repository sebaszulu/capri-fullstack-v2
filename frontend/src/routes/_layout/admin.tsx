import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import {
  FiMail,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi"
import { z } from "zod"

import { UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { UserActionsMenu } from "@/components/Common/UserActionsMenu"
import PendingUsers from "@/components/Pending/PendingUsers"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const usersSearchSchema = z.object({
  page: z.number().catch(1),
  q: z.string().optional().catch(""),
})

const PER_PAGE = 10

// Función para obtener usuarios con búsqueda
function getUsersQueryOptions({ page, q }: { page: number; q?: string }) {
  return {
    queryFn: () =>
      UsersService.readUsers({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        q: q || undefined,
      }),
    queryKey: ["users", { page, q: q || "" }],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
  validateSearch: (search) => usersSearchSchema.parse(search),
})

// Obtener iniciales del nombre
function getInitials(name?: string, lastName?: string): string {
  const first = name?.charAt(0)?.toUpperCase() || ""
  const last = lastName?.charAt(0)?.toUpperCase() || ""
  return first + last || "U"
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

function UsersTable() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page, q } = Route.useSearch()

  // Estado local para el input
  const [searchInput, setSearchInput] = useState(q || "")
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sincronizar el input con q de la URL cuando cambia externamente
  useEffect(() => {
    setSearchInput(q || "")
  }, [q])

  // Manejar cambios en el input con debounce manual
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Crear nuevo timer
    debounceTimerRef.current = setTimeout(() => {
      navigate({
        to: "/admin",
        search: { page: 1, q: value || undefined },
      })
    }, 400)
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setSearchInput("")
    navigate({
      to: "/admin",
      search: { page: 1 },
    })
  }

  // Query con el valor de búsqueda de la URL
  const { data, isLoading, isPlaceholderData, isFetching } = useQuery({
    ...getUsersQueryOptions({ page, q }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (newPage: number) => {
    navigate({
      to: "/admin",
      search: { page: newPage, q: q || undefined },
    })
  }

  const users = data?.data ?? []
  const count = data?.count ?? 0

  // Estadísticas (basadas en los resultados actuales)
  const adminsCount = users.filter((u) => u.is_superuser).length
  const activeCount = users.filter((u) => u.is_active).length

  if (isLoading) {
    return <PendingUsers />
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard
          icon={FiUsers}
          label={q ? "Resultados encontrados" : "Total usuarios"}
          value={count}
          color="blue"
        />
        <StatCard
          icon={FiShield}
          label="Administradores"
          value={adminsCount}
          color="purple"
        />
        <StatCard
          icon={FiUserCheck}
          label="Usuarios activos"
          value={activeCount}
          color="green"
        />
      </SimpleGrid>

      {/* Búsqueda */}
      <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
        <HStack>
          <Box position="relative" flex={1} maxW="md">
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              zIndex={1}
            >
              <Icon as={FiSearch} />
            </Box>
            <Input
              placeholder="Buscar en toda la base de datos..."
              value={searchInput}
              onChange={handleSearchChange}
              onInput={(e) =>
                handleSearchChange(e as React.ChangeEvent<HTMLInputElement>)
              }
              pl={10}
              pr={searchInput ? 10 : 4}
              borderRadius="lg"
              bg="gray.50"
              border="none"
              _focus={{ bg: "white", boxShadow: "sm" }}
            />
            {searchInput && (
              <Box
                as="button"
                position="absolute"
                right={3}
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
                onClick={clearSearch}
                cursor="pointer"
                _hover={{ color: "gray.600" }}
                zIndex={1}
              >
                <Icon as={FiX} />
              </Box>
            )}
          </Box>
          {isFetching && !isLoading && (
            <Text fontSize="sm" color="gray.400">
              Buscando...
            </Text>
          )}
        </HStack>
        {q && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            Mostrando resultados para: <strong>"{q}"</strong>
            {" · "}
            <Box
              as="button"
              color="brand.500"
              fontWeight="500"
              onClick={clearSearch}
              _hover={{ textDecoration: "underline" }}
            >
              Limpiar búsqueda
            </Box>
          </Text>
        )}
      </Box>

      {/* Tabla */}
      <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Table.Root size="lg">
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader>Usuario</Table.ColumnHeader>
              <Table.ColumnHeader>Documento</Table.ColumnHeader>
              <Table.ColumnHeader>Contacto</Table.ColumnHeader>
              <Table.ColumnHeader>Rol</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader w="100px">Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users?.map((user) => {
              const isCurrentUser = currentUser?.id === user.id
              const initials = getInitials(user.name, user.last_name)

              return (
                <Table.Row
                  key={user.id}
                  opacity={isPlaceholderData ? 0.5 : 1}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.2s"
                  bg={isCurrentUser ? "brand.50" : "transparent"}
                >
                  <Table.Cell>
                    <HStack gap={3}>
                      <Avatar.Root
                        size="md"
                        bg={user.is_superuser ? "purple.500" : "brand.500"}
                      >
                        <Avatar.Fallback color="white" fontWeight="bold">
                          {initials}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <VStack align="flex-start" gap={0}>
                        <HStack>
                          <Text fontWeight="600" color="gray.800">
                            {user.name} {user.last_name}
                          </Text>
                          {isCurrentUser && (
                            <Badge
                              colorPalette="brand"
                              variant="subtle"
                              fontSize="xs"
                            >
                              Tú
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                          ID: {user.id}
                        </Text>
                      </VStack>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="flex-start" gap={0}>
                      <Text fontSize="xs" color="gray.400">
                        {user.document_type}
                      </Text>
                      <Text fontWeight="500" color="gray.700">
                        {user.document_number}
                      </Text>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack color="gray.600" fontSize="sm">
                      <Icon as={FiMail} />
                      <Text truncate maxW="200px">
                        {user.email}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={user.is_superuser ? "purple" : "blue"}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      <HStack gap={1}>
                        <Icon
                          as={user.is_superuser ? FiShield : FiUsers}
                          boxSize={3}
                        />
                        <Text>{user.is_superuser ? "Admin" : "Huésped"}</Text>
                      </HStack>
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={user.is_active ? "green" : "gray"}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {user.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <UserActionsMenu user={user} disabled={isCurrentUser} />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>

        {users.length === 0 && (
          <Box py={12} textAlign="center">
            <Icon as={FiUsers} boxSize={10} color="gray.300" mb={4} />
            <Text color="gray.500">
              {q ? `No se encontraron usuarios para "${q}"` : "No hay usuarios"}
            </Text>
          </Box>
        )}
      </Box>

      {/* Paginación */}
      {count > PER_PAGE && (
        <Flex justifyContent="flex-end">
          <PaginationRoot
            count={count}
            pageSize={PER_PAGE}
            page={page}
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

function Admin() {
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
                <Icon as={FiUsers} boxSize={6} color="purple.500" />
              </Box>
              <Heading size="xl" color="gray.800" fontFamily="heading">
                Administración
              </Heading>
            </HStack>
            <Text color="gray.500">Gestiona los usuarios del sistema</Text>
          </Box>
          <AddUser />
        </Flex>

        <UsersTable />
      </Container>
    </Box>
  )
}
