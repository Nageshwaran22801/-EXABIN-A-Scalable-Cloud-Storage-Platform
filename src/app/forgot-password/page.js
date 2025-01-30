'use client'
import Image from 'next/image'
import styles from './forgot-password.module.css'
import { Montserrat } from 'next/font/google'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../components/Loader'
import Notification from '../components/Notification'

const montserrat = Montserrat({subsets:["latin"]})

export default function Page(){
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const router = useRouter();

    const sendResetLink = async (e) => {
        e.preventDefault();
        setIsSent(null);
        try{
            const res = await fetch("/api/sendResetLink", {
                method: "POST",
                body: JSON.stringify(
                    {
                        "email": email
                    }
                )
            });
            const result = await res.json();

            if(!result || !result.success){
                if(result.error){
                    setNotificationMessage(result.error);
                } else{
                    setNotificationMessage("Something went wrong! Try again later.");
                }
                setIsSent(false);
            }
            else{
                setIsSent(true);
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Something went wrong! Try again later.");
            setIsSent(false);
        }
    }

    return <main className={styles["section"]}>
        {(isSent === false || isSent === null) && <span className={`${montserrat.className} ${styles["go-back"]}`} onClick={() => {router.back();}}>&lt; <u>Go Back</u></span>}
        { (isSent === false || isSent === null) && <div className={styles["container"]}>
            <Image src={'/forgot.svg'} height={200} width={200} alt="forgot password"/>
            <h2 className={`${montserrat.className}`}>Forgot your password?</h2>
            <p className={`${montserrat.className}`}>Enter your email address and we'll send a link to reset your password.</p>
            <form className={styles["email-form"]} onSubmit={(e) => {sendResetLink(e);}}>
                <input type="email" placeholder='abc@example.com' name='email' value={email} onChange={(e) => {setEmail(e.target.value);}} required/>
                <button className='theme-button' type='submit'>
                    { isSent === false && "Send Reset Link"}{ isSent === null && <Loader invert={true}/>}
                </button>
            </form>
        </div>}
        { isSent === true && <div className={styles["container"]}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0l57.4-43c23.9-59.8 79.7-103.3 146.3-109.8l13.9-10.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176 0 384c0 35.3 28.7 64 64 64l296.2 0C335.1 417.6 320 378.5 320 336c0-5.6 .3-11.1 .8-16.6l-26.4 19.8zM640 336a144 144 0 1 0 -288 0 144 144 0 1 0 288 0zm-76.7-43.3c6.2 6.2 6.2 16.4 0 22.6l-72 72c-6.2 6.2-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L480 353.4l60.7-60.7c6.2-6.2 16.4-6.2 22.6 0z"/></svg>
            <h2 className={`${montserrat.className}`}>Check your inbox.</h2>
            <p className={`${styles['text']} ${montserrat.className}`}>A password reset link has been sent to your email. Please check your inbox and reset your password to sign in to your account.</p>
            <span onClick={() => {router.replace('/');}} className={`${styles['link-text']} ${montserrat.className}`} href={"/"}>Return to site →</span>
        </div>}
        { notificationMessage && <Notification message={notificationMessage} onClose={() => {setNotificationMessage(null);}}/> }
    </main>
}