import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios';
import { initialiseSocket, sendMessage, recieveMessage } from '../config/socket'
import { useUser } from '../context/UserContext';
import { marked } from 'marked'
import hljs from 'highlight.js'
import Markdown from 'markdown-to-jsx'
import { getWebContainer } from '../config/webContainer';

function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])

    return <code {...props} ref={ref} />
}

const Project = () => {

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [msg, setMsg] = useState('');

    const [fileTree, setFileTree] = useState({});
    //     "app.js": {
    //         "contents": `const express = require('express');

    //     // Create a new Express application
    //     const app = express();

    //     // Define a port for the server to listen on
    //     const port = process.env.PORT || 3000;

    //     // Define a simple route that responds with 'Hello World!'
    //     app.get('/', (req, res) => {
    //         res.send('Hello World!');
    //     });

    //     // Error handling middleware
    //     app.use((err, req, res, next) => {
    //         console.error(err.stack);
    //         res.status(500).send('Something broke!');
    //     }); `
    //     },
    //     "package.json": {
    //         "contents": `{
    //         "name": "express-server",
    //         "version": "1.0.0",
    //         "description": "A basic Express server",
    //         "main": "app.js",
    //         "scripts": {
    //             "start": "node app.js",
    //             "dev": "nodemon app.js",
    //             "test": "echo \"Error: no test specified\" && exit 1"
    //         },
    //         "keywords": [
    //             "express",
    //             "node",
    //             "server"
    //         ],
    //         "author": "",
    //         "license": "ISC",
    //         "dependencies": {
    //             "express": "^4.17.1"
    //         },
    //         "devDependencies": {
    //             "nodemon": "^2.0.12"
    //         }
    //     }`
    //     }
    // })

    const [currentFile, setCurrentFile] = useState('');

    const [openedFiles, setOpenedFiles] = useState([]);
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null);
    const [runProcess, setRunProcess] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

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
    const { user } = useUser();
    const handleSendMessage = (e) => {
        e.preventDefault();
        const data = {
            message: msg,
            sender: user,
        }
        sendMessage('project-message', data)
        appendMessages(false, data);
        setMsg('');

    }

    useEffect(() => {
        initialiseSocket(location.state?._id);

        axios.get(`/project/get-project/${location.state._id}`)
            .then((response) => {
                setProject(response.data.project)
                setFileTree(response.data.project?.fileTree);
            }).catch(error => {
                console.log(error);
            })

        axios.get('/user/all')
            .then((response) => {
                setUsers(response.data.users)
            }).catch(error => {
                console.log(error);
            })

        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }
        recieveMessage('project-message', (data) => {
            try {
                const message = JSON.parse(data.message);
                if (message.fileTree) {
                    webContainer?.mount(message.fileTree);
                    setFileTree(message.fileTree);
                    saveFileTree(message.fileTree);
                }
            } catch (error) {
                console.log(error);
            }
            appendMessages(true, data);
        })

    }, [])

    const appendMessages = (isIncoming, data) => {
        const newMessage = document.createElement('div');
        const classes = isIncoming ? ['self-start', 'bg-white'] : ['self-end', 'bg-blue-500', 'text-white'];
        newMessage.classList.add(...classes, 'rounded', 'text-sm', 'w-fit', 'p-2', 'max-w-60');

        if (isIncoming && data.sender._id === 'ai') {
            const messageObj = JSON.parse(data.message);
            // console.log(messageObj);
            newMessage.innerHTML = `
            <div class="name opacity-50 text-xs">${data.sender.email}</div>
            <div class='relative text-wrap leading-4'>
                <button class='absolute cursor-pointer top-0 right-0 m-2 p-1 bg-gray-200/70 rounded text-xs' onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText)">
                    <i class="ri-file-copy-line"></i>
                </button>
                ${marked(messageObj.text, {
                renderer: new marked.Renderer(),
                highlight: function (code, lang) {
                    const language = lang || 'plaintext';
                    return window.hljs.highlight(language, code).value;
                }
            })}
            </div>`;
            // Ensure the syntax highlighting is applied
            setTimeout(() => {
                document.querySelectorAll('pre code').forEach((block) => {
                    window.hljs.highlightElement(block);
                });
            }, 0);
        } else {
            newMessage.innerHTML = `
            ${isIncoming ? `<div class="name opacity-50 text-xs">${data.sender.email}</div>` : ''}
            <p class='text-wrap leading-4'>${data.message}</p>`;
        }

        document.querySelector('.message-box').appendChild(newMessage);
        scrollToBottom();
    }
    const scrollToBottom = () => {
        const messageBox = document.querySelector('.message-box');
        if (messageBox) {
            messageBox.scrollTo({
                top: messageBox.scrollHeight,
                behavior: 'smooth'
            });
        }
    };


    // const handleCopyClick = (e) => {
    //     navigator.clipboard.writeText(e.target.nextElementSibling.innerText).then(() => {
    //         e.target.innerHTML = 'Copied';
    //         setTimeout(() => {
    //             e.target.innerHTML = '<i class="ri-file-copy-line"></i>';
    //         }, 2000);
    //     });
    // };

    const handleFileClick = (fileName) => {
        setCurrentFile(fileName);
        if (!openedFiles.some(file => file === fileName)) {
            setOpenedFiles([...openedFiles, fileName]);
        }
    };

    const handleCloseFile = (fileName) => {
        const updatedOpenedFiles = openedFiles.filter(file => file !== fileName);
        setOpenedFiles(updatedOpenedFiles);
        if (currentFile === fileName) {
            setCurrentFile(updatedOpenedFiles.length > 0 ? updatedOpenedFiles[0] : '');
        }
    };

    function saveFileTree(ft) {
        axios.put('/project/update-file-tree', {
            projectId: location.state._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div className='h-screen w-full flex'>
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

            <section className='h-screen overflow-y-hidden min-w-60 relative flex flex-col w-[20rem] border-r border-slate-700'>

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
                    <div className="message-box flex-grow overflow-y-auto max-h-[80vh] flex p-1 flex-col gap-2 bg-gray-200">
                        {/* <div className="incoming self-start rounded text-sm bg-white w-fit p-2 max-w-60">
                            <div className="name opacity-50 text-xs">example@example.com</div>
                            <div className='relative text-wrap bg-amber-100 leading-4 overflow-x-auto'>
                                <button className='absolute cursor-pointer top-0 right-0 m-2 p-1 bg-gray-600/70 rounded text-xs' onClick={handleCopyClick}>
                                    <i className="ri-file-copy-line"></i>
                                </button>
                                <button>Lorem ipsum dolor sit amet consectetur.</button>
                            </div>
                        </div> */}
                        {/* <div className="outgoing self-end rounded text-sm bg-blue-500 text-white w-fit p-2 max-w-60">
                            <p className='text-wrap leading-4'>Lorem ipsum dolor sit amet consectetur.</p>
                        </div> */}
                    </div>
                    <footer className='w-full backdrop-blur-3xl py-4 pb-8 px-2 bg-gray-400/80'>
                        <form onSubmit={handleSendMessage} className='w-full h-fit flex items-center'>
                            {/* <i className='ri-add-fill text-3xl text-slate-700'></i> */}
                            <input value={msg} onChange={(e) => setMsg(e.target.value)}
                                className='p-2 px-4 mr-2 border-none rounded-full bg-white outline-none flex-grow' type="text" placeholder='Enter message' />
                            <button
                                className='px-5 py-2 bg-slate-950 rounded-full text-white'>
                                <i className="ri-send-plane-fill"></i>
                            </button>
                        </form>
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

            <section className='flex flex-grow h-screen w-[40rem] bg-[#2E3440] text-gray-100'>
                <div className="file-list w-60 max-w-72 h-full border-t border-r border-white/30">
                    <div className="top flex gap-1 justify-between items-center py-2 px-2 pr-4">
                        <h1 className='text-sm'>Folder / File list</h1>
                        <div className="flex items-center gap-2 text-lg cursor-pointer">
                            <i className='ri-file-search-line'></i>
                            <i className="ri-file-add-line"></i>
                            <i className="ri-folder-add-line"></i>
                        </div>
                    </div>
                    <ul className='flex flex-col'>
                        {fileTree && (
                            Object.keys(fileTree).map((fileName, index) => (
                                <li onClick={() => handleFileClick(fileName)} key={index}
                                    className='w-full px-2 py-2 flex items-center gap-1 cursor-pointer hover:bg-gray-500/70'>
                                    <i className="ri-file-line text-sm"></i>
                                    {fileName}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                <div className="file-editor flex-grow h-full">
                    <div className="top flex justify-between items-center w-full bg-slate-800/80 min-h-12">
                        <div className="file-slider flex items-center pr-4 max-w-[40rem] cursor-pointer  overflow-x-scroll">
                            {openedFiles.length > 0 && openedFiles.map((file, index) => (
                                <div key={index} className={`flex  items-center  hover:bg-neutral-700/50 bg-[#1F1F1F]/90 ${currentFile === file ? 'bg-neutral-700/50 border-t border-blue-500' : 'border-white/20 border'}`}>
                                    <div onClick={() => handleFileClick(file)}
                                        className={`opened-file flex items-center gap-2 py-2 px-2 pl-4`}>
                                        <h1 className='text-base'>
                                            {file}
                                        </h1>
                                    </div>
                                    <i onClick={() => handleCloseFile(file)}
                                        className="ri-close-line text-lg pr-2 h-full"></i>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={async () => {
                                await webContainer?.mount(fileTree);

                                if (!isInstalled) {
                                    const installProcess = await webContainer?.spawn("npm", ["install"]);
                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk);
                                        }
                                    }))
                                    setIsInstalled(true);
                                }
                                if (runProcess) {
                                    runProcess.kill()
                                }

                                const tempRunProcess = await webContainer?.spawn("npm", ["start"]);
                                tempRunProcess.output.pipeTo(new WritableStream({
                                    write(chunk) {
                                        console.log(chunk);
                                    }
                                }));
                                setRunProcess(tempRunProcess)
                                webContainer.on('server-ready', (port, url) => {
                                    setIframeUrl(url);
                                })

                            }}
                            className='px-6 py-2 bg-gray-500/70 hover:bg-gray-500 mr-3'>
                            Run
                        </button>

                    </div>
                    {fileTree && fileTree[currentFile] && (
                        <div className="code-editor-area h-[93vh] overflow-auto flex-grow bg-slate-50">
                            <pre
                                className="hljs h-full">
                                <code
                                    className="hljs h-full outline-none"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                        const updatedContent = e.target.innerText;
                                        // setFileTree(prevFileTree => ({
                                        //     ...prevFileTree,
                                        //     [currentFile]: {
                                        //         ...prevFileTree[currentFile],
                                        //         file: {
                                        //             ...prevFileTree[currentFile].file,
                                        //             contents: updatedContent
                                        //         }
                                        //     }
                                        // }));
                                        const ft = {
                                            ...fileTree,
                                            [currentFile]: {
                                                file: {
                                                    contents: updatedContent
                                                }
                                            }
                                        }
                                        setFileTree(ft);
                                        saveFileTree(ft);
                                    }}
                                    dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        paddingBottom: '25rem',
                                        counterSet: 'line-numbering',
                                    }}
                                />
                            </pre>
                        </div>
                    )}
                </div>

                {iframeUrl && webContainer && (
                    <div className='max-w-[30rem] flex flex-col min-w-[28rem] bg-gray-100'>
                        <div className="address-bar w-full py-2 bg-slate-400">
                            <input type="text" value={iframeUrl}
                                onChange={(e) => setIframeUrl(e.target.value)}
                                className='px-4 p-1 w-full outline-none'
                            />
                        </div>
                        <iframe src={iframeUrl} frameBorder="0" className='h-full'></iframe>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Project
