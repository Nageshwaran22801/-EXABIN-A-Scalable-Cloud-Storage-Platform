import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import { deleteFromResetPassOfToken, updateUserCredentials } from "@/app/postgresql/service";

export async function POST(req){
    const {resetToken, newPassword} = await req.json();

    if(!resetToken || !newPassword || resetToken.trim().length == 0 || newPassword.trim().length < 6){
        return NextResponse.json({
            success: false,
            error: "Bad Request"
        })
    }

    const newAuthToken = randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword,10);

    const result = await updateUserCredentials(hashedPassword,newAuthToken,resetToken);
    if(result == null){
        return NextResponse.json({
            success: false,
            error: "Something went wrong!"
        })
    }
    else{
        await deleteFromResetPassOfToken(resetToken);
        return NextResponse.json({
            success: true,
            error: null
        })
    }
}