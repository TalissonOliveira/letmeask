import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Home } from "./pages/Home";
import { NewRoom } from "./pages/NewRoom";
import { Room } from "./pages/Room";
import { AdminRoom } from "./pages/AdminRoom";

import { AuthContextProvider } from './contexts/AuthContext'

import "./styles/global.scss";

function App() {
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <Switch> {/* Não permite chamar mais de uma rota ao mesmo tempo */}
                    <Route path="/" exact component={Home} />
                    <Route path="/rooms/new" component={NewRoom} />
                    <Route path="/rooms/:id" component={Room}/>
                    <Route path="/admin/rooms/:id" component={AdminRoom} />
                </Switch>
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;