import React, { useContext, useEffect, useState, useRef } from 'react';
import supabase from '../services/supabase';
import Wrapper from './Wrapper';
import { SessionContext } from '../contexts';
import formatTime from '../helper/formatTime';
import getUserColor from '../helper/userColor';

const Chat = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usersOnline, setusersOnline] = useState([]);
  const { session } = useContext(SessionContext);

  const chatContainerRef = useRef(null);
   
  useEffect(() => {
    if(!session?.user) {
      setusersOnline([]);
      return;
    }
    const roomOne = supabase.channel("room_one", {
      config: {
        presence: {
          key: session?.user?.id,
        }
      }
    });

    roomOne.on('broadcast', {event: "message"}, (payload) => {
      setMessages((prev) => [...prev, { ...payload.payload, isMine: payload.payload.email === session?.user?.email }]);
    });

    // Track User Presence subscribe!

    roomOne.subscribe(async (status) => {
      if(status === "SUBSCRIBED") {
        await roomOne.track({
          id: session?.user?.id,
        })
      }
    });

    // Handel User Presence

    roomOne.on("presence", {event: "sync"}, () => {
      const state = roomOne.presenceState();
      setusersOnline(Object.keys(state));
    })

    return () => roomOne.unsubscribe();

    
  }, [session]);

  // Send Message

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      supabase.channel("room_one").send({
        type: 'broadcast',
        event: 'message',
        payload: {
          id: Date.now(), 
          user: session?.user?.user_metadata?.username || `AnonymousUser-${session?.user?.id.slice(0, 4)}`,
          sender_id: session?.user?.id,
          email: session?.user?.email,
          content: message,
          timestamp: new Date().toISOString(),
          isMine: true,
        }
      });
      
      const { error } = supabase.from("messages").insert(message);
      if( error){
        console.log(error)
      };

    } catch(error) {
      console.log(error)
    } finally { 
      setMessage("");
    }
  }

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log("Sign Out Error: ", error);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setTimeout(() => {
      if(chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [100])
  }, [messages])

  return (
    <Wrapper prevent="guest">
      <div className="flex h-screen justify-center items-center bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 sm:p-4">
        <div className="w-full max-w-6xl bg-white/10 backdrop-blur-md rounded-none h-screen sm:h-auto sm:rounded-xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Signed in as {session?.user?.user_metadata?.username || `AnonymousUser-${session?.user?.id.slice(0, 4)}`}</p>
                <p className="text-gray-400 text-sm">
                  <span className={`inline-block w-2 h-2 ${usersOnline.length >= 1 ? "bg-green-500" : "bg-gray-500"} rounded-full mr-2`}></span>
                  {usersOnline && usersOnline.length === 1 ? "One user online" : usersOnline.length > 1 ? `${usersOnline.length} users online` : "Offline"}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              disabled={loading}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing out...
                </div>
              ) : "Sign out"}
            </button>
          </div>

          {/* Main Chat Area */}
          <div ref={chatContainerRef} className="chat-area flex-1 overflow-y-auto p-4 space-y-4" style={{  height: "calc(100vh - 295px)", maxHeight: "calc(100vh - 295px)", minHeight: "calc(100vh - 295px)" }}>
          <style>
            {`
              @media (max-width: 640px) {
                .chat-area { min-height: calc(100vh - 160px) !important; }
              }
            `}
          </style>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 shadow-md ${msg.isMine
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-white rounded-bl-none'
                  }`}>
                  {!msg.isMine && (
                    <div className="font-medium text-blue-300 text-sm mb-1" style={{color: getUserColor(msg.user)}}>{msg.user}</div>
                  )}
                  <p>{msg.content}</p>
                  <div className={`text-xs mt-1 ${msg.isMine ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-gray-700/50 p-4 flex items-center space-x-4"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full pl-4 pr-10 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center">
                <span>Send</span>
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </button>
          </form>
        </div>
      </div>
    </Wrapper>
  );
};

export default Chat;