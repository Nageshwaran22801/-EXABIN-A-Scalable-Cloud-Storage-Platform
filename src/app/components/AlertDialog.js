import { Montserrat } from "next/font/google"
import Loader from "./Loader";

const montserrat = Montserrat({subsets:["latin"]});

export default function AlertDialog({message, proceedAnyway, cancel, isLoading}){
    return (
        <div className="alert-dialog">
            <div>
                <p className={montserrat.className}>{message}</p>
                <button disabled={isLoading} onClick={() => {proceedAnyway();}} className="theme-button red-bg">{ isLoading && <Loader invert={true}/>}{!isLoading && "Proceed Anyway"}</button>
                <button onClick={() => {cancel();}} className="theme-button">Cancel</button>
            </div>
        </div>
    )
}