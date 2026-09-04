import ReservationsPage from '@/views/apps/reservations'
import { getReservationsFromWebhook } from '@/lib/reservations'

export const dynamic = 'force-dynamic'

const ReservationsRoute = async () => {
  const reservations = await getReservationsFromWebhook()

  return <ReservationsPage reservations={reservations} />
}

export default ReservationsRoute
