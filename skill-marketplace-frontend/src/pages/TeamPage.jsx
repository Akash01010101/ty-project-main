import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { getUserFromToken } from '../utils/auth';

const TeamPage = () => {
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { id } = useParams();
  const socketRef = useRef();
  const user = getUserFromToken();

  useEffect(() => {
    const fetchTeamAndMessages = async () => {
      try {
        // Fetch team details
        const teamResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teams/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        const teamData = await teamResponse.json();
        if (teamResponse.ok) {
          setTeam(teamData);
        } else {
          console.error('Failed to fetch team', teamData);
        }

        // Fetch chat history
        const messagesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teams/${id}/messages`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        const messagesData = await messagesResponse.json();
        if (messagesResponse.ok) {
          setMessages(messagesData);
        } else {
          console.error('Failed to fetch messages', messagesData);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchTeamAndMessages();
  }, [id]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL);

    socketRef.current.emit('joinTeam', id);

    socketRef.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      socketRef.current.emit('sendMessage', {
        teamId: id,
        userId: user.id,
        text: newMessage,
      });
      setNewMessage('');
    }
  };

  if (!team) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <h2 className="text-3xl font-bold text-center text-white mb-8">{team.name}</h2>
      <div className="flex-grow bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex ${msg.user._id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-3 rounded-lg ${msg.user._id === user.id ? 'bg-purple-600' : 'bg-gray-700'}`}>
                <p className="text-white">
                  <span className="font-bold">{msg.user.name}: </span>
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white"
            placeholder="Type a message..."
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="ml-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full"
          >
            Send
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default TeamPage;
