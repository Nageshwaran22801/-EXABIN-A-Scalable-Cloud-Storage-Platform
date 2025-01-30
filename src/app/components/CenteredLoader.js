export default function CenteredLoader({invert = false}){
    return (
        <div className="loader-container">
            <div className={`loader ${invert?"invert":""}`}></div>
        </div>
    )
}