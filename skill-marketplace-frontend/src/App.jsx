import Router from './router/Router';
import { ThemeProvider } from './utils/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative min-h-screen">
          <div className="aurora-background"></div>
          <div className="relative z-10">
            <Router />
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;