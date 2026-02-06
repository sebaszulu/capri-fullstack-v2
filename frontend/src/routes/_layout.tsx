import { Box, Flex } from "@chakra-ui/react"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import Navbar from "@/components/Common/Navbar"
import Sidebar from "@/components/Common/Sidebar"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <Flex direction="column" h="100vh" bg="bg.canvas">
      <Navbar />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box flex="1" overflowY="auto" bg="bg.canvas">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout
