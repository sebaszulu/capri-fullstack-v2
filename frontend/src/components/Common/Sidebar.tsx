import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FaBars } from "react-icons/fa"
import { FiLogOut } from "react-icons/fi"

import type { UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "../ui/drawer"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <DrawerRoot
        placement="start"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DrawerBackdrop />
        <DrawerTrigger asChild>
          <IconButton
            variant="ghost"
            color="inherit"
            display={{ base: "flex", md: "none" }}
            aria-label="Open Menu"
            position="absolute"
            zIndex="100"
            m={4}
            bg="white"
            boxShadow="sm"
            _hover={{ bg: "brand.50" }}
          >
            <FaBars />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent maxW="280px" bg="white">
          <DrawerCloseTrigger />
          <DrawerBody p={0}>
            <Flex flexDir="column" justify="space-between" h="100%">
              <Box pt={6}>
                <SidebarItems onClose={() => setOpen(false)} />
              </Box>
              <VStack
                p={4}
                gap={3}
                borderTop="1px solid"
                borderColor="border.default"
              >
                <Flex
                  as="button"
                  onClick={() => {
                    logout()
                  }}
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  w="100%"
                  borderRadius="lg"
                  color="red.500"
                  transition="all 0.2s"
                  _hover={{ bg: "red.50" }}
                >
                  <FiLogOut />
                  <Text fontWeight="500">Cerrar Sesión</Text>
                </Flex>
                {currentUser?.email && (
                  <Text fontSize="xs" color="fg.muted" truncate maxW="100%">
                    {currentUser.email}
                  </Text>
                )}
              </VStack>
            </Flex>
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      {/* Desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        bg="white"
        top={0}
        minW="260px"
        maxW="260px"
        h="100vh"
        borderRight="1px solid"
        borderColor="border.default"
        boxShadow="sm"
      >
        <Flex flex={1} direction="column" justify="space-between" py={4}>
          <Box>
            <SidebarItems />
          </Box>

          {/* Footer del sidebar */}
          <VStack px={4} gap={2}>
            <Box w="100%" h="1px" bg="border.default" mb={2} />
            {currentUser?.email && (
              <Flex
                w="100%"
                p={3}
                bg="bg.subtle"
                borderRadius="lg"
                align="center"
                gap={3}
              >
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  bg="brand.500"
                  color="white"
                  align="center"
                  justify="center"
                  fontWeight="600"
                  fontSize="sm"
                >
                  {currentUser.full_name?.[0]?.toUpperCase() ||
                    currentUser.email[0].toUpperCase()}
                </Flex>
                <VStack align="flex-start" gap={0} flex={1} overflow="hidden">
                  <Text fontSize="sm" fontWeight="600" truncate maxW="100%">
                    {currentUser.full_name || "Usuario"}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" truncate maxW="100%">
                    {currentUser.email}
                  </Text>
                </VStack>
              </Flex>
            )}
          </VStack>
        </Flex>
      </Box>
    </>
  )
}

export default Sidebar
