import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, useLocation } from "@tanstack/react-router"
import {
  FiBookOpen,
  FiCalendar,
  FiGrid,
  FiHome,
  FiLayers,
  FiSettings,
  FiUsers,
} from "react-icons/fi"
import type { IconType } from "react-icons/lib"

import type { UserPublic } from "@/client"

// Items solo para administradores
const adminItems = [
  { icon: FiHome, title: "Dashboard", path: "/dashboard" },
  { icon: FiLayers, title: "Tipos de Habitación", path: "/room-types" },
  { icon: FiGrid, title: "Habitaciones", path: "/rooms" },
  { icon: FiCalendar, title: "Reservas", path: "/bookings" },
  { icon: FiUsers, title: "Administración", path: "/admin" },
  { icon: FiSettings, title: "Configuración", path: "/settings" },
]

// Items para usuarios comunes
const userItems = [
  { icon: FiBookOpen, title: "Reservar", path: "/book" },
  { icon: FiCalendar, title: "Mis Reservas", path: "/my-bookings" },
  { icon: FiSettings, title: "Mi Perfil", path: "/settings" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

interface Item {
  icon: IconType
  title: string
  path: string
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const location = useLocation()

  // Seleccionar items según el rol del usuario
  const finalItems: Item[] = currentUser?.is_superuser ? adminItems : userItems

  const listItems = finalItems.map(({ icon, title, path }, index) => {
    const isActive =
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))

    return (
      <RouterLink key={title} to={path} onClick={onClose}>
        <Flex
          gap={3}
          px={4}
          py={3}
          mx={2}
          borderRadius="lg"
          alignItems="center"
          fontSize="sm"
          fontWeight={isActive ? "600" : "500"}
          color={isActive ? "brand.600" : "fg.muted"}
          bg={isActive ? "brand.50" : "transparent"}
          position="relative"
          transition="all 0.2s ease"
          _hover={{
            bg: isActive ? "brand.50" : "gray.50",
            color: isActive ? "brand.600" : "fg.default",
            transform: "translateX(4px)",
          }}
          opacity={0}
          className="animate-slide-in-left"
          style={{
            animationDelay: `${0.1 + index * 0.05}s`,
            animationFillMode: "forwards",
          }}
        >
          {/* Indicador de activo */}
          {isActive && (
            <Box
              position="absolute"
              left={0}
              top="50%"
              transform="translateY(-50%)"
              w="3px"
              h="60%"
              bg="brand.500"
              borderRadius="full"
            />
          )}
          <Icon
            as={icon}
            boxSize={5}
            color={isActive ? "brand.500" : "inherit"}
          />
          <Text>{title}</Text>
        </Flex>
      </RouterLink>
    )
  })

  return (
    <Box>
      <Text
        fontSize="xs"
        px={6}
        py={3}
        fontWeight="600"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        Menú Principal
      </Text>
      <Box>{listItems}</Box>
    </Box>
  )
}

export default SidebarItems
