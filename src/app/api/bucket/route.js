
import { NextResponse } from "next/server";
import fs from 'fs';
import { cookies } from "next/headers";
import { deleteFromBucketWithId, getUserWithToken, insertIntoBucket, updateBucketName } from "@/app/postgresql/service";

export async function POST(req){
    const {bucketName} = await req.json();
    if(!bucketName || bucketName.trim().length == 0){
        return NextResponse.json({
            success: false,
            error: "Bad Request!"
        })
    }
    const authToken = cookies().get("authToken");
    if(!authToken){
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
    const res2 = await insertIntoBucket(bucketName, userId);
    if(res2 == null || res2.rowCount == 0){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

    const { id } = res2.rows[0];

    try{
        fs.mkdirSync(`${process.env.ABSOLUTE_UPLOADS_PATH}/${id}`,{ recursive: true});
        return NextResponse.json({
            success: true,
            error: null
        })
    }
    catch(err){
        console.log(err);
        await deleteFromBucketWithId(id);
    }
    return NextResponse.json({
        success: false,
        error: "Something went wrong!"
    })
}

export async function DELETE(req){
    const {bucketId} = await req.json();
    if(!bucketId || bucketId.trim().length == 0){
        return NextResponse.json({
            success: false,
            error: "Bad Request!"
        })
    }

    const authToken = cookies().get("authToken");
    if(!authToken){
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

    const res2 = await deleteFromBucketWithId(userId,bucketId);
    if(res2){
        try{
            fs.rmSync(`${process.env.ABSOLUTE_UPLOADS_PATH}/${bucketId}`,{recursive: true, force: true});
        } catch(err){
            console.log(err);
        }
        return NextResponse.json({
            success: true,
            error: null
        });
    } else{
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        });
    }

}

export async function PUT(req){
    const {bucketId, newBucketName} = await req.json();
    if(!bucketId || bucketId.trim().length == 0 && !newBucketName && newBucketName.trim().length==0){
        return NextResponse.json({
            success: false,
            error: "Bad Request!"
        })
    }

    const authToken = cookies().get("authToken");
    if(!authToken){
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

    const res2 = await updateBucketName(newBucketName, userId, bucketId);

    if(res2 == null){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        })
    }
    else{
        return NextResponse.json({
            success: true,
            error: null
        })
    }
    
}