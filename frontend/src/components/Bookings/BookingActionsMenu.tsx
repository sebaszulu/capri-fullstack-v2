import { Button } from "@chakra-ui/react"
import { FiMoreVertical } from "react-icons/fi"
import type { BookingRead } from "../../client"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu"
import CancelBooking from "./CancelBooking"
import EditBooking from "./EditBooking"

interface BookingActionsMenuProps {
  booking: BookingRead
}

const BookingActionsMenu = ({ booking }: BookingActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <FiMoreVertical />
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="edit" asChild>
          <EditBooking booking={booking} />
        </MenuItem>
        <MenuItem value="cancel" asChild color="fg.error">
          <CancelBooking id={booking.id!} />
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export default BookingActionsMenu
