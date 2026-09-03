import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
  return (
    <div className='grid grid-cols-2 gap-6 lg:grid-cols-3'>
      <div className='col-span-full grid gap-6 lg:col-span-2'>
        {[1, 2].map(item => (
          <Card key={item}>
            <CardHeader className='flex flex-row items-center gap-3'>
              <Skeleton className='size-8 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-28' />
                <Skeleton className='h-8 w-16' />
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-28 rounded-full' />
                <Skeleton className='h-6 w-24 rounded-full' />
              </div>
              <Skeleton className='h-20 w-full' />
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
          </CardHeader>
          <CardContent className='space-y-3'>
            {[1, 2].map(item => (
              <Skeleton key={item} className='h-20 w-full' />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className='h-fit'>
        <CardHeader>
          <Skeleton className='h-6 w-36' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>

      <Card className='col-span-full'>
        <CardContent className='grid gap-4 p-6 lg:grid-cols-2'>
          <div className='space-y-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-12 w-48' />
            <div className='grid gap-3 sm:grid-cols-2'>
              {[1, 2, 3, 4].map(item => (
                <Skeleton key={item} className='h-16 w-full' />
              ))}
            </div>
          </div>
          <Skeleton className='h-64 w-full' />
        </CardContent>
      </Card>
    </div>
  )
}

export default Loading
