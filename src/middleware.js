import { cookies } from "next/headers";
import { NextResponse } from "next/server"

export default async function middleware(req){

    const path = req.nextUrl.pathname;
    const authToken = cookies().get("authToken")?.value;
    if(!authToken){
        if(path.startsWith('/dashboard')){
            return NextResponse.redirect(new URL('/login', req.url));
        }
        else{
            return NextResponse.next();
        }
    }
    else{
        try{
            const data = await fetch(`${process.env.BASE_URL}/api/checkToken`,{
                method: "POST",
                body: JSON.stringify({
                    "authToken": authToken
                })
            });

            const result = await data.json();
            if(!result || !result.success){
                if(path.startsWith('/dashboard')){
                    const response = NextResponse.redirect(new URL('/login', req.url));
                    response.cookies.delete("authToken");
                    return response;
                }
                else{
                    const response = NextResponse.next();
                    response.cookies.delete("authToken");
                    return response;
                }
            }
            else{
                if(path.startsWith('/login') || path.startsWith('/signup')){
                    return NextResponse.redirect(new URL('/dashboard', req.url));
                }
                else{
                    return NextResponse.next();
                }
            }
        } catch(err){
            console.log(err);
            if(path.startsWith('/dashboard')){
                return NextResponse.redirect(new URL('/login', req.url));
            }
            else{
                return NextResponse.next();
            }
        }
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup']
}