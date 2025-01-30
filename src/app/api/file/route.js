import { deleteFromFileWithId, getFolderDetails, getUserWithToken, insertFolderIntoFile, updateFileNameWithId } from "@/app/postgresql/service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from 'fs';

export async function POST(req){
    const data = await req.json();

    if(!data.fileName || data.fileName.length == 0 || !data.pathArray || data.pathArray.length == 0){
        return NextResponse.json({
            success: false,
            error: "Bad request!"
        });
    }
    
    const authToken  = cookies().get("authToken");
    if(!authToken) {
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const res1 = await getUserWithToken(authToken.value);
    if(res1 == null || res1.rowCount == 0){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const {userId} = res1.rows[0];

    const bucketId = data.pathArray[0];

    const {fileName} = data;

    const path = data.pathArray;

    var parentId = null;
    var res = null;

    for(let i=1; i<path.length; ++i){
        res = await getFolderDetails(userId,bucketId,parentId, decodeURIComponent(path[i]));
        if(res == null || res.rows.length == 0){
            return NextResponse.json({
                success: false,
                error: "Invalid path"
            })
        }
        parentId = res.rows[0].id;
    }
    const relativeUrl = decodeURIComponent(`/${path.join('/')}/${fileName}`);
    const result = await insertFolderIntoFile(fileName,parentId,userId,bucketId);
    if(result == null){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        })
    }

    if(result.error){
        return NextResponse.json({
            success: false,
            error: result.error
        })
    }

    try{
        fs.mkdirSync( `${process.env.ABSOLUTE_UPLOADS_PATH}${relativeUrl}`, {recursive: true})
        return NextResponse.json({
            success: true,
            error: null
        })
    } catch(err){
        console.log(err);
        return NextResponse.json({
            success: false,
            error: `Something went wrong!`
        })
    }
    
}

export async function DELETE(req){
    const { fileId, pathArray, fileName } = await req.json();
    if(!fileId || fileId.trim().length == 0 || !pathArray || pathArray.length == 0 || !fileName || fileName.trim().length == 0){
        return NextResponse.json({
            success: false,
            error: "Bad request!"
        })
    }

    const authToken  = cookies().get("authToken");
    if(!authToken) {
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const res1 = await getUserWithToken(authToken.value);
    if(res1 == null || res1.rowCount == 0){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const {userId} = res1.rows[0];

    const relativeUrl = decodeURIComponent(`${pathArray.join('/')}/${fileName}`);

    //delete db entry
    const result = await deleteFromFileWithId(fileId,userId);
    if(result == null){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        })
    }
    try{
        fs.rm(`${process.env.ABSOLUTE_UPLOADS_PATH}/${relativeUrl}`, {recursive: true, force: true});
        return NextResponse.json({
            success: true,
            error: null
        })
    } catch(err){
        console.log(err);
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        })
    }
}

export async function PUT(req){
    const { oldFileName, newFileName, fileId, pathArray, isFolder } = await req.json();
    if( !oldFileName || !newFileName || !fileId || !pathArray || isFolder === undefined){
        return NextResponse.json({
            success:false,
            error: "Bad request!"
        })
    }

    if(oldFileName.trim().length == 0 || newFileName.trim().length == 0 || fileId.trim().length == 0 || pathArray.length == 0){
        return NextResponse.json({
            success:false,
            error: "Bad request!"
        })
    }

    const authToken  = cookies().get("authToken");
    if(!authToken) {
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const res1 = await getUserWithToken(authToken.value);
    if(res1 == null || res1.rowCount == 0){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const {userId} = res1.rows[0];

    const bucketId = pathArray[0];

    var exe = "";
    if(isFolder === false){
        const parts = oldFileName.split(".");
        if(parts.length>1){
            exe = parts[parts.length-1];
        }
    }

    var newFileNameWithExe;
    if(exe.length === 0){
        var newFileNameWithExe = newFileName;
    }
    else{
        var newFileNameWithExe = newFileName +'.' +exe;
    }
      

    const result = await updateFileNameWithId(newFileNameWithExe,fileId,userId,bucketId);
        if(result == null){
            return NextResponse.json({
                success:false,
                error: "Something went wrong!"
            })
        }
        if(result.error){
            return NextResponse.json({
                success:false,
                error: result.error
            })
        }
        try{
            const parentDir = `${process.env.ABSOLUTE_UPLOADS_PATH}/${decodeURIComponent(pathArray.join('/'))}`
            const oldPath = `${parentDir}/${oldFileName}`
            const newPath = `${parentDir}/${newFileNameWithExe}`
            fs.renameSync(oldPath, newPath)
            return NextResponse.json({
                success:true,
                error: null
            })
        }
        catch(err){
            console.log(err);
            return NextResponse.json({
                success:false,
                error: "Something went wrong!"
            })
        }
}