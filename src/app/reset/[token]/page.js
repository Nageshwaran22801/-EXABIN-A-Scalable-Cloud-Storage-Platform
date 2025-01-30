'use client'
import CenteredLoader from '@/app/components/CenteredLoader';
import styles from './reset.module.css';
import { useEffect, useState } from 'react';
import { Montserrat } from 'next/font/google';
import Notification from '@/app/components/Notification';
import Loader from '@/app/components/Loader';
import { useRouter } from 'next/navigation';

const montserrat = Montserrat({subsets:["latin"]});

export default function Page({params}){

    const [state,setState] = useState(State.Loading);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);

    const router = useRouter();

    useEffect(
        () => {
            const checkIfValid = async () => {
                try{
                    const res = await fetch('/api/checkResetToken',{
                        method: 'POST',
                        body: JSON.stringify({
                            "resetToken": params.token
                        })
                    })
    
                    const result = await res.json();
                    if(result && result.success){
                        setState(State.Valid);
                    }
                    else{
                        setState(State.Invalid);
                    }
                } catch(err){
                    console.log(err);
                    setState(State.Invalid);
                    setNotificationMessage("Something went wrong! Try again later.")
                }
            }

            checkIfValid();
        }, []
    )

    const changePassword = async (e) => {
        e.preventDefault();
        if(newPassword != confirmNewPassword){
            return;
        }
        setIsLoading(true);
        try{
            const res = await fetch('/api/reset',{
                method: "POST",
                body: JSON.stringify({
                    "resetToken":params.token,
                    "newPassword": newPassword
                })
            });

            const result = await res.json();
            if(result && result.success){
                setState(State.Changed);
            }
            else{
                if(result){
                    setNotificationMessage(result.error);
                }
                else{
                    setNotificationMessage("Something went wrong! Try again later.");
                }
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Something went wrong! Try again later.");
        }
        setIsLoading(false);
    }

    return <main className={styles["section"]}>
                { state == State.Changed && <div className={styles["container"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={styles["success-svg"]} viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
                    <h2 className={`${montserrat.className}`}>Password changed successfully!</h2>
                    <p className={`${styles['text']} ${montserrat.className}`}>Your password has been changed successfully. Now try logging in with your new password.</p>
                    <span onClick={() => {router.replace('/login');}} className={`${styles['link-text']} ${montserrat.className}`} href={"/"}>Login →</span>
                </div> }
                { state == State.Invalid && <div className={styles["container"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={styles["failure-svg"]} viewBox="0 0 512 512"><path d="M119.4 44.1c23.3-3.9 46.8-1.9 68.6 5.3l49.8 77.5-75.4 75.4c-1.5 1.5-2.4 3.6-2.3 5.8s1 4.2 2.6 5.7l112 104c2.9 2.7 7.4 2.9 10.5 .3s3.8-7 1.7-10.4l-60.4-98.1 90.7-75.6c2.6-2.1 3.5-5.7 2.4-8.8L296.8 61.8c28.5-16.7 62.4-23.2 95.7-17.6C461.5 55.6 512 115.2 512 185.1l0 5.8c0 41.5-17.2 81.2-47.6 109.5L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9L47.6 300.4C17.2 272.1 0 232.4 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141z"/></svg>
                    <h2 className={`${montserrat.className}`}>Link is expired or invalid!</h2>
                    <p className={`${styles['text']} ${montserrat.className}`}>This link is expired or broken. Please try again with different link.</p>
                    <span onClick={() => {router.replace('/');}} className={`${styles['link-text']} ${montserrat.className}`} href={"/"}>Return to site →</span>
                </div> }
                {
                    state == State.Valid && <form className={styles["new-password-form"]} onSubmit={(e) => {changePassword(e);}}>
                        <h1 className={montserrat.className}>Change Password</h1>
                        <input type='password' className='theme-input-field' name='password' value={newPassword} placeholder='New Password' onChange={(e) => {setNewPassword(e.target.value);}} required minLength={6}/>
                        <input type='password' className='theme-input-field' name='cPassword' value={confirmNewPassword} placeholder='Confirm Password' onChange={(e) => {setConfirmPassword(e.target.value);}} required minLength={6}/>
                        { confirmNewPassword.length != 0 && confirmNewPassword!=newPassword && <p className={`${montserrat.className}`}>Passwords mismatch.</p>}
                        <button type='submit' className='theme-button'>{ !isLoading && "Change Password"} {isLoading && <Loader invert={true}/>}</button>
                    </form>
                }
                { state == State.Loading && <CenteredLoader/>}
                { notificationMessage && <Notification message={notificationMessage} onClose={() => {setNotificationMessage(null);}}/> }
            </main>
}

const State = {
    Loading: 1,
    Invalid: 2,
    Valid: 3,
    Changed: 4
}