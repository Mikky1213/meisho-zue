import BaseMeishoPage, {
  generateMetadata as generateBaseMetadata,
} from '../[id]/page'
import styles from './homyoji.module.css'

const params = Promise.resolve({
  id: '7292',
})

export async function generateMetadata() {
  return generateBaseMetadata({ params })
}

export default function HomyojiPage() {
  return (
    <div className={styles.page}>
      <BaseMeishoPage
        params={Promise.resolve({ id: '7292' })}
      />
    </div>
  )
}
