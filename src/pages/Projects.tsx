import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, Monitor, Tablet, Smartphone, Loader2 } from 'lucide-react';
import type { Project } from '../types';
import Sidebar from '../components/Sidebar';
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview';
import LoaderSteps from '../components/LoaderSteps';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const Projects = () => {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [, setIsSaving] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isPreview, setIsPreview] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop');

  const previewRef = useRef<ProjectPreviewRef>(null);

  if (!projectId) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-white">Invalid project ID</p>
      </div>
    );
  }

  // Fetch project
  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${projectId}`);
      setProject(data.project);
      setIsPublished(data.project?.isPublished || false);

      if (data.project?.current_code) setIsGenerating(false);
      else setIsGenerating(true);

      setLoading(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to fetch project');
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // Authentication check
  useEffect(() => {
    if (session?.user) fetchProject();
    else if (!isPending && !session?.user) {
      navigate('/');
      toast.error('Please login to view your project');
    }
  }, [session?.user, isPending]);

  // Polling if code not ready
  useEffect(() => {
    if (project && !project.current_code && isGenerating) {
      const intervalId = setInterval(fetchProject, 5000);
      return () => clearInterval(intervalId);
    }
  }, [project, isGenerating]);

  // Generate website
  const generateWebsite = async (prompt: string) => {
    if (!project || !prompt.trim()) return;
    setIsGenerating(true);

    try {
      const { data } = await api.post(`/api/project/${projectId}/generate`, { prompt });
      setProject(prev => prev ? { ...prev, current_code: data.code || prev.current_code } : prev);
      toast.success('Website generated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate website');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save project
  const saveProject = async () => {
    if (!previewRef.current) return;
   const code=previewRef.current.getCode();
   if(!code) return;
   setIsSaving(true);
   try {
    const {data}=await api.put(`/api/project/${projectId}`,{current_code: code});
    toast.success(data.message)
   } catch (error:any) {
    toast.error(error?.response?.data?.message || error.message);
    console.log(error);
   }
   finally{
    setIsSaving(false);
   }
  };

  // Download HTML
  const downloadHTML = () => {
    const code = previewRef.current?.getCode();
    if (!code) return toast.error('No code to download');

    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'website'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML downloaded successfully!');
  };

  // Publish/Unpublish
  const togglePublish = async () => {
    if (!project) return;
    try {
      await api.get(`/api/user/publish-toggle/${projectId}`);
      setIsPublished(prev => !prev);
      toast.success(isPublished ? 'Project unpublished' : 'Project published');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle publish');
    }
  };

  // Loading state
  if (loading || isPending) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <div className="ml-4 text-white">
          <p>Loading project...</p>
          {projectId && <p className="text-sm text-gray-400">ID: {projectId}</p>}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-gray-400">The requested project could not be loaded.</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      {!isPreview && (
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={setProject}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          onInitialGenerate={generateWebsite}
        />
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${!isPreview && isMenuOpen ? 'ml-[360px]' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#020617]/95 border-b border-slate-800">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              {!isPreview && (
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hover:bg-slate-800 p-1 rounded transition-colors">
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <div>
                <span className="text-sm text-gray-400">{project.name}</span>
                <div className="text-xs text-gray-600">
                  {project.current_code ? `Code: ${project.current_code.length} chars` : isGenerating ? '🔄 Generating code...' : 'No code yet'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 text-sm">
              <button onClick={saveProject} disabled={!project.current_code} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Save
              </button>

              <button onClick={() => setIsPreview(!isPreview)} className={`px-3 py-1.5 rounded transition-colors ${isPreview ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-slate-800 hover:bg-slate-700'}`}>
                {isPreview ? 'Edit' : 'Preview'}
              </button>

              <button onClick={() => {
                if (!project.current_code) return toast.error('No code to preview');
                const newTab = window.open();
                if (newTab) {
                  newTab.document.write(project.current_code);
                  newTab.document.close();
                }
              }} disabled={!project.current_code} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Open in New Tab
              </button>

              <button onClick={downloadHTML} disabled={!project.current_code} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Download
              </button>

              <button onClick={togglePublish} disabled={!project.current_code} className={`px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isPublished ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                {isPublished ? 'Unpublish' : 'Publish'}
              </button>

              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setDevice('desktop')} className={`p-2 rounded transition-colors ${device === 'desktop' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`} title="Desktop view">
                  <Monitor className="w-5 h-5" />
                </button>
                <button onClick={() => setDevice('tablet')} className={`p-2 rounded transition-colors ${device === 'tablet' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`} title="Tablet view">
                  <Tablet className="w-5 h-5" />
                </button>
                <button onClick={() => setDevice('phone')} className={`p-2 rounded transition-colors ${device === 'phone' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`} title="Mobile view">
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-[#020617] p-4">
          {isGenerating && !project.current_code ? (
            <LoaderSteps projectId={projectId} onComplete={fetchProject} />
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 transition-all duration-300" style={{
              width: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px',
              height: device === 'desktop' ? '100%' : device === 'tablet' ? '1024px' : '667px',
              maxWidth: '100%',
            }}>
              <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device} showEditorPanel={!isPreview} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
