import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import { insertIntoTempUsers, selectIfExistsUserOfEmail } from "@/app/postgresql/service";
import { randomBytes } from "crypto";
import nodemailer from 'nodemailer';

export async function POST(req){

    const { fullName, email, password } = await req.json();

    if( fullName == undefined || fullName == null || fullName.trim().length == 0){
        return NextResponse.json({
            "success": false,
            "error": "Bad Request"
        })
    }

    if( email == undefined || email == null || email.trim().length == 0 || !email.includes('@')){
        return NextResponse.json({
            "success": false,
            "error": "Bad Request"
        })
    }

    if( password == undefined || password == null || password.trim().length < 6 ){
        return NextResponse.json({
            "success": false,
            "error": "Bad Request"
        })
    }

    const result = await selectIfExistsUserOfEmail(email);
    if(result && result.rowCount > 0 ){
        return NextResponse.json({
            "success": false,
            "error": "User with this email already exists. Try login."
        })
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const verificationToken = randomBytes(32).toString("hex");

    const data = await insertIntoTempUsers(fullName,email,hashedPassword, verificationToken);

    if(data){
        if(data.error){
            return NextResponse.json({
                "success":false,
                "error": data.error
            })
        }
        else{
            const url = `${process.env.BASE_URL}/verify/${verificationToken}`;
            try{
                await sendVerificationEmail(fullName, email, url);
            }
            catch(err){
                console.log(err);
                return NextResponse.json({
                    "success":false,
                    "error": "Oops! Something went wrong! Try again later."
                })
            }
            return NextResponse.json({
                "success":true,
                "error": null
            })
        }
    }
    else{
        return NextResponse.json({
            "success":false,
            "error": "Something went wrong!"
        })
    }
}

async function sendVerificationEmail(name,email, url){
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS,
        },
      });

    const message = `Hey ${name}!\n\nThanks for registering an account with Exabin. Before we get started, we need to verify your email. Please click on the link below and verify your email.\n\n${url}\n\nIf this is not you, please ignore this email.`;
    const htmlMessage = `<b>Hey ${name}!</b><br><br>Thanks for registering an account with Exabin. Before we get started, we need to verify your email. Please click on the link below and verify your email.<br><br><a href='${url}'>${url}</a><br><br>If this is not you, please ignore this email.`;

    const info = await transporter.sendMail({
        from: '"Vishnu Thulasidoss" <business@vishnuthulasidoss.in>',
        to: `${email}`,
        subject: "Verify your email",
        text: message,
        html: htmlMessage,
      });

      console.log(info.messageId);

}