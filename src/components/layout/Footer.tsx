import Link from 'next/link'

const Footer = () => (
  <footer className='border-border/60 mt-auto border-t'>
    <div className='text-muted-foreground mx-auto flex max-w-360 flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs sm:px-6 lg:px-8'>
      <p>© {new Date().getFullYear()} PINGPLAY</p>
      <Link
        href='https://pingplay.ro'
        target='_blank'
        rel='noopener noreferrer'
        className='hover:text-primary transition-colors'
      >
        pingplay.ro ↗
      </Link>
    </div>
  </footer>
)

export default Footer
