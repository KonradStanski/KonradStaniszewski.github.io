import Image from "next/image";
import styles from "./NextImage.module.css";

/* This only exists because next's image component sucks and does not allow to auto scale it to an arbitrary width */
type props = {
    src: string;
    alt: string;
};

const NextImage = (props: props): JSX.Element => {
    return (
        <div className={styles.wrapper}>
            <Image src={props.src} alt={props.alt} layout="fill" objectFit="contain" />
            <style jsx>{`
                .wrapper {
                    position: relative;
                    min-width: 300px;
                    max-width: 100%;
                    text-align: center;
                    margin: auto;
                }
                .wrapper img {
                    width: 100% !important;
                    height: auto !important;
                    min-width: unset !important;
                    min-height: unset !important;
                    max-width: unset !important;
                    max-height: unset !important;
                }
                .wrapper > div {
                    position: relative !important;
                }
                .wrapper > div > img {
                    position: relative !important;
                }
            `}</style>
        </div>
    );
};

export default NextImage;
