'use client'

// Rect Import
import { useActionState, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { EyeIcon, EyeOffIcon } from 'lucide-react'

// Components Import
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { login } from '@/lib/auth'

const LoginForm = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [error, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction}>
      <FieldGroup className='gap-4'>
        {/* Email */}
        <Field className='gap-2'>
          <FieldLabel htmlFor='userEmail' className='leading-5'>
            Adresă de email*
          </FieldLabel>
          <Input type='email' id='userEmail' name='email' placeholder='Introdu adresa de email' required />
        </Field>
        {/* Password */}
        <Field className='w-full gap-2'>
          <FieldLabel htmlFor='password' className='leading-5'>
            Parolă*
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='password'
              name='password'
              type={isVisible ? 'text' : 'password'}
              placeholder='••••••••••••••••'
              required
            />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsVisible(prevState => !prevState)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{isVisible ? 'Ascunde parola' : 'Afișează parola'}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {/* Remember Me and Forgot Password */}
        <div className='flex items-center justify-between gap-y-2'>
          <Field orientation='horizontal' className='flex items-center gap-2'>
            <Checkbox id='rememberMe' />
            <FieldLabel htmlFor='rememberMe' className='text-muted-foreground'>
              {' '}
              Ține-mă minte
            </FieldLabel>
          </Field>
          <Link href='/pages/auth/forgot-password' className='text-base text-nowrap hover:underline'>
            Ai uitat parola?
          </Link>
        </div>
        {error ? <p className='text-destructive text-sm'>{error}</p> : null}
        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Se verifică...' : 'Autentificare'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default LoginForm
