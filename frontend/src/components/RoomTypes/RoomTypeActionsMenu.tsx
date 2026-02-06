import { Button } from "@chakra-ui/react"
import { FiMoreVertical } from "react-icons/fi"
import type { RoomTypeRead } from "../../client"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu"
import DeleteRoomType from "./DeleteRoomType"
import EditRoomType from "./EditRoomType"

interface RoomTypeActionsMenuProps {
  roomType: RoomTypeRead
}

const RoomTypeActionsMenu = ({ roomType }: RoomTypeActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <FiMoreVertical />
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="edit" asChild>
          <EditRoomType roomType={roomType} />
        </MenuItem>
        <MenuItem value="delete" asChild color="fg.error">
          <DeleteRoomType id={roomType.id!} />
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export default RoomTypeActionsMenu
