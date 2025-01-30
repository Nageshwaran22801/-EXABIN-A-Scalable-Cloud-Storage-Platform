import { insertIntoResetPass } from "@/app/postgresql/service";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(req){
    const { email } = await req.json();
    if(!email || email.trim().length == 0){
        return NextResponse.json({
            success:false,
            error: "Bad Request"
        })
    }

    const resetToken = randomBytes(32).toString("hex");


    var result;
    
    try{
        result = await insertIntoResetPass(email, resetToken);
    } catch(err){
        if(err.code == "23503"){
            result = {
                error: "User doesn't exist."
            };
        }
        else{
            result = null;
        }
    }
    

    if(!result){
        return NextResponse.json({
            success:false,
            error: "Something went wrong!"
        });
    }
    else if(result.error){
        return NextResponse.json({
            success:false,
            error: "User doesn't exist!"
        });    
    }
    else{
        const url = `${process.env.BASE_URL}/reset/${resetToken}`;
        await sendResetLink(email, url);
        return NextResponse.json({
            success:true,
            error: null
        });
    }
}

async function sendResetLink(email, url){
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS,
        },
      });

    const message = `Forgot your password? Don't worry. We got you covered. Click on the link below to reset your password.\n\n${url}\n\nThe reset link will expire in 24 hours. \n\nIf this is not you, please ignore this email.`;
    const htmlMessage = `Forgot your password? Don't worry. We got you covered. Click on the link below to reset your password.<br><br><a href='${url}'>${url}</a><br><br>The reset link will expire in 24 hours.<br><br>If this is not you, please ignore this email.`;

    const info = await transporter.sendMail({
        from: '"Vishnu Thulasidoss" <business@vishnuthulasidoss.in>',
        to: `${email}`,
        subject: "Reset your password",
        text: message,
        html: htmlMessage,
      });

      console.log(info.messageId);
}