import React, { useState } from 'react'
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import api from '@/configs/axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
const {data:session}=authClient.useSession()
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = useState(false);
const navigate=useNavigate()
  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(!session?.user){
        return toast.error('please sign in to create a project')
      }
      else if(!input.trim()){
        return toast.error('please enter a message')
      }
    setLoading(true);
const {data}=await api.post('/api/user/project',{initial_prompt:input});
setLoading(false);
navigate(`/projects/${data.projectId}`)
    } catch (error:any) {
      setLoading(false);
    toast.error(error?.response.data?.message|| error.message);
    console.log(error);
    }
  
  };

  return (
    <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">

      {/* Top Promo Badge */}
      <a href="#" className="flex items-center gap-2 border border-slate-700 rounded-full p-1 pr-4 text-sm mt-20 backdrop-blur-md">
        <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">NEW</span>
        <span>30-Day Free Trial • No Credit Card Required</span>
      </a>

      {/* Hero Title */}
      <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-6 font-bold max-w-4xl">
        Build Full-Stack Websites From a Single Prompt — Instantly.
      </h1>

      {/* Hero Subtitle */}
      <p className="text-center text-lg max-w-xl mt-4 text-gray-300">
        Describe your idea, let AI generate your site, database, and backend logic — then deploy with PERN & NeonDB in seconds.
      </p>

      {/* Input Form */}
      <form
        onSubmit={onSubmitHandler}
        className="bg-white/10 max-w-3xl w-full rounded-2xl p-5 mt-12 border border-indigo-600/70 focus-within:ring-2 ring-indigo-500 transition-all shadow-lg"
      >
        <textarea
          onChange={e => setInput(e.target.value)}
          className="bg-transparent outline-none text-gray-200 resize-none w-full placeholder:text-gray-400"
          rows={4}
          placeholder="Describe your website idea (pages, style, features, AI tools, authentication, database, API needs, etc.)"
          required
        />

        {/* Submit Button */}
        <button className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-lg px-5 py-2.5 mt-3 font-medium text-sm hover:opacity-90 transition">
          {!loading ? (
            'Generate Website with AI'
          ) : (
            <>
              Building <Loader2 className="animate-spin w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Trusted Companies */}
      <div className="text-center mt-20 mb-6 text-gray-400 uppercase text-xs tracking-widest font-semibold">
        Trusted by innovators & developers worldwide
      </div>

      <div className="flex flex-wrap items-center justify-center gap-16 md:gap-20 mx-auto mt-6 opacity-80">
        <img className="max-w-28 md:max-w-32 hover:opacity-100 transition" src="" alt="Framer" />
        <img className="max-w-28 md:max-w-32 hover:opacity-100 transition" src="" alt="Huawei" />
        <img className="max-w-28 md:max-w-32 hover:opacity-100 transition" src="" alt="Instagram" />
        <img className="max-w-28 md:max-w-32 hover:opacity-100 transition" src="" alt="Microsoft" />
        <img className="max-w-28 md:max-w-32 hover:opacity-100 transition" src="" alt="Wallmart" />
      </div>

    </section>
  );
};

export default Home;
