import { Flex, Image, Text, useBreakpointValue } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useTheme } from "next-themes"

import type { UserPublic } from "@/client"
import Logo from "/assets/images/capri-logo.png"
import UserMenu from "./UserMenu"

function Navbar() {
  const display = useBreakpointValue({ base: "none", md: "flex" })
  const { resolvedTheme } = useTheme()
  const _logoFilter = resolvedTheme === "light" ? "invert(1)" : "invert(0)"
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  // Redirigir según el rol
  const homeLink = currentUser?.is_superuser ? "/dashboard" : "/my-bookings"

  return (
    <Flex
      display={display}
      justify="space-between"
      position="sticky"
      align="center"
      bg="brand.500"
      w="100%"
      top={0}
      px={6}
      py={3}
      zIndex={100}
      boxShadow="sm"
    >
      <Link to={homeLink}>
        <Flex align="center" gap={3}>
          <Image
            src={Logo}
            alt="Capri Doradal Logo"
            h="36px"
            filter="brightness(0) invert(1)"
          />
          <Text
            color="white"
            fontFamily="heading"
            fontSize="lg"
            fontWeight="600"
            display={{ base: "none", lg: "block" }}
          >
            Capri Doradal
          </Text>
        </Flex>
      </Link>
      <Flex gap={2} alignItems="center">
        <UserMenu />
      </Flex>
    </Flex>
  )
}

export default Navbar
