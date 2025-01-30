'use client'

import { usePathname, useRouter } from 'next/navigation';
import styles from './bucket.module.css';
import { Montserrat } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import CenteredLoader from '@/app/components/CenteredLoader';
import Loader from '@/app/components/Loader';
import AlertDialog from '@/app/components/AlertDialog';
import Notification from '@/app/components/Notification';
import { formatSize, formatTimestamp } from '@/app/utils';
import axios from 'axios';

const montserrat = Montserrat({subsets:["latin"]})

var urlPath = ""

export default function Page({params}){

    const [filesList, setFilesList] = useState(null);
    const router = useRouter();
    const path = usePathname();
    const [openMenuPos, setOpenMenuPos] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [createFolderName, setCreateFolderName] = useState("");
    const [isOverlayLoading, setIsOverlayLoading] = useState(false);
    const [showLoadMore, setShowLoadMore] = useState(true);
    const [fileToBeRenamed, setFileToBeRenamed] = useState(null);
    const [newFileName,setNewFileName] = useState("");
    const [fileToBeDeleted, setFileToBeDeleted] = useState(null);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [uploadFilesList, setUploadFilesList] = useState(null);
    const [pageNo, setPageNo] = useState(1);
    //const [uploadFilesProgressList, setUploadFilesProgressList] = useState(null);
    const uploadFilesProgressListRef = useRef(null);
    //const [resultArray, setResultArray] = useState(null);
    const resultArrayRef = useRef(null);
    const [fileUploadComplete, setFileUploadComplete] = useState(false);

    useEffect(
        () => {
            urlPath = params.bucketId.join('/');
        }, []
    )

    useEffect( 
        () => {
            console.log("Upload Files List:", uploadFilesList);
        }, [uploadFilesList]
    )

    useEffect(
        () => {
            
            const getFiles = async () => {
                setIsLoading(true);
                const path = params.bucketId.join('/');

                try{
                    const res = await fetch(`/api/bucket/${path}`);
                    const result = await res.json();
                    if(result && result.success){
                        setFilesList(
                            result.data
                        );
                    }
                    else{
                        setFilesList(
                            []
                        );
                        if(result){
                            setNotificationMessage(result.error);
                        }
                        else{
                            setNotificationMessage("Something went wrong! Try again later");
                        }
                    }
                } catch(err){
                    console.log(err);
                    setNotificationMessage("Something went wrong! Try again later");
                }

                
                setIsLoading(false);

            }

            getFiles();
        }, [refresh]
    )

    useEffect(
        () => {
            if(fileToBeRenamed == null){
                setNewFileName("");
                return;
            }
            if(fileToBeRenamed.isFolder){
                setNewFileName(fileToBeRenamed.fileName);
            }
            else{
                const nameWithoutExtension = fileToBeRenamed.fileName.substring(0, fileToBeRenamed.fileName.lastIndexOf('.'));
                setNewFileName(nameWithoutExtension);
            }
        }, [fileToBeRenamed]
    )

    useEffect(
        () => {

            const getFiles = async () => {
                const path = params.bucketId.join('/');

                try{
                    const res = await fetch(`/api/bucket/${path}?page=${pageNo}`);
                    const result = await res.json();
                    if(result && result.success){
                        if(result.data.length == 0)
                        {
                            setShowLoadMore(false);
                        }
                        else{
                            setFilesList(
                                [...filesList,...result.data]
                            );
                        }
                    }
                    else{
                        if(result){
                            setNotificationMessage(result.error);
                        }
                        else{
                            setNotificationMessage("Something went wrong! Try again later");
                        }
                    }
                } catch(err){
                    console.log(err);
                    setNotificationMessage("Something went wrong! Try again later");
                }

            }

            if(pageNo !== 1){
                getFiles();
            }
        }, [pageNo]
    )

    useEffect(
        () => {
            if(uploadFilesList === null){
                setFileUploadComplete(false);
                //setResultArray(null);
                resultArrayRef.current = null;
                //setUploadFilesProgressList(null);
                uploadFilesProgressListRef.current = null;
            }
        }, [uploadFilesList]
    )

    const openMenu = (e,index) => {
        e.stopPropagation();
        setOpenMenuPos(index);
    }

    const showCreateFolderDialog = () => {
        setShowCreateFolder(true);
    }

    const closeCreateFolderDialog = () => {
        setCreateFolderName("");
        setShowCreateFolder(false);
        setIsOverlayLoading(false);
    }

    const createFolder = async (e) => {
        e.preventDefault();
        try{
            setIsOverlayLoading(true);
            const res = await fetch('/api/file', {
                method: "POST",
                body: JSON.stringify({
                    fileName: createFolderName,
                    pathArray: params.bucketId
                })
            });

            const result = await res.json();
            if(result && result.success){
                closeCreateFolderDialog();
                setRefresh(!refresh);
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
        setIsOverlayLoading(false);
    }

    const renameFolder = async (e) => {
        e.preventDefault();
        setIsOverlayLoading(true);
        try{
            const res = await fetch('/api/file', {
                method: "PUT",
                body: JSON.stringify({
                    newFileName: newFileName,
                    oldFileName: fileToBeRenamed.fileName,
                    fileId: fileToBeRenamed.id,
                    isFolder: fileToBeRenamed.isFolder,
                    pathArray: params.bucketId
                })
            });

            const result = await res.json();

            if(result && result.success){
                setFileToBeRenamed(null);
                setRefresh(!refresh);
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
        setIsOverlayLoading(false);
    }

    const openFolder = (isFolder, folderName) => {
        if(isFolder){
            router.push(`${path}/${folderName}`);
        }
    }

    const deleteFile = async () => {
        setIsOverlayLoading(true);
        try{
            const res = await fetch('/api/file', {
                method: "DELETE",
                body: JSON.stringify({
                    fileId: fileToBeDeleted.id,
                    pathArray: params.bucketId,
                    fileName: fileToBeDeleted.fileName
                })
            });

            const result = await res.json();

            if(result && result.success){
                setFileToBeDeleted(null);
                setRefresh(!refresh);
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
        setIsOverlayLoading(false);
    }

    const setUploadProgress = (index, progress) => {
        if(uploadFilesProgressListRef.current === null) return;
        var temp = [...uploadFilesProgressListRef.current];
        console.log(temp);
        temp[index] = progress;
        uploadFilesProgressListRef.current = temp;
    }

    const setUploadStatus = (index, status) => {
        if(resultArrayRef.current === null) return;
        var temp = [...resultArrayRef.current];
        console.log(temp);
        temp[index] = status;
        resultArrayRef.current = temp;
    }

    const uploadFiles = async () => {
        setIsOverlayLoading(true);
        var initialResultArray = new Array(uploadFilesList.length).fill(null);
        var initialProgressList = new Array(uploadFilesList.length).fill(0);
        resultArrayRef.current = initialResultArray;
        uploadFilesProgressListRef.current = initialProgressList;
        for(var i=0; i< uploadFilesList.length; ++i){
            try{
                const formData = new FormData();
                formData.set('file', uploadFilesList[i]);
                formData.set('pathArray', JSON.stringify(params.bucketId));
                const response = await axios.post('/api/uploadFile', formData, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                      const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                      );
                      setUploadProgress(i, percentCompleted);
                    },
                  });

                  if(response && response.data && response.data.success){
                    setUploadProgress(i, 0);
                    setUploadStatus(i,true);
                  }
                  else{
                    setUploadProgress(i, 0);
                    setUploadStatus(i,false);
                  }
            } catch(err){
                console.log(err);
                setUploadProgress(i, 0);
                setUploadStatus(i,false);
            }
        }
        setIsOverlayLoading(false);
        setFileUploadComplete(true);
    }

    const getDeleteWarningMessage = () => {
        if(fileToBeDeleted.isFolder){
            return "Are you sure you want to delete this folder? All of it's contents will be lost permanently and cannot be recovered!";
        }
        else{
            return "Are you sure you want to delete this file? It will be deleted permanently and cannot be recovered."
        }
    }

    const addFilesToUpload = (files) => {
        if(!files)
            return;
        setUploadFilesList([...uploadFilesList, ...files]);
    }

    const removeFile = (index) => {
        let temp = [...uploadFilesList];
        temp.splice(index,1);
        setUploadFilesList(temp);
    }

    const copyUrl = async (fileName) => {
        const url = `${process.env.NEXT_PUBLIC_UPLOADS_BASE_URL}/${params.bucketId.join('/')}/${fileName}`;
        await navigator.clipboard.writeText(url);
        setNotificationMessage("Copied!");
    }

    const loadMore = () => {

        setPageNo(pageNo + 1);

    }

    return (
        <main className={styles["section"]} onClick={(e) => {openMenu(e,null)}}>
            { !isLoading && <div className={styles["header-row"]}>
                <div>
                    <span className={montserrat.className} onClick={() => {router.back();}}>← Go Back</span>
                    <h3 className={montserrat.className}>Bucket/Folder Name</h3>
                </div>
                <div>
                    <button className='trans-button' onClick={()=> {showCreateFolderDialog();}}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                        New Folder
                    </button>
                    <label className={`trans-button ${montserrat.className}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"/></svg>
                        Upload Files
                        <input type='file' multiple={true} hidden onChange={(e) => {setUploadFilesList([...e.target.files])}}/>
                    </label>
                </div>
            </div>}
            { !isLoading && filesList && filesList.length >0 && <div className={styles["files-container"]}>
                <table>
                    <thead>
                        <tr className={`${styles["files-row"]} ${montserrat.className}`}>
                            <th>

                            </th>
                            <th>
                                Name
                            </th>
                            <th>
                                Size
                            </th>
                            <th>
                                Created Date
                            </th>
                            <th>

                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        filesList.map(
                            (v,i) => <FilesRow data={v} key={i} showMenu={i==openMenuPos} onMenuOpen={(e)=>{openMenu(e,i);}} openFolder={() => {openFolder(v.isFolder, v.fileName);}} renameFile={() => {setFileToBeRenamed(v);}} deleteFile={() => setFileToBeDeleted(v)} copyUrl={() => copyUrl(v.fileName)}/>
                        )
                    }
                    </tbody>
                </table>
                { showLoadMore && <LoadMoreButton loadMore={() => {loadMore();}}/>}
            </div>}
            { !isLoading && filesList && filesList.length == 0 && <div className={styles["empty-state-container"]}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"/></svg>
                <h2 className={montserrat.className}>You don't have any files here.</h2>
            </div>}
            { isLoading && <CenteredLoader/>}
            { showCreateFolder && <CreateFolder createFolderName={createFolderName} setFolderName={(v) => {setCreateFolderName(v);}} isOverlayLoading={isOverlayLoading} closeCreateFolderDialog={() => {closeCreateFolderDialog();}} createFolder={(e) => {createFolder(e);}}/>}
            { fileToBeDeleted && <AlertDialog message={getDeleteWarningMessage()} proceedAnyway={() => {deleteFile();}} cancel={()=> {setFileToBeDeleted(null);}} isLoading={isOverlayLoading}/>}
            
            {fileToBeRenamed && <RenameFile newFileName={newFileName} setNewFileName={(v) => {setNewFileName(v);}} isOverlayLoading={isOverlayLoading} closeRenameDialog={() => {setFileToBeRenamed(null);}} renameFolder={(e) => renameFolder(e)}/>}
            { notificationMessage && <Notification message={notificationMessage} onClose={() => {setNotificationMessage(null);}}/> }
            { uploadFilesList && <UploadFilesComponent files={uploadFilesList} addFilesToUpload={(files) => {addFilesToUpload(files);}} removeFile={(index) => removeFile(index)} closeUploadFiles={() => {setUploadFilesList(null); setRefresh(!refresh);}} uploadFiles={() => uploadFiles()} isOverlayLoading={isOverlayLoading} resultArray={resultArrayRef.current} setMsg={(msg) => setNotificationMessage(msg)} progressList={uploadFilesProgressListRef.current} fileUploadComplete={fileUploadComplete}/>}
        </main>
    )
}

const FilesRow = ({data, showMenu, onMenuOpen, openFolder, renameFile, deleteFile, copyUrl}) => {
    return (
        <tr className={`${styles["files-row"]} ${montserrat.className}`}>
            <td>
                <div className={styles["icon"]}>
                    <Image src={getFileIconFromExe(data)} alt='icon' height={0} width={0} sizes='100vw' fill style={{objectFit:"contain"}}/>
                    { getFileIconFromExe(data) == '/file.png' && <span className={styles["extn"]}>{getExe(data)}</span>}
                </div>
            </td>
            <td className={`${styles["file-name"]} ${montserrat.className}`} onClick={() => {openFolder()}}>
                {data.fileName}
            </td>
            <td>
               { data.isFolder == false && formatSize(data.fileSize) }
            </td>
            <td>
                { formatTimestamp(data.createdAt)}
            </td>
            <td className={styles["menu-btn"]} onClick={(e)=>{onMenuOpen(e);}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
                {showMenu &&<div className={styles["options-menu"]}>
                        { !data.isFolder && <button className={`${montserrat.className}`} onClick={() => {copyUrl();}}>
                            Copy URL
                        </button>}
                        { !data.isFolder && <a className={`${montserrat.className}`} href={getFileUrl(data.fileName)} download>
                            Download
                        </a>}
                        <button className={`${montserrat.className}`} onClick={() => {renameFile();}}>
                            Rename
                        </button>
                        <button className={`${montserrat.className}`} onClick={() => {deleteFile();}}>
                            Delete
                        </button>
                </div>}
            </td>
        </tr>
    )
}

const getFileIconFromExe = (data) => {
    const parts = data.fileName.split(".");
    if(parts.length<2){
        if(data.isFolder){
            return '/folder.png';
        }
        return '/file.png';
    }
    const exe = parts[parts.length-1].toUpperCase();
    switch(exe){
        case 'JPG':
        case 'JPEG':
        case 'PNG':
        case 'SVG':
        case 'BMP':
        case 'GIF': return getFileUrl(data.fileName);
        case 'PDF': return '/pdf.png';
        case 'ZIP':
        case 'RAR': return '/zip.png';
        case 'MP3': 
        case 'WAV': return '/audio.png';
        case 'MP4':
        case 'MKV': return '/video.png';
        default: return '/file.png';
    }
}

const getFileUrl = (fileName) => {
    return `${process.env.NEXT_PUBLIC_UPLOADS_BASE_URL}/${urlPath}/${fileName}`;
}

const getExe = (data) => {
    const parts = data.fileName.split(".");
    if(parts.length<2){
        return null;
    }
    const exe = parts[parts.length-1].toUpperCase();
    return exe;
}

const CreateFolder = ({createFolderName, setFolderName, isOverlayLoading, closeCreateFolderDialog,createFolder}) => {
    return (
        <div className={styles["create-folder"]}>
            <form onSubmit={(e)=>{createFolder(e);}}>
                <svg onClick={() => {closeCreateFolderDialog();}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <h2 className={`${montserrat.className} title-text`}>Create Folder.</h2>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='folder-name'>
                        Folder Name
                        <input className={`theme-input-field`} type='text' id="folder-name" name="folder-name" placeholder='My Folder' maxLength={25} value={createFolderName} onChange={(e) => {setFolderName(e.target.value)}} required/>
                    </label>
                    <button type='submit' disabled={isOverlayLoading} className={`theme-button ${montserrat.className}`}>{ isOverlayLoading && <Loader invert={true}/>} {!isOverlayLoading && "Create"}</button>
            </form>
        </div>
    )
}

const RenameFile = ({newFileName, setNewFileName, isOverlayLoading, closeRenameDialog, renameFolder}) => {
    return (
        <div className={styles["create-folder"]}>
            <form onSubmit={(e)=>{renameFolder(e);}}>
                <svg onClick={() => {closeRenameDialog();}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <h2 className={`${montserrat.className} title-text`}>Rename Folder.</h2>
                    <label className={`${montserrat.className} sub-title-text`} htmlFor='file-name'>
                        File Name
                        <input className={`theme-input-field`} type='text' id="file-name" name="file-name" placeholder='My File' maxLength={25} value={newFileName} onChange={(e) => {setNewFileName(e.target.value)}} required/>
                    </label>
                    <button type='submit' disabled={isOverlayLoading} className={`theme-button ${montserrat.className}`}>{ isOverlayLoading && <Loader invert={true}/>} {!isOverlayLoading && "Rename"}</button>
            </form>
        </div>
    )
}

const LoadMoreButton = ({loadMore}) => {
    return <button className={`${montserrat.className} ${styles["load-more-btn"]}`} onClick={() => {loadMore();}}>
        Load More
    </button>
}

const UploadFilesComponent = ({files, addFilesToUpload, removeFile, closeUploadFiles, uploadFiles, isOverlayLoading, resultArray, setMsg, progressList, fileUploadComplete}) => {
    return <div className={styles["upload-files-container"]}>
        <div>
            <label className={`${styles['add-files-container']} ${montserrat.className}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"/></svg>
                Browse files to upload
                <input type="file" multiple={true} hidden onChange={(e) => addFilesToUpload(e.target.files)}/>
            </label>
            { !isOverlayLoading && <svg className={styles["close-icon"]} onClick={() => closeUploadFiles() } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>}
            { files && files.length ==0 && <p className={`${styles['add-files-text']} ${montserrat.className}`}>Add files to upload</p>}
            {
                <div className={`${styles["upload-files-list-container"]}`}>
                    {
                        files && files.map(
                            (v,i) => <UploadFileRow key={i} data={v} removeFile={() => removeFile(i)} resultArray={resultArray} index={i} setMsg={(msg) => setMsg(msg)} progressList={progressList} fileUploadComplete={fileUploadComplete}/>
                        )
                    }
                </div>
            }
            {
               !fileUploadComplete && files && files.length > 0 && <button disabled={isOverlayLoading} onClick={()=> uploadFiles()} className={`theme-button ${montserrat.className} ${styles["upload-btn"]}`}>{ isOverlayLoading && <Loader invert={true}/> } { !isOverlayLoading && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"/></svg>} { !isOverlayLoading && "Upload Files" }</button>
            }
        </div>
    </div>
}

const UploadFileRow = ({data, removeFile, resultArray, index, setMsg, progressList, fileUploadComplete}) => {
    return <div className={`${styles["upload-file-row"]} ${montserrat.className}`}>
        <span>{data.name} <span> - {formatSize(data.size)}</span> {resultArray !== null && resultArray[index] === true && <svg onClick={() => setMsg("File uploaded successfully!")} className={styles["success-icon"]} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>} {resultArray !== null && resultArray[index] === false && <svg onClick={() => setMsg("Upload failed! Max size 100 MB")} className={styles["failed-icon"]} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>}</span>
        { (progressList?progressList[index]:0) != 0 && <progress id="file" value={progressList?progressList[index]:0} max="100"/>}
        { !fileUploadComplete && (progressList?progressList[index]:0) == 0 && <svg onClick={() => removeFile() } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>}
    </div>
}