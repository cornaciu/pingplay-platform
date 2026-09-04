// Next Imports
import Link from 'next/link'

const Footer = () => {
  return (
    <footer>
      <div className='text-muted-foreground mx-auto flex size-full max-w-360 items-center justify-center gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
        <p className='text-sm text-balance max-sm:text-center'>
          {`©${new Date().getFullYear()}`}{' '}
          <Link href='https://shadcnstudio.com' target='_blank' className='text-primary hover:underline'>
            shadcn/studio
          </Link>
          , Made for better web design
        </p>
      </div>
    </footer>
  )
}

export default Footer
