import TableAvailabilityPanel from '@/views/dashboards/rezervari/table-availability-panel'
import ThermostatPanel from '@/views/dashboards/rezervari/thermostat-panel'

const ControlPage = () => (
  <div className='space-y-5'>
    <div>
      <p className='text-primary mb-2 hidden text-xs font-semibold tracking-[0.18em] uppercase md:block'>
        PINGPLAY · Administrare
      </p>
      <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Control</h1>
      <p className='text-muted-foreground mt-1 text-sm'>Mese, termostat, lumină, climă și ușă.</p>
    </div>
    <div className='grid items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
      <TableAvailabilityPanel />
      <ThermostatPanel />
    </div>
  </div>
)

export default ControlPage
