import { Box, Flex, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { FaUserAstronaut } from "react-icons/fa"
import { FiLogOut, FiUser } from "react-icons/fi"

import useAuth from "@/hooks/useAuth"
import { Button } from "../ui/button"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu"

const UserMenu = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <Flex>
      <MenuRoot>
        <MenuTrigger asChild p={2}>
          <Button
            data-testid="user-menu"
            bg="whiteAlpha.200"
            color="white"
            _hover={{ bg: "whiteAlpha.300", transform: "none" }}
            maxW="sm"
            truncate
            px={4}
          >
            <Flex
              w="28px"
              h="28px"
              borderRadius="full"
              bg="whiteAlpha.300"
              align="center"
              justify="center"
              mr={2}
            >
              <FaUserAstronaut fontSize="14" />
            </Flex>
            <Text fontWeight="500">{user?.full_name || "Usuario"}</Text>
          </Button>
        </MenuTrigger>

        <MenuContent minW="200px" borderRadius="xl" boxShadow="lg" p={1}>
          <Link to="/settings">
            <MenuItem
              closeOnSelect
              value="user-settings"
              gap={3}
              py={3}
              px={3}
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: "brand.50" }}
            >
              <Flex
                w="32px"
                h="32px"
                borderRadius="lg"
                bg="brand.50"
                align="center"
                justify="center"
              >
                <FiUser
                  fontSize="16px"
                  color="var(--chakra-colors-brand-500)"
                />
              </Flex>
              <Box flex="1">
                <Text fontWeight="500">Mi Perfil</Text>
                <Text fontSize="xs" color="fg.muted">
                  Configuración de cuenta
                </Text>
              </Box>
            </MenuItem>
          </Link>

          <Box h="1px" bg="border.default" my={1} />

          <MenuItem
            value="logout"
            gap={3}
            py={3}
            px={3}
            borderRadius="lg"
            onClick={handleLogout}
            cursor="pointer"
            color="red.500"
            _hover={{ bg: "red.50" }}
          >
            <Flex
              w="32px"
              h="32px"
              borderRadius="lg"
              bg="red.50"
              align="center"
              justify="center"
            >
              <FiLogOut fontSize="16px" />
            </Flex>
            <Text fontWeight="500">Cerrar Sesión</Text>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Flex>
  )
}

export default UserMenu
