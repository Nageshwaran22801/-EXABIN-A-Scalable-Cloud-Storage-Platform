import { getFilesWithParentId, getFolderDetails, getUserWithToken } from "@/app/postgresql/service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req, {params}){

    const path = params.path;
    const url = new URL(req.url);
    var page = url.searchParams.get('page');

    if(!page){
        page = 1;
    }

    if(path.length == 0){
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

    const bucketId = path[0];

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
        if(!res.rows[0].isFolder){
            return NextResponse.json({
                success: false,
                error: "Invalid path"
            })
        }
    }
    res = await getFilesWithParentId(userId,bucketId,parentId,page);
    if(res == null){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        })
    }

    return NextResponse.json({
        success: true,
        error: null,
        data: res.rows
    })
}