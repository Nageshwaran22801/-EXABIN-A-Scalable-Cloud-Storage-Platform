import { selectIfExistsResetPassOfToken } from "@/app/postgresql/service";
import { NextResponse } from "next/server";

export async function POST(req){
    const { resetToken } = await req.json();
    const data = await selectIfExistsResetPassOfToken(resetToken);
    if(data == null || data.rowCount == 0){
        return NextResponse.json({
            success: false,
            error: "Invalid token"
        })
    }
    else{
        return NextResponse.json({
            success: true,
            error: null
        })
    }
}