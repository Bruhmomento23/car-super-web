import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppTheme from './theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import MainContent from './components/MainContent';
import Latest from './components/Latest';
import Footer from './components/Footer';
import SignIn from './features/authentication/SignIn'; // Ensure this path is correct
import SignUp from './features/authentication/Signup';
import Services from './features/home/Services';
import Bookings from './features/home/Users_Bookings';
import { Routes, Route } from 'react-router-dom'; // <--- Add this import
import AboutUs from './features/home/aboutus';

//  App.tsx (The Boss / The Layout)
// This is the "Brain" of your specific application. It decides what shows up on the screen and where it goes.
// 	• What it does: It organizes your components (Navbar, Footer, Content).
// 	• The "Router" Logic: In your case, App.tsx now acts as a traffic controller.
// 		○ It says: "If the user is at /, show them the Landing Page."
// 		○ It says: "If the user clicked 'Sign In' and the URL is now /SignIn, hide the Landing Page and show the Sign In form."
// 	Analogy: App.tsx is the Floor Plan. It decides that the Kitchen stays in one place, but the person (the content) moves from the Living Room to the Bedroom.



export default function App(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      
      <Routes>
        {/* Main Landing Page Route - Navbar and Footer live here now */}
        <Route path="/" element={
          <>
            <AppAppBar /> 
            <Container
              maxWidth="lg"   
              component="main"
              sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
            >
              <MainContent />
              <Latest />
            </Container>
            <Footer />
          </>
        } />
  
        <Route path="/Services" element={
          <>
          
            <AppAppBar /> 
            <Services></Services>
            <Footer />
          </>
        } />

          
        <Route path="/Bookings" element={
          <>
          
            <AppAppBar /> 
            <Bookings></Bookings>
            <Footer />
          </>
        } />

        <Route path="/Contact" element={
          <>
          
            <AppAppBar /> 
            <AboutUs></AboutUs>
            <Footer />
          </>
        } />

        {/* Sign In Page Route - No Navbar, No Footer */}
        <Route path="/SignIn" element={<SignIn />} />
        
        {/* Sign Up Page Route - No Navbar, No Footer */}
        <Route path="/SignUp" element={<SignUp />} />
      </Routes>

    </AppTheme>
  );
}