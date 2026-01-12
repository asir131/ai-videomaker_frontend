import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScriptProvider } from './context/ScriptContext';
import { MediaProvider } from './context/MediaContext';
import { UIProvider } from './context/UIContext';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <UIProvider>
                    <ScriptProvider>
                        <MediaProvider>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route
                                    path="/app/*"
                                    element={
                                        <ProtectedRoute>
                                            <AppPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </MediaProvider>
                    </ScriptProvider>
                </UIProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
