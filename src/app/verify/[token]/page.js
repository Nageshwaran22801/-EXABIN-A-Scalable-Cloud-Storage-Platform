'use client'
import { useRouter } from 'next/navigation';
import styles from './verify.module.css';
import { Montserrat } from 'next/font/google';
import { useEffect, useState } from 'react';
import CenteredLoader from '@/app/components/CenteredLoader';

const montserrat = Montserrat({subsets:["latin"]});

export default function Page({params}){

    const [isSuccess, setIsSuccess] = useState(null);
    const [useEffectExecuted, setUseEffectExecuted] = useState(false);
    const router = useRouter();

    useEffect(
        () => {

            const verify = async () => {
                const data = {
                    "verificationToken": params.token
                }

                const res = await fetch("/api/verify",{
                    method: "POST",
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if(result && result.success){
                    setIsSuccess(true);
                }
                else{
                    setIsSuccess(false);
                }
            }
            if(!useEffectExecuted){
                verify();
                setUseEffectExecuted(true);
            }

        }, []
    )

    return <main className={styles["section"]}>
                { isSuccess === true && <div className={styles["container"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={styles["success-svg"]} viewBox="0 0 640 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0l57.4-43c23.9-59.8 79.7-103.3 146.3-109.8l13.9-10.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176 0 384c0 35.3 28.7 64 64 64l296.2 0C335.1 417.6 320 378.5 320 336c0-5.6 .3-11.1 .8-16.6l-26.4 19.8zM640 336a144 144 0 1 0 -288 0 144 144 0 1 0 288 0zm-76.7-43.3c6.2 6.2 6.2 16.4 0 22.6l-72 72c-6.2 6.2-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L480 353.4l60.7-60.7c6.2-6.2 16.4-6.2 22.6 0z"/></svg>
                    <h2 className={`${montserrat.className}`}>Email verified successfully!</h2>
                    <p className={`${styles['text']} ${montserrat.className}`}>Your email has been verified successfully. Now login using your email and password.</p>
                    <span onClick={() => {router.replace('/login');}} className={`${styles['link-text']} ${montserrat.className}`} href={"/"}>Login →</span>
                </div> }
                { isSuccess === false && <div className={styles["container"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={styles["failure-svg"]} viewBox="0 0 512 512"><path d="M119.4 44.1c23.3-3.9 46.8-1.9 68.6 5.3l49.8 77.5-75.4 75.4c-1.5 1.5-2.4 3.6-2.3 5.8s1 4.2 2.6 5.7l112 104c2.9 2.7 7.4 2.9 10.5 .3s3.8-7 1.7-10.4l-60.4-98.1 90.7-75.6c2.6-2.1 3.5-5.7 2.4-8.8L296.8 61.8c28.5-16.7 62.4-23.2 95.7-17.6C461.5 55.6 512 115.2 512 185.1l0 5.8c0 41.5-17.2 81.2-47.6 109.5L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9L47.6 300.4C17.2 272.1 0 232.4 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141z"/></svg>
                    <h2 className={`${montserrat.className}`}>Link is expired or invalid!</h2>
                    <p className={`${styles['text']} ${montserrat.className}`}>This link is expired or broken. Please try again with different link.</p>
                    <span onClick={() => {router.replace('/');}} className={`${styles['link-text']} ${montserrat.className}`} href={"/"}>Return to site →</span>
                </div> }
                { isSuccess === null && <CenteredLoader/>}
            </main>
}