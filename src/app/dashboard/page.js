'use client'
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { Montserrat } from "next/font/google";
import { useEffect, useState } from "react";
import AlertDialog from "../components/AlertDialog";
import CenteredLoader from "../components/CenteredLoader";
import Loader from "../components/Loader";
import Notification from "../components/Notification";
import { formatTimestamp } from "../utils";

const montserrat = Montserrat({subsets:["latin"]});

export default function Page(){
    const [showCreateBucket, setShowCreateBucket] = useState(false);
    const [bucketName, setBucketName] = useState("");
    const [bucketList, setBucketList] = useState(null);
    const [visibleMenuPos, setVisibleMenuPos] = useState(null);
    //must be bucket id instead of index
    const [bucketToBeDeleted, setBucketToBeDeleted] = useState(null);
    const [bucketToBeRenamed, setBucketToBeRenamed] = useState(null);
    const [newBucketName, setNewBucketName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOverlayLoading, setIsOverlayLoading] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [userName, setUserName] = useState("");
    const router = useRouter();

    useEffect(
        () => {
            
            const fetchData = async () => {
                setIsLoading(true);
                try{
                    const res = await fetch('/api/buckets');
                    const result = await res.json();
                    if(result && result.success){
                        setUserName(result.data.userName);
                        setBucketList(result.data.buckets);
                    }
                    else{
                        if(result){
                            setNotificationMessage(result.error);
                        }
                        else{
                            setNotificationMessage("Something went wrong! Try again later.")
                        }
                    }
                } catch(err){
                    console.log(err);
                    setNotificationMessage("Something went wrong. Try again later.");
                }
                setIsLoading(false);
            }

            fetchData();
        }, [refresh]
    )

    useEffect(
        () => {
            if(bucketToBeRenamed != null){
                //set newBucketName to existing bucket name
                setNewBucketName(bucketToBeRenamed.bucketName)
            }
            else{
                setNewBucketName("");
            }
        }, [bucketToBeRenamed]
    )

    const createBucket = async (e) => {
        e.preventDefault();
        setIsOverlayLoading(true);

        try{
            const res = await fetch('/api/bucket', {
                method: "POST",
                body: JSON.stringify({
                    "bucketName": bucketName,
                })
            });
            const result = await res.json();
            if(result && result.success){
                setBucketName("");
                setShowCreateBucket(false);
                setRefresh(!refresh);
            } else{
                if(result){
                    setNotificationMessage(result.error);
                } else{
                    setNotificationMessage("Something went wrong. Try again later.");
                }
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Something went wrong. Try again later.");
        }
        setIsOverlayLoading(false);
    }

    const renameBucket = async (e) => {
        e.preventDefault();
        setIsOverlayLoading(true);
        try{
            const res = await fetch('/api/bucket',{
                method: 'PUT',
                body: JSON.stringify({
                    "bucketId": bucketToBeRenamed.bucketId,
                    "newBucketName": newBucketName
                })
            });
            const result = await res.json();
            if(result && result.success){
                setBucketToBeRenamed(null);
                setRefresh(!refresh);
            }
            else{
                if(result){
                    setNotificationMessage(result.error);
                } else{
                    setNotificationMessage("Something went wrong. Try again later.");
                }
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Something went wrong. Try again later.");
        }
        setIsOverlayLoading(false);
    }

    const deleteBucket = async () => {
        setIsOverlayLoading(true);
        try{
            const res = await fetch('/api/bucket', {
                method: "DELETE",
                body: JSON.stringify({
                    bucketId: bucketToBeDeleted
                })
            });

            const result = await res.json();

            if(result && result.success){
                setIsOverlayLoading(false);
                setBucketToBeDeleted(null);
                setRefresh(!refresh);
            }
            else{
                alert(1);
                setIsOverlayLoading(false);
                setNotificationMessage("Something went wrong. Try again later.");
            }
        } catch(err){
            console.log(err);
            setNotificationMessage("Something went wrong. Try again later.");
        }
    }

    const copyURL = async (bucketId) => {
        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_UPLOADS_BASE_URL}/bucket/${bucketId}`);
        setNotificationMessage("URL copied successfully!");
        setVisibleMenuPos(null);
    }

    return (
        <main onClick={() => {setVisibleMenuPos(null);}} className={`${styles["section"]} ${(showCreateBucket||bucketToBeDeleted)?styles["noscroll"]:""}`}>
            <div className="header">
                <h1 className={`${styles["welcome-msg"]} ${montserrat.className}`}>Welcome, {userName}!</h1>
                <div className={styles["row"]}>
                    <button onClick={()=>{setShowCreateBucket(true);}} className={`${montserrat.className} white-theme-button`}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>Create New Bucket</button>
                    <svg onClick={() => {router.push("/settings")}} className={styles["settings-icon"]} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>
                </div>
            </div>
            { bucketList && bucketList.length > 0 && <div className={styles["buckets-container"]}>
                {
                    bucketList && bucketList.map(
                        (v,i) => (
                            <Bucket key={i} 
                                bucketName={v.bucketName} 
                                id = {v.bucketId} 
                                date={v.createdAt} 
                                isOptionsVisible = {visibleMenuPos == v.bucketId} 
                                openOptionsMenu={(e) => {e.stopPropagation();setVisibleMenuPos(v.bucketId);}}
                                showRenameBucket={() => {setBucketToBeRenamed(v);}}
                                deleteConfirmation={ () => {setBucketToBeDeleted(v.bucketId);}}
                                copyURL={() => {copyURL(v.bucketId);}}
                                onClick={() => {router.push(`/dashboard/bucket/${v.bucketId}`)}}
                            />
                        )
                    )
                }
            </div>}
            {(bucketList==null || bucketList.length==0) && <div className={styles["container-div"]}>
                { isLoading && <CenteredLoader/>}
                {
                   !isLoading && bucketList && bucketList.length==0 && <div>
                        <h1 className={montserrat.className}>New here? Create a Bucket first!</h1>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm407.4 75.5c5-11.8-7-22.5-19.3-18.7c-39.7 12.2-84.5 19-131.8 19s-92.1-6.8-131.8-19c-12.3-3.8-24.3 6.9-19.3 18.7c25 59.1 83.2 100.5 151.1 100.5s126.2-41.4 151.1-100.5zM160 120c-3.1 0-5.9 1.8-7.2 4.6l-16.6 34.7-38.1 5c-3.1 .4-5.6 2.5-6.6 5.5s-.1 6.2 2.1 8.3l27.9 26.5-7 37.8c-.6 3 .7 6.1 3.2 7.9s5.8 2 8.5 .6L160 232.5l33.8 18.3c2.7 1.5 6 1.3 8.5-.6s3.7-4.9 3.2-7.9l-7-37.8L226.4 178c2.2-2.1 3.1-5.3 2.1-8.3s-3.5-5.1-6.6-5.5l-38.1-5-16.6-34.7c-1.3-2.8-4.1-4.6-7.2-4.6zm192 0c-3.1 0-5.9 1.8-7.2 4.6l-16.6 34.7-38.1 5c-3.1 .4-5.6 2.5-6.6 5.5s-.1 6.2 2.1 8.3l27.9 26.5-7 37.8c-.6 3 .7 6.1 3.2 7.9s5.8 2 8.5 .6L352 232.5l33.8 18.3c2.7 1.5 6 1.3 8.5-.6s3.7-4.9 3.2-7.9l-7-37.8L418.4 178c2.2-2.1 3.1-5.3 2.1-8.3s-3.5-5.1-6.6-5.5l-38.1-5-16.6-34.7c-1.3-2.8-4.1-4.6-7.2-4.6z"/></svg>
                    </div>
                }
            </div>}
            {showCreateBucket && <CreateBucket bucketName={bucketName} setBucketName={(v) => {setBucketName(v)}} closeCreateBucket={()=> {setShowCreateBucket(false);}} createBucket={(e) => {createBucket(e);}} isOverlayLoading={isOverlayLoading}/>}
            { bucketToBeDeleted && <AlertDialog message={"Are you sure you want to delete this bucket? All your files will be lost permanently!"} proceedAnyway={() => {deleteBucket();}} cancel={()=> {setBucketToBeDeleted(null);}} isLoading={isOverlayLoading}/>}
            { bucketToBeRenamed && <RenameBucket bucketName={newBucketName} setBucketName={(v) => {setNewBucketName(v)}} closeRenameBucket={()=> {setBucketToBeRenamed(null);}} renameBucket={(e) => {renameBucket(e);}} isOverlayLoading={isOverlayLoading}/>}
            { notificationMessage && <Notification message={notificationMessage} onClose={() => {setNotificationMessage(null);}}/> }
            
        </main>
    )
}

const Bucket = ({bucketName, id, date, isOptionsVisible, openOptionsMenu, showRenameBucket, deleteConfirmation, copyURL, onClick}) => {
    return (
        <div className={styles["bucket"]} onClick={() => {onClick();}}>
            <div className={styles["row"]}>
                <div>
                    <h3 className={montserrat.className}>{bucketName}</h3>
                    <p className={montserrat.className}>{id}</p>
                </div>
                <svg onClick={(e) => {openOptionsMenu(e);}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
            </div>
            <p className={montserrat.className}>Created at {formatTimestamp(date)}</p>
            {isOptionsVisible && <div className={styles["options-menu"]}>
                <button onClick={(e) => {e.stopPropagation();copyURL();}}>
                    Copy URL
                </button>
                <button onClick={(e) => {e.stopPropagation();showRenameBucket();}}>
                    Rename
                </button>
                <button onClick={(e) => {e.stopPropagation();deleteConfirmation();}}>
                    Delete
                </button>
            </div>}
        </div>
    )
}

const CreateBucket = ({bucketName, setBucketName, closeCreateBucket, createBucket, isOverlayLoading}) => {
    return (
        <div className={styles["create-bucket"]}>
            <form onSubmit={(e)=>{createBucket(e);}}>
                <svg onClick={() => {closeCreateBucket();}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <h2 className={`${montserrat.className} title-text`}>Create Bucket.</h2>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='bucket-name'>
                        Bucket Name
                        <input className={`theme-input-field`} type='text' id="bucket-name" name="bucket-name" placeholder='My Bucket' maxLength={25} value={bucketName} onChange={(e) => {setBucketName(e.target.value)}} required/>
                    </label>
                    <button type='submit' disabled={isOverlayLoading} className={`theme-button ${montserrat.className}`}>{ isOverlayLoading && <Loader invert={true}/>} {!isOverlayLoading && "Create"}</button>
            </form>
        </div>
    )
}

const RenameBucket = ({bucketName, setBucketName, closeRenameBucket, renameBucket, isOverlayLoading}) => {
    return (
        <div className={styles["create-bucket"]}>
            <form onSubmit={(e)=>{renameBucket(e);}}>
                <svg onClick={() => {closeRenameBucket();}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <h2 className={`${montserrat.className} title-text`}>Rename Bucket.</h2>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='bucket-name'>
                        Bucket Name
                        <input className={`theme-input-field`} type='text' id="bucket-name" name="bucket-name" placeholder='My Bucket' maxLength={25} value={bucketName} onChange={(e) => {setBucketName(e.target.value)}} required/>
                    </label>
                    <button type='submit' disabled={isOverlayLoading} className={`theme-button ${montserrat.className}`}>{ isOverlayLoading && <Loader invert={true}/>} {!isOverlayLoading && "Rename"}</button>
            </form>
        </div>
    )
}