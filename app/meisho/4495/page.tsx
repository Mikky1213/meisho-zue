import BaseMeishoPage, {
  generateMetadata as generateBaseMetadata,
} from '../[id]/page'
import styles from './honjoji.module.css'

const params = Promise.resolve({
  id: '4495',
})

export async function generateMetadata() {
  return generateBaseMetadata({ params })
}

export default function HonjojiPage() {
  return (
    <div className={styles.page}>
      <BaseMeishoPage
        params={Promise.resolve({ id: '4495' })}
      />
    </div>
  )
}
