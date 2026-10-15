// Next Imports
import Link from 'next/link'

// Components Import
import Logo from '@/components/shared/Logo'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import LoginForm from '@/views/pages/auth/login/login-form'

const Login = () => {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <Card className='relative w-full gap-6 py-8 sm:max-w-md'>
        <CardHeader className='gap-6 px-6'>
          <Logo className='gap-3' />
          <div className='text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>Bine ai revenit</h1>
            <p className='text-muted-foreground mt-2 text-sm'>Intră în contul tău PINGPLAY.</p>
          </div>
        </CardHeader>

        <CardContent className='px-6'>
          {/* Login Form */}
          <div className='space-y-4'>
            <LoginForm />

            <p className='text-muted-foreground text-center text-base'>
              Nu ai încă un cont?{' '}
              <Link href='/pages/auth/register' className='text-card-foreground hover:underline'>
                Creează un cont
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
