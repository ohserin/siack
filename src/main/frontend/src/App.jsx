import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Home />
            <Footer />
        </div>
    );
}
export default App;