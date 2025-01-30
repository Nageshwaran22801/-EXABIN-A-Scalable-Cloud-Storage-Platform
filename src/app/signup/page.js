'use client';

import Image from 'next/image';
import styles from './signup.module.css';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import { useRouter } from 'next/navigation';

const montserrat = Montserrat({subsets:["latin"]});

export default function Page(){

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [isLoading,setIsLoading] = useState(false);
    const router = useRouter();

    const signUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if(password != confirmPassword){
            return;
        }
        
        const data = {
            "fullName": name,
            "email": email,
            "password": password
        }

        try{
            const res = await fetch('/api/signup',{
                method: "POST",
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if(result && result["success"]){
                router.push('/verification-link-sent');
            }
            else{
                if(result && result.error){
                    setNotificationMessage(result.error);
                }
                else{
                    setNotificationMessage("Something went wrong!");
                }
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Something went wrong!");
        }

        //sign up
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
                <form onSubmit={(e) => {signUp(e);}}>
                    <h2 className={`${montserrat.className} title-text`}>Sign Up.</h2>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='name'>
                        Full Name 
                        <input className={`theme-input-field`} type='text' id="name" name="name" placeholder='John Black' value={name} onChange={(e) => {setName(e.target.value)}} required/>
                    </label>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='email'>
                        Email Address 
                        <input className={`theme-input-field`} type='email' id="email" name="email" placeholder='abc@example.com' value={email} onChange={(e) => {setEmail(e.target.value.toLowerCase())}} required/>
                    </label>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='password'>
                        Password 
                        <input className={`theme-input-field`} type='password' id="password" minLength={6} name="password" placeholder='*********' value={password} onChange={(e) => {setPassword(e.target.value)}} required/>
                    </label>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='cpassword'>
                        Confirm Password 
                        <input className={`theme-input-field`} type='password' id="cpassword" minLength={6} name="cpassword" placeholder='*********' value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value)}} required/>
                    </label>
                    { (password!="")&&(confirmPassword!="")&&(confirmPassword != password) && <p className={`${styles["passwords-mismatch"]} ${montserrat.className}`}>Passwords doesn't match.</p>}
                    <button type='submit' disabled={isLoading} className={`theme-button ${montserrat.className}`}>{ isLoading && <Loader invert={true}/>} {!isLoading && "Submit"}</button>
                    <Link href={"/login"} className={`${styles["login-link-text"]} ${montserrat.className}`}>Already have an account? Login.</Link>
                </form>
            </div>
            
            { notificationMessage && <Notification message={notificationMessage} onClose={() => {setNotificationMessage(null);}}/> }
        </main>
    );
}