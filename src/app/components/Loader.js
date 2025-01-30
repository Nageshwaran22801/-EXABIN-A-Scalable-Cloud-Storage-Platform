export default function Loader({invert = false}){
    return (
        <div className={`loader ${invert?"invert":""}`}></div>
    )
}