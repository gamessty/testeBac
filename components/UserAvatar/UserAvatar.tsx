import { auth } from "../../auth"
import AvatarFallback from "../AvatarFallback/AvatarFallback"
 
export default async function UserAvatar() {
  const session = await auth()
 
  if (!session?.user) return null
 
  return (
    <AvatarFallback key={session.user.email} src={session.user.image ?? undefined} name={session.user.email ?? undefined} color='initials'/>
  )
}