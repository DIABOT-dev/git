type Props={ title:string; subtitle?:string; value?:string; percent?:number; onPress?:()=>void }
export default function ProgressItem({title,subtitle,value,percent=0,onPress}:any){
  return (
    <button onClick={onPress} className="card w-full text-left flex items-center justify-between tap">
      <div><p className="font-semibold">{title}</p>{subtitle && <p className="text-xs text-muted">{subtitle}</p>}</div>
      <div className="text-right">{value && <p className="font-semibold">{value}</p>}
        <div className="mt-2 h-2 w-28 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-primary" style={{width:`${percent}%`}}></div></div></div>
    </button>
  )
}