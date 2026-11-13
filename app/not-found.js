import Image from 'next/image';
import Link from 'next/link';
import Icon from '../components/Icon';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.scene} aria-labelledby="not-found-title">
      <div className={styles.topline}><span>A LITTLE OFF THE MAP</span><span>PENANG, MALAYSIA</span></div>
      <h1 id="not-found-title" className={styles.title}><span className={styles.code}>404</span><span className={styles.words}>NOT FOUND</span></h1>
      <div className={styles.house}>
        <div className={styles.shadow} />
        <Image src="/images/heritage-house-3d.webp" alt="A Penang heritage shophouse with green shutters and a terracotta roof" width={752} height={752} priority sizes="(max-width: 600px) 70vw, 340px" className={styles.houseImage} />
        <span className={styles.address}>NO. 404 &nbsp;·&nbsp; ADDRESS UNKNOWN</span>
      </div>
      <div className={styles.copy}>
        <h2>Right place. Wrong address.</h2>
        <p>This page may have moved, or the link took a wrong turn. Let’s get you back to finding a place to call home.</p>
        <Link href="/" className={styles.home}>Take me home <Icon name="arrowRight" /></Link>
        <Link href="/projects" className={styles.explore}>Or explore Penang projects <Icon name="arrowUpRight" /></Link>
      </div>
      <div className={styles.bottomline}><span>THERE’S STILL A PLACE FOR YOU HERE.</span><span>LET’S FIND IT.</span></div>
    </main>
  );
}
