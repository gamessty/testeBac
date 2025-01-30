import { Avatar } from "@mantine/core"
import { auth } from "../../auth"
 
export default async function UserAvatar() {
  const session = await auth()
 
  if (!session?.user) return null
 
  return (
    <Avatar key={session.user.email} src={session.user.image ?? undefined} name={session.user.email ?? undefined} color='initials'/>
  )
}