import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFolderDetails, getUserWithToken, insertFileIntoFile, selectIfFileExistsForParent } from "@/app/postgresql/service";
import fs from "fs";

export const config = {
    api: {
      bodyParser: false,
    },
  };

export async function POST(req){

    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    const formData = await req.formData();
    const file = formData.get("file");
    const pathArray = formData.get("pathArray");

    if(!file || !pathArray || pathArray.length == 0){
        return NextResponse.json({
            success: false,
            error: "Bad request!"
        })
    }

    const path = JSON.parse(pathArray);

    if(file.size>MAX_FILE_SIZE){
        return NextResponse.json({ 
            success: false,
            error: 'File size should not exceed 100MB' 
        });
    }

    if(file.name.length > 220){
        return NextResponse.json({
            success: false,
            error: "File name should not exceed 220 characters!"
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

    const bucketId = path[0];

    var parentId = null;
    var res2 = null;

    for(let i=1; i<path.length; ++i){
        res2 = await getFolderDetails(userId,bucketId,parentId, decodeURIComponent(path[i]));
        if(res2 == null || res2.rows.length == 0){
            return NextResponse.json({
                success: false,
                error: "Invalid path"
            });
        }
        parentId = res2.rows[0].id;
    }

    var fileName = decodeURIComponent(file.name);
    const res3 = await selectIfFileExistsForParent(parentId,fileName);
    if(res3 == null){
        NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    if(res3.rowCount != 0){
        let arr = fileName.split('.');
        arr[arr.length-2]=arr[arr.length-2] +'_'+Date.now();
        fileName = arr.join('.');
    }

    const relativeUrl = decodeURIComponent(`/${path.join('/')}/${fileName}`);
    const finalUploadPath = `${process.env.ABSOLUTE_UPLOADS_PATH}${relativeUrl}`; 
    
    try{
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(finalUploadPath, buffer);

        const result = await insertFileIntoFile(fileName,parentId,file.size,userId,bucketId);
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

        return NextResponse.json({
            success: true,
            error: null
        })
    }
    catch(err){
        console.log(err);
        NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }
    
}

