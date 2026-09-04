// Component Imports
import { Separator } from '@/components/ui/separator'

// Component Imports
import EmailPass from '@/views/pages/user-settings/general/email-password'
import PersonalInfo from '@/views/pages/user-settings/general/personal-info'

const UserGeneral = () => {
  return (
    <section className='py-3'>
      <PersonalInfo />
      <Separator className='my-10' />
      <EmailPass />
    </section>
  )
}

export default UserGeneral
