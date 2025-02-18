import React, { useEffect, useState } from 'react'
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
const Home = () => {

    const [projectName, setProjectName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);


    const navigate = useNavigate();
    const createProject = (e) => {
        e.preventDefault();
        axios.post('/project/create', {
            name: projectName
        }).then((response) => {
            navigate("/home");
        }).catch((error) => {
            console.log(error)
        })
    }
    useEffect(() => {
        axios.get('/project/all')
            .then((response) => {
                setProjects(response.data.projects);
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])

    return (
        <main className='p-4'>
            <div className="projects flex items-center gap-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="project p-4 border border-slate-300 rounded-md">
                    New Project
                    <i className="ri-link ml-2"></i>
                </button>
                {projects?.map((project) => (
                    <div onClick={()=>navigate('/project',{
                        state: project
                    })}
                    className='px-6 border inline-block' key={project.name} >
                        <h1 className='font-semibold text-lg'>{project.name}</h1>
                        <p><small>Collaboratos:</small> {project.users.length}</p>
                    </div>
                ))}
            </div>
            {
                isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                        <div className="bg-white p-6 rounded-md shadow-md w-1/3">
                            <h2 className="text-xl mb-4">Create New Project</h2>
                            <form onSubmit={createProject}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                                    <input
                                        onChange={(e) => setProjectName(e.target.value)}
                                        value={projectName}
                                        type="text" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" className="mr-2 px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </main >
    )
}

export default Home
