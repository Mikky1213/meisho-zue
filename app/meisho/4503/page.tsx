import BaseMeishoPage, {
  generateMetadata as generateBaseMetadata,
} from '../[id]/page'
import DenzuinHistoricalFormatter from './DenzuinHistoricalFormatter'

const params = Promise.resolve({
  id: '4503',
})

export async function generateMetadata() {
  return generateBaseMetadata({ params })
}

export default function DenzuinPage() {
  return (
    <>
      <BaseMeishoPage
        params={Promise.resolve({ id: '4503' })}
      />
      <DenzuinHistoricalFormatter />
    </>
  )
}
