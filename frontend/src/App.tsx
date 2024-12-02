import { Route, Routes } from "react-router-dom";
import GlobalContextProvider from "./contexts/store";
import Layout from "./layout/Layout";
import MainLayout from "./MainLayout";
import { Suspense, lazy } from "react";
import LoadingPage from "./components/LoadingPage";
import AuthContextProvider from "./contexts/authProvider";
import GameLayout from "./pages/PingPong/GameLayout";
import NotificationsProvider from "./contexts/notificationsProvider";
import AuthRedirect from "./guards/AuthRedirect";
import AuthGuard from "./guards/AuthGuard";

const Home = lazy(() => import('./pages/Home/Index'));
const Chat = lazy(() => import('./pages/Chat/Index'));
const Login = lazy(() => import('./pages/Login/Index'));
const SignUp = lazy(() => import('./pages/Sign-up/Index'));
const ForgetPassword = lazy(() => import('./pages/ForgetPassword/Index'));
const Profile = lazy(() => import('./pages/Profile/Index'));
const Settings = lazy(() => import('./pages/Settings/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard/Index'));
const PingPong = lazy(() => import('./pages/PingPong/Index'));
const Tournament = lazy(() => import('./pages/Tournament/Index'));
const Play = lazy(() => import('./pages/PingPong/Play/Index'));
const LocalGame = lazy(() => import('./pages/PingPong/LocalGame/Index'));
const LocalMatchMaking = lazy(() => import('./pages/PingPong/LocalGame/MatchMaking'));
const VsFriend = lazy(() => import('./pages/PingPong/VsFriend/Index'));
const MatchMaking = lazy(() => import('./pages/PingPong/MatchMaking/Index'));
const NotFound = lazy(() => import('./pages/NotFound/Index'));

function App() {
  return (
		<NotificationsProvider>
      <AuthContextProvider>
            <GlobalContextProvider>
                <Suspense fallback={<LoadingPage />}>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Home />} />
                      <Route element={<AuthRedirect />}>
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forget-password" element={<ForgetPassword />} />
                      </Route>
                      <Route element={<AuthGuard />}>
                        <Route element={<Layout />}>
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path='/users'>
                            <Route path=':id' element={<Profile />} />
                            <Route path='*' element={<>Not Found</>} />
                          </Route>
                          <Route path='/ping-pong'>
                            <Route index element={<PingPong />} />
                            <Route element={<GameLayout />}>
                              <Route path='play' element={<Play isTournament={false} />} />
                              <Route path='match-making' element={<MatchMaking isTournament={false} />} />
                            </Route>
                            <Route path='vs-friend' element={<VsFriend />} />
                            <Route path='vs-ai'>
                              <Route index element={<LocalMatchMaking isAI={true} />} />
                              <Route path='play' element={<LocalGame isAI={true} />} />
                            </Route>
                            <Route path='1vs1'>
                              <Route index element={<LocalMatchMaking isAI={false} />} />
                              <Route path='play' element={<LocalGame isAI={false} />} />
                            </Route>
                            <Route path='*' element={<NotFound />} />
                          </Route>
                          <Route path='/tournament' >
                            <Route index element={<Tournament />} />
                              <Route path='play' element={<Play isTournament={true} />} />
                              <Route path='match-making' element={<MatchMaking isTournament={true} />} />
                            <Route path='*' element={<NotFound />} />
                          </Route>
                        </Route>
                      </Route>
                      <Route path='*' element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
          </GlobalContextProvider>
        </AuthContextProvider>
    </NotificationsProvider>
  )
}

export default App;