import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios';

const Project = () => {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleAddCollaborators = () => {
        if (selectedUsers.length > 0) {
            axios.put(`project/add-user`, {
                projectId: location.state._id,
                users: selectedUsers
            })
                .then((response) => {
                    setIsModalOpen(false);
                }).catch(error => {
                    console.log(error);
                })
        }
    }
    const handleUserSelect = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    }

    useEffect(() => {
        axios.get(`/project/get-project/${location.state._id}`)
            .then((response) => {
                setProject(response.data.project)
            }).catch(error => {
                console.log(error);
            })

        axios.get('/user/all')
            .then((response) => {
                setUsers(response.data.users)
            }).catch(error => {
                console.log(error);
            })
    }, [])

    return (
        <div className='h-screen w-full'>
            {isModalOpen && (
                <div className="fixed z-10 inset-0 bg-black/20 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-lg w-1/3 flex flex-col">
                        <header className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Collaborators</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-xl">
                                <i className='ri-close-fill text-2xl'></i>
                            </button>
                        </header>
                        <div className={`flex flex-col gap-2 mb-4`}>
                            {users.map(user => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-2 p-2 rounded hover:bg-slate-200 cursor-pointer ${selectedUsers.includes(user._id) && 'bg-slate-200'}`}
                                    onClick={() => handleUserSelect(user._id)}>
                                    <input
                                        name='user'
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => handleUserSelect(user._id)}
                                    />
                                    <span>{user.email}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddCollaborators} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}

            <section className='h-screen min-w-60 relative flex flex-col w-[20rem] border-r border-slate-700'>

                <header className='flex justify-between w-full px-4 py-2'>
                    <div onClick={() => setIsModalOpen(true)}
                        className='flex items-center cursor-pointer gap-2'>
                        <i className='ri-add-fill text-xl'></i>
                        <small className='font-semibold'>Add Collaborator</small>
                    </div>
                    <div onClick={() => setIsSidePanelOpen(true)}
                        className="circle cursor-pointer flex items-center justify-center bg-slate-200 rounded-full w-10 aspect-square">
                        <i className="ri-group-fill"></i>
                    </div>
                </header>
                <div className='conversation-box flex flex-col flex-grow'>
                    <div className="message-box flex-grow flex p-1 flex-col gap-1 bg-gray-200">
                        <div className="incoming self-start rounded text-sm bg-white w-fit p-2 max-w-60">
                            <div className="name opacity-50 text-xs">example@example.com</div>
                            <p className='text-wrap leading-4'>Lorem ipsum dolor sit amet consectetur.</p>
                        </div>
                        <div className="outgoing self-end rounded text-sm bg-white w-fit p-2 max-w-60">
                            {/* <div className="name opacity-50 text-xs">example@example.com</div> */}
                            <p className='text-wrap leading-4'>Lorem ipsum dolor sit amet consectetur.</p>
                        </div>
                    </div>
                    <footer className='w-full backdrop-blur-3xl py-4 pb-8 px-2 bg-gray-400/80'>
                        <div className='w-full h-fit flex items-center'>
                            {/* <i className='ri-add-fill text-3xl text-slate-700'></i> */}
                            <input className='p-2 px-4 mr-2 border-none rounded-full bg-white outline-none f</div>lex-grow' type="text" placeholder='Enter message' />
                            <button className='px-5 py-2 bg-slate-950 rounded-full text-white'>
                                <i className="ri-send-plane-fill"></i>
                            </button>
                        </div>
                    </footer>
                </div>
                <div className={`sidePanel absolute transition-all duration-300 -translate-x-full flex flex-col bg-white h-full w-full rounded ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <header className='flex justify-end w-full px-4 py-2 bg-gray-400/60'>
                        <div onClick={() => setIsSidePanelOpen(false)}
                            className="circle cursor-pointer flex items-center justify-center bg-slate-200 rounded-full w-10 aspect-square">
                            <i className="ri-close-fill text-xl"></i>
                        </div>
                    </header>
                    <div className='flex-grow flex flex-col gap-2 p-2'>
                        {project?.users?.map(user => (
                            <div key={user._id} className="user w-full flex gap-2 px-2 rounded-xl py-1.5 items-center p-1 bg-gray-100">
                                <div className="circle cursor-pointer flex items-center justify-center bg-slate-200 rounded-full w-10 aspect-square">
                                    <i className="ri-user-fill"></i>
                                </div>
                                <h1>{user.email}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Project
