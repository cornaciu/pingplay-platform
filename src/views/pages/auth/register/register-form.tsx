'use client'

// React Import
import { useActionState, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { EyeIcon, EyeOffIcon } from 'lucide-react'

// Component Import
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { register } from '@/lib/auth'

const RegisterForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, formAction, isPending] = useActionState(register, null)

  return (
    <form action={formAction}>
      <FieldGroup className='gap-4'>
        {/* Username */}
        <Field className='gap-2'>
          <FieldLabel className='leading-5' htmlFor='username'>
            Username*
          </FieldLabel>
          <Input type='text' id='username' name='name' placeholder='Enter your username' required />
        </Field>
        {/* Email */}
        <Field className='gap-2'>
          <FieldLabel className='leading-5' htmlFor='userEmail'>
            Email address*
          </FieldLabel>
          <Input type='email' id='userEmail' name='email' placeholder='Enter your email address' required />
        </Field>
        {/* Password */}
        <Field className='w-full gap-2'>
          <FieldLabel className='leading-5' htmlFor='password'>
            Password*
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='password'
              name='password'
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder='••••••••••••••••'
              required
            />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsPasswordVisible(prevState => !prevState)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{isPasswordVisible ? 'Hide password' : 'Show password'}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {/* Confirm Password */}
        <Field className='w-full gap-2'>
          <FieldLabel className='leading-5' htmlFor='confirmPassword'>
            Confirm Password*
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='confirmPassword'
              name='confirmPassword'
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              placeholder='••••••••••••••••'
              required
            />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsConfirmPasswordVisible(prevState => !prevState)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{isConfirmPasswordVisible ? 'Hide password' : 'Show password'}</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {/* Privacy policy */}
        <Field orientation='horizontal' className='flex items-center gap-2'>
          <Checkbox
            id='privacyPolicy'
            checked={privacyAccepted}
            onCheckedChange={checked => setPrivacyAccepted(checked === true)}
          />
          <input type='hidden' name='privacyPolicy' value={privacyAccepted ? 'on' : ''} />
          <FieldLabel htmlFor='privacyPolicy'>
            <span className='text-muted-foreground'>I agree to</span> <Link href='#'>privacy policy & terms</Link>
          </FieldLabel>
        </Field>
        {error ? <p className='text-destructive text-sm'>{error}</p> : null}
        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Se creează contul...' : 'Creează contul'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default RegisterForm
