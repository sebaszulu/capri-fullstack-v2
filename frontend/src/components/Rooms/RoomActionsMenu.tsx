import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import type { RoomRead } from "@/client"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"
import DeleteRoom from "./DeleteRoom"
import EditRoom from "./EditRoom"

interface RoomActionsMenuProps {
  room: RoomRead
}

export const RoomActionsMenu = ({ room }: RoomActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditRoom room={room} />
        <DeleteRoom id={room.id!} />
      </MenuContent>
    </MenuRoot>
  )
}
