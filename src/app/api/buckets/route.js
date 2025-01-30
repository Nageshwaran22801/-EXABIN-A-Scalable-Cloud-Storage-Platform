import { getBucketsOfUser, getUserWithToken } from "@/app/postgresql/service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req){
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

    const {userId, userName} = res1.rows[0];
    const res2 = await getBucketsOfUser(userId);

    if(res1 == null || res1.rowCount == 0){
        return NextResponse.json({
            success: true,
            error: null,
            data: {
                "userId": userId,
                "userName": userName,
                "buckets": []
            }
        });
    }

    return NextResponse.json({
        success: true,
        error: null,
        data: {
            "userId": userId,
            "userName": userName,
            "buckets": res2.rows
        }
    });
}