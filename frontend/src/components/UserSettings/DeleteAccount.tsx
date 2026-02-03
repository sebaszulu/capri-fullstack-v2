import { Container, Heading, Text } from "@chakra-ui/react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <Container maxW="full">
      <Heading size="sm" py={4}>
        Eliminar Cuenta
      </Heading>
      <Text>
        Elimina permanentemente tus datos y todo lo asociado con tu cuenta.
      </Text>
      <DeleteConfirmation />
    </Container>
  )
}
export default DeleteAccount
