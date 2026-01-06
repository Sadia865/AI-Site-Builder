import React, { useEffect, useState } from 'react';
import type { Project } from '../types';
import { Loader2, Calendar, Code, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';

const Community = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
   try {
    const {data}=await api.get('/api/project/published');
    setProjects(data.projects);
    setLoading(false);
   } catch (error:any) {
    console.log(error);
    toast.error(error?.response?.data?.message || error.message);
   }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">

      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-14">

            {/* Header */}
            <div className="mb-12 flex items-center gap-3">
              <Users className="w-9 h-9 text-purple-400/80" />
              <div>
                <h1 className="text-5xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Community Creations
                </h1>
                <p className="text-gray-400 mt-2 max-w-3xl text-sm leading-relaxed">
                  Discover AI-generated websites built by developers and creators around the world.
                  Each project is generated using intelligent PERN architecture and scalable database design.
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {projects.map(project => (
<div
  key={project.id}
  onClick={() => window.open(`/view/${project.id}`, '_blank')}
  className="group cursor-pointer rounded-2xl bg-[#0f172a] border border-slate-800
             hover:border-indigo-500/40 transition-all duration-300
             hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(99,102,241,0.28)]
             overflow-hidden"
>

                  {/* Preview */}
                  <div className="relative aspect-[16/10] bg-black rounded-t-2xl overflow-hidden">

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

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60
                                    opacity-0 group-hover:opacity-100 transition-all">
                      <span className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white">
                        View Project →
                      </span>
                    </div>

                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h2 className="text-white font-bold truncate text-lg">{project.name}</h2>

                    <p className="text-gray-400 text-[11px] line-clamp-2 mt-2 leading-relaxed">
                      {project.initial_prompt || 'AI generated website project by community creator.'}
                    </p>

                    <div className="flex items-center justify-between mt-5">
                      {/* Creator badge */}
                      <span className="text-[10px] text-indigo-300 border border-indigo-400/20
                                       px-3 py-1 rounded-full bg-indigo-600/5 flex items-center gap-1.5">
                        <Users className="w-3 h-3 opacity-70" /> Sadia
                      </span>

                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3 text-indigo-400/50" />
                        {new Date(project.createdAt).toDateString()}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="text-center mt-28 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-2xl font-bold text-gray-400">No community projects shared yet.</p>
                <p className="text-xs mt-2 max-w-md mx-auto">
                  Be the first to publish an AI-generated website to the community showcase.
                  Generate a project and share your creation with the world.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 text-indigo-400 font-semibold text-xs hover:underline"
                >
                  Generate & Share Now →
                </button>
              </div>
            )}

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Community;
