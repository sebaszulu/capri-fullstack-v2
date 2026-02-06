import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  FiAlertTriangle,
  FiCalendar,
  FiLock,
  FiMail,
  FiSun,
  FiUser,
} from "react-icons/fi"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const tabsConfig = [
  {
    value: "my-profile",
    title: "Mi perfil",
    icon: FiUser,
    component: UserInformation,
  },
  {
    value: "password",
    title: "Seguridad",
    icon: FiLock,
    component: ChangePassword,
  },
  {
    value: "appearance",
    title: "Apariencia",
    icon: FiSun,
    component: Appearance,
  },
  {
    value: "danger-zone",
    title: "Cuenta",
    icon: FiAlertTriangle,
    component: DeleteAccount,
  },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
})

// Obtener iniciales del usuario
function getInitials(name?: string, lastName?: string): string {
  const first = name?.charAt(0)?.toUpperCase() || ""
  const last = lastName?.charAt(0)?.toUpperCase() || ""
  return first + last || "U"
}

// Formatear fecha de registro
function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "Miembro"
  const date = new Date(dateStr)
  return `Miembro desde ${date.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}`
}

function UserSettings() {
  const { user: currentUser } = useAuth()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  const initials = getInitials(currentUser.name, currentUser.last_name)

  return (
    <Box bg="gray.50" minH="calc(100vh - 70px)">
      <Container maxW="4xl" py={{ base: 6, md: 10 }}>
        {/* Profile Header */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          mb={6}
          boxShadow="sm"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            gap={6}
          >
            {/* Avatar */}
            <Avatar.Root size="2xl" bg="brand.500" color="white">
              <Avatar.Fallback fontSize="2xl" fontWeight="bold">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>

            {/* User Info */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              gap={2}
              flex={1}
            >
              <Heading size="xl" color="gray.800" fontFamily="heading">
                {currentUser.name} {currentUser.last_name}
              </Heading>

              <HStack
                color="gray.500"
                fontSize="sm"
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                <HStack>
                  <Icon as={FiMail} />
                  <Text>{currentUser.email}</Text>
                </HStack>
                <Text display={{ base: "none", md: "block" }}>•</Text>
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>{formatMemberSince(currentUser.created_at)}</Text>
                </HStack>
              </HStack>

              <HStack mt={2}>
                <Badge
                  colorPalette={currentUser.is_superuser ? "purple" : "blue"}
                  variant="subtle"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {currentUser.is_superuser ? "Administrador" : "Huésped"}
                </Badge>
                {currentUser.is_active && (
                  <Badge
                    colorPalette="green"
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Cuenta activa
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Tabs */}
        <Box bg="white" borderRadius="2xl" overflow="hidden" boxShadow="sm">
          <Tabs.Root defaultValue="my-profile" variant="line">
            <Tabs.List
              bg="gray.50"
              px={4}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              {finalTabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  py={4}
                  px={5}
                  fontWeight="medium"
                  color="gray.500"
                  _selected={{
                    color: "brand.600",
                    borderBottomColor: "brand.500",
                    fontWeight: "bold",
                  }}
                  _hover={{
                    color: "brand.500",
                  }}
                >
                  <HStack gap={2}>
                    <Icon as={tab.icon} boxSize={4} />
                    <Text display={{ base: "none", sm: "block" }}>
                      {tab.title}
                    </Text>
                  </HStack>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {finalTabs.map((tab) => (
              <Tabs.Content
                key={tab.value}
                value={tab.value}
                p={{ base: 4, md: 6 }}
              >
                <tab.component />
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Box>
      </Container>
    </Box>
  )
}
