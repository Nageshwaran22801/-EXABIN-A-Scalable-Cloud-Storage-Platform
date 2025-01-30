import { getLoginUser } from "@/app/postgresql/service";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";

export async function POST(req){
    const { email, password } = await req.json();

    if( !email || !password || email.trim().length == 0 || password.trim().length == 0){
        return NextResponse.json({
            success: false,
            error: "Bad request"
        });
    }

    const result = await getLoginUser(email);

    if(result == null || result.rowCount == 0){
        return NextResponse.json({
            success: false,
            error: "Email doesn't exist."
        })
    }
    else{
        const {hashedPassword, authToken} = result.rows[0];
        if(await bcrypt.compare(password,hashedPassword)){
            cookies().set("authToken",authToken);
            return NextResponse.json({
                success: true,
                error: null
            })
        }
        else{
            return NextResponse.json({
                success: false,
                error: "Invalid password!"
            })
        }
    }
}