import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import { ChatProvider } from './context/ChatContext';
import AppRoutes from './routes';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LearningProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </LearningProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
