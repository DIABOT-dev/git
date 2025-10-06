'use client';
type Props={data:unknown; filename?:string};
export default function ExportProfileButton({data, filename='profile.json'}:Props){
  const onClick=()=>{ if(typeof window==='undefined')return;
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };
  return <button onClick={onClick} className="px-3 py-2 rounded-md border">Xuất hồ sơ JSON</button>;
}