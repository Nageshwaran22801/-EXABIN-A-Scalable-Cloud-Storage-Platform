'use client';

import Image from 'next/image';
import styles from './login.module.css';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../components/Loader';
import Notification from '../components/Notification';

const montserrat = Montserrat({subsets:["latin"]});

export default function Page(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [isLoading,setIsLoading] = useState(false);
    const router = useRouter();

    const login = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try{
            const res = await fetch('/api/login',{
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await res.json();

            if(result && result.success){
                router.push("/dashboard");
            }
            else{
                if(result){
                    setNotificationMessage(result.error);
                }
                else{
                    setNotificationMessage("Oops! Something went wrong! Try Again later.");
                }
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Oops! Something went wrong! Try Again later.");
        }
        setIsLoading(false);
    }

    return (
        <main className={styles["section"]}>

            <div className={"header"}>
                <div className={"logo"}>
                <Image src={"/logo.svg"} height={0} width={0} fill sizes={"100vw"} style={{objectFit: "contain"}} alt={"Exabin Logo"}/>
                </div>
            </div>
            <div className={styles["center-div"]}>
                <form onSubmit={(e)=>{login(e);}}>
                    <h2 className={`${montserrat.className} title-text`}>Login.</h2>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='email'>
                        Email Address 
                        <input className={`theme-input-field`} type='email' id="email" name="email" placeholder='abc@example.com' value={email} onChange={(e) => {setEmail(e.target.value.toLowerCase())}} required/>
                    </label>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='password'>
                        Password 
                        <input className={`theme-input-field`} type='password' id="password" name="password" placeholder='*********' value={password} onChange={(e) => {setPassword(e.target.value)}} required/>
                    </label>
                    <button type='submit' disabled={isLoading} className={`theme-button ${montserrat.className}`}>{ isLoading && <Loader invert={true}/>} {!isLoading && "Login"}</button>
                    <Link href={"/forgot-password"} className={`${styles["forgot-pwd-text"]} ${montserrat.className}`}>Forgot password? Click here.</Link>
                </form>
            </div>
            { notificationMessage && <Notification message={notificationMessage} onClose={() => {setNotificationMessage(null);}}/> }
        </main>
    );
}