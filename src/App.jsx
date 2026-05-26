import Tracker from './components/Tracker'
import JobCardView from './pages/JobCardView'

export default function App() {
  const path = window.location.pathname
  const jobMatch = path.match(/^\/job\/([^/]+)/)
  if (jobMatch) {
    return <JobCardView id={jobMatch[1]} />
  }
  return <Tracker />
}
