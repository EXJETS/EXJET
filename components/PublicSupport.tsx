import styles from "./PublicSupport.module.css";

export function SupportHeader({label,title,copy}: {label:string;title:string;copy:string}) {
  return <header className={styles.head}><div className={styles.wrap}><p className={styles.eyebrow}>{label}</p><h1>{title}</h1><p>{copy}</p></div></header>;
}
