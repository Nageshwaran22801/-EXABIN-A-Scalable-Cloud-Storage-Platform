import { deleteFromTempUsersWithVerificationToken, insertIntoUsers, selectFromTempUsersOfToken } from "@/app/postgresql/service";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req){
    const { verificationToken } = await req.json();
    const result = await selectFromTempUsersOfToken(verificationToken);
    if(result == null || !result.rows || result.rows.length == 0){
        return NextResponse.json({
            "success": false,
            "error": "Something went wrong!"
        })
    }
    else{
        const { fullName, email, hashedPassword } = result.rows[0];

        const authToken = randomBytes(32).toString("hex");

        const data = await insertIntoUsers(fullName,email,hashedPassword,authToken);

        if(data){
            await deleteFromTempUsersWithVerificationToken(verificationToken);
        }
        else{
            return NextResponse.json({
                "success": false,
                "error": "Something went wrong! Try again later."
            })
        }

        return NextResponse.json({
            "success": true,
            "error": null
        })
    }
}