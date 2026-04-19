import React from "react";
import { Video } from "lucide-react";

export default function RecordingPlayer({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-8">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
         <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
           <Video size={20} />
         </div>
         <h3 className="font-bold text-gray-800">Session Recording</h3>
      </div>
      <div className="bg-black w-full flex justify-center">
         <video 
           src={url} 
           controls 
           className="w-full max-h-[500px]" 
           controlsList="nodownload" 
         />
      </div>
    </div>
  );
}
