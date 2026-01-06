import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {
  const { data: session, isPending } = authClient.useSession();
  const { projectId } = useParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    try {
      const { data } = await api.get(`/api/project/${projectId}/preview`);
      setCode(data.code || data.project?.current_code || '');
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && session?.user) {
      fetchCode();
    } else if (!isPending && !session?.user) {
      setLoading(false);
      toast.error('Please login to view project preview');
    }
  }, [session?.user, isPending]);

  // Fallback: stop loading after 10 seconds if still pending
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error('Preview loading timeout. Please try refreshing the page.');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <Loader2Icon className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Preview Not Available</h2>
          <p className="text-gray-600">No code found for this project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <ProjectPreview
        project={{ current_code: code } as Project}
        isGenerating={false}
        showEditorPanel={false}
      />
    </div>
  );
};

export default Preview;
