import React, { useEffect, useState } from 'react';
import type { Project } from '../types';
import { Loader2, Plus, Calendar, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
const MyProjects = () => {
  const {data:session,isPending}=authClient.useSession()
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
   try {
    const {data}=await api.get('/api/user/projects');
    setProjects(data.projects)
    setLoading(false)
   } catch (error:any) {
    console.log(error);
    toast.error(error?.response?.data?.message || error.message);
   }
  };

  const deleteProject = async (id: string) => {
    try {
      const confirm=window.confirm('Are You Sure you want to Delete this Project?');
      if(!confirm) return;
      const {data}= await api.delete(`/api/project/${id}`);
      toast.success(data.message);
      fetchProjects();
    } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if(session?.user && !isPending){
      fetchProjects();
    }else if(!isPending && !session?.user){
      setLoading(false);
      navigate('/');
      toast('Please Login to view Your Projects')
    }
  }, [session?.user, isPending]);

  // Fallback: stop loading after 10 seconds if still pending
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error('Authentication timeout. Please try refreshing the page.');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">

      {/* Main Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
              <div>
                <h1 className="text-5xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  Your AI Creations
                </h1>
                <p className="text-gray-400 mt-2 text-sm">
                  You currently own <span className="text-indigo-400 font-semibold">{projects.length}</span> AI-generated project{projects.length !== 1 && 's'}.
                </p>
                <p className="text-gray-500 mt-1 text-xs max-w-md">
                  Manage, preview, edit, or deploy your full-stack websites built using AI, powered by PERN + NeonDB.
                </p>
              </div>

              {/* Create New Button */}
              <button
                onClick={() => navigate('/')}
                className="mt-5 sm:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
                           text-white px-7 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg
                           hover:shadow-indigo-500/30 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Generate New Site
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group relative cursor-pointer rounded-2xl bg-[#0f172a]
                             border border-slate-800 hover:border-indigo-500/50
                             transition-all duration-300 hover:-translate-y3
                             hover:shadow-[0_25px_60px_rgba(99,102,241,0.3)] overflow-hidden"
                >

                  {/* Delete Project Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-black/40 hover:bg-red-600 transition-all"
                  >
                    ✕
                  </button>

                  {/* Project Preview Section */}
                  <div className="relative aspect-[16/10] bg-black rounded-t-2xl overflow-hidden">

                    {/* Browser Mockup Bar */}
                    <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2
                                    px-3 py-2 bg-[#020617]/70 backdrop-blur-lg
                                    rounded-lg border border-white/5">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <div className="ml-2 flex-1 truncate rounded bg-white/5 px-3 py-1 text-[10px] text-gray-400">
                        {project.name}
                      </div>
                    </div>

                    {/* Render Code Preview */}
                    {project.current_code ? (
                      <iframe
                        srcDoc={project.current_code}
                        sandbox="allow-scripts"
                        title={project.name}
                        className="w-[500%] h-[500%] scale-[0.2] origin-top-left pointer-events-none bg-white"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-600">
                        <Code className="w-10 h-10" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white">
                        Open Builder →
                      </span>
                    </div>

                  </div>

                  {/* Project Info */}
                  <div className="p-5">
                    <h2 className="text-white font-bold truncate text-lg">
                      {project.name}
                    </h2>

                    <p className="text-gray-400 text-[11px] line-clamp-2 mt-2 leading-relaxed">
                      {project.initial_prompt || 'AI generated website project with no prompt description.'}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-4">
                      <Calendar className="w-3 h-3 text-indigo-400/70" />
                      {new Date(project.createdAt).toDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/preview/${project.id}`);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-700
                                   hover:border-indigo-500 hover:text-indigo-400
                                   text-gray-300 text-xs rounded-lg transition-all"
                      >
                        Live Preview
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}`);
                        }}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                                   text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="text-center text-gray-500 mt-24 text-sm">
                <p className="text-xl font-semibold text-gray-400">No AI projects built yet.</p>
                <p className="text-xs mt-2">Start by generating your first website using AI Builder.</p>
                <button onClick={() => navigate('/')} className="mt-6 text-indigo-400 hover:underline text-xs">Generate Now →</button>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyProjects;
